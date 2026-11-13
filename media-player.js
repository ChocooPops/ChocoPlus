// Internal video player — main process side.
//
// Lets the Angular app play any video the server or a download holds (MKV, HEVC, AC3/EAC3/DTS audio,
// embedded subtitles...) in its own <video>, without the external ChocoPlayer:
//   - ffprobe lists the streams (video, audio tracks, subtitle tracks) of the source;
//   - ffmpeg remuxes the source on the fly into fragmented MP4, served through the chocostream:// protocol
//     to the renderer's MediaSource. The video is copied as is when Chromium can decode it (HEVC included,
//     hardware decoding), only the audio is converted to AAC when Chromium can't play it;
//   - the text subtitle tracks are extracted to WebVTT by the same ffmpeg process (one extra pipe per track)
//     and sent to the renderer as cues.
// Timestamps are kept absolute (-copyts + frag_discont): after a seek, the stream starts at the keyframe
// before the requested time but its timeline is the movie's one, so the renderer can seek precisely and
// the subtitle cues need no offset.

const { app, protocol, ipcMain } = require('electron');
const { spawn } = require('child_process');
const { Readable } = require('stream');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs');

const SCHEME = 'chocostream';
const STREAM_HOST = 'media';
const PROBE_TIMEOUT_MS = 30000;
const STDERR_TAIL_LENGTH = 4000;
const MAX_TEXT_SUBTITLES = 40;

// Subtitle codecs ffmpeg can convert to WebVTT.
const TEXT_SUBTITLE_CODECS = new Set(['subrip', 'srt', 'ass', 'ssa', 'webvtt', 'mov_text', 'text']);
// Blu-ray image subtitles: copied as is (SUP) and drawn by the renderer. VobSub and DVB are not supported.
const PGS_CODEC = 'hdmv_pgs_subtitle';
const SUP_HEADER_LENGTH = 13;
const PGS_END_SEGMENT = 0x80;

// Network options for an http(s) source. ChocoServ answers each Range request with at most 10 MB:
// without -reconnect, ffmpeg takes the end of that partial response for an error and stops.
const HTTP_INPUT_OPTIONS = [
  '-reconnect', '1',
  '-reconnect_on_network_error', '1',
  '-reconnect_delay_max', '10',
  '-rw_timeout', '30000000'
];

const VIDEO_MODES = Object.freeze({ COPY: 'copy', H264: 'h264' });

// ffmpeg log lines meaning the source stopped being readable before its end.
// ("Stream ends prematurely" is not one: ffmpeg logs it at the end of each 10 MB response of ChocoServ, then reconnects)
const INPUT_FAILURE_PATTERN = /Error during demuxing|I\/O error|Connection (refused|reset|timed out)|Server returned|Failed to resolve/i;

let deps = null;
// sourceId -> { input, isRemote, info, sessions: Set<session> }
const sources = new Map();

//=========================================================================================//
//======================================== SETUP ==========================================//
//=========================================================================================//

// Must be called before the app is ready.
function registerScheme() {
  protocol.registerSchemesAsPrivileged([{
    scheme: SCHEME,
    // stream: lets the response body be read while ffmpeg is still writing it.
    privileges: { standard: true, secure: true, stream: true, supportFetchAPI: true, corsEnabled: true }
  }]);
}

// getWindow: () => BrowserWindow | null
// resolveSource: (request) => { input: string, isRemote: boolean } (throws if the request is not playable)
// beforePlay (optional): () => Promise, run before a media is prepared (stops the other player)
function init(dependencies) {
  deps = dependencies;
  protocol.handle(SCHEME, handleStreamRequest);

  ipcMain.handle('player:prepare', async (_event, request) => prepareSource(request));
  ipcMain.handle('player:release', (_event, sourceId) => {
    releaseSource(sourceId);
  });
}

function getBinary(name) {
  const executable = process.platform === 'win32' ? `${name}.exe` : name;
  const bundled = app.isPackaged
    ? path.join(process.resourcesPath, 'ffmpeg', executable)
    : path.join(__dirname, 'resources', 'ffmpeg', executable);
  // Not shipped next to the app (development): the one installed on the PATH is used.
  return fs.existsSync(bundled) ? bundled : name;
}

function describeSpawnError(name, error) {
  if (error && error.code === 'ENOENT') {
    return new Error(`${name} not found: put ${name} in resources/ffmpeg or install it on the PATH`);
  }
  return error;
}

//=========================================================================================//
//======================================== PROBE ==========================================//
//=========================================================================================//

function runProbe(input, isRemote) {
  return new Promise((resolve, reject) => {
    const args = ['-v', 'error', '-print_format', 'json', '-show_format', '-show_streams'];
    if (isRemote) args.push(...HTTP_INPUT_OPTIONS);
    args.push(input);

    const proc = spawn(getBinary('ffprobe'), args, { windowsHide: true });
    let stdout = '';
    let stderr = '';
    const timer = setTimeout(() => proc.kill(), PROBE_TIMEOUT_MS);

    proc.stdout.on('data', (data) => { stdout += data; });
    proc.stderr.on('data', (data) => { stderr = (stderr + data).slice(-STDERR_TAIL_LENGTH); });
    proc.on('error', (error) => {
      clearTimeout(timer);
      reject(describeSpawnError('ffprobe', error));
    });
    proc.on('close', (code) => {
      clearTimeout(timer);
      if (code !== 0) {
        return reject(new Error(stderr.trim() || `ffprobe exited with code ${code}`));
      }
      try {
        resolve(JSON.parse(stdout));
      } catch (error) {
        reject(error);
      }
    });
  });
}

// Tag keys are usually lowercase (language, title) but some muxers write them uppercase.
function getTag(stream, key) {
  const tags = stream.tags || {};
  const found = Object.keys(tags).find((tagKey) => tagKey.toLowerCase() === key);
  return found ? String(tags[found]) : null;
}

function toNumber(value) {
  const number = Number(value);
  return Number.isFinite(number) ? number : null;
}

function toMediaInfo(probe) {
  const streams = Array.isArray(probe.streams) ? probe.streams : [];
  const disposition = (stream) => stream.disposition || {};

  // Cover art is stored as a video stream too: it is never the movie.
  const video = streams.find((stream) => stream.codec_type === 'video' && !disposition(stream).attached_pic);

  const audios = streams
    .filter((stream) => stream.codec_type === 'audio')
    .map((stream) => ({
      streamIndex: stream.index,
      codec: stream.codec_name || null,
      profile: stream.profile || null,
      channels: toNumber(stream.channels),
      channelLayout: stream.channel_layout || null,
      language: getTag(stream, 'language'),
      title: getTag(stream, 'title'),
      isDefault: disposition(stream).default === 1,
      isForced: disposition(stream).forced === 1
    }));

  // The renderer asks for every text track in each stream: past MAX_TEXT_SUBTITLES (the limit
  // parseStreamOptions enforces), the extra ones are listed as not displayable instead of failing the stream
  let textSubtitleCount = 0;
  const getSubtitleFormat = (stream) => {
    if (TEXT_SUBTITLE_CODECS.has(stream.codec_name)) {
      textSubtitleCount++;
      return textSubtitleCount <= MAX_TEXT_SUBTITLES ? 'text' : null;
    }
    return stream.codec_name === PGS_CODEC ? 'pgs' : null;
  };

  const subtitles = streams
    .filter((stream) => stream.codec_type === 'subtitle')
    .map((stream) => ({
      streamIndex: stream.index,
      codec: stream.codec_name || null,
      language: getTag(stream, 'language'),
      title: getTag(stream, 'title'),
      isDefault: disposition(stream).default === 1,
      isForced: disposition(stream).forced === 1,
      isHearingImpaired: disposition(stream).hearing_impaired === 1,
      // 'text' | 'pgs' | null (can't be displayed)
      format: getSubtitleFormat(stream)
    }));

  return {
    duration: toNumber(probe.format && probe.format.duration) || toNumber(video && video.duration) || 0,
    video: video ? {
      streamIndex: video.index,
      codec: video.codec_name || null,
      profile: video.profile || null,
      level: toNumber(video.level),
      width: toNumber(video.width),
      height: toNumber(video.height),
      pixelFormat: video.pix_fmt || null,
      colorTransfer: video.color_transfer || null
    } : null,
    audios,
    subtitles
  };
}

async function prepareSource(request) {
  if (!deps) throw new Error('Media player not initialized');
  // Only one video at a time: whatever else is playing (ChocoPlayer) is stopped first
  if (deps.beforePlay) await deps.beforePlay();
  const resolved = deps.resolveSource(request);

  // Registered before the probe (which can take seconds): a ChocoPlayer launched meanwhile sees a media
  // open here and stops it (stopAll), instead of both videos playing
  const sourceId = crypto.randomUUID();
  const source = { input: resolved.input, isRemote: resolved.isRemote, info: null, sessions: new Set() };
  sources.set(sourceId, source);
  try {
    const probe = await runProbe(source.input, source.isRemote);
    const info = toMediaInfo(probe);
    if (!info.video) throw new Error('No video stream in this media');
    if (!info.duration) throw new Error('Unknown media duration');
    if (sources.get(sourceId) !== source) throw new Error('Playback was stopped while the media was prepared');
    source.info = info;
    return { sourceId, isLocal: !source.isRemote, ...info };
  } catch (error) {
    if (sources.get(sourceId) === source) sources.delete(sourceId);
    throw error;
  }
}

//=========================================================================================//
//======================================== STREAM =========================================//
//=========================================================================================//

// chocostream://media/<sourceId>?start=<s>&audio=<stream index>&video=copy|h264&subs=<i>,<j>&pgs=<k>&session=<n>
// subs: text subtitle tracks (all of them, they are tiny), pgs: the one PGS track displayed, if any.
function parseStreamOptions(params, info) {
  const start = toNumber(params.get('start')) || 0;
  const session = toNumber(params.get('session')) || 0;
  const videoMode = params.get('video') === VIDEO_MODES.H264 ? VIDEO_MODES.H264 : VIDEO_MODES.COPY;

  const audioParam = params.get('audio');
  const audio = audioParam === null || audioParam === ''
    ? info.audios[0] || null
    : info.audios.find((track) => track.streamIndex === toNumber(audioParam));
  if (audio === undefined) return null;

  const subtitleIndexes = (params.get('subs') || '')
    .split(',')
    .filter((value) => value !== '')
    .map(Number);
  const subtitles = [];
  for (const index of subtitleIndexes) {
    const subtitle = info.subtitles.find((track) => track.streamIndex === index && track.format === 'text');
    if (!subtitle) return null;
    if (!subtitles.includes(subtitle)) subtitles.push(subtitle);
  }
  if (subtitles.length > MAX_TEXT_SUBTITLES) return null;

  const pgsParam = params.get('pgs');
  const pgs = pgsParam === null || pgsParam === ''
    ? null
    : info.subtitles.find((track) => track.streamIndex === toNumber(pgsParam) && track.format === 'pgs');
  if (pgs === undefined) return null;

  return { start: Math.max(0, start), session, videoMode, audio, subtitles, pgs };
}

function getVideoArgs(video, videoMode) {
  if (videoMode === VIDEO_MODES.H264) {
    // Fallback when Chromium can't decode the original video (no HEVC hardware decoder, 10-bit H.264, MPEG-2...).
    return [
      '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '21', '-maxrate', '20M', '-bufsize', '40M',
      '-pix_fmt', 'yuv420p', '-vf', "scale='min(1920,iw)':-2", '-g', '96'
    ];
  }
  const args = ['-c:v', 'copy'];
  if (video.codec === 'hevc') args.push('-tag:v', 'hvc1');
  return args;
}

function getAudioArgs(audio) {
  const channels = audio.channels || 2;
  // AAC-LC is copied as is; anything else (AC3, EAC3, DTS, TrueHD, FLAC, Opus, HE-AAC...) becomes AAC-LC,
  // which Chromium always plays. Up to 5.1 is kept, Chromium downmixes it if the output is stereo.
  if (audio.codec === 'aac' && (!audio.profile || audio.profile === 'LC') && channels <= 6) {
    return ['-c:a', 'copy'];
  }
  const outputChannels = channels > 2 ? 6 : 2;
  return ['-c:a', 'aac', '-ac', String(outputChannels), '-b:a', outputChannels > 2 ? '384k' : '192k'];
}

function buildFfmpegArgs(source, options) {
  const { info } = source;
  const args = ['-hide_banner', '-loglevel', 'error', '-nostdin'];
  if (source.isRemote) args.push(...HTTP_INPUT_OPTIONS);
  if (options.start > 0) args.push('-ss', options.start.toFixed(3));
  args.push('-copyts', '-i', source.input);

  // Main output: fragmented MP4 for the MediaSource.
  args.push('-map', `0:${info.video.streamIndex}`);
  if (options.audio) args.push('-map', `0:${options.audio.streamIndex}`);
  args.push('-map_metadata', '-1', '-map_chapters', '-1');
  args.push(...getVideoArgs(info.video, options.videoMode));
  if (options.audio) args.push(...getAudioArgs(options.audio));
  args.push(
    '-f', 'mp4',
    // frag_discont + avoid_negative_ts make_non_negative: the fragments keep the source timestamps
    // (the default resets every track to 0, which also desynchronizes the audio after a seek).
    '-movflags', 'frag_keyframe+empty_moov+default_base_moof+frag_discont',
    '-frag_duration', '1000000',
    '-avoid_negative_ts', 'make_non_negative',
    'pipe:1'
  );

  // One WebVTT output per text subtitle track, on the pipes 3, 4, 5...
  options.subtitles.forEach((subtitle, position) => {
    args.push(
      '-map', `0:${subtitle.streamIndex}`,
      '-c:s', 'webvtt', '-flush_packets', '1', '-f', 'webvtt', `pipe:${3 + position}`
    );
  });

  // Then the PGS track, copied as is in SUP format (its timestamps stay absolute too)
  if (options.pgs) {
    args.push(
      '-map', `0:${options.pgs.streamIndex}`,
      '-c:s', 'copy', '-flush_packets', '1', '-f', 'sup', `pipe:${3 + options.subtitles.length}`
    );
  }

  return args;
}

function handleStreamRequest(request) {
  const url = new URL(request.url);
  const sourceId = url.pathname.replace(/^\/+/, '');
  const source = url.hostname === STREAM_HOST ? sources.get(sourceId) : null;
  // info is null while the source is still being probed
  if (!source || !source.info) {
    return new Response('Not found', { status: 404 });
  }
  const options = parseStreamOptions(url.searchParams, source.info);
  if (!options) {
    return new Response('Bad request', { status: 400 });
  }

  const session = startSession(sourceId, source, options);
  return new Response(Readable.toWeb(session.proc.stdout), {
    status: 200,
    headers: {
      'Content-Type': 'video/mp4',
      'Cache-Control': 'no-store',
      // The page is loaded from file:// : fetch() on another scheme is a cross-origin request.
      'Access-Control-Allow-Origin': '*'
    }
  });
}

function startSession(sourceId, source, options) {
  const pipeCount = options.subtitles.length + (options.pgs ? 1 : 0);
  const stdio = ['ignore', 'pipe', 'pipe', ...Array.from({ length: pipeCount }, () => 'pipe')];
  const proc = spawn(getBinary('ffmpeg'), buildFfmpegArgs(source, options), { stdio, windowsHide: true });
  const session = { proc, stopped: false, stderr: '' };
  source.sessions.add(session);

  proc.stderr.on('data', (data) => {
    session.stderr = (session.stderr + data).slice(-STDERR_TAIL_LENGTH);
  });

  options.subtitles.forEach((subtitle, position) => {
    const parser = createWebVttParser((cues) => {
      sendToRenderer('player:subtitle-cues', { sourceId, streamIndex: subtitle.streamIndex, cues });
    });
    const pipe = proc.stdio[3 + position];
    pipe.setEncoding('utf8');
    pipe.on('data', (text) => parser.push(text));
    pipe.on('end', () => parser.end());
    pipe.on('error', () => {});
  });

  if (options.pgs) {
    const streamIndex = options.pgs.streamIndex;
    const parser = createSupParser((displaySets) => {
      sendToRenderer('player:pgs-display-sets', { sourceId, streamIndex, displaySets });
    });
    const pipe = proc.stdio[3 + options.subtitles.length];
    pipe.on('data', (chunk) => parser.push(chunk));
    pipe.on('error', () => {});
  }

  // Closed without reaching its end: the renderer stopped reading (seek, audio change, player closed),
  // ffmpeg has nothing left to do. Reaching the end means ffmpeg exited: its exit code tells how.
  let stdoutEnded = false;
  proc.stdout.on('end', () => { stdoutEnded = true; });
  proc.stdout.on('close', () => {
    if (!stdoutEnded) stopSession(session);
  });
  // Cancelling the response can destroy stdout with an error: without a listener it would crash the main process.
  proc.stdout.on('error', () => {});

  proc.on('error', (error) => {
    source.sessions.delete(session);
    if (session.stopped) return;
    session.stopped = true;
    sendToRenderer('player:stream-error', {
      sourceId,
      session: options.session,
      message: describeSpawnError('ffmpeg', error).message
    });
  });

  proc.on('close', (code, signal) => {
    source.sessions.delete(session);
    if (session.stopped) return;
    session.stopped = true;
    // ffmpeg exits with 0 even when reading the source failed (network cut, server gone): only its log tells
    if (code === 0 && !INPUT_FAILURE_PATTERN.test(session.stderr)) return;
    sendToRenderer('player:stream-error', {
      sourceId,
      session: options.session,
      message: session.stderr.trim() || (code === null ? `ffmpeg was stopped (${signal})` : `ffmpeg exited with code ${code}`)
    });
  });

  return session;
}

function stopSession(session) {
  if (session.stopped) return;
  session.stopped = true;
  if (session.proc.exitCode === null && session.proc.signalCode === null) {
    session.proc.kill();
  }
}

function releaseSource(sourceId) {
  const source = sources.get(sourceId);
  if (!source) return;
  source.sessions.forEach(stopSession);
  sources.delete(sourceId);
}

// Kills every ffmpeg (window reload, app closing).
function stopAll() {
  [...sources.keys()].forEach(releaseSource);
}

// A media is open in the player (its sources are released when the player is left)
function hasActiveSources() {
  return sources.size > 0;
}

function sendToRenderer(channel, data) {
  const window = deps && deps.getWindow();
  if (window && !window.isDestroyed()) {
    window.webContents.send(channel, data);
  }
}

//=========================================================================================//
//======================================= SUBTITLES =======================================//
//=========================================================================================//

// "01:02:03.456" or "02:03.456" -> seconds
function parseVttTimestamp(value) {
  const parts = value.split(':').map(Number);
  if (parts.some((part) => !Number.isFinite(part))) return NaN;
  return parts.reduce((total, part) => total * 60 + part, 0);
}

function parseCueBlock(block) {
  const lines = block.split('\n');
  const timingIndex = lines.findIndex((line) => line.includes('-->'));
  if (timingIndex === -1) return null; // WEBVTT header, NOTE, STYLE...
  const match = /^\s*(\S+)\s+-->\s+(\S+)/.exec(lines[timingIndex]);
  if (!match) return null;
  const start = parseVttTimestamp(match[1]);
  const end = parseVttTimestamp(match[2]);
  const text = lines.slice(timingIndex + 1).join('\n').trim();
  if (!text || !Number.isFinite(start) || !(end > start)) return null;
  return { start, end, text };
}

// ffmpeg writes the cues as the movie is read: a cue is complete once the blank line after it arrives.
function createWebVttParser(onCues) {
  let buffer = '';
  const flush = (blocks) => {
    const cues = blocks.map(parseCueBlock).filter(Boolean);
    if (cues.length > 0) onCues(cues);
  };
  return {
    push(text) {
      buffer += text.replace(/\r\n?/g, '\n');
      const blocks = buffer.split(/\n{2,}/);
      buffer = blocks.pop();
      flush(blocks);
    },
    end() {
      flush([buffer]);
      buffer = '';
    }
  };
}

// SUP (PGS) stream -> display sets. Each segment is "PG", PTS (90 kHz), DTS, type, size, payload, and a
// display set (one subtitle appearing, changing or disappearing) ends with an END segment.
// A display set is sent with its PTS in seconds and its segments without the "PG" header (type, size, payload).
function createSupParser(onDisplaySets) {
  let buffer = Buffer.alloc(0);
  let segments = [];
  let pts = null;
  return {
    push(chunk) {
      buffer = buffer.length > 0 ? Buffer.concat([buffer, chunk]) : chunk;
      const displaySets = [];
      let offset = 0;
      while (buffer.length - offset >= SUP_HEADER_LENGTH) {
        if (buffer[offset] !== 0x50 || buffer[offset + 1] !== 0x47) {
          // Not on a segment header: skips to the next "PG"
          const next = buffer.indexOf('PG', offset + 1, 'latin1');
          offset = next === -1 ? buffer.length - 1 : next;
          continue;
        }
        const size = buffer.readUInt16BE(offset + 11);
        if (buffer.length - offset < SUP_HEADER_LENGTH + size) break;
        if (pts === null) pts = buffer.readUInt32BE(offset + 2);
        segments.push(buffer.subarray(offset + 10, offset + SUP_HEADER_LENGTH + size));
        if (buffer[offset + 10] === PGS_END_SEGMENT) {
          displaySets.push({ pts: pts / 90000, data: Buffer.concat(segments) });
          segments = [];
          pts = null;
        }
        offset += SUP_HEADER_LENGTH + size;
      }
      // Keeps a copy of the unfinished segment: the segments kept above point into the current buffer
      segments = segments.map((segment) => Buffer.from(segment));
      buffer = Buffer.from(buffer.subarray(offset));
      if (displaySets.length > 0) onDisplaySets(displaySets);
    }
  };
}

module.exports = { registerScheme, init, stopAll, hasActiveSources };

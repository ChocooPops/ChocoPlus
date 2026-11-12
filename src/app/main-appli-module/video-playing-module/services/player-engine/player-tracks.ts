import { PlayerAudioTrack, PlayerSubtitleTrack } from '../../models/player.interface';

// Names of the audio / subtitle tracks and choice of the track to play, remembering what the user picked
// last time (like ChocoPlayer did): the same language is chosen again on the next movie or episode.

// ISO 639-2 codes (what MKV files use) -> ISO 639-1
const LANGUAGE_CODES: Record<string, string> = {
  fre: 'fr', fra: 'fr', eng: 'en', jpn: 'ja', ger: 'de', deu: 'de', spa: 'es', ita: 'it', por: 'pt',
  rus: 'ru', chi: 'zh', zho: 'zh', kor: 'ko', ara: 'ar', dut: 'nl', nld: 'nl', pol: 'pl', tur: 'tr',
  swe: 'sv', dan: 'da', nor: 'no', nob: 'nb', nno: 'nn', fin: 'fi', gre: 'el', ell: 'el', heb: 'he',
  tha: 'th', vie: 'vi', ind: 'id', ukr: 'uk', cze: 'cs', ces: 'cs', rum: 'ro', ron: 'ro', hun: 'hu',
  cat: 'ca', baq: 'eu', eus: 'eu', hin: 'hi', ben: 'bn', tam: 'ta', tel: 'te', may: 'ms', msa: 'ms',
  fil: 'fil', tgl: 'tl', per: 'fa', fas: 'fa', bul: 'bg', hrv: 'hr', srp: 'sr', slo: 'sk', slk: 'sk',
  slv: 'sl', est: 'et', lav: 'lv', lit: 'lt', ice: 'is', isl: 'is', yue: 'yue'
};
const UNDETERMINED_LANGUAGES = new Set(['und', 'unk', 'mis', 'mul', 'zxx', 'undefined', 'unknown']);

export function normalizeLanguage(code: string | null | undefined): string | null {
  if (!code) return null;
  const value = code.trim().toLowerCase().replace('_', '-');
  if (!value || UNDETERMINED_LANGUAGES.has(value)) return null;
  const [base, region] = value.split('-');
  const language = LANGUAGE_CODES[base] ?? base;
  return region ? `${language}-${region}` : language;
}

const capitalize = (text: string): string => text.charAt(0).toLocaleUpperCase() + text.slice(1);

export function getLanguageName(code: string | null | undefined, displayLanguage: string): string | null {
  const language = normalizeLanguage(code);
  if (!language) return null;
  try {
    const name = new Intl.DisplayNames([displayLanguage, 'en'], { type: 'language' }).of(language);
    return name && name.toLowerCase() !== language ? capitalize(name) : language.toUpperCase();
  } catch {
    return language.toUpperCase();
  }
}

export interface TrackLabels {
  track: string,
  forced: string,
  hearingImpaired: string,
  unsupported: string
}

const CODEC_NAMES: Record<string, string> = {
  ac3: 'AC3', eac3: 'E-AC3', dts: 'DTS', truehd: 'TrueHD', aac: 'AAC', flac: 'FLAC', opus: 'Opus',
  mp3: 'MP3', vorbis: 'Vorbis', pcm_s16le: 'PCM', pcm_s24le: 'PCM'
};

function describeChannels(channels: number | null): string | null {
  switch (channels) {
    case null: return null;
    case 1: return 'Mono';
    case 2: return 'Stereo';
    case 6: return '5.1';
    case 8: return '7.1';
    default: return `${channels} ch`;
  }
}

export interface TrackDescription {
  // The language, or the track title / number when the language is unknown
  name: string,
  // What tells tracks of the same language apart (title, codec, forced...), '' if nothing
  detail: string
}

// The title, unless it only repeats the language
function getDistinctTitle(name: string | null, title: string | null): string | null {
  const cleanTitle = title?.trim() || null;
  return cleanTitle && cleanTitle.toLowerCase() !== name?.toLowerCase() ? cleanTitle : null;
}

export function describeAudioTrack(track: PlayerAudioTrack, position: number, displayLanguage: string, labels: TrackLabels): TrackDescription {
  const language = getLanguageName(track.language, displayLanguage);
  const title = getDistinctTitle(language, track.title);
  const technical = [track.codec ? CODEC_NAMES[track.codec] ?? track.codec.toUpperCase() : null, describeChannels(track.channels)]
    .filter(Boolean)
    .join(' ');
  if (!language) {
    return { name: title ?? `${labels.track} ${position + 1}`, detail: technical };
  }
  // A title usually names the dub and its codec already ("VFF AC3 5.1")
  return { name: language, detail: title ?? technical };
}

export function describeSubtitleTrack(track: PlayerSubtitleTrack, position: number, displayLanguage: string, labels: TrackLabels): TrackDescription {
  const language = getLanguageName(track.language, displayLanguage);
  const title = getDistinctTitle(language, track.title);
  const lowerTitle = (title ?? '').toLowerCase();
  const details = [
    language ? title : null,
    track.isForced && !/forc/.test(lowerTitle) ? labels.forced : null,
    track.isHearingImpaired && !/sdh|malentendant|hearing/.test(lowerTitle) ? labels.hearingImpaired : null,
    track.format === 'pgs' ? 'PGS' : null,
    track.format ? null : labels.unsupported
  ].filter(Boolean);
  return {
    name: language ?? title ?? `${labels.track} ${position + 1}`,
    detail: details.join(' · ')
  };
}

// ── Preferences ─────────────────────────────────────────────────────────────

export interface TrackPreference {
  language: string | null,
  title: string | null,
  isForced?: boolean,
  isHearingImpaired?: boolean
}

export interface TrackPreferences {
  audio: TrackPreference | null,
  // 'off': the user disabled the subtitles
  subtitle: TrackPreference | 'off' | null
}

const PREFERENCES_KEY = 'chocoplus.player.tracks';

export function loadTrackPreferences(): TrackPreferences {
  try {
    const saved = JSON.parse(localStorage.getItem(PREFERENCES_KEY) ?? 'null');
    if (saved && typeof saved === 'object') {
      return { audio: saved.audio ?? null, subtitle: saved.subtitle ?? null };
    }
  } catch {
    // unreadable or unavailable storage: no preference
  }
  return { audio: null, subtitle: null };
}

export function saveTrackPreferences(preferences: TrackPreferences): void {
  try {
    localStorage.setItem(PREFERENCES_KEY, JSON.stringify(preferences));
  } catch {
    // unavailable storage: the choice only applies to this media
  }
}

export function toAudioPreference(track: PlayerAudioTrack): TrackPreference {
  return { language: normalizeLanguage(track.language), title: track.title };
}

export function toSubtitlePreference(track: PlayerSubtitleTrack | null): TrackPreference | 'off' {
  if (!track) return 'off';
  return {
    language: normalizeLanguage(track.language),
    title: track.title,
    isForced: track.isForced,
    isHearingImpaired: track.isHearingImpaired
  };
}

const sameTitle = (a: string | null, b: string | null): boolean =>
  !!a && !!b && a.trim().toLowerCase() === b.trim().toLowerCase();

export function pickAudioTrack(tracks: PlayerAudioTrack[], preference: TrackPreference | null): PlayerAudioTrack | null {
  if (tracks.length === 0) return null;
  if (preference?.language) {
    const sameLanguage = tracks.filter((track) => normalizeLanguage(track.language) === preference.language);
    const match = sameLanguage.find((track) => sameTitle(track.title, preference.title))
      ?? sameLanguage.find((track) => track.isDefault)
      ?? sameLanguage[0];
    if (match) return match;
  }
  return tracks.find((track) => track.isDefault) ?? tracks[0];
}

// Only displayable tracks (text or PGS) can be picked. No preference: the track the file marks as default, if any.
export function pickSubtitleTrack(tracks: PlayerSubtitleTrack[], preference: TrackPreference | 'off' | null): PlayerSubtitleTrack | null {
  const playableTracks = tracks.filter((track) => track.format !== null);
  if (preference === 'off') return null;
  if (preference) {
    const sameLanguage = playableTracks.filter((track) => normalizeLanguage(track.language) === preference.language);
    const sameKind = sameLanguage.filter((track) =>
      track.isForced === !!preference.isForced && track.isHearingImpaired === !!preference.isHearingImpaired);
    return sameKind.find((track) => sameTitle(track.title, preference.title))
      ?? sameKind[0]
      ?? sameLanguage.find((track) => !track.isForced)
      ?? null;
  }
  return playableTracks.find((track) => track.isDefault) ?? null;
}

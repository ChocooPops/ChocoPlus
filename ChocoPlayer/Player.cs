using System;
using System.Collections.Generic;
using System.Linq;
using LibVLCSharp.Shared;

namespace ChocoPlayer
{
    public class TrackInfo
    {
        public int Id { get; set; }
        public string Name { get; set; }

        public TrackInfo(int id, string name)
        {
            Id = id;
            Name = name;
        }
    }

    public static class Player
    {
        private static MediaPlayer? _currentMediaPlayer;

        public static void SetMediaPlayer(MediaPlayer mediaPlayer)
        {
            _currentMediaPlayer = mediaPlayer;
        }

        public static long GetTotalTime()
        {
            return _currentMediaPlayer?.Length ?? 0;
        }

        public static long GetElapsedTime()
        {
            return _currentMediaPlayer?.Time ?? 0;
        }

        public static bool IsMuted()
        {
            return _currentMediaPlayer?.Mute ?? false;
        }

        // AJOUTER CETTE MÉTHODE
        public static int GetVolume()
        {
            return _currentMediaPlayer?.Volume ?? -1;
        }

        public static List<TrackInfo> GetAudioTracks()
        {
            if (_currentMediaPlayer == null)
                return new List<TrackInfo>();

            var tracks = _currentMediaPlayer.AudioTrackDescription;
            if (tracks == null)
                return new List<TrackInfo>();

            return tracks.Select(t => new TrackInfo(t.Id, t.Name ?? "Unknown")).ToList();
        }

        public static int GetCurrentAudioTrack()
        {
            return _currentMediaPlayer?.AudioTrack ?? -1;
        }

        public static List<TrackInfo> GetSubtitleTracks()
        {
            if (_currentMediaPlayer == null)
                return new List<TrackInfo>();

            var tracks = _currentMediaPlayer.SpuDescription;
            if (tracks == null)
                return new List<TrackInfo>();

            return tracks.Select(t => new TrackInfo(t.Id, t.Name ?? "Unknown")).ToList();
        }

        public static int GetCurrentSubtitleTrack()
        {
            return _currentMediaPlayer?.Spu ?? -1;
        }

        // ── Buffered (downloaded) range ───────────────────────────────────────
        // libVLC doesn't expose how far ahead a network stream is loaded, so it is estimated:
        // every byte downloaded since the last seek is contiguous from the seek target, and the file's
        // average bitrate (size / length) turns that byte count into a duration.
        // Only network sources are tracked: a local file is always fully available.
        // The file size comes from StreamProbe, sent before libVLC opens the stream (never alongside it).
        private static long _totalBytes = -1;      // file size, -1 when unknown (or local file)
        private static long _anchorTimeMs;         // timecode where the downloaded range starts
        private static int  _anchorReadBytes;      // libVLC's read counter at that moment
        private static long _lastBufferedTimeMs = -1;

        // Called for every new media, before it starts playing
        public static void BeginBufferTracking(long totalBytes)
        {
            _totalBytes         = totalBytes;
            _anchorTimeMs       = 0;
            _anchorReadBytes    = 0;   // statistics start from zero for each new media
            _lastBufferedTimeMs = -1;
        }

        // Called right before a seek: the downloaded range restarts at the target,
        // unless the target is already loaded (libVLC's prefetch buffer then serves it without downloading again)
        public static void NotifySeek(long targetMs)
        {
            long current = GetElapsedTime();
            if (_lastBufferedTimeMs > 0 && targetMs >= current && targetMs < _lastBufferedTimeMs)
                return;

            _anchorTimeMs    = targetMs;
            _anchorReadBytes = GetReadBytes();
        }

        // Timecode (ms) up to which the media is loaded, or -1 when it can't be estimated
        public static long GetBufferedTime()
        {
            long totalBytes = _totalBytes;
            long length     = GetTotalTime();
            if (totalBytes <= 0 || length <= 0) return -1;

            // libVLC's counter is a 32-bit int: the unchecked difference stays right across an overflow
            uint   downloaded = unchecked((uint)(GetReadBytes() - _anchorReadBytes));
            double bytesPerMs = (double)totalBytes / length;
            long   buffered   = _anchorTimeMs + (long)(downloaded / bytesPerMs);

            _lastBufferedTimeMs = Math.Clamp(buffered, GetElapsedTime(), length);
            return _lastBufferedTimeMs;
        }

        private static int GetReadBytes()
        {
            try
            {
                // The getter hands out a new reference to the native media: release it
                using var media = _currentMediaPlayer?.Media;
                return media?.Statistics.ReadBytes ?? 0;
            }
            catch { return 0; }
        }
    }
}
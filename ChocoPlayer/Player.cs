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
    }
}
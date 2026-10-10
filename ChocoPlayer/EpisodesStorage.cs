using System;
using System.Collections.Generic;
using System.Linq;

namespace ChocoPlayer
{
    public class StoredEpisode
    {
        public int Id { get; set; }
        public int SeriesId { get; set; }
        public int SeasonId { get; set; }
        public string Name { get; set; } = "";
        public int EpisodeNumber { get; set; }
        public string Description { get; set; } = "";
        public DateTime Date { get; set; }
        public string SrcPoster { get; set; } = "";
        public long Duration { get; set; }
        public string Resolution { get; set; } = "";
        public long Bytes { get; set; }
    }

    public class EpisodeStorageItem
    {
        public StoredEpisode Episode { get; set; } = new();
        public string VideoPath { get; set; } = "";
    }

    public static class EpisodesStorage
    {
        private static readonly List<EpisodeStorageItem> _items = new();

        public static IReadOnlyList<EpisodeStorageItem> Items => _items;

        public static int Count => _items.Count;

        public static void Load(IEnumerable<EpisodeStorageItem>? items)
        {
            _items.Clear();
            if (items == null) return;

            _items.AddRange(items
                .Where(i => i?.Episode != null)
                .OrderBy(i => i.Episode.EpisodeNumber));
        }

        public static void Clear() => _items.Clear();

        public static EpisodeStorageItem? GetById(int episodeId)
            => _items.FirstOrDefault(i => i.Episode.Id == episodeId);

        public static string? GetVideoPath(int episodeId)
            => GetById(episodeId)?.VideoPath;

        public static List<EpisodeStorageItem> GetBySeason(int seasonId)
            => _items.Where(i => i.Episode.SeasonId == seasonId).ToList();

        public static EpisodeStorageItem? GetNext(int episodeId)
        {
            int index = _items.FindIndex(i => i.Episode.Id == episodeId);
            return index >= 0 && index < _items.Count - 1 ? _items[index + 1] : null;
        }

        public static EpisodeStorageItem? GetPrevious(int episodeId)
        {
            int index = _items.FindIndex(i => i.Episode.Id == episodeId);
            return index > 0 ? _items[index - 1] : null;
        }
    }
}

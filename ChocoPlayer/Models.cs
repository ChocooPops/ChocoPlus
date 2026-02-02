using System;

namespace ChocoPlayer
{
    public class Season
    {
        public int Id { get; set; }
        public int SeriesId { get; set; }
        public string Name { get; set; }
        public int SeasonNumber { get; set; }

        public Season(int id, int seriesId, string name, int seasonNumber)
        {
            Id = id;
            SeriesId = seriesId;
            Name = name;
            SeasonNumber = seasonNumber;
        }
    }

    public class Episode
    {
        public int Id { get; set; }
        public int SeasonId { get; set; }
        public string JellyfinId { get; set; }
        public string Name { get; set; }
        public int EpisodeNumber { get; set; }
        public string Description { get; set; }
        public DateTime Date { get; set; }
        public long Time { get; set; }
        public string Quality { get; set; }
        public string SrcPoster { get; set; }

        public Episode()
        {
            JellyfinId = "";
            Name = "";
            Description = "";
            Quality = "";
            SrcPoster = "";
        }

        public Episode(int id, int seasonId, string jellyfinId, string name, int episodeNumber,
                      string description, DateTime date, long time, string quality, string srcPoster)
        {
            Id = id;
            SeasonId = seasonId;
            JellyfinId = jellyfinId;
            Name = name;
            EpisodeNumber = episodeNumber;
            Description = description;
            Date = date;
            Time = time;
            Quality = quality;
            SrcPoster = srcPoster;
        }
    }
}
namespace ChocoPlayer
{
    public class VideoInfo
    {
        public string? BaseUrl { get; set; }
        public string? Token { get; set; }
        public int? MediaId { get; set; }
        public string? Title { get; set; }
        public string? Url { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public bool IsMaximized { get; set; }
        public bool IsFullScreen { get; set; }
        public int EpisodeId { get; set; }
        public int SeasonIndex { get; set; }
        public List<Season>? SeasonMenu { get; set; }
    }
}
namespace ChocoPlayer
{
    public class VideoInfo
    {
        public string? Title { get; set; }
        public string? Url { get; set; }
        public int Height { get; set; }
        public int Width { get; set; }
        public int PositionX { get; set; }
        public int PositionY { get; set; }
        public bool IsMaximized { get; set; }
        public bool IsFullScreen { get; set; }
    }
}
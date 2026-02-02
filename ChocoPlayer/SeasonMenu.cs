using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using System.Net.Http;
using System.Threading.Tasks;
using SkiaSharp;
using System.Runtime.InteropServices;

namespace ChocoPlayer
{
    public class SeasonsMenu : Panel
    {
        private List<SeasonItem> _seasons = new List<SeasonItem>();
        private List<EpisodeItem> _episodes = new List<EpisodeItem>();

        private const int MENU_WIDTH = 850;
        private const int MENU_HEIGHT = 650;
        private const int PADDING = 20;
        private const int HEADER_HEIGHT = 60;
        private const int EPISODE_HEIGHT = 140;
        private const int EPISODE_SPACING = 15;
        private const int SEASON_ITEM_HEIGHT = 55;
        private const int BORDER_WIDTH = 2;

        private ISeasonSelectionListener? _listener;
        private Color _accentColor = Color.FromArgb(255, 211, 1);
        private Color _backgroundColor = Color.FromArgb(230, 30, 30, 30);
        private Color _headerColor = Color.FromArgb(35, 35, 35);
        private Color _itemHoverColor = Color.FromArgb(48, 48, 48);

        private int _currentSeasonIndex = 0;
        private bool _isDropdownOpen = false;
        private int _hoveredSeasonIndex = -1;
        private int _hoveredEpisodeIndex = -1;
        private int _currentPlayingEpisodeId = -1;

        private static readonly HttpClient _httpClient = new HttpClient();
        private Dictionary<string, Bitmap> _imageCache = new Dictionary<string, Bitmap>();

        private Rectangle _headerRect;
        private Rectangle _dropdownRect;
        private Rectangle _episodesRect;
        private int _scrollOffset = 0;
        private int _maxScrollOffset = 0;
        private int _dropdownScrollOffset = 0;
        private int _maxDropdownScrollOffset = 0;

        public SeasonsMenu()
        {
            this.BackColor = Color.Transparent;
            this.Visible = false;
            this.Size = new Size(MENU_WIDTH, MENU_HEIGHT);
            this.DoubleBuffered = true;

            this.MouseDown += SeasonsMenu_MouseDown;
            this.MouseMove += SeasonsMenu_MouseMove;
            this.MouseLeave += SeasonsMenu_MouseLeave;
            this.MouseWheel += SeasonsMenu_MouseWheel;
        }

        private void CalculateMaxScroll()
        {
            int totalEpisodesHeight = _episodes.Count * (EPISODE_HEIGHT + EPISODE_SPACING);
            int availableHeight = MENU_HEIGHT - HEADER_HEIGHT - PADDING * 2;
            _maxScrollOffset = Math.Max(0, totalEpisodesHeight - availableHeight);
        }

        private void CalculateMaxDropdownScroll()
        {
            int maxDropdownHeight = MENU_HEIGHT - HEADER_HEIGHT - 10;
            int totalSeasonsHeight = _seasons.Count * SEASON_ITEM_HEIGHT;
            _maxDropdownScrollOffset = Math.Max(0, totalSeasonsHeight - maxDropdownHeight);
        }

        public void SetListener(ISeasonSelectionListener listener)
        {
            _listener = listener;
        }

        public void SetCurrentPlayingEpisode(int episodeId)
        {
            _currentPlayingEpisodeId = episodeId;

            if (_currentPlayingEpisodeId < 1 && _episodes.Count > 0)
            {
                _currentPlayingEpisodeId = _episodes[0].Id;
            }

            RefreshImmediate();
        }

        public void LoadSeasons(List<SeasonItem> seasons)
        {
            _seasons = seasons;
            if (_seasons.Count > 0)
            {
                _currentSeasonIndex = 0;
            }
            _dropdownScrollOffset = 0;
            CalculateMaxDropdownScroll();
            RefreshImmediate();
        }

        public void Toggle()
        {
            this.Visible = !this.Visible;
            if (this.Visible)
            {
                _isDropdownOpen = false;
                _dropdownScrollOffset = 0;
                RefreshImmediate();
            }
        }

        public void SetPosition(int buttonX, int buttonY, bool isFullScreen)
        {
            if (isFullScreen)
            {
                this.SetBounds((buttonX - MENU_WIDTH) / 2, buttonY - MENU_HEIGHT - 20, MENU_WIDTH, MENU_HEIGHT);
            }
            else
            {
                this.SetBounds(buttonX - MENU_WIDTH, buttonY - MENU_HEIGHT - 20, MENU_WIDTH, MENU_HEIGHT);
            }
        }

        public void SetSeasons(List<SeasonItem> seasons)
        {
            _seasons = seasons;
            _dropdownScrollOffset = 0;
            CalculateMaxDropdownScroll();
            if (_seasons.Count > 0)
            {
                //LoadEpisodesForSeason(_currentSeasonIndex);
            }
            RefreshImmediate();
        }

        public void SetEpisodes(List<EpisodeItem> episodes)
        {

            _episodes = new List<EpisodeItem>(episodes ?? new List<EpisodeItem>());
            _scrollOffset = 0;
            CalculateMaxScroll();
            RefreshImmediate();
        }

        public void ClearEpisodes()
        {
            _episodes.Clear();
            _scrollOffset = 0;

            foreach (var img in _imageCache.Values)
            {
                img?.Dispose();
            }
            _imageCache.Clear();

            RefreshImmediate();
        }

        private void SeasonsMenu_MouseWheel(object? sender, MouseEventArgs e)
        {
            if (!this.Visible)
                return;

            if (_isDropdownOpen)
            {
                _dropdownScrollOffset -= e.Delta / 3;
                _dropdownScrollOffset = Math.Max(0, Math.Min(_dropdownScrollOffset, _maxDropdownScrollOffset));
            }
            else
            {
                _scrollOffset -= e.Delta / 3;
                _scrollOffset = Math.Max(0, Math.Min(_scrollOffset, _maxScrollOffset));
            }
            RefreshImmediate();
        }

        private void SeasonsMenu_MouseMove(object? sender, MouseEventArgs e)
        {
            if (!this.Visible)
                return;

            int previousHoveredSeason = _hoveredSeasonIndex;
            int previousHoveredEpisode = _hoveredEpisodeIndex;

            _hoveredSeasonIndex = -1;
            _hoveredEpisodeIndex = -1;

            if (_headerRect.Contains(e.Location))
            {
                this.Cursor = Cursors.Hand;
            }
            else if (_isDropdownOpen && _dropdownRect.Contains(e.Location))
            {
                int relativeY = e.Y - _dropdownRect.Y + _dropdownScrollOffset;
                int itemIndex = relativeY / SEASON_ITEM_HEIGHT;

                if (itemIndex >= 0 && itemIndex < _seasons.Count)
                {
                    _hoveredSeasonIndex = itemIndex;
                }
                this.Cursor = Cursors.Hand;
            }
            else if (!_isDropdownOpen && _episodesRect.Contains(e.Location))
            {
                int relativeY = e.Y - _episodesRect.Y + _scrollOffset;
                int itemIndex = relativeY / (EPISODE_HEIGHT + EPISODE_SPACING);

                if (itemIndex >= 0 && itemIndex < _episodes.Count)
                {
                    _hoveredEpisodeIndex = itemIndex;
                    this.Cursor = Cursors.Hand;
                }
                else
                {
                    this.Cursor = Cursors.Default;
                }
            }
            else
            {
                this.Cursor = Cursors.Default;
            }

            if (previousHoveredSeason != _hoveredSeasonIndex || previousHoveredEpisode != _hoveredEpisodeIndex)
            {
                RefreshImmediate();
            }
        }

        private void SeasonsMenu_MouseLeave(object? sender, EventArgs e)
        {
            if (_hoveredSeasonIndex != -1 || _hoveredEpisodeIndex != -1)
            {
                _hoveredSeasonIndex = -1;
                _hoveredEpisodeIndex = -1;
                this.Cursor = Cursors.Default;
                RefreshImmediate();
            }
        }

        private void SeasonsMenu_MouseDown(object? sender, MouseEventArgs e)
        {
            if (!this.Visible)
                return;

            if (_headerRect.Contains(e.Location))
            {
                _isDropdownOpen = !_isDropdownOpen;
                _hoveredSeasonIndex = -1;
                RefreshImmediate();
                return;
            }

            if (_isDropdownOpen && _dropdownRect.Contains(e.Location))
            {
                int relativeY = e.Y - _dropdownRect.Y + _dropdownScrollOffset;
                int itemIndex = relativeY / SEASON_ITEM_HEIGHT;

                if (itemIndex >= 0 && itemIndex < _seasons.Count && itemIndex != _currentSeasonIndex)
                {
                    _currentSeasonIndex = itemIndex;
                    _isDropdownOpen = false;
                    _listener?.OnSeasonSelected(_seasons[_currentSeasonIndex].Id);
                    RefreshImmediate();
                }
                return;
            }

            if (!_isDropdownOpen && _episodesRect.Contains(e.Location))
            {
                int relativeY = e.Y - _episodesRect.Y + _scrollOffset;
                int itemIndex = relativeY / (EPISODE_HEIGHT + EPISODE_SPACING);

                if (itemIndex >= 0 && itemIndex < _episodes.Count)
                {
                    var episode = _episodes[itemIndex];
                    _listener?.OnEpisodeSelected(_currentSeasonIndex, episode.Id, episode.Path, episode.Title);
                }
            }
        }

        private void RefreshImmediate()
        {
            this.Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);

            if (!this.Visible)
                return;

            Graphics g2d = e.Graphics;
            g2d.SmoothingMode = SmoothingMode.AntiAlias;
            g2d.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

            using (SolidBrush bgBrush = new SolidBrush(_backgroundColor))
            {
                g2d.FillRoundedRectangle(bgBrush, 0, 0, this.Width, this.Height, 12);
            }

            DrawHeader(g2d);

            if (_isDropdownOpen)
            {
                DrawDropdown(g2d);
            }
            else
            {
                DrawEpisodes(g2d);

                if (_maxScrollOffset > 0)
                {
                    DrawScrollbar(g2d);
                }
            }

            using (Pen borderPen = new Pen(Color.FromArgb(100, 100, 100), BORDER_WIDTH))
            {
                g2d.DrawRectangle(borderPen, BORDER_WIDTH / 2, BORDER_WIDTH / 2,
                    this.Width - BORDER_WIDTH, this.Height - BORDER_WIDTH);
            }
        }

        private void DrawHeader(Graphics g2d)
        {
            _headerRect = new Rectangle(0, 0, this.Width, HEADER_HEIGHT);

            using (SolidBrush brush = new SolidBrush(_headerColor))
            {
                GraphicsPath path = new GraphicsPath();
                float radius = 12;
                float diameter = radius * 2;

                RectangleF arc = new RectangleF(_headerRect.X, _headerRect.Y, diameter, diameter);
                path.AddArc(arc, 180, 90);

                arc.X = _headerRect.X + _headerRect.Width - diameter;
                path.AddArc(arc, 270, 90);

                path.AddLine(_headerRect.Right, _headerRect.Y + radius, _headerRect.Right, _headerRect.Bottom);
                path.AddLine(_headerRect.Right, _headerRect.Bottom, _headerRect.X, _headerRect.Bottom);
                path.AddLine(_headerRect.X, _headerRect.Bottom, _headerRect.X, _headerRect.Y + radius);

                path.CloseFigure();

                g2d.FillPath(brush, path);
            }

            string headerText = _seasons.Count > 0 && _currentSeasonIndex < _seasons.Count
                ? _seasons[_currentSeasonIndex].Name
                : "Sélectionner une saison";

            using (Font font = new Font("Segoe UI", 13, FontStyle.Bold))
            using (SolidBrush brush = new SolidBrush(Color.White))
            {
                g2d.DrawString(headerText, font, brush, PADDING, (_headerRect.Height - font.Height) / 2);
            }

            int arrowSize = 15;
            int arrowX = this.Width - PADDING - arrowSize;
            int arrowY = HEADER_HEIGHT / 2;

            DrawArrow(g2d, arrowX, arrowY, arrowSize, _isDropdownOpen);
        }

        private void DrawArrow(Graphics g2d, int x, int y, int size, bool isOpen)
        {
            using (SolidBrush brush = new SolidBrush(_accentColor))
            {
                Point[] points;

                if (isOpen)
                {
                    points = new Point[]
                    {
                        new Point(x, y + size / 3),
                        new Point(x + size / 2, y - size / 3),
                        new Point(x + size, y + size / 3)
                    };
                }
                else
                {
                    points = new Point[]
                    {
                        new Point(x, y - size / 3),
                        new Point(x + size / 2, y + size / 3),
                        new Point(x + size, y - size / 3)
                    };
                }

                using (GraphicsPath path = new GraphicsPath())
                {
                    path.AddPolygon(points);
                    g2d.FillPath(brush, path);
                }
            }
        }

        private void DrawDropdown(Graphics g2d)
        {
            int maxDropdownHeight = MENU_HEIGHT - HEADER_HEIGHT - 10;
            int dropdownHeight = Math.Min(_seasons.Count * SEASON_ITEM_HEIGHT, maxDropdownHeight);

            _dropdownRect = new Rectangle(PADDING, HEADER_HEIGHT + 5, this.Width - PADDING * 2, dropdownHeight);

            using (SolidBrush brush = new SolidBrush(Color.FromArgb(40, 40, 40)))
            {
                g2d.FillRoundedRectangle(brush, _dropdownRect.X, _dropdownRect.Y, _dropdownRect.Width, _dropdownRect.Height, 8);
            }

            Rectangle clipRect = new Rectangle(_dropdownRect.X, _dropdownRect.Y, _dropdownRect.Width, _dropdownRect.Height);
            Region oldClip = g2d.Clip;
            g2d.SetClip(clipRect);

            for (int i = 0; i < _seasons.Count; i++)
            {
                int itemY = _dropdownRect.Y + i * SEASON_ITEM_HEIGHT - _dropdownScrollOffset;

                if (itemY + SEASON_ITEM_HEIGHT < _dropdownRect.Y || itemY > _dropdownRect.Bottom)
                    continue;

                bool isSelected = (i == _currentSeasonIndex);
                bool isHovered = (i == _hoveredSeasonIndex);

                Rectangle itemRect = new Rectangle(_dropdownRect.X + 5, itemY + 2, _dropdownRect.Width - 10, SEASON_ITEM_HEIGHT - 4);

                if (isSelected || isHovered)
                {
                    Color bgColor = isSelected ? Color.FromArgb(60, 60, 60) : _itemHoverColor;
                    using (SolidBrush brush = new SolidBrush(bgColor))
                    {
                        g2d.FillRoundedRectangle(brush, itemRect.X, itemRect.Y, itemRect.Width, itemRect.Height, 6);
                    }
                }

                Color textColor = isSelected ? _accentColor : Color.White;
                using (Font font = new Font("Segoe UI", 11, isSelected ? FontStyle.Bold : FontStyle.Regular))
                using (SolidBrush brush = new SolidBrush(textColor))
                {
                    g2d.DrawString(_seasons[i].Name, font, brush, itemRect.X + 15, itemRect.Y + (itemRect.Height - font.Height) / 2);
                }

                if (isSelected)
                {
                    int checkSize = 12;
                    int checkX = itemRect.Right - checkSize - 15;
                    int checkY = itemRect.Y + (itemRect.Height - checkSize) / 2;

                    using (Pen pen = new Pen(_accentColor, 2))
                    {
                        g2d.DrawLine(pen, checkX, checkY + checkSize / 2, checkX + checkSize / 3, checkY + checkSize);
                        g2d.DrawLine(pen, checkX + checkSize / 3, checkY + checkSize, checkX + checkSize, checkY);
                    }
                }
            }

            g2d.Clip = oldClip;

            if (_maxDropdownScrollOffset > 0)
            {
                int scrollbarWidth = 3;
                int scrollbarX = _dropdownRect.Right - scrollbarWidth - 3;
                int scrollbarY = _dropdownRect.Y + 3;
                int scrollbarHeight = _dropdownRect.Height - 6;

                using (SolidBrush brush = new SolidBrush(Color.FromArgb(60, 60, 60)))
                {
                    g2d.FillRectangle(brush, scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight);
                }

                float scrollRatio = (float)_dropdownScrollOffset / _maxDropdownScrollOffset;
                int handleHeight = Math.Max(15, (int)(scrollbarHeight * 0.3f));
                int handleY = scrollbarY + (int)((scrollbarHeight - handleHeight) * scrollRatio);

                using (SolidBrush brush = new SolidBrush(_accentColor))
                {
                    g2d.FillRectangle(brush, scrollbarX, handleY, scrollbarWidth, handleHeight);
                }
            }
        }

        private void DrawEpisodes(Graphics g2d)
        {
            if (_episodes.Count == 0)
            {
                using (Font font = new Font("Segoe UI", 12))
                using (SolidBrush brush = new SolidBrush(Color.FromArgb(150, 150, 150)))
                {
                    StringFormat sf = new StringFormat();
                    sf.Alignment = StringAlignment.Center;
                    sf.LineAlignment = StringAlignment.Center;

                    Rectangle textRect = new Rectangle(0, HEADER_HEIGHT, this.Width, this.Height - HEADER_HEIGHT);
                    g2d.DrawString("Aucun épisode disponible", font, brush, textRect, sf);
                }
                return;
            }

            _episodesRect = new Rectangle(PADDING, HEADER_HEIGHT + PADDING, this.Width - PADDING * 2, this.Height - HEADER_HEIGHT - PADDING * 2);

            Region originalClip = g2d.Clip.Clone();

            Rectangle clipRect = new Rectangle(_episodesRect.X, _episodesRect.Y, _episodesRect.Width, _episodesRect.Height);
            g2d.SetClip(clipRect, CombineMode.Intersect);

            for (int i = 0; i < _episodes.Count; i++)
            {
                int episodeY = _episodesRect.Y + i * (EPISODE_HEIGHT + EPISODE_SPACING) - _scrollOffset;

                if (episodeY + EPISODE_HEIGHT < _episodesRect.Y || episodeY > _episodesRect.Bottom)
                    continue;

                DrawEpisodeItem(g2d, _episodes[i], episodeY, i);
            }

            g2d.Clip = originalClip;
            originalClip.Dispose();
        }

        private void DrawEpisodeItem(Graphics g2d, EpisodeItem episode, int y, int index)
        {
            bool isHovered = (index == _hoveredEpisodeIndex);
            bool isCurrentlyPlaying = (episode.Id == _currentPlayingEpisodeId);

            Rectangle rect = new Rectangle(_episodesRect.X, y, _episodesRect.Width, EPISODE_HEIGHT);

            if (isHovered || isCurrentlyPlaying)
            {
                using (SolidBrush shadowBrush = new SolidBrush(Color.FromArgb(30, 0, 0, 0)))
                {
                    g2d.FillRoundedRectangle(shadowBrush, rect.X + 2, rect.Y + 2, rect.Width, rect.Height, 10);
                }
            }

            Color bgColor = isCurrentlyPlaying ? Color.FromArgb(50, 50, 50) :
                           isHovered ? _itemHoverColor : Color.FromArgb(40, 40, 40);

            using (SolidBrush brush = new SolidBrush(bgColor))
            {
                g2d.FillRoundedRectangle(brush, rect.X, rect.Y, rect.Width, rect.Height, 10);
            }

            if (isCurrentlyPlaying)
            {
                using (Pen pen = new Pen(_accentColor, 3))
                {
                    g2d.DrawRoundedRectangle(pen, rect.X + 2, rect.Y + 2, rect.Width - 4, rect.Height - 4, 10);
                }
            }
            else if (isHovered)
            {
                using (Pen pen = new Pen(_accentColor, 2))
                {
                    g2d.DrawRoundedRectangle(pen, rect.X + 1, rect.Y + 1, rect.Width - 2, rect.Height - 2, 10);
                }
            }

            int imageWidth = 200;
            int imageHeight = 112;
            int imageX = rect.X + 15;
            int imageY = rect.Y + (rect.Height - imageHeight) / 2;

            if (!string.IsNullOrEmpty(episode.ImageUrl))
            {
                DrawEpisodeImage(g2d, episode.ImageUrl, imageX, imageY, imageWidth, imageHeight);
            }
            else
            {
                using (SolidBrush brush = new SolidBrush(Color.FromArgb(60, 60, 60)))
                {
                    g2d.FillRoundedRectangle(brush, imageX, imageY, imageWidth, imageHeight, 8);
                }

                using (Font iconFont = new Font("Segoe UI", 24))
                using (SolidBrush iconBrush = new SolidBrush(Color.FromArgb(100, 100, 100)))
                {
                    StringFormat sf = new StringFormat();
                    sf.Alignment = StringAlignment.Center;
                    sf.LineAlignment = StringAlignment.Center;
                    g2d.DrawString("🎬", iconFont, iconBrush, new Rectangle(imageX, imageY, imageWidth, imageHeight), sf);
                }
            }

            int contentX = imageX + imageWidth + 20;
            int contentY = rect.Y + 18;
            int contentWidth = rect.Width - (contentX - rect.X) - 20;

            using (Font font = new Font("Segoe UI", 8, FontStyle.Bold))
            using (SolidBrush brush = new SolidBrush(_accentColor))
            {
                g2d.DrawString($"ÉPISODE {episode.EpisodeNumber}", font, brush, contentX, contentY);
            }

            contentY += 30;

            using (Font font = new Font("Segoe UI", 12, FontStyle.Bold))
            using (SolidBrush brush = new SolidBrush(Color.White))
            {
                string title = episode.Title;
                if (g2d.MeasureString(title, font).Width > contentWidth)
                {
                    while (g2d.MeasureString(title + "...", font).Width > contentWidth && title.Length > 10)
                    {
                        title = title.Substring(0, title.Length - 1);
                    }
                    title += "...";
                }
                g2d.DrawString(title, font, brush, contentX, contentY);
            }

            contentY += 30;

            using (Font font = new Font("Segoe UI", 9))
            using (SolidBrush brush = new SolidBrush(Color.FromArgb(160, 160, 160)))
            {
                string description = ""; //episode.Description ?? "";
                if (g2d.MeasureString(description, font).Width > contentWidth)
                {
                    while (g2d.MeasureString(description + "...", font).Width > contentWidth && description.Length > 20)
                    {
                        description = description.Substring(0, description.Length - 1);
                    }
                    description += "...";
                }
                g2d.DrawString(description, font, brush, contentX, contentY);
            }
            contentY += 22;

            using (Font font = new Font("Segoe UI", 9))
            using (SolidBrush brush = new SolidBrush(Color.FromArgb(180, 180, 180)))
            {
                string durationText = $"⏱ {episode.Duration}";
                if (isCurrentlyPlaying)
                {
                    durationText += "  •  ▶ En lecture";
                }
                g2d.DrawString(durationText, font, brush, contentX, contentY);
            }
        }

        private void DrawEpisodeImage(Graphics g2d, string imageUrl, int x, int y, int width, int height)
        {
            if (_imageCache.ContainsKey(imageUrl))
            {
                using (GraphicsPath path = GetRoundedRectanglePath(x, y, width, height, 8))
                {
                    Region currentClip = g2d.Clip.Clone();
                    g2d.SetClip(path, CombineMode.Intersect);
                    g2d.DrawImage(_imageCache[imageUrl], x, y, width, height);
                    g2d.Clip = currentClip;
                    currentClip.Dispose();
                }
                return;
            }

            Task.Run(async () =>
            {
                try
                {
                    byte[] imageBytes = await _httpClient.GetByteArrayAsync(imageUrl);

                    using (var skBitmap = SKBitmap.Decode(imageBytes))
                    {
                        if (skBitmap == null)
                        {
                            Console.WriteLine($"Impossible de décoder l'image: {imageUrl}");
                            return;
                        }

                        Bitmap bitmap = SKBitmapToBitmap(skBitmap);

                        if (!_imageCache.ContainsKey(imageUrl))
                        {
                            _imageCache[imageUrl] = bitmap;
                        }
                        else
                        {
                            bitmap.Dispose();
                        }

                        try
                        {
                            this.Invoke((Action)(() => RefreshImmediate()));
                        }
                        catch
                        {
                            // Window might be closed
                        }
                    }
                }
                catch (Exception ex)
                {
                    Console.WriteLine($"ERREUR chargement image {imageUrl}: {ex.Message}");
                }
            });

            using (SolidBrush brush = new SolidBrush(Color.FromArgb(60, 60, 60)))
            {
                g2d.FillRoundedRectangle(brush, x, y, width, height, 8);
            }
            using (Font font = new Font("Segoe UI", 9))
            using (SolidBrush brush = new SolidBrush(Color.FromArgb(120, 120, 120)))
            {
                StringFormat sf = new StringFormat();
                sf.Alignment = StringAlignment.Center;
                sf.LineAlignment = StringAlignment.Center;
                g2d.DrawString("Chargement...", font, brush, new Rectangle(x, y, width, height), sf);
            }
        }

        private Bitmap SKBitmapToBitmap(SKBitmap skBitmap)
        {
            Bitmap bitmap = new Bitmap(skBitmap.Width, skBitmap.Height, System.Drawing.Imaging.PixelFormat.Format32bppArgb);

            var bitmapData = bitmap.LockBits(
                new Rectangle(0, 0, bitmap.Width, bitmap.Height),
                System.Drawing.Imaging.ImageLockMode.WriteOnly,
                bitmap.PixelFormat);

            IntPtr pixelPtr = skBitmap.GetPixels();

            int bytes = bitmapData.Stride * bitmap.Height;
            byte[] rgbValues = new byte[bytes];
            Marshal.Copy(pixelPtr, rgbValues, 0, bytes);
            Marshal.Copy(rgbValues, 0, bitmapData.Scan0, bytes);

            bitmap.UnlockBits(bitmapData);

            return bitmap;
        }

        private GraphicsPath GetRoundedRectanglePath(float x, float y, float width, float height, float radius)
        {
            GraphicsPath path = new GraphicsPath();
            float diameter = radius * 2;

            RectangleF arc = new RectangleF(x, y, diameter, diameter);
            path.AddArc(arc, 180, 90);

            arc.X = x + width - diameter;
            path.AddArc(arc, 270, 90);

            arc.Y = y + height - diameter;
            path.AddArc(arc, 0, 90);

            arc.X = x;
            path.AddArc(arc, 90, 90);

            path.CloseFigure();
            return path;
        }

        private void DrawScrollbar(Graphics g2d)
        {
            int scrollbarWidth = 4;
            int scrollbarX = this.Width - scrollbarWidth - 5;
            int scrollbarY = HEADER_HEIGHT + PADDING;
            int scrollbarHeight = this.Height - HEADER_HEIGHT - PADDING * 2;

            using (SolidBrush brush = new SolidBrush(Color.FromArgb(48, 48, 48)))
            {
                g2d.FillRectangle(brush, scrollbarX, scrollbarY, scrollbarWidth, scrollbarHeight);
            }

            float scrollRatio = (float)_scrollOffset / _maxScrollOffset;
            int handleHeight = Math.Max(20, (int)(scrollbarHeight * 0.3f));
            int handleY = scrollbarY + (int)((scrollbarHeight - handleHeight) * scrollRatio);

            using (SolidBrush brush = new SolidBrush(_accentColor))
            {
                g2d.FillRectangle(brush, scrollbarX, handleY, scrollbarWidth, handleHeight);
            }
        }

        public class SeasonItem
        {
            public int Id { get; set; }
            public string Name { get; set; }

            public SeasonItem(int id, string name)
            {
                Id = id;
                Name = name;
            }
        }

        public class EpisodeItem
        {
            public int Id { get; set; }
            public int EpisodeNumber { get; set; }
            public string Title { get; set; }
            public string Description { get; set; }
            public string Duration { get; set; }
            public string Path { get; set; }
            public string ImageUrl { get; set; }

            public EpisodeItem(int id, int episodeNumber, string title, string description, string duration, string path, string imageUrl = "")
            {
                Id = id;
                EpisodeNumber = episodeNumber;
                Title = title;
                Description = description;
                Duration = duration;
                Path = path;
                ImageUrl = imageUrl;
            }
        }

        public interface ISeasonSelectionListener
        {
            void OnSeasonSelected(int seasonId);
            void OnEpisodeSelected(int seasonIndex, int episodeId, string episodePath, string episodeName);
        }
    }

    public static class GraphicsExtensionss
    {
        public static void FillRoundedRectangle(this Graphics g, Brush brush, float x, float y, float width, float height, float radius)
        {
            using (GraphicsPath path = GetRoundedRectanglePath(x, y, width, height, radius))
            {
                g.FillPath(brush, path);
            }
        }

        public static void DrawRoundedRectangle(this Graphics g, Pen pen, float x, float y, float width, float height, float radius)
        {
            using (GraphicsPath path = GetRoundedRectanglePath(x, y, width, height, radius))
            {
                g.DrawPath(pen, path);
            }
        }

        private static GraphicsPath GetRoundedRectanglePath(float x, float y, float width, float height, float radius)
        {
            GraphicsPath path = new GraphicsPath();
            float diameter = radius * 2;

            RectangleF arc = new RectangleF(x, y, diameter, diameter);
            path.AddArc(arc, 180, 90);

            arc.X = x + width - diameter;
            path.AddArc(arc, 270, 90);

            arc.Y = y + height - diameter;
            path.AddArc(arc, 0, 90);

            arc.X = x;
            path.AddArc(arc, 90, 90);

            path.CloseFigure();
            return path;
        }
    }
}
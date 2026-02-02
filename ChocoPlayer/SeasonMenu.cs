using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace ChocoPlayer
{
    public class SeasonsMenu : Panel
    {
        private List<SeasonItem> _seasons = new List<SeasonItem>();
        private List<EpisodeItem> _episodes = new List<EpisodeItem>();

        private const int MENU_WIDTH = 800;
        private const int MENU_HEIGHT = 600;
        private const int PADDING = 20;
        private const int HEADER_HEIGHT = 60;
        private const int EPISODE_HEIGHT = 80;
        private const int EPISODE_SPACING = 10;

        private ISeasonSelectionListener? _listener;
        private Color _accentColor = Color.FromArgb(255, 211, 1);
        private Color _backgroundColor = Color.FromArgb(230, 30, 30, 30);
        private Color _headerColor = Color.FromArgb(35, 35, 35);
        private Color _itemHoverColor = Color.FromArgb(48, 48, 48);

        private int _currentSeasonIndex = 0;
        private bool _isDropdownOpen = false;
        private int _hoveredSeasonIndex = -1;
        private int _hoveredEpisodeIndex = -1;

        private Rectangle _headerRect;
        private Rectangle _dropdownRect;
        private Rectangle _episodesRect;
        private int _scrollOffset = 0;
        private int _maxScrollOffset = 0;

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

        public void SetListener(ISeasonSelectionListener listener)
        {
            _listener = listener;
        }

        public void LoadSeasons(List<SeasonItem> seasons)
        {
            _seasons = seasons;
            if (_seasons.Count > 0)
            {
                _currentSeasonIndex = 0;
            }
            RefreshImmediate();
        }

        public void Toggle()
        {
            this.Visible = !this.Visible;
            if (this.Visible)
            {
                _isDropdownOpen = false;
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
            RefreshImmediate();
        }

        private void SeasonsMenu_MouseWheel(object? sender, MouseEventArgs e)
        {
            if (!this.Visible || _isDropdownOpen)
                return;

            _scrollOffset -= e.Delta / 3;
            _scrollOffset = Math.Max(0, Math.Min(_scrollOffset, _maxScrollOffset));
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
                int relativeY = e.Y - _dropdownRect.Y;
                int itemIndex = relativeY / 55;

                if (itemIndex >= 0 && itemIndex < _seasons.Count)
                {
                    _hoveredSeasonIndex = itemIndex;
                }
                this.Cursor = Cursors.Hand;
            }
            // Vérifier si on survole un épisode
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
                RefreshImmediate();
                return;
            }

            if (_isDropdownOpen && _dropdownRect.Contains(e.Location))
            {
                int relativeY = e.Y - _dropdownRect.Y;
                int itemIndex = relativeY / 55;

                if (itemIndex >= 0 && itemIndex < _seasons.Count && itemIndex != _currentSeasonIndex)
                {
                    _currentSeasonIndex = itemIndex;
                    _isDropdownOpen = false;

                    ClearEpisodes();

                    int seasonId = _seasons[itemIndex].Id;
                    Console.WriteLine($"[SeasonsMenu] Clic saison: index={itemIndex}, ID={seasonId}");
                    _listener?.OnSeasonSelected(seasonId);

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
                    _listener?.OnEpisodeSelected(_currentSeasonIndex, _episodes[itemIndex].Id, _episodes[itemIndex].Path);
                    RefreshImmediate();
                }
                return;
            }
        }

        private void RefreshImmediate()
        {
            this.Invalidate();
            this.Update();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);

            if (!this.Visible)
                return;

            Console.WriteLine($"[SeasonsMenu.OnPaint] _isDropdownOpen={_isDropdownOpen}, _episodes.Count={_episodes.Count}");

            Graphics g2d = e.Graphics;
            g2d.SmoothingMode = SmoothingMode.AntiAlias;
            g2d.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAlias;

            using (SolidBrush brush = new SolidBrush(_backgroundColor))
            {
                g2d.FillRectangle(brush, 0, 0, this.Width, this.Height);
            }

            DrawHeader(g2d);

            if (_isDropdownOpen)
            {
                Console.WriteLine($"[SeasonsMenu.OnPaint] Affichage du dropdown");
                DrawDropdown(g2d);
            }
            else
            {
                Console.WriteLine($"[SeasonsMenu.OnPaint] Affichage des épisodes");
                DrawEpisodes(g2d);
            }

            using (Pen pen = new Pen(Color.FromArgb(100, 100, 100), 2))
            {
                g2d.DrawRectangle(pen, 1, 1, this.Width - 2, this.Height - 2);
            }
        }

        private void DrawHeader(Graphics g2d)
        {
            _headerRect = new Rectangle(0, 0, this.Width, HEADER_HEIGHT);

            using (SolidBrush brush = new SolidBrush(_headerColor))
            {
                g2d.FillRectangle(brush, _headerRect);
            }

            int arrowSize = 15;
            int arrowX = this.Width - PADDING - arrowSize;
            int arrowY = HEADER_HEIGHT / 2;

            DrawArrow(g2d, arrowX, arrowY, arrowSize, _isDropdownOpen);

            if (_currentSeasonIndex >= 0 && _currentSeasonIndex < _seasons.Count)
            {
                using (Font font = new Font("Segoe UI", 14, FontStyle.Bold))
                using (SolidBrush brush = new SolidBrush(Color.White))
                {
                    string seasonText = _seasons[_currentSeasonIndex].Name;
                    SizeF textSize = g2d.MeasureString(seasonText, font);
                    int textY = (HEADER_HEIGHT - (int)textSize.Height) / 2;
                    g2d.DrawString(seasonText, font, brush, PADDING, textY);
                }
            }
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
            int maxItems = 7;
            int dropdownHeight = Math.Min(_seasons.Count, maxItems) * 55;
            _dropdownRect = new Rectangle(0, HEADER_HEIGHT + 5, this.Width, dropdownHeight);

            using (SolidBrush brush = new SolidBrush(Color.FromArgb(20, 20, 20)))
            {
                g2d.FillRectangle(brush, 0, HEADER_HEIGHT, this.Width, 5);
            }

            using (SolidBrush brush = new SolidBrush(_headerColor))
            {
                g2d.FillRectangle(brush, _dropdownRect);
            }

            for (int i = 0; i < Math.Min(_seasons.Count, maxItems); i++)
            {
                Rectangle itemRect = new Rectangle(
                    0,
                    HEADER_HEIGHT + 5 + i * 55,
                    this.Width,
                    55
                );

                bool isHovered = i == _hoveredSeasonIndex;

                if (isHovered)
                {
                    using (SolidBrush brush = new SolidBrush(_itemHoverColor))
                    {
                        g2d.FillRectangle(brush, itemRect);
                    }
                }

                using (Font font = new Font("Segoe UI", 13, FontStyle.Bold))
                using (SolidBrush brush = new SolidBrush(Color.White))
                {
                    SizeF textSize = g2d.MeasureString(_seasons[i].Name, font);
                    int textY = itemRect.Y + (itemRect.Height - (int)textSize.Height) / 2;
                    g2d.DrawString(_seasons[i].Name, font, brush, PADDING, textY);
                }
            }
        }

        private void DrawEpisodes(Graphics g2d)
        {
            _episodesRect = new Rectangle(
                0,
                HEADER_HEIGHT + PADDING,
                this.Width,
                this.Height - HEADER_HEIGHT - PADDING
            );

            g2d.SetClip(_episodesRect);

            int currentY = HEADER_HEIGHT + PADDING - _scrollOffset;

            for (int i = 0; i < _episodes.Count; i++)
            {
                var episode = _episodes[i];
                bool isHovered = i == _hoveredEpisodeIndex;

                Rectangle episodeRect = new Rectangle(
                    PADDING,
                    currentY,
                    this.Width - PADDING * 2,
                    EPISODE_HEIGHT
                );

                if (episodeRect.Bottom > HEADER_HEIGHT && episodeRect.Top < this.Height)
                {
                    DrawEpisode(g2d, episode, episodeRect, isHovered);
                }

                currentY += EPISODE_HEIGHT + EPISODE_SPACING;
            }

            g2d.ResetClip();

            if (_maxScrollOffset > 0)
            {
                DrawScrollbar(g2d);
            }
        }

        private void DrawEpisode(Graphics g2d, EpisodeItem episode, Rectangle rect, bool isHovered)
        {
            Color bgColor = isHovered ? _itemHoverColor : Color.FromArgb(40, 40, 40);
            using (SolidBrush brush = new SolidBrush(bgColor))
            {
                g2d.FillRoundedRectangle(brush, rect.X, rect.Y, rect.Width, rect.Height, 8);
            }

            if (isHovered)
            {
                using (Pen pen = new Pen(_accentColor, 2))
                {
                    g2d.DrawRoundedRectangle(pen, rect.X + 1, rect.Y + 1, rect.Width - 2, rect.Height - 2, 8);
                }
            }

            int contentX = rect.X + 15;
            int contentY = rect.Y + 10;

            using (Font font = new Font("Segoe UI", 11, FontStyle.Bold))
            using (SolidBrush brush = new SolidBrush(Color.White))
            {
                g2d.DrawString(episode.Title, font, brush, contentX, contentY);
            }

            contentY += 25;

            using (Font font = new Font("Segoe UI", 9))
            using (SolidBrush brush = new SolidBrush(Color.FromArgb(180, 180, 180)))
            {
                string description = episode.Description;
                int maxWidth = rect.Width - 30;

                if (g2d.MeasureString(description, font).Width > maxWidth)
                {
                    while (g2d.MeasureString(description + "...", font).Width > maxWidth && description.Length > 10)
                    {
                        description = description.Substring(0, description.Length - 1);
                    }
                    description += "...";
                }

                g2d.DrawString(description, font, brush, contentX, contentY);
            }

            using (Font font = new Font("Segoe UI", 8))
            using (SolidBrush brush = new SolidBrush(Color.FromArgb(150, 150, 150)))
            {
                SizeF textSize = g2d.MeasureString(episode.Duration, font);
                g2d.DrawString(episode.Duration, font, brush,
                    rect.Right - (int)textSize.Width - 15,
                    rect.Bottom - (int)textSize.Height - 10);
            }
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
            public string Title { get; set; }
            public string Description { get; set; }
            public string Duration { get; set; }
            public string Path { get; set; }

            public EpisodeItem(int id, string title, string description, string duration, string path)
            {
                Id = id;
                Title = title;
                Description = description;
                Duration = duration;
                Path = path;
            }
        }

        public interface ISeasonSelectionListener
        {
            void OnSeasonSelected(int seasonId);
            void OnEpisodeSelected(int seasonIndex, int episodeId, string episodePath);
        }
    }
}
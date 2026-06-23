using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Linq;
using System.Windows.Forms;

namespace ChocoPlayer
{
    public class TrackSettingsMenu : Panel
    {
        private List<TrackItem> _audioItems    = new List<TrackItem>();
        private List<TrackItem> _subtitleItems = new List<TrackItem>();

        private const int MENU_WIDTH    = 800;
        private const int MENU_HEIGHT   = 600;
        private const int PADDING       = 20;
        private const int COLUMN_SPACING = 20;
        private const int ITEM_HEIGHT   = 40;
        private const int ITEM_SPACING  = 8;
        private const int SCROLLBAR_W   = 5;

        private ITrackSelectionListener? _listener;
        private Color _accentColor       = Color.FromArgb(255, 211, 1);
        private Color _itemHoverColor    = Color.FromArgb(50, 255, 255, 255);
        private Color _itemSelectedColor = Color.FromArgb(80, 255, 211, 1);

        private int _hoveredItemId = -999;

        private int       _audioScrollOffset       = 0;
        private int       _subtitleScrollOffset    = 0;
        private int       _maxAudioScrollOffset    = 0;
        private int       _maxSubtitleScrollOffset = 0;
        private Rectangle _audioItemsRect          = Rectangle.Empty;
        private Rectangle _subtitleItemsRect       = Rectangle.Empty;

        private LinearGradientBrush? _brushBackground;
        private Size _lastSize = Size.Empty;

        private int   _sizeLevel  = 3;
        private float FontTitle   => _sizeLevel switch { 0 => 10f,  1 => 11f, 2 => 12f, _ => 13f };
        private float FontSection => _sizeLevel switch { 0 => 8f,   1 => 9f,  2 => 10f, _ => 11f };
        private float FontItem    => _sizeLevel switch { 0 => 7.5f, 1 => 8f,  2 => 9f,  _ => 10f };
        private int   ItemH       => _sizeLevel switch { 0 => 28,   1 => 32,  2 => 36,  _ => ITEM_HEIGHT };

        public TrackSettingsMenu()
        {
            this.BackColor    = Color.Transparent;
            this.Visible      = false;
            this.Size         = new Size(MENU_WIDTH, MENU_HEIGHT);
            this.DoubleBuffered = true;

            this.MouseDown  += TrackSettingsMenu_MouseDown;
            this.MouseMove  += TrackSettingsMenu_MouseMove;
            this.MouseLeave += TrackSettingsMenu_MouseLeave;
            this.MouseWheel += TrackSettingsMenu_MouseWheel;
        }

        public void SetListener(ITrackSelectionListener listener) => _listener = listener;

        public void Toggle()
        {
            this.Visible = !this.Visible;
            if (this.Visible)
            {
                _audioScrollOffset    = 0;
                _subtitleScrollOffset = 0;
                RefreshImmediate();
            }
        }

        public void SetPosition(int buttonX, int buttonY, bool isFullScreen, int windowWidth, int windowHeight, int topReserved = 0)
        {
            int menuW, menuH;
            if (windowWidth >= 1400)      { menuW = MENU_WIDTH; menuH = MENU_HEIGHT; _sizeLevel = 3; }
            else if (windowWidth >= 1000) { menuW = 640;        menuH = 520;         _sizeLevel = 2; }
            else if (windowWidth >= 500)  { menuW = 500;        menuH = 440;         _sizeLevel = 1; }
            else                          { menuW = 380;        menuH = 300;         _sizeLevel = 0; }

            int gap = Math.Clamp((buttonY - topReserved) / 35, 4, 20);
            menuH = Math.Min(menuH, Math.Max(80, buttonY - topReserved - gap));
            this.Size = new Size(menuW, menuH);

            int x = isFullScreen
                ? (buttonX - menuW) / 2
                : Math.Max(0, buttonX - menuW);

            this.SetBounds(x, buttonY - menuH - gap, menuW, menuH);
        }

        // ── mouse wheel ──────────────────────────────────────────────────────────

        private void TrackSettingsMenu_MouseWheel(object? sender, MouseEventArgs e)
        {
            if (!this.Visible) return;

            if (!_audioItemsRect.IsEmpty && _audioItemsRect.Contains(e.Location) && _maxAudioScrollOffset > 0)
            {
                _audioScrollOffset = Math.Clamp(_audioScrollOffset - e.Delta / 3, 0, _maxAudioScrollOffset);
                RefreshImmediate();
            }
            else if (!_subtitleItemsRect.IsEmpty && _subtitleItemsRect.Contains(e.Location) && _maxSubtitleScrollOffset > 0)
            {
                _subtitleScrollOffset = Math.Clamp(_subtitleScrollOffset - e.Delta / 3, 0, _maxSubtitleScrollOffset);
                RefreshImmediate();
            }
        }

        // ── mouse events ─────────────────────────────────────────────────────────

        private void TrackSettingsMenu_MouseMove(object? sender, MouseEventArgs e)
        {
            if (!this.Visible) return;

            int prevId = _hoveredItemId;
            _hoveredItemId = -999;

            if (_audioItemsRect.Contains(e.Location))
            {
                foreach (var item in _audioItems)
                {
                    int sy = item.Y - _audioScrollOffset;
                    if (e.X >= item.X && e.X <= item.X + item.Width && e.Y >= sy && e.Y < sy + item.Height)
                    {
                        _hoveredItemId = item.TrackId + 1000;
                        this.Cursor = Cursors.Hand;
                        break;
                    }
                }
            }

            if (_hoveredItemId == -999 && _subtitleItemsRect.Contains(e.Location))
            {
                foreach (var item in _subtitleItems)
                {
                    int sy = item.Y - _subtitleScrollOffset;
                    if (e.X >= item.X && e.X <= item.X + item.Width && e.Y >= sy && e.Y < sy + item.Height)
                    {
                        _hoveredItemId = item.TrackId + 2000;
                        this.Cursor = Cursors.Hand;
                        break;
                    }
                }
            }

            if (_hoveredItemId == -999) this.Cursor = Cursors.Default;
            if (prevId != _hoveredItemId) RefreshImmediate();
        }

        private void TrackSettingsMenu_MouseLeave(object? sender, EventArgs e)
        {
            if (_hoveredItemId != -999)
            {
                _hoveredItemId = -999;
                this.Cursor = Cursors.Default;
                RefreshImmediate();
            }
        }

        private void TrackSettingsMenu_MouseDown(object? sender, MouseEventArgs e)
        {
            if (!this.Visible) return;

            if (_audioItemsRect.Contains(e.Location))
            {
                foreach (var item in _audioItems)
                {
                    int sy = item.Y - _audioScrollOffset;
                    if (e.X >= item.X && e.X <= item.X + item.Width && e.Y >= sy && e.Y < sy + item.Height)
                    {
                        _listener?.OnAudioTrackSelected(item.TrackId);
                        RefreshImmediate();
                        return;
                    }
                }
            }

            if (_subtitleItemsRect.Contains(e.Location))
            {
                foreach (var item in _subtitleItems)
                {
                    int sy = item.Y - _subtitleScrollOffset;
                    if (e.X >= item.X && e.X <= item.X + item.Width && e.Y >= sy && e.Y < sy + item.Height)
                    {
                        _listener?.OnSubtitleTrackSelected(item.TrackId);
                        RefreshImmediate();
                        return;
                    }
                }
            }
        }

        private void RefreshImmediate()
        {
            this.Invalidate();
            this.Update();
        }

        // ── paint ─────────────────────────────────────────────────────────────────

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            if (!this.Visible) return;

            Graphics g2d = e.Graphics;
            g2d.SmoothingMode      = SmoothingMode.AntiAlias;
            g2d.TextRenderingHint  = System.Drawing.Text.TextRenderingHint.AntiAlias;

            if (this.Size != _lastSize && this.Width > 0 && this.Height > 0)
            {
                _brushBackground?.Dispose();
                _brushBackground = new LinearGradientBrush(
                    new Point(0, 0), new Point(0, this.Height),
                    Color.FromArgb(24, 24, 24), Color.FromArgb(10, 10, 10));
                _lastSize = this.Size;
            }
            if (_brushBackground != null)
                g2d.FillRectangle(_brushBackground, 0, 0, Width, Height);

            using (Pen pen = new Pen(Color.FromArgb(55, 255, 255, 255), 1))
                g2d.DrawRectangle(pen, 1, 1, this.Width - 2, this.Height - 2);

            using (var ab = new SolidBrush(_accentColor))
                g2d.FillRectangle(ab, 0, 0, this.Width, 3);

            _audioItems.Clear();
            _subtitleItems.Clear();

            int currentY = PADDING;
            using (Font tf = new Font("Segoe UI", FontTitle, FontStyle.Bold))
            using (SolidBrush b = new SolidBrush(Color.White))
                g2d.DrawString(Locale.Get("track.title"), tf, b, PADDING, currentY);

            currentY += 50;

            using (Pen sep = new Pen(Color.FromArgb(40, 255, 255, 255), 1))
                g2d.DrawLine(sep, PADDING, currentY, this.Width - PADDING, currentY);

            currentY += 18;

            int colW  = (this.Width - 3 * PADDING - COLUMN_SPACING) / 2;
            int leftX = PADDING;
            int rightX = PADDING + colW + COLUMN_SPACING;

            int sepX = leftX + colW + COLUMN_SPACING / 2;
            using (Pen pen = new Pen(Color.FromArgb(40, 255, 255, 255), 1))
                g2d.DrawLine(pen, sepX, currentY, sepX, this.Height - PADDING);

            DrawAudioSection(g2d, leftX, currentY, colW);
            DrawSubtitleSection(g2d, rightX, currentY, colW);
        }

        // ── section drawing ───────────────────────────────────────────────────────

        private void DrawSectionHeader(Graphics g2d, int x, int y, int width, string label)
        {
            using (var b = new SolidBrush(_accentColor))
                g2d.FillRectangle(b, x, y + 4, 3, 14);

            using (Font f = new Font("Segoe UI", FontSection, FontStyle.Bold))
            using (SolidBrush b = new SolidBrush(Color.White))
                g2d.DrawString(label, f, b, x + 10, y);
        }

        private void DrawAudioSection(Graphics g2d, int startX, int startY, int width)
        {
            DrawSectionHeader(g2d, startX, startY, width, Locale.Get("track.audio"));

            int itemsTop = startY + 38;
            int itemsH   = Math.Max(0, this.Height - PADDING - itemsTop);
            _audioItemsRect = new Rectangle(startX, itemsTop, width, itemsH);

            var audioTracks       = Player.GetAudioTracks();
            int currentAudioTrack = Player.GetCurrentAudioTrack();

            if (audioTracks.Count == 0)
            {
                using (Font f = new Font("Segoe UI", FontItem))
                using (SolidBrush b = new SolidBrush(Color.FromArgb(150, 150, 150)))
                    g2d.DrawString(Locale.Get("track.no_audio"), f, b, startX + 5, itemsTop);
                _maxAudioScrollOffset = 0;
                return;
            }

            int totalH = audioTracks.Count * (ItemH + ITEM_SPACING) - ITEM_SPACING;
            _maxAudioScrollOffset = Math.Max(0, totalH - itemsH);
            _audioScrollOffset    = Math.Clamp(_audioScrollOffset, 0, _maxAudioScrollOffset);

            bool hasScroll = _maxAudioScrollOffset > 0;
            int  drawW     = hasScroll ? width - SCROLLBAR_W : width;
            int  logicalY  = itemsTop;

            Region oldClip = g2d.Clip.Clone();
            g2d.SetClip(new Rectangle(startX, itemsTop, width, itemsH), CombineMode.Intersect);

            foreach (var track in audioTracks)
            {
                bool isSelected = track.Id == currentAudioTrack;
                bool isHovered  = _hoveredItemId == track.Id + 1000;
                int  drawY      = logicalY - _audioScrollOffset;

                logicalY = DrawModernTrackItem(g2d, track, startX, logicalY, drawY, drawW,
                    isSelected, isHovered, true);
                logicalY += ITEM_SPACING;
            }

            g2d.Clip = oldClip;
            oldClip.Dispose();

            if (hasScroll)
                DrawColumnScrollbar(g2d, startX + width - SCROLLBAR_W + 1, itemsTop, itemsH,
                    _audioScrollOffset, _maxAudioScrollOffset);
        }

        private void DrawSubtitleSection(Graphics g2d, int startX, int startY, int width)
        {
            DrawSectionHeader(g2d, startX, startY, width, Locale.Get("track.subtitles"));

            int itemsTop = startY + 38;
            int itemsH   = Math.Max(0, this.Height - PADDING - itemsTop);
            _subtitleItemsRect = new Rectangle(startX, itemsTop, width, itemsH);

            var subtitleTracks  = Player.GetSubtitleTracks();
            int currentSubTrack = Player.GetCurrentSubtitleTrack();

            bool showNoTracks   = subtitleTracks.Count == 0 || subtitleTracks.Count == 1;
            int  realTrackCount = showNoTracks ? 0 : subtitleTracks.Count(t => t.Id != -1);
            int  trackCount     = 1 + realTrackCount; // Disable + real tracks
            int  totalH         = trackCount * (ItemH + ITEM_SPACING) - ITEM_SPACING;
            _maxSubtitleScrollOffset = Math.Max(0, totalH - itemsH);
            _subtitleScrollOffset    = Math.Clamp(_subtitleScrollOffset, 0, _maxSubtitleScrollOffset);

            bool hasScroll = _maxSubtitleScrollOffset > 0;
            int  drawW     = hasScroll ? width - SCROLLBAR_W : width;
            int  logicalY  = itemsTop;

            Region oldClip = g2d.Clip.Clone();
            g2d.SetClip(new Rectangle(startX, itemsTop, width, itemsH), CombineMode.Intersect);

            bool isDisabled       = currentSubTrack == -1;
            bool isHoveredDisable = _hoveredItemId == -1 + 2000;
            int  drawY            = logicalY - _subtitleScrollOffset;

            logicalY = DrawModernTrackItem(g2d,
                new TrackInfo(-1, Locale.Get("track.disable")),
                startX, logicalY, drawY, drawW, isDisabled, isHoveredDisable, false);
            logicalY += ITEM_SPACING;

            if (showNoTracks)
            {
                int labelY = logicalY - _subtitleScrollOffset;
                using (Font f = new Font("Segoe UI", FontItem))
                using (SolidBrush b = new SolidBrush(Color.FromArgb(150, 150, 150)))
                    g2d.DrawString(Locale.Get("track.no_subtitles"), f, b, startX + 5, labelY);
            }
            else
            {
                foreach (var track in subtitleTracks)
                {
                    if (track.Id == -1) continue;

                    bool isSelected = track.Id == currentSubTrack;
                    bool isHovered  = _hoveredItemId == track.Id + 2000;
                    drawY = logicalY - _subtitleScrollOffset;

                    logicalY = DrawModernTrackItem(g2d, track, startX, logicalY, drawY, drawW,
                        isSelected, isHovered, false);
                    logicalY += ITEM_SPACING;
                }
            }

            g2d.Clip = oldClip;
            oldClip.Dispose();

            if (hasScroll)
                DrawColumnScrollbar(g2d, startX + width - SCROLLBAR_W + 1, itemsTop, itemsH,
                    _subtitleScrollOffset, _maxSubtitleScrollOffset);
        }

        // ── scrollbar ────────────────────────────────────────────────────────────

        private void DrawColumnScrollbar(Graphics g, int x, int top, int height, int scrollOffset, int maxScroll)
        {
            using (SolidBrush track = new SolidBrush(Color.FromArgb(40, 40, 40)))
                g.FillRectangle(track, x, top + 2, 3, height - 4);

            float ratio   = (float)scrollOffset / maxScroll;
            int   handleH = Math.Max(16, (int)(height * 0.3f));
            int   handleY = top + 2 + (int)((height - 4 - handleH) * ratio);

            using (SolidBrush handle = new SolidBrush(_accentColor))
                g.FillRectangle(handle, x, handleY, 3, handleH);
        }

        // ── item drawing ─────────────────────────────────────────────────────────

        // logicalY = position in scroll space (used for hit-testing)
        // drawY    = actual screen Y (logicalY - scrollOffset)
        private int DrawModernTrackItem(Graphics g2d, TrackInfo track,
            int startX, int logicalY, int drawY, int width,
            bool isSelected, bool isHovered, bool isAudio)
        {
            Color bg = Color.Transparent;
            if (isSelected) bg = _itemSelectedColor;
            else if (isHovered) bg = _itemHoverColor;

            if (bg != Color.Transparent)
            {
                using (SolidBrush b = new SolidBrush(bg))
                    g2d.FillRoundedRectangle(b, startX, drawY, width, ItemH, 8);
            }

            if (isSelected)
            {
                using (Pen p = new Pen(_accentColor, 2))
                    g2d.DrawRoundedRectangle(p, startX + 1, drawY + 1, width - 2, ItemH - 2, 8);
            }

            int iconX = startX + 12;
            int iconY = drawY + ItemH / 2;

            if (isSelected)
            {
                using (SolidBrush b = new SolidBrush(_accentColor))
                {
                    g2d.FillEllipse(b, iconX - 6, iconY - 6, 12, 12);
                    Point[] ck = { new Point(iconX - 3, iconY), new Point(iconX - 1, iconY + 2), new Point(iconX + 3, iconY - 2) };
                    using (Pen cp = new Pen(Color.FromArgb(30, 30, 30), 2))
                        g2d.DrawLines(cp, ck);
                }
            }
            else
            {
                using (Pen p = new Pen(Color.FromArgb(120, 120, 120), 2))
                    g2d.DrawEllipse(p, iconX - 6, iconY - 6, 12, 12);
            }

            int textX = iconX + 20;
            int maxTW = width - (textX - startX) - 10;

            using (Font f = new Font("Segoe UI", FontItem, isSelected ? FontStyle.Bold : FontStyle.Regular))
            using (SolidBrush b = new SolidBrush(isSelected ? Color.White : Color.FromArgb(220, 220, 220)))
            using (StringFormat sf = new StringFormat { Trimming = StringTrimming.EllipsisCharacter, FormatFlags = StringFormatFlags.NoWrap })
            {
                int textY = drawY + (ItemH - f.Height) / 2;
                g2d.DrawString(track.Name, f, b, new RectangleF(textX, textY, maxTW, f.Height + 4), sf);
            }

            if (isAudio) _audioItems.Add(new TrackItem(track.Id, startX, logicalY, width, ItemH));
            else         _subtitleItems.Add(new TrackItem(track.Id, startX, logicalY, width, ItemH));

            return logicalY + ItemH;
        }

        // ── inner types ───────────────────────────────────────────────────────────

        private class TrackItem
        {
            public int TrackId { get; }
            public int X       { get; }
            public int Y       { get; }
            public int Width   { get; }
            public int Height  { get; }

            public TrackItem(int trackId, int x, int y, int width, int height)
            { TrackId = trackId; X = x; Y = y; Width = width; Height = height; }
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing) _brushBackground?.Dispose();
            base.Dispose(disposing);
        }

        public interface ITrackSelectionListener
        {
            void OnAudioTrackSelected(int trackId);
            void OnSubtitleTrackSelected(int trackId);
        }
    }
}

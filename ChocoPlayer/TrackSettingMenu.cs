using System;
using System.Collections.Generic;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace ChocoPlayer
{
    public class TrackSettingsMenu : Panel
    {
        private List<TrackItem> _audioItems = new List<TrackItem>();
        private List<TrackItem> _subtitleItems = new List<TrackItem>();

        private const int MENU_WIDTH = 800;
        private const int MENU_HEIGHT = 600;
        private const int PADDING = 20;
        private const int COLUMN_SPACING = 20;
        private const int ITEM_HEIGHT = 40;
        private const int ITEM_SPACING = 8;

        private ITrackSelectionListener? _listener;
        private Color _accentColor = Color.FromArgb(255, 211, 1);
        private Color _backgroundColor = Color.FromArgb(230, 30, 30, 30);
        private Color _itemHoverColor = Color.FromArgb(50, 255, 255, 255);
        private Color _itemSelectedColor = Color.FromArgb(80, 255, 211, 1);

        private int _hoveredItemId = -999;

        public TrackSettingsMenu()
        {
            this.BackColor = Color.Transparent;
            this.Visible = false;
            this.Size = new Size(MENU_WIDTH, MENU_HEIGHT);
            this.DoubleBuffered = true;

            this.MouseDown += TrackSettingsMenu_MouseDown;
            this.MouseMove += TrackSettingsMenu_MouseMove;
            this.MouseLeave += TrackSettingsMenu_MouseLeave;
        }

        public void SetListener(ITrackSelectionListener listener)
        {
            _listener = listener;
        }

        public void Toggle()
        {
            this.Visible = !this.Visible;
            if (this.Visible)
            {
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

        private void TrackSettingsMenu_MouseMove(object? sender, MouseEventArgs e)
        {
            if (!this.Visible)
                return;

            int previousHoveredId = _hoveredItemId;
            _hoveredItemId = -999;

            foreach (var item in _audioItems)
            {
                if (e.X >= item.X && e.X <= item.X + item.Width &&
                    e.Y >= item.Y && e.Y <= item.Y + item.Height)
                {
                    _hoveredItemId = item.TrackId + 1000;
                    this.Cursor = Cursors.Hand;
                    break;
                }
            }

            if (_hoveredItemId == -999)
            {
                foreach (var item in _subtitleItems)
                {
                    if (e.X >= item.X && e.X <= item.X + item.Width &&
                        e.Y >= item.Y && e.Y <= item.Y + item.Height)
                    {
                        _hoveredItemId = item.TrackId + 2000;
                        this.Cursor = Cursors.Hand;
                        break;
                    }
                }
            }

            if (_hoveredItemId == -999)
            {
                this.Cursor = Cursors.Default;
            }

            if (previousHoveredId != _hoveredItemId)
            {
                RefreshImmediate();
            }
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
            if (!this.Visible)
                return;

            foreach (var item in _audioItems)
            {
                if (e.X >= item.X && e.X <= item.X + item.Width &&
                    e.Y >= item.Y && e.Y <= item.Y + item.Height)
                {
                    _listener?.OnAudioTrackSelected(item.TrackId);
                    RefreshImmediate();
                    return;
                }
            }

            foreach (var item in _subtitleItems)
            {
                if (e.X >= item.X && e.X <= item.X + item.Width &&
                    e.Y >= item.Y && e.Y <= item.Y + item.Height)
                {
                    _listener?.OnSubtitleTrackSelected(item.TrackId);
                    RefreshImmediate();
                    return;
                }
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

            Graphics g2d = e.Graphics;
            g2d.SmoothingMode = SmoothingMode.AntiAlias;
            g2d.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAlias;

            // Fond avec bordure arrondie et bord d'accentuation en haut
            using (var bgBrush = new SolidBrush(_backgroundColor))
            using (var bgPath = new System.Drawing.Drawing2D.GraphicsPath())
            {
                int r = 10;
                bgPath.AddArc(0, 0, r * 2, r * 2, 180, 90);
                bgPath.AddArc(Width - r * 2, 0, r * 2, r * 2, 270, 90);
                bgPath.AddArc(Width - r * 2, Height - r * 2, r * 2, r * 2, 0, 90);
                bgPath.AddArc(0, Height - r * 2, r * 2, r * 2, 90, 90);
                bgPath.CloseFigure();
                g2d.FillPath(bgBrush, bgPath);
            }

            // Bordure subtile
            using (Pen pen = new Pen(Color.FromArgb(55, 255, 255, 255), 1))
                g2d.DrawRoundedRectangle(pen, 1, 1, this.Width - 2, this.Height - 2, 10);

            // Bande d'accent en haut (3px jaune)
            using (var accentBrush = new SolidBrush(_accentColor))
                g2d.FillRoundedRectangle(accentBrush, 0, 0, this.Width, 3, 3);

            _audioItems.Clear();
            _subtitleItems.Clear();

            int currentY = PADDING;
            using (Font titleFont = new Font("Segoe UI", 13, FontStyle.Bold))
            using (SolidBrush brush = new SolidBrush(Color.White))
                g2d.DrawString("Paramètres de lecture", titleFont, brush, PADDING, currentY);

            currentY += 50;

            // Ligne séparatrice sous le titre
            using (Pen sep = new Pen(Color.FromArgb(40, 255, 255, 255), 1))
                g2d.DrawLine(sep, PADDING, currentY, this.Width - PADDING, currentY);

            currentY += 18;

            int columnWidth  = (this.Width - 3 * PADDING - COLUMN_SPACING) / 2;
            int leftColumnX  = PADDING;
            int rightColumnX = PADDING + columnWidth + COLUMN_SPACING;

            // Séparateur vertical central
            int separatorX = leftColumnX + columnWidth + (COLUMN_SPACING / 2);
            using (Pen pen = new Pen(Color.FromArgb(40, 255, 255, 255), 1))
                g2d.DrawLine(pen, separatorX, currentY, separatorX, this.Height - PADDING);

            DrawAudioSection(g2d, leftColumnX, currentY, columnWidth);
            DrawSubtitleSection(g2d, rightColumnX, currentY, columnWidth);
        }

        private void DrawSectionHeader(Graphics g2d, int x, int y, int width, string label)
        {
            // Petite pastille jaune + texte
            using (var brush = new SolidBrush(_accentColor))
                g2d.FillRectangle(brush, x, y + 4, 3, 14);

            using (Font font = new Font("Segoe UI", 11, FontStyle.Bold))
            using (SolidBrush brush = new SolidBrush(Color.White))
                g2d.DrawString(label, font, brush, x + 10, y);
        }

        private void DrawAudioSection(Graphics g2d, int startX, int startY, int width)
        {
            int currentY = startY;

            DrawSectionHeader(g2d, startX, currentY, width, "Pistes Audio");
            currentY += 38;

            var audioTracks = Player.GetAudioTracks();
            int currentAudioTrack = Player.GetCurrentAudioTrack();

            if (audioTracks.Count == 0)
            {
                using (Font font = new Font("Segoe UI", 10))
                using (SolidBrush brush = new SolidBrush(Color.FromArgb(150, 150, 150)))
                {
                    g2d.DrawString("Aucune piste disponible", font, brush, startX + 5, currentY);
                }
            }
            else
            {
                foreach (var track in audioTracks)
                {
                    bool isSelected = track.Id == currentAudioTrack;
                    bool isHovered = _hoveredItemId == track.Id + 1000;

                    currentY = DrawModernTrackItem(g2d, track, startX, currentY, width,
                        isSelected, isHovered, true);
                    currentY += ITEM_SPACING;
                }
            }
        }

        private void DrawSubtitleSection(Graphics g2d, int startX, int startY, int width)
        {
            int currentY = startY;

            DrawSectionHeader(g2d, startX, currentY, width, "Sous-titres");
            currentY += 38;

            var subtitleTracks = Player.GetSubtitleTracks();
            int currentSubTrack = Player.GetCurrentSubtitleTrack();

            bool isDisabled = currentSubTrack == -1;
            bool isHoveredDisable = _hoveredItemId == -1 + 2000;

            currentY = DrawModernTrackItem(g2d,
                new TrackInfo(-1, "Désactiver"),
                startX, currentY, width, isDisabled, isHoveredDisable, false);

            //_subtitleItems.Add(new TrackItem(-1, startX, currentY - ITEM_HEIGHT, width, ITEM_HEIGHT));
            currentY += ITEM_SPACING;

            if (subtitleTracks.Count == 0 || subtitleTracks.Count == 1)
            {
                using (Font font = new Font("Segoe UI", 10))
                using (SolidBrush brush = new SolidBrush(Color.FromArgb(150, 150, 150)))
                {
                    g2d.DrawString("Aucun sous-titre disponible", font, brush, startX + 5, currentY);
                }
            }
            else
            {
                foreach (var track in subtitleTracks)
                {
                    if (track.Id == -1)
                        continue;

                    bool isSelected = track.Id == currentSubTrack;
                    bool isHovered = _hoveredItemId == track.Id + 2000;

                    currentY = DrawModernTrackItem(g2d, track, startX, currentY, width,
                        isSelected, isHovered, false);
                    currentY += ITEM_SPACING;
                }
            }
        }

        private int DrawModernTrackItem(Graphics g2d, TrackInfo track,
            int startX, int currentY, int width, bool isSelected, bool isHovered, bool isAudio)
        {
            int itemY = currentY;

            Color backgroundColor = Color.Transparent;
            if (isSelected)
                backgroundColor = _itemSelectedColor;
            else if (isHovered)
                backgroundColor = _itemHoverColor;

            if (backgroundColor != Color.Transparent)
            {
                using (SolidBrush brush = new SolidBrush(backgroundColor))
                {
                    g2d.FillRoundedRectangle(brush, startX, itemY, width, ITEM_HEIGHT, 8);
                }
            }

            if (isSelected)
            {
                using (Pen pen = new Pen(_accentColor, 2))
                {
                    g2d.DrawRoundedRectangle(pen, startX + 1, itemY + 1, width - 2, ITEM_HEIGHT - 2, 8);
                }
            }

            int iconX = startX + 12;
            int iconY = itemY + (ITEM_HEIGHT / 2);

            if (isSelected)
            {
                using (SolidBrush brush = new SolidBrush(_accentColor))
                {
                    g2d.FillEllipse(brush, iconX - 6, iconY - 6, 12, 12);

                    Point[] checkPoints = new Point[]
                    {
                        new Point(iconX - 3, iconY),
                        new Point(iconX - 1, iconY + 2),
                        new Point(iconX + 3, iconY - 2)
                    };
                    using (Pen checkPen = new Pen(Color.FromArgb(30, 30, 30), 2))
                    {
                        g2d.DrawLines(checkPen, checkPoints);
                    }
                }
            }
            else
            {
                using (Pen pen = new Pen(Color.FromArgb(120, 120, 120), 2))
                {
                    g2d.DrawEllipse(pen, iconX - 6, iconY - 6, 12, 12);
                }
            }

            int textX = iconX + 20;
            int maxTextWidth = width - (textX - startX) - 10;

            using (Font font = new Font("Segoe UI", 10, isSelected ? FontStyle.Bold : FontStyle.Regular))
            using (SolidBrush brush = new SolidBrush(isSelected ? Color.White : Color.FromArgb(220, 220, 220)))
            using (StringFormat sf = new StringFormat { Trimming = StringTrimming.EllipsisCharacter, FormatFlags = StringFormatFlags.NoWrap })
            {
                int textY = itemY + (ITEM_HEIGHT - font.Height) / 2;
                g2d.DrawString(track.Name, font, brush, new RectangleF(textX, textY, maxTextWidth, font.Height + 4), sf);
            }

            if (isAudio)
            {
                _audioItems.Add(new TrackItem(track.Id, startX, itemY, width, ITEM_HEIGHT));
            }
            else
            {
                _subtitleItems.Add(new TrackItem(track.Id, startX, itemY, width, ITEM_HEIGHT));
            }

            return currentY + ITEM_HEIGHT;
        }

        private class TrackItem
        {
            public int TrackId { get; set; }
            public int X { get; set; }
            public int Y { get; set; }
            public int Width { get; set; }
            public int Height { get; set; }

            public TrackItem(int trackId, int x, int y, int width, int height)
            {
                TrackId = trackId;
                X = x;
                Y = y;
                Width = width;
                Height = height;
            }
        }

        public interface ITrackSelectionListener
        {
            void OnAudioTrackSelected(int trackId);
            void OnSubtitleTrackSelected(int trackId);
        }
    }
}
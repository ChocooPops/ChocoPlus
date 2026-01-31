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

        private const int MENU_WIDTH = 500;
        private const int MENU_HEIGHT = 300;
        private const int PADDING = 25;
        private const int ITEM_HEIGHT = 25;
        private const int COLUMN_WIDTH = (MENU_WIDTH - 3 * PADDING) / 2;

        private ITrackSelectionListener? _listener;

        public TrackSettingsMenu()
        {
            this.BackColor = Color.Transparent;
            this.Visible = false;
            this.Size = new Size(MENU_WIDTH, MENU_HEIGHT);
            this.DoubleBuffered = true;

            this.MouseDown += TrackSettingsMenu_MouseDown;
            this.MouseEnter += (s, e) => this.Cursor = Cursors.Hand;
            this.MouseLeave += (s, e) => this.Cursor = Cursors.Default;
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
                this.Invalidate();
            }
        }

        public void SetPosition(int buttonX, int buttonY, int gap)
        {
            this.SetBounds(buttonX - MENU_WIDTH, buttonY - MENU_HEIGHT - gap - 5, MENU_WIDTH, MENU_HEIGHT);
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
                    return;
                }
            }

            foreach (var item in _subtitleItems)
            {
                if (e.X >= item.X && e.X <= item.X + item.Width &&
                    e.Y >= item.Y && e.Y <= item.Y + item.Height)
                {
                    _listener?.OnSubtitleTrackSelected(item.TrackId);
                    return;
                }
            }
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);

            if (!this.Visible)
                return;

            Graphics g2d = e.Graphics;
            g2d.SmoothingMode = SmoothingMode.AntiAlias;
            g2d.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAlias;

            // Fond semi-transparent
            using (SolidBrush brush = new SolidBrush(Color.FromArgb(240, 50, 50, 50)))
            {
                g2d.FillRectangle(brush, 0, 0, this.Width, this.Height);
            }

            // Bordure
            using (Pen pen = new Pen(Color.FromArgb(100, 100, 100), 2))
            {
                g2d.DrawRectangle(pen, 0, 0, this.Width - 1, this.Height - 1);
            }

            _audioItems.Clear();
            _subtitleItems.Clear();

            // Séparateur vertical
            int separatorX = this.Width / 2;
            using (Pen pen = new Pen(Color.FromArgb(100, 100, 100)))
            {
                g2d.DrawLine(pen, separatorX, PADDING, separatorX, this.Height - PADDING);
            }

            DrawAudioSection(g2d, PADDING, PADDING, COLUMN_WIDTH);
            DrawSubtitleSection(g2d, separatorX + PADDING, PADDING, COLUMN_WIDTH);
        }

        private void DrawAudioSection(Graphics g2d, int startX, int startY, int columnWidth)
        {
            int currentY = startY;

            using (Font font = new Font("SansSerif", 13, FontStyle.Bold))
            using (SolidBrush brush = new SolidBrush(Color.White))
            {
                g2d.DrawString("Pistes Audio", font, brush, startX, currentY);
            }
            currentY += 20;

            var audioTracks = Player.GetAudioTracks();
            int currentAudioTrack = Player.GetCurrentAudioTrack();

            using (Font font = new Font("SansSerif", 12))
            {
                if (audioTracks.Count == 0)
                {
                    using (SolidBrush brush = new SolidBrush(Color.LightGray))
                    {
                        g2d.DrawString("Aucune piste", font, brush, startX, currentY);
                    }
                }
                else
                {
                    foreach (var track in audioTracks)
                    {
                        currentY = DrawTrackItem(g2d, track, startX, currentY, columnWidth,
                            track.Id == currentAudioTrack, true);
                    }
                }
            }
        }

        private void DrawSubtitleSection(Graphics g2d, int startX, int startY, int columnWidth)
        {
            int currentY = startY;

            using (Font font = new Font("SansSerif", 13, FontStyle.Bold))
            using (SolidBrush brush = new SolidBrush(Color.White))
            {
                g2d.DrawString("Sous-titres", font, brush, startX, currentY);
            }
            currentY += 20;

            using (Font font = new Font("SansSerif", 12))
            {
                var subtitleTracks = Player.GetSubtitleTracks();
                int currentSubTrack = Player.GetCurrentSubtitleTrack();

                bool isDisabled = currentSubTrack == -1;
                if (isDisabled)
                {
                    using (SolidBrush brush = new SolidBrush(Color.FromArgb(80, 80, 80)))
                    {
                        g2d.FillRoundedRectangle(brush, startX, currentY - 15, columnWidth, ITEM_HEIGHT, 5);
                    }
                }

                using (SolidBrush brush = new SolidBrush(Color.White))
                {
                    g2d.DrawString((isDisabled ? "✓ " : "  ") + "Désactiver", font, brush, startX + 5, currentY);
                }
                _subtitleItems.Add(new TrackItem(-1, startX, currentY - 15, columnWidth, ITEM_HEIGHT));
                currentY += ITEM_HEIGHT;

                if (subtitleTracks.Count == 0 || subtitleTracks.Count == 1)
                {
                    using (SolidBrush brush = new SolidBrush(Color.LightGray))
                    {
                        g2d.DrawString("Aucun sous-titre", font, brush, startX, currentY);
                    }
                }
                else
                {
                    foreach (var track in subtitleTracks)
                    {
                        if (track.Id == -1)
                            continue;

                        currentY = DrawTrackItem(g2d, track, startX, currentY, columnWidth,
                            track.Id == currentSubTrack, false);
                    }
                }
            }
        }

        private int DrawTrackItem(Graphics g2d, TrackInfo track,
            int startX, int currentY, int columnWidth, bool isSelected, bool isAudio)
        {
            if (isSelected)
            {
                using (SolidBrush brush = new SolidBrush(Color.FromArgb(80, 80, 80)))
                {
                    g2d.FillRoundedRectangle(brush, startX, currentY - 15, columnWidth, ITEM_HEIGHT, 5);
                }
            }

            string text = (isSelected ? "✓ " : "  ") + track.Name;

            using (Font font = new Font("SansSerif", 12))
            using (SolidBrush brush = new SolidBrush(Color.White))
            {
                int textWidth = (int)g2d.MeasureString(text, font).Width;
                if (textWidth > columnWidth - 10)
                {
                    while (textWidth > columnWidth - 20 && text.Length > 3)
                    {
                        text = text.Substring(0, text.Length - 1);
                        textWidth = (int)g2d.MeasureString(text + "...", font).Width;
                    }
                    text += "...";
                }

                g2d.DrawString(text, font, brush, startX + 5, currentY);
            }

            if (isAudio)
            {
                _audioItems.Add(new TrackItem(track.Id, startX, currentY - 15, columnWidth, ITEM_HEIGHT));
            }
            else
            {
                _subtitleItems.Add(new TrackItem(track.Id, startX, currentY - 15, columnWidth, ITEM_HEIGHT));
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
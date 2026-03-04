using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace ChocoPlayer
{
    public class KeyActionOverlay : Panel
    {
        public enum ActionType
        {
            None,
            SeekForward,
            SeekBackward,
            VolumeUp,
            VolumeDown,
            Pause,
            Play
        }

        private ActionType _currentAction = ActionType.None;
        private int _volumeLevel = 50;
        private int _cumulatedSeekSeconds = 0;

        private System.Windows.Forms.Timer? _hideTimer;
        private System.Windows.Forms.Timer? _seekResetTimer;
        private const int DISPLAY_DURATION_MS = 1000;
        private const int SEEK_RESET_MS = 1000;
 
        private const int PADDING = 12;
        private static readonly Color BG_COLOR = Color.FromArgb(0x14, 0x14, 0x14);

        private static readonly Size SIZE_SEEK     = new Size(104, 74);
        private static readonly Size SIZE_VOLUME   = new Size(124, 74);
        private static readonly Size SIZE_PLAYPAUSE = new Size(72,  72);

        public KeyActionOverlay()
        {
            this.BackColor = BG_COLOR;
            this.DoubleBuffered = true;
            Size = SIZE_PLAYPAUSE;
            Location = new Point(16, 16);
            Visible = false;

            _hideTimer = new System.Windows.Forms.Timer { Interval = DISPLAY_DURATION_MS };
            _hideTimer.Tick += (s, e) =>
            {
                _hideTimer.Stop();
                Visible = false;
                _currentAction = ActionType.None;
            };

            _seekResetTimer = new System.Windows.Forms.Timer { Interval = SEEK_RESET_MS };
            _seekResetTimer.Tick += (s, e) =>
            {
                _seekResetTimer.Stop();
                _cumulatedSeekSeconds = 0;
            };
        }

        private void ResizeForAction(ActionType action)
        {
            Size = action switch
            {
                ActionType.SeekForward or ActionType.SeekBackward => SIZE_SEEK,
                ActionType.VolumeUp    or ActionType.VolumeDown   => SIZE_VOLUME,
                _                                                  => SIZE_PLAYPAUSE,
            };
        }

        public void ShowSeek(int seekSeconds)
        {
            _seekResetTimer!.Stop();
            _cumulatedSeekSeconds += seekSeconds;
            _currentAction = seekSeconds > 0 ? ActionType.SeekForward : ActionType.SeekBackward;
            ResizeForAction(_currentAction);
            ShowOverlay();
            _seekResetTimer.Start();
        }

        public void ShowVolume(bool up, int volume)
        {
            _currentAction = up ? ActionType.VolumeUp : ActionType.VolumeDown;
            _volumeLevel = volume;
            ResizeForAction(_currentAction);
            ShowOverlay();
        }

        public void ShowPlayPause(bool isPlaying)
        {
            _currentAction = isPlaying ? ActionType.Play : ActionType.Pause;
            ResizeForAction(_currentAction);
            ShowOverlay();
        }

        private void ShowOverlay()
        {
            _hideTimer!.Stop();
            if (!Visible)
            {
                Visible = true;
                BringToFront();
            }
            Invalidate();
            _hideTimer.Start();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            var g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAlias;

            g.Clear(BG_COLOR);

            if (_currentAction == ActionType.None) return;

            var inner = new Rectangle(PADDING, PADDING, Width - PADDING * 2, Height - PADDING * 2);

            switch (_currentAction)
            {
                case ActionType.SeekForward:
                    DrawSeekIcon(g, inner, forward: true);
                    DrawSeekLabel(g, inner);
                    break;
                case ActionType.SeekBackward:
                    DrawSeekIcon(g, inner, forward: false);
                    DrawSeekLabel(g, inner);
                    break;
                case ActionType.VolumeUp:
                case ActionType.VolumeDown:
                    DrawVolumeIcon(g, inner);
                    break;
                case ActionType.Play:
                    DrawPlayIcon(g, inner);
                    break;
                case ActionType.Pause:
                    DrawPauseIcon(g, inner);
                    break;
            }
        }

        private void DrawSeekIcon(Graphics g, Rectangle inner, bool forward)
        {
            float cx = inner.X + inner.Width / 2f;
            float cy = inner.Y + (inner.Height - 18) / 2f;
            float ah = 18f, aw = 11f, gap = 3f;

            using var pen = new Pen(Color.White, 3f)
            {
                LineJoin = LineJoin.Round,
                StartCap = LineCap.Round,
                EndCap = LineCap.Round
            };

            if (forward)
            {
                DrawChevron(g, pen, cx - aw - gap / 2, cy, aw, ah);
                DrawChevron(g, pen, cx + gap / 2, cy, aw, ah);
            }
            else
            {
                DrawChevronLeft(g, pen, cx - gap / 2 - aw, cy, aw, ah);
                DrawChevronLeft(g, pen, cx - gap / 2 - aw * 2 - gap, cy, aw, ah);
            }
        }

        private static void DrawChevron(Graphics g, Pen pen, float x, float cy, float w, float h)
            => g.DrawLines(pen, new[] { new PointF(x, cy - h / 2), new PointF(x + w, cy), new PointF(x, cy + h / 2) });

        private static void DrawChevronLeft(Graphics g, Pen pen, float x, float cy, float w, float h)
            => g.DrawLines(pen, new[] { new PointF(x + w, cy - h / 2), new PointF(x, cy), new PointF(x + w, cy + h / 2) });

        private void DrawSeekLabel(Graphics g, Rectangle inner)
        {
            int totalSec = Math.Abs(_cumulatedSeekSeconds);
            string label = totalSec >= 60
                ? $"{totalSec / 60}m{totalSec % 60:00}s"
                : $"{(_cumulatedSeekSeconds > 0 ? "+" : "-")}{totalSec}s";

            using var font = new Font("Segoe UI", 9f, FontStyle.Bold);
            using var brush = new SolidBrush(Color.White);
            var sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Far };
            g.DrawString(label, font, brush, new RectangleF(inner.X, inner.Y, inner.Width, inner.Height), sf);
        }

        private void DrawVolumeIcon(Graphics g, Rectangle inner)
        {
            float cx = inner.X + inner.Width / 2f - 8f;
            float cy = inner.Y + (inner.Height - 18) / 2f;

            using var fill = new SolidBrush(Color.White);
            float bx = cx - 10f;
            PointF[] speaker = {
                new PointF(bx,      cy - 6),
                new PointF(bx + 8,  cy - 6),
                new PointF(bx + 14, cy - 11),
                new PointF(bx + 14, cy + 11),
                new PointF(bx + 8,  cy + 6),
                new PointF(bx,      cy + 6),
            };
            g.FillPolygon(fill, speaker);

            int waves = _volumeLevel <= 0 ? 0
                      : _volumeLevel <= 33 ? 1
                      : _volumeLevel <= 66 ? 2
                      : 3;

            float startX = bx + 18f;
            for (int i = 0; i < waves; i++)
            {
                float r = 8f + i * 8f;
                float ox = startX + i * 8f;
                using var wavePen = new Pen(Color.White, 2f) { StartCap = LineCap.Round, EndCap = LineCap.Round };
                g.DrawArc(wavePen, new RectangleF(ox - r / 2, cy - r / 2, r, r), -50, 100);
            }

            if (_volumeLevel == 0)
            {
                using var mutePen = new Pen(Color.OrangeRed, 2f) { StartCap = LineCap.Round, EndCap = LineCap.Round };
                float mx = startX + 5;
                g.DrawLine(mutePen, mx - 5, cy - 7, mx + 5, cy + 7);
                g.DrawLine(mutePen, mx + 5, cy - 7, mx - 5, cy + 7);
            }

            // Flèche directionnelle dans le coin supérieur droit
            bool goingUp = _currentAction == ActionType.VolumeUp;
            using var arrowPen = new Pen(goingUp ? Color.LightGreen : Color.OrangeRed, 2f)
                { StartCap = LineCap.Round, EndCap = LineCap.Round };
            float ax = inner.Right - 8f;
            float ay = goingUp ? inner.Y + 6f : inner.Bottom - 6f - 10f;
            float hs = 5f;
            if (goingUp)
            {
                g.DrawLine(arrowPen, ax, ay + hs, ax, ay);
                g.DrawLine(arrowPen, ax - hs / 2, ay + hs / 2, ax, ay);
                g.DrawLine(arrowPen, ax + hs / 2, ay + hs / 2, ax, ay);
            }
            else
            {
                g.DrawLine(arrowPen, ax, ay, ax, ay + hs);
                g.DrawLine(arrowPen, ax - hs / 2, ay + hs / 2, ax, ay + hs);
                g.DrawLine(arrowPen, ax + hs / 2, ay + hs / 2, ax, ay + hs);
            }

            // Label pourcentage en bas centré
            using var font = new Font("Segoe UI", 9f, FontStyle.Bold);
            using var brush = new SolidBrush(Color.White);
            var sf = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Far };
            g.DrawString($"{_volumeLevel}%", font, brush, new RectangleF(inner.X, inner.Y, inner.Width, inner.Height), sf);
        }

        private static void DrawPlayIcon(Graphics g, Rectangle inner)
        {
            float cx = inner.X + inner.Width / 2f + 2f;
            float cy = inner.Y + inner.Height / 2f;
            float s = 20f;
            using var brush = new SolidBrush(Color.White);
            g.FillPolygon(brush, new[] {
                new PointF(cx - s / 2, cy - s / 2),
                new PointF(cx + s / 2, cy),
                new PointF(cx - s / 2, cy + s / 2),
            });
        }

        private static void DrawPauseIcon(Graphics g, Rectangle inner)
        {
            float cx = inner.X + inner.Width / 2f;
            float cy = inner.Y + inner.Height / 2f;
            float bw = 8f, bh = 24f, gap = 8f;
            using var brush = new SolidBrush(Color.White);
            g.FillRectangle(brush, cx - gap / 2 - bw, cy - bh / 2, bw, bh);
            g.FillRectangle(brush, cx + gap / 2, cy - bh / 2, bw, bh);
        }
    }
}
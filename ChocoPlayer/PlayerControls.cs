using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace ChocoPlayer
{
    public class PlayerControls : Panel
    {
        // Progression
        private float _progress = 0.0f;
        private float _volumeProgress = 0.5f;
        private bool _isDragging = false;
        private bool _isDraggingVolume = false;

        // Dimensions ligne de progression
        private int _pointRadius = 8;
        private int _lineHeight = 6;
        private int _leftMargin = 30;
        private int _rightMargin = 140;

        // Timer et listener
        private IProgressChangeListener? _listener;
        private System.Windows.Forms.Timer? _updateTimer;

        // Affichage
        private string _timeText = "00:00:00 / 00:00:00";
        private Color _colorYellow = Color.FromArgb(255, 211, 1);
        private bool _isPlaying = true;

        // Dimensions boutons
        private int _buttonSize = 30;
        private int _buttonSpacing = 10;
        private int _buttonsY;

        // Volume
        private int _volumeBarWidth = 80;
        private int _volumeBarHeight = 4;
        private int _volumePointRadius = 6;

        // Positions X des boutons
        private int _playButtonX;
        private int _volumeButtonX;
        private int _volumeBarX;
        private int _settingsButtonX;
        private int _fullscreenButtonX;

        // Constantes
        private const int CONTROLS_HEIGHT = 60;

        public PlayerControls()
        {
            this.BackColor = Color.FromArgb(20, 20, 20);
            this.DoubleBuffered = true;

            _updateTimer = new System.Windows.Forms.Timer();
            _updateTimer.Interval = 100;
            _updateTimer.Tick += (s, e) =>
            {
                if (!_isDragging)
                {
                    UpdateProgressFromPlayer();
                }
            };
            _updateTimer.Start();

            this.MouseDown += PlayerControls_MouseDown;
            this.MouseUp += PlayerControls_MouseUp;
            this.MouseMove += PlayerControls_MouseMove;
        }

        public void SetPosition(int width, int height)
        {
            this.SetBounds(0, height - CONTROLS_HEIGHT, width, CONTROLS_HEIGHT);
        }

        public int GetControlsHeight() => CONTROLS_HEIGHT;

        public int GetSettingX() => _settingsButtonX + _buttonSize;

        private void PlayerControls_MouseDown(object? sender, MouseEventArgs e)
        {
            int lineY = this.Height / 2 - 15;
            int lineWidth = this.Width - _leftMargin - _rightMargin;
            int progressX = _leftMargin + (int)(_progress * lineWidth);

            if (IsOverPoint(e.X, e.Y, progressX, lineY) || IsOverLine(e.X, e.Y, lineY))
            {
                _isDragging = true;
                UpdateProgress(e.X);
            }
            else if (IsOverVolumeLine(e.X, e.Y) || IsOverVolumePoint(e.X, e.Y))
            {
                _isDraggingVolume = true;
                UpdateVolume(e.X);
            }
            else
            {
                HandleButtonClick(e.X, e.Y);
            }
        }

        private void PlayerControls_MouseUp(object? sender, MouseEventArgs e)
        {
            if (_isDragging)
            {
                _isDragging = false;
                _listener?.OnProgressChanged(_progress);
            }
            if (_isDraggingVolume)
            {
                _isDraggingVolume = false;
            }
        }

        private void PlayerControls_MouseMove(object? sender, MouseEventArgs e)
        {
            if (_isDragging)
            {
                UpdateProgress(e.X);
            }
            else if (_isDraggingVolume)
            {
                UpdateVolume(e.X);
            }
            else
            {
                int lineY = this.Height / 2 - 15;
                int lineWidth = this.Width - _leftMargin - _rightMargin;
                int progressX = _leftMargin + (int)(_progress * lineWidth);

                if (IsOverPoint(e.X, e.Y, progressX, lineY) ||
                    IsOverLine(e.X, e.Y, lineY) ||
                    IsOverVolumeLine(e.X, e.Y) ||
                    IsOverVolumePoint(e.X, e.Y) ||
                    IsOverAnyButton(e.X, e.Y))
                {
                    this.Cursor = Cursors.Hand;
                }
                else
                {
                    this.Cursor = Cursors.Default;
                }
            }
        }

        private bool IsOverPoint(int mouseX, int mouseY, int pointX, int pointY)
        {
            int dx = mouseX - pointX;
            int dy = mouseY - pointY;
            return Math.Sqrt(dx * dx + dy * dy) <= _pointRadius + 5;
        }

        private bool IsOverLine(int mouseX, int mouseY, int lineY)
        {
            return mouseX >= _leftMargin &&
                   mouseX <= this.Width - _rightMargin &&
                   Math.Abs(mouseY - lineY) <= _lineHeight + 5;
        }

        private bool IsOverVolumePoint(int mouseX, int mouseY)
        {
            int volumeProgressX = _volumeBarX + (int)(_volumeProgress * _volumeBarWidth);
            int volumeY = _buttonsY + _buttonSize / 2;

            int dx = mouseX - volumeProgressX;
            int dy = mouseY - volumeY;
            return Math.Sqrt(dx * dx + dy * dy) <= _volumePointRadius + 5;
        }

        private bool IsOverVolumeLine(int mouseX, int mouseY)
        {
            int volumeY = _buttonsY + _buttonSize / 2;
            return mouseX >= _volumeBarX &&
                   mouseX <= _volumeBarX + _volumeBarWidth &&
                   Math.Abs(mouseY - volumeY) <= _volumeBarHeight + 5;
        }

        private bool IsOverAnyButton(int mouseX, int mouseY)
        {
            return IsOverButton(mouseX, mouseY, _playButtonX) ||
                   IsOverButton(mouseX, mouseY, _volumeButtonX) ||
                   IsOverButton(mouseX, mouseY, _settingsButtonX) ||
                   IsOverButton(mouseX, mouseY, _fullscreenButtonX);
        }

        private bool IsOverButton(int mouseX, int mouseY, int buttonX)
        {
            return mouseX >= buttonX &&
                   mouseX <= buttonX + _buttonSize &&
                   mouseY >= _buttonsY &&
                   mouseY <= _buttonsY + _buttonSize;
        }

        private void HandleButtonClick(int mouseX, int mouseY)
        {
            if (IsOverButton(mouseX, mouseY, _playButtonX))
            {
                _isPlaying = !_isPlaying;
                _listener?.OnPlayPauseClicked(_isPlaying);
                this.Invalidate();
            }
            else if (IsOverButton(mouseX, mouseY, _volumeButtonX))
            {
                _listener?.OnVolumeClicked();
            }
            else if (IsOverButton(mouseX, mouseY, _settingsButtonX))
            {
                _listener?.OnSettingsClicked(_settingsButtonX, _buttonsY, _buttonSize);
            }
            else if (IsOverButton(mouseX, mouseY, _fullscreenButtonX))
            {
                _listener?.OnFullscreenClicked();
            }
        }

        private void UpdateProgress(int mouseX)
        {
            int lineWidth = this.Width - _leftMargin - _rightMargin;
            int clampedX = Math.Max(_leftMargin, Math.Min(mouseX, this.Width - _rightMargin));
            _progress = (float)(clampedX - _leftMargin) / lineWidth;

            long totalTime = Player.GetTotalTime();
            long newElapsedTime = (long)(_progress * totalTime);
            _timeText = FormatTime(newElapsedTime) + " / " + FormatTime(totalTime);

            this.Invalidate();
            _listener?.OnProgressChanging(_progress);
        }

        private void UpdateVolume(int mouseX)
        {
            int clampedX = Math.Max(_volumeBarX, Math.Min(mouseX, _volumeBarX + _volumeBarWidth));
            _volumeProgress = (float)(clampedX - _volumeBarX) / _volumeBarWidth;

            _listener?.OnVolumeChanged((int)(_volumeProgress * 100));
            this.Invalidate();
        }

        private void UpdateProgressFromPlayer()
        {
            long totalTime = Player.GetTotalTime();
            long elapsedTime = Player.GetElapsedTime();

            if (totalTime > 0)
            {
                _progress = (float)elapsedTime / totalTime;
                _timeText = FormatTime(elapsedTime) + " / " + FormatTime(totalTime);
            }
            else
            {
                _progress = 0.0f;
                _timeText = "00:00:00 / 00:00:00";
            }

            this.Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);

            Graphics g2d = e.Graphics;
            g2d.SmoothingMode = SmoothingMode.AntiAlias;
            g2d.TextRenderingHint = System.Drawing.Text.TextRenderingHint.AntiAlias;

            int width = this.Width;
            int height = this.Height;
            int lineY = height / 2 - 15;
            int lineWidth = width - _leftMargin - _rightMargin;

            // Ligne de fond grise
            using (Pen pen = new Pen(Color.FromArgb(100, 100, 100), _lineHeight))
            {
                pen.StartCap = LineCap.Round;
                pen.EndCap = LineCap.Round;
                g2d.DrawLine(pen, _leftMargin, lineY, width - _rightMargin, lineY);
            }

            // Ligne de progression jaune
            int progressX = _leftMargin + (int)(_progress * lineWidth);
            using (Pen pen = new Pen(_colorYellow, _lineHeight))
            {
                pen.StartCap = LineCap.Round;
                pen.EndCap = LineCap.Round;
                g2d.DrawLine(pen, _leftMargin, lineY, progressX, lineY);
            }

            // Point de progression
            using (SolidBrush brush = new SolidBrush(_colorYellow))
            {
                g2d.FillEllipse(brush,
                    progressX - _pointRadius,
                    lineY - _pointRadius,
                    _pointRadius * 2,
                    _pointRadius * 2);
            }

            using (Pen pen = new Pen(_colorYellow, 2))
            {
                g2d.DrawEllipse(pen,
                    progressX - _pointRadius,
                    lineY - _pointRadius,
                    _pointRadius * 2,
                    _pointRadius * 2);
            }

            using (Font font = new Font("SansSerif", 10))
            using (SolidBrush brush = new SolidBrush(Color.White))
            {
                float textX = width - _rightMargin + 10;
                float textY = lineY;

                StringFormat sf = new StringFormat
                {
                    LineAlignment = StringAlignment.Center,
                    Alignment = StringAlignment.Near
                };

                g2d.DrawString(_timeText, font, brush, new PointF(textX, textY), sf);
            }

            DrawButtons(g2d);
            DrawVolumeBar(g2d);
        }

        private void DrawButtons(Graphics g2d)
        {
            int width = this.Width;
            int height = this.Height;
            _buttonsY = height - 30;

            _playButtonX = _leftMargin;
            _volumeButtonX = _playButtonX + _buttonSize + _buttonSpacing;
            _volumeBarX = _volumeButtonX + _buttonSize + _buttonSpacing;
            _fullscreenButtonX = width - 50;
            _settingsButtonX = _fullscreenButtonX - _buttonSize - _buttonSpacing;

            DrawPlaceholderButton(g2d, _playButtonX, _buttonsY, _isPlaying ? "⏸" : "▶");
            DrawPlaceholderButton(g2d, _volumeButtonX, _buttonsY, _volumeProgress == 0 ? "🔇" : "🔊");
            DrawPlaceholderButton(g2d, _settingsButtonX, _buttonsY, "⚙");
            DrawPlaceholderButton(g2d, _fullscreenButtonX, _buttonsY, "⛶");
        }

        private void DrawVolumeBar(Graphics g2d)
        {
            int volumeY = _buttonsY + _buttonSize / 2;

            // Ligne de fond
            using (Pen pen = new Pen(Color.FromArgb(100, 100, 100), _volumeBarHeight))
            {
                pen.StartCap = LineCap.Round;
                pen.EndCap = LineCap.Round;
                g2d.DrawLine(pen, _volumeBarX, volumeY, _volumeBarX + _volumeBarWidth, volumeY);
            }

            // Ligne de progression volume
            int volumeProgressX = _volumeBarX + (int)(_volumeProgress * _volumeBarWidth);
            using (Pen pen = new Pen(_colorYellow, _volumeBarHeight))
            {
                pen.StartCap = LineCap.Round;
                pen.EndCap = LineCap.Round;
                g2d.DrawLine(pen, _volumeBarX, volumeY, volumeProgressX, volumeY);
            }

            // Point de volume
            using (SolidBrush brush = new SolidBrush(_colorYellow))
            {
                g2d.FillEllipse(brush,
                    volumeProgressX - _volumePointRadius,
                    volumeY - _volumePointRadius,
                    _volumePointRadius * 2,
                    _volumePointRadius * 2);
            }

            using (Pen pen = new Pen(_colorYellow, 2))
            {
                g2d.DrawEllipse(pen,
                    volumeProgressX - _volumePointRadius,
                    volumeY - _volumePointRadius,
                    _volumePointRadius * 2,
                    _volumePointRadius * 2);
            }
        }

        private void DrawPlaceholderButton(Graphics g2d, int x, int y, string symbol)
        {
            using (SolidBrush brush = new SolidBrush(Color.FromArgb(80, 80, 80)))
            {
                g2d.FillRoundedRectangle(brush, x, y, _buttonSize, _buttonSize, 5);
            }

            using (Pen pen = new Pen(Color.White, 1))
            {
                g2d.DrawRoundedRectangle(pen, x, y, _buttonSize, _buttonSize, 5);
            }

            using (Font font = new Font("SansSerif", 12, FontStyle.Bold))
            using (SolidBrush brush = new SolidBrush(Color.White))
            {
                RectangleF rect = new RectangleF(x, y, _buttonSize, _buttonSize);

                StringFormat sf = new StringFormat
                {
                    Alignment = StringAlignment.Center,
                    LineAlignment = StringAlignment.Center
                };

                g2d.DrawString(symbol, font, brush, rect, sf);
            }
        }

        public void SetPlaying(bool playing)
        {
            _isPlaying = playing;
            this.Invalidate();
        }

        public void SetProgressChangeListener(IProgressChangeListener listener)
        {
            _listener = listener;
        }

        public void StopTimer()
        {
            _updateTimer?.Stop();
        }

        private static string FormatTime(long milliseconds)
        {
            long seconds = milliseconds / 1000;
            long minutes = seconds / 60;
            long hours = minutes / 60;

            seconds %= 60;
            minutes %= 60;

            return string.Format("{0:D2}:{1:D2}:{2:D2}", hours, minutes, seconds);
        }

        public interface IProgressChangeListener
        {
            void OnProgressChanged(float progress);
            void OnProgressChanging(float progress);
            void OnPlayPauseClicked(bool isPlaying);
            void OnVolumeClicked();
            void OnVolumeChanged(int volume);
            void OnFullscreenClicked();
            void OnSettingsClicked(int buttonX, int buttonY, int buttonSize);
        }
    }

    // Extension pour dessiner des rectangles arrondis
    public static class GraphicsExtensions
    {
        public static void FillRoundedRectangle(this Graphics g, Brush brush, int x, int y, int width, int height, int radius)
        {
            using (GraphicsPath path = GetRoundedRectPath(x, y, width, height, radius))
            {
                g.FillPath(brush, path);
            }
        }

        public static void DrawRoundedRectangle(this Graphics g, Pen pen, int x, int y, int width, int height, int radius)
        {
            using (GraphicsPath path = GetRoundedRectPath(x, y, width, height, radius))
            {
                g.DrawPath(pen, path);
            }
        }

        private static GraphicsPath GetRoundedRectPath(int x, int y, int width, int height, int radius)
        {
            GraphicsPath path = new GraphicsPath();
            path.AddArc(x, y, radius, radius, 180, 90);
            path.AddArc(x + width - radius, y, radius, radius, 270, 90);
            path.AddArc(x + width - radius, y + height - radius, radius, radius, 0, 90);
            path.AddArc(x, y + height - radius, radius, radius, 90, 90);
            path.CloseFigure();
            return path;
        }
    }
}
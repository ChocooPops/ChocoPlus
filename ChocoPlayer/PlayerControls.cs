using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

using System.IO;

namespace ChocoPlayer
{
    public class PlayerControls : Panel
    {
        private float _progress = 0.0f;
        private float _volumeProgress = 0.5f;
        private bool _isDragging = false;
        private bool _isDraggingVolume = false;

        private int _pointRadius = 8;
        private int _lineHeight = 6;
        private int _leftMargin = 30;
        private int _rightMargin = 30;

        private IProgressChangeListener? _listener;
        private System.Windows.Forms.Timer? _updateTimer;

        private string _timeText = "00:00:00 / 00:00:00";
        private Color _colorYellow = Color.FromArgb(255, 211, 1);
        private bool _isPlaying = true;
        private bool _isMuted = false;

        private int _buttonSize = 30;
        private int _buttonSpacing = 18;
        private int _buttonMarginBottom = 15;
        private int _buttonsY;

        private int _volumeBarWidth = 110;
        private int _volumeBarHeight = 4;
        private int _volumePointRadius = 6;

        private int _playButtonX;
        private int _backwardButtonX;
        private int _forwardButtonX;
        private int _volumeButtonX;
        private int _volumeBarX;
        private int _seasonsButtonX;
        private int _settingsButtonX;
        private int _fullscreenButtonX;

        private int _timeTextWidth = 0;
        private int _timeTextGap = 15;

        private const int CONTROLS_HEIGHT = 95;

        private Bitmap? _playIcon;
        private Bitmap? _pauseIcon;
        private Bitmap? _backwardIcon;
        private Bitmap? _forwardIcon;
        private Bitmap? _volumeIcon;
        private Bitmap? _volumeMuteIcon;
        private Bitmap? _seasonsIcon;
        private Bitmap? _settingsIcon;
        private Bitmap? _fullscreenIcon;
        private Bitmap? _fullscreenExitIcon;
        private bool _isFullscreen = false;
        private bool _hasSeasons = false;

        public PlayerControls()
        {
            this.BackColor = Color.FromArgb(20, 20, 20);
            this.DoubleBuffered = true;
            LoadIcons();

            CalculateTimeTextWidth();

            _updateTimer = new System.Windows.Forms.Timer();
            _updateTimer.Interval = 50;
            _updateTimer.Tick += (s, e) =>
            {
                if (!_isDragging && !_isDraggingVolume)
                {
                    UpdateProgressFromPlayer();
                }
            };
            _updateTimer.Start();

            this.MouseDown += PlayerControls_MouseDown;
            this.MouseUp += PlayerControls_MouseUp;
            this.MouseMove += PlayerControls_MouseMove;
            this.Resize += (s, e) => RefreshImmediate();
        }

        private void LoadIcons()
        {
            try
            {
                string iconsPath = Path.Combine(
                    Path.GetDirectoryName(Application.ExecutablePath) ?? "",
                    "icons"
                );

                var pngFiles = Directory.GetFiles(iconsPath, "*.png");

                _playIcon = LoadPngIcon(Path.Combine(iconsPath, "play.png"));
                _pauseIcon = LoadPngIcon(Path.Combine(iconsPath, "pause.png"));
                _backwardIcon = LoadPngIcon(Path.Combine(iconsPath, "backward.png"));
                _forwardIcon = LoadPngIcon(Path.Combine(iconsPath, "forward.png"));
                _volumeIcon = LoadPngIcon(Path.Combine(iconsPath, "volume.png"));
                _volumeMuteIcon = LoadPngIcon(Path.Combine(iconsPath, "volume-mute.png"));
                _seasonsIcon = LoadPngIcon(Path.Combine(iconsPath, "seasons.png"));
                _settingsIcon = LoadPngIcon(Path.Combine(iconsPath, "settings.png"));
                _fullscreenIcon = LoadPngIcon(Path.Combine(iconsPath, "fullscreen.png"));
                _fullscreenExitIcon = LoadPngIcon(Path.Combine(iconsPath, "fullscreen-exit.png"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors du chargement des icônes: {ex.Message}");
                Console.WriteLine($"Stack trace: {ex.StackTrace}");
            }
        }

        private Bitmap? LoadPngIcon(string pngPath)
        {
            try
            {
                Bitmap originalBitmap = new Bitmap(pngPath);
                return originalBitmap;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors du chargement de {pngPath}: {ex.Message}");
                return null;
            }
        }

        public void SetPosition(int width, int height)
        {
            this.SetBounds(0, height - CONTROLS_HEIGHT, width, CONTROLS_HEIGHT);
        }

        public int GetControlsHeight() => CONTROLS_HEIGHT;

        public int GetSettingX() => _settingsButtonX + _buttonSize;

        public int GetSeasonsButtonX() => _seasonsButtonX + _buttonSize;

        private void PlayerControls_MouseDown(object? sender, MouseEventArgs e)
        {
            int lineY = this.Height / 2 - 15;
            int lineEnd = this.Width - _rightMargin - _timeTextWidth - _timeTextGap;
            int lineWidth = lineEnd - _leftMargin;
            int progressX = _leftMargin + (int)(_progress * lineWidth);

            if (IsOverPoint(e.X, e.Y, progressX, lineY) || IsOverLine(e.X, e.Y, lineY, lineEnd))
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
                int lineEnd = this.Width - _rightMargin - _timeTextWidth - _timeTextGap;
                int lineWidth = lineEnd - _leftMargin;
                int progressX = _leftMargin + (int)(_progress * lineWidth);

                if (IsOverPoint(e.X, e.Y, progressX, lineY) ||
                    IsOverLine(e.X, e.Y, lineY, lineEnd) ||
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

        public int GetButtonSize() => _buttonSize;

        public bool IsClickOnSettingsButton(int mouseX, int mouseY)
        {
            return IsOverButton(mouseX, mouseY, _settingsButtonX);
        }

        public bool IsClickOnSeasonsButton(int mouseX, int mouseY)
        {
            if (!_hasSeasons)
                return false;

            return IsOverButton(mouseX, mouseY, _seasonsButtonX);
        }

        private bool IsOverPoint(int mouseX, int mouseY, int pointX, int pointY)
        {
            int dx = mouseX - pointX;
            int dy = mouseY - pointY;
            return Math.Sqrt(dx * dx + dy * dy) <= _pointRadius + 5;
        }

        private bool IsOverLine(int mouseX, int mouseY, int lineY, int lineEnd)
        {
            return mouseX >= _leftMargin && mouseX <= lineEnd &&
                   mouseY >= lineY - 25 && mouseY <= lineY;
        }

        private bool IsOverVolumeLine(int mouseX, int mouseY)
        {
            int volumeY = _buttonsY + _buttonSize / 2;
            return mouseX >= _volumeBarX && mouseX <= _volumeBarX + _volumeBarWidth &&
                   mouseY >= volumeY - 10 && mouseY <= volumeY + 10;
        }

        private bool IsOverVolumePoint(int mouseX, int mouseY)
        {
            int volumeY = _buttonsY + _buttonSize / 2;
            int volumeProgressX = _volumeBarX + (int)(_volumeProgress * _volumeBarWidth);
            int dx = mouseX - volumeProgressX;
            int dy = mouseY - volumeY;
            return Math.Sqrt(dx * dx + dy * dy) <= _volumePointRadius + 5;
        }

        private bool IsOverButton(int mouseX, int mouseY, int buttonX)
        {
            return mouseX >= buttonX && mouseX <= buttonX + _buttonSize &&
                   mouseY >= _buttonsY && mouseY <= _buttonsY + _buttonSize;
        }

        private bool IsOverAnyButton(int mouseX, int mouseY)
        {
            return IsOverButton(mouseX, mouseY, _playButtonX) ||
                   IsOverButton(mouseX, mouseY, _backwardButtonX) ||
                   IsOverButton(mouseX, mouseY, _forwardButtonX) ||
                   IsOverButton(mouseX, mouseY, _volumeButtonX) ||
                   IsOverButton(mouseX, mouseY, _seasonsButtonX) ||
                   IsOverButton(mouseX, mouseY, _settingsButtonX) ||
                   IsOverButton(mouseX, mouseY, _fullscreenButtonX);
        }

        private void HandleButtonClick(int mouseX, int mouseY)
        {
            if (IsOverButton(mouseX, mouseY, _playButtonX))
            {
                _isPlaying = !_isPlaying;
                _listener?.OnPlayPauseClicked(_isPlaying);
                RefreshImmediate();
            }
            else if (IsOverButton(mouseX, mouseY, _backwardButtonX))
            {
                _listener?.OnBackwardClicked();
            }
            else if (IsOverButton(mouseX, mouseY, _forwardButtonX))
            {
                _listener?.OnForwardClicked();
            }
            else if (IsOverButton(mouseX, mouseY, _volumeButtonX))
            {
                _listener?.OnVolumeClicked();
            }
            else if (IsOverButton(mouseX, mouseY, _fullscreenButtonX))
            {
                _listener?.OnFullscreenClicked();
            }
            else if (IsOverButton(mouseX, mouseY, _settingsButtonX))
            {
                _listener?.OnSettingsClicked(_settingsButtonX, _buttonsY, _buttonSize);
            }
            else if (_hasSeasons && IsOverButton(mouseX, mouseY, _seasonsButtonX))
            {
                _listener?.OnSeasonsClicked(_seasonsButtonX, _buttonsY, _buttonSize);
            }
        }

        private void UpdateProgress(int mouseX)
        {
            int lineEnd = this.Width - _rightMargin - _timeTextWidth - _timeTextGap;
            int lineWidth = lineEnd - _leftMargin;

            if (mouseX < _leftMargin)
                _progress = 0.0f;
            else if (mouseX > lineEnd)
                _progress = 1.0f;
            else
                _progress = (float)(mouseX - _leftMargin) / lineWidth;

            _listener?.OnProgressChanging(_progress);
            UpdateTimeText();
            RefreshImmediate();
        }

        private void UpdateVolume(int mouseX)
        {
            if (mouseX < _volumeBarX)
                _volumeProgress = 0.0f;
            else if (mouseX > _volumeBarX + _volumeBarWidth)
                _volumeProgress = 1.0f;
            else
                _volumeProgress = (float)(mouseX - _volumeBarX) / _volumeBarWidth;

            int volume = (int)(_volumeProgress * 100);
            _listener?.OnVolumeChanged(volume);
            RefreshImmediate();
        }

        private void UpdateProgressFromPlayer()
        {
            long totalTime = Player.GetTotalTime();
            long currentTime = Player.GetElapsedTime();

            if (totalTime > 0)
            {
                _progress = (float)currentTime / totalTime;
            }

            UpdateTimeText();
            RefreshImmediate();
        }

        private void UpdateTimeText()
        {
            long totalTime = Player.GetTotalTime();
            long currentTime = (long)(_progress * totalTime);

            _timeText = $"{FormatTime(currentTime)} / {FormatTime(totalTime)}";
        }

        private void CalculateTimeTextWidth()
        {
            using (Graphics g = CreateGraphics())
            using (Font font = new Font("Segoe UI", 9))
            {
                _timeTextWidth = (int)g.MeasureString("00:00:00 / 00:00:00", font).Width;
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

            Graphics g2d = e.Graphics;
            g2d.SmoothingMode = SmoothingMode.AntiAlias;

            int lineY = this.Height / 2 - 25;
            int lineEnd = this.Width - _rightMargin - _timeTextWidth - _timeTextGap;
            int lineWidth = lineEnd - _leftMargin;

            using (Pen pen = new Pen(Color.FromArgb(100, 100, 100), _lineHeight))
            {
                pen.StartCap = LineCap.Round;
                pen.EndCap = LineCap.Round;
                g2d.DrawLine(pen, _leftMargin, lineY, lineEnd, lineY);
            }

            int progressX = _leftMargin + (int)(_progress * lineWidth);
            using (Pen pen = new Pen(_colorYellow, _lineHeight))
            {
                pen.StartCap = LineCap.Round;
                pen.EndCap = LineCap.Round;
                g2d.DrawLine(pen, _leftMargin, lineY, progressX, lineY);
            }

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

            using (Font font = new Font("Segoe UI", 9))
            using (SolidBrush brush = new SolidBrush(Color.White))
            {
                int textX = this.Width - _rightMargin - _timeTextWidth;
                int textY = lineY - 10;
                g2d.DrawString(_timeText, font, brush, textX, textY);
            }

            DrawButtons(g2d);
            DrawVolumeBar(g2d);
        }

        private void DrawButtons(Graphics g2d)
        {
            int width = this.Width;
            int height = this.Height;
            _buttonsY = height - _buttonSize - _buttonMarginBottom;

            _playButtonX = _leftMargin;
            _backwardButtonX = _playButtonX + _buttonSize + _buttonSpacing;
            _forwardButtonX = _backwardButtonX + _buttonSize + _buttonSpacing - 10;
            _volumeButtonX = _forwardButtonX + _buttonSize + _buttonSpacing;
            _volumeBarX = _volumeButtonX + _buttonSize + _buttonSpacing;

            _fullscreenButtonX = width - _rightMargin - _buttonSize;
            _settingsButtonX = _fullscreenButtonX - _buttonSize - _buttonSpacing + 5;

            if (_hasSeasons)
            {
                _seasonsButtonX = _settingsButtonX - _buttonSize - _buttonSpacing + 5;
            }

            DrawIconButton(g2d, _playButtonX, _buttonsY, _isPlaying ? _pauseIcon : _playIcon, _isPlaying ? "⏸" : "▶");
            DrawIconButton(g2d, _backwardButtonX, _buttonsY, _backwardIcon, "⏮");
            DrawIconButton(g2d, _forwardButtonX, _buttonsY, _forwardIcon, "⏭");
            DrawIconButton(g2d, _volumeButtonX, _buttonsY,
                    (_isMuted || _volumeProgress == 0) ? _volumeMuteIcon : _volumeIcon,
                    (_isMuted || _volumeProgress == 0) ? "🔇" : "🔊");

            if (_hasSeasons)
            {
                DrawIconButton(g2d, _seasonsButtonX, _buttonsY, _seasonsIcon, "📺");
            }

            DrawIconButton(g2d, _settingsButtonX, _buttonsY, _settingsIcon, "⚙");
            DrawIconButton(g2d, _fullscreenButtonX, _buttonsY, _isFullscreen ? _fullscreenExitIcon : _fullscreenIcon, _isFullscreen ? "⊡" : "⛶");
        }

        public void SetFullscreen(bool isFullscreen)
        {
            _isFullscreen = isFullscreen;
            RefreshImmediate();
        }

        public void SetHasSeasons(bool hasSeasons)
        {
            _hasSeasons = hasSeasons;
            RefreshImmediate();
        }

        private void DrawIconButton(Graphics g2d, int x, int y, Bitmap? icon, string fallbackText)
        {
            using (SolidBrush brush = new SolidBrush(Color.FromArgb(60, 80, 80, 80)))
            {
                g2d.FillRoundedRectangle(brush, x, y, _buttonSize, _buttonSize, 5);
            }

            using (Pen borderPen = new Pen(Color.FromArgb(150, 150, 150), 2))
            {
                g2d.DrawRoundedRectangle(borderPen, x, y, _buttonSize, _buttonSize, 5);
            }

            if (icon != null)
            {
                int iconSize = (int)(_buttonSize * 0.6f);

                int iconX = x + (_buttonSize - iconSize) / 2;
                int iconY = y + (_buttonSize - iconSize) / 2;

                g2d.InterpolationMode = InterpolationMode.HighQualityBicubic;
                g2d.CompositingQuality = CompositingQuality.HighQuality;
                g2d.SmoothingMode = SmoothingMode.HighQuality;

                g2d.DrawImage(icon, iconX, iconY, iconSize, iconSize);
            }
            else
            {
                using (Font font = new Font("Segoe UI Symbol", 12, FontStyle.Bold))
                using (SolidBrush textBrush = new SolidBrush(Color.White))
                {
                    RectangleF rect = new RectangleF(x, y, _buttonSize, _buttonSize);
                    StringFormat sf = new StringFormat
                    {
                        Alignment = StringAlignment.Center,
                        LineAlignment = StringAlignment.Center
                    };
                    g2d.DrawString(fallbackText, font, textBrush, rect, sf);
                }
            }
        }

        private void DrawVolumeBar(Graphics g2d)
        {
            int volumeY = _buttonsY + _buttonSize / 2;

            using (Pen pen = new Pen(Color.FromArgb(100, 100, 100), _volumeBarHeight))
            {
                pen.StartCap = LineCap.Round;
                pen.EndCap = LineCap.Round;
                g2d.DrawLine(pen, _volumeBarX, volumeY, _volumeBarX + _volumeBarWidth, volumeY);
            }

            int volumeProgressX = _volumeBarX + (int)(_volumeProgress * _volumeBarWidth);
            using (Pen pen = new Pen(_colorYellow, _volumeBarHeight))
            {
                pen.StartCap = LineCap.Round;
                pen.EndCap = LineCap.Round;
                g2d.DrawLine(pen, _volumeBarX, volumeY, volumeProgressX, volumeY);
            }

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

        public void SetPlaying(bool playing)
        {
            _isPlaying = playing;
            RefreshImmediate();
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

        public void SetMuted(bool isMuted)
        {
            _isMuted = isMuted;
            RefreshImmediate();
        }

        public void SetVolume(int volume)
        {
            _volumeProgress = volume / 100f;
            RefreshImmediate();
        }

        public interface IProgressChangeListener
        {
            void OnProgressChanged(float progress);
            void OnProgressChanging(float progress);
            void OnPlayPauseClicked(bool isPlaying);
            void OnBackwardClicked();
            void OnForwardClicked();
            void OnVolumeClicked();
            void OnVolumeChanged(int volume);
            void OnFullscreenClicked();
            void OnSettingsClicked(int buttonX, int buttonY, int buttonSize);
            void OnSeasonsClicked(int buttonX, int buttonY, int buttonSize);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _playIcon?.Dispose();
                _pauseIcon?.Dispose();
                _backwardIcon?.Dispose();
                _forwardIcon?.Dispose();
                _volumeIcon?.Dispose();
                _volumeMuteIcon?.Dispose();
                _seasonsIcon?.Dispose();
                _settingsIcon?.Dispose();
                _fullscreenIcon?.Dispose();
                _fullscreenExitIcon?.Dispose();
                _updateTimer?.Dispose();
            }
            base.Dispose(disposing);
        }
    }

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
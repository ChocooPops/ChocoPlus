using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using System.IO;

namespace ChocoPlayer
{
    public class PlayerControls : Panel
    {
        // ── State ──────────────────────────────────────────────────────────────
        private float _progress       = 0.0f;
        private float _volumeProgress = 0.5f;
        private bool  _isDragging       = false;
        private bool  _isDraggingVolume = false;
        private bool  _isSeekPending    = false;
        private Point _mousePos         = Point.Empty;

        private IProgressChangeListener? _listener;

        public bool IsDragging => _isDragging || _isSeekPending;
        public void SetSeekPending(bool pending) => _isSeekPending = pending;

        private System.Windows.Forms.Timer? _updateTimer;
        private string _timeText    = "00:00:00 / 00:00:00";
        private Color  _colorAccent = Color.FromArgb(255, 211, 1);
        private bool   _isPlaying    = true;
        private bool   _isMuted      = false;
        private bool   _isFullscreen = false;
        private bool   _hasSeasons   = false;

        // ── Layout ────────────────────────────────────────────────────────────
        private const int CONTROLS_HEIGHT     = 95;
        private const int LEFT_MARGIN         = 30;
        private const int RIGHT_MARGIN        = 30;
        private const int BUTTON_SIZE         = 30;
        private const int BUTTON_SPACING      = 16;
        private const int BUTTON_MARGIN_BOTTOM = 16;
        private const int VOLUME_BAR_WIDTH    = 150;
        private const int TIME_TEXT_GAP       = 15;

        // Track sizing — thin by default, grows on hover (YouTube-style)
        private const int TRACK_H_NORMAL  = 3;
        private const int TRACK_H_HOVER   = 6;
        private const int POINT_RADIUS    = 6;
        private const int VOL_H_NORMAL    = 3;
        private const int VOL_H_HOVER     = 5;
        private const int VOL_POINT_RADIUS = 5;

        // Computed positions (set in DrawButtons, used in hit-testing)
        private int _buttonsY;
        private int _playButtonX, _backwardButtonX, _forwardButtonX;
        private int _volumeButtonX, _volumeBarX;
        private int _seasonsButtonX, _settingsButtonX, _fullscreenButtonX;
        private int _timeTextWidth = 0;

        // ── Icons ─────────────────────────────────────────────────────────────
        private Bitmap? _playIcon, _pauseIcon, _backwardIcon, _forwardIcon;
        private Bitmap? _volumeIcon, _volumeMuteIcon, _seasonsIcon, _settingsIcon;
        private Bitmap? _fullscreenIcon, _fullscreenExitIcon;

        // ── Cached GDI objects (0 per-frame allocations at 20 Hz) ─────────────
        private SolidBrush?          _brushAccent;
        private SolidBrush?          _brushTrackBg;
        private SolidBrush?          _brushButtonHover;
        private SolidBrush?          _brushWhite;
        private SolidBrush?          _brushTimeText;
        private Pen?                 _penPointRing;
        private Font?                _fontTime;
        private Font?                _fontFallback;
        private StringFormat?        _sfCenter;
        private LinearGradientBrush? _brushBackground;
        private Size                 _lastSize = Size.Empty;

        // ── Events ────────────────────────────────────────────────────────────
        public event EventHandler<ProgressHoverEventArgs>? ProgressHoverChanged;

        public class ProgressHoverEventArgs : EventArgs
        {
            public int     FormX    { get; }
            public int     FormY    { get; }
            public string? TimeText { get; }
            public ProgressHoverEventArgs(int fx, int fy, string? t) { FormX = fx; FormY = fy; TimeText = t; }
        }

        // ── Constructor ───────────────────────────────────────────────────────
        public PlayerControls()
        {
            this.BackColor    = Color.FromArgb(18, 18, 18);
            this.DoubleBuffered = true;

            LoadIcons();
            InitGDI();

            _timeTextWidth = TextRenderer.MeasureText("00:00:00 / 00:00:00", _fontTime!).Width + 4;

            _updateTimer = new System.Windows.Forms.Timer { Interval = 50 };
            _updateTimer.Tick += (_, _) => { if (!IsDragging) UpdateProgressFromPlayer(); };
            _updateTimer.Start();

            this.MouseDown  += PlayerControls_MouseDown;
            this.MouseUp    += PlayerControls_MouseUp;
            this.MouseMove  += PlayerControls_MouseMove;
            this.MouseLeave += (_, _) =>
            {
                _mousePos = Point.Empty;
                ProgressHoverChanged?.Invoke(this, new ProgressHoverEventArgs(0, 0, null));
                this.Invalidate();
            };
            this.Resize += (_, _) => RefreshImmediate();
        }

        private void InitGDI()
        {
            _brushAccent      = new SolidBrush(_colorAccent);
            _brushTrackBg     = new SolidBrush(Color.FromArgb(65, 255, 255, 255));
            _brushButtonHover = new SolidBrush(Color.FromArgb(65, 80, 80, 80));
            _brushWhite       = new SolidBrush(Color.White);
            _brushTimeText    = new SolidBrush(Color.FromArgb(190, 190, 190));
            _penPointRing     = new Pen(_colorAccent, 2);
            _fontTime         = new Font("Segoe UI", 9);
            _fontFallback     = new Font("Segoe UI Symbol", 12, FontStyle.Bold);
            _sfCenter         = new StringFormat { Alignment = StringAlignment.Center, LineAlignment = StringAlignment.Center };
        }

        private void LoadIcons()
        {
            try
            {
                string dir = Path.Combine(Path.GetDirectoryName(Application.ExecutablePath) ?? "", "icons");
                _playIcon         = LoadPng(Path.Combine(dir, "play.png"));
                _pauseIcon        = LoadPng(Path.Combine(dir, "pause.png"));
                _backwardIcon     = LoadPng(Path.Combine(dir, "backward.png"));
                _forwardIcon      = LoadPng(Path.Combine(dir, "forward.png"));
                _volumeIcon       = LoadPng(Path.Combine(dir, "volume.png"));
                _volumeMuteIcon   = LoadPng(Path.Combine(dir, "volume-mute.png"));
                _seasonsIcon      = LoadPng(Path.Combine(dir, "seasons.png"));
                _settingsIcon     = LoadPng(Path.Combine(dir, "settings.png"));
                _fullscreenIcon   = LoadPng(Path.Combine(dir, "fullscreen.png"));
                _fullscreenExitIcon = LoadPng(Path.Combine(dir, "fullscreen-exit.png"));
            }
            catch (Exception ex) { Console.WriteLine($"Icon load error: {ex.Message}"); }
        }

        private static Bitmap? LoadPng(string path)
        {
            try { return new Bitmap(path); }
            catch { return null; }
        }

        // ── Public API ────────────────────────────────────────────────────────
        public void SetPosition(int width, int height)
            => this.SetBounds(0, height - CONTROLS_HEIGHT, width, CONTROLS_HEIGHT);

        public int  GetControlsHeight()       => CONTROLS_HEIGHT;
        public int  GetSettingX()             => _settingsButtonX + BUTTON_SIZE;
        public int  GetSeasonsButtonX()       => _seasonsButtonX  + BUTTON_SIZE;
        public int  GetButtonSize()           => BUTTON_SIZE;
        public bool IsClickOnSettingsButton(int mx, int my) => IsOverButton(mx, my, _settingsButtonX);
        public bool IsClickOnSeasonsButton(int mx, int my)  => _hasSeasons && IsOverButton(mx, my, _seasonsButtonX);

        public void SetPlaying(bool p)    { _isPlaying    = p;            RefreshImmediate(); }
        public void SetMuted(bool m)      { _isMuted      = m;            RefreshImmediate(); }
        public void SetFullscreen(bool f) { _isFullscreen = f;            RefreshImmediate(); }
        public void SetHasSeasons(bool h) { _hasSeasons   = h;            RefreshImmediate(); }
        public void SetVolume(int vol)    { _volumeProgress = vol / 100f; RefreshImmediate(); }
        public void StopTimer()           => _updateTimer?.Stop();
        public void SetProgressChangeListener(IProgressChangeListener l) => _listener = l;

        // ── Mouse input ───────────────────────────────────────────────────────
        private void PlayerControls_MouseDown(object? sender, MouseEventArgs e)
        {
            int lineY     = GetProgressBarY();
            int lineEnd   = GetProgressLineEnd();
            int progressX = LEFT_MARGIN + (int)(_progress * (lineEnd - LEFT_MARGIN));

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
            _isDraggingVolume = false;
        }

        private void PlayerControls_MouseMove(object? sender, MouseEventArgs e)
        {
            _mousePos = e.Location;

            if (_isDragging)
            {
                UpdateProgress(e.X);
                FireHoverEvent(e.X);
                return;
            }
            if (_isDraggingVolume)
            {
                UpdateVolume(e.X);
                return;
            }

            int lineY     = GetProgressBarY();
            int lineEnd   = GetProgressLineEnd();
            int progressX = LEFT_MARGIN + (int)(_progress * (lineEnd - LEFT_MARGIN));
            bool overProg = IsOverPoint(e.X, e.Y, progressX, lineY) || IsOverLine(e.X, e.Y, lineY, lineEnd);

            if (overProg)
            {
                this.Cursor = Cursors.Hand;
                FireHoverEvent(e.X);
            }
            else
            {
                ProgressHoverChanged?.Invoke(this, new ProgressHoverEventArgs(0, 0, null));
                this.Cursor = IsOverVolumeLine(e.X, e.Y) || IsOverVolumePoint(e.X, e.Y) || IsOverAnyButton(e.X, e.Y)
                    ? Cursors.Hand : Cursors.Default;
            }

            this.Invalidate(); // Hover effect redrawn on mouse move
        }

        private void HandleButtonClick(int mx, int my)
        {
            if      (IsOverButton(mx, my, _playButtonX))     { _isPlaying = !_isPlaying; _listener?.OnPlayPauseClicked(_isPlaying); RefreshImmediate(); }
            else if (IsOverButton(mx, my, _backwardButtonX)) _listener?.OnBackwardClicked();
            else if (IsOverButton(mx, my, _forwardButtonX))  _listener?.OnForwardClicked();
            else if (IsOverButton(mx, my, _volumeButtonX))   _listener?.OnVolumeClicked();
            else if (IsOverButton(mx, my, _fullscreenButtonX)) _listener?.OnFullscreenClicked();
            else if (IsOverButton(mx, my, _settingsButtonX))
                _listener?.OnSettingsClicked(_settingsButtonX, _buttonsY, BUTTON_SIZE);
            else if (_hasSeasons && IsOverButton(mx, my, _seasonsButtonX))
                _listener?.OnSeasonsClicked(_seasonsButtonX, _buttonsY, BUTTON_SIZE);
        }

        private void UpdateProgress(int mouseX)
        {
            int lineEnd   = GetProgressLineEnd();
            int lineWidth = lineEnd - LEFT_MARGIN;
            _progress = mouseX < LEFT_MARGIN ? 0f
                      : mouseX > lineEnd     ? 1f
                      : (float)(mouseX - LEFT_MARGIN) / lineWidth;
            _listener?.OnProgressChanging(_progress);
            UpdateTimeText();
            RefreshImmediate();
        }

        private void UpdateVolume(int mouseX)
        {
            _volumeProgress = mouseX < _volumeBarX                    ? 0f
                            : mouseX > _volumeBarX + VOLUME_BAR_WIDTH ? 1f
                            : (float)(mouseX - _volumeBarX) / VOLUME_BAR_WIDTH;
            _listener?.OnVolumeChanged((int)(_volumeProgress * 100));
            RefreshImmediate();
        }

        private void UpdateProgressFromPlayer()
        {
            long total   = Player.GetTotalTime();
            long current = Player.GetElapsedTime();
            if (total > 0)
            {
                float np = (float)current / total;
                if (Math.Abs(np - _progress) < 0.0001f) return;
                _progress = np;
            }
            UpdateTimeText();
            RefreshImmediate();
        }

        private void UpdateTimeText()
        {
            long total   = Player.GetTotalTime();
            long current = (long)(_progress * total);
            _timeText = $"{FormatTime(current)} / {FormatTime(total)}";
        }

        private void FireHoverEvent(int localX)
        {
            int lineEnd   = GetProgressLineEnd();
            float hp = localX < LEFT_MARGIN ? 0f
                     : localX > lineEnd     ? 1f
                     : (float)(localX - LEFT_MARGIN) / (lineEnd - LEFT_MARGIN);
            long hoverTime = (long)(hp * Player.GetTotalTime());
            Point fp = this.Parent != null
                ? this.Parent.PointToClient(this.PointToScreen(new Point(localX, 0)))
                : new Point(localX, this.Top);
            ProgressHoverChanged?.Invoke(this, new ProgressHoverEventArgs(fp.X, this.Top, FormatTime(hoverTime)));
        }

        private static string FormatTime(long ms)
        {
            long s = ms / 1000, m = s / 60, h = m / 60;
            return $"{h:D2}:{m % 60:D2}:{s % 60:D2}";
        }

        // ── Geometry helpers ──────────────────────────────────────────────────
        private int  GetProgressBarY()    => this.Height / 2 - 25;
        private int  GetProgressLineEnd() => this.Width - RIGHT_MARGIN - _timeTextWidth - TIME_TEXT_GAP;

        private bool IsOverPoint(int mx, int my, int px, int py)
        {
            int dx = mx - px, dy = my - py;
            return dx * dx + dy * dy <= (POINT_RADIUS + 6) * (POINT_RADIUS + 6);
        }

        private bool IsOverLine(int mx, int my, int lineY, int lineEnd)
            => mx >= LEFT_MARGIN && mx <= lineEnd && my >= lineY - 22 && my <= lineY + 8;

        private bool IsOverVolumeLine(int mx, int my)
        {
            int vy = _buttonsY + BUTTON_SIZE / 2;
            return mx >= _volumeBarX && mx <= _volumeBarX + VOLUME_BAR_WIDTH && my >= vy - 10 && my <= vy + 10;
        }

        private bool IsOverVolumePoint(int mx, int my)
        {
            int vy  = _buttonsY + BUTTON_SIZE / 2;
            int vpx = _volumeBarX + (int)(_volumeProgress * VOLUME_BAR_WIDTH);
            int dx  = mx - vpx, dy = my - vy;
            return dx * dx + dy * dy <= (VOL_POINT_RADIUS + 6) * (VOL_POINT_RADIUS + 6);
        }

        private bool IsOverButton(int mx, int my, int bx)
            => mx >= bx && mx <= bx + BUTTON_SIZE && my >= _buttonsY && my <= _buttonsY + BUTTON_SIZE;

        private bool IsOverAnyButton(int mx, int my)
            => IsOverButton(mx, my, _playButtonX)    || IsOverButton(mx, my, _backwardButtonX)
            || IsOverButton(mx, my, _forwardButtonX)  || IsOverButton(mx, my, _volumeButtonX)
            || (_hasSeasons && IsOverButton(mx, my, _seasonsButtonX))
            || IsOverButton(mx, my, _settingsButtonX) || IsOverButton(mx, my, _fullscreenButtonX);

        // ── Painting ──────────────────────────────────────────────────────────
        private void RefreshImmediate()
        {
            this.Invalidate();
            this.Update();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            var g = e.Graphics;
            g.SmoothingMode     = SmoothingMode.AntiAlias;
            g.TextRenderingHint = System.Drawing.Text.TextRenderingHint.ClearTypeGridFit;

            // Gradient background — recreated only on resize
            if (this.Size != _lastSize && this.Width > 0 && this.Height > 0)
            {
                _brushBackground?.Dispose();
                _brushBackground = new LinearGradientBrush(
                    new Point(0, 0), new Point(0, this.Height),
                    Color.FromArgb(24, 24, 24),
                    Color.FromArgb(10, 10, 10));
                _lastSize = this.Size;
            }
            if (_brushBackground != null)
                g.FillRectangle(_brushBackground, 0, 0, Width, Height);

            // 1-px top separator line — subtle highlight
            using (var sepPen = new Pen(Color.FromArgb(45, 255, 255, 255), 1))
                g.DrawLine(sepPen, 0, 0, Width, 0);

            DrawProgressBar(g);
            DrawButtons(g);
            DrawVolumeBar(g);
        }

        private void DrawProgressBar(Graphics g)
        {
            int lineY     = GetProgressBarY();
            int lineEnd   = GetProgressLineEnd();
            int lineWidth = lineEnd - LEFT_MARGIN;
            int progressX = LEFT_MARGIN + (int)(_progress * lineWidth);

            bool hovered = _isDragging
                        || IsOverLine(_mousePos.X, _mousePos.Y, lineY, lineEnd)
                        || IsOverPoint(_mousePos.X, _mousePos.Y, progressX, lineY);

            int trackH = hovered ? TRACK_H_HOVER : TRACK_H_NORMAL;
            int trackY = lineY - trackH / 2;

            // Gray track background
            g.FillRoundedRectangle(_brushTrackBg!, LEFT_MARGIN, trackY, lineWidth, trackH, trackH);

            // Yellow progress fill
            int fillW = progressX - LEFT_MARGIN;
            if (fillW > 2)
                g.FillRoundedRectangle(_brushAccent!, LEFT_MARGIN, trackY, fillW, trackH, trackH);

            // Progress point — only visible on hover / drag
            if (hovered)
            {
                g.FillEllipse(_brushAccent!,
                    progressX - POINT_RADIUS, lineY - POINT_RADIUS,
                    POINT_RADIUS * 2, POINT_RADIUS * 2);
            }

            // Time text (right-aligned)
            int textX = this.Width - RIGHT_MARGIN - _timeTextWidth;
            int textY = lineY - _fontTime!.Height / 2;
            g.DrawString(_timeText, _fontTime, _brushTimeText!, textX, textY);
        }

        private void DrawButtons(Graphics g)
        {
            _buttonsY         = this.Height - BUTTON_SIZE - BUTTON_MARGIN_BOTTOM;
            _playButtonX      = LEFT_MARGIN;
            _backwardButtonX  = _playButtonX     + BUTTON_SIZE + BUTTON_SPACING;
            _forwardButtonX   = _backwardButtonX + BUTTON_SIZE + BUTTON_SPACING - 10;
            _volumeButtonX    = _forwardButtonX  + BUTTON_SIZE + BUTTON_SPACING;
            _volumeBarX       = _volumeButtonX   + BUTTON_SIZE + BUTTON_SPACING;

            _fullscreenButtonX = Width - RIGHT_MARGIN - BUTTON_SIZE;
            _settingsButtonX   = _fullscreenButtonX - BUTTON_SIZE - BUTTON_SPACING + 5;
            if (_hasSeasons)
                _seasonsButtonX = _settingsButtonX - BUTTON_SIZE - BUTTON_SPACING + 5;

            bool muteOrZero = _isMuted || _volumeProgress == 0;
            DrawIconButton(g, _playButtonX,      _buttonsY, _isPlaying  ? _pauseIcon        : _playIcon,         _isPlaying  ? "⏸" : "▶");
            DrawIconButton(g, _backwardButtonX,  _buttonsY, _backwardIcon,  "⏮");
            DrawIconButton(g, _forwardButtonX,   _buttonsY, _forwardIcon,   "⏭");
            DrawIconButton(g, _volumeButtonX,    _buttonsY, muteOrZero   ? _volumeMuteIcon   : _volumeIcon,       muteOrZero  ? "🔇" : "🔊");
            if (_hasSeasons) DrawIconButton(g, _seasonsButtonX,  _buttonsY, _seasonsIcon,  "📺");
            DrawIconButton(g, _settingsButtonX,  _buttonsY, _settingsIcon, "⚙");
            DrawIconButton(g, _fullscreenButtonX, _buttonsY, _isFullscreen ? _fullscreenExitIcon : _fullscreenIcon, _isFullscreen ? "⊡" : "⛶");
        }

        private void DrawIconButton(Graphics g, int x, int y, Bitmap? icon, string fallback)
        {
            // Flat style : circular hover glow, no border box
            bool hovered = IsOverButton(_mousePos.X, _mousePos.Y, x);
            if (hovered)
            {
                int glowR   = BUTTON_SIZE / 2 + 6;
                int centerX = x + BUTTON_SIZE / 2;
                int centerY = y + BUTTON_SIZE / 2;
                g.FillEllipse(_brushButtonHover!, centerX - glowR, centerY - glowR, glowR * 2, glowR * 2);
            }

            if (icon != null)
            {
                int iconSize = (int)(BUTTON_SIZE * 0.65f);
                int iconX    = x + (BUTTON_SIZE - iconSize) / 2;
                int iconY    = y + (BUTTON_SIZE - iconSize) / 2;
                g.InterpolationMode  = InterpolationMode.HighQualityBicubic;
                g.CompositingQuality = CompositingQuality.HighQuality;
                g.DrawImage(icon, iconX, iconY, iconSize, iconSize);
            }
            else
            {
                g.DrawString(fallback, _fontFallback!, _brushWhite!, new RectangleF(x, y, BUTTON_SIZE, BUTTON_SIZE), _sfCenter!);
            }
        }

        private void DrawVolumeBar(Graphics g)
        {
            int vy  = _buttonsY + BUTTON_SIZE / 2;
            int vpx = _volumeBarX + (int)(_volumeProgress * VOLUME_BAR_WIDTH);

            bool hovered = _isDraggingVolume
                        || IsOverVolumeLine(_mousePos.X, _mousePos.Y)
                        || IsOverVolumePoint(_mousePos.X, _mousePos.Y);

            int trackH = hovered ? VOL_H_HOVER : VOL_H_NORMAL;
            int trackY = vy - trackH / 2;

            // Gray track
            g.FillRoundedRectangle(_brushTrackBg!, _volumeBarX, trackY, VOLUME_BAR_WIDTH, trackH, trackH);

            // Yellow fill
            int fillW = vpx - _volumeBarX;
            if (fillW > 2)
                g.FillRoundedRectangle(_brushAccent!, _volumeBarX, trackY, fillW, trackH, trackH);

            // Volume point — only on hover
            if (hovered)
            {
                g.FillEllipse(_brushAccent!,
                    vpx - VOL_POINT_RADIUS, vy - VOL_POINT_RADIUS,
                    VOL_POINT_RADIUS * 2, VOL_POINT_RADIUS * 2);
            }
        }

        // ── Interface ─────────────────────────────────────────────────────────
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

        // ── Dispose ───────────────────────────────────────────────────────────
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _playIcon?.Dispose();       _pauseIcon?.Dispose();
                _backwardIcon?.Dispose();   _forwardIcon?.Dispose();
                _volumeIcon?.Dispose();     _volumeMuteIcon?.Dispose();
                _seasonsIcon?.Dispose();    _settingsIcon?.Dispose();
                _fullscreenIcon?.Dispose(); _fullscreenExitIcon?.Dispose();
                _updateTimer?.Dispose();

                _brushAccent?.Dispose();      _brushTrackBg?.Dispose();
                _brushButtonHover?.Dispose(); _brushWhite?.Dispose();
                _brushTimeText?.Dispose();    _penPointRing?.Dispose();
                _fontTime?.Dispose();         _fontFallback?.Dispose();
                _sfCenter?.Dispose();         _brushBackground?.Dispose();
            }
            base.Dispose(disposing);
        }
    }

    public static class GraphicsExtensions
    {
        public static void FillRoundedRectangle(this Graphics g, Brush brush, int x, int y, int width, int height, int radius)
        {
            if (width <= 0 || height <= 0) return;
            radius = Math.Min(radius, Math.Min(width, height));
            using GraphicsPath path = GetRoundedRectPath(x, y, width, height, radius);
            g.FillPath(brush, path);
        }

        public static void DrawRoundedRectangle(this Graphics g, Pen pen, int x, int y, int width, int height, int radius)
        {
            if (width <= 0 || height <= 0) return;
            radius = Math.Min(radius, Math.Min(width, height));
            using GraphicsPath path = GetRoundedRectPath(x, y, width, height, radius);
            g.DrawPath(pen, path);
        }

        private static GraphicsPath GetRoundedRectPath(int x, int y, int width, int height, int radius)
        {
            GraphicsPath path = new GraphicsPath();
            path.AddArc(x,                   y,                    radius, radius, 180, 90);
            path.AddArc(x + width - radius,  y,                    radius, radius, 270, 90);
            path.AddArc(x + width - radius,  y + height - radius,  radius, radius,   0, 90);
            path.AddArc(x,                   y + height - radius,  radius, radius,  90, 90);
            path.CloseFigure();
            return path;
        }
    }
}

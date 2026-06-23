using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;
using System.IO;
using System.Runtime.InteropServices;

namespace ChocoPlayer
{
    public class MiniPlayerButton : Panel
    {
        private const int BUTTON_SIZE         = 30;
        private const int BUTTON_MARGIN       = 10;
        private const int TITLE_BAR_HEIGHT    = 40;
        private const int RESIZE_BORDER       = 8;

        private const int WM_NCLBUTTONDOWN = 0xA1;
        private const int HTCAPTION       = 2;
        private const int HTLEFT          = 10;
        private const int HTRIGHT         = 11;
        private const int HTTOP           = 12;
        private const int HTTOPLEFT       = 13;
        private const int HTTOPRIGHT      = 14;
        private const int HTBOTTOM        = 15;
        private const int HTBOTTOMLEFT    = 16;
        private const int HTBOTTOMRIGHT   = 17;

        [DllImport("user32.dll")]
        private static extern bool ReleaseCapture();
        [DllImport("user32.dll")]
        private static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

        // ── State ─────────────────────────────────────────────────────────────
        private bool   _isMiniMode      = false;
        private bool   _buttonsVisible  = true;
        private Point  _mousePos        = Point.Empty;
        private string _title           = "ChocoPlayer";
        private IMiniPlayerListener? _listener;

        // ── Layout rects ──────────────────────────────────────────────────────
        private Rectangle _toggleButtonRect;
        private Rectangle _closeButtonRect;

        // ── Window state saved for restore ────────────────────────────────────
        private FormWindowState _originalWindowState;
        private Rectangle       _originalBounds;
        private FormBorderStyle _originalBorderStyle;

        // ── Icons ─────────────────────────────────────────────────────────────
        private Bitmap? _miniPlayerIcon;
        private Bitmap? _restoreIcon;
        private Bitmap? _closeIcon;

        // ── Cached GDI ────────────────────────────────────────────────────────
        private readonly Color _accentColor = Color.FromArgb(255, 211, 1);
        private LinearGradientBrush? _brushBackground;
        private Size     _lastSize    = Size.Empty;
        private ToolTip? _tooltip;

        public MiniPlayerButton()
        {
            this.BackColor      = Color.Transparent;
            this.DoubleBuffered = true;
            this.Visible        = true;

            LoadIcons();

            _tooltip = new ToolTip
            {
                InitialDelay = 500,
                ReshowDelay  = 200,
                AutoPopDelay = 3000,
                ShowAlways   = true
            };
            _tooltip.SetToolTip(this, "Mini player");

            this.MouseDown  += MiniPlayerButton_MouseDown;
            this.MouseMove  += MiniPlayerButton_MouseMove;
            this.MouseLeave += (_, _) => { _mousePos = Point.Empty; this.Invalidate(); };
            this.Paint      += MiniPlayerButton_Paint;
            this.Resize     += (_, _) => { if (_isMiniMode) RecalcRects(this.Width); this.Invalidate(); };
        }

        // ── Icons ─────────────────────────────────────────────────────────────
        private void LoadIcons()
        {
            try
            {
                string dir = Path.Combine(Path.GetDirectoryName(Application.ExecutablePath) ?? "", "icons");
                _miniPlayerIcon = LoadPng(Path.Combine(dir, "mini-player.png"));
                _restoreIcon    = LoadPng(Path.Combine(dir, "restore-player.png"));
                _closeIcon      = LoadPng(Path.Combine(dir, "close.png"));
            }
            catch (Exception ex) { Console.WriteLine($"Icon load error: {ex.Message}"); }
        }

        private static Bitmap? LoadPng(string path)
        {
            try { return File.Exists(path) ? new Bitmap(path) : null; }
            catch { return null; }
        }

        // ── Public API ────────────────────────────────────────────────────────
        public void SetPosition(int windowWidth)
        {
            if (_isMiniMode)
            {
                this.Dock = DockStyle.Top;
                this.SetBounds(0, 0, windowWidth, TITLE_BAR_HEIGHT);
                RecalcRects(windowWidth);
            }
            else
            {
                this.Dock = DockStyle.None;
                int x = windowWidth - BUTTON_SIZE - BUTTON_MARGIN - 2;
                this.SetBounds(x, 10, BUTTON_SIZE + 1, BUTTON_SIZE + 1);
                _toggleButtonRect = new Rectangle(0, 0, BUTTON_SIZE, BUTTON_SIZE);
            }
        }

        private void RecalcRects(int width)
        {
            int rightEdge = width - BUTTON_MARGIN;
            int btnY = (TITLE_BAR_HEIGHT - BUTTON_SIZE) / 2;
            _closeButtonRect  = new Rectangle(rightEdge - BUTTON_SIZE, btnY, BUTTON_SIZE, BUTTON_SIZE);
            _toggleButtonRect = new Rectangle(rightEdge - BUTTON_SIZE * 2 - BUTTON_MARGIN, btnY, BUTTON_SIZE, BUTTON_SIZE);
        }

        public void ShowButtons() { if (!_buttonsVisible) { _buttonsVisible = true;  this.Invalidate(); } }
        public void HideButtons() { if (_buttonsVisible)  { _buttonsVisible = false; this.Invalidate(); } }

        public bool IsMiniMode() => _isMiniMode;
        public int  GetTitleBarHeight() => TITLE_BAR_HEIGHT;

        public void SetMiniMode(bool isMiniMode)
        {
            if (_isMiniMode == isMiniMode) return;
            _isMiniMode = isMiniMode;
            UpdateTooltip();
            Form? form = this.FindForm();
            if (form != null) SetPosition(form.ClientSize.Width);
            this.Invalidate();
        }

        public void SetMiniPlayerListener(IMiniPlayerListener listener) => _listener = listener;

        public void SetTitle(string title)
        {
            _title = string.IsNullOrWhiteSpace(title) ? "ChocoPlayer" : title;
            if (_isMiniMode) this.Invalidate();
        }

        // ── Paint ─────────────────────────────────────────────────────────────
        private void MiniPlayerButton_Paint(object? sender, PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode     = SmoothingMode.AntiAlias;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;

            if (_isMiniMode)
                DrawTitleBar(g);
            else
                DrawToggleButton(g);
        }

        private void DrawTitleBar(Graphics g)
        {
            // Gradient background
            if (this.Size != _lastSize && this.Width > 0 && this.Height > 0)
            {
                _brushBackground?.Dispose();
                _brushBackground = new LinearGradientBrush(
                    new Point(0, 0), new Point(0, this.Height),
                    Color.FromArgb(28, 28, 28),
                    Color.FromArgb(18, 18, 18));
                _lastSize = this.Size;
            }
            if (_brushBackground != null)
                g.FillRectangle(_brushBackground, 0, 0, Width, Height);

            // Ligne d'accent jaune en bas
            using (var accentPen = new Pen(_accentColor, 1))
                g.DrawLine(accentPen, 0, Height - 1, Width, Height - 1);

            // Titre à gauche
            int titleX = BUTTON_MARGIN + 8;
            using (Font f = new Font("Segoe UI", 9))
            using (SolidBrush b = new SolidBrush(Color.FromArgb(190, 190, 190)))
                g.DrawString(_title, f, b, titleX, (Height - f.Height) / 2);

            if (!_buttonsVisible) return;

            // Bouton restore
            DrawTitleBarButton(g, _toggleButtonRect, _restoreIcon, "⊞",
                isHovered: _toggleButtonRect.Contains(_mousePos),
                isClose:   false);

            // Bouton fermer
            DrawTitleBarButton(g, _closeButtonRect, _closeIcon, "✕",
                isHovered: _closeButtonRect.Contains(_mousePos),
                isClose:   true);
        }

        private void DrawTitleBarButton(Graphics g, Rectangle rect, Bitmap? icon, string fallback,
                                         bool isHovered, bool isClose)
        {
            if (isHovered)
            {
                int glowR   = rect.Width / 2 + 5;
                int centerX = rect.X + rect.Width  / 2;
                int centerY = rect.Y + rect.Height / 2;
                Color glowColor = isClose
                    ? Color.FromArgb(55, 220, 50, 50)
                    : Color.FromArgb(38, 255, 255, 255);
                using (SolidBrush glowBrush = new SolidBrush(glowColor))
                    g.FillEllipse(glowBrush, centerX - glowR, centerY - glowR, glowR * 2, glowR * 2);
            }

            DrawIconOrText(g, rect, icon, fallback,
                isHovered && isClose ? Color.FromArgb(220, 80, 80) : Color.White);
        }

        private void DrawToggleButton(Graphics g)
        {
            bool hovered = _mousePos != Point.Empty && _toggleButtonRect.Contains(_mousePos);

            // Fond : plus opaque au hover
            int bgAlpha = hovered ? 110 : 55;
            using (SolidBrush bg = new SolidBrush(Color.FromArgb(bgAlpha, 0, 0, 0)))
                g.FillRoundedRectangle(bg, _toggleButtonRect.X, _toggleButtonRect.Y,
                    _toggleButtonRect.Width, _toggleButtonRect.Height, 8);

            if (hovered)
            {
                // Bordure grise carrée
                using (Pen pen = new Pen(Color.FromArgb(150, 130, 130, 130), 1f))
                    g.DrawRectangle(pen,
                        _toggleButtonRect.X + 1, _toggleButtonRect.Y + 1,
                        _toggleButtonRect.Width - 2, _toggleButtonRect.Height - 2);
            }

            Color iconColor = Color.FromArgb(210, 210, 210);
            DrawIconOrText(g, _toggleButtonRect, _miniPlayerIcon, "⊟", iconColor);
        }

        private void DrawIconOrText(Graphics g, Rectangle rect, Bitmap? icon, string fallback, Color textColor)
        {
            if (icon != null)
            {
                int iconSize = (int)(rect.Width * 0.6f);
                int ix = rect.X + (rect.Width  - iconSize) / 2;
                int iy = rect.Y + (rect.Height - iconSize) / 2;
                g.DrawImage(icon, ix, iy, iconSize, iconSize);
            }
            else
            {
                using Font font = new Font("Segoe UI Symbol", 10, FontStyle.Bold);
                using SolidBrush brush = new SolidBrush(textColor);
                using StringFormat sf = new StringFormat
                {
                    Alignment     = StringAlignment.Center,
                    LineAlignment = StringAlignment.Center
                };
                g.DrawString(fallback, font, brush, rect, sf);
            }
        }

        // ── Mouse ─────────────────────────────────────────────────────────────
        private void MiniPlayerButton_MouseMove(object? sender, MouseEventArgs e)
        {
            _mousePos = e.Location;
            this.Invalidate();

            if (_toggleButtonRect.Contains(e.Location) || (_isMiniMode && _closeButtonRect.Contains(e.Location)))
            {
                this.Cursor = Cursors.Hand;
            }
            else if (_isMiniMode)
            {
                UpdateCursorForHitTest(GetResizeHitTest(e.Location));
            }
            else
            {
                this.Cursor = Cursors.Default;
            }
        }

        private void MiniPlayerButton_MouseDown(object? sender, MouseEventArgs e)
        {
            if (e.Button != MouseButtons.Left) return;

            if (_toggleButtonRect.Contains(e.Location))
            {
                ToggleMiniMode();
            }
            else if (_isMiniMode && _closeButtonRect.Contains(e.Location))
            {
                this.FindForm()?.Close();
            }
            else if (_isMiniMode)
            {
                ReleaseCapture();
                SendMessage(this.FindForm()!.Handle, WM_NCLBUTTONDOWN, GetResizeHitTest(e.Location), 0);
            }
        }

        private int GetResizeHitTest(Point location)
        {
            Form? form = this.FindForm();
            if (form == null) return HTCAPTION;

            Point p = form.PointToClient(this.PointToScreen(location));
            int x = p.X, y = p.Y;
            int w = form.ClientSize.Width, h = form.ClientSize.Height;

            bool left   = x <= RESIZE_BORDER;
            bool right  = x >= w - RESIZE_BORDER;
            bool top    = y <= RESIZE_BORDER;
            bool bottom = y >= h - RESIZE_BORDER;

            if (top    && left)  return HTTOPLEFT;
            if (top    && right) return HTTOPRIGHT;
            if (bottom && left)  return HTBOTTOMLEFT;
            if (bottom && right) return HTBOTTOMRIGHT;
            if (top)    return HTTOP;
            if (bottom) return HTBOTTOM;
            if (left)   return HTLEFT;
            if (right)  return HTRIGHT;
            return HTCAPTION;
        }

        private void UpdateCursorForHitTest(int hitTest)
        {
            this.Cursor = hitTest switch
            {
                HTLEFT or HTRIGHT           => Cursors.SizeWE,
                HTTOP  or HTBOTTOM          => Cursors.SizeNS,
                HTTOPLEFT or HTBOTTOMRIGHT  => Cursors.SizeNWSE,
                HTTOPRIGHT or HTBOTTOMLEFT  => Cursors.SizeNESW,
                _                           => Cursors.Default,
            };
        }

        // ── Mini mode toggle ──────────────────────────────────────────────────
        private void ToggleMiniMode()
        {
            _isMiniMode = !_isMiniMode;
            UpdateTooltip();
            _listener?.OnMiniModeToggled(_isMiniMode);
            this.Invalidate();
        }

        private void UpdateTooltip()
        {
            _tooltip?.SetToolTip(this, _isMiniMode ? "" : "Mini player");
        }

        // ── Window state management ───────────────────────────────────────────
        public void StoreOriginalWindowState(Form form)
        {
            _originalWindowState = form.WindowState;
            _originalBounds      = form.Bounds;
            _originalBorderStyle = form.FormBorderStyle;
        }

        public void ApplyMiniMode(Form form)
        {
            StoreOriginalWindowState(form);

            float scaleX, scaleY;
            using (Graphics g = form.CreateGraphics())
            {
                scaleX = g.DpiX / 96f;
                scaleY = g.DpiY / 96f;
            }

            Rectangle workingArea = Screen.FromControl(form).WorkingArea;
            int miniWidth  = (int)(500 * scaleX);
            int miniHeight = (int)(281 * scaleY);
            int margin     = (int)(20  * scaleX);

            if (form.WindowState == FormWindowState.Maximized)
                form.WindowState = FormWindowState.Normal;

            form.FormBorderStyle = FormBorderStyle.None;
            form.SetBounds(workingArea.Right - miniWidth - margin,
                           workingArea.Bottom - miniHeight - margin,
                           miniWidth, miniHeight);
            form.TopMost = true;
        }

        public void RestoreOriginalMode(Form form)
        {
            form.TopMost = false;
            form.FormBorderStyle = _originalBorderStyle;

            if (_originalWindowState == FormWindowState.Maximized)
                form.WindowState = FormWindowState.Maximized;
            else
            {
                form.Bounds      = _originalBounds;
                form.WindowState = _originalWindowState;
            }
        }

        // ── Dispose ───────────────────────────────────────────────────────────
        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _miniPlayerIcon?.Dispose();
                _restoreIcon?.Dispose();
                _closeIcon?.Dispose();
                _brushBackground?.Dispose();
                _tooltip?.Dispose();
            }
            base.Dispose(disposing);
        }

        public interface IMiniPlayerListener
        {
            void OnMiniModeToggled(bool isMiniMode);
        }
    }
}

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
        private const int BUTTON_SIZE = 30;
        private const int BUTTON_MARGIN = 12;
        private const int TITLE_BAR_HEIGHT = 40;

        private Bitmap? _miniPlayerIcon;
        private Bitmap? _restoreIcon;
        private Bitmap? _closeIcon;

        private bool _isMiniMode = false;
        private IMiniPlayerListener? _listener;

        private Rectangle _toggleButtonRect;
        private Rectangle _closeButtonRect;

        private FormWindowState _originalWindowState;
        private Rectangle _originalBounds;
        private FormBorderStyle _originalBorderStyle;

        private const int WM_NCLBUTTONDOWN = 0xA1;
        private const int HTCAPTION = 2;
        private const int HTLEFT = 10;
        private const int HTRIGHT = 11;
        private const int HTTOP = 12;
        private const int HTTOPLEFT = 13;
        private const int HTTOPRIGHT = 14;
        private const int HTBOTTOM = 15;
        private const int HTBOTTOMLEFT = 16;
        private const int HTBOTTOMRIGHT = 17;

        private const int RESIZE_BORDER = 8;

        [DllImport("user32.dll")]
        private static extern bool ReleaseCapture();

        [DllImport("user32.dll")]
        private static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

        public MiniPlayerButton()
        {
            this.BackColor = Color.Transparent;
            this.DoubleBuffered = true;
            this.Visible = true;
            LoadIcons();

            this.MouseDown += MiniPlayerButton_MouseDown;
            this.MouseMove += MiniPlayerButton_MouseMove;
            this.Paint += MiniPlayerButton_Paint;
            this.Resize += MiniPlayerButton_Resize;
        }

        private void MiniPlayerButton_Resize(object? sender, EventArgs e)
        {
            if (_isMiniMode)
            {
                int rightEdge = this.Width - BUTTON_MARGIN;
                _closeButtonRect = new Rectangle(rightEdge - BUTTON_SIZE, (TITLE_BAR_HEIGHT - BUTTON_SIZE) / 2, BUTTON_SIZE, BUTTON_SIZE);
                _toggleButtonRect = new Rectangle(rightEdge - BUTTON_SIZE * 2 - BUTTON_MARGIN, (TITLE_BAR_HEIGHT - BUTTON_SIZE) / 2, BUTTON_SIZE, BUTTON_SIZE);
                this.Invalidate();
            }
        }

        private void LoadIcons()
        {
            try
            {
                string iconsPath = Path.Combine(
                    Path.GetDirectoryName(Application.ExecutablePath) ?? "",
                    "icons"
                );

                _miniPlayerIcon = LoadPngIcon(Path.Combine(iconsPath, "mini-player.png"));
                _restoreIcon = LoadPngIcon(Path.Combine(iconsPath, "restore-player.png"));
                _closeIcon = LoadPngIcon(Path.Combine(iconsPath, "close.png"));
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors du chargement des icônes mini player: {ex.Message}");
            }
        }

        private Bitmap? LoadPngIcon(string pngPath)
        {
            try
            {
                if (File.Exists(pngPath))
                {
                    return new Bitmap(pngPath);
                }
                return null;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors du chargement de {pngPath}: {ex.Message}");
                return null;
            }
        }

        public void SetPosition(int windowWidth)
        {
            if (_isMiniMode)
            {
                this.SetBounds(0, 0, windowWidth, TITLE_BAR_HEIGHT);
                this.Dock = DockStyle.Top;

                int rightEdge = windowWidth - BUTTON_MARGIN;
                _closeButtonRect = new Rectangle(rightEdge - BUTTON_SIZE, (TITLE_BAR_HEIGHT - BUTTON_SIZE) / 2, BUTTON_SIZE, BUTTON_SIZE);
                _toggleButtonRect = new Rectangle(rightEdge - BUTTON_SIZE * 2 - BUTTON_MARGIN, (TITLE_BAR_HEIGHT - BUTTON_SIZE) / 2, BUTTON_SIZE, BUTTON_SIZE);
            }
            else
            {
                int x = windowWidth - BUTTON_SIZE - BUTTON_MARGIN - 2;
                int y = 10;

                this.Dock = DockStyle.None;
                this.SetBounds(x, y, BUTTON_SIZE + 1, BUTTON_SIZE + 1);
                _toggleButtonRect = new Rectangle(0, 0, BUTTON_SIZE, BUTTON_SIZE);
            }
        }

        private void MiniPlayerButton_Paint(object? sender, PaintEventArgs e)
        {
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.InterpolationMode = InterpolationMode.HighQualityBicubic;
            g.CompositingQuality = CompositingQuality.HighQuality;

            if (_isMiniMode)
            {
                using (SolidBrush brush = new SolidBrush(Color.FromArgb(0, 0, 0)))
                {
                    g.FillRectangle(brush, 0, 0, this.Width, this.Height);
                }

                using (Pen borderPen = new Pen(Color.FromArgb(0, 0, 0), 1))
                {
                    g.DrawLine(borderPen, 0, this.Height - 1, this.Width, this.Height - 1);
                }

                DrawButton(g, _toggleButtonRect, _restoreIcon, "⊞");
                DrawButton(g, _closeButtonRect, _closeIcon, "✕");
            }
            else
            {
                using (SolidBrush brush = new SolidBrush(Color.FromArgb(180, 40, 40, 40)))
                {
                    g.FillRoundedRectangle(brush, _toggleButtonRect.X, _toggleButtonRect.Y, _toggleButtonRect.Width, _toggleButtonRect.Height, 8);
                }

                using (Pen borderPen = new Pen(Color.FromArgb(200, 150, 150, 150), 2))
                {
                    g.DrawRoundedRectangle(borderPen, _toggleButtonRect.X, _toggleButtonRect.Y, _toggleButtonRect.Width, _toggleButtonRect.Height, 8);
                }

                DrawIconOrText(g, _toggleButtonRect, _miniPlayerIcon, "⊟");
            }
        }

        private void DrawButton(Graphics g, Rectangle rect, Bitmap? icon, string fallbackText)
        {
            using (SolidBrush brush = new SolidBrush(Color.FromArgb(80, 80, 80)))
            {
                g.FillRoundedRectangle(brush, rect.X, rect.Y, rect.Width, rect.Height, 4);
            }

            using (Pen borderPen = new Pen(Color.FromArgb(100, 100, 100), 1))
            {
                g.DrawRoundedRectangle(borderPen, rect.X, rect.Y, rect.Width, rect.Height, 4);
            }

            DrawIconOrText(g, rect, icon, fallbackText);
        }

        private void DrawIconOrText(Graphics g, Rectangle rect, Bitmap? icon, string fallbackText)
        {
            if (icon != null)
            {
                int iconSize = (int)(rect.Width * 0.6f);
                int iconX = rect.X + (rect.Width - iconSize) / 2;
                int iconY = rect.Y + (rect.Height - iconSize) / 2;

                g.DrawImage(icon, iconX, iconY, iconSize, iconSize);
            }
            else
            {
                using (Font font = new Font("Segoe UI Symbol", 10, FontStyle.Bold))
                using (SolidBrush textBrush = new SolidBrush(Color.White))
                {
                    StringFormat sf = new StringFormat
                    {
                        Alignment = StringAlignment.Center,
                        LineAlignment = StringAlignment.Center
                    };
                    g.DrawString(fallbackText, font, textBrush, rect, sf);
                }
            }
        }

        private void MiniPlayerButton_MouseDown(object? sender, MouseEventArgs e)
        {
            if (e.Button != MouseButtons.Left)
                return;

            if (_toggleButtonRect.Contains(e.Location))
            {
                ToggleMiniMode();
            }
            else if (_isMiniMode && _closeButtonRect.Contains(e.Location))
            {
                CloseApplication();
            }
            else if (_isMiniMode)
            {
                int hitTest = GetResizeHitTest(e.Location);

                ReleaseCapture();
                SendMessage(this.FindForm()!.Handle, WM_NCLBUTTONDOWN, hitTest, 0);
            }
        }

        private int GetResizeHitTest(Point location)
        {
            Form? form = this.FindForm();
            if (form == null)
                return HTCAPTION;

            Point formLocation = form.PointToClient(this.PointToScreen(location));

            int x = formLocation.X;
            int y = formLocation.Y;
            int width = form.ClientSize.Width;
            int height = form.ClientSize.Height;

            bool left = x <= RESIZE_BORDER;
            bool right = x >= width - RESIZE_BORDER;
            bool top = y <= RESIZE_BORDER;
            bool bottom = y >= height - RESIZE_BORDER;

            if (top && left) return HTTOPLEFT;
            if (top && right) return HTTOPRIGHT;
            if (bottom && left) return HTBOTTOMLEFT;
            if (bottom && right) return HTBOTTOMRIGHT;

            if (top) return HTTOP;
            if (bottom) return HTBOTTOM;
            if (left) return HTLEFT;
            if (right) return HTRIGHT;

            return HTCAPTION;
        }

        private void MiniPlayerButton_MouseMove(object? sender, MouseEventArgs e)
        {
            if (_toggleButtonRect.Contains(e.Location) || (_isMiniMode && _closeButtonRect.Contains(e.Location)))
            {
                this.Cursor = Cursors.Hand;
            }
            else if (_isMiniMode)
            {
                int hitTest = GetResizeHitTest(e.Location);
                UpdateCursorForHitTest(hitTest);
            }
            else
            {
                this.Cursor = Cursors.Default;
            }
        }

        private void UpdateCursorForHitTest(int hitTest)
        {
            switch (hitTest)
            {
                case HTLEFT:
                case HTRIGHT:
                    this.Cursor = Cursors.SizeWE;
                    break;
                case HTTOP:
                case HTBOTTOM:
                    this.Cursor = Cursors.SizeNS;
                    break;
                case HTTOPLEFT:
                case HTBOTTOMRIGHT:
                    this.Cursor = Cursors.SizeNWSE;
                    break;
                case HTTOPRIGHT:
                case HTBOTTOMLEFT:
                    this.Cursor = Cursors.SizeNESW;
                    break;
                default:
                    this.Cursor = Cursors.Default;
                    break;
            }
        }

        private void ToggleMiniMode()
        {
            _isMiniMode = !_isMiniMode;
            _listener?.OnMiniModeToggled(_isMiniMode);
            this.Invalidate();
        }

        private void CloseApplication()
        {
            Form? form = this.FindForm();
            if (form != null)
            {
                form.Close();
            }
        }

        public void SetMiniMode(bool isMiniMode)
        {
            if (_isMiniMode != isMiniMode)
            {
                _isMiniMode = isMiniMode;

                if (this.Parent != null)
                {
                    Form? form = this.FindForm();
                    if (form != null)
                    {
                        SetPosition(form.ClientSize.Width);
                    }
                }

                this.Invalidate();
            }
        }

        public bool IsMiniMode() => _isMiniMode;

        public void SetMiniPlayerListener(IMiniPlayerListener listener)
        {
            _listener = listener;
        }

        public void StoreOriginalWindowState(Form form)
        {
            _originalWindowState = form.WindowState;
            _originalBounds = form.Bounds;
            _originalBorderStyle = form.FormBorderStyle;
        }

        public void ApplyMiniMode(Form form)
        {
            StoreOriginalWindowState(form);

            float scaleX = 1f;
            float scaleY = 1f;
            using (Graphics g = form.CreateGraphics())
            {
                scaleX = g.DpiX / 96f;
                scaleY = g.DpiY / 96f;
            }

            Screen screen = Screen.FromControl(form);
            Rectangle workingArea = screen.WorkingArea;

            int miniWidth = (int)(500 * scaleX);
            int miniHeight = (int)(281 * scaleY);
            int margin = (int)(20 * scaleX);
            int posX = workingArea.Right - miniWidth - margin;
            int posY = workingArea.Bottom - miniHeight - margin;

            if (form.WindowState == FormWindowState.Maximized)
            {
                form.WindowState = FormWindowState.Normal;
            }

            form.FormBorderStyle = FormBorderStyle.None;

            form.SetBounds(posX, posY, miniWidth, miniHeight);

            form.TopMost = true;
        }

        public void RestoreOriginalMode(Form form)
        {
            form.TopMost = false;

            form.FormBorderStyle = _originalBorderStyle;

            if (_originalWindowState == FormWindowState.Maximized)
            {
                form.WindowState = FormWindowState.Maximized;
            }
            else
            {
                form.Bounds = _originalBounds;
                form.WindowState = _originalWindowState;
            }
        }

        public int GetTitleBarHeight() => TITLE_BAR_HEIGHT;

        public interface IMiniPlayerListener
        {
            void OnMiniModeToggled(bool isMiniMode);
        }

        protected override void Dispose(bool disposing)
        {
            if (disposing)
            {
                _miniPlayerIcon?.Dispose();
                _restoreIcon?.Dispose();
                _closeIcon?.Dispose();
            }
            base.Dispose(disposing);
        }
    }
}
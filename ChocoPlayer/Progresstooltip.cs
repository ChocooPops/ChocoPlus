using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Windows.Forms;

namespace ChocoPlayer
{
    public class ProgressTooltip : Control
    {
        private string _timeText = "";
        private const int PADDING_H = 14;
        private const int TOOLTIP_HEIGHT = 36;

        public ProgressTooltip()
        {
            this.SetStyle(ControlStyles.OptimizedDoubleBuffer, true);
            this.SetStyle(ControlStyles.AllPaintingInWmPaint, true);
            this.SetStyle(ControlStyles.UserPaint, true);
            this.BackColor = Color.Black;
            this.Size = new Size(80, TOOLTIP_HEIGHT);
            this.Visible = false;
            this.Enabled = false;
        }

        public void ShowAt(int formX, int formY, string timeText)
        {
            _timeText = timeText;

            using (Graphics g = CreateGraphics())
            using (Font font = new Font("Segoe UI", 9, FontStyle.Regular))
            {
                SizeF textSize = g.MeasureString(timeText, font);
                int w = (int)textSize.Width + PADDING_H * 2;
                this.Size = new Size(w, TOOLTIP_HEIGHT);
            }

            int x = formX - this.Width / 2;
            int y = formY - TOOLTIP_HEIGHT - 6;

            if (this.Parent != null)
            {
                x = Math.Max(2, Math.Min(x, this.Parent.ClientSize.Width - this.Width - 2));
                y = Math.Max(2, y);
            }

            this.Location = new Point(x, y);

            if (!this.Visible)
                this.Visible = true;

            this.Invalidate();
            this.Update();
        }

        public void HideTooltip()
        {
            this.Visible = false;
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            if (string.IsNullOrEmpty(_timeText))
                return;

            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;

            g.Clear(Color.Black);

            using (SolidBrush bgBrush = new SolidBrush(Color.FromArgb(230, 30, 30, 30)))
                g.FillRectangle(bgBrush, 0, 0, this.Width, this.Height);

            using (Pen borderPen = new Pen(Color.FromArgb(110, 110, 110), 1))
                g.DrawRectangle(borderPen, 0, 0, this.Width - 1, this.Height - 1);

            using (Font font = new Font("Segoe UI", 9, FontStyle.Regular))
            using (SolidBrush textBrush = new SolidBrush(Color.White))
            {
                SizeF textSize = g.MeasureString(_timeText, font);
                float textY = (this.Height - textSize.Height) / 2f;
                g.DrawString(_timeText, font, textBrush, PADDING_H, textY);
            }
        }
    }
}
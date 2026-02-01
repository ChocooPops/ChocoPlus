using System;
using System.Drawing;
using System.Windows.Forms;
using LibVLCSharp.Shared;
using LibVLCSharp.WinForms;

namespace ChocoPlayer
{
    public class Form1 : Form
    {
        private LibVLC? _libVLC;
        private MediaPlayer? _mediaPlayer;
        private VideoView? _videoView;
        private PlayerControls? _playerControls;
        private TrackSettingsMenu? _trackSettingsMenu;
        private bool _isFullscreen = false;

        public Form1(string title, string videoPath, int width, int height, int positionX, int positionY)
        {
            InitializeVLC();
            SetupUI(title, width, height, positionX, positionY);

            this.FormClosing += Form1_FormClosing;
            this.Resize += Form1_Resize;

            if (!string.IsNullOrEmpty(videoPath))
            {
                OpenFile(videoPath);
            }
        }

        private void InitializeVLC()
        {
            Core.Initialize();

            string[] vlcArgs = new string[]
            {
                "--no-video-title-show",
                "--avcodec-hw=any",
                "--file-caching=2000",
                "--network-caching=3000",
                "--live-caching=1000",
                "--sout-mux-caching=2000",
                "--clock-jitter=1000",
                "--no-sub-autodetect-file",
                "--no-video-deco",
                "--drop-late-frames",
                "--skip-frames",
                "--avcodec-skiploopfilter=4",
                "--avcodec-skip-idct=4",
                "--avcodec-threads=4",
                "--avcodec-fast",
                "--no-plugins-cache",
                "--no-stats",
                "--no-osd",
                "--quiet",
                "--audio-resampler=soxr",
                "--http-reconnect",
                "--http-continuous",
                "--adaptive-logic=highrate",
            };

            _libVLC = new LibVLC();
            _mediaPlayer = new MediaPlayer(_libVLC);

            _mediaPlayer.Playing += (sender, e) =>
            {
                Console.WriteLine("Lecture en cours...");
            };

            _mediaPlayer.Buffering += (sender, e) =>
            {
                Console.WriteLine($"Buffering: {e.Cache}%");
            };

            _mediaPlayer.EncounteredError += (sender, e) =>
            {
                Console.WriteLine("Erreur de lecture!");
                MessageBox.Show("Erreur lors de la lecture du stream", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
            };

            Player.SetMediaPlayer(_mediaPlayer);
        }

        private void SetupUI(string title, int width, int height, int positionX, int positionY)
        {
            this.Text = "ChocoPlayer" + " - " + title;
            this.StartPosition = FormStartPosition.Manual;
            this.Location = new Point(positionX, positionY);
            this.ClientSize = new Size(width, height);
            this.BackColor = Color.Black;

            if (Environment.OSVersion.Version.Build >= 22000)
            {
                UseImmersiveDarkMode(this.Handle, true);
            }

            this.Icon = CreateCustomIcon();
            this.KeyPreview = true;

            this.KeyDown += Form1_KeyDown;

            _videoView = new VideoView
            {
                MediaPlayer = _mediaPlayer,
                BackColor = Color.Black
            };
            this.Controls.Add(_videoView);

            _videoView.MouseDown += VideoView_MouseDown;

            _playerControls = new PlayerControls();
            _playerControls.SetProgressChangeListener(new ProgressListener(this));
            this.Controls.Add(_playerControls);

            _playerControls.MouseDown += PlayerControls_MouseDown;

            _trackSettingsMenu = new TrackSettingsMenu();
            _trackSettingsMenu.SetListener(new TrackListener(this));
            this.Controls.Add(_trackSettingsMenu);
            _trackSettingsMenu.BringToFront();

            UpdateLayout();
        }

        private void VideoView_MouseDown(object? sender, MouseEventArgs e)
        {
            if (_trackSettingsMenu != null && _trackSettingsMenu.Visible)
            {
                Point menuPoint = _trackSettingsMenu.PointToClient(_videoView!.PointToScreen(e.Location));

                if (!_trackSettingsMenu.ClientRectangle.Contains(menuPoint))
                {
                    _trackSettingsMenu.Hide();
                }
            }
        }

        private void PlayerControls_MouseDown(object? sender, MouseEventArgs e)
        {
            if (_trackSettingsMenu != null && _trackSettingsMenu.Visible)
            {
                bool isClickOnSettingsButton = _playerControls!.IsClickOnSettingsButton(e.X, e.Y);

                if (!isClickOnSettingsButton)
                {
                    Point menuPoint = _trackSettingsMenu.PointToClient(_playerControls.PointToScreen(e.Location));

                    if (!_trackSettingsMenu.ClientRectangle.Contains(menuPoint))
                    {
                        _trackSettingsMenu.Hide();
                    }
                }
            }
        }

        private void UpdateLayout()
        {
            _videoView!.SetBounds(0, 0, this.ClientSize.Width, this.ClientSize.Height);

            int controlsHeight = _playerControls!.GetControlsHeight();
            _playerControls.SetBounds(0, this.ClientSize.Height - controlsHeight, this.ClientSize.Width, controlsHeight);
            _playerControls.BringToFront();

            int settingsX = _playerControls.GetSettingX();
            _trackSettingsMenu!.SetPosition(settingsX, this.ClientSize.Height - controlsHeight);
            _trackSettingsMenu.BringToFront();
        }

        private void Form1_Resize(object? sender, EventArgs e)
        {
            UpdateLayout();
        }

        private void OpenFile(string path)
        {
            try
            {
                var media = new Media(_libVLC, path, FromType.FromLocation);

                if (path.StartsWith("http://") || path.StartsWith("https://"))
                {
                    media.AddOption(":http-reconnect");
                    media.AddOption(":network-caching=3000");
                }

                _mediaPlayer!.Media = media;
                _mediaPlayer.Play();
                _playerControls!.SetPlaying(true);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Impossible de lire le média: {ex.Message}", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void ToggleFullscreen()
        {
            if (_isFullscreen)
            {
                this.FormBorderStyle = FormBorderStyle.Sizable;
                this.WindowState = FormWindowState.Normal;
                _isFullscreen = false;
            }
            else
            {
                this.FormBorderStyle = FormBorderStyle.None;
                this.WindowState = FormWindowState.Maximized;
                _isFullscreen = true;
            }
            _playerControls?.SetFullscreen(_isFullscreen);
            UpdateLayout();
        }

        [System.Runtime.InteropServices.DllImport("dwmapi.dll")]
        private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

        private const int DWMWA_USE_IMMERSIVE_DARK_MODE = 20;

        private static bool UseImmersiveDarkMode(IntPtr handle, bool enabled)
        {
            int useImmersiveDarkMode = enabled ? 1 : 0;
            return DwmSetWindowAttribute(handle, DWMWA_USE_IMMERSIVE_DARK_MODE, ref useImmersiveDarkMode, sizeof(int)) == 0;
        }

        private Icon CreateCustomIcon()
        {
            try
            {
                string iconPath = System.IO.Path.Combine(
                    System.IO.Path.GetDirectoryName(Application.ExecutablePath) ?? "",
                    "icon.ico"
                );

                if (System.IO.File.Exists(iconPath))
                {
                    return new Icon(iconPath);
                }
                else
                {
                    return CreateDefaultIcon();
                }
            }
            catch
            {
                return CreateDefaultIcon();
            }
        }

        private Icon CreateDefaultIcon()
        {
            Bitmap bitmap = new Bitmap(32, 32);
            using (Graphics g = Graphics.FromImage(bitmap))
            {
                g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                g.FillEllipse(new SolidBrush(Color.FromArgb(255, 211, 1)), 0, 0, 31, 31);
                using (Font font = new Font("Arial", 16, FontStyle.Bold))
                {
                    g.DrawString("C", font, Brushes.Black, new PointF(8, 4));
                }
            }

            IntPtr hIcon = bitmap.GetHicon();
            Icon icon = Icon.FromHandle(hIcon);
            return icon;
        }

        private void Form1_FormClosing(object? sender, FormClosingEventArgs e)
        {
            _playerControls?.StopTimer();
            _mediaPlayer?.Stop();
            _mediaPlayer?.Dispose();
            _libVLC?.Dispose();
        }

        private class ProgressListener : PlayerControls.IProgressChangeListener
        {
            private Form1 _form;

            public ProgressListener(Form1 form)
            {
                _form = form;
            }

            public void OnProgressChanged(float progress)
            {
                if (_form._mediaPlayer != null)
                {
                    long totalTime = _form._mediaPlayer.Length;
                    long newTime = (long)(progress * totalTime);
                    _form._mediaPlayer.Time = newTime;
                }
            }

            public void OnProgressChanging(float progress)
            {
            }

            public void OnPlayPauseClicked(bool isPlaying)
            {
                if (_form._mediaPlayer != null)
                {
                    if (isPlaying)
                    {
                        _form._mediaPlayer.Play();
                    }
                    else
                    {
                        _form._mediaPlayer.Pause();
                    }
                }
            }

            public void OnVolumeClicked()
            {
                if (_form._mediaPlayer != null)
                {
                    _form._playerControls?.SetMuted(!_form._mediaPlayer.Mute);
                    _form._mediaPlayer.Mute = !_form._mediaPlayer.Mute;
                }
            }

            public void OnVolumeChanged(int volume)
            {
                if (_form._mediaPlayer != null)
                {
                    _form._mediaPlayer.Volume = volume;
                }
            }

            public void OnFullscreenClicked()
            {
                _form.ToggleFullscreen();
            }

            public void OnSettingsClicked(int buttonX, int buttonY, int buttonSize)
            {
                _form.UpdateLayout();
                _form._trackSettingsMenu?.Toggle();
            }
        }

        private void Form1_KeyDown(object? sender, KeyEventArgs e)
        {
            if (_mediaPlayer == null)
                return;

            const int seekMs = 10_000;
            const int volumeStep = 5;

            switch (e.KeyCode)
            {
                case Keys.Right:
                    // Avancer la vidéo
                    _mediaPlayer.Time = Math.Min(
                        _mediaPlayer.Time + seekMs,
                        _mediaPlayer.Length
                    );
                    e.Handled = true;
                    break;

                case Keys.Left:
                    // Reculer la vidéo
                    _mediaPlayer.Time = Math.Max(
                        _mediaPlayer.Time - seekMs,
                        0
                    );
                    e.Handled = true;
                    break;

                case Keys.Up:
                    // Augmenter le volume
                    _mediaPlayer.Volume = Math.Min(_mediaPlayer.Volume + volumeStep, 100);
                    _playerControls?.SetVolume(_mediaPlayer.Volume);
                    e.Handled = true;
                    break;

                case Keys.Down:
                    // Diminuer le volume
                    _mediaPlayer.Volume = Math.Max(_mediaPlayer.Volume - volumeStep, 0);
                    _playerControls?.SetVolume(_mediaPlayer.Volume);
                    e.Handled = true;
                    break;

                case Keys.F11:
                    // Toggle fullscreen
                    ToggleFullscreen();
                    e.Handled = true;
                    break;

                case Keys.Escape:
                    // Sortir du fullscreen
                    if (_isFullscreen)
                    {
                        ToggleFullscreen();
                        e.Handled = true;
                    }
                    break;
            }
        }

        private class TrackListener : TrackSettingsMenu.ITrackSelectionListener
        {
            private Form1 _form;

            public TrackListener(Form1 form)
            {
                _form = form;
            }

            public void OnAudioTrackSelected(int trackId)
            {
                if (_form._mediaPlayer != null)
                {
                    _form._mediaPlayer.SetAudioTrack(trackId);
                }
            }

            public void OnSubtitleTrackSelected(int trackId)
            {
                if (_form._mediaPlayer != null)
                {
                    _form._mediaPlayer.SetSpu(trackId);
                }
            }
        }
    }
}
using System;
using System.Drawing;
using System.Windows.Forms;
using LibVLCSharp.Shared;
using LibVLCSharp.WinForms;
using DarkTitleBar;

namespace ChocoPlayer
{
    public class ChocoPlayer : Form
    {
        private LibVLC? _libVLC;
        private MediaPlayer? _mediaPlayer;
        private VideoView? _videoView;
        private PlayerControls? _playerControls;
        private TrackSettingsMenu? _trackSettingsMenu;
        private bool _isFullscreen = false;

        private const int FULLSCREEN_CONTROLS_WIDTH = 800;

        private const int HIDE_CONTROLS_DELAY = 2000;
        private bool _controlsVisible = true;

        private System.Windows.Forms.Timer? _mouseDetectionTimer;
        private Point _lastMousePosition;
        private DateTime _lastMouseMoveTime;
        private bool _wasMouseButtonDown = false;

        public ChocoPlayer(string title, string videoPath, int width, int height, int positionX, int positionY, bool isMaximized, bool isFullScreen)
        {

            InitializeVLC();
            SetupUI(title, width, height, positionX, positionY, isMaximized, isFullScreen);

            this.FormClosing += Form1_FormClosing;
            this.Resize += Form1_Resize;

            if (!string.IsNullOrEmpty(videoPath))
            {
                OpenFile(videoPath);
            }

            InitializeHideControlsTimer();
        }

        private void InitializeHideControlsTimer()
        {
            _lastMousePosition = Cursor.Position;
            _lastMouseMoveTime = DateTime.Now;

            _mouseDetectionTimer = new System.Windows.Forms.Timer();
            _mouseDetectionTimer.Interval = 50;
            _mouseDetectionTimer.Tick += (s, e) =>
            {
                Point currentPosition = Cursor.Position;

                bool isMouseButtonDown = (Control.MouseButtons & MouseButtons.Left) == MouseButtons.Left;

                if (isMouseButtonDown && !_wasMouseButtonDown)
                {
                    if (_trackSettingsMenu != null && _trackSettingsMenu.Visible)
                    {
                        Point menuPoint = _trackSettingsMenu.PointToClient(currentPosition);

                        Point controlsPoint = _playerControls!.PointToClient(currentPosition);
                        bool isClickOnSettingsButton = false;

                        if (_playerControls.ClientRectangle.Contains(controlsPoint))
                        {
                            isClickOnSettingsButton = _playerControls.IsClickOnSettingsButton(controlsPoint.X, controlsPoint.Y);
                        }

                        if (!_trackSettingsMenu.ClientRectangle.Contains(menuPoint) && !isClickOnSettingsButton)
                        {
                            _trackSettingsMenu.Hide();
                        }
                    }
                }

                _wasMouseButtonDown = isMouseButtonDown;

                bool isMouseInWindow = this.ClientRectangle.Contains(this.PointToClient(currentPosition));

                if (currentPosition != _lastMousePosition)
                {
                    _lastMousePosition = currentPosition;
                    _lastMouseMoveTime = DateTime.Now;

                    if (isMouseInWindow)
                    {
                        ShowControls();
                    }
                }
                else
                {
                    TimeSpan timeSinceLastMove = DateTime.Now - _lastMouseMoveTime;
                    if (timeSinceLastMove.TotalMilliseconds >= HIDE_CONTROLS_DELAY)
                    {
                        if (_trackSettingsMenu == null || !_trackSettingsMenu.Visible)
                        {
                            HideControls();
                        }
                    }
                }

                if (!isMouseInWindow)
                {
                    if (_trackSettingsMenu == null || !_trackSettingsMenu.Visible)
                    {
                        HideControls();
                    }
                }
            };
            _mouseDetectionTimer.Start();
        }

        private void ShowControls()
        {
            if (!_controlsVisible)
            {
                _controlsVisible = true;
                _playerControls!.Visible = true;
                this.Cursor = Cursors.Default;
            }
        }

        private void HideControls()
        {
            _controlsVisible = false;
            _playerControls!.Visible = false;
        }

        private void InitializeVLC()
        {
            Core.Initialize();
            string[] vlcArgs = new string[]
                        {
                // Interface et affichage
                "--no-video-title-show",        // Ne pas afficher le titre
                "--no-osd",                      // Désactiver l'affichage à l'écran
                "--no-video-deco",               // Pas de décorations vidéo
                
                // Cache et buffering (réduit pour économiser la mémoire)
                "--file-caching=1000",           // Cache fichiers locaux : 1s (au lieu de 2s)
                "--network-caching=2000",        // Cache réseau : 2s (au lieu de 3s)
                "--live-caching=500",            // Cache live : 0.5s (au lieu de 1s)
                "--sout-mux-caching=1000",       // Cache mux : 1s (au lieu de 2s)
                
                // Optimisations mémoire
                "--avcodec-hw=any",              // Accélération matérielle (économise CPU et RAM)
                "--avcodec-threads=2",           // 2 threads au lieu de 4 (moins de mémoire)
                "--no-plugins-cache",            // Ne pas mettre en cache les plugins
                "--no-stats",                    // Pas de statistiques
                "--no-sub-autodetect-file",      // Ne pas chercher de sous-titres automatiquement
                
                // Optimisations lecture
                "--drop-late-frames",            // Supprimer les frames en retard
                "--skip-frames",                 // Sauter les frames si nécessaire
                
                // Réduction mémoire supplémentaire
                "--avcodec-skiploopfilter=2",    // Sauter filtre de boucle (2 = non-ref frames)
                "--avcodec-skip-idct=0",         // Ne pas sauter IDCT (0 = jamais)
                "--clock-jitter=0",              // Pas de jitter
                
                "--audio-resampler=soxr",       // Rééchantillonnage audio

                // Mode silencieux
                "--quiet"                        // Pas de logs verbeux
            };

            _libVLC = new LibVLC(vlcArgs);
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

        private void SetupUI(string title, int width, int height, int positionX, int positionY, bool isMaximized, bool isFullScreen)
        {
            this.TopMost = true;
            this.Text = "ChocoPlayer" + " - " + title;
            this.BackColor = Color.Black;
            this.Icon = CreateCustomIcon();
            this.KeyPreview = true;

            DarkTitleBarManager.ApplyDarkTitleBar(this.Handle);

            if (isFullScreen)
            {
                this.FormBorderStyle = FormBorderStyle.None;
                this.WindowState = FormWindowState.Maximized;
                _isFullscreen = true;
            }
            else if (isMaximized)
            {
                this.StartPosition = FormStartPosition.Manual;
                this.WindowState = FormWindowState.Maximized;
            }
            else
            {
                this.StartPosition = FormStartPosition.Manual;
                this.Location = new Point(positionX, positionY);
                this.ClientSize = new Size(width, height);
            }

            _videoView = new VideoView
            {
                MediaPlayer = _mediaPlayer,
                BackColor = Color.Black
            };
            this.Controls.Add(_videoView);

            _playerControls = new PlayerControls();
            _playerControls.SetProgressChangeListener(new ProgressListener(this));
            this.Controls.Add(_playerControls);

            _trackSettingsMenu = new TrackSettingsMenu();
            _trackSettingsMenu.SetListener(new TrackListener(this));
            this.Controls.Add(_trackSettingsMenu);
            _trackSettingsMenu.BringToFront();

            UpdateLayout();
        }

        private void UpdateLayout()
        {
            _videoView!.SetBounds(0, 0, this.ClientSize.Width, this.ClientSize.Height);

            int controlsHeight = _playerControls!.GetControlsHeight();

            if (_isFullscreen)
            {
                // En mode plein écran, largeur fixe centrée
                int controlsX = (this.ClientSize.Width - FULLSCREEN_CONTROLS_WIDTH) / 2;
                _playerControls.SetBounds(controlsX, this.ClientSize.Height - controlsHeight, FULLSCREEN_CONTROLS_WIDTH, controlsHeight);
                _trackSettingsMenu!.SetPosition(this.ClientSize.Width, this.ClientSize.Height - controlsHeight, true);
            }
            else
            {
                // En mode normal, pleine largeur
                _playerControls.SetBounds(0, this.ClientSize.Height - controlsHeight, this.ClientSize.Width, controlsHeight);

                int settingsX = _playerControls.GetSettingX();
                _trackSettingsMenu!.SetPosition(settingsX, this.ClientSize.Height - controlsHeight, false);
            }

            _playerControls.BringToFront();
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
                if (_libVLC != null)
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
                if (this.WindowState == FormWindowState.Maximized)
                {
                    this.WindowState = FormWindowState.Normal;
                }

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
            _mouseDetectionTimer?.Stop();
            _mouseDetectionTimer?.Dispose();
            _playerControls?.StopTimer();
            _mediaPlayer?.Stop();
            _mediaPlayer?.Dispose();
            _libVLC?.Dispose();
        }

        private class ProgressListener : PlayerControls.IProgressChangeListener
        {
            private ChocoPlayer _chocoPlayer;

            public ProgressListener(ChocoPlayer form)
            {
                _chocoPlayer = form;
            }

            public void OnProgressChanged(float progress)
            {
                if (_chocoPlayer._mediaPlayer != null)
                {
                    long totalTime = _chocoPlayer._mediaPlayer.Length;
                    long newTime = (long)(progress * totalTime);
                    _chocoPlayer._mediaPlayer.Time = newTime;
                }
            }

            public void OnProgressChanging(float progress)
            {
            }

            public void OnPlayPauseClicked(bool isPlaying)
            {
                if (_chocoPlayer._mediaPlayer != null)
                {
                    if (isPlaying)
                    {
                        _chocoPlayer._mediaPlayer.Play();
                    }
                    else
                    {
                        _chocoPlayer._mediaPlayer.Pause();
                    }
                }
            }

            public void OnVolumeClicked()
            {
                if (_chocoPlayer._mediaPlayer != null)
                {
                    _chocoPlayer._playerControls?.SetMuted(!_chocoPlayer._mediaPlayer.Mute);
                    _chocoPlayer._mediaPlayer.Mute = !_chocoPlayer._mediaPlayer.Mute;
                }
            }

            public void OnVolumeChanged(int volume)
            {
                if (_chocoPlayer._mediaPlayer != null)
                {
                    _chocoPlayer._mediaPlayer.Volume = volume;
                }
            }

            public void OnFullscreenClicked()
            {
                _chocoPlayer.ToggleFullscreen();
            }

            public void OnSettingsClicked(int buttonX, int buttonY, int buttonSize)
            {
                _chocoPlayer.UpdateLayout();
                _chocoPlayer._trackSettingsMenu?.Toggle();
            }
        }

        protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
        {
            if (_mediaPlayer == null)
                return base.ProcessCmdKey(ref msg, keyData);

            const int seekMs = 10_000;
            const int volumeStep = 5;

            switch (keyData)
            {
                case Keys.Right:
                    _mediaPlayer.Time = Math.Min(
                        _mediaPlayer.Time + seekMs,
                        _mediaPlayer.Length
                    );
                    return true;

                case Keys.Left:
                    _mediaPlayer.Time = Math.Max(
                        _mediaPlayer.Time - seekMs,
                        0
                    );
                    return true;

                case Keys.Up:
                    _mediaPlayer.Volume = Math.Min(_mediaPlayer.Volume + volumeStep, 100);
                    _playerControls?.SetVolume(_mediaPlayer.Volume);
                    return true;

                case Keys.Down:
                    _mediaPlayer.Volume = Math.Max(_mediaPlayer.Volume - volumeStep, 0);
                    _playerControls?.SetVolume(_mediaPlayer.Volume);
                    return true;

                case Keys.Space:
                    if (_mediaPlayer.IsPlaying)
                    {
                        _mediaPlayer.Pause();
                        _playerControls?.SetPlaying(false);
                    }
                    else
                    {
                        _mediaPlayer.Play();
                        _playerControls?.SetPlaying(true);
                    }
                    return true;

                case Keys.F11:
                    ToggleFullscreen();
                    return true;

                case Keys.Escape:
                    if (_isFullscreen)
                    {
                        ToggleFullscreen();
                        _trackSettingsMenu?.Hide();
                        return true;
                    }
                    break;

                case Keys.M:
                    _mediaPlayer.Mute = !_mediaPlayer.Mute;
                    _playerControls?.SetMuted(_mediaPlayer.Mute);
                    return true;
            }

            return base.ProcessCmdKey(ref msg, keyData);
        }

        private const int WM_SYSCOMMAND = 0x0112;
        private const int SC_MAXIMIZE = 0xF030;
        private const int SC_RESTORE = 0xF120;

        protected override void WndProc(ref Message m)
        {
            if (m.Msg == WM_SYSCOMMAND)
            {
                int command = m.WParam.ToInt32() & 0xFFF0;

                if (command == SC_MAXIMIZE || command == SC_RESTORE)
                {
                    _trackSettingsMenu?.Hide();
                    base.WndProc(ref m);
                    this.BeginInvoke(new Action(() =>
                    {
                        UpdateLayout();
                        this.Refresh();
                    }));
                    return;
                }
            }

            base.WndProc(ref m);
        }

        private class TrackListener : TrackSettingsMenu.ITrackSelectionListener
        {
            private ChocoPlayer _chocoPlayer;

            public TrackListener(ChocoPlayer form)
            {
                _chocoPlayer = form;
            }

            public void OnAudioTrackSelected(int trackId)
            {
                if (_chocoPlayer._mediaPlayer != null)
                {
                    _chocoPlayer._mediaPlayer.SetAudioTrack(trackId);
                }
            }

            public void OnSubtitleTrackSelected(int trackId)
            {
                if (_chocoPlayer._mediaPlayer != null)
                {
                    _chocoPlayer._mediaPlayer.SetSpu(trackId);
                }
            }
        }
    }
}
using System;
using System.Drawing;
using System.Windows.Forms;
using System.Runtime.InteropServices;
using System.Linq;
using System.Collections.Generic;

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
        private SeasonsMenu? _seasonsMenu;
        private ApiService? _apiService;
        private MiniPlayerButton? _miniPlayerButton;

        private int _mediaId;
        private int _currentEpisodeId = 0;
        private bool _isFullscreen = false;
        private bool _hasSeasons = false;
        private string _episodeFormat = "300w";

        private Dictionary<int, List<SeasonsMenu.EpisodeItem>> _episodesCache = new Dictionary<int, List<SeasonsMenu.EpisodeItem>>();

        private const int FULLSCREEN_CONTROLS_WIDTH = 800;

        private const int HIDE_CONTROLS_DELAY = 2000;
        private bool _controlsVisible = true;

        private System.Windows.Forms.Timer? _mouseDetectionTimer;
        private Point _lastMousePosition;
        private DateTime _lastMouseMoveTime;
        private bool _wasMouseButtonDown = false;
        private bool _isDraggingOrResizingFromTitleBar = false;

        private bool _isMiniMode = false;
        private const int RESIZE_BORDER = 8;

        private const int WM_NCLBUTTONDOWN = 0xA1;
        private const int HTLEFT = 10;
        private const int HTRIGHT = 11;
        private const int HTBOTTOM = 15;
        private const int HTBOTTOMLEFT = 16;
        private const int HTBOTTOMRIGHT = 17;

        [DllImport("user32.dll")]
        private static extern bool ReleaseCapture();

        [DllImport("user32.dll")]
        private static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

        public ChocoPlayer(int mediaId, string token, string title, string videoPath, int width, int height, int positionX, int positionY, bool isMaximized, bool isFullScreen, int episodeId, int seasonIndex, List<Season>? seasons)
        {
            _mediaId = mediaId;

            _apiService = new ApiService(token);

            InitializeVLC();
            SetupUI(title, width, height, positionX, positionY, isMaximized, isFullScreen, episodeId, seasonIndex, seasons);

            this.FormClosing += ChocoPlayer_FormClosing;
            this.Resize += ChocoPlayer_Resize;

            if (!string.IsNullOrEmpty(videoPath))
            {
                OpenFile(videoPath);
            }

            InitializeHideControlsTimer();
            RestoreMiniModeState();
        }

        private void RestoreMiniModeState()
        {
            try
            {
                bool savedMiniMode = Properties.Settings.Default.IsMiniMode;

                if (savedMiniMode)
                {
                    if (_miniPlayerButton != null)
                    {
                        _miniPlayerButton.SetMiniMode(true);
                    }
                }
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Erreur lors de la restauration du mode mini : {ex.Message}");
            }
        }

        private void SaveMiniModeState()
        {
            try
            {
                Properties.Settings.Default.IsMiniMode = _isMiniMode;
                Properties.Settings.Default.Save();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"Erreur lors de la sauvegarde du mode mini : {ex.Message}");
            }
        }

        private bool GetPropertiesIsMiniMode()
        {
            try
            {
                return Properties.Settings.Default.IsMiniMode;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur lors de la sauvegarde du mode mini : {ex.Message}");
                return false;
            }
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
                bool isOverTitleBar = IsMouseOverMiniPlayerTitleBar(currentPosition);

                if (isMouseButtonDown && !_wasMouseButtonDown && isOverTitleBar)
                {
                    _isDraggingOrResizingFromTitleBar = true;

                    if (_playerControls != null && _playerControls.Visible)
                    {
                        _playerControls.Visible = false;
                        _controlsVisible = false;
                    }

                    if (_miniPlayerButton != null)
                    {
                        _miniPlayerButton.ShowButtons();
                    }
                }

                if (!isMouseButtonDown && _wasMouseButtonDown && _isDraggingOrResizingFromTitleBar)
                {
                    _isDraggingOrResizingFromTitleBar = false;
                }

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

                    if (_seasonsMenu != null && _seasonsMenu.Visible)
                    {
                        Point menuPoint = _seasonsMenu.PointToClient(currentPosition);

                        Point controlsPoint = _playerControls!.PointToClient(currentPosition);
                        bool isClickOnSeasonsButton = false;

                        if (_playerControls.ClientRectangle.Contains(controlsPoint))
                        {
                            isClickOnSeasonsButton = _playerControls.IsClickOnSeasonsButton(controlsPoint.X, controlsPoint.Y);
                        }

                        if (!_seasonsMenu.ClientRectangle.Contains(menuPoint) && !isClickOnSeasonsButton)
                        {
                            _seasonsMenu.Hide();
                        }
                    }
                }

                _wasMouseButtonDown = isMouseButtonDown;

                bool isMouseInWindow = this.ClientRectangle.Contains(this.PointToClient(currentPosition));

                if (currentPosition != _lastMousePosition)
                {
                    _lastMousePosition = currentPosition;
                    _lastMouseMoveTime = DateTime.Now;

                    if (_isDraggingOrResizingFromTitleBar)
                    {
                        if (_playerControls != null)
                        {
                            _playerControls.Visible = false;
                            _controlsVisible = false;
                        }

                        if (_miniPlayerButton != null)
                        {
                            _miniPlayerButton.ShowButtons();
                        }
                    }
                    else if (isMouseInWindow)
                    {
                        if (isOverTitleBar)
                        {
                            if (_playerControls != null && _playerControls.Visible)
                            {
                                _playerControls.Visible = false;
                                _controlsVisible = false;
                            }

                            if (_miniPlayerButton != null)
                            {
                                _miniPlayerButton.ShowButtons();
                            }
                        }
                        else
                        {
                            ShowControls();
                        }
                    }
                }
                else
                {
                    if (_isDraggingOrResizingFromTitleBar)
                    {
                        if (_playerControls != null && _playerControls.Visible)
                        {
                            _playerControls.Visible = false;
                            _controlsVisible = false;
                        }

                        if (_miniPlayerButton != null)
                        {
                            _miniPlayerButton.ShowButtons();
                        }
                    }
                    else if (isMouseInWindow && isOverTitleBar)
                    {
                        if (_playerControls != null && _playerControls.Visible)
                        {
                            _playerControls.Visible = false;
                            _controlsVisible = false;
                        }

                        if (_miniPlayerButton != null)
                        {
                            _miniPlayerButton.ShowButtons();
                        }
                    }
                    else
                    {
                        TimeSpan timeSinceLastMove = DateTime.Now - _lastMouseMoveTime;
                        if (timeSinceLastMove.TotalMilliseconds >= HIDE_CONTROLS_DELAY)
                        {
                            if ((_trackSettingsMenu == null || !_trackSettingsMenu.Visible) &&
                                (_seasonsMenu == null || !_seasonsMenu.Visible))
                            {
                                HideControls();
                            }
                        }
                    }
                }

                if (!isMouseInWindow)
                {
                    if ((_trackSettingsMenu == null || !_trackSettingsMenu.Visible) &&
                        (_seasonsMenu == null || !_seasonsMenu.Visible))
                    {
                        HideControls();
                    }
                }
            };
            _mouseDetectionTimer.Start();
        }

        private bool IsMouseOverMiniPlayerTitleBar(Point screenPosition)
        {
            if (!_isMiniMode || _miniPlayerButton == null)
                return false;

            Point formPoint = this.PointToClient(screenPosition);

            int titleBarHeight = _miniPlayerButton.GetTitleBarHeight();

            return formPoint.X >= 0 &&
                   formPoint.X <= this.ClientSize.Width &&
                   formPoint.Y >= 0 &&
                   formPoint.Y <= titleBarHeight;
        }

        private void ShowControls()
        {
            if (!_controlsVisible)
            {
                _controlsVisible = true;
                _playerControls!.Visible = true;
                _miniPlayerButton!.Visible = true;

                if (_isMiniMode && _miniPlayerButton != null)
                {
                    _miniPlayerButton.ShowButtons();
                }

                this.Cursor = Cursors.Default;
            }
        }

        private void HideControls()
        {
            _controlsVisible = false;
            _playerControls!.Visible = false;

            if (!_isMiniMode)
            {
                _miniPlayerButton!.Visible = false;
            }
            else
            {
                if (_miniPlayerButton != null)
                {
                    _miniPlayerButton.HideButtons();
                }
            }
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
            _mediaPlayer.Volume = 50;
            _mediaPlayer.Mute = false;

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

        private void SetupUI(string title, int width, int height, int positionX, int positionY, bool isMaximized, bool isFullScreen, int episodeId, int seasonIndex, List<Season>? seasons)
        {
            this.Text = "ChocoPlayer" + " - " + title;
            this.BackColor = Color.Black;
            this.Icon = CreateCustomIcon();
            this.KeyPreview = true;
            _currentEpisodeId = episodeId;

            DarkTitleBarManager.ApplyDarkTitleBar(this.Handle);

            float scaleX = 1f;
            float scaleY = 1f;

            EnableMinimumSize();

            using (Graphics g = CreateGraphics())
            {
                scaleX = g.DpiX / 96f;
                scaleY = g.DpiY / 96f;
            }

            StartPosition = FormStartPosition.Manual;

            _videoView = new VideoView
            {
                MediaPlayer = _mediaPlayer,
                BackColor = Color.Black
            };
            this.Controls.Add(_videoView);

            _videoView.MouseDown += VideoView_MouseDown;
            _videoView.MouseMove += VideoView_MouseMove;

            _playerControls = new PlayerControls();
            _playerControls.SetProgressChangeListener(new ProgressListener(this));
            this.Controls.Add(_playerControls);

            _trackSettingsMenu = new TrackSettingsMenu();
            _trackSettingsMenu.SetListener(new TrackListener(this));
            this.Controls.Add(_trackSettingsMenu);
            _trackSettingsMenu.BringToFront();

            _miniPlayerButton = new MiniPlayerButton();
            _miniPlayerButton.SetMiniPlayerListener(new MiniPlayerListener(this));
            this.Controls.Add(_miniPlayerButton);

            if (GetPropertiesIsMiniMode())
            {
                TopMost = true;
                DisableMinimumSize();
                ExitFullscreen();
                _isMiniMode = true;
                _miniPlayerButton?.ApplyMiniMode(this);
                UpdateLayout();
                SaveMiniModeState();
            }
            else
            {
                if (isFullScreen)
                {
                    FormBorderStyle = FormBorderStyle.None;
                    WindowState = FormWindowState.Maximized;
                    _isFullscreen = true;
                }
                else if (isMaximized)
                {
                    WindowState = FormWindowState.Maximized;
                }
                else
                {
                    Location = new Point(
                        (int)(positionX * scaleX),
                        (int)(positionY * scaleY)
                    );

                    Size = new Size(
                        (int)(width * scaleX),
                        (int)(height * scaleY)
                    );
                }
            }

            _hasSeasons = seasons != null && seasons.Count > 0;

            if (_hasSeasons)
            {
                _seasonsMenu = new SeasonsMenu();
                _seasonsMenu.SetListener(new SeasonListener(this));
                this.Controls.Add(_seasonsMenu);
                _seasonsMenu.BringToFront();

                if (seasons != null)
                {
                    var seasonItems = seasons.Select(s => new SeasonsMenu.SeasonItem(s.Id, s.Name)).ToList();
                    if (seasonIndex > 0)
                    {
                        _seasonsMenu.LoadSeasons(seasonItems, seasonIndex);
                        LoadEpisodesForSeason(seasons[seasonIndex].Id);
                    }
                    else
                    {
                        _seasonsMenu.LoadSeasons(seasonItems, 0);
                        LoadEpisodesForSeason(seasons[0].Id);
                    }
                }
            }

            _playerControls.SetHasSeasons(_hasSeasons);

            UpdateLayout();
        }

        private void UpdateLayout()
        {
            int titleBarHeight = _isMiniMode ? _miniPlayerButton!.GetTitleBarHeight() : 0;

            _videoView!.SetBounds(0, titleBarHeight, this.ClientSize.Width, this.ClientSize.Height - titleBarHeight);
            _miniPlayerButton?.SetPosition(this.ClientSize.Width);

            int controlsHeight = _playerControls!.GetControlsHeight();

            if (_isFullscreen)
            {
                int controlsX = (this.ClientSize.Width - FULLSCREEN_CONTROLS_WIDTH) / 2;
                _playerControls.SetBounds(controlsX, this.ClientSize.Height - controlsHeight, FULLSCREEN_CONTROLS_WIDTH, controlsHeight);
                _trackSettingsMenu!.SetPosition(this.ClientSize.Width, this.ClientSize.Height - controlsHeight, true);

                if (_hasSeasons && _seasonsMenu != null)
                {
                    _seasonsMenu.SetPosition(this.ClientSize.Width, this.ClientSize.Height - controlsHeight, true);
                }
            }
            else
            {
                _playerControls.SetBounds(0, this.ClientSize.Height - controlsHeight, this.ClientSize.Width, controlsHeight);
                int settingsX = _playerControls.GetSettingX();
                _trackSettingsMenu!.SetPosition(settingsX, this.ClientSize.Height - controlsHeight, false);

                if (_hasSeasons && _seasonsMenu != null)
                {
                    int seasonsX = _playerControls.GetSeasonsButtonX();
                    _seasonsMenu.SetPosition(seasonsX, this.ClientSize.Height - controlsHeight, false);
                }
            }

            _playerControls.BringToFront();
            _miniPlayerButton?.BringToFront();
            _trackSettingsMenu.BringToFront();

            if (_hasSeasons && _seasonsMenu != null)
            {
                _seasonsMenu.BringToFront();
            }
        }

        private void ChocoPlayer_Resize(object? sender, EventArgs e)
        {
            UpdateLayout();
        }

        public void EnableMinimumSize()
        {
            using (Graphics g = CreateGraphics())
            {
                float scaleX = g.DpiX / 96f;
                float scaleY = g.DpiY / 96f;

                MinimumSize = new Size(
                    (int)(620 * scaleX),
                    (int)(580 * scaleY)
                );
            }
        }

        public void DisableMinimumSize()
        {
            MinimumSize = new Size(356, 200);
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
            if (_isMiniMode)
            {
                ExitMiniMode();
                RefreshIcon();
            }

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

        private void ExitMiniMode()
        {
            if (_isMiniMode)
            {
                _isMiniMode = false;
                _miniPlayerButton?.RestoreOriginalMode(this);
                _miniPlayerButton?.SetMiniMode(false);
                UpdateLayout();
            }
        }

        private void ExitFullscreen()
        {
            if (_isFullscreen)
            {
                this.FormBorderStyle = FormBorderStyle.Sizable;
                this.WindowState = FormWindowState.Normal;
                _isFullscreen = false;
                _playerControls?.SetFullscreen(false);
                UpdateLayout();
            }
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

        public void RefreshIcon()
        {
            if (this.Icon != null)
            {
                Icon currentIcon = this.Icon;
                this.Icon = null;
                this.Icon = currentIcon;
            }
        }

        private void ChocoPlayer_FormClosing(object? sender, FormClosingEventArgs e)
        {
            Task.Run(() =>
            {
                _mouseDetectionTimer?.Stop();
                _mouseDetectionTimer?.Dispose();
                _playerControls?.StopTimer();
                _mediaPlayer?.Stop();
                _mediaPlayer?.Dispose();
                _libVLC?.Dispose();
                _apiService?.Dispose();
                _seasonsMenu?.ClearEpisodes();
            });
        }

        private async void LoadEpisodesForSeason(int seasonId)
        {
            if (_apiService == null)
            {
                return;
            }

            if (_mediaId == 0)
            {
                MessageBox.Show(
                    "Impossible de charger les épisodes : ID de la série non défini.",
                    "Erreur",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                return;
            }

            if (_episodesCache.ContainsKey(seasonId))
            {
                var cachedEpisodes = _episodesCache[seasonId];
                _seasonsMenu?.SetEpisodes(cachedEpisodes);
                _seasonsMenu?.SetCurrentPlayingEpisode(_currentEpisodeId);
                return;
            }

            try
            {
                var episodes = await _apiService.GetEpisodesBySeasonAsync(_mediaId, seasonId);
                if (episodes != null && episodes.Count > 0)
                {

                    var episodeItems = episodes.Select(e => new SeasonsMenu.EpisodeItem(
                        e.Id,
                        e.EpisodeNumber,
                        e.Name,
                        e.Description,
                        FormatDuration(e.Time),
                        _apiService.GetStreamUrl(seasonId, e.Id),
                        InsertIntoUrlBeforeFilename(e.SrcPoster, _episodeFormat)
                    )).ToList();

                    _episodesCache[seasonId] = episodeItems;
                    _seasonsMenu?.SetEpisodes(episodeItems);
                    _seasonsMenu?.SetCurrentPlayingEpisode(_currentEpisodeId);
                }
                else
                {
                    _seasonsMenu?.ClearEpisodes();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show(
                    $"Impossible de charger les épisodes :\n{ex.Message}",
                    "Erreur",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Error
                );
                _seasonsMenu?.ClearEpisodes();
            }
        }

        public string InsertIntoUrlBeforeFilename(string url, string insert)
        {
            var urlParts = url.Split('/').ToList();

            if (urlParts.Count < 2)
                return url;

            var fileName = urlParts.Last();
            urlParts.RemoveAt(urlParts.Count - 1);

            urlParts.Add(insert.ToString());
            urlParts.Add(fileName);

            return string.Join("/", urlParts);
        }

        private string FormatDuration(long milliseconds)
        {
            long totalSeconds = milliseconds / 10_000_000;
            TimeSpan time = TimeSpan.FromSeconds(totalSeconds);
            if (time.Hours > 0)
            {
                return $"{time.Hours}h {time.Minutes}min";
            }
            return $"{time.Minutes}min";
        }

        private void SetTitlePart(int partIndex, string newText)
        {
            if (string.IsNullOrEmpty(this.Text))
            {
                this.Text = newText;
                return;
            }
            List<string> parts = this.Text.Split(new string[] { " - " }, StringSplitOptions.None).ToList();
            while (parts.Count <= partIndex)
            {
                parts.Add(string.Empty);
            }
            parts[partIndex] = newText;
            this.Text = string.Join(" - ", parts);

            if (_isMiniMode)
            {
                _miniPlayerButton?.Invalidate();
            }
        }

        private void VideoView_MouseDown(object? sender, MouseEventArgs e)
        {
            if (!_isMiniMode || e.Button != MouseButtons.Left)
                return;

            int hitTest = GetVideoViewResizeHitTest(e.Location);

            if (hitTest != 0)
            {
                ReleaseCapture();
                SendMessage(this.Handle, WM_NCLBUTTONDOWN, hitTest, 0);
            }
        }

        private void VideoView_MouseMove(object? sender, MouseEventArgs e)
        {
            if (!_isMiniMode)
                return;

            int hitTest = GetVideoViewResizeHitTest(e.Location);
            UpdateVideoViewCursor(hitTest);
        }

        private int GetVideoViewResizeHitTest(Point location)
        {
            Point formLocation = this.PointToClient(_videoView!.PointToScreen(location));

            int x = formLocation.X;
            int y = formLocation.Y;
            int width = this.ClientSize.Width;
            int height = this.ClientSize.Height;

            bool left = x <= RESIZE_BORDER;
            bool right = x >= width - RESIZE_BORDER;
            bool bottom = y >= height - RESIZE_BORDER;

            if (bottom && left) return HTBOTTOMLEFT;
            if (bottom && right) return HTBOTTOMRIGHT;
            if (bottom) return HTBOTTOM;
            if (left) return HTLEFT;
            if (right) return HTRIGHT;

            return 0;
        }

        private void UpdateVideoViewCursor(int hitTest)
        {
            switch (hitTest)
            {
                case HTLEFT:
                case HTRIGHT:
                    _videoView!.Cursor = Cursors.SizeWE;
                    break;
                case HTBOTTOM:
                    _videoView!.Cursor = Cursors.SizeNS;
                    break;
                case HTBOTTOMLEFT:
                case HTBOTTOMRIGHT:
                    _videoView!.Cursor = Cursors.SizeNWSE;
                    break;
                default:
                    _videoView!.Cursor = Cursors.Default;
                    break;
            }
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

            public void OnBackwardClicked()
            {
                if (_chocoPlayer._mediaPlayer != null)
                {
                    const int seekMs = 10_000;
                    _chocoPlayer._mediaPlayer.Time = Math.Max(
                        _chocoPlayer._mediaPlayer.Time - seekMs,
                        0
                    );
                }
            }

            public void OnForwardClicked()
            {
                if (_chocoPlayer._mediaPlayer != null)
                {
                    const int seekMs = 10_000;
                    _chocoPlayer._mediaPlayer.Time = Math.Min(
                        _chocoPlayer._mediaPlayer.Time + seekMs,
                        _chocoPlayer._mediaPlayer.Length
                    );
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
                if (_chocoPlayer._seasonsMenu != null && _chocoPlayer._seasonsMenu.Visible)
                {
                    _chocoPlayer._seasonsMenu.Hide();
                }

                _chocoPlayer.UpdateLayout();
                _chocoPlayer._trackSettingsMenu?.Toggle();
            }

            public void OnSeasonsClicked(int buttonX, int buttonY, int buttonSize)
            {
                if (_chocoPlayer._trackSettingsMenu != null && _chocoPlayer._trackSettingsMenu.Visible)
                {
                    _chocoPlayer._trackSettingsMenu.Hide();
                }

                _chocoPlayer.UpdateLayout();
                _chocoPlayer._seasonsMenu?.Toggle();
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
                        _seasonsMenu?.Hide();
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
                    _seasonsMenu?.Hide();
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

        private class SeasonListener : SeasonsMenu.ISeasonSelectionListener
        {
            private ChocoPlayer _chocoPlayer;

            public SeasonListener(ChocoPlayer form)
            {
                _chocoPlayer = form;
            }

            public void OnSeasonSelected(int seasonId)
            {
                _chocoPlayer.LoadEpisodesForSeason(seasonId);
            }

            public void OnEpisodeSelected(int seasonIndex, int episodeId, string episodePath, string episodeName)
            {
                if (_chocoPlayer._libVLC != null && !string.IsNullOrEmpty(episodePath))
                {
                    try
                    {
                        var oldMedia = _chocoPlayer._mediaPlayer?.Media;

                        _chocoPlayer._mediaPlayer?.Stop();

                        var newMedia = new Media(_chocoPlayer._libVLC, episodePath, FromType.FromLocation);

                        if (episodePath.StartsWith("http://") || episodePath.StartsWith("https://"))
                        {
                            newMedia.AddOption(":http-reconnect");
                            newMedia.AddOption(":network-caching=3000");
                        }

                        _chocoPlayer._mediaPlayer!.Media = newMedia;
                        _chocoPlayer._mediaPlayer.Play();
                        _chocoPlayer._playerControls?.SetPlaying(true);
                        _chocoPlayer.SetTitlePart(2, episodeName);
                        _chocoPlayer._currentEpisodeId = episodeId;
                        _chocoPlayer._seasonsMenu?.SetCurrentPlayingEpisode(episodeId);
                    }
                    catch (Exception ex)
                    {
                        MessageBox.Show(
                            $"Impossible de lire l'épisode : {ex.Message}",
                            "Erreur",
                            MessageBoxButtons.OK,
                            MessageBoxIcon.Error
                        );
                    }
                }
                _chocoPlayer._seasonsMenu?.Hide();
            }
        }

        private class MiniPlayerListener : MiniPlayerButton.IMiniPlayerListener
        {
            private ChocoPlayer _chocoPlayer;

            public MiniPlayerListener(ChocoPlayer player)
            {
                _chocoPlayer = player;
            }

            public void OnMiniModeToggled(bool isMiniMode)
            {
                if (isMiniMode)
                {
                    _chocoPlayer.TopMost = true;
                    _chocoPlayer.DisableMinimumSize();
                    _chocoPlayer.ExitFullscreen();
                    _chocoPlayer._isMiniMode = true;
                    _chocoPlayer._miniPlayerButton?.ApplyMiniMode(_chocoPlayer);
                }
                else
                {
                    _chocoPlayer.TopMost = false;
                    _chocoPlayer.EnableMinimumSize();
                    _chocoPlayer._isMiniMode = false;
                    _chocoPlayer._miniPlayerButton?.RestoreOriginalMode(_chocoPlayer);
                    _chocoPlayer.RefreshIcon();
                }
                _chocoPlayer.UpdateLayout();
                _chocoPlayer.SaveMiniModeState();
            }
        }
    }
}
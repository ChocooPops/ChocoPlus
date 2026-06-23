using System;
using System.Drawing;
using System.Windows.Forms;
using System.Runtime.InteropServices;
using System.Linq;
using System.Collections.Generic;

using LibVLCSharp.Shared;
using LibVLCSharp.Shared.Structures;
using LibVLCSharp.WinForms;
using DarkTitleBar;

namespace ChocoPlayer
{
    public class ChocoPlayer : Form
    {
        public enum ProcessStatus
        {
            LAUNCHING,
            NETWORK_SLOWDOWN,
            STREAMING,
            CLOSED
        }
        // ── VLC ────────────────────────────────────────────────────────────────
        private LibVLC? _libVLC;
        private MediaPlayer? _mediaPlayer;
        private VideoView? _videoView;

        // ── UI ─────────────────────────────────────────────────────────────────
        private Panel? _clickOverlay;
        private PlayerControls? _playerControls;
        private TrackSettingsMenu? _trackSettingsMenu;
        private SeasonsMenu? _seasonsMenu;
        private ApiService? _apiService;
        private MiniPlayerButton? _miniPlayerButton;
        private KeyActionOverlay? _keyActionOverlay;
        private ProgressTooltip? _progressTooltip;

        // ── State ──────────────────────────────────────────────────────────────
        private int _mediaId;
        private int _currentEpisodeId = 0;
        private bool _isFullscreen = false;
        private bool _hasSeasons = false;
        private string _episodeFormat = "300w";
        private Dictionary<int, List<SeasonsMenu.EpisodeItem>> _episodesCache = new();

        private string _audioLanguageSelected = "";
        private string _subtitleLanguageSelected = "";
        private float _watchProgress = 0f;
        private bool _watchProgressApplied = false;

        private TrackListener? _trackListener;
        private ProgressListener? _progressListener;

        // ── Constants ──────────────────────────────────────────────────────────
        private const int FULLSCREEN_CONTROLS_WIDTH = 800;
        private const int HIDE_CONTROLS_DELAY = 2000;
        private const int NETWORK_CACHE_MS = 1500;

        // ── Local volume tracking (prevents outdated reads on high-speed presses) ──
        private int _localVolume = 50;

        // ── Mouse / Controls visibility ────────────────────────────────────────
        private bool _controlsVisible = true;
        private System.Windows.Forms.Timer? _mouseDetectionTimer;
        private Point _lastMousePosition;
        private DateTime _lastMouseMoveTime;
        private bool _wasMouseButtonDown = false;
        private bool _isDraggingOrResizingFromTitleBar = false;
        private bool _windowWasInactive = false;

        // ── Mini mode ──────────────────────────────────────────────────────────
        private bool _isMiniMode = false;
        private const int RESIZE_BORDER = 8;

        // ── Debounce timers ────────────────────────────────────────────────────
        private System.Windows.Forms.Timer? _seekDebounceTimer;
        private long _pendingSeekTime = -1;
        private System.Windows.Forms.Timer? _volumeDebounceTimer;
        private int _pendingVolume = -1;

        // ── Win32 ──────────────────────────────────────────────────────────────
        private const int WM_NCLBUTTONDOWN  = 0xA1;
        private const int WM_SYSCOMMAND     = 0x0112;
        private const int SC_MAXIMIZE      = 0xF030;
        private const int SC_RESTORE       = 0xF120;
        private const int HTLEFT           = 10;
        private const int HTRIGHT          = 11;
        private const int HTBOTTOM         = 15;
        private const int HTBOTTOMLEFT     = 16;
        private const int HTBOTTOMRIGHT    = 17;

        [DllImport("user32.dll")]
        private static extern bool ReleaseCapture();

        [DllImport("user32.dll")]
        private static extern int SendMessage(IntPtr hWnd, int Msg, int wParam, int lParam);

        // ══════════════════════════════════════════════════════════════════════
        // Constructor
        // ══════════════════════════════════════════════════════════════════════
        public ChocoPlayer(
            int mediaId,
            string baseUrl,
            string HEADER_NAME,
            string HEADER_SECRET,
            string token,
            string title,
            string videoPath,
            int width,
            int height,
            int positionX,
            int positionY,
            bool isMaximized,
            bool isFullScreen,
            int episodeId,
            int seasonIndex,
            List<Season>? seasons,
            float watchProgress
        )
        {
            _mediaId       = mediaId;
            _watchProgress = watchProgress;

            _apiService              = new ApiService(baseUrl, HEADER_NAME, HEADER_SECRET, token);
            _audioLanguageSelected   = Properties.Settings.Default.PreferredAudioLanguage;
            _subtitleLanguageSelected = Properties.Settings.Default.PreferredSubtitleLanguage;

            InitializeVLC();
            SetupUI(title, width, height, positionX, positionY, isMaximized, isFullScreen, episodeId, seasonIndex, seasons);

            this.FormClosing += ChocoPlayer_FormClosing;
            this.Resize      += ChocoPlayer_Resize;
            this.Deactivate  += (_, _) => _windowWasInactive = true;

            if (!string.IsNullOrEmpty(videoPath))
                OpenFile(videoPath);

            InitializeHideControlsTimer();
            RestoreMiniModeState();
        }

        // ══════════════════════════════════════════════════════════════════════
        // VLC Initialization
        // ══════════════════════════════════════════════════════════════════════
        private void InitializeVLC()
        {
            Core.Initialize();

            string[] vlcArgs =
            {
                // Interface
                "--no-video-title-show",
                "--no-osd",
                "--no-video-deco",

                // Cache
                "--file-caching=1000",
                $"--network-caching={NETWORK_CACHE_MS}",
                "--live-caching=500",
                "--sout-mux-caching=1000",

                // Hardware & threads
                "--avcodec-hw=any",
                "--avcodec-threads=0",          // 0 = auto (let libvlc choose)

                // Misc optimisations
                "--no-plugins-cache",
                "--no-stats",
                "--no-sub-autodetect-file",
                "--drop-late-frames",
                "--skip-frames",
                "--avcodec-skiploopfilter=2",
                "--avcodec-skip-idct=4",     // Skip IDCT on non-reference frames (H.265 CPU gain)
                "--avcodec-fast",             // Enables ffmpeg's fast decoding mode
                "--clock-jitter=0",
                "--audio-resampler=soxr",
                "--quiet",
            };

            _libVLC = new LibVLC(vlcArgs);
            _mediaPlayer = new MediaPlayer(_libVLC)
            {
                Volume = 50,
                Mute   = false,
            };
            _localVolume = 50;

            _mediaPlayer.EncounteredError += (_, _) =>
            {
                this.BeginInvoke(new Action(() =>
                    MessageBox.Show("Error reading the stream.", "Error",
                        MessageBoxButtons.OK, MessageBoxIcon.Error)));
            };

            bool isBufferingStall = false;

            _mediaPlayer.Opening += (_, _) =>
                Console.WriteLine(ProcessStatus.NETWORK_SLOWDOWN);

            _mediaPlayer.Buffering += (_, e) =>
            {
                if (e.Cache < 100 && !isBufferingStall)
                {
                    //$“[ChocoPlayer] Network interruption – buffering {e.Cache:F0}%”
                    isBufferingStall = true;
                    Console.WriteLine(ProcessStatus.NETWORK_SLOWDOWN); //Send the stream status to the ChocoPlus Electron interface
                }
                else if (e.Cache >= 100 && isBufferingStall)
                {
                    //“[ChocoPlayer] Resuming after a network interruption”
                    isBufferingStall = false;
                    Console.WriteLine(ProcessStatus.STREAMING); //Send the stream status to the ChocoPlus Electron interface
                }
            };

            Player.SetMediaPlayer(_mediaPlayer);
        }

        // ══════════════════════════════════════════════════════════════════════
        // UI Setup
        // ══════════════════════════════════════════════════════════════════════
        private void SetupUI(
            string title, int width, int height,
            int positionX, int positionY,
            bool isMaximized, bool isFullScreen,
            int episodeId, int seasonIndex, List<Season>? seasons)
        {
            this.Text      = "ChocoPlayer - " + title;
            this.BackColor = Color.Black;
            this.Icon      = CreateCustomIcon();
            this.KeyPreview = true;
            _currentEpisodeId = episodeId;

            DarkTitleBarManager.ApplyDarkTitleBar(this.Handle);

            float scaleX, scaleY;
            using (Graphics g = CreateGraphics())
            {
                scaleX = g.DpiX / 96f;
                scaleY = g.DpiY / 96f;
            }

            EnableMinimumSize();
            StartPosition = FormStartPosition.Manual;
            Size     = new Size((int)(width  * scaleX), (int)(height  * scaleY));
            Location = new Point((int)(positionX * scaleX), (int)(positionY * scaleY));

            // VideoView
            _videoView = new VideoView { MediaPlayer = _mediaPlayer, BackColor = Color.Black };
            this.Controls.Add(_videoView);

            // Click overlay
            _clickOverlay = new TransparentPanel();
            _clickOverlay.MouseDown += ClickOverlay_MouseDown;
            this.Controls.Add(_clickOverlay);

            // Key action overlay
            _keyActionOverlay = new KeyActionOverlay();
            this.Controls.Add(_keyActionOverlay);

            // Player controls
            _playerControls = new PlayerControls();
            _progressListener = new ProgressListener(this);
            _playerControls.SetProgressChangeListener(_progressListener);
            this.Controls.Add(_playerControls);

            // Progress tooltip
            _progressTooltip = new ProgressTooltip();
            this.Controls.Add(_progressTooltip);

            _playerControls.ProgressHoverChanged += (_, e) =>
            {
                if (e.TimeText == null)
                    _progressTooltip.HideTooltip();
                else
                {
                    _progressTooltip.ShowAt(e.FormX, e.FormY, e.TimeText);
                    _progressTooltip.BringToFront();
                }
            };

            // Track settings menu
            _trackSettingsMenu = new TrackSettingsMenu();
            _trackListener     = new TrackListener(this);
            _trackSettingsMenu.SetListener(_trackListener);
            this.Controls.Add(_trackSettingsMenu);
            _trackSettingsMenu.BringToFront();

            // Mini player button
            _miniPlayerButton = new MiniPlayerButton();
            _miniPlayerButton.SetMiniPlayerListener(new MiniPlayerListener(this));
            _miniPlayerButton.SetTitle(title);
            this.Controls.Add(_miniPlayerButton);

            if (GetPropertiesIsMiniMode())
            {
                TopMost = true;
                DisableMinimumSize();
                ExitFullscreen();
                _isMiniMode = true;
                _miniPlayerButton.ApplyMiniMode(this);
                UpdateLayout();
                SaveMiniModeState();
            }
            else
            {
                if (isFullScreen)
                {
                    FormBorderStyle = FormBorderStyle.None;
                    WindowState     = FormWindowState.Maximized;
                    _isFullscreen   = true;
                }
                else if (isMaximized)
                {
                    WindowState = FormWindowState.Maximized;
                }
            }

            // Seasons menu
            _hasSeasons = seasons != null && seasons.Count > 0;
            if (_hasSeasons)
            {
                _seasonsMenu = new SeasonsMenu();
                _seasonsMenu.SetListener(new SeasonListener(this));
                this.Controls.Add(_seasonsMenu);
                _seasonsMenu.BringToFront();

                if (seasons != null)
                {
                    var seasonItems = seasons.Select(s => new SeasonsMenu.SeasonItem(s.Id, s.Name, s.SeasonNumber)).ToList();
                    int idx = seasonIndex > 0 ? seasonIndex : 0;
                    _seasonsMenu.LoadSeasons(seasonItems, idx);
                    LoadEpisodesForSeason(seasons[idx].Id);
                }
            }

            _playerControls.SetHasSeasons(_hasSeasons);
            UpdateLayout();
        }

        // ══════════════════════════════════════════════════════════════════════
        // Open / Play media
        // ══════════════════════════════════════════════════════════════════════
        private void OpenFile(string path)
        {
            if (_libVLC == null || _mediaPlayer == null) return;

            try
            {
                _watchProgressApplied = false;

                var oldMedia = _mediaPlayer.Media;
                _mediaPlayer.Stop();
                oldMedia?.Dispose();

                var media = new Media(_libVLC, path, FromType.FromLocation);
                if (path.StartsWith("http://") || path.StartsWith("https://"))
                    media.AddOption(":http-reconnect");

                _mediaPlayer.Media = media;

                EventHandler<EventArgs>? playingHandler = null;
                playingHandler = (_, _) =>
                {
                    RestorePreferredTracks();
                    _mediaPlayer.Playing -= playingHandler;
                };

                EventHandler<MediaPlayerPositionChangedEventArgs>? positionHandler = null;
                positionHandler = (_, _) =>
                {
                    if (!_watchProgressApplied && _mediaPlayer.Length > 0)
                    {
                        _watchProgressApplied = true;
                        _mediaPlayer.PositionChanged -= positionHandler;
                        this.BeginInvoke(new Action(ApplyWatchProgress));
                    }
                };

                _mediaPlayer.Playing         += playingHandler;
                _mediaPlayer.PositionChanged += positionHandler;
                _mediaPlayer.Play();
                _playerControls?.SetPlaying(true);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Unable to play the media : {ex.Message}",
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        private void ApplyWatchProgress()
        {
            if (_mediaPlayer == null || _watchProgress <= 0 || _watchProgress >= 100) return;

            long totalTime = _mediaPlayer.Length;
            if (totalTime > 0)
            {
                long targetTime   = (long)((_watchProgress / 100f) * totalTime);
                long adjustedTime = Math.Max(targetTime - 60_000, 0);
                _mediaPlayer.Time = adjustedTime;
            }
        }

        private void RestorePreferredTracks()
        {
            if (_trackListener == null) return;

            if (!string.IsNullOrEmpty(_audioLanguageSelected))
            {
                int audioTrackId = FindAudioTrackByLanguage(_audioLanguageSelected);
                if (audioTrackId != -1)
                    _trackListener.OnAudioTrackSelected(audioTrackId);
            }

            if (!string.IsNullOrEmpty(_subtitleLanguageSelected))
            {
                int subtitleTrackId = FindSubtitleTrackByLanguage(_subtitleLanguageSelected);
                if (subtitleTrackId != -1)
                    _trackListener.OnSubtitleTrackSelected(subtitleTrackId);
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // Seek debounce  (évite les seeks disque en rafale)
        // ══════════════════════════════════════════════════════════════════════
        private void SeekTo(long timeMs)
        {
            if (_mediaPlayer == null) return;

            _pendingSeekTime = Math.Clamp(timeMs, 0, _mediaPlayer.Length);

            // Immediately block the PlayerControls timer to prevent
            // it from overwriting the displayed position during the debounce
            _playerControls?.SetSeekPending(true);

            _seekDebounceTimer?.Stop();
            _seekDebounceTimer?.Dispose();

            _seekDebounceTimer = new System.Windows.Forms.Timer { Interval = 80 };
            _seekDebounceTimer.Tick += (_, _) =>
            {
                _seekDebounceTimer?.Stop();
                _seekDebounceTimer?.Dispose();
                _seekDebounceTimer = null;

                if (_mediaPlayer != null && _pendingSeekTime >= 0)
                {
                    long seekTarget   = _pendingSeekTime;
                    _pendingSeekTime  = -1;
                    Task.Run(() => { if (_mediaPlayer != null) _mediaPlayer.Time = seekTarget; });
                }

                var releaseTimer = new System.Windows.Forms.Timer { Interval = 120 };
                releaseTimer.Tick += (_, _) =>
                {
                    releaseTimer.Stop();
                    releaseTimer.Dispose();
                    _playerControls?.SetSeekPending(false);
                };
                releaseTimer.Start();
            };
            _seekDebounceTimer.Start();
        }

        // ══════════════════════════════════════════════════════════════════════
        // Volume Debounce (prevents lag on the volume slider)
        // ══════════════════════════════════════════════════════════════════════
        private void SetVolumeDebounced(int volume)
        {
            _pendingVolume = volume;

            _volumeDebounceTimer?.Stop();
            _volumeDebounceTimer?.Dispose();

            _volumeDebounceTimer = new System.Windows.Forms.Timer { Interval = 50 };
            _volumeDebounceTimer.Tick += (_, _) =>
            {
                _volumeDebounceTimer?.Stop();
                _volumeDebounceTimer?.Dispose();
                _volumeDebounceTimer = null;

                if (_mediaPlayer != null && _pendingVolume >= 0)
                {
                    int vol = _pendingVolume;
                    _pendingVolume = -1;
                    Task.Run(() => { if (_mediaPlayer != null) _mediaPlayer.Volume = vol; });
                }
            };
            _volumeDebounceTimer.Start();
        }

        // ══════════════════════════════════════════════════════════════════════
        // Controls visibility
        // ══════════════════════════════════════════════════════════════════════
        private static readonly Cursor _hiddenCursor = CreateHiddenCursor();

        private static Cursor CreateHiddenCursor()
        {
            Bitmap bmp = new Bitmap(1, 1);
            bmp.SetPixel(0, 0, Color.Transparent);
            return new Cursor(bmp.GetHicon());
        }

        private void ShowControls()
        {
            if (_controlsVisible) return;

            _controlsVisible       = true;
            _playerControls!.Visible = true;
            _miniPlayerButton!.Visible = true;

            if (_isMiniMode)
                _miniPlayerButton.ShowButtons();

            this.Cursor            = Cursors.Default;
            _clickOverlay!.Cursor  = Cursors.Default;
        }

        private void HideControls()
        {
            _controlsVisible         = false;
            _playerControls!.Visible = false;
            _progressTooltip?.HideTooltip();

            if (!_isMiniMode)
            {
                _miniPlayerButton!.Visible = false;
                _clickOverlay!.Cursor      = _hiddenCursor;
            }
            else
            {
                _miniPlayerButton?.HideButtons();
            }
        }

        // ══════════════════════════════════════════════════════════════════════
        // Mouse detection timer
        // ══════════════════════════════════════════════════════════════════════
        private void InitializeHideControlsTimer()
        {
            _lastMousePosition = Cursor.Position;
            _lastMouseMoveTime = DateTime.Now;

            _mouseDetectionTimer = new System.Windows.Forms.Timer { Interval = 100 };
            _mouseDetectionTimer.Tick += (_, _) =>
            {
                Point currentPosition  = Cursor.Position;
                bool  isMouseButtonDown = (Control.MouseButtons & MouseButtons.Left) == MouseButtons.Left;
                bool  isOverTitleBar    = IsMouseOverMiniPlayerTitleBar(currentPosition);

                // ── Drag start on title bar ────────────────────────────────
                if (isMouseButtonDown && !_wasMouseButtonDown && isOverTitleBar)
                {
                    _isDraggingOrResizingFromTitleBar = true;

                    if (_playerControls != null && _playerControls.Visible)
                    {
                        _playerControls.Visible = false;
                        _controlsVisible        = false;
                    }
                    _miniPlayerButton?.ShowButtons();
                }

                // ── Drag end ───────────────────────────────────────────────
                if (!isMouseButtonDown && _wasMouseButtonDown && _isDraggingOrResizingFromTitleBar)
                    _isDraggingOrResizingFromTitleBar = false;

                // ── Menu auto-close on click outside ──────────────────────
                if (isMouseButtonDown && !_wasMouseButtonDown)
                {
                    TryHideMenuOnOutsideClick(_trackSettingsMenu,
                        cp => _playerControls!.IsClickOnSettingsButton(cp.X, cp.Y), currentPosition);

                    TryHideMenuOnOutsideClick(_seasonsMenu,
                        cp => _playerControls!.IsClickOnSeasonsButton(cp.X, cp.Y), currentPosition);
                }

                _wasMouseButtonDown = isMouseButtonDown;

                bool isMouseInWindow = this.ClientRectangle.Contains(this.PointToClient(currentPosition));

                // ── Mouse moved ────────────────────────────────────────────
                if (currentPosition != _lastMousePosition)
                {
                    _lastMousePosition = currentPosition;
                    _lastMouseMoveTime = DateTime.Now;

                    if (_isDraggingOrResizingFromTitleBar)
                    {
                        if (_playerControls != null) { _playerControls.Visible = false; _controlsVisible = false; }
                        _miniPlayerButton?.ShowButtons();
                    }
                    else if (isMouseInWindow)
                    {
                        if (isOverTitleBar)
                        {
                            if (_playerControls != null && _playerControls.Visible)
                            { _playerControls.Visible = false; _controlsVisible = false; }
                            _miniPlayerButton?.ShowButtons();
                        }
                        else
                        {
                            ShowControls();
                        }
                    }
                }
                else
                {
                    // ── Mouse idle ─────────────────────────────────────────
                    if (_isDraggingOrResizingFromTitleBar || (isMouseInWindow && isOverTitleBar))
                    {
                        if (_playerControls != null && _playerControls.Visible)
                        { _playerControls.Visible = false; _controlsVisible = false; }
                        _miniPlayerButton?.ShowButtons();
                    }
                    else
                    {
                        if ((DateTime.Now - _lastMouseMoveTime).TotalMilliseconds >= HIDE_CONTROLS_DELAY)
                        {
                            bool noMenuOpen = (_trackSettingsMenu == null || !_trackSettingsMenu.Visible)
                                           && (_seasonsMenu      == null || !_seasonsMenu.Visible);
                            if (noMenuOpen) HideControls();
                        }
                    }
                }

                // ── Mouse outside window ───────────────────────────────────
                if (!isMouseInWindow)
                {
                    bool noMenuOpen = (_trackSettingsMenu == null || !_trackSettingsMenu.Visible)
                                   && (_seasonsMenu      == null || !_seasonsMenu.Visible);
                    if (noMenuOpen) HideControls();
                }
            };

            _mouseDetectionTimer.Start();
        }

        // Helper to avoid duplicated menu-close logic
        private void TryHideMenuOnOutsideClick<T>(T? menu, Func<Point, bool> isOnButton, Point cursorScreen)
            where T : Control
        {
            if (menu == null || !menu.Visible) return;

            Point menuPoint     = menu.PointToClient(cursorScreen);
            Point controlsPoint = _playerControls!.PointToClient(cursorScreen);
            bool  onButton      = _playerControls.ClientRectangle.Contains(controlsPoint) && isOnButton(controlsPoint);

            if (!menu.ClientRectangle.Contains(menuPoint) && !onButton)
                menu.Hide();
        }

        private bool IsMouseOverMiniPlayerTitleBar(Point screenPosition)
        {
            if (!_isMiniMode || _miniPlayerButton == null) return false;

            Point formPoint    = this.PointToClient(screenPosition);
            int   titleBarHeight = _miniPlayerButton.GetTitleBarHeight();

            return formPoint.X >= 0 && formPoint.X <= this.ClientSize.Width
                && formPoint.Y >= 0 && formPoint.Y <= titleBarHeight;
        }

        // ══════════════════════════════════════════════════════════════════════
        // Click overlay
        // ══════════════════════════════════════════════════════════════════════
        private void ClickOverlay_MouseDown(object? sender, MouseEventArgs e)
        {
            if (e.Button != MouseButtons.Left || _mediaPlayer == null) return;

            if (_windowWasInactive)
            {
                _windowWasInactive = false;
                return;
            }

            bool menuWasVisible = false;
            if (_trackSettingsMenu != null && _trackSettingsMenu.Visible) { _trackSettingsMenu.Hide(); menuWasVisible = true; }
            if (_seasonsMenu       != null && _seasonsMenu.Visible)       { _seasonsMenu.Hide();       menuWasVisible = true; }
            if (menuWasVisible) return;

            // Mini-mode resize hit testing
            if (_isMiniMode)
            {
                Point formLocation = this.PointToClient(_clickOverlay!.PointToScreen(e.Location));
                int x = formLocation.X, y = formLocation.Y;
                int w = this.ClientSize.Width, h = this.ClientSize.Height;

                bool left   = x <= RESIZE_BORDER;
                bool right  = x >= w - RESIZE_BORDER;
                bool bottom = y >= h - RESIZE_BORDER;

                int hitTest = 0;
                if      (bottom && left)  hitTest = HTBOTTOMLEFT;
                else if (bottom && right) hitTest = HTBOTTOMRIGHT;
                else if (bottom)          hitTest = HTBOTTOM;
                else if (left)            hitTest = HTLEFT;
                else if (right)           hitTest = HTRIGHT;

                if (hitTest != 0)
                {
                    ReleaseCapture();
                    SendMessage(this.Handle, WM_NCLBUTTONDOWN, hitTest, 0);
                    return;
                }
            }

            // Play / Pause toggle
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
        }

        // ══════════════════════════════════════════════════════════════════════
        // Layout
        // ══════════════════════════════════════════════════════════════════════
        private void UpdateLayout()
        {
            int titleBarHeight = _isMiniMode ? _miniPlayerButton!.GetTitleBarHeight() : 0;
            int controlsHeight = _playerControls!.GetControlsHeight();

            _videoView!.SetBounds(0, titleBarHeight, this.ClientSize.Width, this.ClientSize.Height - titleBarHeight);
            _miniPlayerButton?.SetPosition(this.ClientSize.Width);
            _clickOverlay?.SetBounds(0, titleBarHeight,
                this.ClientSize.Width, this.ClientSize.Height - titleBarHeight - controlsHeight);

            if (_isFullscreen)
            {
                int controlsX = (this.ClientSize.Width - FULLSCREEN_CONTROLS_WIDTH) / 2;
                _playerControls.SetBounds(controlsX, this.ClientSize.Height - controlsHeight, FULLSCREEN_CONTROLS_WIDTH, controlsHeight);
                _trackSettingsMenu!.SetPosition(this.ClientSize.Width, this.ClientSize.Height - controlsHeight, true);
                _seasonsMenu?.SetPosition(this.ClientSize.Width, this.ClientSize.Height - controlsHeight, true);
            }
            else
            {
                _playerControls.SetBounds(0, this.ClientSize.Height - controlsHeight, this.ClientSize.Width, controlsHeight);
                _trackSettingsMenu!.SetPosition(_playerControls.GetSettingX(), this.ClientSize.Height - controlsHeight, false);
                if (_hasSeasons && _seasonsMenu != null)
                    _seasonsMenu.SetPosition(_playerControls.GetSeasonsButtonX(), this.ClientSize.Height - controlsHeight, false);
            }

            _clickOverlay?.BringToFront();
            _playerControls.BringToFront();
            _miniPlayerButton?.BringToFront();
            _trackSettingsMenu.BringToFront();

            if (_keyActionOverlay != null)
            {
                _keyActionOverlay.Location = new Point(16, titleBarHeight + 16);
                _keyActionOverlay.BringToFront();
            }

            if (_hasSeasons && _seasonsMenu != null)
                _seasonsMenu.BringToFront();

            _progressTooltip?.BringToFront();
        }

        private void ChocoPlayer_Resize(object? sender, EventArgs e) => UpdateLayout();

        // ══════════════════════════════════════════════════════════════════════
        // Fullscreen / Mini mode
        // ══════════════════════════════════════════════════════════════════════
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
                this.WindowState     = FormWindowState.Normal;
                _isFullscreen        = false;
            }
            else
            {
                if (this.WindowState == FormWindowState.Maximized)
                    this.WindowState = FormWindowState.Normal;

                this.FormBorderStyle = FormBorderStyle.None;
                this.WindowState     = FormWindowState.Maximized;
                _isFullscreen        = true;
            }

            _playerControls?.SetFullscreen(_isFullscreen);
            UpdateLayout();
        }

        private void ExitFullscreen()
        {
            if (!_isFullscreen) return;

            this.FormBorderStyle = FormBorderStyle.Sizable;
            this.WindowState     = FormWindowState.Normal;
            _isFullscreen        = false;
            _playerControls?.SetFullscreen(false);
            UpdateLayout();
        }

        private void ExitMiniMode()
        {
            if (!_isMiniMode) return;

            _isMiniMode = false;
            _miniPlayerButton?.RestoreOriginalMode(this);
            _miniPlayerButton?.SetMiniMode(false);
            UpdateLayout();
        }

        // ══════════════════════════════════════════════════════════════════════
        // Minimum size helpers
        // ══════════════════════════════════════════════════════════════════════
        public void EnableMinimumSize()
        {
            using Graphics g = CreateGraphics();
            MinimumSize = new Size((int)(620 * g.DpiX / 96f), (int)(580 * g.DpiY / 96f));
        }

        public void DisableMinimumSize() => MinimumSize = new Size(356, 200);

        // ══════════════════════════════════════════════════════════════════════
        // Mini mode persistence
        // ══════════════════════════════════════════════════════════════════════
        private void RestoreMiniModeState()
        {
            try
            {
                if (Properties.Settings.Default.IsMiniMode)
                    _miniPlayerButton?.SetMiniMode(true);
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"RestoreMiniModeState: {ex.Message}");
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
                System.Diagnostics.Debug.WriteLine($"SaveMiniModeState: {ex.Message}");
            }
        }

        private bool GetPropertiesIsMiniMode()
        {
            try   { return Properties.Settings.Default.IsMiniMode; }
            catch { return false; }
        }

        // ══════════════════════════════════════════════════════════════════════
        // Audio / Subtitle track helpers
        // ══════════════════════════════════════════════════════════════════════
        private string GetAudioTrackLanguage(int trackId)
        {
            if (_mediaPlayer == null || trackId == -1) return "";
            var track = _mediaPlayer.AudioTrackDescription?.FirstOrDefault(t => t.Id == trackId);
            return (track.HasValue && track.Value.Id != 0) ? track.Value.Name ?? "" : "";
        }

        private string GetSubtitleTrackLanguage(int trackId)
        {
            if (_mediaPlayer == null || trackId == -1) return "";
            var track = _mediaPlayer.SpuDescription?.FirstOrDefault(t => t.Id == trackId);
            return (track.HasValue && track.Value.Id != 0) ? track.Value.Name ?? "" : "";
        }

        public void SetAudioIndexSelected(int index)
        {
            _audioLanguageSelected = GetAudioTrackLanguage(index);
            Properties.Settings.Default.PreferredAudioLanguage = _audioLanguageSelected;
            Task.Run(() => Properties.Settings.Default.Save());
        }

        public void SetSubtitleIndexSelected(int index)
        {
            _subtitleLanguageSelected = GetSubtitleTrackLanguage(index);
            Properties.Settings.Default.PreferredSubtitleLanguage = _subtitleLanguageSelected;
            Task.Run(() => Properties.Settings.Default.Save());
        }

        private int FindAudioTrackByLanguage(string language)
            => FindTrackByLanguage(language, _mediaPlayer?.AudioTrackDescription);

        private int FindSubtitleTrackByLanguage(string language)
            => FindTrackByLanguage(language, _mediaPlayer?.SpuDescription);

        private int FindTrackByLanguage(string language, TrackDescription[]? tracks)
        {
            if (string.IsNullOrEmpty(language) || tracks == null || tracks.Length == 0) return -1;

            string languageLower = language.ToLower();
            int bestMatchId      = -1;
            int smallestDistance = int.MaxValue;

            foreach (var track in tracks)
            {
                if (track.Name == null) continue;

                string trackNameLower = track.Name.ToLower();
                if (trackNameLower == languageLower || trackNameLower.Contains(languageLower))
                    return track.Id;

                int distance = LevenshteinDistance(trackNameLower, languageLower);
                if (distance < smallestDistance)
                {
                    smallestDistance = distance;
                    bestMatchId      = track.Id;
                }
            }

            return (bestMatchId != -1 && smallestDistance <= language.Length / 2) ? bestMatchId : -1;
        }

        private static int LevenshteinDistance(string source, string target)
        {
            if (string.IsNullOrEmpty(source)) return target?.Length ?? 0;
            if (string.IsNullOrEmpty(target)) return source.Length;

            int sl = source.Length, tl = target.Length;
            var d  = new int[sl + 1, tl + 1];

            for (int i = 0; i <= sl; i++) d[i, 0] = i;
            for (int j = 0; j <= tl; j++) d[0, j] = j;

            for (int i = 1; i <= sl; i++)
                for (int j = 1; j <= tl; j++)
                {
                    int cost = target[j - 1] == source[i - 1] ? 0 : 1;
                    d[i, j] = Math.Min(Math.Min(d[i - 1, j] + 1, d[i, j - 1] + 1), d[i - 1, j - 1] + cost);
                }

            return d[sl, tl];
        }

        // ══════════════════════════════════════════════════════════════════════
        // Season / Episode loading
        // ══════════════════════════════════════════════════════════════════════
        private async void LoadEpisodesForSeason(int seasonId)
        {
            if (_apiService == null) return;

            if (_mediaId == 0)
            {
                MessageBox.Show("Unable to load episodes: Series ID not defined.",
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                return;
            }

            if (_episodesCache.TryGetValue(seasonId, out var cached))
            {
                _seasonsMenu?.SetEpisodes(cached);
                _seasonsMenu?.SetCurrentPlayingEpisode(_currentEpisodeId);
                return;
            }

            try
            {
                var episodes = await _apiService.GetEpisodesBySeasonAsync(_mediaId, seasonId);
                if (episodes != null && episodes.Count > 0)
                {
                    var items = episodes.Select(e => new SeasonsMenu.EpisodeItem(
                        e.Id, e.EpisodeNumber, e.Name, e.Description,
                        FormatDuration(e.Duration),
                        _apiService.GetStreamUrl(seasonId, e.Id),
                        InsertIntoUrlBeforeFilename(e.SrcPoster, _episodeFormat)
                    )).ToList();

                    _episodesCache[seasonId] = items;
                    _seasonsMenu?.SetEpisodes(items);
                    _seasonsMenu?.SetCurrentPlayingEpisode(_currentEpisodeId);
                }
                else
                {
                    _seasonsMenu?.ClearEpisodes();
                }
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Unable to load the episodes :\n{ex.Message}",
                    "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                _seasonsMenu?.ClearEpisodes();
            }
        }

        public string InsertIntoUrlBeforeFilename(string url, string insert)
        {
            try
            {
                var parts    = url.Split('/').ToList();
                if (parts.Count < 2) return url;
                var fileName = parts.Last();
                parts.RemoveAt(parts.Count - 1);
                parts.Add(insert);
                parts.Add(fileName);
                return string.Join("/", parts);
            }
            catch { return ""; }
        }

        private string FormatDuration(long milliseconds)
        {
            var time = TimeSpan.FromSeconds(milliseconds / 1000);
            return time.Hours > 0 ? $"{time.Hours}h {time.Minutes}min" : $"{time.Minutes}min";
        }

        private void SetTitlePart(int partIndex, string newText)
        {
            if (string.IsNullOrEmpty(this.Text)) { this.Text = newText; return; }

            var parts = this.Text.Split(new[] { " - " }, StringSplitOptions.None).ToList();
            while (parts.Count <= partIndex) parts.Add(string.Empty);
            parts = parts.Take(partIndex).ToList();
            parts.Add(newText);
            this.Text = string.Join(" - ", parts);
            _miniPlayerButton?.SetTitle(string.Join(" - ", parts.Skip(1)));

            if (_isMiniMode) _miniPlayerButton?.Invalidate();
        }

        // ══════════════════════════════════════════════════════════════════════
        // Icon helpers
        // ══════════════════════════════════════════════════════════════════════
        private Icon CreateCustomIcon()
        {
            try
            {
                string iconPath = System.IO.Path.Combine(
                    System.IO.Path.GetDirectoryName(Application.ExecutablePath) ?? "", "icon.ico");

                return System.IO.File.Exists(iconPath) ? new Icon(iconPath) : CreateDefaultIcon();
            }
            catch { return CreateDefaultIcon(); }
        }

        private static Icon CreateDefaultIcon()
        {
            Bitmap bitmap = new Bitmap(32, 32);
            using (Graphics g = Graphics.FromImage(bitmap))
            {
                g.SmoothingMode = System.Drawing.Drawing2D.SmoothingMode.AntiAlias;
                g.FillEllipse(new SolidBrush(Color.FromArgb(255, 211, 1)), 0, 0, 31, 31);
                using Font font = new Font("Arial", 16, FontStyle.Bold);
                g.DrawString("C", font, Brushes.Black, new PointF(8, 4));
            }
            return Icon.FromHandle(bitmap.GetHicon());
        }

        public void RefreshIcon()
        {
            if (this.Icon == null) return;
            var current  = this.Icon;
            this.Icon    = null;
            this.Icon    = current;
        }

        // ══════════════════════════════════════════════════════════════════════
        // Keyboard shortcuts
        // ══════════════════════════════════════════════════════════════════════
        protected override bool ProcessCmdKey(ref Message msg, Keys keyData)
        {
            if (_mediaPlayer == null)
                return base.ProcessCmdKey(ref msg, keyData);

            const int seekMs     = 10_000;
            const int volumeStep = 5;

            switch (keyData)
            {
                case Keys.Right:
                    SeekTo(_mediaPlayer.Time + seekMs);
                    _keyActionOverlay?.ShowSeek(seekMs / 1000);
                    return true;

                case Keys.Left:
                    SeekTo(_mediaPlayer.Time - seekMs);
                    _keyActionOverlay?.ShowSeek(-(seekMs / 1000));
                    return true;

                case Keys.Up:
                {
                    int newVol = Math.Min(_localVolume + volumeStep, 100);
                    _localVolume = newVol;
                    SetVolumeDebounced(newVol);
                    _playerControls?.SetVolume(newVol);
                    _keyActionOverlay?.ShowVolume(true, newVol);
                    return true;
                }

                case Keys.Down:
                {
                    int newVol = Math.Max(_localVolume - volumeStep, 0);
                    _localVolume = newVol;
                    SetVolumeDebounced(newVol);
                    _playerControls?.SetVolume(newVol);
                    _keyActionOverlay?.ShowVolume(false, newVol);
                    return true;
                }

                case Keys.Space:
                    if (_mediaPlayer.IsPlaying)
                    {
                        _mediaPlayer.Pause();
                        _playerControls?.SetPlaying(false);
                        _keyActionOverlay?.ShowPlayPause(true);
                    }
                    else
                    {
                        _mediaPlayer.Play();
                        _playerControls?.SetPlaying(true);
                        _keyActionOverlay?.ShowPlayPause(false);
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

        // ══════════════════════════════════════════════════════════════════════
        // WndProc (maximize / restore)
        // ══════════════════════════════════════════════════════════════════════
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
                    this.BeginInvoke(new Action(() => { UpdateLayout(); this.Refresh(); }));
                    return;
                }
            }
            base.WndProc(ref m);
        }

        // ══════════════════════════════════════════════════════════════════════
        // Form closing
        // ══════════════════════════════════════════════════════════════════════
        private void ChocoPlayer_FormClosing(object? sender, FormClosingEventArgs e)
        {
            _mouseDetectionTimer?.Stop();
            _mouseDetectionTimer?.Dispose();
            _seekDebounceTimer?.Stop();
            _seekDebounceTimer?.Dispose();
            _volumeDebounceTimer?.Stop();
            _volumeDebounceTimer?.Dispose();
            _playerControls?.StopTimer();

            try
            {
                _mediaPlayer?.Stop();
                _mediaPlayer?.Media?.Dispose();
                _mediaPlayer?.Dispose();
                _libVLC?.Dispose();
            }
            catch (Exception ex)
            {
                System.Diagnostics.Debug.WriteLine($"VLC dispose error: {ex.Message}");
            }

            _apiService?.Dispose();
            _seasonsMenu?.ClearEpisodes();
        }

        // ══════════════════════════════════════════════════════════════════════
        // Inner classes
        // ══════════════════════════════════════════════════════════════════════

        // ── ProgressListener ──────────────────────────────────────────────────
        private class ProgressListener : PlayerControls.IProgressChangeListener
        {
            private readonly ChocoPlayer _p;
            private bool _isDragging = false;

            public ProgressListener(ChocoPlayer form) => _p = form;

            /// <summary>True while the user is dragging the progress bar.
            /// PlayerControls must read this to freeze the UI update from VLC.</summary>
            public bool IsDragging => _isDragging;

            // Called continuously while the user drags → freeze VLC position feedback
            public void OnProgressChanging(float progress)
            {
                _isDragging = true;
            }

            // Called once when the user releases the scrubber
            public void OnProgressChanged(float progress)
            {
                _isDragging = false;
                if (_p._mediaPlayer == null) return;

                long newTime = (long)(progress * _p._mediaPlayer.Length);
                _p.SeekTo(newTime);
            }

            public void OnPlayPauseClicked(bool isPlaying)
            {
                if (_p._mediaPlayer == null) return;
                if (isPlaying) _p._mediaPlayer.Play();
                else           _p._mediaPlayer.Pause();
            }

            public void OnBackwardClicked()
            {
                if (_p._mediaPlayer == null) return;
                _p.SeekTo(_p._mediaPlayer.Time - 10_000); // ✅ debounced
            }

            public void OnForwardClicked()
            {
                if (_p._mediaPlayer == null) return;
                _p.SeekTo(_p._mediaPlayer.Time + 10_000); // ✅ debounced
            }

            public void OnVolumeClicked()
            {
                if (_p._mediaPlayer == null) return;
                _p._playerControls?.SetMuted(!_p._mediaPlayer.Mute);
                _p._mediaPlayer.Mute = !_p._mediaPlayer.Mute;
            }

            public void OnVolumeChanged(int volume)
            {
                if (_p._mediaPlayer == null) return;
                _p._localVolume = volume;
                _p.SetVolumeDebounced(volume);
            }

            public void OnFullscreenClicked() => _p.ToggleFullscreen();

            public void OnSettingsClicked(int buttonX, int buttonY, int buttonSize)
            {
                _p._seasonsMenu?.Hide();
                _p.UpdateLayout();
                _p._trackSettingsMenu?.Toggle();
            }

            public void OnSeasonsClicked(int buttonX, int buttonY, int buttonSize)
            {
                _p._trackSettingsMenu?.Hide();
                _p.UpdateLayout();
                _p._seasonsMenu?.Toggle();
            }
        }

        // ── TrackListener ─────────────────────────────────────────────────────
        private class TrackListener : TrackSettingsMenu.ITrackSelectionListener
        {
            private readonly ChocoPlayer _p;
            public TrackListener(ChocoPlayer form) => _p = form;

            public void OnAudioTrackSelected(int trackId)
            {
                if (_p._mediaPlayer == null) return;
                var mp = _p._mediaPlayer;
                Task.Run(() => mp.SetAudioTrack(trackId));
                _p.SetAudioIndexSelected(trackId);
            }

            public void OnSubtitleTrackSelected(int trackId)
            {
                if (_p._mediaPlayer == null) return;
                var mp = _p._mediaPlayer;
                Task.Run(() => mp.SetSpu(trackId));
                _p.SetSubtitleIndexSelected(trackId);
            }
        }

        // ── SeasonListener ────────────────────────────────────────────────────
        private class SeasonListener : SeasonsMenu.ISeasonSelectionListener
        {
            private readonly ChocoPlayer _p;
            public SeasonListener(ChocoPlayer form) => _p = form;

            public void OnSeasonSelected(int seasonId)
                => _p.LoadEpisodesForSeason(seasonId);

            public void OnEpisodeSelected(int seasonIndex, int episodeId, string episodePath, string episodeName)
            {
                if (_p._libVLC == null || string.IsNullOrEmpty(episodePath)) return;

                try
                {
                    _p._watchProgressApplied = false;

                    var oldMedia = _p._mediaPlayer?.Media;
                    _p._mediaPlayer?.Stop();
                    oldMedia?.Dispose();

                    var newMedia = new Media(_p._libVLC, episodePath, FromType.FromLocation);
                    if (episodePath.StartsWith("http://") || episodePath.StartsWith("https://"))
                        newMedia.AddOption(":http-reconnect");

                    _p._mediaPlayer!.Media = newMedia;

                    EventHandler<EventArgs>? playingHandler = null;
                    playingHandler = (_, _) =>
                    {
                        _p.RestorePreferredTracks();
                        _p._mediaPlayer.Playing -= playingHandler;
                    };

                    _p._mediaPlayer.Playing += playingHandler;
                    _p._mediaPlayer.Play();
                    _p._playerControls?.SetPlaying(true);
                    _p.SetTitlePart(2, episodeName);
                    _p._currentEpisodeId = episodeId;
                    _p._seasonsMenu?.SetCurrentPlayingEpisode(episodeId);
                    _p._seasonsMenu?.Hide();
                }
                catch (Exception ex)
                {
                    MessageBox.Show($"Unable to play the episode : {ex.Message}",
                        "Error", MessageBoxButtons.OK, MessageBoxIcon.Error);
                }
            }
        }

        // ── TransparentPanel ──────────────────────────────────────────────────
        private class TransparentPanel : Panel
        {
            public TransparentPanel()
            {
                SetStyle(ControlStyles.SupportsTransparentBackColor, true);
                SetStyle(ControlStyles.Opaque, false);
                BackColor = Color.Transparent;
            }

            protected override CreateParams CreateParams
            {
                get { var cp = base.CreateParams; cp.ExStyle |= 0x20; return cp; }
            }
        }

        // ── MiniPlayerListener ────────────────────────────────────────────────
        private class MiniPlayerListener : MiniPlayerButton.IMiniPlayerListener
        {
            private readonly ChocoPlayer _p;
            public MiniPlayerListener(ChocoPlayer player) => _p = player;

            public void OnMiniModeToggled(bool isMiniMode)
            {
                if (isMiniMode)
                {
                    _p.TopMost = true;
                    _p.DisableMinimumSize();
                    _p.ExitFullscreen();
                    _p._isMiniMode = true;
                    _p._miniPlayerButton?.ApplyMiniMode(_p);
                }
                else
                {
                    _p.TopMost = false;
                    _p.EnableMinimumSize();
                    _p._isMiniMode = false;
                    _p._miniPlayerButton?.RestoreOriginalMode(_p);
                    _p.RefreshIcon();
                }
                _p.UpdateLayout();
                _p.SaveMiniModeState();
            }
        }
    }
}
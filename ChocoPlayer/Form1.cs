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

        public Form1(string? videoPath = null)
        {
            InitializeVLC();
            SetupUI();

            this.FormClosing += Form1_FormClosing;
            this.Resize += Form1_Resize;

            // Si un chemin vidéo est fourni, ouvrir la vidéo
            if (!string.IsNullOrEmpty(videoPath))
            {
                OpenFile(videoPath);
            }
        }

        private void InitializeVLC()
        {
            Core.Initialize();

            // Arguments VLC optimisés pour les streams en ligne
            string[] vlcArgs = new string[]
            {
                "--no-video-title-show",
                "--avcodec-hw=any",
                
                // Optimisations pour le streaming
                "--file-caching=2000",           // Cache pour fichiers locaux (ms)
                "--network-caching=3000",        // Cache pour streams réseau (ms) - augmenté pour meilleure stabilité
                "--live-caching=1000",           // Cache pour streams live
                "--sout-mux-caching=2000",
                "--clock-jitter=1000",           // Augmenté pour compenser les variations réseau
                
                "--no-sub-autodetect-file",
                "--no-video-deco",
                "--drop-late-frames",
                "--skip-frames",
                
                // Optimisations codec
                "--avcodec-skiploopfilter=4",
                "--avcodec-skip-idct=4",
                "--avcodec-threads=4",
                "--avcodec-fast",
                
                // Performance
                "--no-plugins-cache",
                "--no-stats",
                "--no-osd",
                "--quiet",
                
                // Audio
                "--audio-resampler=soxr",
                
                // HTTP/Network optimizations
                "--http-reconnect",              // Reconnexion automatique
                "--http-continuous",             // Stream continu
                "--adaptive-logic=highrate",     // Logique adaptative pour streaming
            };

            _libVLC = new LibVLC();
            _mediaPlayer = new MediaPlayer(_libVLC);

            // Configurer les événements du lecteur pour déboguer
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

        private void SetupUI()
        {
            this.Text = "ChocoPlayer";
            this.Size = new Size(800, 600);
            this.BackColor = Color.Black;

            // Activer le mode sombre de la barre de titre (Windows 11)
            if (Environment.OSVersion.Version.Build >= 22000)
            {
                UseImmersiveDarkMode(this.Handle, true);
            }

            // Créer l'icône personnalisée
            this.Icon = CreateCustomIcon();

            // Zone vidéo
            _videoView = new VideoView
            {
                MediaPlayer = _mediaPlayer,
                BackColor = Color.Black
            };
            this.Controls.Add(_videoView);

            // Contrôles du lecteur
            _playerControls = new PlayerControls();
            _playerControls.SetProgressChangeListener(new ProgressListener(this));
            this.Controls.Add(_playerControls);

            // Menu des pistes
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
            _playerControls.SetBounds(0, this.ClientSize.Height - controlsHeight, this.ClientSize.Width, controlsHeight);
            _playerControls.BringToFront();

            int settingsX = _playerControls.GetSettingX();
            _trackSettingsMenu!.SetPosition(settingsX, this.ClientSize.Height - controlsHeight, controlsHeight);
            _trackSettingsMenu.BringToFront();
        }

        private void Form1_Resize(object? sender, EventArgs e)
        {
            UpdateLayout();
        }

        // Méthode pour ouvrir fichier local OU URL de stream
        private void OpenFile(string path)
        {
            try
            {
                Console.WriteLine($"Ouverture de: {path}");

                // Créer le media (fonctionne pour fichiers locaux ET URLs)
                var media = new Media(_libVLC, path, FromType.FromLocation);

                // Options additionnelles pour les streams HTTP
                if (path.StartsWith("http://") || path.StartsWith("https://"))
                {
                    // Ajouter des options spécifiques au stream
                    media.AddOption(":http-reconnect");
                    media.AddOption(":network-caching=3000");
                }

                _mediaPlayer!.Media = media;
                _mediaPlayer.Play();
                _playerControls!.SetPlaying(true);

                Console.WriteLine("Lecture démarrée");
            }
            catch (Exception ex)
            {
                Console.WriteLine($"Erreur: {ex.Message}");
                MessageBox.Show($"Impossible de lire le média: {ex.Message}", "Erreur", MessageBoxButtons.OK, MessageBoxIcon.Error);
            }
        }

        // Méthode originale avec dialogue
        private void OpenFileDialog()
        {
            using (var openFileDialog = new OpenFileDialog())
            {
                openFileDialog.Filter = "Fichiers vidéo|*.mp4;*.avi;*.mkv;*.mov;*.wmv;*.flv;*.webm|Tous les fichiers|*.*";

                if (openFileDialog.ShowDialog() == DialogResult.OK)
                {
                    OpenFile(openFileDialog.FileName);
                }
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
                // Charger l'icône depuis le fichier
                string iconPath = System.IO.Path.Combine(
                    System.IO.Path.GetDirectoryName(Application.ExecutablePath) ?? "",
                    "icon.ico"
                );

                Console.WriteLine(iconPath);

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
            // L'ancienne méthode comme fallback
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

        // Classes de listeners
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
                // Optionnel: mise à jour pendant le drag
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
                _form._trackSettingsMenu?.Toggle();
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
                _form._trackSettingsMenu?.Hide();
            }

            public void OnSubtitleTrackSelected(int trackId)
            {
                if (_form._mediaPlayer != null)
                {
                    _form._mediaPlayer.SetSpu(trackId);
                }
                _form._trackSettingsMenu?.Hide();
            }
        }
    }
}
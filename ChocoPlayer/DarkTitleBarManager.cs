using System;
using System.Runtime.InteropServices;
using System.Windows.Forms;

namespace DarkTitleBar
{
    /// <summary>
    /// Classe utilitaire pour appliquer une barre de titre sombre sur Windows, macOS et Linux
    /// </summary>
    public static class DarkTitleBarManager
    {
        #region Windows API

        [DllImport("dwmapi.dll")]
        private static extern int DwmSetWindowAttribute(IntPtr hwnd, int attr, ref int attrValue, int attrSize);

        private const int DWMWA_USE_IMMERSIVE_DARK_MODE_BEFORE_20H1 = 19;
        private const int DWMWA_USE_IMMERSIVE_DARK_MODE = 20;

        #endregion

        #region macOS API

        [DllImport("/usr/lib/libobjc.dylib", EntryPoint = "objc_getClass")]
        private static extern IntPtr objc_getClass(string className);

        [DllImport("/usr/lib/libobjc.dylib", EntryPoint = "sel_registerName")]
        private static extern IntPtr sel_registerName(string selectorName);

        [DllImport("/usr/lib/libobjc.dylib", EntryPoint = "objc_msgSend")]
        private static extern IntPtr objc_msgSend(IntPtr receiver, IntPtr selector);

        [DllImport("/usr/lib/libobjc.dylib", EntryPoint = "objc_msgSend")]
        private static extern void objc_msgSend(IntPtr receiver, IntPtr selector, IntPtr arg);

        [DllImport("/usr/lib/libobjc.dylib", EntryPoint = "objc_msgSend")]
        private static extern IntPtr objc_msgSend_IntPtr(IntPtr receiver, IntPtr selector, IntPtr arg);

        #endregion

        #region Linux API (GTK)

        [DllImport("libgtk-3.so.0", EntryPoint = "gtk_settings_get_default", CallingConvention = CallingConvention.Cdecl)]
        private static extern IntPtr gtk_settings_get_default();

        [DllImport("libgobject-2.0.so.0", EntryPoint = "g_object_set", CallingConvention = CallingConvention.Cdecl)]
        private static extern void g_object_set(IntPtr settings, string property, int value, IntPtr terminator);

        #endregion

        /// <summary>
        /// Applique une barre de titre sombre à la fenêtre spécifiée
        /// </summary>
        /// <param name="form">Le formulaire Windows Forms</param>
        /// <returns>True si l'opération a réussi, False sinon</returns>
        public static bool ApplyDarkTitleBar(Form form)
        {
            if (form == null)
                throw new ArgumentNullException(nameof(form));

            return ApplyDarkTitleBar(form.Handle);
        }

        /// <summary>
        /// Applique une barre de titre sombre à la fenêtre spécifiée par son handle
        /// </summary>
        /// <param name="handle">Le handle de la fenêtre</param>
        /// <returns>True si l'opération a réussi, False sinon</returns>
        public static bool ApplyDarkTitleBar(IntPtr handle)
        {
            if (handle == IntPtr.Zero)
                return false;

            try
            {
                if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                {
                    return ApplyWindowsDarkTitleBar(handle);
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                {
                    return ApplyMacOSDarkTitleBar(handle);
                }
                else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                {
                    return ApplyLinuxDarkTitleBar();
                }

                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DarkTitleBarManager] Erreur : {ex.Message}");
                return false;
            }
        }

        #region Windows Implementation

        private static bool ApplyWindowsDarkTitleBar(IntPtr handle)
        {
            if (Environment.OSVersion.Platform != PlatformID.Win32NT)
                return false;

            int build = Environment.OSVersion.Version.Build;

            try
            {
                // Windows 11 (build 22000+) ou Windows 10 2004+ (build 19041+)
                if (build >= 19041)
                {
                    int useImmersiveDarkMode = 1;
                    int attribute = build >= 22000 ? DWMWA_USE_IMMERSIVE_DARK_MODE : DWMWA_USE_IMMERSIVE_DARK_MODE;

                    return DwmSetWindowAttribute(handle, attribute, ref useImmersiveDarkMode, sizeof(int)) == 0;
                }
                // Windows 10 1903-1909 (build 18985+)
                else if (build >= 18985)
                {
                    int value = 1;
                    return DwmSetWindowAttribute(handle, DWMWA_USE_IMMERSIVE_DARK_MODE_BEFORE_20H1, ref value, sizeof(int)) == 0;
                }

                Console.WriteLine($"[DarkTitleBarManager] Windows build {build} ne supporte pas le mode sombre de la barre de titre");
                return false;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DarkTitleBarManager] Erreur Windows : {ex.Message}");
                return false;
            }
        }

        #endregion

        #region macOS Implementation

        private static bool ApplyMacOSDarkTitleBar(IntPtr handle)
        {
            try
            {
                IntPtr nsWindow = GetNSWindow(handle);

                if (nsWindow == IntPtr.Zero)
                {
                    Console.WriteLine("[DarkTitleBarManager] Impossible de récupérer la NSWindow");
                    return false;
                }

                // Créer l'apparence sombre
                IntPtr nsAppearanceClass = objc_getClass("NSAppearance");
                IntPtr appearanceNamed = sel_registerName("appearanceNamed:");

                // Utiliser NSAppearanceNameVibrantDark ou NSAppearanceNameDarkAqua
                IntPtr appearanceName = GetNSString("NSAppearanceNameDarkAqua");
                IntPtr darkAppearance = objc_msgSend_IntPtr(nsAppearanceClass, appearanceNamed, appearanceName);

                if (darkAppearance == IntPtr.Zero)
                {
                    // Fallback sur VibrantDark
                    appearanceName = GetNSString("NSAppearanceNameVibrantDark");
                    darkAppearance = objc_msgSend_IntPtr(nsAppearanceClass, appearanceNamed, appearanceName);
                }

                if (darkAppearance == IntPtr.Zero)
                {
                    Console.WriteLine("[DarkTitleBarManager] Impossible de créer l'apparence sombre");
                    return false;
                }

                // Appliquer l'apparence
                IntPtr setAppearance = sel_registerName("setAppearance:");
                objc_msgSend(nsWindow, setAppearance, darkAppearance);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DarkTitleBarManager] Erreur macOS : {ex.Message}");
                return false;
            }
        }

        private static IntPtr GetNSWindow(IntPtr handle)
        {
            // Méthode 1 : Via Mono (si disponible)
            try
            {
                var carbonType = Type.GetType("System.Windows.Forms.XplatUICarbon, System.Windows.Forms");
                if (carbonType != null)
                {
                    var method = carbonType.GetMethod("GetWindow",
                        System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.NonPublic);

                    if (method != null)
                    {
                        var result = method.Invoke(null, new object[] { handle });
                        if (result != null)
                        {
                            return (IntPtr)result;
                        }
                    }
                }
            }
            catch { }

            try
            {
                var cocoaType = Type.GetType("System.Windows.Forms.XplatUICocoa, System.Windows.Forms");
                if (cocoaType != null)
                {
                    var method = cocoaType.GetMethod("GetNSWindow",
                        System.Reflection.BindingFlags.Static | System.Reflection.BindingFlags.NonPublic);

                    if (method != null)
                    {
                        var result = method.Invoke(null, new object[] { handle });
                        if (result != null)
                        {
                            return (IntPtr)result;
                        }
                    }
                }
            }
            catch { }

            return handle;
        }

        private static IntPtr GetNSString(string str)
        {
            IntPtr nsStringClass = objc_getClass("NSString");
            IntPtr stringWithUTF8String = sel_registerName("stringWithUTF8String:");

            IntPtr utf8 = Marshal.StringToHGlobalAnsi(str);
            IntPtr nsString = objc_msgSend_IntPtr(nsStringClass, stringWithUTF8String, utf8);
            Marshal.FreeHGlobal(utf8);

            return nsString;
        }

        #endregion

        #region Linux Implementation

        private static bool ApplyLinuxDarkTitleBar()
        {
            try
            {
                if (!IsGtkAvailable())
                {
                    Console.WriteLine("[DarkTitleBarManager] GTK n'est pas disponible sur ce système Linux");
                    return false;
                }

                IntPtr settings = gtk_settings_get_default();

                if (settings == IntPtr.Zero)
                {
                    Console.WriteLine("[DarkTitleBarManager] Impossible de récupérer les paramètres GTK");
                    return false;
                }

                // Activer le thème sombre GTK
                g_object_set(settings, "gtk-application-prefer-dark-theme", 1, IntPtr.Zero);

                return true;
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[DarkTitleBarManager] Erreur Linux : {ex.Message}");
                return false;
            }
        }

        private static bool IsGtkAvailable()
        {
            try
            {
                gtk_settings_get_default();
                return true;
            }
            catch
            {
                return false;
            }
        }

        #endregion

        /// <summary>
        /// Vérifie si le mode sombre est supporté sur la plateforme actuelle
        /// </summary>
        /// <returns>True si supporté, False sinon</returns>
        public static bool IsDarkModeSupported()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
            {
                return Environment.OSVersion.Version.Build >= 18985;
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
            {
                // macOS supporte le mode sombre depuis macOS 10.14 (Mojave)
                // Difficile à vérifier sans API native, on assume que c'est supporté
                return true;
            }
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
            {
                return IsGtkAvailable();
            }

            return false;
        }

        /// <summary>
        /// Retourne le nom de la plateforme actuelle
        /// </summary>
        public static string GetPlatformName()
        {
            if (RuntimeInformation.IsOSPlatform(OSPlatform.Windows))
                return "Windows";
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.OSX))
                return "macOS";
            else if (RuntimeInformation.IsOSPlatform(OSPlatform.Linux))
                return "Linux";
            else
                return "Unknown";
        }
    }
}
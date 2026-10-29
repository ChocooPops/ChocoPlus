using System;
using System.IO;
using LibVLCSharp.Shared;

namespace ChocoPlayer
{
    // Without plugins/plugins.dat, libvlc loads its ~320 plugin DLLs on every launch to read their
    // capabilities (very slow on a cold start: disk reads + antivirus scan of each DLL).
    // With it, libvlc only loads the plugins the media actually needs.
    public static class VlcPluginsCache
    {
        // Passed by the publish step (see ChocoPlayer.csproj) so the cache ships with the app
        public const string GENERATE_ARG = "--generate-vlc-plugins-cache";

        // Same folder as the one Core.Initialize() picks: libvlc\win-x64 or libvlc\win-x86
        private static string CacheFile => Path.Combine(
            AppContext.BaseDirectory, "libvlc",
            Environment.Is64BitProcess ? "win-x64" : "win-x86",
            "plugins", "plugins.dat");

        // Cache missing (dev build, deleted file): libvlc scans the plugins as before and writes it for the next launches
        public static string[] GetLibVLCArgs()
            => File.Exists(CacheFile) ? [] : ["--reset-plugins-cache"];

        public static bool Generate()
        {
            try
            {
                Core.Initialize();
                using var libVLC = new LibVLC("--reset-plugins-cache", "--quiet");
                return File.Exists(CacheFile);
            }
            catch
            {
                return false;
            }
        }
    }
}

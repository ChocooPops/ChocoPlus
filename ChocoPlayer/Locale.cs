using System.Collections.Generic;

namespace ChocoPlayer
{
    public static class Locale
    {
        private static string _lang = "en";

        private static readonly Dictionary<string, Dictionary<string, string>> _t = new()
        {
            ["fr"] = new()
            {
                ["track.title"]        = "Paramètres de lecture",
                ["track.audio"]        = "Pistes Audio",
                ["track.subtitles"]    = "Sous-titres",
                ["track.no_audio"]     = "Aucune piste disponible",
                ["track.no_subtitles"] = "Aucun sous-titre disponible",
                ["track.disable"]      = "Désactiver",

                ["season.select"]      = "Sélectionner une saison",
                ["season.season"]      = "Saison",
                ["season.no_episodes"] = "Aucun épisode disponible",
                ["season.loading"]     = "Chargement...",
                ["season.episode"]     = "ÉP.",
                ["season.playing"]     = "En lecture",
            },
            ["en"] = new()
            {
                ["track.title"]        = "Playback Settings",
                ["track.audio"]        = "Audio Tracks",
                ["track.subtitles"]    = "Subtitles",
                ["track.no_audio"]     = "No track available",
                ["track.no_subtitles"] = "No subtitle available",
                ["track.disable"]      = "Disable",

                ["season.select"]      = "Select a season",
                ["season.season"]      = "Season",
                ["season.no_episodes"] = "No episode available",
                ["season.loading"]     = "Loading...",
                ["season.episode"]     = "EP.",
                ["season.playing"]     = "Now Playing",
            },
            ["ja"] = new()
            {
                ["track.title"]        = "再生設定",
                ["track.audio"]        = "音声トラック",
                ["track.subtitles"]    = "字幕",
                ["track.no_audio"]     = "トラックなし",
                ["track.no_subtitles"] = "字幕なし",
                ["track.disable"]      = "無効",

                ["season.select"]      = "シーズン選択",
                ["season.season"]      = "シーズン",
                ["season.no_episodes"] = "エピソードなし",
                ["season.loading"]     = "読み込み中...",
                ["season.episode"]     = "EP.",
                ["season.playing"]     = "再生中",
            },
        };

        public static string Language => _lang;

        public static void SetLanguage(string? lang)
        {
            _lang = lang?.ToLower() ?? "en";
        }

        public static string Get(string key)
        {
            if (_lang == "none")
                return key;

            if (_t.TryGetValue(_lang, out var dict) && dict.TryGetValue(key, out var value))
                return value;

            // Fallback
            if (_t["en"].TryGetValue(key, out var fallback))
                return fallback;

            return key;
        }
    }
}

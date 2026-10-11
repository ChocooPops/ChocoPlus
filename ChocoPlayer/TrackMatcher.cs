using System;
using System.Collections.Generic;
using System.Globalization;
using System.Linq;
using System.Text;
using System.Text.RegularExpressions;

namespace ChocoPlayer
{
    // Finds, among the tracks of a new media, the one that best matches a previously selected track name.
    // Track names are free text (e.g. "Japonais - [Japanese]", "VO EAC3 256 kbps - [Japonais]"),
    // so names are parsed into a profile (language, kind, variant, codec, channels) and profiles are compared.
    public static class TrackMatcher
    {
        public const string DISABLED = "__DISABLED__";

        public enum TrackKind { Normal, Forced, Sdh, Signs, Commentary, AudioDescription }

        public sealed class TrackProfile
        {
            public string Normalized = "";
            public HashSet<string> Tokens = new();
            public string? Language;
            public string? Variant;
            public TrackKind Kind = TrackKind.Normal;
            public string? Codec;
            public string? Channels;
        }

        // ── Languages ─────────────────────────────────────────────────────────
        // Aliases are compared after normalization (lowercase, no accents)
        private static readonly Dictionary<string, string[]> _languageAliases = new()
        {
            ["fr"] = ["french", "francais", "fra", "fre", "fr", "frca", "vf", "vff", "vfq", "vfi", "vfb", "vfc", "vof", "truefrench"],
            ["en"] = ["english", "anglais", "eng", "en"],
            ["ja"] = ["japanese", "japonais", "jpn", "ja", "jp", "日本語"],
            ["de"] = ["german", "deutsch", "allemand", "deu", "ger", "de"],
            ["es"] = ["spanish", "espanol", "espagnol", "castellano", "castilian", "latino", "spa", "es"],
            ["it"] = ["italian", "italiano", "italien", "ita", "it"],
            ["pt"] = ["portuguese", "portugues", "portugais", "por", "pt"],
            ["ru"] = ["russian", "russe", "русскии", "rus", "ru"],
            ["zh"] = ["chinese", "chinois", "mandarin", "cantonese", "cantonais", "中文", "zho", "chi", "zh"],
            ["ko"] = ["korean", "coreen", "한국어", "kor", "ko"],
            ["ar"] = ["arabic", "arabe", "العربية", "ara", "ar"],
            ["hi"] = ["hindi", "हिन्दी", "hin", "hi"],
            ["nl"] = ["dutch", "nederlands", "neerlandais", "nld", "dut", "nl"],
            ["pl"] = ["polish", "polski", "polonais", "pol", "pl"],
            ["tr"] = ["turkish", "turkce", "turc", "tur", "tr"],
            ["sv"] = ["swedish", "svenska", "suedois", "swe", "sv"],
            ["da"] = ["danish", "dansk", "danois", "dan", "da"],
            ["no"] = ["norwegian", "norsk", "norvegien", "nor", "no", "nb", "nn"],
            ["fi"] = ["finnish", "suomi", "finnois", "fin", "fi"],
            ["el"] = ["greek", "ελληνικα", "grec", "ell", "gre", "el"],
            ["he"] = ["hebrew", "עברית", "hebreu", "heb", "he"],
            ["th"] = ["thai", "ไทย", "tha", "th"],
            ["vi"] = ["vietnamese", "tieng viet", "vietnamien", "vie", "vi"],
            ["id"] = ["indonesian", "bahasa indonesia", "indonesien", "ind", "id"],
            ["uk"] = ["ukrainian", "украінська", "українська", "ukrainien", "ukr", "uk"],
            ["cs"] = ["czech", "cestina", "tcheque", "ces", "cze", "cs"],
            ["ro"] = ["romanian", "romana", "roumain", "ron", "rum", "ro"],
            ["hu"] = ["hungarian", "magyar", "hongrois", "hun", "hu"],
            ["ca"] = ["catalan", "cat", "ca"],
            ["eu"] = ["basque", "eus", "baq", "eu"],
            ["bn"] = ["bengali", "ben", "bn"],
            ["ta"] = ["tamil", "tam", "ta"],
            ["te"] = ["telugu", "tel", "te"],
            ["ms"] = ["malay", "msa", "may", "ms"],
            ["tl"] = ["filipino", "tagalog", "fil", "tgl", "tl"],
        };

        // Codes (≤ 3 letters) that are reliable in a free title. Others ("en", "de", "it", "hi", "no", "uk",
        // "may", "fin", "cat"...) collide with common words or other meanings, so they are only trusted
        // inside the [language] part added by VLC from the container tag.
        private static readonly HashSet<string> _safeTitleCodes =
        [
            "fr", "ja", "jp", "es", "ru", "zh", "pt", "ko", "pl", "nl",
            "vf", "vff", "vfq", "vfi", "vfb", "vfc", "vof",
            "fra", "fre", "eng", "jpn", "ger", "deu", "spa", "ita", "rus", "zho", "kor", "pol", "nld", "dut", "swe", "tur",
        ];

        private static readonly HashSet<string> _undetermined = ["und", "undetermined", "unknown", "inconnu", "mis", "zxx", "mul"];

        // Built in the static constructor: it needs _separators, declared further down
        private static readonly Dictionary<string, string> _aliasToLanguage;

        static TrackMatcher() => _aliasToLanguage = BuildAliasMap();

        private static Dictionary<string, string> BuildAliasMap()
        {
            var map = new Dictionary<string, string>();
            foreach (var (code, aliases) in _languageAliases)
                foreach (var alias in aliases)
                    map[Normalize(alias)] = code;
            return map;
        }

        // ── Variants (dub origin / region) ────────────────────────────────────
        private static readonly (string Variant, string[] Aliases)[] _variants =
        [
            ("vff",     ["vff", "truefrench"]),
            ("ca",      ["vfq", "vfc", "quebec", "quebecois", "canada", "canadien", "canadian", "frca"]),
            ("vfi",     ["vfi"]),
            ("be",      ["vfb", "belgique", "belge", "belgian"]),
            ("br",      ["brazil", "brasil", "brazilian", "bresilien"]),
            ("latam",   ["latino", "latam", "latin america", "latinoamerica", "419"]),
            ("es-es",   ["castellano", "castilian", "espana", "spain"]),
            ("yue",     ["cantonese", "cantonais", "yue"]),
            ("zh-hant", ["traditional", "traditionnel", "cht", "zht"]),
            ("zh-hans", ["simplified", "simplifie", "chs", "zhs"]),
        ];

        // Region part of codes like fr-CA, pt-BR, es-419, zh-TW
        private static readonly Dictionary<string, string> _regionVariants = new()
        {
            ["fr-ca"] = "ca", ["fr-be"] = "be",
            ["pt-br"] = "br",
            ["es-419"] = "latam", ["es-mx"] = "latam", ["es-es"] = "es-es",
            ["zh-tw"] = "zh-hant", ["zh-hk"] = "yue", ["zh-cn"] = "zh-hans",
        };

        // ── Kinds ─────────────────────────────────────────────────────────────
        private static readonly (TrackKind Kind, string[] Aliases)[] _kinds =
        [
            (TrackKind.Commentary,       ["commentary", "commentaire", "commentaires", "commentaries"]),
            (TrackKind.AudioDescription, ["audio description", "audiodescription", "descriptive audio", "descriptive", "dvs", "ad"]),
            (TrackKind.Signs,            ["signs", "songs", "lyrics", "karaoke", "on screen text", "panneaux", "chansons"]),
            (TrackKind.Sdh,              ["sdh", "hi", "hoh", "sme", "cc", "closed captions", "hearing impaired", "sourds et malentendants", "malentendants"]),
            (TrackKind.Forced,           ["forced", "force", "forces", "forcee", "forcees", "partial", "partiel", "partiels", "foreign parts only", "foreign"]),
        ];

        // ── Codecs / channels (checked in order: most specific first) ─────────
        private static readonly (string Codec, Regex Pattern)[] _codecs =
        [
            ("truehd",  new Regex(@"truehd|\bmlp\b", RegexOptions.Compiled)),
            ("dtshdma", new Regex(@"dts[\s\-_.]?hd[\s\-_.]?(ma|master)", RegexOptions.Compiled)),
            ("dtshd",   new Regex(@"dts[\s\-_.]?hd", RegexOptions.Compiled)),
            ("dtsx",    new Regex(@"dts[\s:\-]?x\b", RegexOptions.Compiled)),
            ("dts",     new Regex(@"\bdts\b", RegexOptions.Compiled)),
            ("eac3",    new Regex(@"e[\s\-]?ac[\s\-]?3|\bddp\b|\bdd\+|dolby digital plus", RegexOptions.Compiled)),
            ("ac3",     new Regex(@"\bac[\s\-]?3\b|\bdd\b|dolby digital", RegexOptions.Compiled)),
            ("aac",     new Regex(@"\b(he[\s\-]?)?aac", RegexOptions.Compiled)),
            ("flac",    new Regex(@"\bflac\b", RegexOptions.Compiled)),
            ("pcm",     new Regex(@"\bl?pcm\b", RegexOptions.Compiled)),
            ("opus",    new Regex(@"\bopus\b", RegexOptions.Compiled)),
            ("vorbis",  new Regex(@"\bvorbis\b", RegexOptions.Compiled)),
            ("mp3",     new Regex(@"\bmp3\b|mpeg audio", RegexOptions.Compiled)),
            ("pgs",     new Regex(@"\bpgs\b|\bsup\b|hdmv", RegexOptions.Compiled)),
            ("ass",     new Regex(@"\bass\b|\bssa\b", RegexOptions.Compiled)),
            ("srt",     new Regex(@"\bsrt\b|subrip|utf[\s\-]?8", RegexOptions.Compiled)),
            ("vtt",     new Regex(@"\bvtt\b|webvtt", RegexOptions.Compiled)),
            ("vobsub",  new Regex(@"vobsub|\bidx\b", RegexOptions.Compiled)),
        ];

        private static readonly Regex _channelsRegex  = new(@"\b([1-8])[.,]([01])\b|\b([1-8])\s?ch\b", RegexOptions.Compiled);
        private static readonly Regex _bracketRegex   = new(@"\[([^\]]*)\]", RegexOptions.Compiled);
        private static readonly Regex _langRegionRegex = new(@"(?<![a-z])([a-z]{2,3})[\-_]([a-z]{2}|\d{3})(?![a-z0-9])", RegexOptions.Compiled);
        private static readonly Regex _separators     = new(@"[\s\-_.|/\\()\[\]{},:;+!?'""&*~#]+", RegexOptions.Compiled);

        // ══════════════════════════════════════════════════════════════════════
        // Public API
        // ══════════════════════════════════════════════════════════════════════

        // Returns the id of the best matching track, or -1 if none is close enough.
        // Tracks with id -1 (VLC "Disable" entry) are ignored.
        public static int FindBestTrack(string preferredName, IEnumerable<(int Id, string? Name)> tracks)
        {
            if (string.IsNullOrWhiteSpace(preferredName) || preferredName == DISABLED) return -1;

            var preferred = Parse(preferredName);
            int bestId    = -1;
            int bestScore = int.MinValue;

            foreach (var (id, name) in tracks)
            {
                if (id == -1 || string.IsNullOrWhiteSpace(name)) continue;

                var candidate = Parse(name);
                if (candidate.Normalized == preferred.Normalized) return id;

                int? score = Score(preferred, candidate);
                if (score.HasValue && score.Value > bestScore)
                {
                    bestScore = score.Value;
                    bestId    = id;
                }
            }

            return bestScore > 0 ? bestId : -1;
        }

        public static TrackProfile Parse(string name)
        {
            string lower      = RemoveDiacritics(name).ToLowerInvariant();
            string normalized = Normalize(name);
            var profile = new TrackProfile
            {
                Normalized = normalized,
                Tokens     = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries).ToHashSet(),
            };

            // Language: the [..] part added by VLC (container tag) first, then the free title
            string title = _bracketRegex.Replace(lower, " ");
            foreach (Match m in _bracketRegex.Matches(lower))
            {
                profile.Language ??= DetectLanguage(m.Groups[1].Value, trustShortCodes: true);
                if (profile.Language != null) break;
            }
            profile.Language ??= DetectLanguage(title, trustShortCodes: false);

            // Explicit codes with region (fr-CA, pt-BR, es-419...)
            foreach (Match m in _langRegionRegex.Matches(lower))
            {
                if (!_aliasToLanguage.TryGetValue(m.Groups[1].Value, out var lang)) continue;
                profile.Language ??= lang;
                if (_regionVariants.TryGetValue($"{m.Groups[1].Value}-{m.Groups[2].Value}", out var region))
                    profile.Variant ??= region;
            }

            profile.Variant ??= _variants.FirstOrDefault(v => v.Aliases.Any(a => ContainsAlias(normalized, profile.Tokens, a))).Variant;
            profile.Kind      = _kinds.FirstOrDefault(k => k.Aliases.Any(a => ContainsAlias(normalized, profile.Tokens, a))).Kind;
            profile.Codec     = _codecs.FirstOrDefault(c => c.Pattern.IsMatch(lower)).Codec;
            profile.Channels  = DetectChannels(lower);

            return profile;
        }

        // ══════════════════════════════════════════════════════════════════════
        // Scoring
        // ══════════════════════════════════════════════════════════════════════
        // null = incompatible track
        private static int? Score(TrackProfile preferred, TrackProfile candidate)
        {
            int score;

            if (preferred.Language != null)
            {
                if (candidate.Language != preferred.Language) return null;
                score = 100;
            }
            else
            {
                // Unknown language ("Track 2", "Unknown"...): fall back to text similarity
                if (candidate.Normalized.Contains(preferred.Normalized) || preferred.Normalized.Contains(candidate.Normalized))
                    score = 60;
                else if (LevenshteinDistance(candidate.Normalized, preferred.Normalized) <= preferred.Normalized.Length / 3)
                    score = 40;
                else
                    return null;
            }

            // Commentary / audio description are never a substitute for a regular track (and vice versa)
            if (preferred.Kind != candidate.Kind)
            {
                bool special = preferred.Kind is TrackKind.Commentary or TrackKind.AudioDescription
                            || candidate.Kind is TrackKind.Commentary or TrackKind.AudioDescription;
                if (special) return null;
                score -= 40;
            }
            else
            {
                score += 40;
            }

            if (preferred.Variant != null && candidate.Variant != null)
                score += preferred.Variant == candidate.Variant ? 30 : -30;
            else if (preferred.Variant != candidate.Variant)
                score -= 5;

            if (preferred.Codec != null && preferred.Codec == candidate.Codec)       score += 5;
            if (preferred.Channels != null && preferred.Channels == candidate.Channels) score += 5;

            // Tie-breaker: shared words
            int common = preferred.Tokens.Intersect(candidate.Tokens).Count();
            int union  = preferred.Tokens.Union(candidate.Tokens).Count();
            if (union > 0) score += (int)Math.Round(10.0 * common / union);

            return score;
        }

        // ══════════════════════════════════════════════════════════════════════
        // Helpers
        // ══════════════════════════════════════════════════════════════════════
        private static string? DetectLanguage(string text, bool trustShortCodes)
        {
            string normalized = Normalize(text);
            if (normalized.Length == 0) return null;

            var tokens = normalized.Split(' ', StringSplitOptions.RemoveEmptyEntries);
            if (trustShortCodes && tokens.All(t => _undetermined.Contains(t))) return null;

            // Multi-word or non-latin aliases ("bahasa indonesia", "中文")
            foreach (var (alias, code) in _aliasToLanguage)
                if ((alias.Contains(' ') || !IsAscii(alias)) && ContainsAlias(normalized, tokens, alias))
                    return code;

            // Full names first ("Version en français" must give fr, not en), then codes
            foreach (bool fullNames in new[] { true, false })
                foreach (var token in tokens)
                {
                    if ((token.Length > 3) != fullNames) continue;
                    if (!_aliasToLanguage.TryGetValue(token, out var code)) continue;
                    if (!fullNames && !trustShortCodes && !_safeTitleCodes.Contains(token)) continue;
                    return code;
                }

            return null;
        }

        private static bool ContainsAlias(string normalized, IEnumerable<string> tokens, string alias)
        {
            if (!IsAscii(alias)) return normalized.Contains(alias);
            if (alias.Contains(' ')) return $" {normalized} ".Contains($" {alias} ");
            return tokens.Contains(alias);
        }

        private static string? DetectChannels(string lower)
        {
            if (Regex.IsMatch(lower, @"\bstereo\b")) return "2.0";
            if (Regex.IsMatch(lower, @"\bmono\b"))   return "1.0";

            var m = _channelsRegex.Match(lower);
            if (!m.Success) return null;
            if (m.Groups[1].Success) return $"{m.Groups[1].Value}.{m.Groups[2].Value}";

            // "6ch" → 5.1, "8ch" → 7.1, "2ch" → 2.0
            return m.Groups[3].Value switch { "2" => "2.0", "6" => "5.1", "8" => "7.1", var n => $"{n}ch" };
        }

        private static string Normalize(string text)
            => _separators.Replace(RemoveDiacritics(text).ToLowerInvariant(), " ").Trim();

        private static string RemoveDiacritics(string text)
        {
            var sb = new StringBuilder(text.Length);
            foreach (char c in text.Normalize(NormalizationForm.FormD))
                if (CharUnicodeInfo.GetUnicodeCategory(c) != UnicodeCategory.NonSpacingMark)
                    sb.Append(c);
            return sb.ToString().Normalize(NormalizationForm.FormC);
        }

        private static bool IsAscii(string s) => s.All(c => c < 128);

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
    }
}

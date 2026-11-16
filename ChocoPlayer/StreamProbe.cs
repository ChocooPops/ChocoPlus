using System;
using System.Net;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text.Json;
using System.Threading.Tasks;

namespace ChocoPlayer
{
    // What the server says about a stream URL, without opening a stream:
    //  - TotalBytes: the file size (used to estimate the loaded part of the progress bar)
    //  - ServerMessage: why the server refuses the stream ({ statusCode, message }, ex: 409 "A video is already playing for this user"),
    //    which libVLC never shows (it only reports "an error occurred").
    //
    // The request asks for a range past the end of any file: a working stream answers 416 with "Content-Range: bytes */<size>",
    // a refused one answers its error. ChocoServ checks the stream slot (409) before the range, and never starts reading the file
    // nor saves a watch progress for a 416. Never sent while libVLC is streaming: ChocoServ gives the slot to the newest request
    // of the same player and cuts the previous one.
    public sealed class StreamProbe
    {
        private const long UNSATISFIABLE_START = 1L << 53;   // past the end of any file, still exact for a JS server
        private const int  MAX_MESSAGE_LENGTH  = 300;

        private static readonly HttpClient _http = new();

        public long    TotalBytes    { get; private init; } = -1;
        public int     StatusCode    { get; private init; }
        public string? ServerMessage { get; private init; }

        private static readonly StreamProbe Unknown = new();

        public static bool IsNetworkPath(string path)
            => path.StartsWith("http://", StringComparison.OrdinalIgnoreCase)
            || path.StartsWith("https://", StringComparison.OrdinalIgnoreCase);

        // Never throws: an unreachable server gives an empty result (libVLC then reports its own error)
        public static async Task<StreamProbe> RunAsync(string url, TimeSpan timeout)
        {
            if (!IsNetworkPath(url)) return Unknown;

            try
            {
                using var request = new HttpRequestMessage(HttpMethod.Get, url);
                request.Headers.Range = new RangeHeaderValue(UNSATISFIABLE_START, null);

                using var cts      = new System.Threading.CancellationTokenSource(timeout);
                using var response = await _http.SendAsync(request, HttpCompletionOption.ResponseHeadersRead, cts.Token);

                if (response.StatusCode == HttpStatusCode.RequestedRangeNotSatisfiable)
                    return new StreamProbe
                    {
                        StatusCode = (int)response.StatusCode,
                        TotalBytes = response.Content.Headers.ContentRange?.Length ?? -1,
                    };

                // A server ignoring the range would send the whole file: never read a success body
                if (response.IsSuccessStatusCode)
                    return new StreamProbe { StatusCode = (int)response.StatusCode };

                string body = await response.Content.ReadAsStringAsync(cts.Token);
                return new StreamProbe
                {
                    StatusCode    = (int)response.StatusCode,
                    ServerMessage = ReadMessage(body),
                };
            }
            catch
            {
                return Unknown;
            }
        }

        // { statusCode, message } where message can be a string or a list (NestJS validation errors),
        // or a short plain text answer (ex: "File not found")
        private static string? ReadMessage(string body)
        {
            string? message = null;
            try
            {
                using var json = JsonDocument.Parse(body);
                if (json.RootElement.ValueKind == JsonValueKind.Object
                    && json.RootElement.TryGetProperty("message", out var value))
                {
                    message = value.ValueKind switch
                    {
                        JsonValueKind.String => value.GetString(),
                        JsonValueKind.Array  => string.Join(", ", value.EnumerateArray().Select(v => v.ToString())),
                        _                    => null,
                    };
                }
            }
            catch (JsonException)
            {
                // Plain text only: an HTML error page would show its markup
                if (!body.Contains('<')) message = body;
            }

            message = message?.Trim();
            if (string.IsNullOrEmpty(message)) return null;
            return message.Length > MAX_MESSAGE_LENGTH ? message[..MAX_MESSAGE_LENGTH] + "…" : message;
        }
    }
}

using System;
using System.Collections.Generic;
using System.Net.Http;
using System.Text.Json;
using System.Threading.Tasks;
using System.Net.Http.Headers;

namespace ChocoPlayer
{
    public class ApiService
    {
        private readonly HttpClient _httpClient;
        private readonly string _baseUrl;
        private readonly string _token;

        public ApiService(string baseUrl, string token)
        {
            _baseUrl = baseUrl;
            _token = token;
            _httpClient = new HttpClient
            {
                Timeout = TimeSpan.FromSeconds(30)
            };
            _httpClient.DefaultRequestHeaders.Authorization =
                new AuthenticationHeaderValue("Bearer", _token);
        }

        public async Task<List<Episode>?> GetEpisodesBySeasonAsync(int seriesId, int seasonId)
        {
            try
            {
                string url = $"{_baseUrl}/series/episodes/{seriesId}/{seasonId}";

                HttpResponseMessage response = await _httpClient.GetAsync(url);

                response.EnsureSuccessStatusCode();

                string jsonResponse = await response.Content.ReadAsStringAsync();

                var options = new JsonSerializerOptions
                {
                    PropertyNameCaseInsensitive = true,
                    PropertyNamingPolicy = JsonNamingPolicy.CamelCase
                };

                var episodes = JsonSerializer.Deserialize<List<Episode>>(jsonResponse, options);

                return episodes;
            }
            catch (HttpRequestException ex)
            {
                Console.WriteLine($"[API] ✗ Erreur HTTP : {ex.Message}");
                throw new Exception($"Impossible de se connecter à l'API : {ex.Message}", ex);
            }
            catch (TaskCanceledException ex)
            {
                Console.WriteLine($"[API] ✗ Timeout : {ex.Message}");
                throw new Exception("La requête a expiré. Vérifiez que l'API est accessible.", ex);
            }
            catch (JsonException ex)
            {
                Console.WriteLine($"[API] ✗ Erreur JSON : {ex.Message}");
                Console.WriteLine($"[API] Position: Line {ex.LineNumber}, Offset {ex.BytePositionInLine}");
                throw new Exception($"Réponse JSON invalide : {ex.Message}", ex);
            }
            catch (Exception ex)
            {
                Console.WriteLine($"[API] ✗ Erreur inattendue : {ex.Message}");
                Console.WriteLine($"[API] Stack : {ex.StackTrace}");
                throw;
            }
        }

        public string GetStreamUrl(int seasonId, int episodeId)
        {
            return $"{_baseUrl}/stream/stream-episode/{seasonId}/{episodeId}?token={_token}";
        }

        public void Dispose()
        {
            _httpClient?.Dispose();
        }
    }
}
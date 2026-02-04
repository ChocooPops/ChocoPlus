using System.Text.Json;

namespace ChocoPlayer;

static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();

        string? json = args.Length > 0 ? args[0] : null;
        VideoInfo? videoInfo = null;

        if (!string.IsNullOrWhiteSpace(json))
        {
            try
            {
                videoInfo = JsonSerializer.Deserialize<VideoInfo>(
                    json,
                    new JsonSerializerOptions
                    {
                        PropertyNameCaseInsensitive = true
                    }
                );
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Impossible de parser le JSON : {ex.Message}");
            }
        }

        Application.Run(new ChocoPlayer(
            videoInfo?.MediaId ?? 0,
            videoInfo?.Token ?? "",
            videoInfo?.Title ?? "",
            videoInfo?.Url ?? "",
            videoInfo?.Width ?? 720,
            videoInfo?.Height ?? 405,
            videoInfo?.PositionX ?? 0,
            videoInfo?.PositionY ?? 0,
            videoInfo?.IsMaximized ?? false,
            videoInfo?.IsFullScreen ?? false,
            videoInfo?.EpisodeId ?? -1,
            videoInfo?.SeasonIndex ?? -1,
            videoInfo?.SeasonMenu ?? []
        ));
    }
}

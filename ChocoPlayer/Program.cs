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

        if (!string.IsNullOrEmpty(json))
        {
            try
            {
                videoInfo = JsonSerializer.Deserialize<VideoInfo>(json);
            }
            catch (Exception ex)
            {
                MessageBox.Show($"Impossible de parser le JSON : {ex.Message}");
            }
        }

        Application.Run(new Form1(
                    videoInfo?.Title ?? "",
                    videoInfo?.Url ?? "",
                    videoInfo?.Width ?? 1920,
                    videoInfo?.Height ?? 1080,
                    videoInfo?.PositionX ?? 0,
                    videoInfo?.PositionY ?? 0
                ));
    }
}
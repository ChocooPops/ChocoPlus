namespace ChocoPlayer;

static class Program
{
    [STAThread]
    static void Main(string[] args)
    {
        ApplicationConfiguration.Initialize();

        string? videoPath = args.Length > 0 ? args[0] : null;

        Application.Run(new Form1(videoPath));
    }
}
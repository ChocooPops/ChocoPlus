# ffmpeg for the internal player

The internal video player (`media-player.js`) uses `ffmpeg.exe` and `ffprobe.exe` to read MKV / HEVC files,
convert the audio tracks Chromium can't play (AC3, EAC3, DTS, TrueHD...) and extract the subtitles.

Put both executables in this folder (Windows x64, ffmpeg 6.1 or newer, with https support), for example the
"essentials" build from https://www.gyan.dev/ffmpeg/builds/ (`bin/ffmpeg.exe` and `bin/ffprobe.exe`).

- `npm run dist` copies them next to the installed app (`resources/ffmpeg`).
- In development, when this folder is empty, the `ffmpeg` and `ffprobe` installed on the PATH are used.

The executables are not versioned (see `.gitignore`).

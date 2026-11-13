// Every icon the internal player shows: controls, keyboard feedback, audio / subtitles and episodes menus,
// mini player, error. Preloaded when a video is launched (ImagePreloaderService.preloadPlayerIcons, called by
// VideoPlayingComponent), so the icons shown later never appear empty. A new icon in the player goes in this list too.
export const PLAYER_ICONS: readonly string[] = [
    // Controls
    'icon/controls/back-arrow.svg',
    'icon/controls/play.svg',
    'icon/controls/stop.svg',
    'icon/controls/fast-backtracking.svg',
    'icon/controls/fast-forward.svg',
    'icon/controls/sound.svg',
    'icon/controls/mute.svg',
    'icon/controls/series.svg',
    'icon/controls/subtitle.svg',
    'icon/controls/mini-player.svg',
    'icon/controls/fullscreen.svg',
    'icon/controls/notfullscreen.svg',
    // Keyboard feedback (space, arrows)
    'icon/controls/backtrackingSpeed.svg',
    'icon/controls/forwardSpeed.svg',
    'icon/controls/keySound0.svg',
    'icon/controls/keySound1.svg',
    'icon/controls/keySound2.svg',
    'icon/controls/keySound3.svg',
    // Menus (tracks, episodes, seasons), mini player, next episode, error
    'icon/success.svg',
    'icon/arrow.svg',
    'icon/play-icon.svg',
    'icon/episode.svg',
    'icon/close.svg',
    'icon/warning.svg'
];

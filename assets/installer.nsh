; Custom steps of the ChocoPlus NSIS installer (package.json > build > nsis > include)

!macro customInstall
  ; libvlc validates its plugins cache with each plugin's modification date, and electron-builder's archive
  ; doesn't keep these dates: the plugins.dat built at publish no longer matches once installed, and ChocoPlayer
  ; would load every plugin DLL on each launch. Rebuild it against the installed files (see ChocoPlayer/VlcPluginsCache.cs).
  ; Deleted first: if the rebuild fails, ChocoPlayer creates it on its first launch (when the folder is writable).
  Delete "$INSTDIR\resources\ChocoPlayer\libvlc\win-x64\plugins\plugins.dat"
  ExecWait '"$INSTDIR\resources\ChocoPlayer\ChocoPlayer.exe" --generate-vlc-plugins-cache'
!macroend

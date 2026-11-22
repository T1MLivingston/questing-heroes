# Music

Drop MP3 files here with these names. Any missing file is simply skipped.

| File | Plays on |
|---|---|
| `theme.mp3` | Title screen (main theme) |
| `acoustic.mp3` | Global acoustic theme: every other visit to the map, menus, and the fallback for any screen without its own track |
| `map.mp3` | Adventure map |
| `town.mp3` | Town screen |
| `battle.mp3` | Battles |
| `victory.mp3` | Short sting after a won battle |
| `defeat.mp3` | Short sting after a lost battle |

Keep each loop under about 3 MB (128 kbps MP3 is plenty).

In the game now (made by Tim Livingston with Suno): theme, acoustic, town, battle, victory, defeat. Still wanted: `map.mp3` (until then the map plays the acoustic theme). Add a new file's name to `MUSIC_HAVE` in `js/16-audio.js`.

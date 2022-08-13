# tdesktop-emoji-sprite-generator

Generate custom emoji sprite for telegram-desktop.

This project was originally some code snippets mentioned in my blog post [为 Telegram Desktop 生成 Emoji Sprite](https://rocka.me/article/generate-emoji-sprite-for-telegram-desktop). Someday I made a simple Web UI for it, and decided to add some more features ... So it's here.

## C++

Emoji text are generated using C++. Files under [cpp/base](./cpp/base) were taken from [desktop-app/lib_base](https://github.com/desktop-app/lib_base); [cpp/codegen](./cpp/codegen) were taken from [desktop-app/codegen](https://github.com/desktop-app/codegen).

### Build

Dependencies: CMake, Qt5

```sh
cd cpp
cmake -B build .
cmake --build build
```

### Usage

```sh
./build/tdesktop-emoji-sprite-generator ../assets/emoji.txt ../web/data.txt
```

## Web

A ready-to-use version is available [here](https://rocka.github.io/tdesktop-emoji-sprite-generator).

Once you have generated data.txt, fire any http server (eg. [svenstaro/miniserve](https://github.com/svenstaro/miniserve) or simply  `python -m http.server`) to serve [./web](./web), and navigate to index.html. The UI is pretty self-explaining, just click "Download .zip" and you should get the archive.

Unzip the archive, and put the folder under `~/.local/share/TelegramDesktop/tdata/emoji`, you may need to delete existing folder with same name. Then goto Telegram settings -> Chat Settings -> Choose emoji set, switch emoji set back to default (Mac), and switch to Android. This should work without even restarting Telegram. **Note:** The preview in "Choose emoji set" dialog won't change, it's hard-coded.

You can modify "Emoji Font" field to generate sprite in whatever font you like, eg. `Segoe UI Emoji` for Windows Emoji, as long as you have the font installed on your system. Enable "Debug (Show Grid)" option, adjust "Font Size" and "Offset X/Y", then click the "Preview" button.

You can also modify "Set ID" field to generate other emoji set if you don't want to override the "Android" set. Currently 1 for Android (default), 2 for Twemoji, 3 for JoyPixels. The default Mac style cannot be overriden.

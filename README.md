# Hold to Speed Video
[![GitHub release](https://img.shields.io/github/v/release/emp0ry/Hold-to-Speed-Video-Extension?label=Latest%20Version)](https://github.com/emp0ry/Hold-to-Speed-Video-Extension/releases/latest)
[![GitHub downloads](https://img.shields.io/github/downloads/emp0ry/Hold-to-Speed-Video-Extension/total.svg)](https://github.com/emp0ry/Hold-to-Speed-Video-Extension/releases/latest)
[![License](https://img.shields.io/github/license/emp0ry/Hold-to-Speed-Video-Extension)](LICENSE.txt)

Hold a single key to temporarily speed up any HTML5 video.

<img width="330" height="428" alt="image" src="https://github.com/user-attachments/assets/e760b4fa-c4b1-4961-9cc6-bb00316f74b1" />

- **Normal speed:** 1.0× (default)
- **Fast speed (while holding):** 2.0× (default)
- **Hold key:** **Z** (default)
- **Notifications:** optional top-right toast (`Fast x2` / `Normal`)

## Features

- Works on most sites with HTML5 video (YouTube, social media, streaming sites, etc.).
- Per-tab behavior: hold to boost speed, release to go back.
- Simple popup settings: enable/disable, speeds, key, notifications.

## Install (Chrome / Edge)

> Chrome and Edge don’t install directly from a `.zip` by dragging it.
> Use **Load unpacked**.

1. Download **Hold-to-Speed-Video-Chrome-Edge.zip**
2. Extract the zip (you should see `manifest.json`, `popup.html`, etc.)
3. Open:
   - Chrome: `chrome://extensions`
   - Edge: `edge://extensions`
4. Enable **Developer mode**
5. Click **Load unpacked**
6. Select the extracted folder

## Install (Firefox)

### Temporary install (for testing)

1. Download **Hold-to-Speed-Video-Firefox.zip**
2. Extract the zip
3. Open `about:debugging`
4. Click **This Firefox**
5. Click **Load Temporary Add-on…**
6. Select the `manifest.json` file inside the extracted folder

> Temporary add-ons reset after you restart Firefox.

## Build from source

This repo includes two manifest templates:

- `manifest_chrome_edge.json` (Manifest V3)
- `manifest_firefox.json` (Manifest V2)

To build, copy the one you need to `manifest.json`.

## 💖 Support the Project  

Love it? Fuel its development with a coffee!  

[![Buy Me a Coffee](https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png)](https://www.buymeacoffee.com/emp0ry)  

## License

Released under the [MIT License](LICENSE.txt).

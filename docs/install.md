# Install Organizer on Android

Organizer is distributed as a **signed APK** from GitHub Releases. It is not on Google Play, so Android will ask you to allow installation from your browser or file manager.

## Requirements

- Android **7.0 (API 24) or newer**.
- Free space for the app and your photos/audio.
- No root and no account required.

## Download

- Latest version: <https://github.com/lore64210/organizer/releases/latest>
- Direct APK download: <https://github.com/lore64210/organizer/releases/latest/download/organizer.apk>
- Portfolio: <https://lore64210.github.io/organizer/>
- Web demo: <https://lore64210.github.io/organizer/demo.html>

<p align="center">
  <img src="assets/qr.png" width="220" alt="QR code to download the APK" />
</p>

Every release includes a `SHA256SUMS.txt` file to verify the download.

## Install

1. Open the link from your **phone** (not from a computer).
2. Download the APK.
3. If Android asks, allow **"Install unknown apps"** for the browser or file manager you are using.
4. Open the downloaded file and tap **Install**.
5. If Play Protect shows a warning, choose **"Install anyway"**. This is normal for apps outside Play.

## Update

- Download the new APK and install it **on top of** the previous version.
- As long as the package (`com.lore64210.organizer`) and the signature stay the same, Android keeps your data.
- If Android says **"App not installed"**, it is probably a signature conflict: uninstall the old version (you will lose local data) and install the new one.

The app **does not update itself**: you have to download the APK again when a new version is released.

## Verify the APK (optional)

On Windows:

```powershell
Get-FileHash .\organizer.apk -Algorithm SHA256
```

Compare the result with the contents of the release's `SHA256SUMS.txt`.

## Permissions

| Permission | Purpose |
|---|---|
| Camera | Take photos and scan QR/barcode codes |
| Microphone | Record audio notes |
| Notifications | Alarms and reminders |
| Photos / storage | Pick images (Android 12 or lower only) |

You can deny any of them and still use the rest of the app, except for the feature that depends on that permission.

## Privacy

Organizer works **offline**. Lists, notes, photos and audio are stored only on your device's storage. There are no servers, accounts, analytics or advertising. See [`PRIVACY.md`](../PRIVACY.md).

## Common issues

- **"For your security, your phone can't install unknown apps"**: enable the permission for the app you open the APK from (Settings → Apps → Special app access → Install unknown apps).
- **Play Protect blocks the installation**: tap "More details" → "Install anyway". If it does not appear, temporarily turn off "Scan apps" in the Play Store.
- **The APK won't download**: try the phone's browser, not an in-app viewer such as Instagram or LinkedIn.
- **The app closes on launch**: check that Android is 7.0+ and that you installed the complete APK (not a partial file).

## Code

The source code is at <https://github.com/lore64210/organizer>. It is a portfolio project; all rights reserved.

---

[Versión en español](./install.es.md)

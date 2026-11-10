# Organizer

Reminder app with lists, text notes, images, audio and alarms.
It works offline: everything is stored on the device with AsyncStorage + Redux Persist.

- **Expo SDK 58** · React Native 0.88 · React 19 · TypeScript 6
- Navigation: `@react-navigation/stack` v7
- State: Redux 5 + `react-redux` 9 + `redux-persist`
- Reorderable lists: `react-native-reorderable-list` (Reanimated 4)
- Audio: `expo-audio` · Camera: `expo-camera` (`CameraView`) · Notifications: `expo-notifications`

## Download

[![Android 7.0+](https://img.shields.io/badge/Android-7.0%2B-3DDC84?logo=android&logoColor=white)](https://github.com/lore64210/organizer/releases/latest)
[![Expo SDK 58](https://img.shields.io/badge/Expo-SDK%2058-000020?logo=expo&logoColor=white)](https://expo.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)

[⬇️ Download APK](https://github.com/lore64210/organizer/releases/latest) · [🖥️ Web demo](https://lore64210.github.io/organizer/demo.html) · [🌐 Portfolio](https://lore64210.github.io/organizer/) · [Install instructions](docs/install.md)

It is distributed as a signed APK from [GitHub Releases](https://github.com/lore64210/organizer/releases). It works offline and requires no account.

<p align="center">
  <img src="docs/assets/qr.png" width="160" alt="QR code to download the APK" />
</p>

### Web demo

The demo runs in the browser with sample data. Notifications do not exist on the web, and the camera, audio and file persistence are limited; for the full experience, install the APK.

<p align="center">
  <img src="docs/assets/home-dark.png" width="240" alt="Organizer in dark theme" />
  <img src="docs/assets/reminder-light.png" width="240" alt="Reminder with a checklist in light theme" />
</p>

## Requirements

| Tool | Version |
|---|---|
| Node.js | **24 LTS** (SDK 58 requires `^22.13`, `^24.3` or `>=26`) |
| npm | 10+ (bundled with Node) |
| Expo Go | latest version, from Play Store / App Store |

The project includes `.nvmrc`. If you use nvm-windows:

```powershell
nvm use 24.11.1
node -v   # v24.11.1
```

> If `nvm use` fails due to permissions, open the terminal as administrator.

## Install

```powershell
npm ci
npx expo-doctor   # should pass 20/20
```

## Development

```powershell
npm start          # Metro + QR
npm run start:clear # same, clearing the cache
npm run android    # opens on an Android emulator/device (requires adb)
npm run web        # web version (some native features do not apply)
npm run typecheck  # tsc --noEmit
```

With **Expo Go** (recommended path, no Android Studio required):

1. Install Expo Go on your phone.
2. Connect the phone and the PC to the **same Wi-Fi network**.
3. `npm start` and scan the QR (Android: from Expo Go; iOS: with the camera).
4. If it does not connect, allow `node.exe` in Windows Firewall (port 8081).

### Expo Go limitations

- **Local** notifications (alarms) work.
- **Remote push** is not supported on Android since SDK 53 (we do not use it).
- Native builds (EAS or `expo run:android`) require Android Studio + JDK 17/21 and `ANDROID_HOME`.

## Structure

```
index.ts                  registerRootComponent
App.tsx                   providers, splash, fonts, notifications
src/
  components/
    atoms/                IconButton, Checkbox, DialogButton, Glass*
    molecules/            Header, Layout, ItemList, HomeItem, ModalAudio, ModalTitle
    organisms/            HomeScreen, ReminderScreen, CameraScreen, GalleryModal
    templates/            StackNavigator
  config/
    i18n.ts               i18n-js v4 + expo-localization
    translations.ts       en/es strings
    theme.ts              light/dark themes
    types.ts              store models and types
    redux/                actions, reducers, store, typed hooks
  hooks/                  useKeyboardOffset
  providers/              dialogs, overlays, blur and header height
  services/
    notifications.ts      permissions, Android channel, schedule/cancel alarms
  utils/                  dates, files, media migration, reorder, uuid
```

## Upgrade notes (SDK 44 → 58)

- `expo-av` was removed from the SDK → migrated to `expo-audio` (recording and playback).
- `expo-camera` changed to `CameraView` + `useCameraPermissions`.
- `expo-barcode-scanner` was removed → scanning uses `expo-camera`.
- `expo-app-loading` was removed → `expo-splash-screen`.
- `react-native-drax` (unmaintained and without Fabric support) → `react-native-reorderable-list`.
  The "drag to trash" gesture was lost: items are now reordered with a long press and deleted with the trash button.
- `i18n-js` v4 (`I18n` class + `store`) and `expo-localization` (`getLocales()`).
- `redux` 5 / `react-redux` 9: typed selectors and dispatch, no `@ts-ignore`.
- Alarms: stored as real ISO UTC (previously there was a manual time zone adjustment that broke with daylight saving time).
- Persistence: a single key (`persist:root`) with `version: 2` and migration.

## Known pending items

- The date/time picker uses Android's native dialog; on iOS it is shown inline (still needs to be wrapped in a custom modal).
- No automated tests or ESLint yet.

## Release

- When `expo.version` changes in `app.json` and you push to `master`, the workflow creates the `v<version>` tag and publishes the APK on GitHub Releases.
- You can also publish a `v*` tag manually.
- Step-by-step guide: [`docs/releasing.md`](docs/releasing.md).
- Android install: [`docs/install.md`](docs/install.md).
- Privacy: [`PRIVACY.md`](PRIVACY.md).
- Play Store plan (reference): [`docs/playstore-plan.md`](docs/playstore-plan.md).

## License

Code published for portfolio purposes. All rights reserved. If you want to reuse it, open an issue.

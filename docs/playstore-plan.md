# Google Play publishing plan — Organizer

_Last reviewed: November 2, 2026._

> **Status (Nov 2026):** the active distribution channel is **GitHub Releases**. This document remains as a reference for a future store release. See [`install.md`](install.md) and [`releasing.md`](releasing.md).

## 0. Executive summary

The app is technically ready for Android: Expo SDK 58 builds with **target SDK 36 (Android 16)**, the minimum Google Play requires for new apps since 2026-08-31. `npm run typecheck` passes.

What is missing is not app code, but **identity, account, compliance and listing**:

1. Verified Google Play Developer account ($25 one-time).
2. Decide the **final package name** and trade name.
3. Link the project to EAS (`eas init`) and adjust the build config.
4. Public privacy policy.
5. Play listing (copy + 512 icon + feature graphic + screenshots).
6. Forms: Data Safety, content rating, target audience, permissions.
7. AAB build → internal testing → closed testing (12 testers / 14 days if the account is a new personal one) → production.

**Estimated time:** 4–6 weeks if the account is a new personal one (the critical path is the 14 days of closed testing). 1–2 weeks if the account already has production access.

**Cost:** $25 (account) + policy hosting (free with GitHub Pages/Notion) + EAS (the free plan is usually enough; it has queue limits).

---

## 1. Repo assessment

| Item | Status | Action |
|---|---|---|
| Expo SDK 58 / RN 0.88 / React 19 | OK | — |
| target SDK | **36** (`expo-modules-core` default) | Meets the API 36 requirement |
| Typecheck | Passes (`tsc --noEmit`) | — |
| `expo-doctor` | Per README, 20/20 | Re-run before the build |
| EAS project | **Not linked**: missing `extra.eas.projectId` in `app.json` | `eas init` |
| `eas.json` | dev/preview/production profiles | Missing `autoIncrement` and submit config |
| Android package | `com.lore64210.organizer` (lowercase) | Set before the first build |
| Version | `1.1.0`, `versionCode: 1` | With `appVersionSource: remote`, EAS manages the versionCode |
| Declared permissions | INTERNET, VIBRATE, CAMERA, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS, POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED, READ/WRITE_EXTERNAL_STORAGE (≤ API 32) | Justify camera/microphone in the listing and the policy |
| `SYSTEM_ALERT_WINDOW` | Comes from the Expo template, the app does not use it | Block it in release (`blockedPermissions`) |
| `FOREGROUND_SERVICE_MEDIA_PLAYBACK` | Added by `expo-audio` because `enableBackgroundPlayback` defaults to `true` | Set it to `false`; avoids declaring a foreground service on Play |
| Exact alarms | `SCHEDULE_EXACT_ALARM` is **not** declared → under Doze it uses `setAndAllowWhileIdle` (inexact) | Add the permission and request special access |
| Data | All local (AsyncStorage + files), no backend, no analytics | Simple Data Safety: "nothing is collected" |
| Privacy policy | Does not exist | Create and host it |
| Listing / assets | Only app icons; no feature graphic or store screenshots | Create them |
| Tests / ESLint | None | Does not block Play; recommended later |

### Permission reading

- `CAMERA`: photos and QR/barcode scanning (camera screen).
- `RECORD_AUDIO`: audio notes.
- `POST_NOTIFICATIONS`: alarms/reminders (requested at runtime).
- `RECEIVE_BOOT_COMPLETED`: reschedule alarms after a reboot (handled by `expo-notifications`).
- `READ/WRITE_EXTERNAL_STORAGE` with `maxSdkVersion=32`: Android 12 or lower only, for the image picker.
- `READ_MEDIA_IMAGES`/`READ_MEDIA_VIDEO` are **not** declared: good, because `expo-image-picker` uses the Photo Picker on Android 13+. That avoids Play's photo permissions form.

---

## 2. Blocking decisions (make them before touching code)

| Decision | Why it matters | Recommendation |
|---|---|---|
| **Account type**: personal or organization | A new personal account requires 12 testers / 14 days before production. The organization one requires a D-U-N-S number and business verification. | Personal if it is just you; organization if a company will be billing |
| **Package name** | It is permanent: it cannot be changed after the first upload (it would be another app). | `com.lore64210.organizer` in lowercase, or your own domain (`com.yourdomain.organizer`) |
| **Play name** | Maximum 30 characters. "Organizer" is generic and hard to find/register. | A slightly more specific name: "Organizer — Reminders" or your own brand |
| **Contact email** | Shown in the listing and in the privacy policy. | One dedicated to the project |
| **Privacy policy URL** | Required field of the listing. It must be public and stable. | GitHub Pages of the repo (if public), Notion or your own site |
| **iOS too?** | It changes the bundle identifier and adds asset/review work. | Android first; iOS later reusing the same name |
| **Exact alarms** | Without this, a reminder can arrive late under Doze. For a reminders app this is basic quality. | Yes: `SCHEDULE_EXACT_ALARM` + special access request (not `USE_EXACT_ALARM`) |

> **Mind the package:** Play treats it as a unique, permanent identifier. Even though Android accepts uppercase, the convention and several tools expect lowercase. Decide it now.

---

## 3. Phase 0 — Account and verifications (1–3 days, sometimes longer)

- [ ] Create an account at [play.google.com/console](https://play.google.com/console) and pay the **$25** (one-time).
- [ ] Complete **identity verification** (official document; D-U-N-S if it is an organization).
- [ ] Set up **two-step verification** on the Google account.
- [ ] Complete **device verification**: from the Play Console web, the task "Verify that you have access to an Android mobile device". It is done with the **Play Console** app on a non-rooted Android 10+ device. It takes less than a minute.
- [ ] If the account is a **personal one created after 2023-11-13**: assume the **closed testing with 12 opt-in testers for 14 continuous days** requirement, then request production access (review of that request usually takes ≤7 days).
- [ ] Decide the **public contact email** and the developer name shown on Play.

---

## 4. Phase 1 — Prepare the project (repo)

### 4.1 Link EAS

```powershell
npx eas-cli@latest login
npx eas-cli@latest init
```

That adds `extra.eas.projectId` and `owner` to `app.json`. Check that the `slug` (`organizer`) is final.

### 4.2 `app.json`

Proposed changes:

```jsonc
{
  "expo": {
    "name": "Organizer",                 // display name; adjust if the brand changes
    "android": {
      "package": "com.lore64210.organizer", // lowercase, final
      "blockedPermissions": [
        "android.permission.SYSTEM_ALERT_WINDOW"
      ],
      "permissions": [
        "android.permission.SCHEDULE_EXACT_ALARM"
      ]
    },
    "plugins": [
      // ...
      ["expo-audio", {
        "microphonePermission": "Organizer needs the microphone to record audio notes.",
        "recordAudioAndroid": true,
        "enableBackgroundPlayback": false
      }]
    ]
  }
}
```

- `blockedPermissions`: the app does not draw over other apps; removing it reduces review friction.
- `enableBackgroundPlayback: false`: the app plays audio in the foreground only. It avoids `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_MEDIA_PLAYBACK` and the foreground service declaration on Play.
- `SCHEDULE_EXACT_ALARM`: special access permission (the user enables it in Settings). **Do not** use `USE_EXACT_ALARM`, which Play reserves for alarm/clock/calendar apps and reviews separately.

### 4.3 Exact alarm code

`expo-notifications` 58 already exposes the functions:

```ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const ensureExactAlarmPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  const current = await Notifications.getExactAlarmPermissionsAsync();
  if (current.granted) return true;

  // Show your own explanation before opening Settings.
  const requested = await Notifications.requestExactAlarmPermissionsAsync();
  return requested.granted;
};
```

Call it before scheduling (or the first time the app opens), with a dialog explaining: "For the alarm to ring at the exact time, allow 'Alarms and reminders'".

> Note: if the user revokes the permission from Settings, Android restarts the app and the promise may never resolve. Check `getExactAlarmPermissionsAsync()` again on the next launch.

### 4.4 `eas.json`

```jsonc
{
  "cli": {
    "version": ">= 27.0.0",
    "appVersionSource": "remote"
  },
  "build": {
    "development": { "developmentClient": true, "distribution": "internal" },
    "preview": { "distribution": "internal" },
    "production": { "autoIncrement": true }
  },
  "submit": {
    "production": {
      "android": { "track": "internal" }
    }
  }
}
```

`autoIncrement: true` makes EAS bump the `versionCode` automatically on every production build.

### 4.5 Secrets and keystore

- Add to `.gitignore`: `google-service-account*.json`, `*.aab`, `*.apk` (`.jks`/`.p8`/`.key` are already there).
- EAS generates and stores the upload keystore. Back it up with `npx eas-cli credentials` (Android → Keystore).
- When uploading the first AAB, accept **Play App Signing** (Google stores the app signing key; you keep the upload one).

### 4.6 Pre-build verification

```powershell
npx expo-doctor
npm run typecheck
npx eas-cli build -p android --profile preview   # APK to test on a device
```

---

## 5. Phase 2 — QA before the store

- [ ] Clean install on a physical Android device (not Expo Go): the app opens, requests permissions and persists data.
- [ ] Update from the previous version (1.1.0) without losing data.
- [ ] Denied permissions: camera, microphone, photos and notifications. The app must not break.
- [ ] Notification scheduled 5–10 minutes ahead, with the screen locked and battery optimization on: verify it arrives on time with `SCHEDULE_EXACT_ALARM` granted.
- [ ] Device reboot: the pending alarm is still scheduled.
- [ ] Record audio, play it back, attach a photo, scan QR/barcodes, reorder lists, delete items.
- [ ] Light/dark theme, long texts, open keyboard, rotation and small screen sizes.
- [ ] Low storage space and orphan files.
- [ ] Play pre-launch report (runs automatically in internal/closed testing): review crashes, ANRs, accessibility and permission issues.
- [ ] Optional but recommended: crash reporting (Sentry/Crashlytics). If added, **update Data Safety**.

---

## 6. Phase 3 — Listing and forms in Play Console

### 6.1 Create the app

- Name (≤30), default language **Spanish (Latin America or Spain)**, type **App**, free.
- Package name: the same one from `app.json`. It cannot be changed.

### 6.2 Listing assets

| Item | Requirement |
|---|---|
| Icon | 512×512 PNG, 32-bit (export from `assets/icon.png`, which is 1024×1024) |
| Feature graphic | 1024×500 PNG/JPEG, no transparency |
| Phone screenshots | Minimum 2, ideally 4–8; 16:9 or 9:16; between 320 and 3840 px |
| Tablet screenshots | Optional (7" and 10") |
| Video | Optional, YouTube |
| Short description | ≤80 characters |
| Full description | ≤4000 characters |
| Category | Productivity |
| Contact email | Public |
| Privacy policy | Public URL |

### 6.3 Suggested copy

**Short description (es):**

> Recordatorios con listas, fotos, audio y alarmas. Todo offline y privado.

**Full description (es) — draft:**

> Organizer es una app de recordatorios que funciona sin conexión y guarda todo en tu dispositivo.
>
> Creá listas, agregá notas de texto, fotos y notas de audio, y programá alarmas para no olvidarte de nada. También podés escanear códigos QR y de barras para guardar esa información en tus recordatorios.
>
> Características:
> - Listas y recordatorios ilimitados, organizados como vos quieras.
> - Notas de texto, imágenes y audio en cada recordatorio.
> - Alarmas locales con notificaciones.
> - Escaneo de códigos QR y de barras.
> - Tema claro y oscuro.
> - Funciona offline. Tus datos no salen del teléfono.
>
> Permisos: la cámara se usa para sacar fotos y escanear códigos; el micrófono, para grabar notas de audio; las notificaciones, para las alarmas. Podés rechazarlos y usar el resto de la app.
>
> Organizer no recopila datos, no tiene anuncios y no requiere cuenta.

_(Adjust if any feature is not available in the version being published.)_

**English listing (optional):** the app already has `en`/`es` i18n; adding the English listing is recommended so you do not miss installs.

### 6.4 Required forms

- **App access:** "All features are available without signing in" (there is no login).
- **Ads:** No.
- **Content rating (IARC):** questionnaire; no violence, sexual content, drugs, gambling, purchases or user interaction. Expected result: "Everyone" / 3+.
- **Target audience:** 13+ (avoids the Families policy and COPPA). If you choose under 13, there are extra requirements.
- **Data Safety:** "No data is collected or shared". Photos, audio and text are stored **only on the device**; they are not transmitted. Deletion is done by uninstalling the app or clearing its data.
- **Sensitive permissions:** camera and microphone are justified in the description and the policy. There is no `READ_MEDIA_*` form because it is not declared.
- **Foreground service:** by setting `enableBackgroundPlayback` to false, the FGS declaration should not appear. Verify in Play Console after the first AAB.
- **News / government / health / finance:** No.
- **Signing:** Play App Signing.

### 6.5 Privacy policy (skeleton)

Publish it at a stable URL with these sections:

1. Controller and contact (name/email).
2. What data the app stores: lists, notes, photos, audio, alarm dates.
3. Where: only in the device's local storage; there are no servers.
4. Permissions and what they are used for (camera, microphone, photos, notifications).
5. That no data is collected, sold or shared; there is no analytics or advertising.
6. How to delete data: delete items, clear app data or uninstall.
7. Minors: the app is not directed at children under 13.
8. Policy changes and effective date.
9. Contact for questions.

> The policy must be consistent with what the app actually does. If cloud backup, analytics or crash reporting are added later, it must be updated together with Data Safety.

---

## 7. Phase 4 — Build, testing and publishing

```powershell
# 1. Production build (AAB)
npx eas-cli build -p android --profile production

# 2. Upload to internal testing (requires a Google Cloud service account)
npx eas-cli submit -p android --profile production
```

### Service account for `eas submit`

1. Create a project in Google Cloud and enable the **Google Play Android Developer API**.
2. Create a **service account** and download the JSON.
3. In Play Console → Users and permissions, invite the service account email with permission to **release to testing tracks** (and production when applicable).
4. Store the JSON outside the repo and reference it in `eas.json` (`android.serviceAccountKeyPath`) or pass the path when running.

> For the first release you can also upload the AAB by hand from Play Console; it is simpler and does not require a service account yet.

### Track circuit

1. **Internal testing**: up to 100 testers, available within minutes. Ideal for the first smoke test of the real AAB.
2. **Closed testing**: mandatory if the account is a new personal one. 12 opt-in testers, 14 continuous days. Collect feedback and fix issues.
3. **Request production access** from the Dashboard (if applicable). Answer the three form sections and wait for the review.
4. **Production**: staged rollout (10% → 50% → 100%), monitor Android vitals and reviews.

### Post-launch

- Review crashes/ANRs in **Android vitals**.
- Reply to reviews.
- For every update: `autoIncrement` bumps the versionCode; new AAB; same circuit (production no longer requires 12 testers).
- If EAS Update (OTA) is added, configure `expo-updates`, `runtimeVersion` and channels. It is not needed for v1.

---

## 8. Schedule and costs

| Stage | Estimated duration |
|---|---|
| Account + identity/device verification | 1–3 days (sometimes longer) |
| Decisions + repo changes + policy + assets | 2–4 days |
| Build + internal testing + fixes | 3–7 days |
| Closed testing (new personal account) | **14 continuous days** |
| Production access request | ≤7 days |
| First release review | 1–7 days |
| **Total** | **4–6 weeks** (new personal account) / **1–2 weeks** (account with production) |

Costs: **$25** registration; EAS free plan (with limits); privacy policy free on GitHub Pages/Notion; optional custom domain and crash reporting.

---

## 9. Final checklist

**Account**
- [ ] Play Developer account created and paid
- [ ] Identity verified
- [ ] Android device verified
- [ ] 2FA enabled

**Repo**
- [ ] `eas init` and `extra.eas.projectId`
- [ ] Final package name in lowercase
- [ ] `autoIncrement` in production
- [ ] `blockedPermissions` for `SYSTEM_ALERT_WINDOW`
- [ ] `enableBackgroundPlayback: false`
- [ ] `SCHEDULE_EXACT_ALARM` + permission flow
- [ ] `.gitignore` for service account and artifacts
- [ ] `expo-doctor` and `typecheck` OK
- [ ] Keystore backed up

**Product**
- [ ] QA on a physical device
- [ ] Exact alarms tested under Doze
- [ ] Denied permissions tested
- [ ] Pre-launch report reviewed

**Play Console**
- [ ] App created with the correct package
- [ ] ES/EN listing complete
- [ ] 512 icon, feature graphic and screenshots
- [ ] Privacy policy published
- [ ] Data Safety
- [ ] Content rating
- [ ] Target audience
- [ ] Ads / access / other declarations
- [ ] Play App Signing

**Release**
- [ ] Production AAB
- [ ] Internal testing approved
- [ ] Closed testing 12/14 (if applicable)
- [ ] Production access approved
- [ ] Staged rollout

---

## 10. Risks and mitigations

| Risk | Mitigation |
|---|---|
| The package name is wrong forever | Decide it before the first upload; use lowercase and your own domain if possible |
| "Organizer" is generic and may clash with brands | Check the Play search and trademark; consider a more distinctive name |
| Rejection due to exact alarms | Use `SCHEDULE_EXACT_ALARM` (access granted by the user), not `USE_EXACT_ALARM` |
| Rejection due to foreground service | Disable background playback; the app does not need it |
| Inaccurate Data Safety | Declare "nothing is collected" only while everything is local; update it if analytics/cloud are added |
| Cannot find 12 testers | Recruit now (family, friends, colleagues); explain they must stay opt-in for 14 days |
| The first review takes a while | Do not plan a launch for an exact date; use internal testing meanwhile |
| Keystore loss | Back it up via `eas credentials`; Play App Signing allows recovering the upload key |

---

## 11. Next steps

1. Confirm the decisions from section 2 (account type, package, name, email, URL).
2. Apply the `app.json`/`eas.json` changes and the exact alarm flow.
3. Write and publish the privacy policy.
4. Generate the store assets (512 icon, feature graphic, screenshots).
5. Create the app in Play Console and complete the listing.
6. Production build → internal testing.

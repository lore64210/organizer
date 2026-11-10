# Publishing a version (GitHub Releases)

The release is built with **EAS Build**. There are two paths:

- **Automatic (recommended):** when `expo.version` changes in `app.json` and you push to `master`, the workflow creates the `v<version>` tag and publishes the release.
- **Manual:** pushing a `v*` tag publishes that tag.

The workflow lives in [`.github/workflows/release-apk.yml`](../.github/workflows/release-apk.yml). Nothing is published if the version did not change, so you can push code and docs without generating extra releases.

## Initial setup (once)

1. Create a free account at <https://expo.dev/signup>.
2. Sign in and link the project:

   ```powershell
   npx eas-cli@latest login
   npx eas-cli@latest init
   ```

   `eas init` adds `extra.eas.projectId` and `owner` to `app.json`. Without that, the workflow fails. Commit and push that change before the first release.

3. Create an **access token** at <https://expo.dev/settings/access-tokens>.
4. In GitHub: **Settings → Secrets and variables → Actions → New repository secret**, name `EXPO_TOKEN`, value the token.
5. Check that the `release-apk` profile exists in `eas.json` (already configured).
6. **Generate the keystore once.** EAS asks for it on the first build:

   ```powershell
   npx eas-cli build -p android --profile release-apk
   ```

   Accept generating a new keystore. That build runs in the cloud (no Android Studio needed) and uses one of the 15 free builds. After that, the workflow can build without prompts.

## Publish automatically (recommended)

1. Update `expo.version` in `app.json` (for example `1.1.0` → `1.2.0`). Optionally, update `version` in `package.json` too so they match. EAS handles the Android `versionCode` (`autoIncrement: true` + `appVersionSource: remote`).
2. Commit and push to `master`:

   ```powershell
   git add app.json package.json
   git commit -m "Bump version to 1.2.0"
   git push origin master
   ```

3. The **Detect version change** workflow compares `app.json` against the previous commit of the push:
   - If the version changed and the `v1.2.0` tag does not exist, it builds the APK and creates the release.
   - If the version did not change, it finishes without publishing anything.
   - If the tag already exists, it does not overwrite it.
4. Follow it in **Actions → Release APK**.
5. When it finishes, the APK is available at:

   - Release page: `https://github.com/lore64210/organizer/releases/latest`
   - Direct download: `https://github.com/lore64210/organizer/releases/latest/download/organizer.apk`
   - Checksum: `SHA256SUMS.txt` attached to the release.

You do not need to create the tag by hand: the workflow creates it pointing to the commit you pushed.

Every release includes a **QR** in its notes pointing to `releases/latest/download/organizer.apk`. It is useful to open the release on your computer and scan it with your phone to download the APK without going through a cable or a chat app.

### How the change is detected

- It reads `expo.version` from `app.json` (that is the source of truth).
- It compares it with the version of the `before` commit of the `push` event, so it works even if you push several commits together.
- If there is no previous commit (first push or new branch), it publishes.
- If the `v<version>` tag already exists, it does not publish again. To redo it, bump the version or delete the tag/release manually.

### Publishing a manual tag

It still works if you want to publish a specific tag without touching the version:

```powershell
git tag v1.2.0
git push origin v1.2.0
```

If the tag already existed and you want to redo it:

```powershell
git tag -d v1.2.0
git push origin :refs/tags/v1.2.0
```

## Manual publishing (if the workflow fails)

```powershell
npx eas-cli build -p android --profile release-apk
```

Download the APK from the link EAS prints and create the release:

```powershell
Get-FileHash .\organizer.apk -Algorithm SHA256 | Format-List
gh release create v1.2.0 .\organizer.apk `
  --title "Organizer 1.2.0" `
  --notes "Changes in this version..."
```

## Keystore and updates

- EAS generates and stores the signing keystore the first time. **Do not change EAS accounts or regenerate the keystore**: if the signature changes, users have to uninstall and lose their data.
- Back it up with:

  ```powershell
  npx eas-cli credentials
  ```

  Choose Android → Keystore → download.
- The package (`com.lore64210.organizer`) and the signature must stay the same across all versions.

## APK size

The `v1.1.0` APK weighed **113.6 MB** because it was universal and included four architectures:

| ABI | Libs size |
|---|---|
| `x86` | 28.3 MB |
| `x86_64` | 27.7 MB |
| `arm64-v8a` | 26.3 MB |
| `armeabi-v7a` | 18.0 MB |

`x86` and `x86_64` are only useful for emulators; real phones are ARM. On top of that, the native libraries were shipped uncompressed.

The current `expo-build-properties` configuration (in `app.json`) makes the `release-apk` profile:

- build only `arm64-v8a` and `armeabi-v7a`;
- compress the native libs inside the APK (`useLegacyPackaging`);
- apply R8 and resource shrinking (`enableMinifyInReleaseBuilds` + `enableShrinkResourcesInReleaseBuilds`).

The next build should land well below 114 MB (estimated **30–45 MB**). Confirm the size in the release and test the APK on a device before sharing it. If R8 breaks something, remove `enableMinifyInReleaseBuilds`/`enableShrinkResourcesInReleaseBuilds` and rebuild.

If you ever need an emulator APK, add `x86_64` to `buildArchs` in a separate build profile. The code scanner (ML Kit) adds ~5 MB per ABI; removing that feature would shrink the APK a bit more.

## Limits and costs

- **GitHub Releases**: free, no bandwidth limit; up to 1,000 files per release and 2 GiB per file.
- **GitHub Actions**: free on public repos.
- **EAS Build Free**: 15 Android builds per month, low-priority queue and a 45-minute timeout. If the quota runs out, you have to wait until next month or move to a paid plan (Android medium: USD 1 per build).
- Since it only builds when the version changes, regular pushes do not consume builds. A version bump consumes one.
- The APK is universal (all ABIs), so it is heavier than an AAB. That is normal.

## Common issues

| Error | Cause / fix |
|---|---|
| `EAS project not configured` | Missing `eas init` or `extra.eas.projectId` in `app.json` |
| `Invalid EXPO_TOKEN` | The secret does not exist, expired or lacks access to the project |
| `Build limit exceeded` | The 15 free builds for the month ran out |
| `App not installed` when updating | The signature or package changed; uninstall first (data is lost) |
| The APK does not show up in the release | Check the "Build APK" step in Actions; the EAS JSON had no `artifacts.buildUrl` |

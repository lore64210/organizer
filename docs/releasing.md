# Publicar una versión (GitHub Releases)

El release se arma con **EAS Build** y se publica solo cuando pusheás un tag `v*`. El workflow está en [`.github/workflows/release-apk.yml`](../.github/workflows/release-apk.yml).

## Configuración inicial (una sola vez)

1. Crear una cuenta gratis en <https://expo.dev/signup>.
2. Iniciar sesión y vincular el proyecto:

   ```powershell
   npx eas-cli@latest login
   npx eas-cli@latest init
   ```

   `eas init` agrega `extra.eas.projectId` y `owner` en `app.json`. Sin eso, el workflow falla. Commiteá y pusheá ese cambio antes de crear el primer tag.

3. Crear un **access token** en <https://expo.dev/settings/access-tokens>.
4. En GitHub: **Settings → Secrets and variables → Actions → New repository secret**, nombre `EXPO_TOKEN`, valor el token.
5. Verificar que el perfil `release-apk` exista en `eas.json` (ya está configurado).
6. **Generar el keystore una vez.** EAS lo pide en la primera compilación:

   ```powershell
   npx eas-cli build -p android --profile release-apk
   ```

   Aceptá generar un keystore nuevo. Esa compilación corre en la nube (no hace falta Android Studio) y consume uno de los 15 builds gratuitos. Después, el workflow puede compilar sin preguntas.

## Publicar

1. Actualizá la versión visible en `app.json` y `package.json` (por ejemplo `1.1.0` → `1.2.0`). El `versionCode` de Android lo maneja EAS solo (`autoIncrement: true` + `appVersionSource: remote`).
2. Commiteá y pusheá los cambios.
3. Creá y pusheá el tag:

   ```powershell
   git tag v1.2.0
   git push origin v1.2.0
   ```

4. El workflow compila el APK y crea el release. Seguilo en **Actions → Release APK**.
5. Cuando termina, el APK queda en:

   - Página del release: `https://github.com/lore64210/reminder/releases/latest`
   - Descarga directa: `https://github.com/lore64210/reminder/releases/latest/download/organizer.apk`
   - Checksum: `SHA256SUMS.txt` adjunto al release.

> Si el tag ya existía y querés rehacerlo:
>
> ```powershell
> git tag -d v1.2.0
> git push origin :refs/tags/v1.2.0
> ```

## Publicación manual (si el workflow falla)

```powershell
npx eas-cli build -p android --profile release-apk
```

Descargá el APK desde el link que imprime EAS y creá el release:

```powershell
Get-FileHash .\organizer.apk -Algorithm SHA256 | Format-List
gh release create v1.2.0 .\organizer.apk `
  --title "Organizer 1.2.0" `
  --notes "Cambios de la versión..."
```

## Keystore y actualizaciones

- EAS genera y guarda el keystore de firma la primera vez. **No cambies de cuenta EAS ni regeneres el keystore**: si cambia la firma, los usuarios tienen que desinstalar y pierden los datos.
- Hacé backup con:

  ```powershell
  npx eas-cli credentials
  ```

  Elegí Android → Keystore → descargar.
- El package (`com.lore64210.organizer`) y la firma deben mantenerse iguales en todas las versiones.

## Límites y costos

- **GitHub Releases**: gratis, sin límite de bandwidth; hasta 1.000 archivos por release y 2 GiB por archivo.
- **GitHub Actions**: gratis en repos públicos.
- **EAS Build Free**: 15 builds Android por mes, cola de baja prioridad y timeout de 45 minutos. Si se agota la cuota, hay que esperar al mes siguiente o pasar a un plan pago (Android medium: USD 1 por build).
- El APK es universal (todas las ABIs), así que pesa más que un AAB. Es normal.

## Problemas comunes

| Error | Causa / solución |
|---|---|
| `EAS project not configured` | Falta `eas init` o `extra.eas.projectId` en `app.json` |
| `Invalid EXPO_TOKEN` | El secreto no existe, está vencido o no tiene acceso al proyecto |
| `Build limit exceeded` | Se agotaron los 15 builds gratuitos del mes |
| `App not installed` al actualizar | Cambió la firma o el package; desinstalar antes (se pierden datos) |
| El APK no aparece en el release | Revisar el paso “Build APK” en Actions; el JSON de EAS no tenía `artifacts.buildUrl` |

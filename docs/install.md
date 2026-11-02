# Instalar Organizer en Android

Organizer se distribuye como **APK firmado** desde GitHub Releases. No está en Google Play, así que Android va a pedirte que permitas la instalación desde el navegador o el gestor de archivos.

## Requisitos

- Android **7.0 (API 24) o superior**.
- Espacio libre para la app y tus fotos/audios.
- No hace falta root ni una cuenta.

## Descargar

- Última versión: <https://github.com/lore64210/reminder/releases/latest>
- Descarga directa del APK: <https://github.com/lore64210/reminder/releases/latest/download/organizer.apk>
- Portfolio y demo: <https://lore64210.github.io/reminder/>

<p align="center">
  <img src="assets/qr.png" width="220" alt="Código QR para descargar el APK" />
</p>

Cada release incluye un archivo `SHA256SUMS.txt` para verificar la descarga.

## Instalar

1. Abrí el link desde el **teléfono** (no desde la computadora).
2. Descargá el APK.
3. Si Android lo pide, permití **“Instalar apps desconocidas”** para el navegador o el gestor de archivos que estés usando.
4. Abrí el archivo descargado y tocá **Instalar**.
5. Si Play Protect muestra una advertencia, elegí **“Instalar de todos modos”**. Es normal en apps fuera de Play.

## Actualizar

- Descargá el APK nuevo y instalalo **encima** de la versión anterior.
- Mientras se mantenga el mismo package (`com.lore64210.organizer`) y la misma firma, Android conserva tus datos.
- Si Android dice **“App no instalada”**, probablemente sea un conflicto de firma: desinstalá la versión vieja (perdés los datos locales) e instalá la nueva.

La app **no se actualiza sola**: hay que volver a descargar el APK cuando salga una versión nueva.

## Verificar el APK (opcional)

En Windows:

```powershell
Get-FileHash .\organizer.apk -Algorithm SHA256
```

Compará el resultado con el contenido de `SHA256SUMS.txt` del release.

## Permisos

| Permiso | Para qué |
|---|---|
| Cámara | Sacar fotos y escanear códigos QR/barras |
| Micrófono | Grabar notas de audio |
| Notificaciones | Alarmas y recordatorios |
| Fotos / almacenamiento | Elegir imágenes (solo en Android 12 o menor) |

Podés rechazar cualquiera y usar el resto de la app, salvo la función que depende de ese permiso.

## Privacidad

Organizer funciona **offline**. Las listas, notas, fotos y audios se guardan únicamente en el almacenamiento de tu dispositivo. No hay servidores, cuentas, analytics ni publicidad. Ver [`PRIVACY.md`](../PRIVACY.md).

## Problemas comunes

- **“Por seguridad, tu teléfono no puede instalar apps desconocidas”**: habilitá el permiso para la app desde la que abrís el APK (Ajustes → Apps → Acceso especial → Instalar apps desconocidas).
- **Play Protect bloquea la instalación**: tocá “Más detalles” → “Instalar de todos modos”. Si no aparece, desactivá temporalmente “Analizar apps” en Play Store.
- **El APK no descarga**: probá desde el navegador del teléfono, no desde un visor interno de Instagram/LinkedIn.
- **La app se cierra al abrir**: verificá que el Android sea 7.0+ y que hayas instalado el APK completo (no un archivo parcial).

## Código

El código fuente está en <https://github.com/lore64210/reminder>. Es un proyecto de portfolio; todos los derechos reservados.

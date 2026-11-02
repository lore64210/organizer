# Plan de publicación en Google Play — Organizer

_Última revisión: 2 de noviembre de 2026._

> **Estado (nov 2026):** la distribución activa es **GitHub Releases**. Este documento queda como referencia para una futura publicación en tiendas. Ver [`install.md`](install.md) y [`releasing.md`](releasing.md).

## 0. Resumen ejecutivo

La app está técnicamente lista para Android: Expo SDK 58 compila con **target SDK 36 (Android 16)**, que es el mínimo que Google Play exige para apps nuevas desde el 31/08/2026. `npm run typecheck` pasa.

Lo que falta no es código de la app, sino **identidad, cuenta, cumplimiento y ficha**:

1. Cuenta de Google Play Developer verificada ($25 única vez).
2. Definir **package name definitivo** y nombre comercial.
3. Vincular el proyecto a EAS (`eas init`) y ajustar la config de build.
4. Política de privacidad pública.
5. Ficha de Play (textos + icono 512 + feature graphic + capturas).
6. Formularios: Data Safety, clasificación de contenido, público objetivo, permisos.
7. Build AAB → internal testing → closed testing (12 testers / 14 días si la cuenta es personal nueva) → producción.

**Tiempo estimado:** 4–6 semanas si la cuenta es personal nueva (el camino crítico son los 14 días de closed testing). 1–2 semanas si la cuenta ya tiene acceso a producción.

**Costo:** $25 (cuenta) + hosting de la política (gratis con GitHub Pages/Notion) + EAS (el plan gratuito suele alcanzar; tiene límites de cola).

---

## 1. Diagnóstico del repo

| Punto | Estado | Acción |
|---|---|---|
| Expo SDK 58 / RN 0.88 / React 19 | OK | — |
| target SDK | **36** (`expo-modules-core` default) | Cumple el requisito de API 36 |
| Typecheck | Pasa (`tsc --noEmit`) | — |
| `expo-doctor` | Según README, 20/20 | Re-ejecutar antes del build |
| Proyecto EAS | **No vinculado**: falta `extra.eas.projectId` en `app.json` | `eas init` |
| `eas.json` | Perfiles dev/preview/production | Falta `autoIncrement` y config de submit |
| Package Android | `com.lore64210.organizer` (minúsculas) | Definido antes del primer build |
| Versión | `1.1.0`, `versionCode: 1` | Con `appVersionSource: remote`, EAS maneja el versionCode |
| Permisos declarados | INTERNET, VIBRATE, CAMERA, RECORD_AUDIO, MODIFY_AUDIO_SETTINGS, POST_NOTIFICATIONS, RECEIVE_BOOT_COMPLETED, READ/WRITE_EXTERNAL_STORAGE (≤ API 32) | Justificar cámara/micrófono en la ficha y la política |
| `SYSTEM_ALERT_WINDOW` | Viene de la plantilla de Expo, la app no lo usa | Bloquearlo en release (`blockedPermissions`) |
| `FOREGROUND_SERVICE_MEDIA_PLAYBACK` | Lo agrega `expo-audio` porque `enableBackgroundPlayback` es `true` por defecto | Ponerlo en `false`; evita declarar foreground service en Play |
| Alarmas exactas | **No** se declara `SCHEDULE_EXACT_ALARM` → en Doze se usa `setAndAllowWhileIdle` (inexacta) | Agregar permiso y pedir acceso especial |
| Datos | Todo local (AsyncStorage + archivos), sin backend, sin analytics | Data Safety simple: “no se recopila nada” |
| Política de privacidad | No existe | Crear y hostear |
| Ficha / assets | Solo iconos de la app; no hay feature graphic ni capturas de tienda | Crear |
| Tests / ESLint | No hay | No bloquea Play; recomendable a futuro |

### Lectura de permisos

- `CAMERA`: fotos y escaneo de códigos QR/barras (pantalla de cámara).
- `RECORD_AUDIO`: notas de audio.
- `POST_NOTIFICATIONS`: alarmas/recordatorios (se pide en runtime).
- `RECEIVE_BOOT_COMPLETED`: reprogramar alarmas tras reiniciar (lo maneja `expo-notifications`).
- `READ/WRITE_EXTERNAL_STORAGE` con `maxSdkVersion=32`: solo Android 12 o menor, por el picker de imágenes.
- **No** se declara `READ_MEDIA_IMAGES`/`READ_MEDIA_VIDEO`: bien, porque `expo-image-picker` usa el Photo Picker en Android 13+. Eso evita el formulario de permisos de fotos de Play.

---

## 2. Decisiones bloqueantes (definir antes de tocar código)

| Decisión | Por qué importa | Recomendación |
|---|---|---|
| **Tipo de cuenta**: personal u organización | La cuenta personal nueva exige 12 testers / 14 días antes de producción. La de organización exige D-U-N-S y verificación comercial. | Personal si sos vos solo; organización si va a facturar una empresa |
| **Package name** | Es permanente: no se puede cambiar después del primer upload (sería otra app). | `com.lore64210.organizer` en minúsculas, o un dominio propio (`com.tudominio.organizer`) |
| **Nombre en Play** | Máximo 30 caracteres. “Organizer” es genérico y difícil de encontrar/marcar. | Un nombre algo más específico: “Organizer — Recordatorios” o una marca propia |
| **Email de contacto** | Se muestra en la ficha y en la política de privacidad. | Uno dedicado al proyecto |
| **URL de política de privacidad** | Campo obligatorio de la ficha. Tiene que ser pública y estable. | GitHub Pages del repo (si es público), Notion o sitio propio |
| **¿También iOS?** | Cambia el bundle identifier y suma trabajo de assets/revisión. | Android primero; iOS después reutilizando el mismo nombre |
| **Alarmas exactas** | Sin esto, un recordatorio puede llegar tarde en Doze. Para una app de recordatorios es calidad básica. | Sí: `SCHEDULE_EXACT_ALARM` + pedido de acceso especial (no `USE_EXACT_ALARM`) |

> **Ojo con el package:** Play lo trata como identificador único y permanente. Aunque Android acepta mayúsculas, la convención y varias herramientas esperan minúsculas. Definilo ahora.

---

## 3. Fase 0 — Cuenta y verificaciones (1–3 días, a veces más)

- [ ] Crear cuenta en [play.google.com/console](https://play.google.com/console) y pagar los **$25** (pago único).
- [ ] Completar **verificación de identidad** (documento oficial; si es organización, D-U-N-S).
- [ ] Configurar **verificación en dos pasos** en la cuenta de Google.
- [ ] Completar **verificación de dispositivo**: desde la Play Console web, tarea “Verify that you have access to an Android mobile device”. Se hace con la app **Play Console** en un Android 10+ no rooteado. Tarda menos de un minuto.
- [ ] Si la cuenta es **personal creada después del 13/11/2023**: asumir el requisito de **closed testing con 12 testers opt-in durante 14 días continuos** y luego solicitar acceso a producción (la revisión de esa solicitud suele tardar ≤7 días).
- [ ] Definir el **email de contacto público** y el nombre de desarrollador que se verá en Play.

---

## 4. Fase 1 — Preparar el proyecto (repo)

### 4.1 Vincular EAS

```powershell
npx eas-cli@latest login
npx eas-cli@latest init
```

Eso agrega `extra.eas.projectId` y `owner` en `app.json`. Verificá que el `slug` (`organizer`) sea el definitivo.

### 4.2 `app.json`

Cambios propuestos:

```jsonc
{
  "expo": {
    "name": "Organizer",                 // nombre visible; ajustar si cambia la marca
    "android": {
      "package": "com.lore64210.organizer", // minúsculas, definitivo
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
        "microphonePermission": "Organizer necesita el micrófono para grabar notas de audio.",
        "recordAudioAndroid": true,
        "enableBackgroundPlayback": false
      }]
    ]
  }
}
```

- `blockedPermissions`: la app no dibuja sobre otras apps; sacarlo reduce fricción en la revisión.
- `enableBackgroundPlayback: false`: la app reproduce audio solo en primer plano. Evita `FOREGROUND_SERVICE` + `FOREGROUND_SERVICE_MEDIA_PLAYBACK` y la declaración de foreground service en Play.
- `SCHEDULE_EXACT_ALARM`: permiso de acceso especial (el usuario lo habilita en Ajustes). **No** usar `USE_EXACT_ALARM`, que Play reserva para apps de alarma/reloj/calendario y tiene revisión aparte.

### 4.3 Código de alarmas exactas

`expo-notifications` 58 ya expone las funciones:

```ts
import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

export const ensureExactAlarmPermission = async (): Promise<boolean> => {
  if (Platform.OS !== 'android') return true;

  const current = await Notifications.getExactAlarmPermissionsAsync();
  if (current.granted) return true;

  // Muestra una explicación propia antes de abrir Ajustes.
  const requested = await Notifications.requestExactAlarmPermissionsAsync();
  return requested.granted;
};
```

Llamarlo antes de agendar (o al abrir la app por primera vez), con un diálogo que explique: “Para que la alarma suene a la hora exacta, permití ‘Alarmas y recordatorios’”.

> Nota: si el usuario revoca el permiso desde Ajustes, Android reinicia la app y la promesa puede no resolverse. Volvé a consultar `getExactAlarmPermissionsAsync()` en el próximo arranque.

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

`autoIncrement: true` hace que EAS suba el `versionCode` solo en cada build de producción.

### 4.5 Secretos y keystore

- Agregar a `.gitignore`: `google-service-account*.json`, `*.aab`, `*.apk` (los `.jks`/`.p8`/`.key` ya están).
- EAS genera y guarda el keystore de upload. Hacé backup con `npx eas-cli credentials` (Android → Keystore).
- Al subir el primer AAB, aceptá **Play App Signing** (Google guarda la clave de firma de la app; vos conservás la de upload).

### 4.6 Verificación previa al build

```powershell
npx expo-doctor
npm run typecheck
npx eas-cli build -p android --profile preview   # APK para probar en dispositivo
```

---

## 5. Fase 2 — QA antes de la tienda

- [ ] Instalación limpia en un Android físico (no Expo Go): la app abre, pide permisos y persiste datos.
- [ ] Actualización desde la versión anterior (1.1.0) sin perder datos.
- [ ] Permisos denegados: cámara, micrófono, fotos y notificaciones. La app no debe romperse.
- [ ] Notificación programada a 5–10 minutos, con pantalla bloqueada y batería en optimización: verificar que llegue a tiempo con `SCHEDULE_EXACT_ALARM` concedido.
- [ ] Reinicio del dispositivo: la alarma pendiente sigue programada.
- [ ] Grabar audio, reproducirlo, adjuntar foto, escanear QR/barras, reordenar listas, borrar ítems.
- [ ] Tema claro/oscuro, textos largos, teclado abierto, rotación y tamaños de pantalla chicos.
- [ ] Espacio de almacenamiento bajo y archivos huérfanos.
- [ ] Pre-launch report de Play (corre automático en internal/closed testing): revisar crashes, ANR, accesibilidad y problemas de permisos.
- [ ] Opcional pero recomendado: crash reporting (Sentry/Crashlytics). Si se agrega, **actualizar Data Safety**.

---

## 6. Fase 3 — Ficha y formularios en Play Console

### 6.1 Crear la app

- Nombre (≤30), idioma predeterminado **español (Latinoamérica o España)**, tipo **App**, gratis.
- Package name: el mismo de `app.json`. No se puede cambiar.

### 6.2 Assets de la ficha

| Elemento | Requisito |
|---|---|
| Icono | PNG 512×512, 32 bits (exportar desde `assets/icon.png`, que es 1024×1024) |
| Feature graphic | PNG/JPEG 1024×500, sin transparencia |
| Capturas de teléfono | Mínimo 2, ideal 4–8; 16:9 o 9:16; entre 320 y 3840 px |
| Capturas de tablet | Opcionales (7" y 10") |
| Video | Opcional, YouTube |
| Descripción corta | ≤80 caracteres |
| Descripción completa | ≤4000 caracteres |
| Categoría | Productividad |
| Email de contacto | Público |
| Política de privacidad | URL pública |

### 6.3 Textos sugeridos

**Descripción corta (es):**

> Recordatorios con listas, fotos, audio y alarmas. Todo offline y privado.

**Descripción completa (es) — borrador:**

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

_(Ajustar si alguna función no está disponible en la versión que se publica.)_

**English listing (opcional):** la app ya tiene i18n `en`/`es`; conviene agregar la ficha en inglés para no perder instalaciones.

### 6.4 Formularios obligatorios

- **Acceso a la app:** “Todas las funciones están disponibles sin iniciar sesión” (no hay login).
- **Anuncios:** No.
- **Clasificación de contenido (IARC):** cuestionario; sin violencia, contenido sexual, drogas, juegos de azar, compras ni interacción entre usuarios. Resultado esperado: “Para todos” / 3+.
- **Público objetivo:** 13+ (evita el régimen de Familias y COPPA). Si se elige menor de 13, hay requisitos extra.
- **Data Safety:** “No se recopilan ni comparten datos”. Fotos, audio y texto se guardan **solo en el dispositivo**; no se transmiten. La eliminación se hace desinstalando o borrando datos de la app.
- **Permisos sensibles:** cámara y micrófono se justifican en la descripción y la política. No hay formulario de `READ_MEDIA_*` porque no se declara.
- **Foreground service:** al desactivar `enableBackgroundPlayback`, no debería aparecer la declaración de FGS. Verificar en Play Console tras el primer AAB.
- **Noticias / gobierno / salud / finanzas:** No.
- **Firma:** Play App Signing.

### 6.5 Política de privacidad (esqueleto)

Publicar en una URL estable con estas secciones:

1. Responsable y contacto (nombre/email).
2. Qué datos guarda la app: listas, notas, fotos, audios, fechas de alarma.
3. Dónde: únicamente en el almacenamiento local del dispositivo; no hay servidores.
4. Permisos y para qué se usan (cámara, micrófono, fotos, notificaciones).
5. Que no se recopilan, venden ni comparten datos; no hay analytics ni publicidad.
6. Cómo eliminar los datos: borrar ítems, borrar datos de la app o desinstalar.
7. Menores: la app no está dirigida a menores de 13.
8. Cambios de la política y fecha de vigencia.
9. Contacto para consultas.

> La política tiene que ser coherente con lo que realmente hace la app. Si más adelante se agrega backup en la nube, analytics o crash reporting, hay que actualizarla junto con Data Safety.

---

## 7. Fase 4 — Build, testing y publicación

```powershell
# 1. Build de producción (AAB)
npx eas-cli build -p android --profile production

# 2. Subir a internal testing (requiere service account de Google Cloud)
npx eas-cli submit -p android --profile production
```

### Service account para `eas submit`

1. Crear un proyecto en Google Cloud y habilitar **Google Play Android Developer API**.
2. Crear una **service account** y descargar el JSON.
3. En Play Console → Usuarios y permisos, invitar el email de la service account con permiso para **release a testing tracks** (y producción cuando corresponda).
4. Guardar el JSON fuera del repo y referenciarlo en `eas.json` (`android.serviceAccountKeyPath`) o pasar la ruta al ejecutar.

> Para el primer release también se puede subir el AAB a mano desde Play Console; es más simple y no requiere service account todavía.

### Circuito de tracks

1. **Internal testing**: hasta 100 testers, disponible en minutos. Ideal para el primer smoke test del AAB real.
2. **Closed testing**: obligatorio si la cuenta es personal nueva. 12 testers opt-in, 14 días continuos. Recolectar feedback y corregir.
3. **Solicitar acceso a producción** desde el Dashboard (si aplica). Responder las tres secciones del formulario y esperar la revisión.
4. **Producción**: rollout escalonado (10% → 50% → 100%), monitorear Android vitals y reviews.

### Post-lanzamiento

- Revisar crashes/ANR en **Android vitals**.
- Responder reviews.
- Para cada update: `autoIncrement` sube el versionCode; nuevo AAB; mismo circuito (producción ya no requiere 12 testers).
- Si se agrega EAS Update (OTA), configurar `expo-updates`, `runtimeVersion` y canales. No es necesario para el v1.

---

## 8. Cronograma y costos

| Etapa | Duración estimada |
|---|---|
| Cuenta + verificación de identidad/dispositivo | 1–3 días (a veces más) |
| Decisiones + cambios de repo + política + assets | 2–4 días |
| Build + internal testing + correcciones | 3–7 días |
| Closed testing (cuenta personal nueva) | **14 días continuos** |
| Solicitud de acceso a producción | ≤7 días |
| Revisión del primer release | 1–7 días |
| **Total** | **4–6 semanas** (personal nueva) / **1–2 semanas** (cuenta con producción) |

Costos: **$25** de registro; EAS plan gratuito (con límites); política de privacidad gratis en GitHub Pages/Notion; opcional dominio propio y crash reporting.

---

## 9. Checklist final

**Cuenta**
- [ ] Cuenta Play Developer creada y paga
- [ ] Identidad verificada
- [ ] Dispositivo Android verificado
- [ ] 2FA activo

**Repo**
- [ ] `eas init` y `extra.eas.projectId`
- [ ] Package definitivo en minúsculas
- [ ] `autoIncrement` en producción
- [ ] `blockedPermissions` para `SYSTEM_ALERT_WINDOW`
- [ ] `enableBackgroundPlayback: false`
- [ ] `SCHEDULE_EXACT_ALARM` + flujo de permiso
- [ ] `.gitignore` para service account y artefactos
- [ ] `expo-doctor` y `typecheck` OK
- [ ] Keystore respaldado

**Producto**
- [ ] QA en dispositivo físico
- [ ] Alarmas exactas probadas en Doze
- [ ] Permisos denegados probados
- [ ] Pre-launch report revisado

**Play Console**
- [ ] App creada con package correcto
- [ ] Ficha es/en completa
- [ ] Icono 512, feature graphic y capturas
- [ ] Política de privacidad publicada
- [ ] Data Safety
- [ ] Clasificación de contenido
- [ ] Público objetivo
- [ ] Anuncios / acceso / demás declaraciones
- [ ] Play App Signing

**Release**
- [ ] AAB de producción
- [ ] Internal testing aprobado
- [ ] Closed testing 12/14 (si aplica)
- [ ] Acceso a producción aprobado
- [ ] Rollout escalonado

---

## 10. Riesgos y mitigaciones

| Riesgo | Mitigación |
|---|---|
| El package name queda mal para siempre | Definirlo antes del primer upload; usar minúsculas y un dominio propio si es posible |
| “Organizer” es genérico y puede chocar con marcas | Verificar búsqueda en Play y marca; considerar un nombre más distintivo |
| Rechazo por alarmas exactas | Usar `SCHEDULE_EXACT_ALARM` (acceso otorgado por el usuario), no `USE_EXACT_ALARM` |
| Rechazo por foreground service | Desactivar background playback; la app no lo necesita |
| Data Safety inexacto | Declarar “no se recopila” solo mientras todo sea local; actualizar si se agrega analytics/nube |
| 12 testers no se consiguen | Reclutar desde ahora (familia, amigos, colegas); explicar que deben quedar opt-in 14 días |
| Primer review tarda | No planificar el lanzamiento para una fecha exacta; usar internal testing mientras tanto |
| Pérdida del keystore | Backup vía `eas credentials`; Play App Signing permite recuperar la clave de upload |

---

## 11. Próximos pasos

1. Confirmar las decisiones de la sección 2 (tipo de cuenta, package, nombre, email, URL).
2. Aplicar los cambios de `app.json`/`eas.json` y el flujo de alarmas exactas.
3. Redactar y publicar la política de privacidad.
4. Generar los assets de tienda (icono 512, feature graphic, capturas).
5. Crear la app en Play Console y completar la ficha.
6. Build de producción → internal testing.

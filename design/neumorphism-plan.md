# Neumorfismo híbrido · Plan de implementación

Documento de referencia para la actualización visual de **Organizer**.
La maqueta aprobable está en `design/neumorphism-preview.html`.

## Estado

- [x] Fase 1 · Tokens (`theme.ts`, `types.ts`) y helpers (`src/utils/neumorphic.ts`)
- [x] Fase 2 · Chrome: `IconButton`, `AnimatedIconButton`, `Checkbox`, `DialogButton`, modales
- [x] Fase 3 · Filas: `SwipeToDelete`, `HomeItem`, `ItemList`
- [x] `expo-blur` instalado
- [x] Fase 5a · `DialogProvider` como overlay en la misma ventana + blur real (iOS/Android 12+)
- [x] Fase 5b · Menú de acciones y chrome de cámara con vidrio
- [x] Fase 5c · `ModalTitle` / `ModalAudio` movidos a un portal glass en la raíz
- [x] Fase 5d · Galería de imágenes en el portal, con `GlassBackdrop` y visor negro
- [x] Transición de tema por crossfade nativo (mismo comportamiento en web y mobile)
- [ ] Fase 4 · Ajuste fino en dispositivo (Android viejo, contraste, animación de tema)

---

## 1. Decisión de diseño

Neumorfismo **híbrido**, no total:

| Zona | Tratamiento |
| --- | --- |
| FAB y menú de acciones | Elevado (`raised`) + estado inset al presionar |
| Header (tema, galería, badge) | Elevado suave |
| Modales y diálogos | Tarjeta elevada sobre backdrop oscuro |
| Checkbox | Sin marcar: elevado · Marcado: inset + ámbar |
| Reproductor de audio | Botón elevado + pista hundida |
| Filas de lista | Elevación mínima (sombra 4 px), inset al presionar |
| Pantalla de cámara | Sin cambios (fondo negro, el visor manda) |
| Galería | Thumbnails con relieve mínimo; visor sin cambios |

**Regla:** la sombra comunica profundidad; el color de acento comunica acción.

---

## 2. Tokens

Implementar en `src/config/theme.ts` y `src/config/types.ts`.

### Oscuro

| Token | Valor | Uso |
| --- | --- | --- |
| `surfaceColor` | `#071F35` | Fondo y superficie (unificados) |
| `shadowLight` | `#103A57` | Sombra clara (arriba-izquierda) |
| `shadowDark` | `#02101D` | Sombra oscura (abajo-derecha) |
| `textColor` | `#E9EEF4` | Texto principal (contraste ~14:1) |
| `accentColor` | `#ECB365` | Iconos activos, títulos, foco |
| `mutedColor` | `#8EA5BA` | Metadatos |
| `insetColor` | `#041624` | Superficies hundidas |
| `deleteButtonColor` | `#B3363C` | Acción destructiva |

### Claro

| Token | Valor | Uso |
| --- | --- | --- |
| `surfaceColor` | `#E6EBF1` | Fondo y superficie |
| `shadowLight` | `#FFFFFF` | Sombra clara |
| `shadowDark` | `#C2CCD9` | Sombra oscura |
| `textColor` | `#16324A` | Texto principal (~10:1) |
| `accentColor` | `#2E5C7A` | Iconos activos, títulos |
| `mutedColor` | `#5C7287` | Metadatos |
| `insetColor` | `#DBE3EC` | Superficies hundidas |
| `deleteButtonColor` | `#C2383F` | Acción destructiva |

> Corrige los dos fallos actuales del tema claro:
> `#EEEEEE` sobre `#61A4BC` = **2.40:1** y placeholder sobre tarjeta = **2.04:1**.

---

## 3. Receta técnica (RN 0.88 / Expo 58)

`boxShadow` es nativo en New Architecture, admite **múltiples sombras** e **inset**.
No hace falta ninguna librería de terceros.

```ts
import { Platform, type ViewStyle } from 'react-native';
import type { Theme } from '../config/types';

// Android: outset desde API 28 (9), inset desde API 29 (10).
export const supportsOutsetShadow =
  Platform.OS !== 'android' || Number(Platform.Version) >= 28;
export const supportsInsetShadow =
  Platform.OS !== 'android' || Number(Platform.Version) >= 29;

export const raised = (
  theme: Theme,
  level: 'sm' | 'md' | 'lg' = 'md',
): ViewStyle => {
  const geometry = { sm: '3px 3px 6px', md: '6px 6px 12px', lg: '10px 10px 20px' }[level];

  if (!supportsOutsetShadow) {
    return { borderWidth: 1, borderColor: theme.hairlineColor };
  }

  return {
    boxShadow: `${geometry} ${theme.shadowDark}, ${geometry} ${theme.shadowLight}`.replace(
      /(\d+px) (\d+px) (\d+px)/g,
      (_, x, y, blur) => `${x} ${y} ${blur}`,
    ),
  } as ViewStyle;
};
```

Forma recomendada (más legible) de la cadena final:

```ts
boxShadow: `6px 6px 12px ${theme.shadowDark}, -6px -6px 12px ${theme.shadowLight}`
boxShadow: `inset 4px 4px 8px ${theme.shadowDark}, inset -4px -4px 8px ${theme.shadowLight}`
```

Notas:

- `boxShadow` **no es animable**: animar `transform` / `opacity`, nunca la sombra.
- En iOS el relieve se ve desde el primer frame; en Android depende de API.
- En RN Web (`react-native-web` 0.21) se mapea a CSS `box-shadow`; el inset funciona.
- Opcional: `backgroundImage: 'linear-gradient(...)'` nativo para dar un brillo sutil
  en la esquina superior (sin `expo-linear-gradient`).

### Fallback sin `boxShadow`

```ts
const neumorphicFallback: ViewStyle = {
  borderWidth: 1,
  borderColor: theme.hairlineColor,
  backgroundColor: theme.surfaceColor,
};
```

---

## 4. Mapa de cambios por archivo

| Archivo | Cambio |
| --- | --- |
| `src/config/types.ts` | Añadir `surfaceColor`, `shadowLight`, `shadowDark`, `accentColor`, `mutedColor`, `insetColor`, `hairlineColor` |
| `src/config/theme.ts` | Nuevas paletas y radios (se conservan 18/12/28/999) |
| `src/utils/neumorphic.ts` (nuevo) | Helpers `raised()`, `inset()`, flags de soporte |
| `src/components/atoms/IconButton.tsx` | Fondo `surfaceColor` + `raised('md')`; `underlayColor: transparent`; pressed → `inset` |
| `src/components/atoms/AnimatedIconButton.tsx` | Igual que `IconButton`; animar solo `bottom` y `opacity` |
| `src/components/atoms/Checkbox.tsx` | Sin marcar `raised('sm')`; marcado `inset` + check ámbar |
| `src/components/atoms/DialogButton.tsx` | Ghost elevado; primario con acento; danger sólido |
| `src/components/molecules/modalStyles.ts` | Tarjeta `surfaceColor` + `raised('lg')`; quitar sombra negra |
| `src/components/molecules/Header.tsx` | Botones elevados; borde inferior → hairline o ninguno |
| `src/components/molecules/HomeItem.tsx` | Fila `surfaceColor` + `raised('sm')`; pressed inset |
| `src/components/molecules/ItemList.tsx` | Igual + `insetColor` para inputs y pista de audio |
| `src/components/molecules/SwipeToDelete.tsx` | **Reestructurar**: sombra en wrapper exterior, `overflow: hidden` solo en el contenido |
| `src/components/organisms/HomeScreen.tsx` / `ReminderScreen.tsx` | Quitar `shadowColor/elevation` de los FAB; usar helpers |
| `src/providers/DialogProvider.tsx` | Sin cambios de lógica; hereda `modalStyles` |

### Punto crítico: `SwipeToDelete`

```tsx
// La sombra va FUERA del clip; el clip solo envuelve el contenido deslizable.
<View style={[raised(theme, 'sm'), { borderRadius: 20 }]}>
  <ReanimatedSwipeable
    containerStyle={{ borderRadius: 20, overflow: 'hidden', backgroundColor: theme.surfaceColor }}
    ...
  >
    {children}
  </ReanimatedSwipeable>
</View>
```

Si la sombra queda dentro del contenedor con `overflow: 'hidden'`, se recorta y
el efecto desaparece.

---

## 5. Fases

1. **Tokens + helpers** (`theme.ts`, `types.ts`, `neumorphic.ts`). Sin cambios visuales aún.
2. **Chrome**: `IconButton`, `AnimatedIconButton`, `Checkbox`, `DialogButton`, modales.
3. **Filas**: `HomeItem`, `ItemList`, `SwipeToDelete`.
4. **Ajuste fino**: contraste, Android antiguo, animación de tema, tema claro.
5. **Capa glass**: `GlassOverlay`, modales, menú de acciones y cámara (ver sección 6).

Validación entre fases:

```bash
npm run typecheck
npm run web
```

---

## 6. Capa glass (complemento)

El vidrio **no reemplaza** al neumorfismo: se usa solo para lo que flota y necesita
mostrar contexto detrás.

### Reparto de roles

| Capa | Elementos | Tratamiento |
| --- | --- | --- |
| 1 · Base | Fondo, filas, header, inputs | Neumórfico, **opaco** |
| 2 · Flotante | Modales, diálogos, menú de acciones, toasts, chrome de cámara | **Glass**: tinte + blur + borde de luz |
| 3 · Acción | Confirmar, eliminar, iconos activos | Color pleno (ámbar / rojo), **nunca glass** |

Reglas:

- Máximo **2 o 3 superficies glass** visibles a la vez.
- Nunca glass sobre glass (el blur se vuelve barro).
- Un modal glass **necesita un scrim** detrás; sin contenido visible el vidrio parece plástico sucio.
- Sombra del glass: una sola sombra difusa + `inset 0 1px 0` de luz. No usar la doble sombra neumórfica.

### Tokens glass

```ts
// Oscuro
glassBackground: 'rgba(9, 33, 54, 0.52)',
glassBorder: 'rgba(255, 255, 255, 0.16)',
glassHighlight: 'rgba(255, 255, 255, 0.22)',
glassScrim: 'rgba(2, 10, 18, 0.42)',

// Claro
glassBackground: 'rgba(255, 255, 255, 0.55)',
glassBorder: 'rgba(255, 255, 255, 0.85)',
glassHighlight: 'rgba(255, 255, 255, 0.95)',
glassScrim: 'rgba(22, 50, 74, 0.28)',
```

### Instalación

```bash
npx expo install expo-blur
```

En SDK 58 `expo-blur` es estable en Android, pero **requiere** `BlurTargetView`:
sin eso el resultado es solo un fondo semitransparente.

```tsx
// App.tsx: un único target para toda la app
const blurTargetRef = useRef<View | null>(null);

<BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
  <StackNavigator />
</BlurTargetView>

<BlurView
  blurTarget={blurTargetRef}
  blurMethod="dimezisBlurViewSdk31Plus" // evita RenderScript en Android < 12
  intensity={30}
  tint="dark"
  style={{ overflow: 'hidden', borderRadius: 24 }}
>
  ...
</BlurView>
```

- `blurMethod` por defecto en Android es `'none'` → solo tinte.
- `dimezisBlurViewSdk31Plus` blurea en API 31+ y degrada a tinte en el resto:
  es el mejor balance rendimiento/efecto.
- `borderRadius` en `BlurView` necesita `overflow: 'hidden'`.
- Renderizar el `BlurView` **después** de la lista (el blur no se refresca si se monta antes que el contenido dinámico).

### El límite de los modales en Android

`BlurView` dentro de un `Modal` de React Native **no puede leer la pantalla**: el Modal
se dibuja en una ventana nativa aparte. Consecuencia:

- **iOS**: funciona bien.
- **Android**: el blur sale gris/negro o no sale.

Se eligió el primer camino y ya está implementado:

1. **Implementado**: los overlays viven en la raíz de la app, fuera del `BlurTargetView`,
   mediante `OverlayProvider` + `OverlayHost` (`src/providers/OverlayProvider.tsx`).
   `DialogProvider` los renderiza sobre `children` y maneja la tecla atrás con `BackHandler`.
   La ref del `BlurTargetView` se comparte con `BlurTargetContext`.
2. **Alternativa descartada**: mantener `Modal` y usar vidrio sin blur en Android
   (`blurMethod="none"` + tinte + borde). Se ve aceptable, pero no es vidrio real.

`ModalTitle`, `ModalAudio` y `GalleryModal` ya usan el portal (`GlassOverlay` /
`GlassBackdrop`). La galería usa `GlassBackdrop` para el fondo y mantiene el visor de
imágenes en negro para no alterar los colores de las fotos.

### Cámara

Sobre el visor **no** conviene blur real: cuesta y no se actualiza de forma fiable con
video. Ahí el vidrio es "falso":

```ts
{
  backgroundColor: 'rgba(8, 20, 30, 0.38)',
  borderTopWidth: 1,
  borderTopColor: 'rgba(255, 255, 255, 0.14)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.16)',
}
```

El borde superior claro + el tinte ya leen como vidrio sobre la imagen.

### Archivos nuevos/afectados

| Archivo | Cambio |
| --- | --- |
| `src/components/atoms/GlassOverlay.tsx` (nuevo) | Tarjeta glass + backdrop para overlays en la raíz |
| `src/components/atoms/GlassBackdrop.tsx` (nuevo) | Fondo full-screen con blur para overlays de pantalla completa |
| `src/providers/OverlayProvider.tsx` (nuevo) | Portal: acciones estables y host que renderiza los overlays |
| `src/providers/BlurTargetContext.tsx` (nuevo) | Ref compartida del `BlurTargetView` |
| `src/config/theme.ts` / `types.ts` | Tokens `glass*` |
| `src/providers/DialogProvider.tsx` | `Modal` → overlay + `BlurTargetView` + `OverlayHost` |
| `src/components/molecules/ModalTitle.tsx` / `ModalAudio.tsx` | `Modal` → portal glass |
| `src/components/organisms/GalleryModal.tsx` | `Modal` → portal con `GlassBackdrop`; visor negro |
| `src/components/organisms/CameraScreen.tsx` | Chrome glass sin blur |
| `src/components/molecules/Header.tsx` | Sin cambios (base neumórfica) |

### Rendimiento

- No usar `BlurView` dentro de listas ni de celdas reordenables.
- No animar `intensity` en bucles; animar `opacity` y `transform` del contenedor.
- Menos de 3 `BlurView` montados a la vez.
- En Android < 12, `dimezisBlurViewSdk31Plus` evita el coste de RenderScript.

---

## 7. Riesgos y mitigaciones

| Riesgo | Mitigación |
| --- | --- |
| Baja affordance (todo parece plano) | Acento en iconos activos + inset al presionar + radios consistentes |
| Sombras recortadas | Mover la sombra fuera de `overflow: hidden` |
| Coste en listas largas | Sombra de 4 px, sin blur alto; no animar `boxShadow` |
| Android < 9 / < 10 | Fallback con borde hairline; verificar en dispositivo |
| Contraste insuficiente | Tokens ya validados; no volver a texto claro sobre tarjeta clara |
| Modo oscuro "apagado" | `surfaceColor` un tono por encima del fondo actual para que la luz se lea |
| Blur real en modales Android | Convertir diálogos a overlay en la misma ventana o usar tinte sin blur |
| Blur caro / no se actualiza sobre video | Vidrio falso en cámara; blur solo en superficies estáticas |
| Exceso de capas | Máximo 2-3 superficies glass; la base siempre opaca |
| Texto sobre glass poco legible | Tinte con opacidad mínima + borde; validar contraste sobre el peor fondo |

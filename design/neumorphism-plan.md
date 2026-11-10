# Hybrid neumorphism · Implementation plan

Reference document for the visual update of **Organizer**.
The approvable mockup is in `design/neumorphism-preview.html`.

## Status

- [x] Phase 1 · Tokens (`theme.ts`, `types.ts`) and helpers (`src/utils/neumorphic.ts`)
- [x] Phase 2 · Chrome: `IconButton`, `AnimatedIconButton`, `Checkbox`, `DialogButton`, modals
- [x] Phase 3 · Rows: `SwipeToDelete`, `HomeItem`, `ItemList`
- [x] `expo-blur` installed
- [x] Phase 5a · `DialogProvider` as an overlay in the same window + real blur (iOS/Android 12+)
- [x] Phase 5b · Actions menu and camera chrome with glass
- [x] Phase 5c · `ModalTitle` / `ModalAudio` moved to a glass portal at the root
- [x] Phase 5d · Image gallery in the portal, with `GlassBackdrop` and a black viewer
- [x] Theme transition via native crossfade (same behavior on web and mobile)
- [ ] Phase 4 · Fine-tuning on device (old Android, contrast, theme animation)

---

## 1. Design decision

**Hybrid** neumorphism, not full:

| Area | Treatment |
| --- | --- |
| FAB and actions menu | Raised + inset state on press |
| Header (theme, gallery, badge) | Soft raised |
| Modals and dialogs | Raised card over a dark backdrop |
| Checkbox | Unchecked: raised · Checked: inset + amber |
| Audio player | Raised button + sunken track |
| List rows | Minimal elevation (4 px shadow), inset on press |
| Camera screen | No changes (black background, the viewfinder rules) |
| Gallery | Thumbnails with minimal relief; viewer unchanged |

**Rule:** shadow communicates depth; accent color communicates action.

---

## 2. Tokens

Implement in `src/config/theme.ts` and `src/config/types.ts`.

### Dark

| Token | Value | Use |
| --- | --- | --- |
| `surfaceColor` | `#071F35` | Background and surface (unified) |
| `shadowLight` | `#103A57` | Light shadow (top-left) |
| `shadowDark` | `#02101D` | Dark shadow (bottom-right) |
| `textColor` | `#E9EEF4` | Main text (~14:1 contrast) |
| `accentColor` | `#ECB365` | Active icons, titles, focus |
| `mutedColor` | `#8EA5BA` | Metadata |
| `insetColor` | `#041624` | Sunken surfaces |
| `deleteButtonColor` | `#B3363C` | Destructive action |

### Light

| Token | Value | Use |
| --- | --- | --- |
| `surfaceColor` | `#E6EBF1` | Background and surface |
| `shadowLight` | `#FFFFFF` | Light shadow |
| `shadowDark` | `#C2CCD9` | Dark shadow |
| `textColor` | `#16324A` | Main text (~10:1) |
| `accentColor` | `#2E5C7A` | Active icons, titles |
| `mutedColor` | `#5C7287` | Metadata |
| `insetColor` | `#DBE3EC` | Sunken surfaces |
| `deleteButtonColor` | `#C2383F` | Destructive action |

> Fixes the two current issues in the light theme:
> `#EEEEEE` on `#61A4BC` = **2.40:1** and placeholder on card = **2.04:1**.

---

## 3. Technical recipe (RN 0.88 / Expo 58)

`boxShadow` is native in the New Architecture, supports **multiple shadows** and **inset**.
No third-party library is needed.

```ts
import { Platform, type ViewStyle } from 'react-native';
import type { Theme } from '../config/types';

// Android: outset from API 28 (9), inset from API 29 (10).
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

Recommended (more readable) form of the final string:

```ts
boxShadow: `6px 6px 12px ${theme.shadowDark}, -6px -6px 12px ${theme.shadowLight}`
boxShadow: `inset 4px 4px 8px ${theme.shadowDark}, inset -4px -4px 8px ${theme.shadowLight}`
```

Notes:

- `boxShadow` **is not animatable**: animate `transform` / `opacity`, never the shadow.
- On iOS the relief is visible from the first frame; on Android it depends on the API level.
- On RN Web (`react-native-web` 0.21) it maps to CSS `box-shadow`; inset works.
- Optional: native `backgroundImage: 'linear-gradient(...)'` to add a subtle glow
  in the top corner (without `expo-linear-gradient`).

### Fallback without `boxShadow`

```ts
const neumorphicFallback: ViewStyle = {
  borderWidth: 1,
  borderColor: theme.hairlineColor,
  backgroundColor: theme.surfaceColor,
};
```

---

## 4. Change map by file

| File | Change |
| --- | --- |
| `src/config/types.ts` | Add `surfaceColor`, `shadowLight`, `shadowDark`, `accentColor`, `mutedColor`, `insetColor`, `hairlineColor` |
| `src/config/theme.ts` | New palettes and radii (18/12/28/999 are kept) |
| `src/utils/neumorphic.ts` (new) | `raised()`, `inset()` helpers, support flags |
| `src/components/atoms/IconButton.tsx` | `surfaceColor` background + `raised('md')`; `underlayColor: transparent`; pressed → `inset` |
| `src/components/atoms/AnimatedIconButton.tsx` | Same as `IconButton`; animate only `bottom` and `opacity` |
| `src/components/atoms/Checkbox.tsx` | Unchecked `raised('sm')`; checked `inset` + amber check |
| `src/components/atoms/DialogButton.tsx` | Raised ghost; accent primary; solid danger |
| `src/components/molecules/modalStyles.ts` | Card `surfaceColor` + `raised('lg')`; remove the black shadow |
| `src/components/molecules/Header.tsx` | Raised buttons; bottom border → hairline or none |
| `src/components/molecules/HomeItem.tsx` | Row `surfaceColor` + `raised('sm')`; pressed inset |
| `src/components/molecules/ItemList.tsx` | Same + `insetColor` for inputs and the audio track |
| `src/components/molecules/SwipeToDelete.tsx` | **Restructure**: shadow on the outer wrapper, `overflow: hidden` only on the content |
| `src/components/organisms/HomeScreen.tsx` / `ReminderScreen.tsx` | Remove `shadowColor/elevation` from the FABs; use the helpers |
| `src/providers/DialogProvider.tsx` | No logic changes; inherits `modalStyles` |

### Critical point: `SwipeToDelete`

```tsx
// The shadow goes OUTSIDE the clip; the clip only wraps the swipeable content.
<View style={[raised(theme, 'sm'), { borderRadius: 20 }]}>
  <ReanimatedSwipeable
    containerStyle={{ borderRadius: 20, overflow: 'hidden', backgroundColor: theme.surfaceColor }}
    ...
  >
    {children}
  </ReanimatedSwipeable>
</View>
```

If the shadow ends up inside a container with `overflow: 'hidden'`, it gets clipped and
the effect disappears.

---

## 5. Phases

1. **Tokens + helpers** (`theme.ts`, `types.ts`, `neumorphic.ts`). No visual changes yet.
2. **Chrome**: `IconButton`, `AnimatedIconButton`, `Checkbox`, `DialogButton`, modals.
3. **Rows**: `HomeItem`, `ItemList`, `SwipeToDelete`.
4. **Fine-tuning**: contrast, old Android, theme animation, light theme.
5. **Glass layer**: `GlassOverlay`, modals, actions menu and camera (see section 6).

Validation between phases:

```bash
npm run typecheck
npm run web
```

---

## 6. Glass layer (complement)

Glass **does not replace** neumorphism: it is used only for what floats and needs to
show context behind it.

### Role split

| Layer | Elements | Treatment |
| --- | --- | --- |
| 1 · Base | Background, rows, header, inputs | Neumorphic, **opaque** |
| 2 · Floating | Modals, dialogs, actions menu, toasts, camera chrome | **Glass**: tint + blur + light border |
| 3 · Action | Confirm, delete, active icons | Solid color (amber / red), **never glass** |

Rules:

- At most **2 or 3 glass surfaces** visible at once.
- Never glass over glass (the blur turns to mud).
- A glass modal **needs a scrim** behind it; without visible content, glass looks like dirty plastic.
- Glass shadow: a single diffuse shadow + `inset 0 1px 0` of light. Do not use the double neumorphic shadow.

### Glass tokens

```ts
// Dark
glassBackground: 'rgba(9, 33, 54, 0.52)',
glassBorder: 'rgba(255, 255, 255, 0.16)',
glassHighlight: 'rgba(255, 255, 255, 0.22)',
glassScrim: 'rgba(2, 10, 18, 0.42)',

// Light
glassBackground: 'rgba(255, 255, 255, 0.55)',
glassBorder: 'rgba(255, 255, 255, 0.85)',
glassHighlight: 'rgba(255, 255, 255, 0.95)',
glassScrim: 'rgba(22, 50, 74, 0.28)',
```

### Installation

```bash
npx expo install expo-blur
```

On SDK 58 `expo-blur` is stable on Android, but it **requires** `BlurTargetView`:
without it the result is just a semi-transparent background.

```tsx
// App.tsx: a single target for the whole app
const blurTargetRef = useRef<View | null>(null);

<BlurTargetView ref={blurTargetRef} style={{ flex: 1 }}>
  <StackNavigator />
</BlurTargetView>

<BlurView
  blurTarget={blurTargetRef}
  blurMethod="dimezisBlurViewSdk31Plus" // avoids RenderScript on Android < 12
  intensity={30}
  tint="dark"
  style={{ overflow: 'hidden', borderRadius: 24 }}
>
  ...
</BlurView>
```

- The default `blurMethod` on Android is `'none'` → tint only.
- `dimezisBlurViewSdk31Plus` blurs on API 31+ and degrades to a tint on older versions:
  it is the best performance/effect balance.
- `borderRadius` on `BlurView` requires `overflow: 'hidden'`.
- Render the `BlurView` **after** the list (the blur does not refresh if it mounts before the dynamic content).

### The Android modal limitation

`BlurView` inside a React Native `Modal` **cannot read the screen**: the Modal
is drawn in a separate native window. Consequence:

- **iOS**: works fine.
- **Android**: the blur comes out gray/black or does not show up.

The first path was chosen and is already implemented:

1. **Implemented**: overlays live at the app root, outside `BlurTargetView`,
   through `OverlayProvider` + `OverlayHost` (`src/providers/OverlayProvider.tsx`).
   `DialogProvider` renders them over `children` and handles the back key with `BackHandler`.
   The `BlurTargetView` ref is shared with `BlurTargetContext`.
2. **Discarded alternative**: keep `Modal` and use glass without blur on Android
   (`blurMethod="none"` + tint + border). It looks acceptable, but it is not real glass.

`ModalTitle`, `ModalAudio` and `GalleryModal` already use the portal (`GlassOverlay` /
`GlassBackdrop`). The gallery uses `GlassBackdrop` for the background and keeps the image
viewer black so it does not alter the photo colors.

### Camera

Over the viewfinder, real blur is **not** a good idea: it is expensive and does not refresh
reliably with video. There the glass is "fake":

```ts
{
  backgroundColor: 'rgba(8, 20, 30, 0.38)',
  borderTopWidth: 1,
  borderTopColor: 'rgba(255, 255, 255, 0.14)',
  boxShadow: 'inset 0 1px 0 rgba(255, 255, 255, 0.16)',
}
```

The light top border + the tint already read as glass over the image.

### New/affected files

| File | Change |
| --- | --- |
| `src/components/atoms/GlassOverlay.tsx` (new) | Glass card + backdrop for root overlays |
| `src/components/atoms/GlassBackdrop.tsx` (new) | Full-screen blurred background for full-screen overlays |
| `src/providers/OverlayProvider.tsx` (new) | Portal: stable actions and a host that renders the overlays |
| `src/providers/BlurTargetContext.tsx` (new) | Shared ref for `BlurTargetView` |
| `src/config/theme.ts` / `types.ts` | `glass*` tokens |
| `src/providers/DialogProvider.tsx` | `Modal` → overlay + `BlurTargetView` + `OverlayHost` |
| `src/components/molecules/ModalTitle.tsx` / `ModalAudio.tsx` | `Modal` → glass portal |
| `src/components/organisms/GalleryModal.tsx` | `Modal` → portal with `GlassBackdrop`; black viewer |
| `src/components/organisms/CameraScreen.tsx` | Glass chrome without blur |
| `src/components/molecules/Header.tsx` | No changes (neumorphic base) |

### Performance

- Do not use `BlurView` inside lists or reorderable cells.
- Do not animate `intensity` in loops; animate the container's `opacity` and `transform`.
- Fewer than 3 mounted `BlurView`s at a time.
- On Android < 12, `dimezisBlurViewSdk31Plus` avoids the RenderScript cost.

---

## 7. Risks and mitigations

| Risk | Mitigation |
| --- | --- |
| Low affordance (everything looks flat) | Accent on active icons + inset on press + consistent radii |
| Clipped shadows | Move the shadow outside `overflow: hidden` |
| Cost on long lists | 4 px shadow, no heavy blur; do not animate `boxShadow` |
| Android < 9 / < 10 | Hairline border fallback; verify on a device |
| Insufficient contrast | Tokens are already validated; do not go back to light text on light cards |
| "Washed out" dark mode | `surfaceColor` one shade above the current background so the light reads |
| Real blur in Android modals | Convert dialogs to same-window overlays or use tint without blur |
| Expensive blur / does not refresh over video | Fake glass on the camera; blur only on static surfaces |
| Too many layers | At most 2-3 glass surfaces; the base is always opaque |
| Hard-to-read text over glass | Tint with minimum opacity + border; validate contrast over the worst background |

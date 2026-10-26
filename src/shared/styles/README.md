# Shared styles

This folder is the home for shared styling primitives and common Tailwind/NativeWind classes.

NativeWind 4 and Tailwind CSS 3 are configured for Expo SDK 57. NativeWind supplies the `className` runtime; Reanimated and Worklets are its native peers. `tailwind-merge` resolves conflicting utilities in conditional component variants.

- `global.css`: Tailwind entrypoint imported once by the root layout.
- `classes.ts`: common layout and card variants.
- `cn.ts`: merge base and variant classes, resolving utility conflicts.
- `../../../tailwind.config.ts`: semantic colors, spacing, radius and shadows. Colors/spacing/radii reuse `../constants/theme.ts`.

Use `className` for static UI styles and `contentContainerClassName` for ScrollView content. Use complete literal class strings for variants; do not build names such as `bg-${color}` dynamically. Runtime account colors, progress widths, chart heights, and navigator options may use small `style` objects.

Use `AppInput` for all editable text; `FormField` wraps it with a label/hint. Its `inputBase` constrains intrinsic width with `min-w-0 w-full max-w-full` and uses 16px text for ordinary fields. Do not override ordinary fields to 14px on mobile web. A larger amount variant must remain shrinkable inside a width-constrained row, with a non-shrinking currency label. Do not disable viewport zoom to hide layout bugs. Focus/long-content regression tests cover 320px/390px widths in Chromium and WebKit; actual iOS keyboard and Safari zoom still need a device smoke test.

Use `inputScrollProps` for forms/search lists: persist handled taps; dismiss on drag only on native. RN Web 0.21 calls keyboard dismissal on every scroll, including browser auto-scroll while focusing an input, so web uses `keyboardDismissMode="none"` to prevent immediate focus loss.

Bundled React Native Web images derive inline dimensions from the original asset. `InstitutionIcon` intentionally uses `!h-full !w-full` inside a fixed, clipped tile to override these dimensions with NativeWind rather than leaking a large logo over nearby controls.

After changing Babel/Metro config, restart with `npx expo start --clear`. When native dependencies change, rebuild any existing development client.

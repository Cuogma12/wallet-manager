# Shared styles

This folder is the home for shared styling primitives and common Tailwind/NativeWind classes.

NativeWind 4 and Tailwind CSS 3 are configured for Expo SDK 57. NativeWind supplies the `className` runtime; Reanimated and Worklets are its native peers. `tailwind-merge` resolves conflicting utilities in conditional component variants.

- `global.css`: Tailwind entrypoint imported once by the root layout.
- `classes.ts`: common layout and card variants.
- `cn.ts`: merge base and variant classes, resolving utility conflicts.
- `../../../tailwind.config.ts`: semantic colors, spacing, radius and shadows. Colors/spacing/radii reuse `../constants/theme.ts`.

Use `className` for static UI styles and `contentContainerClassName` for ScrollView content. Use complete literal class strings for variants; do not build names such as `bg-${color}` dynamically. Runtime account colors, progress widths, chart heights, and navigator options may use small `style` objects.

After changing Babel/Metro config, restart with `npx expo start --clear`. When native dependencies change, rebuild any existing development client.

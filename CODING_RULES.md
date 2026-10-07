# Coding Rules & Checklist

This file is mandatory for every coding, refactoring, testing, and code-review task in this repository.

## 0. Required workflow

Before changing code:

- [ ] Read this file completely.
- [ ] Read `AGENTS.md` and inspect the relevant existing files.
- [ ] Identify whether the change belongs to a route, feature, shared UI, hook, service, or data layer.
- [ ] Reuse an existing shared component, hook, utility, icon, constant, or token before creating a new one.
- [ ] Check the current Expo SDK version before using an Expo or React Native API.

After changing code:

- [ ] Run `npx tsc --noEmit`.
- [ ] Run `npx expo lint`.
- [ ] Run `npx expo-doctor` when dependencies, config, or native modules changed.
- [ ] Test the affected flow on the target platform or run an appropriate bundle/export check.
- [ ] Confirm that no secrets, bank credentials, OTPs, or tokens were committed.
- [ ] Update this checklist or related documentation if the architecture changed.

## 1. Architecture

Use this separation:

```text
src/app/       Routes and screen composition only
src/features/  Feature-specific UI, hooks, services, and state
src/shared/    Reusable UI, icons, constants, types, utilities, and styles
src/shared/i18n/ Locale dictionaries, locale provider, and translation hook
src/context/   App-level state providers
src/db/        SQLite schema, migrations, and repositories
src/services/  External integrations such as bank APIs and import providers
```

Screen modules use this structure:

```text
src/features/<screen-name>/
├─ screens/       The screen entry component and screen composition
├─ components/    Components used only by this screen module
├─ hooks/         Screen-specific state, form behavior, and side effects
├─ services/      Screen-specific orchestration or adapters
└─ types/         Screen-specific domain types
```

Rules:

- Route files in `src/app/` are Expo Router adapters/layouts only. A route file should re-export the screen from `src/features/<screen-name>/screens/` or configure navigation.
- Each app screen has one feature module under `src/features/<screen-name>/`.
- Keep screen-specific components and hooks inside that screen module. Promote code to `src/shared/` only after it is reused by at least two feature modules.
- Feature modules must not import from `src/app/`.
- Route files should not contain database queries, external API calls, or screen business logic.
- Keep database access inside `src/db/` repositories.
- Keep bank, wallet, CSV, and synchronization integrations inside `src/services/`.
- Do not import a database client directly into a presentational component.
- Keep imports one-directional: `app → features/shared → services/db`; shared code must not import from `app`.

## 2. Components and hooks

### Components

- Components render UI and receive data/callbacks through props.
- A presentational component must not own business logic, database access, API calls, navigation side effects, or complex data transformation.
- Keep component files focused. If a component has a long conditional tree or repeated logic, split it into smaller components.
- Use the Atomic Design structure inside `src/shared/components/`:

```text
atoms/       Primitive UI: Button, Icon, Badge, Card, Input, ProgressBar
molecules/   Small combinations: SectionHeader, StatCard, TransactionRow
organisms/   Composed reusable sections: BalanceCard, AccountList, TransactionList
```

- A component used by two or more screens belongs in `src/shared/components/` or the relevant feature's shared component folder.
- A component used by only one screen stays close to that screen until it is genuinely reusable.
- Do not create a generic `Common.tsx`, `Helpers.tsx`, or `Components.tsx` dumping ground.

### Hooks

- Put reusable functions and behavior in hooks, not inside components.
- Hooks belong in `src/shared/hooks/` when generic, or `src/features/<feature>/hooks/` when feature-specific.
- Hooks own data fetching, subscriptions, derived state, form behavior, and side effects.
- Use names such as `useFinance`, `useTransactions`, `useAccountSync`, and `useAddTransaction`.
- Hooks must not return presentation-specific markup.
- Keep pure calculations in `src/shared/utils/` rather than hiding them inside a hook.

## 3. Shared folder rules

Use `src/shared/` for common code:

```text
src/shared/
├─ components/
│  ├─ atoms/
│  │  └─ icons/
│  ├─ molecules/
│  └─ organisms/
├─ constants/
├─ hooks/
├─ i18n/
├─ styles/
├─ types/
└─ utils/
```

- Shared code must be domain-light and reusable.
- Put design tokens, spacing, radii, colors, category definitions, and app-wide constants in `src/shared/constants/`.
- Put formatting, parsing, date, and pure helper functions in `src/shared/utils/`.
- Put reusable icon wrappers and icon definitions only in `src/shared/components/atoms/icons/`.
- Do not place icon files beside ordinary components.
- Do not duplicate constants or utility functions inside route files.
- Prefer named exports and explicit imports; use `src/shared/index.ts` only as a stable public barrel.

## 4. Icon rules

- Every icon must be selected through the shared icon layer.
- Add new icon mappings or wrappers under `src/shared/components/atoms/icons/`.
- Do not import `MaterialCommunityIcons`, `Ionicons`, or another icon library directly from screens when `AppIcon` can represent the icon.
- Use a typed icon name instead of arbitrary string names where possible.
- Keep icon size and color controlled by props or shared design tokens.
- Do not redraw icons using custom rotated View primitives.

## 5. Styling rules

- For React/web UI, use Tailwind utility classes.
- For React Native, use NativeWind `className` and `contentContainerClassName` for all static UI styles. NativeWind is configured in this repository.
- Reuse semantic theme utilities from `tailwind.config.ts`, layout/card primitives from `src/shared/styles/classes.ts`, and `cn()` to merge conditional variants.
- Reserve the `style` prop for runtime values such as account colors, progress widths, chart heights, or navigator options that have no className API. Do not add `StyleSheet.create` to UI components.
- Create or extend shared styles/tokens first in `src/shared/styles/` before adding one-off styling.
- Prefer shared Tailwind classes, semantic tokens, and component variants over arbitrary values.
- Avoid inline style objects for repeated patterns.
- Avoid custom CSS or `StyleSheet` blocks longer than the component itself. Split the component or extract a shared variant instead.
- Do not hardcode colors, spacing, radius, typography, or shadows when a shared token exists.
- Keep platform-specific styling isolated and documented.
- Do not mix multiple styling systems in the same component without a clear platform reason.

## 6. State, data, and finance rules

- Keep `Transaction.amount` positive; derive the sign from `Transaction.type`.
- `expense` decreases an account, `income` increases an account, and `transfer` moves money between accounts without counting as spending.
- Imported transactions need a stable external identifier for deduplication.
- Imported transactions start with a review state when categorization is uncertain.
- Never store bank passwords or OTPs in the app database.
- Treat bank and wallet integrations as read-only unless the user explicitly authorizes a separate payment feature.
- All database schema changes require a migration.

## 7. Naming and file rules

- Components use PascalCase: `TransactionRow.tsx`.
- Hooks use camelCase with a `use` prefix: `useTransactions.ts`.
- Utilities and constants use camelCase or a clearly named module: `formatCurrency.ts`, `categories.ts`.
- Keep one primary exported component per component file.
- Use absolute `@/` imports for files under `src/`.
- Avoid barrel exports that create circular dependencies.

## 8. Internationalization (i18n)

- Every user-visible label, placeholder, validation error, alert, empty state, tab title, and accessibility label must come from `src/shared/i18n/`.
- Use semantic translation keys such as `transactions.emptyTitle`; do not use Vietnamese or English sentences as keys.
- Use `useI18n()` in screens/components and interpolation placeholders such as `{{count}}`; do not concatenate translated fragments when a complete sentence can be translated.
- Store stable domain keys in SQLite and APIs, such as `food`, `salary`, and `shopping`; never store translated display labels as business identifiers.
- Format currency, numbers, and dates through shared utilities using the active locale.
- Keep user-entered text, merchant names, bank names, and imported transaction descriptions unchanged unless a product requirement explicitly asks for translation.
- The current production locale is Vietnamese (`vi`). Adding another locale requires a complete dictionary, a locale selector decision, and a smoke test for every main screen.
- Missing translations must be visible in development and must not silently become hardcoded screen text.

## 9. Quality, security, and product behavior

- Every new business rule needs a unit test or an explicit manual test scenario.
- Test money calculations, transfers, duplicate imported transactions, category changes, and month boundaries.
- Cover loading, empty, error, offline, syncing, conflict, and retry states for asynchronous flows.
- Interactive controls need an accessibility label when the visible label is not enough, a minimum touch target of 44 points, and readable contrast.
- Never log passwords, OTPs, access tokens, full account numbers, or transaction-sensitive payloads.
- Store sensitive credentials only in the platform-secure storage layer, never in SQLite or plain text.
- Do not add a dependency for a one-line helper. Use `npx expo install` for Expo-compatible packages and record why a new dependency is needed.
- Keep external API DTOs inside `src/services/` and map them to domain types before they reach UI code.
- Make sync jobs idempotent and deduplicate imported transactions with a provider identifier.
- Keep environment variables in `.env.example` documentation; never commit real secrets.

## 10. Git and review checklist

- [ ] Does the component only render from props?
- [ ] Did reusable behavior move into a hook?
- [ ] Did repeated UI move into the correct Atomic Design level?
- [ ] Did icons go through `src/shared/components/atoms/icons/`?
- [ ] Did the implementation reuse shared constants, styles, and utilities?
- [ ] Is styling short, tokenized, and Tailwind/NativeWind-compatible?
- [ ] Are database and API calls outside presentational components?
- [ ] Are loading, empty, error, offline, and review states covered where relevant?
- [ ] Are TypeScript, lint, and required Expo checks passing?
- [ ] Are all user-visible strings routed through `useI18n()`?
- [ ] Are translation keys semantic and interpolation-safe?
- [ ] Are stored categories and statuses stable keys rather than translated labels?
- [ ] Are new business rules covered by tests or an explicit manual test scenario?
- [ ] Are loading, empty, error, offline, sync-conflict, and retry states covered?
- [ ] Are interactive controls accessible and at least 44 points in the touch dimension?
- [ ] Are sensitive values absent from logs, SQLite, commits, and screenshots?
- [ ] Are new dependencies justified and Expo-compatible?
- [ ] Are external API models mapped before reaching components?

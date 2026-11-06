# Database documentation

- [SCHEMA.md](./SCHEMA.md) is the source of truth for the local SQLite model and future Supabase mapping.
- Runtime SQLite migrations live in [`src/db/database.ts`](../../src/db/database.ts).
- The current local schema version is `6`.
- Monthly limits and reusable custom categories live in their repositories; backup v3 includes both and still accepts legacy v1/v2 files with explicit data-loss warnings.
- Queries and financial mutations live in [`src/db/repositories/financeRepository.ts`](../../src/db/repositories/financeRepository.ts), not components/context.
- Run `npm test` for real in-memory SQLite integration tests (Node 22.13+); no native emulator or test dependency is required. The adapter covers SQL/migration/rollback behavior, not native rendering.

When a schema changes:

1. Increment `DB_SCHEMA_VERSION` in `src/db/constants.ts`.
2. Add a forward migration in `src/db/database.ts`.
3. Update `SCHEMA.md`.
4. Test a fresh install and an upgrade from the previous schema version.

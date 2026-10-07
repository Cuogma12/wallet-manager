# Database documentation

- [SCHEMA.md](./SCHEMA.md) is the source of truth for the local SQLite model and future Supabase mapping.
- Runtime SQLite migrations live in [`src/db/database.ts`](../../src/db/database.ts).
- The current local schema version is `2`.

When a schema changes:

1. Increment `DB_SCHEMA_VERSION` in `src/db/constants.ts`.
2. Add a forward migration in `src/db/database.ts`.
3. Update `SCHEMA.md`.
4. Test a fresh install and an upgrade from the previous schema version.

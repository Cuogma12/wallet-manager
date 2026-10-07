# Wallet Manager database

This document is the database contract for the offline-first finance app.

## Data ownership

The mobile app owns a local SQLite database. It works without an account or network connection.
The future online database will use Supabase Auth and PostgreSQL. Local records keep their client-generated IDs so they can be uploaded idempotently later.

```text
profiles
├─ settings
├─ accounts
├─ transactions
├─ budgets
└─ recurring_transactions
```

`profiles.auth_user_id` is nullable by design. It is empty in offline mode and is populated after the user signs in.

## Local SQLite tables

### profiles

| Column | Type | Rule |
| --- | --- | --- |
| `id` | TEXT | Local profile key, primary key |
| `auth_user_id` | TEXT | Nullable Supabase Auth user ID, unique |
| `device_id` | TEXT | Device identifier placeholder for sync metadata |
| `sync_enabled` | INTEGER | `0` until online sync is enabled |
| `created_at` | TEXT | ISO-8601 timestamp |
| `updated_at` | TEXT | ISO-8601 timestamp |

### settings

| Column | Type | Rule |
| --- | --- | --- |
| `id` | INTEGER | Local row key |
| `profile_id` | TEXT | Unique owner profile |
| `initial_balance` | INTEGER | VND integer, never float |
| `monthly_income` | INTEGER | Temporary legacy field; recurring income will replace it |
| `salary_day` | INTEGER | Day of month |
| `created_at` / `updated_at` | TEXT | ISO-8601 timestamps |

### accounts

| Column | Type | Rule |
| --- | --- | --- |
| `id` | TEXT | Client-generated stable ID |
| `profile_id` | TEXT | Owner profile |
| `name` | TEXT | Display name |
| `type` | TEXT | `cash`, `bank`, or `wallet` |
| `balance` | INTEGER | Cached display balance; transactions remain the audit source |
| `icon` / `color` | TEXT | Presentation metadata |
| `sync_status` | TEXT | Existing connection badge state |
| `sync_state` | TEXT | `pending`, `synced`, or `failed` |
| `external_id` | TEXT | Provider account ID when connected |
| `created_at` / `updated_at` / `deleted_at` | TEXT | Sync and soft-delete metadata |

### transactions

| Column | Type | Rule |
| --- | --- | --- |
| `id` | TEXT | Client-generated stable ID |
| `profile_id` | TEXT | Owner profile |
| `account_id` | TEXT | Related financial account |
| `type` | TEXT | `income`, `expense`, or `transfer` |
| `amount` | INTEGER | Positive VND integer; direction comes from `type` |
| `category` | TEXT | Stable key such as `food` or `salary`, never translated text |
| `occurred_at` | TEXT | Actual transaction time |
| `source` | TEXT | `manual`, `imported`, or `bank-api` |
| `external_id` | TEXT | Provider transaction ID for de-duplication |
| `sync_state` | TEXT | `pending`, `synced`, or `failed` |
| `created_at` / `updated_at` / `deleted_at` | TEXT | Sync and soft-delete metadata |

The category icon is derived from the stable category key in code. It is not stored as authoritative financial data.

## Online Supabase mapping

Supabase uses `auth.users.id` as the authenticated identity. The public tables should use `user_id` and Row Level Security policies:

```text
auth.users.id
└─ profiles.user_id
   ├─ accounts.user_id
   ├─ transactions.user_id
   ├─ budgets.user_id
   └─ recurring_transactions.user_id
```

The future sync service will:

1. Write user actions to SQLite first.
2. Mark changed rows as `pending`.
3. Push rows to Supabase using the same IDs.
4. Use `(user_id, source, external_id)` to prevent imported duplicates.
5. Pull remote changes using `updated_at` and apply them to SQLite.

Bank or wallet secrets must stay on a server/Edge Function and must never be stored in this mobile database.

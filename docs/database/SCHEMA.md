# Wallet Manager database

This document is the database contract for the offline-first finance app.

## Data ownership

The mobile app owns a local SQLite database. It works without an account or network connection.
The PWA uses the same schema in SQLite WASM, persisted atomically to IndexedDB rather than Expo's experimental OPFS web backend. See [PWA setup and backup contract](../PWA.md). Native data is not automatically moved to browser storage; portable JSON backup/restore is explicit and profile-scoped. The browser adapter uses a revision check to prevent stale tabs overwriting newer data and acknowledges writes only after durable commit.
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

| Column         | Type    | Rule                                            |
| -------------- | ------- | ----------------------------------------------- |
| `id`           | TEXT    | Local profile key, primary key                  |
| `auth_user_id` | TEXT    | Nullable Supabase Auth user ID, unique          |
| `device_id`    | TEXT    | Device identifier placeholder for sync metadata |
| `sync_enabled` | INTEGER | `0` until online sync is enabled                |
| `created_at`   | TEXT    | ISO-8601 timestamp                              |
| `updated_at`   | TEXT    | ISO-8601 timestamp                              |

### settings

| Column                      | Type    | Rule                                                                                        |
| --------------------------- | ------- | ------------------------------------------------------------------------------------------- |
| `id`                        | INTEGER | Local row key                                                                               |
| `profile_id`                | TEXT    | Unique owner profile                                                                        |
| `initial_balance`           | INTEGER | Legacy field; not an independent source of total assets. New profiles initialize it to zero |
| `monthly_income`            | INTEGER | Temporary legacy field; recurring income will replace it                                    |
| `salary_day`                | INTEGER | Day of month                                                                                |
| `created_at` / `updated_at` | TEXT    | ISO-8601 timestamps                                                                         |

### accounts

| Column                                     | Type    | Rule                                                                                             |
| ------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------ |
| `id`                                       | TEXT    | Client-generated stable ID                                                                       |
| `profile_id`                               | TEXT    | Owner profile                                                                                    |
| `name`                                     | TEXT    | Display name                                                                                     |
| `type`                                     | TEXT    | `cash`, `bank`, or `wallet`                                                                      |
| `balance`                                  | INTEGER | Current balance in integer VND; sum these across active accounts for total assets                |
| `opening_balance`                          | INTEGER | Balance baseline; `balance = opening_balance + active income - active expenses`. May be negative |
| `is_demo`                                  | INTEGER | `1` only for a recognized, untouched legacy sample wallet; new or edited wallets have `0`        |
| `icon` / `color`                           | TEXT    | Presentation metadata                                                                            |
| `sync_status`                              | TEXT    | Existing connection badge state                                                                  |
| `sync_state`                               | TEXT    | `pending`, `synced`, or `failed`                                                                 |
| `external_id`                              | TEXT    | Provider account ID when connected                                                               |
| `created_at` / `updated_at` / `deleted_at` | TEXT    | Sync and soft-delete metadata                                                                    |

### transactions

| Column                                     | Type    | Rule                                                                                                          |
| ------------------------------------------ | ------- | ------------------------------------------------------------------------------------------------------------- |
| `id`                                       | TEXT    | Client-generated stable ID                                                                                    |
| `profile_id`                               | TEXT    | Owner profile                                                                                                 |
| `account_id`                               | TEXT    | Related financial account                                                                                     |
| `type`                                     | TEXT    | `income`, `expense`, or `transfer`                                                                            |
| `amount`                                   | INTEGER | Positive VND integer; direction comes from `type`                                                             |
| `category`                                 | TEXT    | Stable key such as `food` or `salary`, never translated text                                                  |
| `occurred_at`                              | TEXT    | Actual transaction time                                                                                       |
| `source`                                   | TEXT    | `manual`, `imported`, or `bank-api`                                                                           |
| `external_id`                              | TEXT    | Provider transaction ID for de-duplication                                                                    |
| `salary_month`                             | TEXT    | Nullable local-calendar `YYYY-MM`, independent of receipt date. One active, non-demo salary per profile/month |
| `is_demo`                                  | INTEGER | `1` only for an exact recognized legacy seed transaction                                                      |
| `sync_state`                               | TEXT    | `pending`, `synced`, or `failed`                                                                              |
| `created_at` / `updated_at` / `deleted_at` | TEXT    | Sync and soft-delete metadata                                                                                 |

The category icon is derived from the stable category key in code. It is not stored as authoritative financial data.

## Financial setup rules (schema v3)

- Fresh installations start with a local profile, zeroed legacy settings, and no sample accounts/transactions.
- Creating a wallet sets both `balance` and `opening_balance`. It does not create an income transaction.
- Editing its current balance rebases `opening_balance` after subtracting active transaction movement, preserving transaction history. It also adopts an old demo wallet as a real manual wallet.
- Salary recording atomically inserts a manual income and updates the receiving wallet. If the user says salary is already included in the stated wallet balance, its balance is unchanged and the baseline is reduced instead.
- Salary deduplication is profile-wide, not per wallet: `idx_salary_month` is unique on `(profile_id, salary_month)` for active, non-demo rows. The repository additionally checks legacy non-demo salary rows with null `salary_month` against local receipt-month boundaries.
- Generic income entry uses category `other`; monthly salary uses the dedicated salary form. The receipt date must be a real date no later than today; salary month and receipt month may differ.
- Every mutation validates integer money and the wallet owner, is serialized, and is committed/rolled back atomically. Native uses Expo's exclusive transaction handle; web uses a serialized transaction fallback. All repository reads share the same queue.

### Transaction editing and monthly reporting (schema v3, no new migration)

- Transaction detail is reachable from both Overview and Transactions. Manual income/expense rows can be edited; imported, bank-API and transfer rows remain read-only in this release.
- Editing preserves the transaction ID and creation time. The repository atomically removes its previous signed contribution and applies the new one to the selected wallet(s); `opening_balance` is unchanged. Money calculations use exact intermediate arithmetic and reject out-of-range final balances.
- Deleting requires an in-app confirmation and reverses the contribution once. It sets `deleted_at`, `updated_at` and `sync_state = pending`; active queries exclude the tombstone. There is no restore UI. Missing, already-deleted, foreign-profile or read-only records cannot change balances.
- Every affected wallet must be active and owned by the local profile. Failed edits/deletions roll back the entire operation. Editing adopts a demo transaction as real (`is_demo = 0`), so future demo cleanup cannot remove the edited record.
- Salary edits preserve `salary_month` independently of receipt date unless explicitly changed. Uniqueness checks exclude the row being edited but still check other active real salaries, including legacy null-month salaries. Removing/changing a salary releases its old month. Receipt dates for salaries cannot be in the future.
- Salary already included in an initial wallet balance is part of the ledger: changing its amount applies only the difference; deleting it subtracts that income. The earlier baseline reduction is not undone. Moving it to another wallet reverses the old wallet contribution and credits the new wallet.
- Overview and Transactions filter by the local calendar month of `occurred_at`, not `salary_month` or the UTC date prefix. Transfers do not count as income or expenses. Recent transactions are sorted by actual instant. Total assets always show current wallet balances, not a historical month-end balance.
- The spending chart shows at most seven calendar days inside the selected month: through today for the current month, otherwise through that month's last day. Empty periods show zero and an empty-state message. Overview no longer shows a fabricated budget, trend percentage, fixed date or sample chart. The separate Budgets screen is still a prototype.

### Explicit demo cleanup

Only an affirmative UI confirmation runs cleanup. Tagged sample transactions get `deleted_at` tombstones; user transactions are never deleted. An untouched sample wallet with no real transactions is soft-deleted. If it has real transactions, keep the wallet, remove its sample baseline, and retain only real movement (which can produce a negative balance). Prompt the user to set its real current balance. A wallet already edited by the user retains its stated current balance; its baseline is rebased after sample transactions are hidden. New wallets and legacy settings are untouched. No SQLite file reset is performed; tombstones remain locally, but no restore UI exists yet.

### Explicit full local reset

The separate **Xóa toàn bộ dữ liệu** action requires a destructive confirmation. It hard-deletes all transactions (including salary and soft-deleted/demo rows) and wallets belonging to the current local profile, then zeroes its legacy money settings in one transaction. Other profiles, the local identity, schema, and source files are unchanged. It is never triggered by migrations or startup. Unlike demo cleanup, there are no tombstones to restore: recovery requires a pre-existing backup. It does not delete bank/e-wallet data or any future remote data; a synced production account will require a separate remote-reset workflow.

### Upgrade safety

Versions 1 and 2 upgrade in one transaction. Version 3 computes wallet baselines without altering current balances and recognizes samples by legacy IDs plus their content, never by age or source alone. It rebuilds the transaction table to normalize the schema and remove the obsolete v1 `category_icon NOT NULL` column that otherwise prevents new inserts. A failed migration rolls back the schema and version. Sample removal is never automatic during an upgrade.

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

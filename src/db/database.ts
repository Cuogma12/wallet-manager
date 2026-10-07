import type { SQLiteDatabase } from 'expo-sqlite';
import { seedAccounts, seedSettings, seedTransactions } from '@/data/seed';
import { DB_SCHEMA_VERSION, LOCAL_DEVICE_ID, LOCAL_PROFILE_ID } from '@/db/constants';

const now = () => new Date().toISOString();

export async function migrateDbIfNeeded(db: SQLiteDatabase) {
  const versionRow = await db.getFirstAsync<{ user_version: number }>('PRAGMA user_version');
  let currentVersion = versionRow?.user_version ?? 0;

  if (currentVersion > DB_SCHEMA_VERSION) {
    throw new Error(`Unsupported database version: ${currentVersion}`);
  }

  if (currentVersion === 0) {
    await createVersion2Schema(db);
    await seedVersion2Data(db);
    currentVersion = DB_SCHEMA_VERSION;
  }

  if (currentVersion === 1) {
    await migrateV1ToV2(db);
    currentVersion = DB_SCHEMA_VERSION;
  }

  await db.execAsync(`PRAGMA user_version = ${DB_SCHEMA_VERSION}`);
}

async function createVersion2Schema(db: SQLiteDatabase) {
  await db.execAsync(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY NOT NULL,
      auth_user_id TEXT UNIQUE,
      device_id TEXT NOT NULL,
      sync_enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS settings (
      id INTEGER PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL UNIQUE,
      initial_balance INTEGER NOT NULL,
      monthly_income INTEGER NOT NULL,
      salary_day INTEGER NOT NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      FOREIGN KEY (profile_id) REFERENCES profiles(id)
    );
    CREATE TABLE IF NOT EXISTS accounts (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL,
      name TEXT NOT NULL,
      type TEXT NOT NULL,
      balance INTEGER NOT NULL,
      icon TEXT NOT NULL,
      color TEXT NOT NULL,
      sync_status TEXT NOT NULL,
      sync_state TEXT NOT NULL DEFAULT 'pending',
      external_id TEXT,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY (profile_id) REFERENCES profiles(id)
    );
    CREATE TABLE IF NOT EXISTS transactions (
      id TEXT PRIMARY KEY NOT NULL,
      profile_id TEXT NOT NULL,
      account_id TEXT NOT NULL,
      title TEXT NOT NULL,
      merchant TEXT NOT NULL,
      amount INTEGER NOT NULL,
      type TEXT NOT NULL,
      category TEXT NOT NULL,
      occurred_at TEXT NOT NULL,
      note TEXT,
      source TEXT NOT NULL,
      is_reviewed INTEGER NOT NULL DEFAULT 1,
      external_id TEXT,
      sync_state TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL,
      deleted_at TEXT,
      FOREIGN KEY (profile_id) REFERENCES profiles(id),
      FOREIGN KEY (account_id) REFERENCES accounts(id)
    );
    CREATE INDEX IF NOT EXISTS idx_accounts_profile_id ON accounts(profile_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_profile_date ON transactions(profile_id, occurred_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_external_id
      ON transactions(profile_id, source, external_id)
      WHERE external_id IS NOT NULL;
  `);
}

async function seedVersion2Data(db: SQLiteDatabase) {
  const timestamp = now();

  await db.runAsync(
    `INSERT INTO profiles (id, auth_user_id, device_id, sync_enabled, created_at, updated_at)
     VALUES (?, NULL, ?, 0, ?, ?)`,
    LOCAL_PROFILE_ID,
    LOCAL_DEVICE_ID,
    timestamp,
    timestamp,
  );
  await db.runAsync(
    `INSERT INTO settings
      (id, profile_id, initial_balance, monthly_income, salary_day, created_at, updated_at)
     VALUES (1, ?, ?, ?, ?, ?, ?)`,
    LOCAL_PROFILE_ID,
    seedSettings.initialBalance,
    seedSettings.monthlyIncome,
    seedSettings.salaryDay,
    timestamp,
    timestamp,
  );

  for (const account of seedAccounts) {
    await db.runAsync(
      `INSERT INTO accounts
        (id, profile_id, name, type, balance, icon, color, sync_status, sync_state, external_id, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', NULL, ?, ?, NULL)`,
      account.id,
      LOCAL_PROFILE_ID,
      account.name,
      account.type,
      account.balance,
      account.icon,
      account.color,
      account.syncStatus,
      timestamp,
      timestamp,
    );
  }

  for (const transaction of seedTransactions) {
    await db.runAsync(
      `INSERT INTO transactions
        (id, profile_id, account_id, title, merchant, amount, type, category, occurred_at, note, source, is_reviewed, external_id, sync_state, created_at, updated_at, deleted_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, NULL, 'pending', ?, ?, NULL)`,
      transaction.id,
      LOCAL_PROFILE_ID,
      transaction.accountId,
      transaction.title,
      transaction.merchant,
      transaction.amount,
      transaction.type,
      transaction.category,
      transaction.occurredAt,
      transaction.note ?? null,
      transaction.source,
      transaction.isReviewed ? 1 : 0,
      timestamp,
      timestamp,
    );
  }
}

async function migrateV1ToV2(db: SQLiteDatabase) {
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS profiles (
      id TEXT PRIMARY KEY NOT NULL,
      auth_user_id TEXT UNIQUE,
      device_id TEXT NOT NULL,
      sync_enabled INTEGER NOT NULL DEFAULT 0,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );
    ALTER TABLE settings ADD COLUMN profile_id TEXT NOT NULL DEFAULT '${LOCAL_PROFILE_ID}';
    ALTER TABLE settings ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
    ALTER TABLE settings ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
    ALTER TABLE accounts ADD COLUMN profile_id TEXT NOT NULL DEFAULT '${LOCAL_PROFILE_ID}';
    ALTER TABLE accounts ADD COLUMN sync_state TEXT NOT NULL DEFAULT 'pending';
    ALTER TABLE accounts ADD COLUMN external_id TEXT;
    ALTER TABLE accounts ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
    ALTER TABLE accounts ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
    ALTER TABLE accounts ADD COLUMN deleted_at TEXT;
    ALTER TABLE transactions ADD COLUMN profile_id TEXT NOT NULL DEFAULT '${LOCAL_PROFILE_ID}';
    ALTER TABLE transactions ADD COLUMN external_id TEXT;
    ALTER TABLE transactions ADD COLUMN sync_state TEXT NOT NULL DEFAULT 'pending';
    ALTER TABLE transactions ADD COLUMN created_at TEXT NOT NULL DEFAULT '';
    ALTER TABLE transactions ADD COLUMN updated_at TEXT NOT NULL DEFAULT '';
    ALTER TABLE transactions ADD COLUMN deleted_at TEXT;
  `);

  const timestamp = now();
  await db.runAsync(
    `INSERT OR IGNORE INTO profiles (id, auth_user_id, device_id, sync_enabled, created_at, updated_at)
     VALUES (?, NULL, ?, 0, ?, ?)`,
    LOCAL_PROFILE_ID,
    LOCAL_DEVICE_ID,
    timestamp,
    timestamp,
  );
  await db.runAsync("UPDATE settings SET created_at = ?, updated_at = ? WHERE created_at = ''", timestamp, timestamp);
  await db.runAsync("UPDATE accounts SET created_at = ?, updated_at = ? WHERE created_at = ''", timestamp, timestamp);
  await db.runAsync("UPDATE transactions SET created_at = ?, updated_at = ? WHERE created_at = ''", timestamp, timestamp);
  await db.execAsync(`
    CREATE INDEX IF NOT EXISTS idx_accounts_profile_id ON accounts(profile_id);
    CREATE INDEX IF NOT EXISTS idx_transactions_profile_date ON transactions(profile_id, occurred_at DESC);
    CREATE UNIQUE INDEX IF NOT EXISTS idx_transactions_external_id
      ON transactions(profile_id, source, external_id)
      WHERE external_id IS NOT NULL;
  `);
}

const { DatabaseSync } = require('node:sqlite');
const { loadTypescript } = require('./loadTypescript.cjs');

function createDatabase() {
  const raw = new DatabaseSync(':memory:');
  const db = {
    raw,
    execAsync: async (sql) => {
      raw.exec(sql);
    },
    runAsync: async (sql, ...args) => raw.prepare(sql).run(...args),
    getFirstAsync: async (sql, ...args) =>
      raw.prepare(sql).get(...args) ?? null,
    getAllAsync: async (sql, ...args) => raw.prepare(sql).all(...args),
    withTransactionAsync: async (task) => {
      raw.exec('BEGIN');
      try {
        await task();
        raw.exec('COMMIT');
      } catch (error) {
        raw.exec('ROLLBACK');
        throw error;
      }
    },
    withExclusiveTransactionAsync: async (task) =>
      db.withTransactionAsync(() => task(db)),
  };
  return db;
}

function seedLegacy(db, version = 2) {
  const { seedAccounts, seedTransactions } = loadTypescript('src/data/seed.ts');
  const ownership =
    version === 2
      ? ", profile_id TEXT NOT NULL DEFAULT 'local-profile', sync_state TEXT NOT NULL DEFAULT 'pending', external_id TEXT, created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT '', deleted_at TEXT"
      : '';
  db.raw.exec(`
    ${version === 2 ? "CREATE TABLE profiles (id TEXT PRIMARY KEY, auth_user_id TEXT UNIQUE, device_id TEXT NOT NULL, sync_enabled INTEGER NOT NULL DEFAULT 0, created_at TEXT NOT NULL, updated_at TEXT NOT NULL); INSERT INTO profiles VALUES ('local-profile', NULL, 'local-device', 0, '', '');" : ''}
    CREATE TABLE settings (id INTEGER PRIMARY KEY, initial_balance INTEGER NOT NULL, monthly_income INTEGER NOT NULL, salary_day INTEGER NOT NULL
      ${version === 2 ? ", profile_id TEXT NOT NULL DEFAULT 'local-profile', created_at TEXT NOT NULL DEFAULT '', updated_at TEXT NOT NULL DEFAULT ''" : ''});
    INSERT INTO settings (id, initial_balance, monthly_income, salary_day) VALUES (1, 8500000, 18000000, 5);
    CREATE TABLE accounts (id TEXT PRIMARY KEY, name TEXT NOT NULL, type TEXT NOT NULL, balance INTEGER NOT NULL, icon TEXT NOT NULL, color TEXT NOT NULL, sync_status TEXT NOT NULL ${ownership});
    CREATE TABLE transactions (id TEXT PRIMARY KEY, account_id TEXT NOT NULL, title TEXT NOT NULL, merchant TEXT NOT NULL, amount INTEGER NOT NULL, type TEXT NOT NULL, category TEXT NOT NULL,
      ${version === 1 ? 'category_icon TEXT NOT NULL,' : ''} occurred_at TEXT NOT NULL, note TEXT, source TEXT NOT NULL, is_reviewed INTEGER NOT NULL DEFAULT 1 ${ownership});
    PRAGMA user_version = ${version};
  `);
  for (const a of seedAccounts)
    db.raw
      .prepare(
        'INSERT INTO accounts (id,name,type,balance,icon,color,sync_status) VALUES (?,?,?,?,?,?,?)',
      )
      .run(a.id, a.name, a.type, a.balance, a.icon, a.color, a.syncStatus);
  for (const t of seedTransactions) {
    const columns = version === 1 ? ', category_icon' : '';
    const values = version === 1 ? ', ?' : '';
    const args = [
      t.id,
      t.accountId,
      t.title,
      t.merchant,
      t.amount,
      t.type,
      t.category,
      t.occurredAt,
      t.note ?? null,
      t.source,
      t.isReviewed ? 1 : 0,
    ];
    if (version === 1) args.push(t.categoryIcon);
    db.raw
      .prepare(
        `INSERT INTO transactions (id,account_id,title,merchant,amount,type,category,occurred_at,note,source,is_reviewed${columns}) VALUES (?,?,?,?,?,?,?,?,?,?,?${values})`,
      )
      .run(...args);
  }
}

module.exports = { createDatabase, seedLegacy };

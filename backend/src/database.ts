import Database from 'better-sqlite3';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { hashPassword } from './auth/utils.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database will be stored in a 'data' directory for persistence
const DB_PATH = path.join(__dirname, '..', 'data', 'app.db');

const defaultUser = {
  email: process.env.DEFAULT_USER_EMAIL,
  password: process.env.DEFAULT_USER_PASSWORD,
};

const defaultGtmSettings = {
  gtm_container_id: process.env.DEFAULT_GTM_CONTAINER_ID,
  ga_measurement_id: process.env.DEFAULT_GA_MEASUREMENT_ID,
};

export async function initDatabase() {
  // Create data directory if it doesn't exist
  const dataDir = path.dirname(DB_PATH);
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }

  const db = new Database(DB_PATH);

  // Enable foreign keys
  db.pragma('foreign_keys = ON');

  // Create tables if they don't exist
  db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      email TEXT NOT NULL UNIQUE,
      password_hash TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS user_settings (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      gtm_container_id TEXT,
      ga_measurement_id TEXT,
      updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  db.exec(`
    CREATE TABLE IF NOT EXISTS events (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id INTEGER NOT NULL,
      event_name TEXT NOT NULL,
      payload TEXT NOT NULL,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    );
  `);

  console.log('✓ Database initialized successfully');
  console.log(`✓ Database location: ${DB_PATH}`);

  // Seed default user and settings if not exists
  await seedDefaultData(db);

  return db;
}

async function seedDefaultData(db: Database.Database) {
  // Skip seeding if default user credentials are not configured
  if (!defaultUser.email || !defaultUser.password) {
    console.log(
      '⚠ Default user credentials not configured in .env, skipping seed'
    );
    return;
  }

  // Check if default user exists
  const existingUser = db
    .prepare('SELECT id FROM users WHERE email = ?')
    .get(defaultUser.email) as { id: number } | undefined;

  if (!existingUser) {
    // Create default user
    const passwordHash = await hashPassword(defaultUser.password);
    const result = db
      .prepare('INSERT INTO users (email, password_hash) VALUES (?, ?)')
      .run(defaultUser.email, passwordHash);

    const userId = result.lastInsertRowid as number;

    // Create default settings for the user if GTM settings are configured
    if (
      defaultGtmSettings.gtm_container_id &&
      defaultGtmSettings.ga_measurement_id
    ) {
      db.prepare(
        'INSERT INTO user_settings (user_id, gtm_container_id, ga_measurement_id) VALUES (?, ?, ?)'
      ).run(
        userId,
        defaultGtmSettings.gtm_container_id,
        defaultGtmSettings.ga_measurement_id
      );
    }

    console.log('✓ Default user and settings created');
    console.log(`  Email: ${defaultUser.email}`);
    console.log(`  Password: ${defaultUser.password}`);
  }
}

export function getDatabase() {
  return new Database(DB_PATH);
}

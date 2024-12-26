import sqlite3 from 'sqlite3';
import path from 'path';

const dbPath = path.join(__dirname, '../../../database/store.db');

export function initializeDatabase() {
  const db = new sqlite3.Database(dbPath);

  db.exec('PRAGMA journal_mode = WAL;', (err) => {
    if (err) {
      console.error('Error enabling WAL mode:', err);
    } else {
      console.log('WAL mode enabled successfully');
    }
  });

  db.exec('PRAGMA busy_timeout = 5000;', (err) => {
    if (err) {
      console.error('Error setting busy timeout:', err);
    }
  });

  return db;
}

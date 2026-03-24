import SQLite from 'react-native-sqlite-storage';
 
SQLite.enablePromise(true);
 
export const getDBConnection = async () => {
  return SQLite.openDatabase({
    name: 'progress.db',
    location: 'default',
  });
};
 
export const initDB = async () => {
  const db = await getDBConnection();
 
  // E_TYPES
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS e_types (
      id        INTEGER PRIMARY KEY,
      t_name    TEXT
    );
  `);
 
  // SPORTS
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS sports (
      sport_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      sport_name  TEXT NOT NULL,
      created_at  DATETIME DEFAULT (datetime('now'))
    );
  `);
 
  // SPORTS_DEFAULT
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS sports_default (
      sport_id    INTEGER PRIMARY KEY AUTOINCREMENT,
      sport_name  TEXT NOT NULL
    );
  `);
 
  // ALL_EXERCISES
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS all_exercises (
      id      INTEGER PRIMARY KEY AUTOINCREMENT,
      e_name  TEXT NOT NULL,
      e_type  INTEGER NOT NULL,
      FOREIGN KEY (e_type) REFERENCES e_types (id)
    );
  `);
 
  // WORKOUTS
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS workouts (
      workout_id          INTEGER PRIMARY KEY AUTOINCREMENT,
      sport_id            INTEGER,
      workout_name        TEXT NOT NULL,
      created_at          DATETIME DEFAULT (datetime('now')),
      is_deleted          INTEGER DEFAULT 0,
      workout_description TEXT,
      FOREIGN KEY (sport_id) REFERENCES sports (sport_id)
    );
  `);
 
  // WORKOUTS_DAYS
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS workouts_days (
      day_id      INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id  INTEGER,
      day_name    TEXT NOT NULL,
      created_at  DATETIME DEFAULT (datetime('now')),
      is_deleted  INTEGER DEFAULT 0,
      FOREIGN KEY (workout_id) REFERENCES workouts (workout_id)
    );
  `);
 
  // EXERCISES
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS exercises (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      day_id      INTEGER,
      ex_name     TEXT NOT NULL,
      sets        INTEGER NOT NULL,
      reps        INTEGER NOT NULL,
      rest        INTEGER NOT NULL,
      is_deleted  INTEGER DEFAULT 0,
      weight      NUMERIC,
      FOREIGN KEY (day_id) REFERENCES workouts_days (day_id)
    );
  `);
 
  // WORKOUT_SESSION
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS workout_session (
      id            INTEGER PRIMARY KEY AUTOINCREMENT,
      workout_id    INTEGER NOT NULL,
      started_at    DATETIME DEFAULT (datetime('now')),
      is_deleted    INTEGER DEFAULT 0,
      end_at        DATETIME,
      statue        TEXT,
      workout_name  TEXT,
      FOREIGN KEY (workout_id) REFERENCES workouts (workout_id)
    );
  `);
 
  // WORKOUT_SESSION_DAYS
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS workout_session_days (
      id          INTEGER PRIMARY KEY AUTOINCREMENT,
      day_name    TEXT NOT NULL,
      session_id  INTEGER,
      day_id      INTEGER,
      FOREIGN KEY (session_id) REFERENCES workout_session (id),
      FOREIGN KEY (day_id)     REFERENCES workouts_days (day_id)
    );
  `);
 
  // EXERCICE_LOGS
  await db.executeSql(`
    CREATE TABLE IF NOT EXISTS exercice_logs (
      id              INTEGER PRIMARY KEY AUTOINCREMENT,
      day_id          INTEGER NOT NULL,
      exercise_id     INTEGER NOT NULL,
      sets_completed  INTEGER,
      reps_completed  INTEGER,
      weight_kg       NUMERIC,
      created_at      DATETIME DEFAULT (datetime('now')),
      is_deleted      INTEGER DEFAULT 0,
      rest_sec        INTEGER,
      ex_name         TEXT,
      FOREIGN KEY (day_id)      REFERENCES workout_session_days (id),
      FOREIGN KEY (exercise_id) REFERENCES exercises (id)
    );
  `);
 
  return db;
};
 
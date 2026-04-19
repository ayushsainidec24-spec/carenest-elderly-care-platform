const sqlite3 = require("sqlite3").verbose();

const db = new sqlite3.Database("./carenest.db");

db.serialize(() => {

db.run(`CREATE TABLE IF NOT EXISTS users(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
email TEXT,
password TEXT,
role TEXT
)`);

db.run(`CREATE TABLE IF NOT EXISTS caregivers(
id INTEGER PRIMARY KEY AUTOINCREMENT,
name TEXT,
service TEXT,
rating REAL
)`);

db.run(`CREATE TABLE IF NOT EXISTS health(
id INTEGER PRIMARY KEY AUTOINCREMENT,
user_id INTEGER,
heart_rate INTEGER,
bp TEXT,
glucose INTEGER
)`);

db.run(`CREATE TABLE IF NOT EXISTS medication(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  name TEXT,
  time TEXT,
  taken INTEGER
)`);

db.run(`CREATE TABLE IF NOT EXISTS sos(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  message TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)`);

db.run(`CREATE TABLE IF NOT EXISTS bookings(
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  user_id INTEGER,
  caregiver_id INTEGER,
  date TEXT,
  time TEXT,
  status TEXT DEFAULT 'scheduled'
)`);

db.get("SELECT COUNT(*) AS count FROM caregivers", (err, row) => {
  if (err || !row || row.count > 0) return;

  const seedCaregivers = [
    ["Sarah M.", "Nursing Care", 4.8],
    ["Dr. James K.", "Physiotherapy", 4.9],
    ["Emily R.", "Post-Surgery Care", 4.7],
    ["Anita D.", "Dementia Care", 4.9],
  ];

  const insert = db.prepare("INSERT INTO caregivers(name,service,rating) VALUES(?,?,?)");
  seedCaregivers.forEach((caregiver) => insert.run(caregiver));
  insert.finalize();
});

});

module.exports = db;

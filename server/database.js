// [Lucky] SQLite database setup for profile and message storage
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "sketchcord.db");

let db;

// [Lucky] Initialize the database — loads existing file or creates new one
async function initDB() {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // [Lucky] Create users table — stores profiles
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // [Lucky] Create messages table — stores drawings as JSON stroke data
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            strokes TEXT NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    saveDB();
    console.log("Database initialized!");
    return db;
}

// [Lucky] Persist database to disk
function saveDB() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// [Lucky] Create or get a user profile
function getOrCreateUser(username) {
    const existing = db.exec("SELECT * FROM users WHERE username = ?", [username]);
    if (existing.length > 0 && existing[0].values.length > 0) {
        return { id: existing[0].values[0][0], username: existing[0].values[0][1] };
    }
    db.run("INSERT INTO users (username) VALUES (?)", [username]);
    saveDB();
    const result = db.exec("SELECT last_insert_rowid()");
    return { id: result[0].values[0][0], username };
}

// [Lucky] Save a drawing message to the database
function saveMessage(username, strokes) {
    db.run("INSERT INTO messages (username, strokes) VALUES (?, ?)", [username, JSON.stringify(strokes)]);
    saveDB();
    const result = db.exec("SELECT last_insert_rowid()");
    return result[0].values[0][0];
}

// [Lucky] Get message history (last 50 messages)
function getMessages(limit = 50) {
    const result = db.exec(
        `SELECT id, username, strokes, created_at FROM messages ORDER BY id DESC LIMIT ?`,
        [limit]
    );
    if (result.length === 0) return [];

    return result[0].values.map(row => ({
        id: row[0],
        username: row[1],
        strokes: JSON.parse(row[2]),
        created_at: row[3]
    })).reverse(); // [Lucky] Reverse so oldest first
}

module.exports = { initDB, getOrCreateUser, saveMessage, getMessages };

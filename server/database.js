// SQLite database setup for profile and message storage
const initSqlJs = require("sql.js");
const fs = require("fs");
const path = require("path");

const DB_PATH = path.join(__dirname, "sketchcord.db");

let db;

// Initialize the database — loads existing file or creates new one
async function initDB() {
    const SQL = await initSqlJs();

    if (fs.existsSync(DB_PATH)) {
        const fileBuffer = fs.readFileSync(DB_PATH);
        db = new SQL.Database(fileBuffer);
    } else {
        db = new SQL.Database();
    }

    // Create users table — stores profiles
    db.run(`
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE NOT NULL,
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    // Create messages table — stores drawings as JSON stroke data with color
    db.run(`
        CREATE TABLE IF NOT EXISTS messages (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            strokes TEXT NOT NULL,
            color TEXT DEFAULT '#000000',
            created_at DATETIME DEFAULT CURRENT_TIMESTAMP
        )
    `);

    saveDB();
    console.log("Database initialized!");
    return db;
}

// Persist database to disk
function saveDB() {
    const data = db.export();
    const buffer = Buffer.from(data);
    fs.writeFileSync(DB_PATH, buffer);
}

// Create or get a user profile
function getOrCreateUser(username) {
    const stmt = db.prepare("SELECT * FROM users WHERE username = ?");
    stmt.bind([username]);
    if (stmt.step()) {
        const row = stmt.get();
        stmt.free();
        return { id: row[0], username: row[1] };
    }
    stmt.free();
    db.run("INSERT INTO users (username) VALUES (?)", [username]);
    saveDB();
    const result = db.exec("SELECT last_insert_rowid()");
    return { id: result[0].values[0][0], username };
}

// Save a drawing message with color to the database
function saveMessage(username, strokes, color) {
    db.run("INSERT INTO messages (username, strokes, color) VALUES (?, ?, ?)", [username, JSON.stringify(strokes), color || "#000000"]);
    saveDB();
    const result = db.exec("SELECT last_insert_rowid()");
    return result[0].values[0][0];
}

// Get message history (last 50 messages)
function getMessages(limit = 50) {
    const stmt = db.prepare("SELECT id, username, strokes, color, created_at FROM messages ORDER BY id DESC LIMIT ?");
    stmt.bind([limit]);
    const messages = [];
    while (stmt.step()) {
        const row = stmt.get();
        messages.push({
            id: row[0],
            username: row[1],
            strokes: JSON.parse(row[2]),
            color: row[3] || "#000000",
            created_at: row[4]
        });
    }
    stmt.free();
    return messages.reverse(); // Reverse so oldest first
}

module.exports = { initDB, getOrCreateUser, saveMessage, getMessages };

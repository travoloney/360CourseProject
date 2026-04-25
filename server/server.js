
const ws = require("ws") // web socket
// Added Express for REST API and database for storage
const express = require("express");
const cors = require("cors");
const { initDB, getOrCreateUser, saveMessage, getMessages } = require("./database");

<<<<<<< HEAD
// Create a web socket server and listen at port 8080.
const wss = new ws.Server({port: 8080})

// When a client sends data log the data, next loop through every client
// and if the client is connected send them the data.
function messageHandle(data){ // message event
    console.log("Received: " , data.toString())
    wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN){
            client.send(data);
=======
const app = express();
app.use(cors());
app.use(express.json());

// REST endpoint — get message history
app.get("/api/messages", (req, res) => {
    const messages = getMessages();
    res.json(messages);
});

// REST endpoint — create or get user profile
app.post("/api/users", (req, res) => {
    const { username } = req.body;
    if (!username || typeof username !== "string" || username.trim().length === 0) {
        return res.status(400).json({ error: "Username is required" });
    }
    const user = getOrCreateUser(username.trim());
    res.json(user);
});

// Start Express on port 3000, then start WebSocket server
initDB().then(() => {
    const server = app.listen(3000, () => {
        console.log("REST API running on http://localhost:3000");
    });

    const wss = new ws.Server({ port: 8080 });

    function messageHandle(data) { // message event
        console.log("Received: ", data.toString());

        // Parse message and save to database with color
        try {
            const parsed = JSON.parse(data.toString());
            if (parsed.username && parsed.strokes) {
                saveMessage(parsed.username, parsed.strokes, parsed.color);
            }
        } catch (err) {
            console.log("Could not save message:", err.message);
>>>>>>> 54148f6779556d19f626949dee3d64aee8fe7883
        }

<<<<<<< HEAD
// a client has connected attach a message handle to the client.
// When a client sends a message run the message handler
function connectionHandle(ws){ // connection event
    console.log("Client Connected!")
    ws.on("message" , messageHandle)
}

// When a connection occurs run the connection handle event.
wss.on("connection" , connectionHandle) 
=======
        wss.clients.forEach(client => {
            if (client.readyState === ws.OPEN) {
                client.send(data);
            }
        });
    }

    function connectionHandle(socket) { // connection event
        console.log("Client Connected!");

        // Send message history to newly connected client
        const history = getMessages();
        if (history.length > 0) {
            socket.send(JSON.stringify({ type: "history", messages: history }));
        }

        socket.on("message", messageHandle);
    }

    wss.on("connection", connectionHandle);
    console.log("WebSocket server running on ws://localhost:8080");
});
>>>>>>> 54148f6779556d19f626949dee3d64aee8fe7883

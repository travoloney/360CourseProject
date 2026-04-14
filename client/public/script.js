import { setupCanvas } from "./canvas.js";
import { setupSocket } from "./socket.js";

// [Lucky] Current logged-in username
let currentUser = null;

window.onload = () => {

    const loginDiv = document.getElementById("login");
    const appDiv = document.getElementById("app");
    const canvas = document.getElementById("drawingCanvas");
    const thread = document.getElementById("thread");

    // [Lucky] Auto-login if user was already logged in (survives page reloads)
    const savedUser = sessionStorage.getItem("sketchcord_user");
    if (savedUser) {
        currentUser = savedUser;
        document.getElementById("displayName").textContent = savedUser;
        loginDiv.style.display = "none";
        appDiv.style.display = "flex";
        initApp();
    }

    // [Lucky] Join button — registers user and shows the app
    document.getElementById("joinBtn").onclick = () => {
        const username = document.getElementById("usernameInput").value.trim();
        if (!username) return;
        currentUser = username;
        sessionStorage.setItem("sketchcord_user", username); // [Lucky] Persist login
        document.getElementById("displayName").textContent = username;
        loginDiv.style.display = "none";
        appDiv.style.display = "flex";
        initApp();
    };

    // [Lucky] Allow pressing Enter to join
    document.getElementById("usernameInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") document.getElementById("joinBtn").click();
    });

    function initApp() {
        const canvasSystem = setupCanvas(canvas);

        // [Lucky] Called when a new drawing message arrives via WebSocket
        const socket = setupSocket((message) => {
            addMessageToThread(message.username, message.strokes);
        }, (history) => {
            // [Lucky] Called on connect — renders saved message history
            history.forEach(msg => {
                addMessageToThread(msg.username, msg.strokes);
            });
        });

        function resizeCanvas() {
            canvas.width = canvas.clientWidth;
            canvas.height = canvas.clientWidth * 0.6;
        }

        window.addEventListener("resize", resizeCanvas);
        resizeCanvas();

        document.getElementById("clearBtn").onclick = () => {
            canvasSystem.clear();
            console.log("Canvas cleared");
        };

        document.getElementById("sendBtn").onclick = () => {
            const strokes = canvasSystem.getStrokes();
            if (strokes.length === 0) return; // [Lucky] Don't send empty drawings
            socket.send(currentUser, strokes);
            canvasSystem.clear();
        };
    }

    // [Lucky] Adds a drawing message with username label to the thread
    function addMessageToThread(username, strokes) {
        const wrapper = document.createElement("div");
        wrapper.className = "message-wrapper";

        const label = document.createElement("div");
        label.className = "message-label";
        label.textContent = username;

        const newCanvas = document.createElement("canvas");
        const newctx = newCanvas.getContext("2d");

        const threadWidth = thread.clientWidth - 20;
        const displayWidth = Math.min(600, threadWidth);
        const ratio = 400 / 600;
        newCanvas.width = displayWidth;
        newCanvas.height = displayWidth * ratio;

        renderStrokes(strokes, newctx);

        wrapper.appendChild(label);
        wrapper.appendChild(newCanvas);
        thread.appendChild(wrapper);
        thread.scrollTop = thread.scrollHeight;
    }
}

function renderStrokes(strokesData , ctx) { // Call to display received messages using strokes
    strokesData.forEach(stroke => {
        for (let i = 1; i < stroke.length; i++) {
            const prev = stroke[i-1];
            const curr = stroke[i];

            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.stroke();
        }
    });
}
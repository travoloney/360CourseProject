import { setupCanvas } from "./canvas.js";
import { setupSocket } from "./socket.js";

// Current logged-in username and color
let currentUser = null;
let currentColor = "#000000";

window.onload = () => {

    const loginDiv = document.getElementById("login");
    const appDiv = document.getElementById("app");
    const canvas = document.getElementById("drawingCanvas");
    const thread = document.getElementById("thread");

    // Auto-login if user was already logged in (survives page reloads)
    const savedUser = sessionStorage.getItem("sketchcord_user");
    const savedColor = sessionStorage.getItem("sketchcord_color");
    if (savedUser) {
        currentUser = savedUser;
        currentColor = savedColor || "#000000";
        document.getElementById("displayName").textContent = savedUser;
        document.getElementById("displayName").style.color = currentColor;
        loginDiv.style.display = "none";
        appDiv.style.display = "flex";
        initApp();
    }

    // Join button — registers user and shows the app
    document.getElementById("joinBtn").onclick = () => {
        const username = document.getElementById("usernameInput").value.trim();
        if (!username) return;
        currentUser = username;
        currentColor = document.getElementById("colorInput").value;
        sessionStorage.setItem("sketchcord_user", username);
        sessionStorage.setItem("sketchcord_color", currentColor);
        document.getElementById("displayName").textContent = username;
        document.getElementById("displayName").style.color = currentColor;
        loginDiv.style.display = "none";
        appDiv.style.display = "flex";
        initApp();
    };

    // Allow pressing Enter to join
    document.getElementById("usernameInput").addEventListener("keydown", (e) => {
        if (e.key === "Enter") document.getElementById("joinBtn").click();
    });

    function initApp() {
        const canvasSystem = setupCanvas(canvas);
        // Set the drawing color to match user's chosen color
        canvasSystem.setColor(currentColor);

        // Called when a new drawing message arrives via WebSocket
        const socket = setupSocket((message) => {
            addMessageToThread(message.username, message.strokes, message.color);
        }, (history) => {
            // Called on connect — renders saved message history
            history.forEach(msg => {
                addMessageToThread(msg.username, msg.strokes, msg.color);
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
            if (strokes.length === 0) return;
            // Send color along with username and strokes
            socket.send(currentUser, strokes, currentColor);
            canvasSystem.clear();
        };
    }

    // Adds a drawing message with colored username label to the thread
    function addMessageToThread(username, strokes, color) {
        const wrapper = document.createElement("div");
        wrapper.className = "message-wrapper";

        const label = document.createElement("div");
        label.className = "message-label";
        label.textContent = username;
        // Display username in their chosen color
        label.style.color = color || "#444";

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

function renderStrokes(strokesData, ctx) {
    strokesData.forEach(stroke => {
        // Support both new format {points, color} and old format [points]
        const points = stroke.points || stroke;
        const color = stroke.color || "#000000";
        for (let i = 1; i < points.length; i++) {
            const prev = points[i-1];
            const curr = points[i];
            ctx.lineWidth = 4;
            ctx.lineCap = "round";
            // Render each stroke in its original color
            ctx.strokeStyle = color;
            ctx.beginPath();
            ctx.moveTo(prev.x, prev.y);
            ctx.lineTo(curr.x, curr.y);
            ctx.stroke();
        }
    });
}
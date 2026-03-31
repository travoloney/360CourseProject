import { setupCanvas } from "./canvas.js";
import { setupSocket } from "./socket.js";

window.onload = () => {

    const canvas = document.getElementById("drawingCanvas"); // connect the drawing canvas in the html to be modified
    const canvasSystem = setupCanvas(canvas); // intitializes and adds event listeners to the canvas

    const thread = document.getElementById("thread"); // connect the thread to html thread object

    const socket = setupSocket((receivedStrokes) => { // initialize a web socket
        const newCanvas = document.createElement("canvas"); // new canvas object to display drawing
        const newctx = newCanvas.getContext("2d");

        // [Lucky] Dynamic size for received drawings — fits mobile screens
        const threadWidth = thread.clientWidth - 20;
        const displayWidth = Math.min(600, threadWidth);
        const ratio = 400 / 600;
        newCanvas.width = displayWidth;
        newCanvas.height = displayWidth * ratio;

        renderStrokes(receivedStrokes, newctx);

        thread.appendChild(newCanvas);
        thread.scrollTop = thread.scrollHeight;
    });

    document.getElementById("clearBtn").onclick = () => { // event for clicking the clear button.
        canvasSystem.clear();
        console.log("Canvas cleared");
    };

    document.getElementById("sendBtn").onclick = () => { // event for clicking the send button
        socket.send(canvasSystem.getStrokes());
        canvasSystem.clear();
    };
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
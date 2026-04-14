    // Creating a client web socket to connect to port 8080
// [Lucky] Updated to handle message history and username-tagged messages
export function setupSocket(onMessage, onHistory){

    // [Lucky] Use localhost for local testing, change to server IP for production
    const socket = new WebSocket("ws://localhost:8080");

    socket.onopen = () => {
        console.log("Connected to server!");
    };

    // [Lucky] Handle connection errors so they don't crash the app
    socket.onerror = (err) => {
        console.log("WebSocket error:", err);
    };

    socket.onclose = () => {
        console.log("WebSocket disconnected");
    };

    socket.onmessage = async (e) => {
        let text;

        if (e.data instanceof Blob) {
            text = await e.data.text();  // convert Blob → string
        } else {
            text = e.data;
        }

        console.log("Raw received:", text);

        try {
            const data = JSON.parse(text);

            // [Lucky] Handle history payload from server on connect
            if (data.type === "history") {
                if (onHistory) onHistory(data.messages);
                return;
            }

            // [Lucky] Handle regular drawing messages (must have username + strokes)
            if (data.username && data.strokes) {
                onMessage(data);
            }

        } catch (err) {
            console.log("Ignored non-JSON message:", text);
        }
    }

    return {
    // [Lucky] Send now includes username with strokes
    send: (username, strokes) => {
        if (socket.readyState === WebSocket.OPEN) {
            socket.send(JSON.stringify({ username, strokes }));
        } else {
            console.log("Socket not connected, message not sent");
        }
    }
    };
}
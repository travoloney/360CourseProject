    // Creating a client web socket to connect to port 8080
// [Lucky] Updated to handle message history and username-tagged messages
export function setupSocket(onMessage, onHistory){

    const socket = new WebSocket("ws://13.58.149.115:8080");

    socket.onopen = () => {
        console.log("Connected to server!");
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
                onHistory(data.messages);
                return;
            }

            onMessage(data);

        } catch (err) {
            console.log("Ignored non-JSON message:", text);
        }
    }

    return {
    // [Lucky] Send now includes username with strokes
    send: (username, strokes) => socket.send(JSON.stringify({ username, strokes }))
    };
}
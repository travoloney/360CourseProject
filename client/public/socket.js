    // Creating a client web socket to connect to port 8080
export function setupSocket(onMessage){

    const socket = new WebSocket("ws://13.58.149.115:8080");
    //const socket = new WebSocket("ws://localhost:8080");

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

            onMessage(data);
            // const receivedStrokes = JSON.parse(text);

            // const newCanvas = document.createElement("canvas");
            // const newctx = newCanvas.getContext("2d");

            // newCanvas.width = 600;
            // newCanvas.height = 400;

            // renderStrokes(receivedStrokes, newctx);

            // // append message to the thread
            // document.getElementById("thread").appendChild(newCanvas);
            // // thread scrolls to bottom
            // thread.scrollTop = thread.scrollHeight;

            // // clear the drawing pad after a message is sent.
            // ctx.clearRect(0, 0, canvas.width, canvas.height);
            // console.log("Canvas cleared");
            // strokes = [];

        } catch (err) {
            console.log("Ignored non-JSON message:", text);
        }
    }

    return {
    send: (data) => socket.send(JSON.stringify(data))
    };
}
    // Creating a client web socket to connect to port 8080
export function setupSocket(onMessage){

    // create a client socket to connect this IP address and port
    const socket = new WebSocket("ws://13.58.149.115:8080");
    //const socket = new WebSocket("ws://localhost:8080");

    // When the client connects log confirmation
    socket.onopen = () => {
        console.log("Connected to server!");
    };

    // When the socket recieves a message from the server
    socket.onmessage = async (e) => {
        let text;

        // different browsers might send a string or a blob we need a string
        if (e.data instanceof Blob) {
            text = await e.data.text();  // convert Blob → string
        } else {
            text = e.data;
        }

        console.log("Raw received:", text);

        // If the JSON is valid run the callback function 
        try {
            const data = JSON.parse(text);

            onMessage(data);

        } catch (err) {
            console.log("Ignored non-JSON message:", text);
        }
    }

    return {
    send: (data) => socket.send(JSON.stringify(data))
    };
}
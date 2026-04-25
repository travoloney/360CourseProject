
const ws = require("ws") // web socket

// Create a web socket server and listen at port 8080.
const wss = new ws.Server({port: 8080})

// When a client sends data log the data, next loop through every client
// and if the client is connected send them the data.
function messageHandle(data){ // message event
    console.log("Received: " , data.toString())
    wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN){
            client.send(data);
        }
    })
}

// a client has connected attach a message handle to the client.
// When a client sends a message run the message handler
function connectionHandle(ws){ // connection event
    console.log("Client Connected!")
    ws.on("message" , messageHandle)
}

// When a connection occurs run the connection handle event.
wss.on("connection" , connectionHandle) 


const ws = require("ws") // web socket

const wss = new ws.Server({port: 8080})

function messageHandle(data){ // message event
    console.log("Received: " , data.toString())
    wss.clients.forEach(client => {
        if (client.readyState === ws.OPEN){
            client.send(data);
        }
    })
}

function connectionHandle(ws){ // connection event
    console.log("Client Connected!")
    ws.on("message" , messageHandle)
}

wss.on("connection" , connectionHandle) 

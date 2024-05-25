const express = require("express");
const app = express();
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");

const server = http.createServer(app);
const io = new Server(server);

// Serve static files from the 'cliet' directory
app.use(express.static(path.join(__dirname, '..', 'client')));

let arr = [];
let playingArray = [];

io.on("connection", (socket) => {
    socket.on("find", (e) => {
        if (e.name != null) {
            arr.push(e.name);

            if (arr.length >= 2) {
                let p1obj = {
                    p1name: arr[0],
                    p1value: "X",
                    p1move: ""
                };
                let p2obj = {
                    p2name: arr[1],
                    p2value: "O",
                    p2move: ""
                };

                let obj = {
                    p1: p1obj,
                    p2: p2obj,
                    sum: 1
                };
                playingArray.push(obj);
                arr.splice(0, 2);
                io.emit("find", { allPlayers: playingArray });
            }
        }
    });

    socket.on("playing", (e) => {
        if (e.value == "X") {
            let objToChange = playingArray.find(obj => obj.p1.p1name === e.name);
            objToChange.p1.p1move = e.id;
            objToChange.sum++;
        } else if (e.value == "O") {
            let objToChange = playingArray.find(obj => obj.p2.p2name === e.name);
            objToChange.p2.p2move = e.id;
            objToChange.sum++;
        }
        io.emit("playing", { allPlayers: playingArray });
    });

    socket.on("gameOver", (e) => {
        playingArray = playingArray.filter(obj => obj.p1.p1name !== e.name);
        console.log(playingArray);
        console.log("lol");
    });
});

app.get("/", (req, res) => {
    const filePath = path.join(__dirname, '..', 'cliet', 'index.html');
    console.log(`Serving file from: ${filePath}`);
    res.sendFile(filePath, (err) => {
        if (err) {
            console.error(`Error serving file: ${err}`);
            res.status(500).send('Error serving the file');
        }
    });
});

server.listen(3000, () => {
    console.log("port connected to 3000");
});

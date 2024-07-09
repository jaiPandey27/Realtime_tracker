const express = require("express");
const http = require("http");
const socketio = require("socket.io");
const path = require("path");

const app = express();
const server = http.createServer(app);
const io = socketio(server);

app.use(express.static(path.join(__dirname, "public")));

app.set("view engine", "ejs");

app.get("/", (req, res) => {
    res.render("index");
});

io.on("connection", (socket) => {
    console.log("A user connected");

    socket.on("send-location", (data) => {
        console.log("Location received from socket ID", socket.id, ":", data);
        socket.broadcast.emit("receive-location", { id: socket.id, ...data });
    });

    socket.on("disconnect", () => {
        console.log("User disconnected");
        // Optionally, remove the marker of the disconnected user from the map
        socket.broadcast.emit("user-disconnected", socket.id);
    });
});

server.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
});

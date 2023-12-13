const express = require('express');
const THREE = require('three');
const fs = require("fs");
const path = require('path');

const app = express();
const server = require('http').createServer(app);
const io = require('socket.io')(server);

var roomCache = { "": 0 };
var lastUpdateCache = { "": 100 }
var playerRoomCache = {};
var roomPlayerCountCache = { "": 0 };

var playerPositionCache = []
var playerShootCache = []
var playerLeftCache = []

io.on('connection', (socket) => {
	console.log("New user")
	socket.join("qfhiehfiheahfijwdi9r3uru8u2uu2ue92eu9u");

	playerRoomCache[socket.id] = "";

	socket.on("joined", () => {
		console.log("New player connected " + socket.id)
	})

	socket.on("position", (data) => {
		//io.to(room).emit("position", data, room, rotation);
		playerPositionCache.push([data]);
	})

	socket.on("bullet", (data) => {
		//io.to(room).emit("bullet", data, room);
		playerShootCache.push([data]);
	})

	socket.on("playerHit", (shooter, personHit, personHitID, room) => {
		console.log(shooter)
		io.to(shooter).emit("playerHit", shooter, personHit, personHitID, room);
	})

	socket.on("playerHitByBullet", (shooter, personHit, room) => {
		console.log(shooter)
		io.to(shooter).emit("playerHitByBullet", shooter, personHit, room);
	})

	socket.on("roomChange", data => {
		newData = [];

		socket.join(data[0]);

		newData.push(data[0]);
		newData.push(data[1]);

		if (roomCache[data[0]] == null) {
			newData.push(data[2]);
			roomCache[data[0]] = data[2];
		}
		else {
			newData.push(roomCache[data[0]]);
		}

		if (roomPlayerCountCache[data[0]] == null) {
			roomPlayerCountCache[data[0]] = 0;
		}

		roomPlayerCountCache[data[0]] += 1;

		// Keep track of users in room

		if (lastUpdateCache[data[0]] == null) {
			lastUpdateCache[data[0]] = 0;
		}
		lastUpdateCache[data[0]] = lastUpdateCache[data[0]] + 1;
		playerRoomCache[socket.id] = data[0];

		io.to(data[0]).emit("roomChange", newData);
	});

	socket.on("disconnect", () => {
		//io.emit("leave", socket.id)
		playerLeftCache.push(socket.id)

		console.log("Player left: " + socket.id)

		let roomFound = playerRoomCache[socket.id];

		if (lastUpdateCache[roomFound] == null) {
			lastUpdateCache[roomFound] = 0;
		}

		lastUpdateCache[roomFound] = lastUpdateCache[roomFound] - 1;
		roomPlayerCountCache[roomFound] -= 1;

		if (lastUpdateCache[roomFound] < 1 || roomPlayerCountCache[roomFound] < 1) {
			// Remove room
			console.log("Room deleted: " + roomFound)
			lastUpdateCache[roomFound] = null;
			roomCache[roomFound] = null;
			console.log(roomCache)
			roomPlayerCountCache[roomFound] = null;
		}

	})
})

app.use(express.static(path.join(__dirname, '/public')));

app.get('/', (req, res) => {
	fs.readFile("/public/index.html", "utf8", (err, data) => {
		if (err) throw err;

		res.write(data)
		return res.end();
	})
});

app.get('/api/rooms', (req, res) => {
	res.send(roomPlayerCountCache);
	return res.end();
});

server.listen(3000);
console.log("Server Listening")

function emitMessages() {
	// Update all players on server

	for (var i = 0; i < playerPositionCache.length; i++) {
		io.to(playerPositionCache[i][0].roomID).emit("position", playerPositionCache[i][0]);
	}

	for (var i = 0; i < playerShootCache.length; i++) {
		io.to(playerShootCache[i][0].roomID).emit("bullet", playerShootCache[i][0]);
	}

	for (var i = 0; i < playerLeftCache.length; i++) {
		io.emit("leave", playerLeftCache[i]);
	}

	playerPositionCache = [];
	playerShootCache = [];
	playerLeftCache = [];
}

const gameTickLoop = setInterval(emitMessages, 40)
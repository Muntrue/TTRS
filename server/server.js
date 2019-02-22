const express = require("express");
const http    = require("http");
const app     = express();
const server  = http.createServer(app);
const io      = require("socket.io").listen(server);

server.listen(3000);

const gameState = {};

io.on("connection", function (socket) {
    new SocketConnection(socket);
});

class SocketConnection {

    /**
     * Constructor
     *
     * @param socket
     */
    constructor(socket) {
        this.socket    = socket;
        this.room      = socket.handshake.query.room;
        this.gameSpeed = 1000;

        this.socket.join(this.room);

        this.dev = new Dev();
        this.dev.log("User connected to room " + this.room);

        this.gameLoopObj = null;

        // Send user their session id
        io.to(this.socket.id).emit("receiveSessionId", socket.id);

        this.initEventListeners();
        this.initGamestateForRoom(this.room);
        this.gameLoop();
    }

    introduceGamePiece() {

        const piece = [
            [ [0, 0],[0, 0],[0, 0],[0, 2],[0, 0],[0, 2],[0, 0],[0, 0],[0, 0],[0, 0] ],
            [ [0, 0],[0, 0],[0, 0],[3, 2],[3, 2],[3, 2],[0, 0],[0, 0],[0, 0],[0, 0] ],
            [ [0, 0],[0, 0],[0, 0],[0,0],[3, 2],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0] ]
        ];

        let grid = gameState[this.room].grid;
        grid.splice(0, 3, ...piece);

        gameState[this.room].grid = grid;

    };

    updateGamePiece() {
        let pieceIndex = null;
        if (!gameState[this.room].grid) {
            return;
        }

        gameState[this.room].grid.forEach(function(row, index){
            row.forEach(function(cell){
                if(cell[1] === 2 && !pieceIndex) pieceIndex = index;
            });
        });

        gameState[this.room].grid.splice(0,0,[[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0],[0, 0]]);
        gameState[this.room].grid.pop();

    }

    initGamestateForRoom(room) {

        if (!gameState[room]) {
            gameState[room] = {
                players: {},
                grid: null
            };
        }

        gameState[room].players[this.socket.id] = new Player(gameState[room]);
    }

    gameLoop() {
        this.gameLoopObj = setInterval(() => {
            this.updateGamePiece();
            this.publishGameState();
        }, 500);
    }

    publishGameState() {
        io.to(this.room).emit("receiveGamestate", gameState[this.room]);
    }

    /**
     * Initialize various event listeners
     */
    initEventListeners() {
        this.socket.on("disconnect", () => {
            this.disconnect();
        });

        this.socket.on("forceDisconnect", () => {
            this.disconnect();
        });

        this.socket.on("setPlayerReady", () => {
            gameState[this.room].players[this.socket.id].ready = true;
        });

        this.socket.on("startGame", () => {
            this.dev.log("Game started");

            gameState[this.room].grid = this.initGrid();
            this.introduceGamePiece();
        });
    }

    /**
     * Disconnect the socket
     */
    disconnect() {
        this.dev.log("Disconnected");
        this.socket.disconnect();
        clearInterval(this.gameLoopObj);
    }

    /**
     * Init a new grid
     *
     * @returns {Array}
     */
    initGrid() {
        const grid        = [];
        const fieldWidth  = 10;
        const fieldHeight = 20;

        for (let h = 0; h < fieldHeight; h++) {
            const row = [];
            for (let w = 0; w < fieldWidth; w++) {
                row.push([
                    0,
                    0
                ]);
            }
            grid.push(row);
        }

        return grid;
    }
}

class Player {
    constructor(room) {
        return {
            name: Object.keys(room.players).length === 0 ? "Player 1" : "Player 2",
            ready: false
        };
    }
}

class Dev {
    constructor() {
        this.enabled = true;
    }

    log(msg) {
        if (this.enabled) {
            console.log(msg);
        }
    }
}
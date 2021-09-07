const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")

const {
    initGame,
    gameLoop,
    moveLeft,
    moveRight,
    jump,
    createBullet,
    getState,
    createPlayer,
} = require("./game")

const {
    clientJoin,
    clientDisconnect,
    getClients,
    getPlayerState,
    getClientIndex,
} = require("./utils/clients")

const FRAME_RATE = require("./utils/constants")

const app = express()
const server = http.createServer(app)

const io = socketio(server, {
    cors: {
        origin: "*"
    }
})

app.use(express.static(path.join(__dirname, "/frontend")))

initGame()

let state = getState()

io.on("connection", socket => {
    console.log("A client has connected!")

    let player = createPlayer()
    const client = clientJoin(socket.id, player)

    socket.on("moveLeft", () => moveLeft(player))
    socket.on("moveRight", () => moveRight(player))
    socket.on("jump", () => jump(player))
    socket.on("createBullet", () => createBullet(player))

    socket.on("gameLoop", () => gameLoop())

    socket.on("setDark", () => {
        player.animationID = 2
    })
    socket.on("setWatermelon", () => {
        player.animationID = 0
    })
    socket.on("setTonno", () => {
        player.animationID = 1
    })

    socket.on("disconnect", () => {
        clientDisconnect(client.id)
        player.died = true
        console.log("A client has disconnected...")
    })

    startGameInterval()

    function startGameInterval() {
        const intervalId = setInterval(() => {
            gameLoop()
            io.emit("gameState", state)
        }, 100)
    }
})

const PORT = process.env.PORT || 3000

server.listen(PORT, () => console.log(`Server listening on port ${PORT}`))
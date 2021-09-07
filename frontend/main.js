var socket = io("https://blooming-atoll-58157.herokuapp.com/")

let canvas, ctx

const GAME_WIDTH = 700
const GAME_HEIGHT = 700

let keysPressed = []
let isPressing = false

const lavaImg = document.getElementById("lava")
const platformImg = document.getElementById("platform")
const darkSkin = document.getElementById("dark")
const bulletLeftImg = document.getElementById("bullet-left")
const bulletRightImg = document.getElementById("bullet-right")
const tonnoSkin = document.getElementById("tonno")
const watermelonSkin = document.getElementById("watermelon")
const cloudImg = document.getElementById("cloud")

const skins = [watermelonSkin, tonnoSkin, darkSkin]

const shootButtonImg = document.getElementById("shoot-btn")
const leftButtonImg = document.getElementById("left-btn")
const rightButtonImg = document.getElementById("right-btn")
const jumpButtonImg = document.getElementById("jump-btn")

const setTonno = document.getElementById("setTonno")
const setWatermelon = document.getElementById("setWatermelon")
const setDark = document.getElementById("setDark")

setTonno.onclick = () => {
    socket.emit("setTonno")
    console.log("animation set to tonno!")
}
setWatermelon.onclick = () => {
    socket.emit("setWatermelon")
}
setDark.onclick = () => {
    socket.emit("setDark")
}

function init() {
    canvas = document.getElementById("canvas")
    ctx = canvas.getContext("2d")

    canvas.width = GAME_WIDTH
    canvas.height = GAME_HEIGHT

    canvas.style.border = "3px solid black"

    window.addEventListener("keydown", handleKeyDown)
    window.addEventListener("keyup", handleKeyUp)
    window.addEventListener("mousedown", (event) => {
        const x = event.offsetX
        const y = event.offsetY
        if (buttonPressed(x, y, mobileControls.leftButton)) {
            socket.emit("moveLeft")
        } else if (buttonPressed(x, y, mobileControls.rightButton)) {
            socket.emit("moveRight")
        } else if (buttonPressed(x, y, mobileControls.jumpButton)) {
            socket.emit("jump")
        } else if (buttonPressed(x, y, mobileControls.shootButton)) {
            socket.emit("createBullet")
        }
    })

    renderGameState()
}

const scaleUI = 80
const offsetUI = 7

const mobileControls = {
    leftButton: {
        scale: {
            width: scaleUI,
            height: scaleUI
        },
        position: {
            x: offsetUI,
            y: GAME_HEIGHT - scaleUI - offsetUI
        }
    },
    rightButton: {
        scale: {
            width: scaleUI,
            height: scaleUI
        },
        position: {
            x: offsetUI * 2 + scaleUI,
            y: GAME_HEIGHT - scaleUI - offsetUI
        }
    },
    shootButton: {
        scale: {
            width: scaleUI,
            height: scaleUI
        },
        position: {
            x: GAME_WIDTH - offsetUI - scaleUI + 5,
            y: GAME_HEIGHT - scaleUI - offsetUI
        }
    },
    jumpButton: {
        scale: {
            width: scaleUI,
            height: scaleUI
        },
        position: {
            x: GAME_WIDTH - (offsetUI * 2) - (scaleUI * 2),
            y: GAME_HEIGHT - scaleUI - offsetUI
        }
    }
}

function isMobile() {
    const toMatch = [
        /Android/i,
        /webOS/i,
        /iPhone/i,
        /iPad/i,
        /iPod/i,
        /BlackBerry/i,
        /Windows Phone/i
    ]

    return toMatch.some((toMatchItem) => {
        return navigator.userAgent.match(toMatchItem)
    })
}

function handleKeyDown(event) {
    if (event.keyCode === 32) {
        socket.emit("jump")
    }
    if (!keysPressed.includes(event.keyCode)) {
        keysPressed.push(event.keyCode)
    }
}

function handleKeyUp(event) {
    const keyIndex = keysPressed.indexOf(event.keyCode)
    keysPressed.splice(keyIndex, 1)
}

function buttonPressed(x, y, button) {
    const topOfButton = button.position.y
    const bottomOfButton = button.position.y + button.scale.height
    const leftSideOfButton = button.position.x
    const rightSideOfButton = button.position.y

    if (x >= leftSideOfButton && x <= rightSideOfButton && y >= topOfButton && y <= bottomOfButton) {
        return true
    }
    return false
}

function checkInputs() {
    if (keysPressed.includes(37)) socket.emit("moveLeft")
    if (keysPressed.includes(39)) socket.emit("moveRight")
    if (keysPressed.includes(81) && !isPressing) {
        socket.emit("createBullet")
        isPressing = true
    }
    if (!keysPressed.includes(81)) {
        isPressing = false
    }
}

function renderGameState() {
    socket.emit("gameLoop")
    checkInputs()

    socket.emit("getGameState")

    socket.on("gameState", (state) => {
        ctx.clearRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

        ctx.fillStyle = "lightblue"
        ctx.fillRect(0, 0, GAME_WIDTH, GAME_HEIGHT)

        state.clouds.forEach(cloud => {
            ctx.drawImage(cloudImg, cloud.position.x, cloud.position.y, cloud.scale.width, cloud.scale.height)
        })

        state.players.forEach(player => {
            ctx.drawImage(skins[player.animationID], player.position.x, player.position.y, player.scale.width, player.scale.height)

            player.bullets.forEach(bullet => {
                if (player.direction === "left") {
                    ctx.drawImage(bulletLeftImg, bullet.position.x, bullet.position.y, bullet.scale.width, bullet.scale.height)
                } else {
                    ctx.drawImage(bulletRightImg, bullet.position.x, bullet.position.y, bullet.scale.width, bullet.scale.height)
                }
            })
        })

        state.platforms.forEach(platform => {
            ctx.drawImage(platformImg, platform.position.x, platform.position.y, platform.scale.width, platform.scale.height)
        })

        const lava = state.lava
        ctx.drawImage(lavaImg, lava.position.x, lava.position.y, lava.scale.width, lava.scale.height)

        if (isMobile()) {
            const leftButton = mobileControls.leftButton
            const rightButton = mobileControls.rightButton
            const jumpButton = mobileControls.jumpButton
            const shootButton = mobileControls.shootButton

            ctx.drawImage(leftButtonImg, leftButton.position.x, leftButton.position.y, leftButton.scale.width, leftButton.scale.height)
            ctx.drawImage(rightButtonImg, rightButton.position.x, rightButton.position.y, rightButton.scale.width, rightButton.scale.height)
            ctx.drawImage(jumpButtonImg, jumpButton.position.x, jumpButton.position.y, jumpButton.scale.width, jumpButton.scale.height)
            ctx.drawImage(shootButtonImg, shootButton.position.x, shootButton.position.y, shootButton.scale.width, shootButton.scale.height)
        }
    })

    requestAnimationFrame(renderGameState)
}

init()
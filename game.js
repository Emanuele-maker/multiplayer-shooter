const { GAME_WIDTH, GAME_HEIGHT } = require("./utils/constants")

let state

function initGame() {
    state = createGameState()
    createMap()
}

function getState() {
    return state
}

function createMap() {
    const platforms = state.platforms
    const lavaHeight = state.lava.scale.height
    const platformWidth = 100
    const platformHeight = 27
    const cloudWidth = 120
    const cloudHeight = 40

    for (let i = 0; i < 12; i++) {
        platforms.push({
            scale: {
                width: platformWidth,
                height: platformHeight
            },
            position: {
                x: Math.floor(Math.random() * (GAME_WIDTH - platformWidth)),
                y: Math.floor(Math.floor(Math.random() * (GAME_HEIGHT - lavaHeight)))
            }
        })
    }

    for (let i = 0; i < 8; i++) {
        state.clouds.push({
            scale: {
                width: cloudWidth,
                height: cloudHeight
            },
            position: {
                x: Math.floor(Math.random() * (GAME_WIDTH - cloudWidth)),
                y: Math.floor(Math.random() * (GAME_HEIGHT - (lavaHeight * 2)))
            }
        })
    }
}

function createPlayer() {
    const randomPlatform = state.platforms[Math.floor(Math.random() * state.platforms.length)]
    const player = {
        scale: {
            width: 55,
            height: 55
        },
        position: {
            x: randomPlatform.position.x,
            y: randomPlatform.position.y - 55
        },
        speed: {
            x: 0,
            y: 0
        },
        died: false,
        direction: "right",
        bullets: [],
        jumpCount: 0,
        isJumping: false,
        animationID: 0
    }

    state.players.push(player)

    return player
}

function moveLeft(player) {
    if (player) {
        player.speed.x = -4
        player.direction = "left"
    }
}

function moveRight(player) {
    if (player) {
        player.speed.x = 4
        player.direction = "right"
    }
}

function jump(player) {
    if (player) {
        if (player.jumpCount >= 2) return
        player.speed.y -= 50
        player.isJumping = true
        player.jumpCount++
    }
}

function createBullet(player) {
    if (player.direction === "right") {
        player.bullets.push({
            scale: {
                width: 25,
                height: 14
            },
            position: {
                x: player.position.x + player.scale.width,
                y: player.position.y + (player.scale.height / 2)
            },
            speed: 7,
            died: false
        })
    } else {
        player.bullets.push({
            scale: {
                width: 17,
                height: 15
            },
            position: {
                x: player.position.x - 17,
                y: player.position.y + (player.scale.height / 2)
            },
            speed: -7,
            died: false
        })
    }
}

function detectCollisionInPlayerPlatform(player, platform) {
    const topOfPlayer = player.position.y
    const bottomOfPlayer = player.position.y + player.scale.height
    const leftSideOfPlayer = player.position.x
    const rightSideOfPlayer = player.position.x + player.scale.width

    const topOfPlatform = platform.position.y
    const bottomOfPlatform = platform.position.y + platform.scale.height
    const leftSideOfPlatform = platform.position.x
    const rightSideOfPlatform = platform.position.x + platform.scale.width

    if (bottomOfPlayer >= topOfPlatform && bottomOfPlayer <= bottomOfPlatform && leftSideOfPlayer >= leftSideOfPlatform - 30 && leftSideOfPlayer <= rightSideOfPlatform) {
        return true
    }
    return false
}

function detectCollisionInPlayerBullet(player, bullet) {
    const topOfPlayer = player.position.y
    const bottomOfPlayer = player.position.y + player.scale.height
    const leftSideOfPlayer = player.position.x
    const rightSideOfPlayer = player.position.x + player.scale.width

    const topOfBullet = bullet.position.y
    const bottomOfBullet = bullet.position.y + bullet.scale.height
    const leftSideOfBullet = bullet.position.x
    const rightSideOfBullet = bullet.position.x + bullet.scale.width

    if (rightSideOfBullet >= leftSideOfPlayer && rightSideOfBullet <= rightSideOfPlayer && topOfBullet >= topOfPlayer && topOfBullet <= bottomOfPlayer) {
        return true
    }
    if (leftSideOfBullet <= rightSideOfPlayer && leftSideOfBullet >= leftSideOfPlayer && topOfBullet >= topOfPlayer && topOfBullet <= bottomOfPlayer) {
        return true
    }
    if (bottomOfBullet >= topOfPlayer && bottomOfBullet <= bottomOfPlayer && leftSideOfBullet >= leftSideOfPlayer && leftSideOfBullet <= rightSideOfPlayer) {
        return true
    }
    if (topOfBullet <= bottomOfPlayer && topOfBullet >= topOfPlayer && leftSideOfBullet >= leftSideOfPlayer && leftSideOfBullet <= rightSideOfPlayer) {
        return true
    }
    return false
}

function gameLoop() {
    state.players = state.players.filter(player => player.died === false)

    state.players.forEach(player => {
        if (player) {
            player.bullets = player.bullets.filter(bullet => bullet.died === false)
            player.speed.y += 2

            player.position.x += player.speed.x
            player.position.y += player.speed.y

            player.speed.x *= 0.9
            player.speed.y *= 0.9

            if (player.position.x <= -player.scale.width) {
                player.position.x = GAME_WIDTH
            }
            if (player.position.x >= GAME_WIDTH + player.scale.width) {
                player.position.x = player.scale.width
            }

            state.platforms.forEach(platform => {
                if (detectCollisionInPlayerPlatform(player, platform)) {
                    player.position.y = platform.position.y - player.scale.height
                    player.isJumping = false
                    player.jumpCount = 0
                }
            })

            if (detectCollisionInPlayerPlatform(player, state.lava) || player.position.y > GAME_HEIGHT) {
                player.died = true
            }

            player.bullets.forEach(bullet => {
                bullet.position.x += bullet.speed

                if (bullet.position.x <= 0 || bullet.position.x >= GAME_WIDTH) {
                    bullet.died = true
                }

                state.players.forEach(obj => {
                    if (detectCollisionInPlayerBullet(obj, bullet) && obj !== player) {
                        obj.died = true
                        bullet.died = true
                    }
                })
            })
        }
    })
}

function createGameState() {
    return {
        players: [],
        platforms: [],
        clouds: [],
        lava: {
            scale: {
                width: GAME_WIDTH,
                height: 50
            },
            position: {
                x: 0,
                y: GAME_HEIGHT - 50
            }
        }
    }
}

module.exports = {
    getState,
    initGame,
    gameLoop,
    moveLeft,
    moveRight,
    jump,
    createBullet,
    createPlayer
}
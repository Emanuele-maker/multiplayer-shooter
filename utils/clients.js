const clients = []

function clientJoin(id, playerState) {
    const client = {
        id: id,
        playerState: playerState
    }
    clients.push(client)

    return client
}

function getClients() {
    return clients
}

function clientDisconnect(id) {
    const clientIndex = getClientIndex(id)
    return clients.splice(clientIndex, 1)
}

function getClientIndex(id) {
    return clients.indexOf(clients.find(client => client.id === id))
}

function getPlayerState(id) {
    const check = clients.find(client => client.id === id).playerState
    if (check) {
        return check.playerState
    }
}


module.exports = {
    clientJoin,
    clientDisconnect,
    getClients,
    getPlayerState,
    getClientIndex,
}
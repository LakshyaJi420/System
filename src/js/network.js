class NetworkManager {
    constructor(game) {
        this.game = game;
        this.socket = null;
        this.isConnected = false;
        this.latency = 0;
        this.lastPing = 0;
        this.roomCode = null;
        this.players = new Map();

        this.messageHandlers = {
            'gameState': this.handleGameState.bind(this),
            'playerJoined': this.handlePlayerJoined.bind(this),
            'playerLeft': this.handlePlayerLeft.bind(this),
            'territoryUpdate': this.handleTerritoryUpdate.bind(this),
            'chat': this.handleChat.bind(this)
        };
    }

    connect() {
        return new Promise((resolve, reject) => {
            try {
                // For now, simulate P2P connection
                this.isConnected = true;
                this.startPingInterval();
                resolve(true);
            } catch (error) {
                console.error('Connection error:', error);
                reject(error);
            }
        });
    }

    createRoom() {
        this.roomCode = Utils.generateId();
        return this.roomCode;
    }

    joinRoom(roomCode) {
        this.roomCode = roomCode;
        return true;
    }

    sendUpdate(data) {
        if (!this.isConnected) return;
        
        // Simulate sending data to other players
        this.game.processUpdate(data);
    }

    sendChat(message) {
        if (!this.isConnected) return;

        const chatMessage = {
            type: 'chat',
            sender: this.game.currentPlayer.username,
            message: message,
            timestamp: new Date().toISOString()
        };

        this.game.ui.chat.addMessage(chatMessage);
    }

    startPingInterval() {
        setInterval(() => {
            this.lastPing = Date.now();
            // Simulate ping
            setTimeout(() => {
                this.latency = Date.now() - this.lastPing;
            }, Math.random() * 50);
        }, CONFIG.NETWORK.LATENCY_CHECK_INTERVAL);
    }

    handleGameState(data) {
        this.game.setState(data);
    }

    handlePlayerJoined(data) {
        this.players.set(data.id, data);
        this.game.addPlayer(data);
    }

    handlePlayerLeft(data) {
        this.players.delete(data.id);
        this.game.removePlayer(data.id);
    }

    handleTerritoryUpdate(data) {
        this.game.updateTerritory(data);
    }

    handleChat(data) {
        this.game.ui.chat.addMessage(data);
    }

    disconnect() {
        this.isConnected = false;
        this.players.clear();
        this.roomCode = null;
    }
}
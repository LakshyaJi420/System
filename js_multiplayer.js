class MultiplayerSystem {
    constructor(gameInstance) {
        this.game = gameInstance;
        this.db = firebase.database();
        this.currentRoom = null;
        this.playerRef = null;
        this.playersInRoom = new Map();
        this.messageQueue = [];
    }

    async createRoom() {
        try {
            const roomRef = this.db.ref('rooms').push();
            this.currentRoom = roomRef.key;
            
            await roomRef.set({
                created: firebase.database.ServerValue.TIMESTAMP,
                status: 'waiting',
                players: {}
            });

            this.joinRoom(this.currentRoom);
            return this.currentRoom;
        } catch (error) {
            console.error('Error creating room:', error);
            return null;
        }
    }

    async joinRoom(roomId) {
        if (this.currentRoom) {
            await this.leaveRoom();
        }

        this.currentRoom = roomId;
        this.playerRef = this.db.ref(`rooms/${roomId}/players`).push();

        await this.playerRef.set({
            username: this.game.currentUser.username,
            id: this.game.currentUser.id,
            lastActive: firebase.database.ServerValue.TIMESTAMP
        });

        this.setupRoomListeners();
    }

    async leaveRoom() {
        if (this.playerRef) {
            await this.playerRef.remove();
        }
        if (this.currentRoom) {
            // Remove room if empty
            const roomRef = this.db.ref(`rooms/${this.currentRoom}`);
            const snapshot = await roomRef.child('players').once('value');
            if (!snapshot.exists()) {
                await roomRef.remove();
            }
        }
        this.currentRoom = null;
        this.playerRef = null;
    }

    setupRoomListeners() {
        const roomRef = this.db.ref(`rooms/${this.currentRoom}`);

        roomRef.child('players').on('child_added', (snapshot) => {
            const player = snapshot.val();
            this.playersInRoom.set(snapshot.key, player);
            this.updatePlayerList();
        });

        roomRef.child('players').on('child_removed', (snapshot) => {
            this.playersInRoom.delete(snapshot.key);
            this.updatePlayerList();
        });

        roomRef.child('moves').on('child_added', (snapshot) => {
            const move = snapshot.val();
            if (move.playerId !== this.game.currentUser.id) {
                this.game.processMove(move);
            }
        });

        roomRef.child('chat').on('child_added', (snapshot) => {
            const message = snapshot.val();
            this.addChatMessage(message);
        });
    }

    emitMove(x, y) {
        if (!this.currentRoom) return;

        this.db.ref(`rooms/${this.currentRoom}/moves`).push({
            playerId: this.game.currentUser.id,
            x: x,
            y: y,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }

    sendChatMessage(message) {
        if (!this.currentRoom) return;

        this.db.ref(`rooms/${this.currentRoom}/chat`).push({
            sender: this.game.currentUser.username,
            message: message,
            timestamp: firebase.database.ServerValue.TIMESTAMP
        });
    }

    addChatMessage(message) {
        this.messageQueue.unshift(message);
        if (this.messageQueue.length > 10) {
            this.messageQueue.pop();
        }
        this.updateChat();
    }

    updateChat() {
        const chatContainer = document.getElementById('chat-messages');
        chatContainer.innerHTML = '';
        
        this.messageQueue.forEach(message => {
            const messageElement = document.createElement('div');
            messageElement.classList.add('chat-message');
            messageElement.innerHTML = `
                <span class="chat-sender">${message.sender}:</span>
                <span class="chat-text">${message.message}</span>
            `;
            chatContainer.appendChild(messageElement);
        });
    }

    updatePlayerList() {
        if (window.gameUI) {
            window.gameUI.updatePlayerCount(this.playersInRoom.size);
        }
    }
}
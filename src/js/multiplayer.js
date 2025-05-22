class MultiplayerSystem {
    constructor(game) {
        this.game = game;
        this.connection = null;
        this.peerId = null;
        this.peers = new Map();
        this.dataChannel = null;
    }

    async createGame() {
        try {
            this.peerId = Math.random().toString(36).substr(2, 9);
            
            // Create WebRTC connection
            this.connection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            // Create data channel
            this.dataChannel = this.connection.createDataChannel('gameData');
            this.setupDataChannel(this.dataChannel);

            // Create offer
            const offer = await this.connection.createOffer();
            await this.connection.setLocalDescription(offer);

            // Generate connection code
            const connectionCode = btoa(JSON.stringify({
                offer: offer,
                peerId: this.peerId
            }));

            return connectionCode;
        } catch (error) {
            console.error('Error creating game:', error);
            return null;
        }
    }

    async joinGame(connectionCode) {
        try {
            const { offer, peerId } = JSON.parse(atob(connectionCode));

            this.connection = new RTCPeerConnection({
                iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
            });

            // Handle data channel
            this.connection.ondatachannel = (event) => {
                this.dataChannel = event.channel;
                this.setupDataChannel(this.dataChannel);
            };

            // Set remote description
            await this.connection.setRemoteDescription(offer);

            // Create and send answer
            const answer = await this.connection.createAnswer();
            await this.connection.setLocalDescription(answer);

            return true;
        } catch (error) {
            console.error('Error joining game:', error);
            return false;
        }
    }

    setupDataChannel(channel) {
        channel.onmessage = (event) => {
            const data = JSON.parse(event.data);
            this.handleGameData(data);
        };

        channel.onopen = () => {
            console.log('Data channel opened');
            this.sendPlayerInfo();
        };

        channel.onclose = () => {
            console.log('Data channel closed');
        };
    }

    handleGameData(data) {
        switch (data.type) {
            case 'move':
                this.game.processMove(data.x, data.y);
                break;
            case 'chat':
                if (window.gameUI) {
                    window.gameUI.addChatMessage(data.sender, data.message);
                }
                break;
            case 'player':
                this.peers.set(data.id, data);
                if (window.gameUI) {
                    window.gameUI.updatePlayerCount(this.peers.size + 1);
                }
                break;
        }
    }

    sendMove(x, y) {
        this.sendData({
            type: 'move',
            x: x,
            y: y
        });
    }

    sendChat(message) {
        this.sendData({
            type: 'chat',
            sender: this.game.currentPlayer.username,
            message: message
        });
    }

    sendPlayerInfo() {
        this.sendData({
            type: 'player',
            id: this.game.currentPlayer.username,
            color: this.game.currentPlayer.color
        });
    }

    sendData(data) {
        if (this.dataChannel && this.dataChannel.readyState === 'open') {
            this.dataChannel.send(JSON.stringify(data));
        }
    }

    disconnect() {
        if (this.dataChannel) {
            this.dataChannel.close();
        }
        if (this.connection) {
            this.connection.close();
        }
        this.connection = null;
        this.dataChannel = null;
        this.peers.clear();
    }
}

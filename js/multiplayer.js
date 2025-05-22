class MultiplayerSystem {
    constructor(game) {
        this.game = game;
        this.connection = null;
        this.peerId = null;
        this.peers = new Map();
    }

    async createGame() {
        // Generate a unique room code
        this.peerId = Math.random().toString(36).substring(2, 8);
        
        // Create a new WebRTC connection
        this.connection = new RTCPeerConnection({
            iceServers: [
                { urls: 'stun:stun.l.google.com:19302' }
            ]
        });
        
        this.setupConnectionHandlers();
        
        // Create and show connection details
        const offer = await this.connection.createOffer();
        await this.connection.setLocalDescription(offer);
        
        return this.peerId;
    }

    async joinGame(connectionCode) {
        try {
            // Create a new WebRTC connection
            this.connection = new RTCPeerConnection({
                iceServers: [
                    { urls: 'stun:stun.l.google.com:19302' }
                ]
            });
            
            this.setupConnectionHandlers();
            
            // Set up the connection using the provided code
            const offer = JSON.parse(atob(connectionCode));
            await this.connection.setRemoteDescription(offer);
            
            const answer = await this.connection.createAnswer();
            await this.connection.setLocalDescription(answer);
            
            return true;
        } catch (error) {
            console.error('Failed to join game:', error);
            return false;
        }
    }

    setupConnectionHandlers() {
        // Handle incoming data
        this.connection.ondatachannel = (event) => {
            const channel = event.channel;
            channel.onmessage = (e) => this.handleMessage(JSON.parse(e.data));
        };

        // Handle connection state changes
        this.connection.onconnectionstatechange = () => {
            if (this.connection.connectionState === 'connected') {
                console.log('Connected to peer');
            }
        };
    }

    handleMessage(data) {
        switch (data.type) {
            case 'move':
                this.game.processMove(data.x, data.y);
                break;
            case 'join':
                this.peers.set(data.username, {
                    username: data.username,
                    color: data.color
                });
                break;
        }
    }

    sendMove(x, y) {
        if (this.connection && this.connection.connectionState === 'connected') {
            const data = {
                type: 'move',
                x: x,
                y: y
            };
            this.sendData(data);
        }
    }

    sendData(data) {
        if (this.connection && this.connection.connectionState === 'connected') {
            const channel = this.connection.createDataChannel('gameData');
            channel.onopen = () => {
                channel.send(JSON.stringify(data));
            };
        }
    }

    disconnect() {
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        this.peers.clear();
    }
}
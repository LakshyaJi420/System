class GameUI {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Menu buttons
        document.getElementById('play-multiplayer').addEventListener('click', () => this.startMultiplayerGame());
        document.getElementById('play-singleplayer').addEventListener('click', () => this.startSinglePlayerGame());
        document.getElementById('create-private').addEventListener('click', () => this.createPrivateGame());
        document.getElementById('share-button').addEventListener('click', () => this.shareGame());
        document.getElementById('exit-game').addEventListener('click', () => this.exitGame());
        
        // Chat
        document.getElementById('send-message').addEventListener('click', () => this.sendChatMessage());
        document.getElementById('chat-input').addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.sendChatMessage();
            }
        });
    }

    startMultiplayerGame() {
        this.hideMenu();
        this.showGameUI();
        this.showChat();
        this.game.startGame('multi');
    }

    startSinglePlayerGame() {
        this.hideMenu();
        this.showGameUI();
        this.hideChat();
        this.game.startGame('single');
    }

    async createPrivateGame() {
        const roomId = await this.game.multiplayerSystem.createRoom();
        if (roomId) {
            this.copyToClipboard(`${window.location.origin}?room=${roomId}`);
            alert('Room created! Link copied to clipboard.');
            this.startMultiplayerGame();
        } else {
            alert('Failed to create private game');
        }
    }

    shareGame() {
        const shareUrl = window.location.href;
        if (navigator.share) {
            navigator.share({
                title: 'Territory Game',
                url: shareUrl
            });
        } else {
            this.copyToClipboard(shareUrl);
            alert('Game link copied to clipboard!');
        }
    }

    copyToClipboard(text) {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
    }

    exitGame() {
        if (confirm('Are you sure you want to exit the game?')) {
            if (this.game.isMultiplayer && this.game.multiplayerSystem) {
                this.game.multiplayerSystem.leaveRoom();
            }
            this.hideGameUI();
            this.hideChat();
            this.showMenu();
            this.game.endGame();
        }
    }

    sendChatMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();
        
        if (message && this.game.multiplayerSystem) {
            this.game.multiplayerSystem.sendChatMessage(message);
            input.value = '';
        }
    }

    updatePlayerCount(count) {
        document.getElementById('player-count').textContent = `Players: ${count}`;
    }

    updateTerritorySize(size) {
        document.getElementById('territory-size').textContent = `Territory: ${size}%`;
    }

    showGameEnd(winner) {
        const modal = document.createElement('div');
        modal.classList.add('modal');
        modal.innerHTML = `
            <div class="modal-content">
                <h2>${winner === 'player' ? 'You Won!' : 'Game Over'}</h2>
                <p>${winner === 'player' ? 'Congratulations!' : `Winner: ${winner}`}</p>
                <button onclick="window.gameUI.exitGame()">Return to Menu</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    hideMenu() {
        document.getElementById('game-menu').classList.add('hidden');
    }

    showMenu() {
        document.getElementById('game-menu').classList.remove('hidden');
    }

    showGameUI() {
        document.getElementById('game-ui').classList.remove('hidden');
    }

    hideGameUI() {
        document.getElementById('game-ui').classList.add('hidden');
    }

    showChat() {
        document.getElementById('chat-container').classList.remove('hidden');
    }

    hideChat() {
        document.getElementById('chat-container').classList.add('hidden');
    }
}
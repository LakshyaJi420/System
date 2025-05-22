class GameUI {
    constructor(game) {
        this.game = game;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Username modal
        document.getElementById('start-game').addEventListener('click', () => this.handleUsernameSubmit());
        
        // Menu buttons
        document.getElementById('play-local').addEventListener('click', () => this.startSinglePlayerGame());
        document.getElementById('create-game').addEventListener('click', () => this.createMultiplayerGame());
        document.getElementById('join-game').addEventListener('click', () => this.showJoinGame());
        document.getElementById('share-button').addEventListener('click', () => this.shareGame());
        document.getElementById('exit-game').addEventListener('click', () => this.exitGame());
        
        // Connection modal
        document.getElementById('connect-button').addEventListener('click', () => this.joinMultiplayerGame());
    }

    handleUsernameSubmit() {
        const username = document.getElementById('username').value.trim();
        if (username) {
            this.game.setCurrentPlayer(username);
            this.hideUsernameModal();
            this.showMenu();
        } else {
            alert('Please enter a username');
        }
    }

    startSinglePlayerGame() {
        this.hideMenu();
        this.showGameUI();
        this.game.startGame('single');
    }

    async createMultiplayerGame() {
        this.hideMenu();
        const connectionCode = await window.multiplayerSystem.createGame();
        this.showConnectionModal(`Your game code: ${connectionCode}\nShare this code with other players.`);
        this.game.startGame('multi');
    }

    showJoinGame() {
        this.hideMenu();
        this.showConnectionModal('Enter the game code to join:');
    }

    async joinMultiplayerGame() {
        const code = document.getElementById('connection-input').value.trim();
        if (code) {
            const success = await window.multiplayerSystem.joinGame(code);
            if (success) {
                this.hideConnectionModal();
                this.showGameUI();
                this.game.startGame('multi');
            } else {
                alert('Failed to join game. Please check the code and try again.');
            }
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
            if (this.game.isMultiplayer) {
                window.multiplayerSystem.disconnect();
            }
            this.hideGameUI();
            this.showMenu();
            this.game.endGame();
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
                <h2>${winner === this.game.currentPlayer.username ? 'You Won!' : 'Game Over'}</h2>
                <p>${winner === this.game.currentPlayer.username ? 'Congratulations!' : `Winner: ${winner}`}</p>
                <button onclick="window.gameUI.exitGame()">Return to Menu</button>
            </div>
        `;
        document.body.appendChild(modal);
    }

    hideUsernameModal() {
        document.getElementById('username-modal').classList.add('hidden');
    }

    showMenu() {
        document.getElementById('game-menu').classList.remove('hidden');
    }

    hideMenu() {
        document.getElementById('game-menu').classList.add('hidden');
    }

    showGameUI() {
        document.getElementById('game-ui').classList.remove('hidden');
    }

    hideGameUI() {
        document.getElementById('game-ui').classList.add('hidden');
    }

    showConnectionModal(message) {
        const modal = document.getElementById('connection-modal');
        document.getElementById('connection-details').textContent = message;
        modal.classList.remove('hidden');
    }

    hideConnectionModal() {
        document.getElementById('connection-modal').classList.add('hidden');
    }
}
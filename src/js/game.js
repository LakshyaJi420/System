class TerritoryGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.players = new Map();
        this.territories = [];
        this.isMultiplayer = false;
        this.gameLoop = null;
        this.aiPlayers = [];
        this.currentPlayer = null;
        
        // Set canvas size to match window size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize input handling
        this.setupInputHandlers();
        
        // Load saved game state if it exists
        this.loadGameState();
    }

    resizeCanvas() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        this.gridSize = Math.min(this.canvas.width, this.canvas.height) / 50;
    }

    setupInputHandlers() {
        this.canvas.addEventListener('mousedown', (e) => this.handleClick(e));
        this.canvas.addEventListener('touchstart', (e) => this.handleTouch(e));
        this.canvas.addEventListener('mousemove', (e) => this.handleMouseMove(e));
    }

    setCurrentPlayer(username) {
        this.currentPlayer = {
            username: username,
            color: this.getRandomColor(),
            score: 0
        };
        this.saveGameState();
    }

    startGame(mode = 'single') {
        this.isMultiplayer = mode === 'multi';
        this.initializeGame();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    initializeGame() {
        // Clear existing game state
        this.territories = [];
        this.players.clear();
        
        // Add current player
        this.players.set(this.currentPlayer.username, this.currentPlayer);
        
        // Initialize grid-based territory
        const cols = Math.floor(this.canvas.width / this.gridSize);
        const rows = Math.floor(this.canvas.height / this.gridSize);
        
        for (let i = 0; i < rows; i++) {
            for (let j = 0; j < cols; j++) {
                this.territories.push({
                    x: j * this.gridSize,
                    y: i * this.gridSize,
                    owner: null,
                    color: '#ffffff'
                });
            }
        }

        // Add AI players in single player mode
        if (!this.isMultiplayer) {
            this.initializeAIPlayers();
        }
        
        this.saveGameState();
    }

    initializeAIPlayers() {
        const aiCount = 3;
        for (let i = 0; i < aiCount; i++) {
            const ai = {
                username: `AI-${i + 1}`,
                color: this.getRandomColor(),
                score: 0,
                difficulty: Math.random() * 0.5 + 0.5
            };
            this.aiPlayers.push(ai);
            this.players.set(ai.username, ai);
        }
    }

    update() {
        this.updateGame();
        this.render();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    updateGame() {
        if (!this.isMultiplayer) {
            this.updateAI();
        }
        this.updateScores();
        this.checkWinCondition();
        this.saveGameState();
    }

    updateAI() {
        this.aiPlayers.forEach(ai => {
            if (Math.random() < ai.difficulty) {
                this.makeAIMove(ai);
            }
        });
    }

    makeAIMove(ai) {
        const availableMoves = this.territories.filter(t => !t.owner);
        if (availableMoves.length > 0) {
            const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            move.owner = ai.username;
            move.color = ai.color;
        }
    }

    updateScores() {
        this.players.forEach(player => {
            player.score = this.territories.filter(t => t.owner === player.username).length;
        });
        
        if (window.gameUI) {
            window.gameUI.updateTerritorySize(
                Math.floor((this.currentPlayer.score / this.territories.length) * 100)
            );
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw territories
        this.territories.forEach(territory => {
            this.ctx.fillStyle = territory.color || '#ffffff';
            this.ctx.fillRect(territory.x, territory.y, this.gridSize - 1, this.gridSize - 1);
        });
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.processMove(x, y);
    }

    handleTouch(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.processMove(x, y);
    }

    processMove(x, y) {
        const col = Math.floor(x / this.gridSize);
        const row = Math.floor(y / this.gridSize);
        const index = row * Math.floor(this.canvas.width / this.gridSize) + col;
        
        if (this.territories[index] && !this.territories[index].owner) {
            this.territories[index].owner = this.currentPlayer.username;
            this.territories[index].color = this.currentPlayer.color;
            
            if (this.isMultiplayer && window.multiplayerSystem) {
                window.multiplayerSystem.sendMove(col, row);
            }
            
            this.saveGameState();
        }
    }

    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.territories.forEach(territory => {
            if (x >= territory.x && x < territory.x + this.gridSize &&
                y >= territory.y && y < territory.y + this.gridSize) {
                if (!territory.owner) {
                    this.canvas.style.cursor = 'pointer';
                } else {
                    this.canvas.style.cursor = 'default';
                }
            }
        });
    }

    checkWinCondition() {
        const totalTerritories = this.territories.length;
        const ownedTerritories = this.territories.filter(t => t.owner).length;
        
        if (ownedTerritories === totalTerritories) {
            const scores = new Map();
            this.territories.forEach(t => {
                if (t.owner) {
                    scores.set(t.owner, (scores.get(t.owner) || 0) + 1);
                }
            });
            
            const winner = Array.from(scores.entries()).reduce((a, b) => 
                a[1] > b[1] ? a : b
            );
            
            this.endGame(winner[0]);
        }
    }

    endGame(winner) {
        cancelAnimationFrame(this.gameLoop);
        this.saveGameState();
        if (window.gameUI) {
            window.gameUI.showGameEnd(winner);
        }
    }

    saveGameState() {
        const gameState = {
            territories: this.territories,
            players: Array.from(this.players.entries()),
            currentPlayer: this.currentPlayer,
            aiPlayers: this.aiPlayers
        };
        localStorage.setItem('territoryGameState', JSON.stringify(gameState));
    }

    loadGameState() {
        const savedState = localStorage.getItem('territoryGameState');
        if (savedState) {
            const gameState = JSON.parse(savedState);
            this.territories = gameState.territories;
            this.players = new Map(gameState.players);
            this.currentPlayer = gameState.currentPlayer;
            this.aiPlayers = gameState.aiPlayers;
        }
    }

    getRandomColor() {
        const letters = '0123456789ABCDEF';
        let color = '#';
        for (let i = 0; i < 6; i++) {
            color += letters[Math.floor(Math.random() * 16)];
        }
        return color;
    }
}
class TerritoryGame {
    constructor(canvas) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.players = new Map();
        this.territories = [];
        this.isMultiplayer = false;
        this.gameLoop = null;
        this.aiPlayers = [];
        
        // Set canvas size to match window size
        this.resizeCanvas();
        window.addEventListener('resize', () => this.resizeCanvas());
        
        // Initialize input handling
        this.setupInputHandlers();
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

    startGame(mode = 'single') {
        this.isMultiplayer = mode === 'multi';
        this.initializeGame();
        this.gameLoop = requestAnimationFrame(() => this.update());
    }

    initializeGame() {
        // Clear existing game state
        this.territories = [];
        this.players.clear();
        
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
    }

    initializeAIPlayers() {
        const aiCount = 3; // Default number of AI opponents
        for (let i = 0; i < aiCount; i++) {
            this.aiPlayers.push({
                id: `ai-${i}`,
                color: this.getRandomColor(),
                territory: [],
                difficulty: Math.random() * 0.5 + 0.5 // Random difficulty between 0.5 and 1
            });
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
        this.checkWinCondition();
    }

    updateAI() {
        this.aiPlayers.forEach(ai => {
            if (Math.random() < ai.difficulty) {
                this.makeAIMove(ai);
            }
        });
    }

    makeAIMove(ai) {
        // Simple AI strategy: expand from existing territory or claim new territory
        const availableMoves = this.territories.filter(t => !t.owner);
        if (availableMoves.length > 0) {
            const move = availableMoves[Math.floor(Math.random() * availableMoves.length)];
            move.owner = ai.id;
            move.color = ai.color;
        }
    }

    render() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw territories
        this.territories.forEach(territory => {
            this.ctx.fillStyle = territory.color;
            this.ctx.fillRect(territory.x, territory.y, this.gridSize - 1, this.gridSize - 1);
        });
    }

    handleClick(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        this.processPlayerMove(x, y);
    }

    handleTouch(e) {
        e.preventDefault();
        const rect = this.canvas.getBoundingClientRect();
        const touch = e.touches[0];
        const x = touch.clientX - rect.left;
        const y = touch.clientY - rect.top;
        this.processPlayerMove(x, y);
    }

    processPlayerMove(x, y) {
        const col = Math.floor(x / this.gridSize);
        const row = Math.floor(y / this.gridSize);
        const index = row * Math.floor(this.canvas.width / this.gridSize) + col;
        
        if (this.territories[index] && !this.territories[index].owner) {
            this.territories[index].owner = 'player';
            this.territories[index].color = this.players.get('player').color;
            
            if (this.isMultiplayer) {
                // Emit move to multiplayer system
                if (window.multiplayerSystem) {
                    window.multiplayerSystem.emitMove(col, row);
                }
            }
        }
    }

    handleMouseMove(e) {
        // Add hover effect for territory preview
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
            const winners = new Map();
            this.territories.forEach(t => {
                if (t.owner) {
                    winners.set(t.owner, (winners.get(t.owner) || 0) + 1);
                }
            });
            
            // Find player with most territory
            let winner = Array.from(winners.entries()).reduce((a, b) => 
                a[1] > b[1] ? a : b
            );
            
            this.endGame(winner[0]);
        }
    }

    endGame(winner) {
        cancelAnimationFrame(this.gameLoop);
        // Trigger end game UI
        if (window.gameUI) {
            window.gameUI.showGameEnd(winner);
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
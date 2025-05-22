class UI {
    constructor(game) {
        this.game = game;
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.minimapCanvas = document.createElement('canvas');
        this.minimapCtx = this.minimapCanvas.getContext('2d');
        this.menu = new Menu(this);
        this.chat = new Chat(this);
        
        this.setupEventListeners();
        this.resize();
    }

    setupEventListeners() {
        window.addEventListener('resize', this.resize.bind(this));
        this.canvas.addEventListener('click', this.handleClick.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));

        // Game controls
        document.getElementById('attack-btn').addEventListener('click', () => {
            this.game.setMode('attack');
        });
        document.getElementById('defend-btn').addEventListener('click', () => {
            this.game.setMode('defend');
        });
        document.getElementById('upgrade-btn').addEventListener('click', () => {
            this.game.setMode('upgrade');
        });
    }

    resize() {
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // Setup minimap
        this.minimapCanvas.width = CONFIG.UI.MINIMAP_SIZE;
        this.minimapCanvas.height = CONFIG.UI.MINIMAP_SIZE;
        document.getElementById('minimap').appendChild(this.minimapCanvas);
    }

    render() {
        this.clearScreen();
        this.renderWorld();
        this.renderPlayers();
        this.renderUI();
        this.renderMinimap();
    }

    clearScreen() {
        this.ctx.fillStyle = '#000000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    }

    renderWorld() {
        const camera = this.game.camera;
        const world = this.game.world;

        for (const territory of world.territories) {
            const screenX = (territory.x - camera.x) * camera.zoom;
            const screenY = (territory.y - camera.y) * camera.zoom;
            const screenSize = territory.size * camera.zoom;

            // Draw territory
            this.ctx.fillStyle = territory.color;
            this.ctx.fillRect(screenX, screenY, screenSize, screenSize);

            // Draw border
            this.ctx.strokeStyle = '#000000';
            this.ctx.lineWidth = 1;
            this.ctx.strokeRect(screenX, screenY, screenSize, screenSize);

            // Draw population if zoomed in enough
            if (camera.zoom > 0.5) {
                this.ctx.fillStyle = '#ffffff';
                this.ctx.font = '12px Arial';
                this.ctx.fillText(
                    Math.floor(territory.population),
                    screenX + 5,
                    screenY + 15
                );
            }
        }
    }

    renderPlayers() {
        const players = Array.from(this.game.players.values());
        players.sort((a, b) => b.score - a.score);

        // Update leaderboard
        const leaderboardContent = document.getElementById('leaderboard-content');
        leaderboardContent.innerHTML = players.map((player, index) => `
            <div class="leaderboard-item">
                <span>${index + 1}.</span>
                <span style="color: ${player.color}">${player.username}</span>
                <span>${Math.floor(player.score)}</span>
            </div>
        `).join('');
    }

    renderUI() {
        // Update stats
        const player = this.game.currentPlayer;
        if (player) {
            document.getElementById('territory-size').textContent = 
                `Territories: ${player.territories.size}`;
            document.getElementById('population').textContent = 
                `Population: ${Math.floor(player.totalPopulation)}`;
            document.getElementById('resources').textContent = 
                `Resources: ${Math.floor(player.totalResources)}`;
        }
    }

    renderMinimap() {
        const ctx = this.minimapCtx;
        const scale = CONFIG.UI.MINIMAP_SIZE / this.game.world.width;

        // Clear minimap
        ctx.fillStyle = '#000000';
        ctx.fillRect(0, 0, CONFIG.UI.MINIMAP_SIZE, CONFIG.UI.MINIMAP_SIZE);

        // Draw territories
        for (const territory of this.game.world.territories) {
            ctx.fillStyle = territory.color;
            ctx.fillRect(
                territory.x * scale,
                territory.y * scale,
                territory.size * scale,
                territory.size * scale
            );
        }

        // Draw viewport
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1;
        ctx.strokeRect(
            this.game.camera.x * scale,
            this.game.camera.y * scale,
            (this.canvas.width / this.game.camera.zoom) * scale,
            (this.canvas.height / this.game.camera.zoom) * scale
        );
    }

    handleClick(event) {
        const worldPos = this.screenToWorld(event.clientX, event.clientY);
        const territory = this.game.world.getTerritoryAt(worldPos.x, worldPos.y);
        
        if (territory) {
            this.game.handleTerritoryClick(territory);
        }
    }

    handleMouseMove(event) {
        const worldPos = this.screenToWorld(event.clientX, event.clientY);
        const territory = this.game.world.getTerritoryAt(worldPos.x, worldPos.y);
        
        if (territory) {
            this.canvas.style.cursor = 'pointer';
        } else {
            this.canvas.style.cursor = 'default';
        }
    }

    screenToWorld(screenX, screenY) {
        return {
            x: (screenX / this.game.camera.zoom) + this.game.camera.x,
            y: (screenY / this.game.camera.zoom) + this.game.camera.y
        };
    }

    showScreen(screenId) {
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.add('hidden');
        });
        document.getElementById(screenId).classList.remove('hidden');
    }

    showModal(modalId) {
        document.querySelectorAll('.modal').forEach(modal => {
            modal.classList.add('hidden');
        });
        document.getElementById(modalId).classList.remove('hidden');
    }

    hideModal(modalId) {
        document.getElementById(modalId).classList.add('hidden');
    }
}
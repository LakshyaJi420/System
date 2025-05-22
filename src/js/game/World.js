class World {
    constructor(width, height, tileSize) {
        this.width = width;
        this.height = height;
        this.tileSize = tileSize;
        this.territories = [];
        this.grid = [];
        this.initialize();
    }

    initialize() {
        // Create grid
        const cols = Math.ceil(this.width / this.tileSize);
        const rows = Math.ceil(this.height / this.tileSize);

        for (let y = 0; y < rows; y++) {
            this.grid[y] = [];
            for (let x = 0; x < cols; x++) {
                const territory = new Territory(
                    x * this.tileSize,
                    y * this.tileSize,
                    this.tileSize
                );
                this.grid[y][x] = territory;
                this.territories.push(territory);
            }
        }

        // Set up neighbors
        this.setupNeighbors();
    }

    setupNeighbors() {
        const directions = [
            [-1, -1], [0, -1], [1, -1],
            [-1, 0],           [1, 0],
            [-1, 1],  [0, 1],  [1, 1]
        ];

        for (let y = 0; y < this.grid.length; y++) {
            for (let x = 0; x < this.grid[y].length; x++) {
                const territory = this.grid[y][x];

                for (const [dx, dy] of directions) {
                    const newX = x + dx;
                    const newY = y + dy;

                    if (this.isValidPosition(newX, newY)) {
                        territory.addNeighbor(this.grid[newY][newX]);
                    }
                }
            }
        }
    }

    isValidPosition(x, y) {
        return x >= 0 && x < this.grid[0].length && 
               y >= 0 && y < this.grid.length;
    }

    getTerritoryAt(worldX, worldY) {
        const gridX = Math.floor(worldX / this.tileSize);
        const gridY = Math.floor(worldY / this.tileSize);

        if (this.isValidPosition(gridX, gridY)) {
            return this.grid[gridY][gridX];
        }
        return null;
    }

    update(deltaTime) {
        for (const territory of this.territories) {
            territory.update(deltaTime);
        }
    }

    getRandomEmptyTerritory() {
        const emptyTerritories = this.territories.filter(t => !t.owner);
        if (emptyTerritories.length === 0) return null;
        
        return emptyTerritories[
            Math.floor(Math.random() * emptyTerritories.length)
        ];
    }

    serialize() {
        return {
            territories: this.territories.map(t => ({
                x: t.x,
                y: t.y,
                owner: t.owner ? t.owner.id : null,
                population: t.population,
                resources: t.resources
            }))
        };
    }

    deserialize(data) {
        for (const tData of data.territories) {
            const territory = this.getTerritoryAt(tData.x, tData.y);
            if (territory) {
                territory.population = tData.population;
                territory.resources = tData.resources;
                // Owner will be set by the game class
            }
        }
    }
}
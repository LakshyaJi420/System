class Player {
    constructor(id, username, color) {
        this.id = id;
        this.username = username;
        this.color = color;
        this.territories = new Set();
        this.totalPopulation = 0;
        this.totalResources = 0;
        this.score = 0;
        this.isAI = false;
    }

    update(deltaTime) {
        this.calculateTotals();
        this.updateScore();
    }

    calculateTotals() {
        this.totalPopulation = 0;
        this.totalResources = 0;

        for (const territory of this.territories) {
            this.totalPopulation += territory.population;
            this.totalResources += territory.resources;
        }
    }

    updateScore() {
        this.score = this.territories.size * 100 + 
                     this.totalPopulation * 0.1 + 
                     this.totalResources;
    }

    addTerritory(territory) {
        this.territories.add(territory);
        territory.owner = this;
        territory.color = this.color;
    }

    removeTerritory(territory) {
        this.territories.delete(territory);
        if (territory.owner === this) {
            territory.owner = null;
            territory.color = '#808080';
        }
    }

    getTerritoriesArray() {
        return Array.from(this.territories);
    }
}
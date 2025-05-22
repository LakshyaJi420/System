class Territory {
    constructor(x, y, size, owner = null) {
        this.x = x;
        this.y = y;
        this.size = size;
        this.owner = owner;
        this.population = owner ? CONFIG.PLAYER.INITIAL_POPULATION : 0;
        this.resources = owner ? CONFIG.PLAYER.INITIAL_RESOURCES : 0;
        this.color = owner ? owner.color : '#808080';
        this.neighbors = new Set();
    }

    update(deltaTime) {
        if (this.owner) {
            this.updatePopulation(deltaTime);
            this.updateResources(deltaTime);
        }
    }

    updatePopulation(deltaTime) {
        if (this.population < CONFIG.GAME.MAX_TERRITORY_SIZE) {
            this.population += this.population * CONFIG.GAME.POPULATION_GROWTH_RATE * deltaTime;
        }
    }

    updateResources(deltaTime) {
        this.resources += CONFIG.GAME.RESOURCE_GENERATION_RATE * deltaTime;
    }

    attack(target, force) {
        if (force > this.population || !this.owner) return false;

        this.population -= force;
        const success = Math.random() < (force / target.population);

        if (success) {
            target.owner = this.owner;
            target.color = this.owner.color;
            target.population = force;
        } else {
            target.population -= force * 0.5;
        }

        return success;
    }

    transfer(target, amount) {
        if (amount > this.population || !this.owner || target.owner !== this.owner) return false;

        this.population -= amount;
        target.population += amount;
        return true;
    }

    addNeighbor(territory) {
        this.neighbors.add(territory);
    }

    removeNeighbor(territory) {
        this.neighbors.delete(territory);
    }
}
class AI extends Player {
    constructor(id, difficulty = 0.5) {
        super(id, 'AI_' + id, Utils.getRandomColor());
        this.isAI = true;
        this.difficulty = difficulty; // 0 to 1
        this.lastUpdate = 0;
        this.strategy = this.chooseStrategy();
    }

    chooseStrategy() {
        const strategies = ['aggressive', 'defensive', 'balanced'];
        return strategies[Math.floor(Math.random() * strategies.length)];
    }

    update(deltaTime) {
        super.update(deltaTime);

        const now = Date.now();
        if (now - this.lastUpdate >= CONFIG.GAME.AI_UPDATE_INTERVAL) {
            this.makeDecision();
            this.lastUpdate = now;
        }
    }

    makeDecision() {
        switch (this.strategy) {
            case 'aggressive':
                this.makeAggressiveMove();
                break;
            case 'defensive':
                this.makeDefensiveMove();
                break;
            case 'balanced':
                Math.random() < 0.5 ? this.makeAggressiveMove() : this.makeDefensiveMove();
                break;
        }
    }

    makeAggressiveMove() {
        const myTerritories = Array.from(this.territories);
        if (myTerritories.length === 0) return;

        // Find strongest territory
        const strongestTerritory = myTerritories.reduce((a, b) => 
            a.population > b.population ? a : b
        );

        // Find weakest neighbor to attack
        const attackableNeighbors = Array.from(strongestTerritory.neighbors)
            .filter(t => t.owner !== this);

        if (attackableNeighbors.length === 0) return;

        const target = attackableNeighbors.reduce((a, b) => 
            a.population < b.population ? a : b
        );

        // Attack if we have more population
        if (strongestTerritory.population > target.population * (1 + Math.random())) {
            const attackForce = strongestTerritory.population * 0.7;
            strongestTerritory.attack(target, attackForce);
        }
    }

    makeDefensiveMove() {
        const myTerritories = Array.from(this.territories);
        if (myTerritories.length <= 1) return;

        // Find weakest territory
        const weakestTerritory = myTerritories.reduce((a, b) => 
            a.population < b.population ? a : b
        );

        // Find strongest friendly neighbor
        const friendlyNeighbors = Array.from(weakestTerritory.neighbors)
            .filter(t => t.owner === this);

        if (friendlyNeighbors.length === 0) return;

        const strongestNeighbor = friendlyNeighbors.reduce((a, b) => 
            a.population > b.population ? a : b
        );

        // Transfer population to weak territory
        const transferAmount = strongestNeighbor.population * 0.3;
        strongestNeighbor.transfer(weakestTerritory, transferAmount);
    }
}
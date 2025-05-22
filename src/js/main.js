            .GAME.TILE_SIZE
        );

        // Give initial territory to current player
        const startingTerritory = this.world.getRandomEmptyTerritory();
        if (startingTerritory && this.currentPlayer) {
            this.currentPlayer.addTerritory(startingTerritory);
        }
    }

    addAIPlayers(count) {
        for (let i = 0; i < count; i++) {
            const ai = new AI(`ai_${i}`, Math.random());
            this.players.set(ai.id, ai);

            // Give AI initial territory
            const territory = this.world.getRandomEmptyTerritory();
            if (territory) {
                ai.addTerritory(territory);
            }
        }
    }

    handleTerritoryClick(territory) {
        if (!this.currentPlayer) return;

        if (!this.selectedTerritory) {
            if (territory.owner === this.currentPlayer) {
                this.selectedTerritory = territory;
                territory.isSelected = true;
            }
        } else {
            if (territory !== this.selectedTerritory) {
                if (this.gameMode === 'attack') {
                    this.attackTerritory(this.selectedTerritory, territory);
                } else if (this.gameMode === 'defend' && 
                         territory.owner === this.currentPlayer) {
                    this.transferPopulation(this.selectedTerritory, territory);
                }
            }
            this.selectedTerritory.isSelected = false;
            this.selectedTerritory = null;
        }
    }

    attackTerritory(from, to) {
        if (from.owner !== this.currentPlayer || 
            from.owner === to.owner) return;

        const attackForce = Math.floor(from.population * 0.7);
        const success = from.attack(to, attackForce);

        if (success && !to.owner) {
            this.currentPlayer.addTerritory(to);
        }

        // Send update to other players in multiplayer
        if (this.network.isConnected) {
            this.network.sendUpdate({
                type: 'attack',
                from: { x: from.x, y: from.y },
                to: { x: to.x, y: to.y },
                force: attackForce
            });
        }
    }

    transferPopulation(from, to) {
        if (from.owner !== this.currentPlayer || 
            to.owner !== this.currentPlayer) return;

        const amount = Math.floor(from.population * 0.5);
        const success = from.transfer(to, amount);

        if (success && this.network.isConnected) {
            this.network.sendUpdate({
                type: 'transfer',
                from: { x: from.x, y: from.y },
                to: { x: to.x, y: to.y },
                amount: amount
            });
        }
    }

    setMode(mode) {
        this.gameMode = mode;
        this.selectedTerritory = null;
        document.querySelectorAll('.game-controls button').forEach(btn => {
            btn.classList.remove('active');
        });
        document.getElementById(`${mode}-btn`).classList.add('active');
    }

    processUpdate(data) {
        switch (data.type) {
            case 'attack':
                const fromTerritory = this.world.getTerritoryAt(
                    data.from.x, data.from.y
                );
                const toTerritory = this.world.getTerritoryAt(
                    data.to.x, data.to.y
                );
                if (fromTerritory && toTerritory) {
                    fromTerritory.attack(toTerritory, data.force);
                }
                break;

            case 'transfer':
                const sourceTerritory = this.world.getTerritoryAt(
                    data.from.x, data.from.y
                );
                const targetTerritory = this.world.getTerritoryAt(
                    data.to.x, data.to.y
                );
                if (sourceTerritory && targetTerritory) {
                    sourceTerritory.transfer(targetTerritory, data.amount);
                }
                break;
        }
    }

    end() {
        this.isRunning = false;
        this.network.disconnect();
        this.world = null;
        this.players.clear();
        this.selectedTerritory = null;
        this.ui.showScreen('main-menu');
    }
}

// Start the game when the page loads
window.addEventListener('load', () => {
    window.game = new Game();
});
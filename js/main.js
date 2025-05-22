window.addEventListener('load', () => {
    // Initialize components
    const canvas = document.getElementById('game-canvas');
    const game = new TerritoryGame(canvas);
    const multiplayer = new MultiplayerSystem(game);
    const ui = new GameUI(game);

    // Make instances globally available
    window.game = game;
    window.gameUI = ui;
    window.multiplayerSystem = multiplayer;
});
window.addEventListener('load', () => {
    // Initialize components
    const canvas = document.getElementById('game-canvas');
    const game = new TerritoryGame(canvas);
    const auth = new AuthSystem();
    const multiplayer = new MultiplayerSystem(game);
    const ui = new GameUI(game);

    // Make instances globally available
    window.game = game;
    window.gameUI = ui;
    window.multiplayerSystem = multiplayer;
    window.authSystem = auth;

    // Set up auth state change handler
    auth.onAuthStateChanged = (user) => {
        if (user) {
            game.setCurrentPlayer(user);
            ui.showMenu();
        } else {
            ui.hideMenu();
            auth.showAuthModal();
        }
    };

    // Show auth modal by default
    auth.showAuthModal();

    // Handle room codes in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomCode = urlParams.get('room');
    if (roomCode && game.currentPlayer) {
        multiplayer.joinGame(roomCode).then(success => {
            if (success) {
                ui.startMultiplayerGame();
            }
        });
    }
});

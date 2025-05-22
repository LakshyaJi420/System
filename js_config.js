// Initialize the game when the window loads
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

    // Set up auth state change handler
    auth.onAuthStateChanged = (user) => {
        if (user) {
            game.currentUser = user;
            ui.showMenu();
        } else {
            ui.hideMenu();
            auth.showAuthModal();
        }
    };

    // Check for room ID in URL
    const urlParams = new URLSearchParams(window.location.search);
    const roomId = urlParams.get('room');
    if (roomId && game.currentUser) {
        multiplayer.joinRoom(roomId);
        ui.startMultiplayerGame();
    }
});
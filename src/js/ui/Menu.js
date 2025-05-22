class Menu {
    constructor(ui) {
        this.ui = ui;
        this.setupEventListeners();
    }

    setupEventListeners() {
        // Main menu buttons
        document.getElementById('quick-play').addEventListener('click', () => {
            this.ui.game.startQuickPlay();
        });

        document.getElementById('create-game').addEventListener('click', () => {
            this.ui.game.createPrivateGame();
        });

        document.getElementById('join-game').addEventListener('click', () => {
            this.ui.showModal('connection-modal');
        });

        document.getElementById('practice').addEventListener('click', () => {
            this.ui.game.startPracticeGame();
        });

        document.getElementById('leaderboard').addEventListener('click', () => {
            this.ui.showModal('leaderboard-modal');
        });

        document.getElementById('settings').addEventListener('click', () => {
            this.ui.showModal('settings-modal');
        });

        // Modal close buttons
        document.querySelectorAll('.modal .close-button').forEach(button => {
            button.addEventListener('click', () => {
                button.closest('.modal').classList.add('hidden');
            });
        });

        // Settings
        document.getElementById('save-settings').addEventListener('click', () => {
            this.saveSettings();
        });

        // Connection
        document.getElementById('connect-button').addEventListener('click', () => {
            const code = document.getElementById('connection-input').value;
            this.ui.game.joinPrivateGame(code);
        });

        // Share button
        document.getElementById('share-button').addEventListener('click', () => {
            this.shareGame();
        });
    }

    saveSettings() {
        const settings = {
            soundVolume: document.getElementById('sound-volume').value,
            musicVolume: document.getElementById('music-volume').value,
            quality: document.getElementById('quality').value
        };

        StorageManager.set('settings', settings);
        this.ui.hideModal('settings-modal');
    }

    loadSettings() {
        const settings = StorageManager.get('settings') || {
            soundVolume: 50,
            musicVolume: 50,
            quality: 'medium'
        };

        document.getElementById('sound-volume').value = settings.soundVolume;
        document.getElementById('music-volume').value = settings.musicVolume;
        document.getElementById('quality').value = settings.quality;
    }

    shareGame() {
        if (this.ui.game.roomCode) {
            const url = `${window.location.origin}${window.location.pathname}?room=${this.ui.game.roomCode}`;
            
            if (navigator.share) {
                navigator.share({
                    title: 'Join my game!',
                    text: 'Join my territory conquest game!',
                    url: url
                }).catch(console.error);
            } else {
                navigator.clipboard.writeText(url).then(() => {
                    alert('Game link copied to clipboard!');
                }).catch(console.error);
            }
        }
    }
}
class Auth {
    constructor() {
        this.currentUser = null;
        this.isAuthenticated = false;
        this.onAuthStateChange = null;

        // Try to restore session
        this.restoreSession();
    }

    restoreSession() {
        const savedUser = StorageManager.get('user');
        if (savedUser) {
            this.currentUser = savedUser;
            this.isAuthenticated = true;
            if (this.onAuthStateChange) {
                this.onAuthStateChange(this.currentUser);
            }
        }
    }

    async login(username, password) {
        try {
            // In a real app, this would be an API call
            // For now, we'll simulate authentication
            const user = {
                id: Utils.generateId(),
                username: username,
                color: Utils.getRandomColor(),
                createdAt: new Date().toISOString(),
                stats: {
                    wins: 0,
                    losses: 0,
                    gamesPlayed: 0,
                    territoryCaptured: 0
                }
            };

            this.currentUser = user;
            this.isAuthenticated = true;
            StorageManager.set('user', user);

            if (this.onAuthStateChange) {
                this.onAuthStateChange(user);
            }

            return true;
        } catch (error) {
            console.error('Login error:', error);
            return false;
        }
    }

    async register(username, password) {
        try {
            // In a real app, this would be an API call
            const existingUser = StorageManager.get(`user_${username}`);
            if (existingUser) {
                throw new Error('Username already exists');
            }

            return await this.login(username, password);
        } catch (error) {
            console.error('Register error:', error);
            return false;
        }
    }

    async loginAsGuest() {
        const guestUsername = 'Guest_' + Math.random().toString(36).substr(2, 6);
        return await this.login(guestUsername, '');
    }

    logout() {
        this.currentUser = null;
        this.isAuthenticated = false;
        StorageManager.remove('user');
        
        if (this.onAuthStateChange) {
            this.onAuthStateChange(null);
        }
    }

    updateUserStats(stats) {
        if (this.currentUser) {
            this.currentUser.stats = {
                ...this.currentUser.stats,
                ...stats
            };
            StorageManager.set('user', this.currentUser);
        }
    }
}
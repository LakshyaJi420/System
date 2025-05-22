class AuthSystem {
    constructor() {
        this.currentUser = null;
        this.onAuthStateChanged = null;
        
        // Firebase configuration
        this.firebaseConfig = {
            // Your Firebase configuration here
        };
        
        this.initializeFirebase();
        this.setupAuthListeners();
    }

    initializeFirebase() {
        if (typeof firebase !== 'undefined') {
            firebase.initializeApp(this.firebaseConfig);
            this.auth = firebase.auth();
            this.db = firebase.database();
        }
    }

    setupAuthListeners() {
        document.getElementById('play-guest').addEventListener('click', () => this.playAsGuest());
        document.getElementById('login').addEventListener('click', () => this.login());
        document.getElementById('register').addEventListener('click', () => this.register());
    }

    async playAsGuest() {
        const username = document.getElementById('username').value.trim();
        if (username) {
            this.currentUser = {
                username: username,
                isGuest: true,
                id: 'guest-' + Math.random().toString(36).substr(2, 9)
            };
            this.hideAuthModal();
            if (this.onAuthStateChanged) {
                this.onAuthStateChanged(this.currentUser);
            }
        } else {
            alert('Please enter a username');
        }
    }

    async login() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        try {
            const userCredential = await this.auth.signInWithEmailAndPassword(
                `${username}@territory-game.com`,
                password
            );
            this.currentUser = {
                username: username,
                id: userCredential.user.uid,
                isGuest: false
            };
            this.hideAuthModal();
            if (this.onAuthStateChanged) {
                this.onAuthStateChanged(this.currentUser);
            }
        } catch (error) {
            alert('Login failed: ' + error.message);
        }
    }

    async register() {
        const username = document.getElementById('username').value.trim();
        const password = document.getElementById('password').value;
        
        if (!username || !password) {
            alert('Please enter both username and password');
            return;
        }

        try {
            const userCredential = await this.auth.createUserWithEmailAndPassword(
                `${username}@territory-game.com`,
                password
            );
            
            await this.db.ref(`users/${userCredential.user.uid}`).set({
                username: username,
                created: Date.now()
            });

            this.currentUser = {
                username: username,
                id: userCredential.user.uid,
                isGuest: false
            };
            
            this.hideAuthModal();
            if (this.onAuthStateChanged) {
                this.onAuthStateChanged(this.currentUser);
            }
        } catch (error) {
            alert('Registration failed: ' + error.message);
        }
    }

    hideAuthModal() {
        document.getElementById('auth-modal').style.display = 'none';
    }

    showAuthModal() {
        document.getElementById('auth-modal').style.display = 'flex';
    }

    logout() {
        if (this.auth) {
            this.auth.signOut();
        }
        this.currentUser = null;
        if (this.onAuthStateChanged) {
            this.onAuthStateChanged(null);
        }
        this.showAuthModal();
    }
}
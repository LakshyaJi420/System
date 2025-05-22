class StorageManager {
    static set(key, value) {
        try {
            const fullKey = CONFIG.STORAGE.PREFIX + key;
            localStorage.setItem(fullKey, JSON.stringify(value));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    static get(key) {
        try {
            const fullKey = CONFIG.STORAGE.PREFIX + key;
            const item = localStorage.getItem(fullKey);
            return item ? JSON.parse(item) : null;
        } catch (error) {
            console.error('Storage error:', error);
            return null;
        }
    }

    static remove(key) {
        try {
            const fullKey = CONFIG.STORAGE.PREFIX + key;
            localStorage.removeItem(fullKey);
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }

    static clear() {
        try {
            const prefix = CONFIG.STORAGE.PREFIX;
            Object.keys(localStorage)
                .filter(key => key.startsWith(prefix))
                .forEach(key => localStorage.removeItem(key));
            return true;
        } catch (error) {
            console.error('Storage error:', error);
            return false;
        }
    }
}
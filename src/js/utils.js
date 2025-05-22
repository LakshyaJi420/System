class Utils {
    static generateId() {
        return Math.random().toString(36).substr(2, 9);
    }

    static getRandomColor() {
        return CONFIG.PLAYER.COLORS[
            Math.floor(Math.random() * CONFIG.PLAYER.COLORS.length)
        ];
    }

    static calculateDistance(x1, y1, x2, y2) {
        return Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2));
    }

    static lerp(start, end, amt) {
        return (1 - amt) * start + amt * end;
    }

    static clamp(value, min, max) {
        return Math.min(Math.max(value, min), max);
    }

    static getRandomPosition(mapSize) {
        return {
            x: Math.random() * mapSize,
            y: Math.random() * mapSize
        };
    }

    static debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }

    static throttle(func, limit) {
        let inThrottle;
        return function executedFunction(...args) {
            if (!inThrottle) {
                func(...args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
}
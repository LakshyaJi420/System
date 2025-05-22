const CONFIG = {
    GAME: {
        MAX_PLAYERS: 100,
        MIN_PLAYERS: 2,
        MAP_SIZE: 8000,
        TILE_SIZE: 50,
        UPDATE_RATE: 60,
        POPULATION_GROWTH_RATE: 0.001,
        RESOURCE_GENERATION_RATE: 0.1,
        AI_UPDATE_INTERVAL: 1000,
        MAX_TERRITORY_SIZE: 100000,
    },
    
    PLAYER: {
        INITIAL_TERRITORY: 100,
        INITIAL_POPULATION: 1000,
        INITIAL_RESOURCES: 500,
        MAX_NAME_LENGTH: 20,
        COLORS: [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00',
            '#ff00ff', '#00ffff', '#ff8000', '#8000ff',
            '#0080ff', '#ff0080', '#80ff00', '#00ff80'
        ]
    },

    NETWORK: {
        WEBSOCKET_URL: 'wss://your-game-server.com',
        UPDATE_RATE: 100,
        LATENCY_CHECK_INTERVAL: 1000,
    },

    UI: {
        MINIMAP_SIZE: 200,
        CHAT_MESSAGE_LIMIT: 100,
        LEADERBOARD_UPDATE_INTERVAL: 1000,
    },

    STORAGE: {
        PREFIX: 'territorial_conquest_',
        VERSION: '1.0.0',
    }
};

// Make CONFIG immutable
Object.freeze(CONFIG);
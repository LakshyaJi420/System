# Modern Territory Game

A modern implementation of a territory conquest game inspired by Territorial.io, featuring both multiplayer and single-player modes.

## Features

- 🎮 Real-time multiplayer gameplay
- 🤖 Single-player mode with AI opponents
- 💬 In-game chat system
- 🎨 Modern, responsive UI
- 📱 Mobile-friendly design
- 🔒 User authentication system
- 🔗 Private game rooms

## Setup Instructions

### 1. Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project
3. Enable Authentication and Realtime Database
4. Get your Firebase configuration:
   - Click on ⚙️ (Project Settings)
   - Scroll to "Your apps" section
   - Click on web icon (</>)
   - Register app and copy the configuration

5. Create a new file `src/js/firebase-config.js`:

```javascript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-auth-domain",
  databaseURL: "your-database-url",
  projectId: "your-project-id",
  storageBucket: "your-storage-bucket",
  messagingSenderId: "your-messaging-sender-id",
  appId: "your-app-id"
};

export default firebaseConfig;
```

### 2. Firebase Security Rules

In your Firebase Console, set up these security rules for the Realtime Database:

```json
{
  "rules": {
    "rooms": {
      ".read": "auth != null",
      ".write": "auth != null",
      "$roomId": {
        ".read": "auth != null",
        ".write": "auth != null",
        "players": {
          ".read": "auth != null",
          ".write": "auth != null"
        },
        "moves": {
          ".read": "auth != null",
          ".write": "auth != null"
        },
        "chat": {
          ".read": "auth != null",
          ".write": "auth != null",
          "$messageId": {
            ".validate": "newData.hasChildren(['sender', 'message', 'timestamp'])"
          }
        }
      }
    },
    "users": {
      "$uid": {
        ".read": "$uid === auth.uid",
        ".write": "$uid === auth.uid"
      }
    }
  }
}
```

### 3. Local Development

1. Clone the repository:
```bash
git clone https://github.com/yourusername/territorial-game.git
cd territorial-game
```

2. Install a local server (optional):
```bash
npm install -g http-server
```

3. Start the server:
```bash
http-server src
```

4. Open `http://localhost:8080` in your browser

### 4. GitHub Pages Deployment

1. In your repository settings, enable GitHub Pages
2. Set the source branch to `gh-pages`
3. Push your changes to the main branch
4. GitHub Actions will automatically deploy to GitHub Pages

## Playing the Game

### Single Player Mode
- Click "Play Single Player"
- Expand your territory by clicking on empty cells
- Compete against AI opponents
- Win by controlling the most territory

### Multiplayer Mode
- Click "Play Multiplayer" for random matches
- Or click "Create Private Game" to play with friends
- Share the game link with other players
- Chat with other players during the game
- Expand your territory strategically

### Controls
- **Click/Tap**: Capture territory
- **ESC**: Exit game
- **Enter**: Send chat message

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
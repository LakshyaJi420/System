class Chat {
    constructor(ui) {
        this.ui = ui;
        this.messages = [];
        this.setupEventListeners();
    }

    setupEventListeners() {
        const input = document.getElementById('chat-input');
        const sendButton = document.getElementById('send-chat');

        input.addEventListener('keypress', (event) => {
            if (event.key === 'Enter') {
                this.sendMessage();
            }
        });

        sendButton.addEventListener('click', () => {
            this.sendMessage();
        });
    }

    sendMessage() {
        const input = document.getElementById('chat-input');
        const message = input.value.trim();

        if (message) {
            this.ui.game.network.sendChat(message);
            input.value = '';
        }
    }

    addMessage(messageData) {
        this.messages.unshift(messageData);
        if (this.messages.length > CONFIG.UI.CHAT_MESSAGE_LIMIT) {
            this.messages.pop();
        }

        this.renderMessages();
    }

    renderMessages() {
        const chatMessages = document.getElementById('chat-messages');
        chatMessages.innerHTML = this.messages.map(msg => `
            <div class="chat-message">
                <span class="chat-sender" style="color: ${
                    this.ui.game.players.get(msg.sender)?.color || '#ffffff'
                }">${msg.sender}:</span>
                <span class="chat-text">${this.escapeHTML(msg.message)}</span>
            </div>
        `).join('');
    }

    escapeHTML(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    clear() {
        this.messages = [];
        this.renderMessages();
    }
}
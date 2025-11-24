# Website Integration Guide

This guide shows you how to add the Discord Support Chat widget to your website.

## Quick Start

The easiest way to integrate is to copy the complete widget from `public/index.html`. This guide provides step-by-step instructions.

## Step 1: Include Socket.io

Add this before your closing `</body>` tag:

```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
```

## Step 2: Add the Widget HTML

Add this HTML structure to your page:

```html
<!-- Chat Widget Button -->
<button class="chat-widget-button" id="chatToggle">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
</button>

<!-- Chat Widget -->
<div class="chat-widget" id="chatWidget">
    <div class="chat-header">
        <div class="chat-header-info">
            <div class="chat-header-avatar">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none"
                    stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                </svg>
            </div>
            <div class="chat-header-text">
                <h3>Support Team</h3>
                <div class="chat-header-status">
                    <span class="status-dot" id="statusDot"></span>
                    <span id="statusText">Connecting...</span>
                </div>
            </div>
        </div>
        <button class="chat-close" id="chatClose">
            <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
        </button>
    </div>

    <!-- User Details Form -->
    <div class="user-form-container active" id="userFormContainer">
        <h2 class="form-title">Hello there! 👋</h2>
        <p class="form-subtitle">Tell us a bit about yourself and your issue so we can help you right away.</p>

        <form id="userDetailsForm">
            <div class="form-group">
                <label for="userName">Your Name <span class="required">*</span></label>
                <input type="text" id="userName" placeholder="e.g. Alex Smith" required>
            </div>

            <div class="form-group">
                <label for="userSubject">How can we help? <span class="required">*</span></label>
                <textarea id="userSubject" placeholder="Describe your issue..." required></textarea>
            </div>

            <button type="submit" class="form-submit" id="formSubmit">Start Chat</button>
        </form>
    </div>

    <!-- Chat Messages Container -->
    <div class="chat-messages-container" id="chatMessagesContainer">
        <div class="ticket-info" id="ticketInfo">
            Ticket <span class="ticket-number" id="ticketNumber">#loading...</span>
        </div>

        <div class="chat-messages" id="chatMessages"></div>

        <div class="chat-input-container">
            <form class="chat-input-form" id="chatForm">
                <input type="text" class="chat-input" id="chatInput" placeholder="Type a message..."
                    autocomplete="off" disabled>
                <button type="submit" class="chat-send-button" id="sendButton" disabled>
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor"
                        stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <line x1="22" y1="2" x2="11" y2="13"></line>
                        <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                    </svg>
                </button>
            </form>
        </div>
    </div>
</div>
```

## Step 3: Add the CSS Styles

Copy all the CSS from `public/index.html` (the `<style>` section) into your stylesheet or `<style>` tag.

The complete CSS is available in the example file. Key classes:
- `.chat-widget-button` - The floating chat button
- `.chat-widget` - The main chat container
- `.chat-header` - Header with status
- `.user-form-container` - Initial form
- `.chat-messages-container` - Chat interface
- `.chat-message` - Individual messages

## Step 4: Add the JavaScript

Add this script, replacing `SOCKET_URL` with your Render service URL:

```javascript
<script>
    // ===== CONFIGURATION =====
    const SOCKET_URL = 'https://your-service-name.onrender.com';

    // ===== DOM ELEMENTS =====
    const chatToggle = document.getElementById('chatToggle');
    const chatWidget = document.getElementById('chatWidget');
    const chatClose = document.getElementById('chatClose');
    const userFormContainer = document.getElementById('userFormContainer');
    const chatMessagesContainer = document.getElementById('chatMessagesContainer');
    const userDetailsForm = document.getElementById('userDetailsForm');
    const chatForm = document.getElementById('chatForm');
    const chatInput = document.getElementById('chatInput');
    const chatMessages = document.getElementById('chatMessages');
    const sendButton = document.getElementById('sendButton');
    const statusDot = document.getElementById('statusDot');
    const statusText = document.getElementById('statusText');
    const ticketNumber = document.getElementById('ticketNumber');

    // ===== STATE MANAGEMENT =====
    let socket;
    let userId = localStorage.getItem('userId') || generateUserId();
    let ticketId = localStorage.getItem('ticketId') || null;
    let userDetails = JSON.parse(localStorage.getItem('userDetails') || 'null');

    function generateUserId() {
        const id = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('userId', id);
        return id;
    }

    // ===== SOCKET CONNECTION =====
    function connectSocket() {
        socket = io(SOCKET_URL, {
            query: { userId: userId, ticketId: ticketId }
        });

        socket.on('connect', () => {
            console.log('Connected to server');
            updateStatus('online', 'Connected');

            if (ticketId && userDetails) {
                showChatInterface();
            }
        });

        socket.on('disconnect', () => {
            console.log('Disconnected from server');
            updateStatus('offline', 'Disconnected');
            chatInput.disabled = true;
            sendButton.disabled = true;
        });

        socket.on('ticketCreated', (data) => {
            ticketId = data.ticketId;
            localStorage.setItem('ticketId', ticketId);
            ticketNumber.textContent = `#${ticketId}`;

            chatInput.disabled = false;
            sendButton.disabled = false;

            addSystemMessage(`Ticket created! Channel: ${data.channelName}`);
            addSystemMessage('A support agent will be with you shortly.');
        });

        socket.on('messageFromDiscord', (data) => {
            addMessage(data.author, data.message, 'discord', data.timestamp);
        });

        socket.on('ticketClosed', (data) => {
            addSystemMessage(`This ticket has been closed by ${data.closedBy}.`);
            addSystemMessage('You can close this window or create a new ticket.');
            chatInput.disabled = true;
            sendButton.disabled = true;

            setTimeout(() => {
                localStorage.removeItem('ticketId');
                localStorage.removeItem('userDetails');
                ticketId = null;
                userDetails = null;

                chatMessages.innerHTML = '';
                chatMessagesContainer.classList.remove('active');
                userFormContainer.classList.add('active');

                document.getElementById('userName').value = '';
                document.getElementById('userSubject').value = '';
            }, 3000);
        });

        socket.on('systemMessage', (message) => {
            addSystemMessage(message);
        });

        socket.on('error', (error) => {
            console.error('Socket error:', error);
            addSystemMessage('Error: ' + error.message);
        });
    }

    // ===== UI FUNCTIONS =====
    function updateStatus(status, text) {
        statusDot.className = 'status-dot' + (status === 'offline' ? ' offline' : '');
        statusText.textContent = text;
    }

    function showChatInterface() {
        userFormContainer.classList.remove('active');
        chatMessagesContainer.classList.add('active');
        ticketNumber.textContent = `#${ticketId}`;
        chatInput.disabled = false;
        sendButton.disabled = false;
    }

    function addMessage(author, text, type = 'discord', timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type === 'user' ? 'user' : ''}`;

        const time = timestamp ? new Date(timestamp) : new Date();
        const timeString = time.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit'
        });

        const avatar = author.charAt(0).toUpperCase();

        messageDiv.innerHTML = `
            <div class="message-avatar">${avatar}</div>
            <div class="message-content">
                <div class="message-header">
                    <span class="message-author">${escapeHtml(author)}</span>
                    <span class="message-time">${timeString}</span>
                </div>
                <div class="message-text">${escapeHtml(text)}</div>
            </div>
        `;

        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message system';
        messageDiv.innerHTML = `
            <div class="message-content">
                <div class="message-text">${escapeHtml(text)}</div>
            </div>
        `;
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== EVENT LISTENERS =====
    chatToggle.addEventListener('click', () => {
        chatWidget.classList.add('active');

        if (userDetails && ticketId) {
            chatInput.focus();
        } else {
            document.getElementById('userName').focus();
        }
    });

    chatClose.addEventListener('click', () => {
        chatWidget.classList.remove('active');
    });

    userDetailsForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const name = document.getElementById('userName').value.trim();
        const subject = document.getElementById('userSubject').value.trim();

        if (!name || !subject) {
            alert('Please fill in all required fields');
            return;
        }

        userDetails = { name, subject };
        localStorage.setItem('userDetails', JSON.stringify(userDetails));

        socket.emit('createTicket', {
            userId: userId,
            userDetails: userDetails
        });

        showChatInterface();
    });

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const message = chatInput.value.trim();

        if (message && socket && socket.connected && ticketId) {
            socket.emit('messageFromWebsite', {
                userId: userId,
                ticketId: ticketId,
                userName: userDetails.name,
                message: message
            });

            addMessage(userDetails.name, message, 'user');
            chatInput.value = '';
        }
    });

    // ===== INITIALIZE =====
    connectSocket();
</script>
```

## Customization Options

### Change Colors

Update CSS variables in the `:root` selector:

```css
:root {
    --primary-color: #5865F2;      /* Main brand color */
    --primary-hover: #4752c4;      /* Hover state */
    --bg-color: #ffffff;            /* Widget background */
    --text-primary: #111827;        /* Main text color */
}
```

### Change Position

Move the button to bottom-left:

```css
.chat-widget-button {
    bottom: 2rem;
    left: 2rem;  /* Change from 'right' to 'left' */
}

.chat-widget {
    bottom: calc(2rem + 80px);
    left: 2rem;  /* Change from 'right' to 'left' */
}
```

### Custom Branding

Update the header text and avatar:

```html
<div class="chat-header-text">
    <h3>Your Company Support</h3>  <!-- Change this -->
    <div class="chat-header-status">
        <span class="status-dot" id="statusDot"></span>
        <span id="statusText">Connecting...</span>
    </div>
</div>
```

### Form Customization

Modify form fields in the `user-form-container`:

```html
<form id="userDetailsForm">
    <div class="form-group">
        <label for="userName">Your Name <span class="required">*</span></label>
        <input type="text" id="userName" placeholder="John Doe" required>
    </div>

    <!-- Add custom fields -->
    <div class="form-group">
        <label for="userEmail">Email</label>
        <input type="email" id="userEmail" placeholder="your@email.com">
    </div>

    <div class="form-group">
        <label for="userSubject">How can we help? <span class="required">*</span></label>
        <textarea id="userSubject" placeholder="Describe your issue..." required></textarea>
    </div>

    <button type="submit" class="form-submit">Start Chat</button>
</form>
```

If you add fields, update the JavaScript to capture them:

```javascript
userDetailsForm.addEventListener('submit', (e) => {
    e.preventDefault();

    const name = document.getElementById('userName').value.trim();
    const email = document.getElementById('userEmail').value.trim();
    const subject = document.getElementById('userSubject').value.trim();

    userDetails = { name, email, subject };
    // ... rest of code
});
```

## Advanced Integration

### React Integration

```jsx
import { useEffect, useState } from 'react';
import io from 'socket.io-client';

function ChatWidget() {
  const [socket, setSocket] = useState(null);
  const [ticketId, setTicketId] = useState(null);

  useEffect(() => {
    const newSocket = io('https://your-service-name.onrender.com');
    setSocket(newSocket);

    return () => newSocket.close();
  }, []);

  // ... implement rest of the logic
}
```

### Vue Integration

```vue
<template>
  <div class="chat-widget">
    <!-- Your chat widget HTML -->
  </div>
</template>

<script>
import io from 'socket.io-client';

export default {
  data() {
    return {
      socket: null,
      ticketId: null,
      messages: []
    }
  },
  mounted() {
    this.socket = io('https://your-service-name.onrender.com');
    // ... setup event listeners
  }
}
</script>
```

## Testing Your Integration

1. Open your website with the integrated chat widget
2. Click the chat button
3. Fill out the form and submit
4. Check Discord for the new ticket channel
5. Send messages from both sides to test real-time sync

## Troubleshooting

### Widget Not Appearing

- Check browser console for JavaScript errors
- Verify Socket.io CDN is loaded
- Ensure CSS is properly included

### Can't Connect to Server

- Verify `SOCKET_URL` is correct and uses `https://`
- Check if your Render service is running
- Check CORS settings if on different domain

### Messages Not Sending

- Check browser console for errors
- Verify socket connection is established
- Ensure Discord bot is online

## Support

For issues with integration, refer to the main `README.md` or check the example in `public/index.html`.

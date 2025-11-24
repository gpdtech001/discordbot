# Website Integration Guide

This guide shows you how to add the Discord Support Chat widget to your website.

## Quick Start

There are three ways to integrate the chat widget:

1. **PHP Include Method** (Recommended for PHP sites) - Create a separate widget file and include it
2. **Direct Integration** - Copy the complete widget from `public/index.html`
3. **Framework Integration** - Use with React, Vue, or other frameworks

This guide covers all methods with step-by-step instructions.

---

## Method 1: PHP Include Integration (Recommended)

This method creates a reusable widget component that can be included on any page.

### Step 1: Create Widget File

Create a file called `chat-widget.php` in your site's root directory (or wherever appropriate):

```php
<!-- Chat Widget Component -->
<style>
    :root {
        --primary-color: #D4AF37;
        --primary-hover: #C5A028;
        --bg-color: #0F172A;
        --bg-secondary: #05080F;
        --text-primary: #F3E5AB;
        --text-secondary: #94A3B8;
        --border-color: rgba(212, 175, 55, 0.3);
        --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.3);
        --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3);
        --shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3);
        --font-serif: 'Playfair Display', serif;
        --font-sans: 'Inter', sans-serif;
    }

    /* Chat Widget Button */
    .chat-widget-button {
        position: fixed !important;
        bottom: 2rem !important;
        right: 2rem !important;
        width: 64px !important;
        height: 64px !important;
        background: var(--primary-color) !important;
        border-radius: 50% !important;
        display: flex !important;
        align-items: center;
        justify-content: center;
        cursor: pointer !important;
        box-shadow: var(--shadow-lg) !important;
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        z-index: 999999 !important;
        border: 1px solid var(--border-color) !important;
    }

    .chat-widget-button:hover {
        transform: translateY(-2px) scale(1.05);
        box-shadow: var(--shadow-xl);
        background: var(--primary-hover) !important;
    }

    .chat-widget-button svg {
        width: 32px;
        height: 32px;
        fill: var(--bg-secondary);
    }

    /* Notification Badge */
    .notification-badge {
        position: absolute;
        top: -2px;
        right: -2px;
        background-color: #ef4444;
        color: white;
        border-radius: 50%;
        min-width: 22px;
        height: 22px;
        padding: 0 6px;
        font-size: 0.75rem;
        display: flex;
        align-items: center;
        justify-content: center;
        font-weight: bold;
        border: 2px solid var(--bg-secondary);
        transform: scale(0);
        transition: transform 0.2s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: var(--font-sans);
    }

    .notification-badge.active {
        transform: scale(1);
    }

    /* Chat Widget Container */
    .chat-widget {
        position: fixed !important;
        bottom: calc(2rem + 80px) !important;
        right: 2rem !important;
        width: 380px;
        height: 650px;
        max-height: calc(100vh - 120px);
        background: var(--bg-color);
        border-radius: 16px;
        box-shadow: var(--shadow-xl);
        display: none;
        flex-direction: column;
        z-index: 999998 !important;
        overflow: hidden;
        border: 1px solid var(--border-color);
        opacity: 0;
        transform: translateY(20px) scale(0.95);
        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
        font-family: var(--font-sans);
    }

    /* ... (See full CSS in repository) ... */
</style>

<!-- Chat Widget Button -->
<button class="chat-widget-button" id="chatToggle">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
    <span class="notification-badge" id="notificationBadge">0</span>
</button>

<!-- Chat Widget -->
<div class="chat-widget" id="chatWidget">
    <!-- Full widget HTML here -->
</div>

<!-- Load Socket.io from CDN -->
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>

<script>
    // Configuration
    const SOCKET_URL = 'https://your-service-name.onrender.com';
    const PROJECT_NAME = 'Your Project Name';

    // ... (Full JavaScript implementation with history and notifications) ...
</script>
```

### Step 2: Include in Your Footer/Layout

Add this to your footer template (e.g., `footer.php`):

```php
<?php
// Include the chat widget
include_once 'chat-widget.php';
?>
```

---

## Method 2: Direct HTML Integration

For non-PHP sites or single-page integration.

### Step 1: Include Socket.io

Add this before your closing `</body>` tag:

```html
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>
```

### Step 2: Add the Widget HTML

```html
<!-- Chat Widget Button -->
<button class="chat-widget-button" id="chatToggle">
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24">
        <path d="M20 2H4c-1.1 0-2 .9-2 2v18l4-4h14c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2z" />
    </svg>
    <span class="notification-badge" id="notificationBadge">0</span>
</button>

<!-- Chat Widget -->
<div class="chat-widget" id="chatWidget">
    <!-- ... (Header, Form, Messages Container) ... -->
    <!-- See full example for structure -->
</div>
```

### Step 3: Add the JavaScript

```javascript
<script>
    // ===== CONFIGURATION =====
    const SOCKET_URL = 'https://your-service-name.onrender.com';
    const PROJECT_NAME = 'Your Project Name';

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
    const notificationBadge = document.getElementById('notificationBadge');

    // ===== STATE MANAGEMENT =====
    let socket;
    let userId = localStorage.getItem('wondersUserId') || generateUserId();
    let ticketId = localStorage.getItem('wondersTicketId') || null;
    let userDetails = JSON.parse(localStorage.getItem('wondersUserDetails') || 'null');
    let unreadCount = 0;

    // ===== CHAT HISTORY =====
    function getChatHistory() {
        const history = localStorage.getItem('wondersChatHistory');
        return history ? JSON.parse(history) : [];
    }

    function saveChatHistory(history) {
        localStorage.setItem('wondersChatHistory', JSON.stringify(history));
    }

    function appendToHistory(messageObj) {
        const history = getChatHistory();
        history.push(messageObj);
        saveChatHistory(history);
    }

    function clearChatHistory() {
        localStorage.removeItem('wondersChatHistory');
    }

    function loadChatHistory() {
        chatMessages.innerHTML = '';
        const history = getChatHistory();
        
        if (history.length === 0 && !ticketId) return;

        history.forEach(msg => {
            if (msg.type === 'system') {
                addSystemMessage(msg.text);
            } else {
                addMessage(msg.author || userDetails.name, msg.text, msg.type, msg.timestamp);
            }
        });
    }

    function generateUserId() {
        const id = 'user_' + Math.random().toString(36).substr(2, 9);
        localStorage.setItem('wondersUserId', id);
        return id;
    }

    // ===== SOCKET CONNECTION =====
    function connectSocket() {
        if (socket && socket.connected) return;

        socket = io(SOCKET_URL, {
            query: { userId: userId, ticketId: ticketId },
            reconnection: true
        });

        socket.on('connect', () => {
            console.log('Connected to server');
            updateStatus('online', 'Online');
            if (ticketId && userDetails) showChatInterface();
        });

        socket.on('disconnect', () => {
            updateStatus('offline', 'Offline');
            chatInput.disabled = true;
            sendButton.disabled = true;
        });

        socket.on('ticketCreated', (data) => {
            ticketId = data.ticketId;
            localStorage.setItem('wondersTicketId', ticketId);
            ticketNumber.textContent = `#${ticketId}`;
            chatInput.disabled = false;
            sendButton.disabled = false;

            const msg1 = `Support ticket created for ${PROJECT_NAME}!`;
            const msg2 = 'A support agent will be with you shortly.';
            addSystemMessage(msg1);
            addSystemMessage(msg2);
            appendToHistory({ type: 'system', text: msg1, timestamp: new Date().toISOString() });
            appendToHistory({ type: 'system', text: msg2, timestamp: new Date().toISOString() });
        });

        socket.on('messageFromDiscord', (data) => {
            addMessage(data.author, data.message, 'discord', data.timestamp);
            appendToHistory({ 
                type: 'discord', 
                author: data.author, 
                text: data.message, 
                timestamp: data.timestamp || new Date().toISOString() 
            });

            if (!chatWidget.classList.contains('active')) {
                unreadCount++;
                updateNotificationBadge();
            }
        });

        socket.on('ticketClosed', (data) => {
            const msg = `This ticket has been closed by ${data.closedBy}.`;
            addSystemMessage(msg);
            chatInput.disabled = true;
            sendButton.disabled = true;

            setTimeout(() => {
                localStorage.removeItem('wondersTicketId');
                localStorage.removeItem('wondersUserDetails');
                clearChatHistory();
                ticketId = null;
                userDetails = null;
                chatMessages.innerHTML = '';
                chatMessagesContainer.classList.remove('active');
                userFormContainer.classList.add('active');
                document.getElementById('userName').value = '';
                document.getElementById('userSubject').value = '';
            }, 5000);
        });

        socket.on('systemMessage', (message) => {
            addSystemMessage(message);
            appendToHistory({ type: 'system', text: message, timestamp: new Date().toISOString() });
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
        ticketNumber.textContent = ticketId ? `#${ticketId}` : '#loading...';
        if (socket && socket.connected) {
            chatInput.disabled = false;
            sendButton.disabled = false;
        }
        loadChatHistory();
    }

    function updateNotificationBadge() {
        if (unreadCount > 0) {
            notificationBadge.textContent = unreadCount > 9 ? '9+' : unreadCount;
            notificationBadge.classList.add('active');
        } else {
            notificationBadge.classList.remove('active');
        }
    }

    function addMessage(author, text, type = 'discord', timestamp = null) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${type === 'user' ? 'user' : ''}`;
        // ... (message HTML generation) ...
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function addSystemMessage(text) {
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message system';
        // ... (system message HTML generation) ...
        chatMessages.appendChild(messageDiv);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function escapeHtml(text) {
        if (!text) return '';
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // ===== EVENT LISTENERS =====
    chatToggle.addEventListener('click', () => {
        chatWidget.classList.add('active');
        unreadCount = 0;
        updateNotificationBadge();

        if (userDetails && ticketId) {
            if (!socket || !socket.connected) connectSocket();
            chatInput.focus();
        } else {
            document.getElementById('userName').focus();
        }
    });

    userDetailsForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation(); // Prevent global loader

        const name = document.getElementById('userName').value.trim();
        const subject = document.getElementById('userSubject').value.trim();

        if (!name || !subject) {
            alert('Please fill in all required fields');
            return;
        }

        if (!socket || !socket.connected) connectSocket();

        userDetails = { name, subject: `[${PROJECT_NAME}] ${subject}` };
        localStorage.setItem('wondersUserDetails', JSON.stringify(userDetails));

        socket.emit('createTicket', {
            userId: userId,
            userDetails: userDetails
        });

        showChatInterface();
    });

    function sendMessage() {
        const message = chatInput.value.trim();
        if (message && socket && socket.connected && ticketId) {
            socket.emit('messageFromWebsite', {
                userId: userId,
                ticketId: ticketId,
                userName: userDetails.name,
                message: message
            });

            addMessage(userDetails.name, message, 'user');
            appendToHistory({ 
                type: 'user', 
                author: userDetails.name, 
                text: message, 
                timestamp: new Date().toISOString() 
            });

            chatInput.value = '';
            chatInput.focus();
        }
    }

    chatForm.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        sendMessage();
        return false;
    });

    sendButton.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation();
        sendMessage();
        return false;
    });

    // ===== INITIALIZE =====
    connectSocket();
</script>
```

## Troubleshooting

### Common Issues and Solutions

| Issue | Root Cause | Solution |
|-------|-----------|----------|
| **Site Loading Animation Triggers** | Form submission bubbles to global handlers | Use `e.stopImmediatePropagation()` in form submit handlers. |
| **Chat History Lost on Reload** | No persistence mechanism | Implement `localStorage` logic as shown above. |
| **Scrolling Issues** | Flexbox container overflow | Add `overflow: hidden` to container and `min-height: 0` to message area. |
| **Widget Not Appearing** | Z-index or display issues | Check `z-index` (should be high, e.g., 999999) and `display: none` default state. |
| **Connection Drops** | Network issues or server sleep | Implement `reconnection: true` in Socket.io config. |

### Key Fixes Implemented

1.  **Global Loader Prevention**:
    The most critical fix for sites with global loaders is using `e.stopImmediatePropagation()`:
    ```javascript
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        e.stopImmediatePropagation(); // Stops the event from reaching global listeners
        // ...
    });
    ```

2.  **Scroll Optimization**:
    To ensure the chat messages scroll correctly within the modal:
    ```css
    .chat-messages-container {
        overflow: hidden; /* Constrain children */
        height: 100%;
    }
    .chat-messages {
        overflow-y: auto;
        min-height: 0; /* Allow flex child to scroll */
        height: 100%;
    }
    ```

3.  **Chat History Persistence**:
    We now use `localStorage` to save messages (`wondersChatHistory`) and restore them when the widget loads. This ensures users don't lose context if they refresh the page.

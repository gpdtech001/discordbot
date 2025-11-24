# Discord Support Chat System

A real-time support chat system that creates Discord tickets and connects website visitors with your Discord server support team via Socket.io.

## Features

- **Real-time Communication**: Instant messaging between website visitors and Discord support agents
- **Automatic Ticket Creation**: Each visitor gets a private Discord channel
- **Persistent Sessions**: Visitors can close/reopen the chat without losing their conversation
- **Mobile Responsive**: Works seamlessly on desktop and mobile devices
- **Easy Integration**: Simple embed script for any website

## How It Works

1. A visitor opens the chat widget on your website
2. They fill out a brief form (name and issue description)
3. A private ticket channel is created in your Discord server
4. Support agents in Discord can respond in real-time
5. Messages are synced instantly between the website and Discord
6. Agents can close tickets with `!close` command or the close button

## Prerequisites

- Node.js 16+ installed
- A Discord Bot Token ([Create one here](https://discord.com/developers/applications))
- A Discord server where the bot has permissions to create channels

## Discord Bot Setup

### 1. Create a Discord Bot

1. Go to [Discord Developer Portal](https://discord.com/developers/applications)
2. Click "New Application" and give it a name
3. Navigate to the "Bot" section
4. Click "Add Bot"
5. Copy the bot token (you'll need this for `.env`)

### 2. Configure Bot Permissions

In the "Bot" section:
- Enable "Message Content Intent"
- Enable "Server Members Intent"

### 3. Invite Bot to Your Server

1. Go to "OAuth2" > "URL Generator"
2. Select scopes: `bot`
3. Select permissions:
   - Manage Channels
   - Send Messages
   - Read Messages/View Channels
   - Read Message History
   - Embed Links
4. Copy the generated URL and open it to invite the bot

### 4. (Optional) Create a Ticket Category

1. In Discord, create a category called "Support Tickets"
2. Right-click the category > "Copy ID" (enable Developer Mode in settings if needed)
3. Add this ID to your `.env` file as `DISCORD_CATEGORY_ID`

## Installation

### Local Development

```bash
# Clone or download this repository
git clone <your-repo-url>
cd discordbot

# Install dependencies
npm install

# Copy .env.example to .env
cp .env.example .env

# Edit .env and add your Discord bot token
# DISCORD_BOT_TOKEN=your_token_here
nano .env

# Start the server
npm start
```

The server will run on `http://localhost:3000`

## Deployment to Render

### Quick Deploy

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Create Render Service**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository
   - Configure:
     - **Name**: `discord-support-bot` (or your choice)
     - **Environment**: `Node`
     - **Build Command**: `npm install`
     - **Start Command**: `npm start`
     - **Plan**: Free

3. **Add Environment Variables**

   In Render dashboard, go to "Environment" tab and add:

   | Key | Value |
   |-----|-------|
   | `DISCORD_BOT_TOKEN` | Your Discord bot token |
   | `DISCORD_CATEGORY_ID` | (Optional) Your category ID |
   | `PORT` | 3000 |

4. **Deploy**

   Click "Create Web Service" and wait for deployment to complete.

5. **Note Your Service URL**

   Your service will be available at: `https://your-service-name.onrender.com`

### Important Notes for Render

- The free tier spins down after 15 minutes of inactivity
- First request after spin-down may take 30-60 seconds
- Consider upgrading to a paid plan for production use
- Render automatically redeploys when you push to GitHub

## Environment Variables

Create a `.env` file with the following variables:

```env
# Required: Your Discord bot token
DISCORD_BOT_TOKEN=MTQ0MjUzOTMzMzg4NTM2MjI2Ng.GALrYT...

# Optional: Discord category ID for organizing tickets
DISCORD_CATEGORY_ID=1234567890123456789

# Server port (Render sets this automatically)
PORT=3000
```

## Integration with Your Website

### Option 1: Copy the Full Widget

Copy the entire widget HTML from `public/index.html` into your website, or:

### Option 2: Use This Embed Script

Add this to your website's HTML (before closing `</body>` tag):

```html
<!-- Load Socket.io -->
<script src="https://cdn.socket.io/4.5.4/socket.io.min.js"></script>

<!-- Load the chat widget CSS and JS -->
<link rel="stylesheet" href="https://your-service-name.onrender.com/widget.css">
<script src="https://your-service-name.onrender.com/widget.js"></script>

<script>
  // Initialize the chat widget
  initDiscordChat({
    socketUrl: 'https://your-service-name.onrender.com',
    position: 'bottom-right', // or 'bottom-left'
    primaryColor: '#5865F2'
  });
</script>
```

### Option 3: Direct Integration (Recommended)

See `INTEGRATION.md` for detailed integration instructions with code examples.

## API Endpoints

### `GET /health`
Health check endpoint

**Response:**
```json
{
  "status": "ok",
  "discord": "connected",
  "activeTickets": 5
}
```

### Socket.io Events

**Client → Server:**
- `createTicket` - Create a new support ticket
- `messageFromWebsite` - Send a message to Discord

**Server → Client:**
- `ticketCreated` - Ticket was created successfully
- `messageFromDiscord` - New message from support agent
- `ticketClosed` - Ticket was closed by agent
- `systemMessage` - System notification

## Discord Commands

Support agents can use these commands in ticket channels:

- `!close` or `!resolve` - Close the ticket and archive the channel
- Click the "🔒 Close Ticket" button - Same as above

## Testing Locally

1. Start the server: `npm start`
2. Open `http://localhost:3000` in your browser
3. Click the chat button and create a ticket
4. Check your Discord server for the new ticket channel
5. Send messages from both the website and Discord

## Troubleshooting

### Bot Not Connecting

- Verify your `DISCORD_BOT_TOKEN` is correct
- Check that "Message Content Intent" is enabled in Discord Developer Portal
- Ensure the bot is invited to your server

### Tickets Not Creating

- Verify the bot has "Manage Channels" permission
- If using `DISCORD_CATEGORY_ID`, ensure the ID is correct
- Check bot can see and access the category

### Messages Not Sending

- Ensure Socket.io URL is correct in your client code
- Check CORS settings if embedding on different domain
- Verify the server is running and accessible

### Render Deployment Issues

- Check environment variables are set correctly
- View logs in Render dashboard for errors
- Ensure `PORT` environment variable is set to 3000

## Project Structure

```
discordbot/
├── discord-bot.js          # Main server file
├── package.json            # Dependencies and scripts
├── .env                    # Environment variables (not in git)
├── .env.example            # Example environment variables
├── .gitignore              # Git ignore rules
├── public/
│   └── index.html          # Demo/example page
├── README.md               # This file
└── INTEGRATION.md          # Detailed integration guide
```

## Tech Stack

- **Backend**: Node.js, Express
- **Real-time**: Socket.io
- **Discord**: Discord.js v14
- **Frontend**: Vanilla JavaScript (no framework required)

## Security Notes

- Never commit your `.env` file to version control
- Keep your Discord bot token secret
- Use environment variables for all sensitive data
- On Render, set environment variables in the dashboard

## Support

For issues or questions:
1. Check the troubleshooting section above
2. Review Discord bot permissions
3. Check server logs for error messages

## License

MIT

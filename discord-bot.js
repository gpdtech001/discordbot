const { Client, GatewayIntentBits, EmbedBuilder, ChannelType, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
require('dotenv').config();

// Configuration
const PORT = process.env.PORT || 3000;
const DISCORD_TOKEN = process.env.DISCORD_BOT_TOKEN;
const CATEGORY_ID = process.env.DISCORD_CATEGORY_ID || null; // Optional: Category for tickets

// Validate required environment variables
if (!DISCORD_TOKEN) {
    console.error('ERROR: Missing DISCORD_BOT_TOKEN in .env file');
    process.exit(1);
}

// Express app setup
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});

app.use(cors());
app.use(express.json());

// Discord bot setup
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ]
});

// Store active tickets
const activeTickets = new Map(); // ticketId -> { channelId, userId, socketId, userDetails }
const userTickets = new Map();   // userId -> ticketId

// Discord bot events
client.once('ready', () => {
    console.log(`Discord bot logged in as ${client.user.tag}`);
    console.log('Ticket system ready!');
    if (CATEGORY_ID) {
        console.log(`Using category ID: ${CATEGORY_ID}`);
    } else {
        console.log('No category specified, tickets will be created at server root');
    }
});

client.on('messageCreate', async (message) => {
    // Ignore bot messages
    if (message.author.bot) return;

    console.log(`Message received in channel ${message.channel.id}: ${message.content}`);

    // Check if message is from a ticket channel
    const ticketEntry = Array.from(activeTickets.entries()).find(
        ([_, ticket]) => ticket.channelId === message.channel.id
    );

    if (ticketEntry) {
        const [ticketId, ticket] = ticketEntry;
        console.log(`Message from ticket ${ticketId}`);

        // Send message to website user
        const socketId = ticket.socketId;
        if (socketId) {
            io.to(socketId).emit('messageFromDiscord', {
                author: message.author.username,
                message: message.content,
                timestamp: message.createdTimestamp
            });
        }

        return;
    }

    // Handle ticket close command
    if (message.content.toLowerCase().startsWith('!close') ||
        message.content.toLowerCase().startsWith('!resolve')) {

        console.log('Close command detected');

        const ticketEntry = Array.from(activeTickets.entries()).find(
            ([_, ticket]) => ticket.channelId === message.channel.id
        );

        if (ticketEntry) {
            const [ticketId, ticket] = ticketEntry;
            console.log(`Closing ticket ${ticketId}`);
            await closeTicket(ticketId, message.author.username);
            await message.channel.send('✅ Ticket closed! Archiving channel in 5 seconds...');

            setTimeout(async () => {
                try {
                    await message.channel.delete();
                } catch (error) {
                    console.error('Error deleting channel:', error);
                }
            }, 5000);
        } else {
            console.log('No ticket found for this channel');
        }
    }
});

// Handle button interactions
client.on('interactionCreate', async (interaction) => {
    if (!interaction.isButton()) return;

    if (interaction.customId === 'close_ticket') {
        const ticketEntry = Array.from(activeTickets.entries()).find(
            ([_, ticket]) => ticket.channelId === interaction.channel.id
        );

        if (ticketEntry) {
            const [ticketId, ticket] = ticketEntry;
            await closeTicket(ticketId, interaction.user.username);
            await interaction.reply({ content: '✅ Ticket closed! Archiving channel...', ephemeral: false });

            setTimeout(async () => {
                try {
                    await interaction.channel.delete();
                } catch (error) {
                    console.error('Error deleting channel:', error);
                }
            }, 5000);
        }
    }
});

// Socket.io events
io.on('connection', (socket) => {
    const userId = socket.handshake.query.userId;
    const existingTicketId = socket.handshake.query.ticketId;

    console.log(`User connected: ${userId} (${socket.id})`);

    // Reconnect to existing ticket
    if (existingTicketId && activeTickets.has(existingTicketId)) {
        const ticket = activeTickets.get(existingTicketId);
        ticket.socketId = socket.id;
        console.log(`User ${userId} reconnected to ticket ${existingTicketId}`);
    }

    socket.on('createTicket', async (data) => {
        const { userId, userDetails } = data;

        // Check if user already has an active ticket
        if (userTickets.has(userId)) {
            const existingTicketId = userTickets.get(userId);
            const existingTicket = activeTickets.get(existingTicketId);

            if (existingTicket) {
                socket.emit('ticketCreated', {
                    ticketId: existingTicketId,
                    channelName: existingTicket.channelName
                });
                return;
            }
        }

        try {
            // Get the first guild (server) the bot is in
            const guild = client.guilds.cache.first();

            if (!guild) {
                socket.emit('error', { message: 'Bot is not in any Discord server' });
                return;
            }

            // Generate ticket ID
            const ticketId = generateTicketId();

            // Create channel name from user name and subject
            const sanitizedName = userDetails.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
            const sanitizedSubject = userDetails.subject.toLowerCase().replace(/[^a-z0-9]+/g, '-').substring(0, 30);
            const channelName = `${sanitizedName}-${sanitizedSubject}`.substring(0, 100);

            // Create private channel
            const channelOptions = {
                name: channelName,
                type: ChannelType.GuildText,
                permissionOverwrites: [
                    {
                        id: guild.id,
                        deny: [PermissionFlagsBits.ViewChannel],
                    },
                    {
                        id: client.user.id,
                        allow: [
                            PermissionFlagsBits.ViewChannel,
                            PermissionFlagsBits.SendMessages,
                            PermissionFlagsBits.ReadMessageHistory
                        ],
                    },
                ],
            };

            // Add category if specified
            if (CATEGORY_ID) {
                channelOptions.parent = CATEGORY_ID;
            }

            const channel = await guild.channels.create(channelOptions);

            // Send ticket information to Discord
            const embed = new EmbedBuilder()
                .setColor('#5865F2')
                .setTitle(`🎫 New Support Ticket - #${ticketId}`)
                .setDescription('A new support ticket has been created')
                .addFields(
                    { name: '👤 Name', value: userDetails.name },
                    { name: '📝 Subject', value: userDetails.subject },
                    { name: '🆔 User ID', value: userId }
                )
                .setFooter({ text: 'Click the button below or type !close to close this ticket' })
                .setTimestamp();

            // Create close button
            const row = new ActionRowBuilder()
                .addComponents(
                    new ButtonBuilder()
                        .setCustomId('close_ticket')
                        .setLabel('🔒 Close Ticket')
                        .setStyle(ButtonStyle.Danger)
                );

            await channel.send({ embeds: [embed], components: [row] });

            // Store ticket information
            activeTickets.set(ticketId, {
                channelId: channel.id,
                channelName: channelName,
                userId: userId,
                socketId: socket.id,
                userDetails: userDetails,
                createdAt: Date.now()
            });

            userTickets.set(userId, ticketId);

            // Notify website
            socket.emit('ticketCreated', {
                ticketId: ticketId,
                channelName: channelName
            });

            console.log(`Ticket created: ${ticketId} for user ${userId}`);

        } catch (error) {
            console.error('Error creating ticket:', error);
            socket.emit('error', { message: 'Failed to create ticket: ' + error.message });
        }
    });

    socket.on('messageFromWebsite', async (data) => {
        const { userId, ticketId, userName, message } = data;

        console.log(`Message from ${userName} (Ticket ${ticketId}): ${message}`);

        const ticket = activeTickets.get(ticketId);

        if (!ticket) {
            console.log(`Ticket ${ticketId} not found - notifying user`);
            socket.emit('ticketClosed', {
                ticketId: ticketId,
                closedBy: 'System'
            });
            socket.emit('systemMessage', 'This ticket has been closed. Please create a new ticket.');
            return;
        }

        try {
            const channel = await client.channels.fetch(ticket.channelId).catch(() => null);

            if (!channel) {
                console.log(`Channel for ticket ${ticketId} not found - closing ticket`);
                await closeTicket(ticketId, 'System');
                socket.emit('ticketClosed', {
                    ticketId: ticketId,
                    closedBy: 'System'
                });
                socket.emit('systemMessage', 'This ticket channel no longer exists. Please create a new ticket.');
                return;
            }

            // Create embed for the message
            const embed = new EmbedBuilder()
                .setColor('#43b581')
                .setAuthor({
                    name: userName,
                    iconURL: 'https://cdn.discordapp.com/embed/avatars/0.png'
                })
                .setDescription(message)
                .setTimestamp();

            // Send to Discord
            await channel.send({ embeds: [embed] });

            console.log(`Message sent to Discord ticket ${ticketId}`);
        } catch (error) {
            console.error('Error sending message to Discord:', error);

            // If channel was deleted, clean up the ticket
            if (error.code === 10003 || error.code === 50001) {
                console.log(`Channel deleted, cleaning up ticket ${ticketId}`);
                await closeTicket(ticketId, 'System');
                socket.emit('ticketClosed', {
                    ticketId: ticketId,
                    closedBy: 'System'
                });
            }

            socket.emit('systemMessage', 'Unable to send message. Ticket may have been closed.');
        }
    });

    socket.on('disconnect', () => {
        console.log(`User disconnected: ${userId} (${socket.id})`);
        // Don't delete ticket on disconnect, keep it active
    });
});

async function closeTicket(ticketId, closedBy = 'System') {
    const ticket = activeTickets.get(ticketId);

    if (!ticket) return;

    // Notify website user
    if (ticket.socketId) {
        io.to(ticket.socketId).emit('ticketClosed', {
            ticketId: ticketId,
            closedBy: closedBy
        });
    }

    // Remove from maps
    activeTickets.delete(ticketId);
    userTickets.delete(ticket.userId);

    console.log(`Ticket ${ticketId} closed by ${closedBy}`);
}

function generateTicketId() {
    const timestamp = Date.now().toString(36);
    const random = Math.random().toString(36).substr(2, 5);
    return `${timestamp}-${random}`.toUpperCase();
}

// Health check endpoint
app.get('/health', (req, res) => {
    res.json({
        status: 'ok',
        discord: client.user ? 'connected' : 'disconnected',
        activeTickets: activeTickets.size
    });
});

// Start server
server.listen(PORT, () => {
    console.log(`Socket.io server running on port ${PORT}`);
});

// Login to Discord
client.login(DISCORD_TOKEN).catch(error => {
    console.error('Failed to login to Discord:', error);
    process.exit(1);
});

// Graceful shutdown
process.on('SIGINT', () => {
    console.log('Shutting down gracefully...');
    client.destroy();
    server.close(() => {
        console.log('Server closed');
        process.exit(0);
    });
});

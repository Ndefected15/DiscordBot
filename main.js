const { client, botConfig } = require('./discordClient');
require('./messageHandler');
require('./cronJob');

// Log in to Discord with the bot token
client.login(botConfig.botToken);

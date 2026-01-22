const { client, botConfig, slashRegister } = require('./discordClient');
const { extractMessages } = require('./messageHandler');

require('./cronJob');
require('./messageHandler');

client.once('ready', async () => {
	console.log('Bot connected to Discord');

	try {
		await slashRegister();
		await extractMessages(client);
		console.log('Startup tasks completed');
	} catch (err) {
		console.error('Startup error:', err);
	}
});

client.login(botConfig.botToken);

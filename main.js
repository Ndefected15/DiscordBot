const { client, botConfig, slashRegister } = require('./discordClient');
const { extractMessages } = require('./messageHandler');
const { backfillRealestStats } = require('./statsManager');

require('./cronJob');
require('./messageHandler');

const REALST_CHANNEL_ID = '1066395020405518376'; // Channel where "the realest" messages are sent

client.once('ready', async () => {
	console.log('Bot connected to Discord');

	try {
		// Register slash commands
		await slashRegister();

		// Extract messages (attachments, BeFrs)
		await extractMessages(client);
		console.log('Initial message extraction complete');

		// Backfill historical "the realest" messages to populate stats.json
		await backfillRealestStats(REALST_CHANNEL_ID);
		console.log('Historical "the realest" stats backfill complete');

		console.log('Startup tasks completed successfully');
	} catch (err) {
		console.error('Startup error:', err);
	}
});

client.login(botConfig.botToken);

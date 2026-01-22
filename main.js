const { client, botConfig, slashRegister } = require('./discordClient');
const { extractMessages } = require('./messageHandler');
const { backfillRealestStats, resetPeriod } = require('./statsManager');

require('./cronJob');
require('./messageHandler');

client.once('ready', async () => {
	console.log('Bot connected to Discord');

	try {
		// Register slash commands
		await slashRegister();

		// Extract all messages to populate the cache
		await extractMessages(client);
		console.log('Initial message extraction complete');

		// -------------------------------
		// BACKFILL "THE REALEST" STATS
		// -------------------------------
		const channelId = '1066395020405518376';

		// Backfill all historical "the realest" messages
		// Pass the client so it can fetch messages properly
		await backfillRealestStats(client, channelId);

		// Reset week/month/year stats to start fresh
		resetPeriod('week');
		resetPeriod('month');
		resetPeriod('year');

		console.log(
			'Historical "the realest" stats backfill complete for all periods',
		);

		console.log('Startup tasks completed successfully');
	} catch (err) {
		console.error('Startup error:', err);
	}
});

// Login to Discord
client.login(botConfig.botToken);

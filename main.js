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

		// 1️⃣ All-time stats
		await backfillRealestStats('1066395020405518376'); // Channel ID

		// 2️⃣ Reset and track week/month/year separately
		// This ensures week/month/year stats start fresh but historical messages count for allTime
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

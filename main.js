const { client, botConfig, slashRegister } = require('./discordClient');
const { extractMessages } = require('./messageHandler');
const { backfillRealestStats, resetPeriod } = require('./statsManager');

// Require cron jobs (they now handle daily, weekly, monthly, yearly resets automatically)
require('./cronJob');

client.once('ready', async () => {
	console.log('Bot connected to Discord');

	try {
		// Register slash commands
		await slashRegister();

		// Extract messages to populate cache
		await extractMessages(client);
		console.log('Initial message extraction complete');

		// -------------------------------
		// BACKFILL "THE REALEST" STATS
		// -------------------------------

		// 1️⃣ All-time stats
		await backfillRealestStats(client, '1066395020405518376'); // ✅ pass client

		// 2️⃣ Reset week/month/year
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

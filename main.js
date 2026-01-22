const { client, botConfig, slashRegister } = require('./discordClient');
const { extractMessages } = require('./messageHandler');
const { backfillRealestStats, resetPeriod } = require('./statsManager');

// Require cron jobs (they now handle daily, weekly, monthly, yearly resets automatically)
require('./cronJob');

client.once('ready', async () => {
	console.log('Bot connected to Discord');

	try {
		// 1️⃣ Register slash commands
		await slashRegister();

		// 2️⃣ Extract all messages to populate cache
		await extractMessages(client);
		console.log('Initial message extraction complete');

		// 3️⃣ Backfill "the realest" stats for historical messages
		// Only all-time counts; week/month/year will reset via cron
		await backfillRealestStats(client, '1066395020405518376'); // Pass client + channel ID

		// 4️⃣ Reset week/month/year counters so future stats track correctly
		resetPeriod('week');
		resetPeriod('month');
		resetPeriod('year');

		console.log('Historical "the realest" backfill complete for all periods');
		console.log('Startup tasks completed successfully');
	} catch (err) {
		console.error('Startup error:', err);
	}
});

// Login to Discord
client.login(botConfig.botToken);

const { client, botConfig, slashRegister } = require('./discordClient');
const { extractMessages } = require('./messageHandler');
const { backfillRealestStats, resetPeriod } = require('./statsManager');

// Ensure cron jobs are initialized
require('./cronJob');
require('./messageHandler');

const CHANNEL_ID = '1066395020405518376';

(async () => {
	try {
		console.log('🔹 Starting bot...');

		// Login first
		await client.login(botConfig.botToken);
		console.log('🔹 Logged in to Discord successfully');

		// Wait until client is ready
		client.once('ready', async () => {
			console.log('🔹 Client is ready');

			// 1️⃣ Register slash commands
			await slashRegister();

			// 2️⃣ Extract historical messages to populate cache
			await extractMessages(client);
			console.log('🔹 Initial message extraction complete');

			// 3️⃣ Backfill stats
			console.log('🔹 Starting backfill for all periods...');

			// All-time stats: backfill everything
			await backfillRealestStats(client, CHANNEL_ID, 'allTime');

			// Week stats: backfill only past 7 days
			await backfillRealestStats(client, CHANNEL_ID, 'week', 7);

			// Month stats: backfill past 30 days
			await backfillRealestStats(client, CHANNEL_ID, 'month', 30);

			// Year stats: backfill past 365 days
			await backfillRealestStats(client, CHANNEL_ID, 'year', 365);

			console.log('🔹 Historical "the realest" stats backfill complete');

			// 4️⃣ Reset week/month/year to start fresh after backfill
			resetPeriod('week');
			resetPeriod('month');
			resetPeriod('year');

			console.log('✅ Startup tasks completed successfully');
		});
	} catch (err) {
		console.error('❌ Startup error:', err);
	}
})();

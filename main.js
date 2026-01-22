const { client, botConfig, slashRegister } = require('./discordClient');
const { extractMessages } = require('./messageHandler');
const { backfillRealestStats, resetPeriod } = require('./statsManager');

// Initialize cron jobs
require('./cronJob');

const CHANNEL_ID = '1066395020405518376';

(async () => {
	try {
		console.log('🔹 Starting bot...');

		// 1️⃣ Login first
		await client.login(botConfig.botToken);
		console.log('🔹 Logged in to Discord successfully');

		// 2️⃣ Wait until client is ready
		client.once('ready', async () => {
			console.log(`✅ Client ready as ${client.user.tag}`);

			// 3️⃣ Register slash commands
			try {
				await slashRegister();
				console.log('✅ Slash commands registered successfully');
			} catch (err) {
				console.error('❌ Failed to register slash commands:', err);
			}

			// 4️⃣ Extract historical messages for cache
			try {
				await extractMessages(client);
				console.log('✅ Initial message extraction complete');
			} catch (err) {
				console.error('❌ Failed to extract messages:', err);
			}

			// 5️⃣ Backfill stats for all periods
			try {
				console.log('🔹 Starting backfill for all periods...');

				await backfillRealestStats(client, CHANNEL_ID, 'allTime'); // full history
				await backfillRealestStats(client, CHANNEL_ID, 'week', 7); // past 7 days
				await backfillRealestStats(client, CHANNEL_ID, 'month', 30); // past 30 days
				await backfillRealestStats(client, CHANNEL_ID, 'year', 365); // past 365 days

				console.log('✅ Historical "the realest" stats backfill complete');
			} catch (err) {
				console.error('❌ Backfill failed:', err);
			}

			// 6️⃣ Reset weekly/monthly/yearly stats to start fresh
			try {
				resetPeriod('week');
				resetPeriod('month');
				resetPeriod('year');
				console.log('✅ Periodic stats reset successfully');
			} catch (err) {
				console.error('❌ Failed to reset periods:', err);
			}

			console.log('✅ Startup tasks completed successfully');
		});
	} catch (err) {
		console.error('❌ Startup error:', err);
	}
})();

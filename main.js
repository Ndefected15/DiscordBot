const { client, botConfig, slashRegister } = require('./discordClient');
const { extractMessages } = require('./messageHandler');
const { backfillRealestStats, resetPeriod } = require('./statsManager');

require('./cronJob'); // cron jobs will now also wait for client ready

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

		const channelId = '1066395020405518376';

		// 1️⃣ Backfill all-time stats
		await backfillRealestStats(client, channelId, 'allTime');

		// 2️⃣ Backfill week stats (past 7 days)
		await backfillRealestStats(client, channelId, 'week', 7);

		// 3️⃣ Backfill month stats (past 30 days)
		await backfillRealestStats(client, channelId, 'month', 30);

		// 4️⃣ Backfill year stats (past 365 days)
		await backfillRealestStats(client, channelId, 'year', 365);

		console.log(
			'Historical "the realest" stats backfill complete for all periods',
		);

		// Reset periodic stats at start of each period (week/month/year)
		resetPeriod('week');
		resetPeriod('month');
		resetPeriod('year');

		console.log('Startup tasks completed successfully');
	} catch (err) {
		console.error('Startup error:', err);
	}
});

client.login(botConfig.botToken);

// main.js
const { client, botConfig, slashRegister } = require('./discordClient');
const { extractMessages } = require('./messageHandler');
const { backfillRealestStats, resetPeriod } = require('./statsManager');

// Make sure cron jobs are initialized
require('./cronJob');
require('./messageHandler');

const CHANNEL_ID = '1066395020405518376';

client.once('ready', async () => {
	console.log('Bot connected to Discord');

	try {
		// 1️⃣ Register slash commands
		await slashRegister();

		// 2️⃣ Extract historical messages to populate cache
		await extractMessages(client);
		console.log('Initial message extraction complete');

		// 3️⃣ BACKFILL STATS
		console.log('Starting backfill for all periods...');

		// All-time stats: backfill everything
		await backfillRealestStats(client, CHANNEL_ID, 'allTime');

		// Week stats: only backfill messages from past 7 days
		await backfillRealestStats(client, CHANNEL_ID, 'week', 7);

		// Month stats: only backfill messages from past 30 days
		await backfillRealestStats(client, CHANNEL_ID, 'month', 30);

		// Year stats: only backfill messages from past 365 days
		await backfillRealestStats(client, CHANNEL_ID, 'year', 365);

		console.log('Historical "the realest" stats backfill complete');

		// 4️⃣ Reset periodic stats to start fresh
		resetPeriod('week');
		resetPeriod('month');
		resetPeriod('year');

		console.log('Startup tasks completed successfully');
	} catch (err) {
		console.error('Startup error:', err);
	}
});

// 5️⃣ Login to Discord
client.login(botConfig.botToken);

const fs = require('fs');
const path = require('path');
const { client } = require('./discordClient');

const statsFile = path.join(__dirname, 'stats.json');
let stats = {};

// Load existing stats
if (fs.existsSync(statsFile)) {
	try {
		stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
	} catch (err) {
		console.error('Failed to load stats file:', err);
		stats = {};
	}
}

function incrementRealest(userId) {
	if (!stats[userId])
		stats[userId] = { allTime: 0, week: 0, month: 0, year: 0 };
	stats[userId].allTime++;
	stats[userId].week++;
	stats[userId].month++;
	stats[userId].year++;
	saveStats();
}

function resetPeriod(period) {
	for (const userId in stats) {
		if (stats[userId][period] !== undefined) stats[userId][period] = 0;
	}
	saveStats();
}

function getLeaderboard(period) {
	const leaderboard = [];
	for (const userId in stats) {
		leaderboard.push({ userId, count: stats[userId][period] || 0 });
	}
	leaderboard.sort((a, b) => b.count - a.count);
	return leaderboard;
}

function saveStats() {
	try {
		fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf8');
	} catch (err) {
		console.error('Failed to save stats:', err);
	}
}

/**
 * BACKFILL HISTORICAL "THE REALEST" MESSAGES
 * @param {string} channelId - ID of the channel to scan
 */
async function backfillRealestStats(channelId) {
	console.log('Starting backfill of "the realest" stats...');
	const channel = await client.channels.fetch(channelId);
	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	let lastMessageId = null;
	let totalProcessed = 0;

	do {
		const options = { limit: 100 };
		if (lastMessageId) options.before = lastMessageId;

		const messages = await channel.messages.fetch(options);
		lastMessageId = messages.lastKey();

		messages.forEach((msg) => {
			if (!msg.content) return;
			// Match pattern "<@USERID> is the realest today"
			const match = msg.content.match(/<@!?(\d+)> is the realest today/);
			if (match) {
				const userId = match[1];
				incrementRealest(userId);
				totalProcessed++;
			}
		});

		// Optional delay to avoid rate limits
		await sleep(500);
	} while (lastMessageId);

	console.log(
		`Backfill complete! Total "realest" messages processed: ${totalProcessed}`,
	);
}

module.exports = {
	stats,
	incrementRealest,
	resetPeriod,
	getLeaderboard,
	backfillRealestStats,
};

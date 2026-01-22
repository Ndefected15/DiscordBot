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

// Initialize user if not exists
function initUser(userId) {
	if (!stats[userId])
		stats[userId] = { allTime: 0, week: 0, month: 0, year: 0 };
}

// Increment stats for a user
function incrementRealest(
	userId,
	periods = ['allTime', 'week', 'month', 'year'],
) {
	initUser(userId);
	periods.forEach((period) => {
		stats[userId][period]++;
	});
	saveStats();
}

// Reset a period
function resetPeriod(period) {
	for (const userId in stats) {
		if (stats[userId][period] !== undefined) stats[userId][period] = 0;
	}
	saveStats();
}

// Get leaderboard for a period
function getLeaderboard(period) {
	const leaderboard = [];
	for (const userId in stats) {
		leaderboard.push({ userId, count: stats[userId][period] || 0 });
	}
	leaderboard.sort((a, b) => b.count - a.count);
	return leaderboard;
}

// Save stats
function saveStats() {
	try {
		fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf8');
	} catch (err) {
		console.error('Failed to save stats:', err);
	}
}

/**
 * Backfill historical "the realest" stats
 * Calculates week, month, year, and all-time
 * @param {string} channelId
 */
async function backfillRealestStats(channelId) {
	console.log('Starting backfill of "the realest" stats...');

	const channel = await client.channels.fetch(channelId);
	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	let lastMessageId = null;
	let totalProcessed = 0;

	const now = new Date();

	do {
		const options = { limit: 100 };
		if (lastMessageId) options.before = lastMessageId;

		const messages = await channel.messages.fetch(options);
		lastMessageId = messages.lastKey();

		messages.forEach((msg) => {
			if (!msg.content) return;

			// Match pattern "<@USERID> is the realest today"
			const match = msg.content.match(/<@!?(\d+)> is the realest today/);
			if (!match) return;

			const userId = match[1];
			const messageDate = new Date(msg.createdTimestamp);

			const periods = ['allTime'];

			// Week: within last 7 days
			if ((now - messageDate) / (1000 * 60 * 60 * 24) <= 7)
				periods.push('week');

			// Month: within last 30 days
			if ((now - messageDate) / (1000 * 60 * 60 * 24) <= 30)
				periods.push('month');

			// Year: within last 365 days
			if ((now - messageDate) / (1000 * 60 * 60 * 24) <= 365)
				periods.push('year');

			incrementRealest(userId, periods);
			totalProcessed++;
		});

		await sleep(500);
	} while (lastMessageId);

	console.log(
		`Backfill complete! Total "realest" messages processed: ${totalProcessed}`,
	);
	saveStats();
}

module.exports = {
	stats,
	incrementRealest,
	resetPeriod,
	getLeaderboard,
	backfillRealestStats,
};

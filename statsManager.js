const fs = require('fs');
const path = require('path');

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

/**
 * Initialize a user if not already in stats
 */
function initUser(userId) {
	if (!stats[userId]) {
		stats[userId] = { allTime: 0, week: 0, month: 0, year: 0 };
	}
}

/**
 * Increment stats for a user
 * periods: array of periods to increment (default: all)
 */
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

/**
 * Reset stats for a given period (week/month/year)
 */
function resetPeriod(period) {
	for (const userId in stats) {
		if (stats[userId][period] !== undefined) stats[userId][period] = 0;
	}
	saveStats();
}

/**
 * Get leaderboard for a specific period
 */
function getLeaderboard(period) {
	const leaderboard = [];
	for (const userId in stats) {
		leaderboard.push({ userId, count: stats[userId][period] || 0 });
	}
	leaderboard.sort((a, b) => b.count - a.count);
	return leaderboard;
}

/**
 * Save stats to JSON file
 */
function saveStats() {
	try {
		fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf8');
	} catch (err) {
		console.error('Failed to save stats:', err);
	}
}

/**
 * Backfill historical "the realest" stats from a channel
 * Populates all-time, week, month, and year stats
 * @param {Client} client - logged-in Discord.js client
 * @param {string} channelId - ID of the channel to scan
 */
async function backfillRealestStats(client, channelId) {
	console.log('Starting backfill of "the realest" stats...');
	const channel = await client.channels.fetch(channelId);
	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
	let lastMessageId = null;
	let totalProcessed = 0;

	const now = Date.now();

	do {
		const options = { limit: 100 };
		if (lastMessageId) options.before = lastMessageId;

		const messages = await channel.messages.fetch(options);
		lastMessageId = messages.lastKey();

		messages.forEach((msg) => {
			if (!msg.content) return;

			const match = msg.content.match(/<@!?(\d+)> is the realest today/);
			if (match) {
				const userId = match[1];

				// Determine which periods this message counts for
				const periods = ['allTime'];
				const ageMs = now - msg.createdTimestamp;
				const dayMs = 24 * 60 * 60 * 1000;

				if (ageMs <= 7 * dayMs) periods.push('week');
				if (ageMs <= 30 * dayMs) periods.push('month');
				if (ageMs <= 365 * dayMs) periods.push('year');

				incrementRealest(userId, periods);
				totalProcessed++;
			}
		});

		await sleep(500); // avoid hitting rate limits
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

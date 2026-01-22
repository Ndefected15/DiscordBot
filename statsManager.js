// statsManager.js
const fs = require('fs');
const path = require('path');

const statsFile = path.join(__dirname, 'stats.json');
let stats = {};

// Load existing stats from file
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
 * periods: array of periods to increment
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
 * Reset stats for a specific period
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
 * Backfill "the realest" stats from a Discord channel
 * @param {Client} client - logged-in Discord.js client
 * @param {string} channelId - ID of the channel to scan
 * @param {string} period - 'allTime', 'week', 'month', or 'year'
 * @param {number} days - optional, number of days to backfill for week/month/year
 */
async function backfillRealestStats(
	client,
	channelId,
	period = 'allTime',
	days = 0,
) {
	console.log(`Starting backfill for period: ${period}...`);
	if (!client || !client.channels) {
		console.error('Discord client not ready for backfill');
		return;
	}

	try {
		const channel = await client.channels.fetch(channelId);
		const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
		let lastMessageId = null;
		let totalProcessed = 0;
		const now = Date.now();
		const dayMs = 24 * 60 * 60 * 1000;

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

					// Determine if this message falls into the period
					let include = false;
					if (period === 'allTime') include = true;
					else if (days > 0 && now - msg.createdTimestamp <= days * dayMs)
						include = true;

					if (include) {
						incrementRealest(userId, [period]);
						totalProcessed++;
					}
				}
			});

			await sleep(500); // avoid rate limits
		} while (lastMessageId);

		console.log(
			`Backfill complete for ${period}! Messages processed: ${totalProcessed}`,
		);
		saveStats();
	} catch (err) {
		console.error('Backfill failed:', err);
	}
}

module.exports = {
	stats,
	incrementRealest,
	resetPeriod,
	getLeaderboard,
	backfillRealestStats,
};

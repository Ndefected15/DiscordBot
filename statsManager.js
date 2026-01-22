const fs = require('fs');
const path = require('path');

const statsFile = path.join(__dirname, 'stats.json');
let stats = {};

// --------------------
// LOAD STATS
// --------------------
if (fs.existsSync(statsFile)) {
	try {
		stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
	} catch (err) {
		console.error('❌ Failed to load stats file:', err);
		stats = {};
	}
}

// --------------------
// HELPERS
// --------------------
function initUser(userId) {
	if (!stats[userId]) {
		stats[userId] = {
			allTime: 0,
			week: 0,
			month: 0,
			year: 0,
		};
	}
}

function saveStats() {
	try {
		fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf8');
	} catch (err) {
		console.error('❌ Failed to save stats:', err);
	}
}

// --------------------
// LIVE INCREMENT (used when "the realest" happens)
// --------------------
function incrementRealest(
	userId,
	periods = ['allTime', 'week', 'month', 'year'],
) {
	initUser(userId);

	for (const period of periods) {
		if (stats[userId][period] !== undefined) {
			stats[userId][period]++;
		}
	}

	saveStats();
}

// --------------------
// RESET PERIOD
// --------------------
function resetPeriod(period) {
	for (const userId in stats) {
		if (stats[userId][period] !== undefined) {
			stats[userId][period] = 0;
		}
	}
	saveStats();
}

// --------------------
// LEADERBOARD
// --------------------
function getLeaderboard(period) {
	return Object.entries(stats)
		.map(([userId, data]) => ({
			userId,
			count: data[period] || 0,
		}))
		.sort((a, b) => b.count - a.count);
}

// --------------------
// BACKFILL
// --------------------
/**
 * Backfill "the realest" stats
 *
 * @param {Client} client
 * @param {string} channelId
 * @param {'allTime'|'week'|'month'|'year'} period
 * @param {number|null} daysBack - null for allTime
 */
async function backfillRealestStats(
	client,
	channelId,
	period = 'allTime',
	daysBack = null,
) {
	console.log(`🔹 Starting backfill for period: ${period}...`);

	const channel = await client.channels.fetch(channelId);
	const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

	let lastMessageId = null;
	let processed = 0;
	const now = Date.now();
	const maxAgeMs = daysBack ? daysBack * 24 * 60 * 60 * 1000 : null;

	do {
		const options = { limit: 100 };
		if (lastMessageId) options.before = lastMessageId;

		const messages = await channel.messages.fetch(options);
		lastMessageId = messages.lastKey();

		for (const msg of messages.values()) {
			if (!msg.content) continue;

			const match = msg.content.match(/<@!?(\d+)> is the realest today/);
			if (!match) continue;

			// Skip messages outside time window
			if (maxAgeMs) {
				const age = now - msg.createdTimestamp;
				if (age > maxAgeMs) continue;
			}

			const userId = match[1];
			initUser(userId);
			stats[userId][period]++;
			processed++;
		}

		await sleep(500);
	} while (lastMessageId);

	saveStats();
	console.log(
		`✅ Backfill complete for ${period}. Messages processed: ${processed}`,
	);
}

// --------------------
module.exports = {
	stats,
	incrementRealest,
	resetPeriod,
	getLeaderboard,
	backfillRealestStats,
};

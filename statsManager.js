const fs = require('fs');
const path = require('path');

const statsFile = path.join(__dirname, 'stats.json');

// In-memory stats
// Structure: { userId: { allTime: 0, week: 0, month: 0, year: 0 } }
let stats = {};

// Load stats from file if exists
if (fs.existsSync(statsFile)) {
	try {
		stats = JSON.parse(fs.readFileSync(statsFile, 'utf8'));
	} catch (err) {
		console.error('Failed to load stats file:', err);
		stats = {};
	}
}

// Increment a user’s realest count
function incrementRealest(userId) {
	if (!stats[userId]) {
		stats[userId] = { allTime: 0, week: 0, month: 0, year: 0 };
	}
	stats[userId].allTime++;
	stats[userId].week++;
	stats[userId].month++;
	stats[userId].year++;

	saveStats();
}

// Reset periodic stats
function resetPeriod(period) {
	for (const userId in stats) {
		if (stats[userId][period] !== undefined) {
			stats[userId][period] = 0;
		}
	}
	saveStats();
}

// Get leaderboard for a period
function getLeaderboard(period) {
	const leaderboard = [];
	for (const userId in stats) {
		leaderboard.push({ userId, count: stats[userId][period] || 0 });
	}
	// Sort descending by count
	leaderboard.sort((a, b) => b.count - a.count);
	return leaderboard;
}

// Save stats to file
function saveStats() {
	try {
		fs.writeFileSync(statsFile, JSON.stringify(stats, null, 2), 'utf8');
	} catch (err) {
		console.error('Failed to save stats:', err);
	}
}

module.exports = { stats, incrementRealest, resetPeriod, getLeaderboard };

const fs = require('fs');
const path = require('path');

const DATA_PATH = path.join(__dirname, 'befrStats.json');

const defaultStats = {
	allTime: {},
	week: {},
	month: {},
	year: {},
};

let stats = loadStats();

/* ---------------- LOAD / SAVE ---------------- */

function loadStats() {
	if (!fs.existsSync(DATA_PATH)) {
		fs.writeFileSync(DATA_PATH, JSON.stringify(defaultStats, null, 2));
		return structuredClone(defaultStats);
	}

	try {
		return JSON.parse(fs.readFileSync(DATA_PATH, 'utf8'));
	} catch (err) {
		console.error('Failed to load stats file, resetting:', err);
		return structuredClone(defaultStats);
	}
}

function saveStats() {
	fs.writeFileSync(DATA_PATH, JSON.stringify(stats, null, 2));
}

/* ---------------- MUTATION ---------------- */

function incrementRealest(userId) {
	for (const bucket of ['allTime', 'week', 'month', 'year']) {
		stats[bucket][userId] = (stats[bucket][userId] || 0) + 1;
	}
	saveStats();
}

/* ---------------- RESET HELPERS ---------------- */

function resetWeek() {
	stats.week = {};
	saveStats();
}

function resetMonth() {
	stats.month = {};
	saveStats();
}

function resetYear() {
	stats.year = {};
	saveStats();
}

/* ---------------- READ HELPERS ---------------- */

function getStats(period = 'allTime') {
	return stats[period] || {};
}

module.exports = {
	incrementRealest,
	getStats,
	resetWeek,
	resetMonth,
	resetYear,
};

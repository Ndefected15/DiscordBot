const {
	getAllTimeStats,
	getWeeklyStats,
	getMonthlyStats,
	getYearlyStats,
} = require('./statsManager');

/**
 * Handle /befr_scoreboard command
 */
async function handleScoreboard(interaction) {
	try {
		// Defer reply so Discord knows we are working on it
		if (!interaction.deferred && !interaction.replied) {
			await interaction.deferReply();
		}

		const period = interaction.options.getString('period') || 'all';
		let leaderboard;

		switch (period) {
			case 'week':
				leaderboard = getWeeklyStats();
				break;
			case 'month':
				leaderboard = getMonthlyStats();
				break;
			case 'year':
				leaderboard = getYearlyStats();
				break;
			case 'all':
			default:
				leaderboard = getAllTimeStats();
				break;
		}

		if (!leaderboard || leaderboard.length === 0) {
			return interaction.editReply('No stats available yet.');
		}

		// Format the leaderboard nicely
		const topEntries = leaderboard.slice(0, 20); // show only top 20 to avoid huge messages
		const formatted = topEntries
			.map((entry, index) => `${index + 1}. <@${entry.userId}> — ${entry.count}`)
			.join('\n');

		const titleMap = {
			all: 'All Time BeFr Scoreboard',
			week: 'Weekly BeFr Scoreboard',
			month: 'Monthly BeFr Scoreboard',
			year: 'Yearly BeFr Scoreboard',
		};

		await interaction.editReply({
			content: `**${titleMap[period] || 'BeFr Scoreboard'}**\n${formatted}`,
		});
	} catch (err) {
		console.error('Error in handleScoreboard:', err);
		try {
			// Only attempt editReply if not already replied
			if (!interaction.replied) {
				await interaction.editReply(
					'Something went wrong fetching the scoreboard 😔'
				);
			}
		} catch {}
	}
}

module.exports = { handleScoreboard };

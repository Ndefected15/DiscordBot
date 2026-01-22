const { getStats } = require('./statsManager');

/**
 * /befr_scoreboard handler
 */
async function handleScoreboard(interaction) {
	const period = interaction.options.getString('period') || 'allTime';

	const stats = getStats(period);
	const entries = Object.entries(stats);

	if (entries.length === 0) {
		return interaction.editReply(
			`No stats available for **${formatPeriod(period)}** yet.`,
		);
	}

	// Sort descending
	entries.sort((a, b) => b[1] - a[1]);

	const lines = entries.map(
		([userId, count], index) => `**${index + 1}.** <@${userId}> — **${count}**`,
	);

	await interaction.editReply({
		content: `🏆 **BeFr Scoreboard — ${formatPeriod(period)}** 🏆\n\n${lines.join(
			'\n',
		)}`,
	});
}

function formatPeriod(period) {
	switch (period) {
		case 'week':
			return 'This Week';
		case 'month':
			return 'This Month';
		case 'year':
			return 'This Year';
		default:
			return 'All Time';
	}
}

module.exports = { handleScoreboard };

const { getLeaderboard } = require('./statsManager');

async function handleScoreboard(interaction, { ephemeral = false } = {}) {
	try {
		const period =
			interaction.options.getString('period') === 'all'
				? 'allTime'
				: interaction.options.getString('period');

		const leaderboard = getLeaderboard(period);

		if (!leaderboard.length) {
			return interaction.editReply({
				content: 'No stats found yet.',
				ephemeral,
			});
		}

		const top = leaderboard.slice(0, 10);

		const lines = top.map(
			(entry, i) => `**${i + 1}.** <@${entry.userId}> — **${entry.count}**`,
		);

		await interaction.editReply({
			content: `🏆 **BeFr Scoreboard (${period})**\n\n${lines.join('\n')}`,
			ephemeral,
		});
	} catch (err) {
		console.error('Scoreboard error:', err);

		if (!interaction.replied) {
			await interaction.editReply('Failed to fetch scoreboard.');
		}
	}
}

module.exports = { handleScoreboard };

// scoreboard.js
const { getLeaderboard } = require('./statsManager');

/**
 * Handle /befr_scoreboard interaction
 * @param {ChatInputCommandInteraction} interaction
 */
async function handleScoreboard(interaction) {
	try {
		// Defer the reply to give time for processing
		await interaction.deferReply();

		// Get the selected period
		const periodOption = interaction.options.getString('period'); // 'all', 'week', 'month', 'year'
		const periodMap = {
			all: 'allTime',
			week: 'week',
			month: 'month',
			year: 'year',
		};
		const period = periodMap[periodOption] || 'allTime';

		// Fetch leaderboard
		const leaderboard = getLeaderboard(period);

		// Format top 10 users
		const top10 = leaderboard
			.slice(0, 10)
			.map(
				(entry, index) => `${index + 1}. <@${entry.userId}> - ${entry.count}`,
			)
			.join('\n');

		const replyContent = top10 || 'No data for this period yet.';

		// Edit the deferred reply
		await interaction.editReply({
			content: `🏆 BeFr Realest Leaderboard (${periodOption}):\n${replyContent}`,
		});
	} catch (err) {
		console.error('Error in handleScoreboard:', err);
		// Only reply if interaction hasn't already been replied to
		if (!interaction.replied) {
			await interaction.reply({
				content: '❌ Error fetching scoreboard.',
				ephemeral: true,
			});
		}
	}
}

module.exports = { handleScoreboard };

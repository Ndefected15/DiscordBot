// scoreboard.js
const { getLeaderboard } = require('./statsManager');

/**
 * Handle /befr_scoreboard command
 * Options:
 *   period: allTime | week | month | year
 */
async function handleScoreboard(interaction) {
	try {
		// Get the period option from the command; default to allTime
		const option = interaction.options.getString('period') || 'allTime';

		// Map option to stats key
		const periodMap = {
			weekly: 'week',
			monthly: 'month',
			yearly: 'year',
			alltime: 'allTime',
			allTime: 'allTime', // in case user sends camelCase
			week: 'week',
			month: 'month',
			year: 'year',
		};
		const period = periodMap[option.toLowerCase()] || 'allTime';

		// Get leaderboard for the period
		const leaderboard = getLeaderboard(period);

		if (!leaderboard || leaderboard.length === 0) {
			// Reply safely if no stats yet
			return interaction.editReply(
				`No "the realest" stats recorded for ${period} yet.`,
			);
		}

		// Build a content string for the scoreboard
		let content = `📊 **BeFr Scoreboard (${period})**\n\n`;
		leaderboard.forEach((entry, index) => {
			content += `${index + 1}. <@${entry.userId}> — ${entry.count}\n`;
		});

		// Reply to the user
		await interaction.editReply({ content });
	} catch (err) {
		console.error('Error in handleScoreboard:', err);

		// Only edit reply if it hasn't already been sent
		if (!interaction.replied && !interaction.deferred) {
			await interaction.reply(
				'Sorry, something went wrong while fetching the scoreboard 😔',
			);
		} else {
			await interaction.editReply(
				'Sorry, something went wrong while fetching the scoreboard 😔',
			);
		}
	}
}

module.exports = { handleScoreboard };

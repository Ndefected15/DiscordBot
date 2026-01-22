const { client } = require('./discordClient');
const { getLeaderboard } = require('./statsManager');

/**
 * Handle /befr_scoreboard command
 * @param {import('discord.js').CommandInteraction} interaction
 */
async function handleScoreboard(interaction) {
	try {
		const period = interaction.options.getString('period') || 'allTime'; // default
		if (!['allTime', 'week', 'month', 'year'].includes(period)) {
			return interaction.reply({
				content: 'Invalid period. Choose: allTime, week, month, year.',
				ephemeral: true,
			});
		}

		// Get leaderboard data
		const leaderboard = getLeaderboard(period);

		if (!leaderboard.length) {
			return interaction.reply({
				content: 'No stats available yet!',
				ephemeral: true,
			});
		}

		// Build leaderboard string
		let message = `🏆 **BeFr Scoreboard — ${capitalizePeriod(period)}** 🏆\n\n`;
		const maxDisplay = Math.min(10, leaderboard.length);

		for (let i = 0; i < maxDisplay; i++) {
			const entry = leaderboard[i];
			message += `**${i + 1}. <@${entry.userId}>** — ${entry.count}\n`;
		}

		// Send publicly in the channel
		await interaction.reply({
			content: message,
			ephemeral: false, // visible to everyone
		});
	} catch (err) {
		console.error('Error in handleScoreboard:', err);
		// Use try/catch around reply in case already deferred or replied
		try {
			if (!interaction.replied && !interaction.deferred) {
				await interaction.reply({
					content: 'Something went wrong retrieving the scoreboard 😔',
					ephemeral: true,
				});
			} else {
				await interaction.followUp({
					content: 'Something went wrong retrieving the scoreboard 😔',
					ephemeral: true,
				});
			}
		} catch (error) {
			console.error('Failed to notify user about scoreboard error:', error);
		}
	}
}

/**
 * Capitalize period name for display
 * @param {string} str
 * @returns {string}
 */
function capitalizePeriod(str) {
	if (!str) return '';
	return str.charAt(0).toUpperCase() + str.slice(1);
}

module.exports = { handleScoreboard };

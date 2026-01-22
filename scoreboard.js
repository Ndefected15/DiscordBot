const { client } = require('./discordClient');
const { getLeaderboard } = require('./statsManager');

const PERIODS = ['allTime', 'week', 'month', 'year'];

async function handleScoreboard(interaction) {
	await interaction.deferReply();

	const periodOption = interaction.options.getString('period') || 'allTime';
	const period = PERIODS.includes(periodOption) ? periodOption : 'allTime';

	const leaderboard = getLeaderboard(period);

	if (leaderboard.length === 0) {
		return interaction.editReply('No data available for the leaderboard.');
	}

	// Format the leaderboard safely, limit to 20 entries per message
	const lines = leaderboard.map(
		(entry, i) => `${i + 1}. <@${entry.userId}> — ${entry.count} time(s)`,
	);

	const chunkSize = 20; // prevent large message
	for (let i = 0; i < lines.length; i += chunkSize) {
		const chunk = lines.slice(i, i + chunkSize).join('\n');
		await interaction.followUp({ content: chunk });
	}

	// Edit the initial deferred reply to a simple confirmation
	await interaction.editReply(
		`Leaderboard for period: **${period}** (${leaderboard.length} users)`,
	);
}

module.exports = { handleScoreboard };

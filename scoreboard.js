const {
  getAllTimeStats,
  getWeeklyStats,
  getMonthlyStats,
  getYearlyStats,
} = require('./statsManager');

/**
 * Handle /befr_scoreboard command
 * @param {ChatInputCommandInteraction} interaction
 */
async function handleScoreboard(interaction) {
  try {
    // Get the period option (default 'all')
    const period = interaction.options.getString('period') || 'all';

    // Fetch stats based on period
    let stats;
    switch (period) {
      case 'week':
        stats = getWeeklyStats();
        break;
      case 'month':
        stats = getMonthlyStats();
        break;
      case 'year':
        stats = getYearlyStats();
        break;
      case 'all':
      default:
        stats = getAllTimeStats();
        break;
    }

    // Convert stats object { userId: count } to sorted array
    const sorted = Object.entries(stats)
      .sort((a, b) => b[1] - a[1])
      .map(([userId, count], index) => `${index + 1}. <@${userId}> — ${count} times`);

    const messageContent =
      sorted.length > 0
        ? `🏆 BeFr Scoreboard (${period}):\n${sorted.join('\n')}`
        : `No entries yet for ${period}.`;

    // Edit the deferred reply (no defer here!)
    await interaction.editReply({ content: messageContent });
  } catch (err) {
    console.error('Error in handleScoreboard:', err);
    // If editReply fails, log and try fallback
    try {
      await interaction.editReply('⚠️ Something went wrong fetching the scoreboard.');
    } catch (e) {
      console.error('Failed to send fallback scoreboard reply:', e);
    }
  }
}

module.exports = { handleScoreboard };

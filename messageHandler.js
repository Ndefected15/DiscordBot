const { client } = require('./discordClient');
const {
	userMessagesMap,
	getTargetTimestamp,
	findClosestMessage,
} = require('./utils');

const CHANNEL_ID = '1066395020405518376';

/**
 * Extract messages ONCE (startup or manual call)
 */
async function extractMessages(client) {
	const channel = await client.channels.fetch(CHANNEL_ID);
	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	let lastMessageId = null;

	do {
		const options = { limit: 100 };
		if (lastMessageId) options.before = lastMessageId;

		const messages = await channel.messages.fetch(options);
		lastMessageId = messages.lastKey();

		messages.forEach((message) => {
			if (message.attachments.size > 0) {
				userMessagesMap.set(message.id, {
					messageId: message.id,
					channelId: message.channel.id,
					authorID: message.author.id,
					timestamp: message.createdTimestamp,
				});
			}
		});

		await sleep(1000);
	} while (lastMessageId);

	console.log('Initial message extraction complete');
}

/**
 * Live message listener
 */
client.on('messageCreate', async (message) => {
	if (message.attachments.size > 0 && message.author.id !== client.user.id) {
		userMessagesMap.set(message.id, {
			messageId: message.id,
			channelId: message.channel.id,
			authorID: message.author.id,
			timestamp: message.createdTimestamp,
		});
	}
});

/**
 * Slash command handler
 */
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const userId = interaction.user.id;
	await interaction.deferReply();

	/**
	 * /random_befr
	 */
	if (interaction.commandName === 'random_befr') {
		const userMessages = Array.from(userMessagesMap.values()).filter(
			(msg) => msg.authorID === userId,
		);

		if (userMessages.length === 0) {
			return interaction.editReply('No BeFr found for you.');
		}

		const randomMessage =
			userMessages[Math.floor(Math.random() * userMessages.length)];

		return sendMessageAttachment(interaction, randomMessage);
	}

	/**
	 * /befr_at  (STEP 4 IMPLEMENTED HERE)
	 */
	if (interaction.commandName === 'befr_at') {
		const period = interaction.options.getString('period');

		const targetTime = getTargetTimestamp(period);
		if (!targetTime) {
			return interaction.editReply('Invalid time period.');
		}

		const userMessages = Array.from(userMessagesMap.values()).filter(
			(msg) => msg.authorID === userId,
		);

		if (userMessages.length === 0) {
			return interaction.editReply('No BeFr found for you.');
		}

		// STEP 3 result
		const closest = findClosestMessage(userMessages, targetTime);

		if (!closest) {
			return interaction.editReply('No BeFr found near that time.');
		}

		// STEP 4: re-fetch and send attachment
		return sendMessageAttachment(interaction, closest, period);
	}

	if (interaction.commandName === 'befr_scoreboard') {
		return handleScoreboard(interaction);
	}
});

/**
 * STEP 4 helper — fetch fresh attachment + reply
 */
async function sendMessageAttachment(interaction, messageMeta, periodLabel) {
	try {
		const channel = await client.channels.fetch(messageMeta.channelId);
		const message = await channel.messages.fetch(messageMeta.messageId);

		const attachment = message.attachments.first();
		if (!attachment) {
			return interaction.editReply('That BeFr no longer exists.');
		}

		const timestamp = new Date(messageMeta.timestamp).toLocaleString('en-US', {
			timeZone: 'America/New_York',
			timeZoneName: 'short',
			hour12: true,
		});

		const prefix = periodLabel
			? `Here's a BeFr from about ${periodLabel} ago`
			: `Here's a random BeFr`;

		await interaction.editReply({
			content: `${prefix} <@${messageMeta.authorID}> (sent at ${timestamp}):`,
			files: [attachment],
		});
	} catch (err) {
		console.error('Failed to fetch attachment:', err);
		await interaction.editReply('Something went wrong fetching that BeFr 😔');
	}
}

module.exports = { extractMessages };

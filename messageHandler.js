const { client } = require('./discordClient');
const { userMessagesMap } = require('./utils');

const CHANNEL_ID = '1066395020405518376';

/**
 * Extract messages ONCE (startup or manual call)
 * Stores only stable identifiers
 */
async function extractMessages(client) {
	const channel = await client.channels.fetch(CHANNEL_ID);
	const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

	let lastMessageId = null;
	let totalMessages = 0;

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

		totalMessages += messages.size;
		console.log(
			`Fetched ${messages.size} messages, total so far: ${totalMessages}`,
		);

		await sleep(1000);
	} while (lastMessageId);

	console.log('Finished fetching messages!');
	console.log(`Total messages processed: ${totalMessages}`);
}

/**
 * Live message listener (keeps cache fresh during the day)
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
 * /random_befr command — re-fetches message ON DEMAND
 */
client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;
	if (interaction.commandName !== 'random_befr') return;

	const userId = interaction.user.id;
	await interaction.deferReply();

	const userMessagesArray = Array.from(userMessagesMap.values()).filter(
		(msg) => msg.authorID === userId,
	);

	if (userMessagesArray.length === 0) {
		await interaction.editReply('No BeFr found for the specified user.');
		return;
	}

	const randomizer =
		userMessagesArray[Math.floor(Math.random() * userMessagesArray.length)];

	try {
		// 🔄 Re-fetch the message to get a fresh attachment URL
		const channel = await client.channels.fetch(randomizer.channelId);
		const message = await channel.messages.fetch(randomizer.messageId);

		const attachment = message.attachments.first();
		if (!attachment) {
			await interaction.editReply('Attachment no longer exists.');
			return;
		}

		const timestampOptions = {
			timeZone: 'America/New_York',
			timeZoneName: 'short',
			hour12: true,
		};

		const timestamp = new Date(randomizer.timestamp).toLocaleString(
			'en-US',
			timestampOptions,
		);

		await interaction.editReply({
			content: `Here's a random BeFr from <@${userId}> (sent at ${timestamp}):`,
			files: [attachment],
		});
	} catch (err) {
		console.error('Failed to re-fetch message:', err);
		await interaction.editReply('Something went wrong fetching that BeFr 😔');
	}
});

module.exports = { extractMessages };

const { client } = require('./discordClient');
const { userMessagesMap } = require('./utils');

client.once('ready', async () => {
	const channel = await client.channels.fetch('1066370266780934144');

	let lastMessageId = null;
	do {
		const options = { limit: 100 };
		if (lastMessageId) options.before = lastMessageId;

		const allMessages = await channel.messages.fetch(options);
		lastMessageId = allMessages.lastKey();

		allMessages.forEach((message) => {
			if (message.attachments.size > 0) {
				userMessagesMap.set(message.id, {
					attachment: message.attachments.first(),
					timestamp: message.createdTimestamp,
					authorID: message.author.id,
				});
			}
		});
	} while (lastMessageId);

	console.log('Printing 20 random cached messages:');
	const randomMessages = Array.from(userMessagesMap.values())
		.sort(() => Math.random() - 0.5)
		.slice(0, 20);
	randomMessages.forEach((messageData, index) => {
		console.log(`Message ${index + 1}:`);
		console.log(`Author ID: ${messageData.authorID}`);
		console.log(
			`Timestamp: ${new Date(messageData.timestamp).toLocaleString()}`
		);
		console.log(`Attachment: ${messageData.attachment.url}`);
		console.log('--------------------------');
	});
});

client.on('messageCreate', async (message) => {
	if (message.attachments.size > 0 && message.author.id !== client.user.id) {
		userMessagesMap.set(message.id, {
			attachment: message.attachments.first(),
			timestamp: message.createdTimestamp,
			authorID: message.author.id,
		});
	}
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const userId = interaction.user.id;

	if (interaction.commandName === 'random_befr') {
		await interaction.deferReply();

		const userMessagesArray = Array.from(userMessagesMap.values()).filter(
			(msg) => msg.authorID === userId
		);

		if (userMessagesArray.length === 0) {
			await interaction.editReply('No BeFr found for the specified user.');
			return;
		}

		const randomizer =
			userMessagesArray[Math.floor(Math.random() * userMessagesArray.length)];
		const attachment = randomizer.attachment;

		if (!attachment) {
			await interaction.editReply('No BeFr found for the specified user.');
			return;
		}

		const timestampOptions = {
			timeZone: 'America/New_York',
			timeZoneName: 'short',
			hour12: true,
		};
		const timestamp = new Date(randomizer.timestamp).toLocaleString(
			'en-US',
			timestampOptions
		);	
		
		console.log('Attachment URL before editReply:', attachment.url);
		
		console.log('Message Data in Map:', userMessagesMap.get(randomizer.id));
		
		console.log('Retrieved attachment URL:', randomizer.attachment.url);

		await interaction.editReply({
			content: `Here's a random BeFr from <@${userId}> (sent at ${timestamp}):`,
			files: [attachment.url],
		});
	}
});

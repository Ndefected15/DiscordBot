const { Client, REST, Routes, SlashCommandBuilder } = require('discord.js');
const CronJob = require('cron').CronJob;

const botID = '1066342002121248778';
const serverID = '581783173923602433';

const client = new Client({
	intents: [412317132864],
});

const rest = new REST().setToken(process.env.DJS_TOKEN);

// Map to store user messages and their timestamps
const userMessagesMap = new Map();

const slashRegister = async () => {
	try {
		await rest.put(Routes.applicationGuildCommands(botID, serverID), {
			body: [
				new SlashCommandBuilder()
					.setName('random_befr')
					.setDescription('Retrieves a random BeFr you previously sent'),
			],
		});
	} catch (error) {
		console.error(error);
	}
};

slashRegister();

client.once('ready', async () => {
	console.log('BeFrWithMe is online!');

	const channel = await client.channels.fetch('1066395020405518376');

	// Fetch all messages in the channel's history
	const allMessages = await channel.messages.fetch({ limit: null });

	// Cache messages containing attachments
	allMessages.forEach((message) => {
		if (message.attachments.size > 0) {
			userMessagesMap.set(message.id, {
				attachment: message.attachments.first(),
				timestamp: message.createdTimestamp,
				author: message.author,
			});
		}
	});

	// Print 10 cached messages to the console
	console.log('Printing 10 cached messages:');
	let count = 0;
	for (const [messageId, messageData] of userMessagesMap) {
		if (count >= 10) break;
		console.log(`Message ID: ${messageId}`);
		console.log(`Author: ${messageData.author.username}`);
		console.log(
			`Timestamp: ${new Date(messageData.timestamp).toLocaleString()}`
		);
		console.log(`Attachment: ${messageData.attachment.url}`);
		console.log('--------------------------');
		count++;
	}

	function hour(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	function minute(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	console.log(`${hour(20, 14)}:${minute(59, 0)}`);

	const msg = new CronJob(
		`${minute(59, 0)} ${hour(20, 14)} * * *`,
		// '*/2 * * * *', // Runs every two minutes
		async function () {
			const messageArray = [
				'<:Big_Iron:795054994457624577>',
				'<:HmmDanger:636268056024449034>',
				'<a:PartyBear:699413102596325446>',
				'<:howdy:1190871335203770388>',
				'<:yos:973470777783500830>',
				'<:ChoccyMilk:936711481460940800>',
				'<a:club_penguin:701572269029195806> ',
				'<:Capybara:954093564067995720>',
				'<:canIhas:936711440511926372>',
				'<:gritty:902949839111868458> ',
			];

			const random = Math.floor(Math.random() * messageArray.length);

			if (!channel) return console.error('Invalid channel ID.');

			channel.send(`@here Be fr with me rn ${messageArray[random]}`);
		},
		null,
		true,
		'America/New_York'
	);

	msg.start();
});

// Define theRealest as a standalone function
async function theRealest(channel) {
	const now = Date.now();
	const oneHourAgo = now - 60 * 60 * 1000;

	// Fetch all messages since one hour ago
	const messages = await channel.messages.fetch();
	messages.forEach((message) => {
		// Check if the message has attachments and was not sent by the bot
		if (
			message.attachments.size > 0 &&
			message.createdTimestamp >= oneHourAgo &&
			message.author.id !== '1066342002121248778' && // Exclude specified user ID
			message.author.id !== client.user.id // Exclude messages sent by the bot
		) {
			userMessagesMap.set(message.id, {
				attachment: message.attachments.first(),
				timestamp: message.createdTimestamp,
				author: message.author,
			});
		}
	});

	if (userMessagesMap.size === 0) return console.log('No user messages found.');

	const randomizer = Array.from(userMessagesMap.values())[
		Math.floor(Math.random() * userMessagesMap.size)
	];
	const randomMessageTimestamp = new Date(
		randomizer.timestamp
	).toLocaleString();

	channel.send(
		`<@${randomizer.author.id}> is the realest today (sent at ${randomMessageTimestamp})`
	);
}

client.on('messageCreate', async (message) => {
	if (message.attachments.size > 0 && message.author.id !== client.user.id) {
		// Only cache messages with attachments that are not sent by the bot
		userMessagesMap.set(message.id, {
			attachment: message.attachments.first(),
			timestamp: message.createdTimestamp,
			author: message.author,
		});
	}
});

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const userId = interaction.member.user.id;

	if (interaction.commandName === 'random_befr') {
		await interaction.deferReply();

		const userMessagesArray = Array.from(userMessagesMap.values()).filter(
			(msg) => msg.author.id === userId
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

		const timestamp = new Date(randomizer.timestamp).toLocaleString();
		await interaction.editReply({
			content: `Here's a random BeFr from <@${userId}> (sent at ${timestamp}):`,
			files: [attachment.url],
		});
	}
});

client.login(process.env.DJS_TOKEN);

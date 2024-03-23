// const { Client, REST, Routes, SlashCommandBuilder } = require('discord.js');
// const CronJob = require('cron').CronJob;

// // Discord bot configuration
// const botConfig = {
// 	botID: '1066342002121248778',
// 	serverID: '581783173923602433',
// 	botToken: process.env.DJS_TOKEN,
// 	intents: [412317132864],
// };

// // Create Discord client and REST API instance
// const client = new Client({ intents: botConfig.intents });
// const rest = new REST().setToken(botConfig.botToken);

// // Map to store user messages and their timestamps
// const userMessagesMap = new Map();

// // Register Slash Commands
// const slashRegister = async () => {
// 	try {
// 		await rest.put(
// 			Routes.applicationGuildCommands(botConfig.botID, botConfig.serverID),
// 			{
// 				body: [
// 					new SlashCommandBuilder()
// 						.setName('random_befr')
// 						.setDescription('Retrieves a random BeFr you previously sent'),
// 				],
// 			}
// 		);
// 	} catch (error) {
// 		console.error('Error while registering slash commands:', error);
// 	}
// };
// slashRegister();

// // Once the bot is ready
// client.once('ready', async () => {
// 	console.log('BeFrWithMe is online!');

// 	// Fetch channel for operations
// 	const channel = await client.channels.fetch('1066395020405518376');

// 	// Fetch and cache previous user messages with attachments
// 	let lastMessageId = null;
// 	do {
// 		const options = { limit: 100 };
// 		if (lastMessageId) options.before = lastMessageId;

// 		const allMessages = await channel.messages.fetch(options);
// 		lastMessageId = allMessages.lastKey();

// 		allMessages.forEach((message) => {
// 			if (message.attachments.size > 0) {
// 				userMessagesMap.set(message.id, {
// 					attachment: message.attachments.first(),
// 					timestamp: message.createdTimestamp,
// 					authorID: message.author.id,
// 				});
// 			}
// 		});
// 	} while (lastMessageId);

// 	// Print 20 random cached messages to the console
// 	console.log('Printing 20 random cached messages:');
// 	const randomMessages = Array.from(userMessagesMap.values())
// 		.sort(() => Math.random() - 0.5)
// 		.slice(0, 20);
// 	randomMessages.forEach((messageData, index) => {
// 		console.log(`Message ${index + 1}:`);
// 		console.log(`Author ID: ${messageData.authorID}`);
// 		console.log(
// 			`Timestamp: ${new Date(messageData.timestamp).toLocaleString()}`
// 		);
// 		console.log(`Attachment: ${messageData.attachment.url}`);
// 		console.log('--------------------------');
// 	});

// 	// Utility functions for generating random hours and minutes
// 	function getRandomHour(min, max) {
// 		return Math.floor(Math.random() * (max - min) + min);
// 	}
// 	function getRandomMinute(min, max) {
// 		return Math.floor(Math.random() * (max - min) + min);
// 	}

// 	// Define cron job interval for sending random messages
// 	const interval = `${getRandomMinute(59, 0)} ${getRandomHour(20, 14)} * * *`;
// 	console.log('Cron job interval:', interval);

// 	// Schedule cron job to send a random message
// 	const msg = new CronJob(
// 		interval,
// 		// '*/2 * * * *',
// 		async function () {
// 			const messageArray = [
// 				'<:Big_Iron:795054994457624577>',
// 				'<:HmmDanger:636268056024449034>',
// 				'<a:PartyBear:699413102596325446>',
// 				'<:howdy:1190871335203770388>',
// 				'<:yos:973470777783500830>',
// 				'<:ChoccyMilk:936711481460940800>',
// 				'<a:club_penguin:701572269029195806> ',
// 				'<:Capybara:954093564067995720>',
// 				'<:canIhas:936711440511926372>',
// 				'<:gritty:902949839111868458> ',
// 			];

// 			const randomIndex = Math.floor(Math.random() * messageArray.length);
// 			const randomMessage = messageArray[randomIndex];

// 			if (!channel) return console.error('Invalid channel ID.');

// 			channel.send(`@here Be fr with me rn ${randomMessage}`);

// 			// Call theRealest function once msg job has completed
// 			setTimeout(() => {
// 				theRealest(channel);
// 			}, 60 * 60 * 1000); // 5 minutes in milliseconds
// 		},
// 		null,
// 		true,
// 		'America/New_York'
// 	);
// 	msg.start();
// });

// // Function to determine the "realest" user
// async function theRealest(channel) {
// 	const now = Date.now();
// 	const oneHourAgo = now - 60 * 60 * 1000;

// 	// Fetch all messages since one hour ago
// 	const messages = await channel.messages.fetch();
// 	messages.forEach((message) => {
// 		if (
// 			message.attachments.size > 0 &&
// 			message.createdTimestamp >= oneHourAgo &&
// 			message.author.id !== botConfig.botID &&
// 			message.author.id !== client.user.id &&
// 			message.author.id !== botConfig.botID
// 		) {
// 			userMessagesMap.set(message.id, {
// 				attachment: message.attachments.first(),
// 				timestamp: message.createdTimestamp,
// 				authorID: message.author.id,
// 			});
// 		}
// 	});

// 	// Handle no messages found
// 	if (userMessagesMap.size === 0) return console.log('No user messages found.');

// 	// Filter messages to exclude bot's own messages
// 	const filteredMessages = Array.from(userMessagesMap.values()).filter(
// 		(msg) => msg.authorID !== botConfig.botID
// 	);

// 	// Handle no user messages found after bot exclusion
// 	if (filteredMessages.length === 0)
// 		return console.log('No user messages found after bot exclusion.');

// 	// Randomly select a "realest" user
// 	const randomizer =
// 		filteredMessages[Math.floor(Math.random() * filteredMessages.length)];

// 	// Send message indicating the "realest" user
// 	channel.send(`<@${randomizer.authorID}> is the realest today`);
// }

// // Event listener for caching messages with attachments
// client.on('messageCreate', async (message) => {
// 	if (message.attachments.size > 0 && message.author.id !== client.user.id) {
// 		userMessagesMap.set(message.id, {
// 			attachment: message.attachments.first(),
// 			timestamp: message.createdTimestamp,
// 			authorID: message.author.id,
// 		});
// 	}
// });

// // Event listener for handling slash command interactions
// client.on('interactionCreate', async (interaction) => {
// 	if (!interaction.isCommand()) return;

// 	const userId = interaction.user.id;

// 	// Process 'random_befr' command
// 	if (interaction.commandName === 'random_befr') {
// 		await interaction.deferReply();

// 		const userMessagesArray = Array.from(userMessagesMap.values()).filter(
// 			(msg) => msg.authorID === userId
// 		);

// 		// No BeFr found for the specified user
// 		if (userMessagesArray.length === 0) {
// 			await interaction.editReply('No BeFr found for the specified user.');
// 			return;
// 		}

// 		// Randomly select a BeFr message
// 		const randomizer =
// 			userMessagesArray[Math.floor(Math.random() * userMessagesArray.length)];
// 		const attachment = randomizer.attachment;

// 		// Handle case when attachment is not found
// 		if (!attachment) {
// 			await interaction.editReply('No BeFr found for the specified user.');
// 			return;
// 		}

// 		// Format and send the BeFr message with correct timezone
// 		const timestampOptions = {
// 			timeZone: 'America/New_York',
// 			timeZoneName: 'short',
// 			hour12: true, // Use 24-hour format
// 		};
// 		const timestamp = new Date(randomizer.timestamp).toLocaleString(
// 			'en-US',
// 			timestampOptions
// 		);

// 		await interaction.editReply({
// 			content: `Here's a random BeFr from <@${userId}> (sent at ${timestamp}):`,
// 			files: [attachment.url],
// 		});
// 	}
// });

// // Log in to Discord with the bot token
// client.login(botConfig.botToken);

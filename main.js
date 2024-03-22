const { Client, REST, Routes, SlashCommandBuilder } = require('discord.js');
const CronJob = require('cron').CronJob;

const botID = '1066342002121248778';
const serverID = '581783173923602433';

const client = new Client({
	intents: [412317132864],
});

const rest = new REST().setToken(process.env.DJS_TOKEN);

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

	function hour(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	function minute(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}
	console.log(`${hour(20, 14)}:${minute(59, 0)}`);

	const msg = new CronJob(
		`${minute(59, 0)} ${hour(20, 14)} * * *`,
		// '*/2 * * * *', // Runs every two minues
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

			// Call theRealest function once msg job has completed
			setTimeout(() => {
				theRealest(channel);
			}, 60 * 60 * 1000); // 5 minutes in milliseconds
		},
		null,
		true,
		'America/New_York'
	);

	msg.start();
});

// Define theRealest as a standalone function
function theRealest(channel) {
	const userIDs = [];

	channel.messages
		.fetch({ limit: 100 })
		.then((messages) => {
			const now = Date.now();
			const oneHourAgo = now - 60 * 60 * 1000;

			messages.forEach((message) => {
				// Check if the message has attachments and was not sent by the bot
				if (
					message.attachments.size > 0 &&
					message.createdTimestamp >= oneHourAgo &&
					message.author.id !== '1066342002121248778' && // Exclude specified user ID
					message.author.id !== client.user.id // Exclude messages sent by the bot
				) {
					userIDs.push(message.author.id);
				}
			});

			if (userIDs.length === 0) return console.log('No user IDs found.');

			const randomizer = userIDs[Math.floor(Math.random() * userIDs.length)];

			console.log(userIDs);

			channel.send(`<@${randomizer}> is the realest today `);

			// Clear the userIDs array after theRealest function is run
			userIDs.length = 0; // This empties the array
		})
		.catch((error) => {
			console.error('Error fetching messages:', error);
		});
}

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const userId = interaction.member.user.id; // Get user ID from interaction
	console.log(`User ID: ${userId}`);

	if (interaction.commandName === 'random_befr') {
		const channel = interaction.channel;
		const messages = await channel.messages.fetch({ limit: 100 }); // Adjust limit as needed
		const userMessages = messages.filter(
			(msg) => msg.author.id === userId && msg.attachments.size > 0
		);
		if (userMessages.size === 0) {
			await interaction.reply('No BeFr found for the specified user.');
			return;
		}
		const randomMessage = userMessages.random();
		const attachment = randomMessage.attachments.first();
		if (!attachment) {
			await interaction.reply('No BeFr found for the specified user.');
			return;
		}
		await interaction.reply({
			content: `Here's a random BeFr from <@${userId}>:`,
			files: [attachment.url],
		});
	}
});

client.login(process.env.DJS_TOKEN);

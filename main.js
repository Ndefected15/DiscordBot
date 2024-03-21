const { Client, REST, Routes, SlashCommandBuilder } = require('discord.js');
const CronJob = require('cron').CronJob;
const botID = '1066342002121248778';
const client = new Client({
	intents: [412317132864],
});

client.once('ready', async () => {
	console.log('BeFrWithMe is online!');

	function hour(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	function minute(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	const msg = new CronJob(
		`${minute(59, 0)} ${hour(20, 14)} * * *`,
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

			const guild = client.guilds.cache.get('581783173923602433'); // Your server ID
			if (!guild) return console.error('Invalid guild ID.');

			const channel = guild.channels.cache.find(
				(channel) => channel.type === 'GUILD_TEXT'
			); // Find a text channel
			if (!channel)
				return console.error('No text channels found in the guild.');

			channel.send(`@here Be fr with me rn ${messageArray[random]}`);

			const theRealest = new CronJob('0 * * * * *', async function () {
				const userIDs = [];

				const messages = await channel.messages.fetch({ limit: 100 }); // Fetch last 100 messages
				const now = Date.now();
				const oneHourAgo = now - 60 * 60 * 1000;

				messages.forEach((message) => {
					if (
						message.attachments.size > 0 &&
						message.createdTimestamp >= oneHourAgo
					) {
						userIDs.push(message.author.id);
					}
				});

				if (userIDs.length === 0) return console.log('No user IDs found.');

				const randomizer = userIDs[Math.floor(Math.random() * userIDs.length)];

				channel.send(`<@${randomizer}> is the realest today`);
			});

			setTimeout(() => {
				theRealest.start();
			}, 3600000); // Start theRealest job after one hour
		},
		null,
		true,
		'America/New_York'
	);

	msg.start();

	await slashRegister();
});

const rest = new REST().setToken(process.env.DJS_TOKEN);
const slashRegister = async () => {
	try {
		await rest.put(Routes.applicationCommands(botID), {
			body: [
				new SlashCommandBuilder()
					.setName('ping')
					.setDescription('just a simple ping command')
					.addStringOption((option) => {
						return option
							.setName('message')
							.setDescription('the message to send')
							.setRequired(false);
					}),
			],
		});
	} catch (error) {
		console.error(error);
	}
};

client.on('interactionCreate', async (interaction) => {
	if (!interaction.isCommand()) return;

	const userId = interaction.user.id;
	console.log(`User ID: ${userId}`);

	if (interaction.commandName === 'ping') {
		const msg = interaction.options.getString('message');
		await interaction.reply(`You sent me: ${msg}`);
	}
});

client.login(process.env.DJS_TOKEN);

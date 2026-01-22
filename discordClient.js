const { Client, REST, Routes, SlashCommandBuilder } = require('discord.js');

const botConfig = {
	botID: '1066342002121248778',
	serverID: '581783173923602433',
	botToken: process.env.DJS_TOKEN,
	intents: [412317132864],
};

const client = new Client({ intents: botConfig.intents });
const rest = new REST().setToken(botConfig.botToken);

const slashRegister = async () => {
	try {
		await rest.put(
			Routes.applicationGuildCommands(botConfig.botID, botConfig.serverID),
			{
				body: [
					new SlashCommandBuilder()
						.setName('random_befr')
						.setDescription('Retrieves a random BeFr you previously sent'),
					new SlashCommandBuilder()
						.setName('befr_at')
						.setDescription('Get a BeFr you sent around a specific time ago')
						.addStringOption((option) =>
							option
								.setName('period')
								.setDescription('How long ago?')
								.setRequired(true)
								.addChoices(
									{ name: 'A week ago', value: 'week' },
									{ name: 'A month ago', value: 'month' },
									{ name: 'A year ago', value: 'year' },
								),
						),
					new SlashCommandBuilder()
						.setName('befr_scoreboard')
						.setDescription('View BeFr Realest stats')
						.addStringOption((option) =>
							option
								.setName('period')
								.setDescription('Time range')
								.setRequired(true)
								.addChoices(
									{ name: 'All Time', value: 'all' },
									{ name: 'This Week', value: 'week' },
									{ name: 'This Month', value: 'month' },
									{ name: 'This Year', value: 'year' },
								),
						),
				],
			},
		);
	} catch (error) {
		console.error('Error while registering slash commands:', error);
	}
};

module.exports = { client, slashRegister, botConfig };

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
				],
			}
		);
	} catch (error) {
		console.error('Error while registering slash commands:', error);
	}
};

module.exports = { client, slashRegister, botConfig };

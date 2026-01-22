const {
	Client,
	REST,
	Routes,
	GatewayIntentBits,
	SlashCommandBuilder,
} = require('discord.js');

// Load bot token from environment variable
const botToken = process.env.DJS_TOKEN;

if (!botToken) {
	throw new Error(
		'❌ Discord bot token not found. Please set the DJS_TOKEN environment variable in Render.',
	);
}

const botConfig = {
	botID: '1066342002121248778',
	serverID: '581783173923602433',
	botToken,
	intents: [
		GatewayIntentBits.Guilds,
		GatewayIntentBits.GuildMessages,
		GatewayIntentBits.MessageContent,
	],
};

const client = new Client({ intents: botConfig.intents });

// REST client for slash commands
const rest = new REST({ version: '10' }).setToken(botConfig.botToken);

// Slash command registration
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
		console.log('✅ Slash commands registered successfully');
	} catch (error) {
		console.error('❌ Error while registering slash commands:', error);
	}
};

// Log all client events for debugging
client.on('ready', () => console.log(`✅ Logged in as ${client.user.tag}`));
client.on('error', console.error);
client.on('warn', console.warn);
client.on('debug', console.log);

module.exports = { client, slashRegister, botConfig };

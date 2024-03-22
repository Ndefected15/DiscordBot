// const { Client, REST, Routes, SlashCommandBuilder } = require('discord.js');
// const botID = '1066342002121248778';
// const serverID = '1066350114219769918';
// const botToken =
// 	'';
// const client = new Client({ intents: [412317132864] });

// const rest = new REST().setToken(botToken);

// const slashRegister = async () => {
// 	try {
// 		await rest.put(Routes.applicationGuildCommands(botID, serverID), {
// 			body: [
// 				new SlashCommandBuilder()
// 					.setName('random_befr')
// 					.setDescription('Retrieves a random BeFr you previously sent')
// 					.addUserOption((option) =>
// 						option
// 							.setName('user')
// 							.setDescription('The user to retrieve BeFr from')
// 							.setRequired(true)
// 					),
// 			],
// 		});
// 	} catch (error) {
// 		console.error(error);
// 	}
// };

// slashRegister();

// client.on('interactionCreate', async (interaction) => {
// 	if (!interaction.isCommand()) return;

// 	const userId = interaction.options.getUser('user').id;
// 	console.log(`User ID: ${userId}`);

// 	if (interaction.commandName === 'random_befr') {
// 		const channel = interaction.channel;
// 		const messages = await channel.messages.fetch({ limit: 100 }); // Adjust limit as needed
// 		const userMessages = messages.filter(
// 			(msg) => msg.author.id === userId && msg.attachments.size > 0
// 		);
// 		if (userMessages.size === 0) {
// 			await interaction.reply('No BeFr found for the specified user.');
// 			return;
// 		}
// 		const randomMessage = userMessages.random();
// 		const attachment = randomMessage.attachments.first();
// 		if (!attachment) {
// 			await interaction.reply('No BeFr found for the specified user.');
// 			return;
// 		}
// 		await interaction.reply({
// 			content: `Here's a random BeFr from <@${userId}>:`,
// 			files: [attachment.url],
// 		});
// 	}
// });

// client.login(botToken);

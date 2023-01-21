const Discord = require('discord.js');
const client = new Discord.Client();

client
	.login('94018229689076dc44a46d864ca144802ce59478fc1e0670a2b608c7c9f1042b')
	.then(() => {
		console.log('I am ready');
		var guild = client.guilds.get('guildid');
		if (guild && guild.channels.get('channelid')) {
			guild.channels
				.get('channelid')
				.send('Good Morning')
				.then(() => client.destroy());
		} else {
			console.log('nope');
			//if the bot doesn't have guild with the id guildid
			// or if the guild doesn't have the channel with id channelid
		}
		client.destroy();
	});

const { Client } = require('discord.js');
const CronJob = require('cron').CronJob;

const client = new Client({
	intents: [412317132864],
});

client.once('ready', async () => {
	console.log('BeFrWithMe is online!');

	const channel = await client.channels.fetch('1066370266780934144');

	let msg = CronJob('0 12 1/1 * *', () => {
		channel.send('@here be fr with me rn');

		msg();
	});
});

client.login('TOKEN');

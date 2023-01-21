const { Client } = require('discord.js');
const CronJob = require('cron').CronJob;

const client = new Client({
	intents: [412317132864],
});

client.once('ready', async () => {
	console.log('BeFrWithMe is online!');

	const channel = await client.channels.fetch('1066395020405518376');

	let msg = CronJob('* * * * *', () => {
		console.log('Working');
		channel.send('@here be fr with me rn');

		msg();
	});
});

client.login(
	'MTA2NjM0MjAwMjEyMTI0ODc3OA.GaSFP0.jiZWyDootfY9MZ-LuoMzb5eJMMRlBi70oERORw'
);

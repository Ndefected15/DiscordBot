const { Client } = require('discord.js');
const CronJob = require('cron').CronJob;

const client = new Client({
	intents: [412317132864],
});

client.once('ready', async () => {
	console.log('BeFrWithMe is online!');

	const channel = await client.channels.fetch('1066395020405518376');

	function hour(min, max) {
		return Math.floor(Math.random() * (max - min) + min);
	}

	let msg = new CronJob(
		`* ${hour(20, 14)} * * *`,
		function () {
			console.log(hour(20, 14));
			channel.send('@here Be fr with me rn <:Big_Iron:795054994457624577>');
		},
		null,
		true,
		'America/New_York'
	);

	msg.start();
});

client.login(process.env.DJS_TOKEN);

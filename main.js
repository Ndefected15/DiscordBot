const { Client } = require('discord.js');
const CronJob = require('cron').CronJob;

const client = new Client({
	intents: [412317132864],
});

client.once('ready', async () => {
	console.log('BeFrWithMe is online!');

	const channel = await client.channels.fetch('1066370266780934144');

	let msg = new CronJob('20 13 * * *', send);

	function send() {
		console.log('Working');
		channel.send('be fr with me rn');
	}

	msg.start();
});

// function test() {
// 	console.log('Action executed.');
// }

// let job1 = new CronJob('* * * * * ', test); // fires every day, at 01:05:01 and 13:05:01

client.login(
	'MTA2NjM0MjAwMjEyMTI0ODc3OA.GXQJbA.NZJuSAWby0TsmoXuY_xmyN9VaG6I5wHzcwj6Z8'
);

// job1.start();

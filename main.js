const { Client } = require('discord.js');
const CronJob = require('cron').CronJob;

const client = new Client({
	intents: [412317132864],
});

client.once('ready', () => {
	console.log('BeFrWithMe is online!');
});

client.login(
	'MTA2NjM0MjAwMjEyMTI0ODc3OA.GJ0-ch.zykcCvHy49bBdVQbKGxwBEeN2cFHjwn7eyMXL0'
);

function test() {
	console.log('Action executed.');
	client.channels.cache.get('befrwithme').send('Hello here!');
}

let job1 = new CronJob('* * * * *', test); // fires every day, at 01:05:01 and 13:05:01
let job2 = new CronJob('00 00 08-16 * * 1-5', test); // fires from Monday to Friday, every hour from 8 am to 16

job1.start();

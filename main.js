const { Client } = require('discord.js');
const cron = require('cron').CronJob;

const client = new Client({
	intents: [412317132864],
});

client.on('ready', () => {
	console.log('BeFrWithMe is online!');
});

client.login(
	'MTA2NjM0MjAwMjEyMTI0ODc3OA.GPHBmk.b5fknov_Wjd5h8ugEebHl3Tllu9m3vszRsLAU0'
);

function test() {
	console.log('Action executed.');
}

let job1 = new cron.CronJob('01 05 01,13 * * *', test); // fires every day, at 01:05:01 and 13:05:01
let job2 = new cron.CronJob('00 00 08-16 * * 1-5', test); // fires from Monday to Friday, every hour from 8 am to 16

job2.start();

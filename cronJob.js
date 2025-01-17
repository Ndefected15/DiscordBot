const { CronJob } = require('cron');

const { client } = require('./discordClient');
const { getRandomHour, getRandomMinute, theRealest } = require('./utils');

const channelID = '1066370266780934144';

const interval = `${getRandomMinute(59, 0)} ${getRandomHour(20, 14)} * * *`;
console.log(interval);
const msg = new CronJob(
	interval,
	// '*/2 * * * *',
	async function () {
		const channel = await client.channels.fetch(channelID);
		const messageArray = [
			'<:Big_Iron:795054994457624577>',
			'<:HmmDanger:636268056024449034>',
			'<a:PartyBear:699413102596325446>',
			'<:howdy:1190871335203770388>',
			'<:yos:973470777783500830>',
			'<:ChoccyMilk:936711481460940800>',
			'<a:club_penguin:701572269029195806> ',
			'<:Capybara:954093564067995720>',
			'<:canIhas:936711440511926372>',
			'<:gritty:902949839111868458> ',
		];

		const randomIndex = Math.floor(Math.random() * messageArray.length);
		const randomMessage = messageArray[randomIndex];

		if (!channel) return console.error('Invalid channel ID.');

		channel.send(`@here Be fr with me rn ${randomMessage}`);

		setTimeout(() => {
			theRealest(channel);
		}, 60 * 60 * 1000); // 5 minutes in milliseconds
	},
	null,
	true,
	'America/New_York'
);

msg.start();

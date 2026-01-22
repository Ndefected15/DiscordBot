const { CronJob } = require('cron');
const { client } = require('./discordClient');
const { getRandomHour, getRandomMinute, theRealest } = require('./utils');
const { extractMessages } = require('./messageHandler');
const {
	resetWeeklyStats,
	resetMonthlyStats,
	resetYearlyStats,
} = require('./statsManager');

const channelID = '1066395020405518376';
let msgJob;

/**
 * Daily "BeFr" job
 */
function createDailyMessageJob() {
	const interval = `${getRandomMinute(59, 0)} ${getRandomHour(20, 14)} * * *`;
	console.log('Generated interval for today:', interval);

	msgJob = new CronJob(
		interval,
		async function () {
			const channel = await client.channels.fetch(channelID);

			const messageArray = [
				'<:Big_Iron:795054994457624577>',
				'<:HmmDanger:636268056024449034>',
				'<a:PartyBear:699413102596325446>',
				'<:howdy:1190871335203770388>',
				'<:yos:973470777783500830>',
				'<:ChoccyMilk:936711481460940800>',
				'<a:club_penguin:701572269029195806>',
				'<:Capybara:954093564067995720>',
				'<:canIhas:936711440511926372>',
				'<:gritty:902949839111868458>',
			];

			const randomMessage =
				messageArray[Math.floor(Math.random() * messageArray.length)];

			await channel.send(`@here Be fr with me rn ${randomMessage}`);

			// Schedule "the realest" one hour later
			setTimeout(() => theRealest(channel), 60 * 60 * 1000);
		},
		null,
		true,
		'America/New_York',
	);

	msgJob.start();
}

/**
 * Midnight reset (daily message + optional message extraction)
 */
const midnightResetJob = new CronJob(
	'0 0 * * *',
	async function () {
		console.log('🌙 Midnight reset running...');
		try {
			await extractMessages(client); // Refresh messages cache
			console.log('Message extraction completed');
		} catch (err) {
			console.error('Message extraction failed:', err);
		}

		if (msgJob) msgJob.stop();
		createDailyMessageJob();
	},
	null,
	true,
	'America/New_York',
);

/**
 * Weekly reset (Sunday 00:00)
 */
const weeklyResetJob = new CronJob(
	'0 0 * * 0',
	function () {
		console.log('📅 Weekly stats reset');
		resetWeeklyStats();
	},
	null,
	true,
	'America/New_York',
);

/**
 * Monthly reset (1st day of month)
 */
const monthlyResetJob = new CronJob(
	'0 0 1 * *',
	function () {
		console.log('🗓️ Monthly stats reset');
		resetMonthlyStats();
	},
	null,
	true,
	'America/New_York',
);

/**
 * Yearly reset (Jan 1st)
 */
const yearlyResetJob = new CronJob(
	'0 0 1 1 *',
	function () {
		console.log('🎉 Yearly stats reset');
		resetYearlyStats();
	},
	null,
	true,
	'America/New_York',
);

// Start CronJobs
midnightResetJob.start();
weeklyResetJob.start();
monthlyResetJob.start();
yearlyResetJob.start();

// Start first daily message job
createDailyMessageJob();

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
 * DAILY MESSAGE JOB
 */
function createDailyMessageJob() {
	// Random time between 2 PM and 8 PM
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

			// Determine "the realest" one hour later
			setTimeout(
				() => {
					theRealest(channel); // internally calls incrementRealest for stats
				},
				60 * 60 * 1000,
			);
		},
		null,
		true,
		'America/New_York',
	);

	msgJob.start();
}

/**
 * MIDNIGHT RESET JOB
 * - Refresh daily message job
 * - Optional: refresh message cache
 */
const midnightResetJob = new CronJob(
	'0 0 * * *', // every day at 00:00
	async function () {
		console.log('🌙 Midnight reset running...');
		try {
			await extractMessages(client);
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
 * WEEKLY RESET
 * - Runs Sunday at 00:00
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
 * MONTHLY RESET
 * - Runs on 1st day of each month at 00:00
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
 * YEARLY RESET
 * - Runs Jan 1st at 00:00
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

// Start all cron jobs
midnightResetJob.start();
weeklyResetJob.start();
monthlyResetJob.start();
yearlyResetJob.start();

// Initialize first daily message job
createDailyMessageJob();

const { CronJob } = require('cron');
const { client } = require('./discordClient');
const { getRandomHour, getRandomMinute, theRealest } = require('./utils');

const channelID = '1066395020405518376';
let msgJob; // Declare the variable for the daily message CronJob

// Function to generate and start the daily CronJob
function createDailyMessageJob() {
	// Generate a random time between 2 PM and 8 PM
	const interval = `${getRandomMinute(59, 0)} ${getRandomHour(20, 14)} * * *`;
	console.log('Generated interval for today:', interval);

	// Create the CronJob for the daily message
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

			const randomIndex = Math.floor(Math.random() * messageArray.length);
			const randomMessage = messageArray[randomIndex];

			if (!channel) return console.error('Invalid channel ID.');

			channel.send(`@here Be fr with me rn ${randomMessage}`);

			// Trigger the additional task (e.g., theRealest) one hour later
			setTimeout(() => {
				theRealest(channel);
			}, 60 * 60 * 1000); // 1 hour in milliseconds
		},
		null,
		true,
		'America/New_York'
	);

	msgJob.start(); // Start the newly created CronJob
}

// Create a CronJob to reset the daily message job at midnight
const resetJob = new CronJob(
	'0 0 * * *', // Runs at midnight every day
	function () {
		console.log('Resetting daily message job at midnight...');
		if (msgJob) {
			msgJob.stop(); // Stop the previous day's job, if it exists
		}
		createDailyMessageJob(); // Generate a new job for the day
	},
	null,
	true,
	'America/New_York'
);

// Start the reset job
resetJob.start();

// Initialize the first daily message job when the bot starts
createDailyMessageJob();
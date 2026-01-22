// cronJob.js
const { CronJob } = require('cron');
const { client } = require('./discordClient');
const { getRandomHour, getRandomMinute, theRealest } = require('./utils');
const { extractMessages } = require('./messageHandler');
const { resetPeriod, backfillRealestStats } = require('./statsManager');

const CHANNEL_ID = '1066395020405518376';
let msgJob;

/**
 * DAILY MESSAGE JOB
 * Posts a random BeFr message once per day at a randomized time between 2 PM - 8 PM
 * Then triggers "the realest" an hour later
 */
function createDailyMessageJob() {
  const interval = `${getRandomMinute(59, 0)} ${getRandomHour(20, 14)} * * *`;
  console.log('Generated daily message interval for today:', interval);

  msgJob = new CronJob(
    interval,
    async () => {
      try {
        const channel = await client.channels.fetch(CHANNEL_ID);

        const messages = [
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
          messages[Math.floor(Math.random() * messages.length)];

        await channel.send(`@here Be fr with me rn ${randomMessage}`);

        // Trigger "the realest" one hour later
        setTimeout(() => theRealest(channel), 60 * 60 * 1000);
      } catch (err) {
        console.error('Error posting daily BeFr message:', err);
      }
    },
    null,
    true,
    'America/New_York'
  );

  msgJob.start();
}

/**
 * MIDNIGHT RESET
 * Refreshes daily message job and updates message cache
 */
const midnightResetJob = new CronJob(
  '0 0 * * *',
  async () => {
    console.log('🌙 Midnight reset running...');
    try {
      await extractMessages(client);
      console.log('Message extraction completed at midnight');
    } catch (err) {
      console.error('Message extraction failed:', err);
    }

    if (msgJob) msgJob.stop();
    createDailyMessageJob();
  },
  null,
  true,
  'America/New_York'
);

/**
 * WEEKLY RESET
 * Resets "week" stats every Sunday at 00:00
 */
const weeklyResetJob = new CronJob(
  '0 0 * * 0',
  () => {
    console.log('📅 Weekly stats reset');
    resetPeriod('week');
  },
  null,
  true,
  'America/New_York'
);

/**
 * MONTHLY RESET
 * Resets "month" stats on the 1st of each month at 00:00
 */
const monthlyResetJob = new CronJob(
  '0 0 1 * *',
  () => {
    console.log('🗓️ Monthly stats reset');
    resetPeriod('month');
  },
  null,
  true,
  'America/New_York'
);

/**
 * YEARLY RESET
 * Resets "year" stats on January 1st at 00:00
 */
const yearlyResetJob = new CronJob(
  '0 0 1 1 *',
  () => {
    console.log('🎉 Yearly stats reset');
    resetPeriod('year');
  },
  null,
  true,
  'America/New_York'
);

/**
 * START ALL JOBS AFTER CLIENT IS READY
 */
client.once('ready', async () => {
  console.log('✅ Client ready, starting cron jobs...');

  // 1️⃣ Daily BeFr message
  createDailyMessageJob();

  // 2️⃣ Start cron resets
  midnightResetJob.start();
  weeklyResetJob.start();
  monthlyResetJob.start();
  yearlyResetJob.start();

  // 3️⃣ Backfill historical stats for all periods
  try {
    console.log('Starting backfill for allTime...');
    await backfillRealestStats(client, CHANNEL_ID, 'allTime');

    console.log('Starting backfill for week (past 7 days)...');
    await backfillRealestStats(client, CHANNEL_ID, 'week', 7);

    console.log('Starting backfill for month (past 30 days)...');
    await backfillRealestStats(client, CHANNEL_ID, 'month', 30);

    console.log('Starting backfill for year (past 365 days)...');
    await backfillRealestStats(client, CHANNEL_ID, 'year', 365);

    console.log('🎯 Historical "the realest" backfill complete for all periods');
  } catch (err) {
    console.error('Backfill failed:', err);
  }
});

module.exports = {
  createDailyMessageJob,
  midnightResetJob,
  weeklyResetJob,
  monthlyResetJob,
  yearlyResetJob,
};

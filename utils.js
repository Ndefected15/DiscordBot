const { client, botConfig } = require('./discordClient');
const { incrementRealest } = require('./statsManager');

const userMessagesMap = new Map();

function getRandomHour(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

function getRandomMinute(min, max) {
	return Math.floor(Math.random() * (max - min) + min);
}

async function theRealest(channel) {
	const now = Date.now();
	const oneHourAgo = now - 60 * 60 * 1000;

	const userMessagesMap = new Map();

	const messages = await channel.messages.fetch();
	messages.forEach((message) => {
		if (
			message.attachments.size > 0 &&
			message.createdTimestamp >= oneHourAgo &&
			message.author.id !== botConfig.botID &&
			message.author.id !== client.user.id &&
			message.author.id !== botConfig.botID
		) {
			userMessagesMap.set(message.id, {
				attachment: message.attachments.first(),
				timestamp: message.createdTimestamp,
				authorID: message.author.id,
			});
		}
	});

	if (userMessagesMap.size === 0) return console.log('No user messages found.');

	const filteredMessages = Array.from(userMessagesMap.values()).filter(
		(msg) => msg.authorID !== botConfig.botID,
	);

	if (filteredMessages.length === 0)
		return console.log('No user messages found after bot exclusion.');

	const randomizer =
		filteredMessages[Math.floor(Math.random() * filteredMessages.length)];

	channel.send(`<@${randomizer.authorID}> is the realest today`);
	incrementRealest(randomizer.authorID);
}

/**
 * Given a period string, returns a timestamp representing
 * that amount of time ago from now.
 */
function getTargetTimestamp(period) {
	const now = new Date();

	switch (period) {
		case 'week':
			now.setDate(now.getDate() - 7);
			break;
		case 'month':
			now.setMonth(now.getMonth() - 1);
			break;
		case 'year':
			now.setFullYear(now.getFullYear() - 1);
			break;
		default:
			return null;
	}

	return now.getTime();
}

function findClosestMessage(messages, targetTime) {
	let closest = null;
	let smallestDiff = Infinity;

	for (const msg of messages) {
		const diff = Math.abs(msg.timestamp - targetTime);
		if (diff < smallestDiff) {
			smallestDiff = diff;
			closest = msg;
		}
	}

	return closest;
}

module.exports = {
	getRandomHour,
	getRandomMinute,
	theRealest,
	userMessagesMap,
	getTargetTimestamp,
	findClosestMessage,
};

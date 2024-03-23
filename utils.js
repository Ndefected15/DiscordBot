const { client, botConfig } = require('./discordClient');

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
		(msg) => msg.authorID !== botConfig.botID
	);

	if (filteredMessages.length === 0)
		return console.log('No user messages found after bot exclusion.');

	const randomizer =
		filteredMessages[Math.floor(Math.random() * filteredMessages.length)];

	channel.send(`<@${randomizer.authorID}> is the realest today`);
}

module.exports = {
	getRandomHour,
	getRandomMinute,
	theRealest,
	userMessagesMap,
};

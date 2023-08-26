const { Events } = require('discord.js');
const { addBalance } = require('../index.js');

module.exports = {
	name: Events.MessageCreate,
	once: true,
	execute(message) {
		if (message.author.bot) return;
		addBalance(message.author.id, 1);
	},
};
const { Events } = require('discord.js');
const { addBalance } = require('../shared-currency-functions');

module.exports = {
	name: Events.MessageCreate,
	execute(message) {
		if (message.author.bot) return;
		addBalance(message.author.id, 1);
	},
};
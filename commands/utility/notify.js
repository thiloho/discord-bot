const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('notify')
		.setDescription('Receive pings from announcements.'),
	async execute(interaction) {
		const roleId = '1142228335682932846';
		const member = interaction.member;

		if (member.roles.cache.has(roleId)) {
			member.roles.remove(roleId);
			await interaction.reply('You will no longer receive pings from announcements.');
		}
		else {
			member.roles.add(roleId);
			interaction.reply('You will now receive pings from announcements.');
		}
	},
};
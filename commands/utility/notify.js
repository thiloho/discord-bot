const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('notify')
		.setDescription('Receive pings from announcements.'),
	async execute(interaction) {
		const roleId = '1142228335682932846';
		const member = interaction.member;
		const notifyEmbed = {
			color: 0x0099ff,
			title: 'Notify',
			description: 'You will now receive pings from announcements.',
		};

		if (member.roles.cache.has(roleId)) {
			member.roles.remove(roleId);
			notifyEmbed.description = 'You will no longer receive pings from announcements.';
		}
		else {
			member.roles.add(roleId);
		}

		await interaction.reply({ embeds: [notifyEmbed] });
	},
};
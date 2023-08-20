const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('mute')
		.setDescription('Mute a user')
		.addUserOption(option => option.setName('target').setDescription('User to mute').setRequired(true))
		.addIntegerOption(option => option.setName('duration').setDescription('Time in minutes until the mute is over').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('Why the user was muted'))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
	async execute(interaction) {
		const member = interaction.options.getMember('target');
		const timeoutDuration = interaction.options.getInteger('duration');
		const timeoutReason = interaction.options.getString('reason');
		member.timeout(timeoutDuration * 60000);
		await interaction.reply(`${member} was muted for ${timeoutDuration}m for reason: ${timeoutReason ?? 'No reason specified'}.`);
	},
};
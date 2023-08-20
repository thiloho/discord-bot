const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('kick')
		.setDescription('Kick a user from the server.')
		.addUserOption(option => option.setName('target').setDescription('User to kick').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('Why the user was kicked'))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
	async execute(interaction) {
		const member = interaction.options.getMember('target');
		const kickReason = interaction.options.getString('reason');
		member.kick();
		await interaction.reply(`${member} was kicked from the server for reason: ${kickReason ?? 'No reason specified'}.`);
	},
};
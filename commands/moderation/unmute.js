const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Remove a mute from a specified user')
		.addUserOption(option => option.setName('target').setDescription('User to mute').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
	async execute(interaction) {
		const member = interaction.options.getMember('target');
		member.timeout(null);
		await interaction.reply(`${member} was successfully unmuted.`);
	},
};
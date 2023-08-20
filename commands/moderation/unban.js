const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Remove a ban from a user.')
		.addUserOption(option => option.setName('target').setDescription('User to unban').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const user = interaction.options.getUser('target');
		interaction.guild.members.unban(user);
		await interaction.reply(`${user} was successfully unbanned.`);
	},
};
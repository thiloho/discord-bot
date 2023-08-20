const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a user from the server.')
		.addUserOption(option => option.setName('target').setDescription('User to ban').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('Why the user was banned'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const user = interaction.options.getUser('target');
		const banReason = interaction.options.getString('reason');
		interaction.guild.members.ban(user);
		await interaction.reply(`${user} was banned from the server for reason ${banReason ?? 'No reason specified'}.`);
	},
};
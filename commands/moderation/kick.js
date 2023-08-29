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

		if (!member) {
			await interaction.reply('Error: User not found.');
			return;
		}

		member.kick();

		const kickEmbed = {
			color: 0x0099ff,
			title: 'Server kick',
			description: `The user ${member.user.tag} was successfully kicked from the server.`,
			fields: [
				{
					name: 'Kicked by',
					value: `${interaction.user.tag}`,
				},
				{
					name: 'Reason',
					value: `${kickReason ?? 'No reason specified'}`,
				},
			],
		};

		await interaction.reply({ embeds: [ kickEmbed ] });
	},
};
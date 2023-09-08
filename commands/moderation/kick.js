const { SlashCommandBuilder, PermissionFlagsBits, userMention } = require('discord.js');

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
			const noUserFoundEmbed = {
				color: 0x0099ff,
				title: 'Not found',
				description: 'Error: User not found.',
			};
			return await interaction.reply({ embeds: [noUserFoundEmbed] });
		}

		member.kick();

		const kickEmbed = {
			color: 0x0099ff,
			title: 'Server kick',
			description: `The user ${userMention(member.user.id)} was successfully kicked from the server.`,
			fields: [
				{
					name: 'Kicked by',
					value: `${userMention(interaction.user.id)}`,
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
const { SlashCommandBuilder, PermissionFlagsBits, userMention } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('ban')
		.setDescription('Ban a user from the server.')
		.addUserOption(option => option.setName('user').setDescription('User to ban').setRequired(true))
		.addStringOption(option => option.setName('reason').setDescription('Reason for the ban'))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		const banReason = interaction.options.getString('reason');

		if (!user) {
			const noUserFoundEmbed = {
				color: 0x0099ff,
				title: 'Ban',
				description: 'Error: User not found.',
			};
			return await interaction.reply({ embeds: [noUserFoundEmbed] });
		}

		const banEmbed = {
			color: 0x0099ff,
			title: 'Ban',
			description: `The user ${userMention(user.id)} has been successfully banned from the server.`,
			fields: [
				{
					name: 'Banned by',
					value: `${userMention(interaction.user.id)}`,
				},
				{
					name: 'Reason',
					value: `${banReason ?? 'No reason specified'}`,
				},
			],
		};

		interaction.guild.members.ban(user);

		await interaction.reply({ embeds: [ banEmbed ] });
	},
};
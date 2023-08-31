const { SlashCommandBuilder, PermissionFlagsBits, userMention } = require('discord.js');

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

		if (!user) {
			await interaction.reply('Error: User not found.');
			return;
		}

		interaction.guild.members.ban(user);

		const banEmbed = {
			color: 0x0099ff,
			title: 'Server ban',
			description: `The user ${userMention(user.id)} was successfully kicked from the server.`,
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

		await interaction.reply({ embeds: [ banEmbed ] });
	},
};
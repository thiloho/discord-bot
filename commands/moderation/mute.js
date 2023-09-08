const { SlashCommandBuilder, PermissionFlagsBits, userMention } = require('discord.js');

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

		if (!member) {
			const noUserFoundEmbed = {
				color: 0x0099ff,
				title: 'Not found',
				description: 'Error: User not found.',
			};
			return await interaction.reply({ embeds: [noUserFoundEmbed] });
		}

		member.timeout(timeoutDuration * 60000);

		const muteEmbed = {
			color: 0x0099ff,
			title: 'Server mute',
			description: `The user ${userMention(member.user.id)} was successfully muted.`,
			fields: [
				{
					name: 'Duration',
					value: `${timeoutDuration} minutes`,
				},
				{
					name: 'Muted by',
					value: `${userMention(interaction.user.id)}`,
				},
				{
					name: 'Reason',
					value: `${timeoutReason ?? 'No reason specified'}`,
				},
			],
		};

		await interaction.reply({ embeds: [ muteEmbed ] });
	},
};
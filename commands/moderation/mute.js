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

		if (!member) {
			await interaction.reply('Error: User not found.');
			return;
		}

		member.timeout(timeoutDuration * 60000);

		const muteEmbed = {
			color: 0x0099ff,
			title: 'Server mute',
			description: `The user ${member.user.tag} was successfully muted.`,
			fields: [
				{
					name: 'Duration',
					value: `${timeoutDuration}`,
				},
				{
					name: 'Muted by',
					value: `${interaction.user.tag}`,
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
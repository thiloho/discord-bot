const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Remove a mute from a specified user')
		.addUserOption(option => option.setName('target').setDescription('User to mute').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
	async execute(interaction) {
		const member = interaction.options.getMember('target');

		if (!member) {
			const noUserFoundEmbed = {
				color: 0x0099ff,
				title: 'Not found',
				description: 'Error: User not found.',
			};
			return await interaction.reply({ embeds: [noUserFoundEmbed] });
		}

		member.timeout(null);

		const unmutedEmbed = {
			color: 0x0099ff,
			title: 'Unmute',
			description: `${member} was successfully unmuted.`,
		};
		await interaction.reply({ embeds: [unmutedEmbed] });
	},
};
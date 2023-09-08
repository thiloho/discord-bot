const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unmute')
		.setDescription('Remove a mute from a user.')
		.addUserOption(option => option.setName('user').setDescription('User to unmute').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.KickMembers),
	async execute(interaction) {
		const member = interaction.options.getMember('user');

		if (!member) {
			const noUserFoundEmbed = {
				color: 0x0099ff,
				title: 'Unmute',
				description: 'Error: User not found.',
			};
			return await interaction.reply({ embeds: [noUserFoundEmbed] });
		}

		member.timeout(null);

		const unmutedEmbed = {
			color: 0x0099ff,
			title: 'Unmute',
			description: `Successfully unmuted ${member}.`,
		};
		await interaction.reply({ embeds: [unmutedEmbed] });
	},
};
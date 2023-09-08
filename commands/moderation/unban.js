const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('unban')
		.setDescription('Remove a ban from a user.')
		.addUserOption(option => option.setName('user').setDescription('User to unban').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),
	async execute(interaction) {
		const user = interaction.options.getUser('user');
		try {
			await interaction.guild.members.unban(user);
			const unbanEmbed = {
				color: 0x0099ff,
				title: 'Unban',
				description: `Successfully unbanned ${user}.`,
			};
			await interaction.reply({ embeds: [unbanEmbed] });
		}
		catch (error) {
			const unbanFailureEmbed = {
				color: 0x0099ff,
				title: 'Unban',
				description: `${user} is not banned.`,
			};

			await interaction.reply({ embeds: [unbanFailureEmbed] });
		}
	},
};

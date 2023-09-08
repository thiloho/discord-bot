const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the permanent invite link for the server.'),
	async execute(interaction) {
		const serverIcon = interaction.guild.iconURL();

		const unbanEmbed = {
			color: 0x0099ff,
			title: 'Invite',
			description: 'Permanent invite link for this server:\nhttps://discord.gg/SX7fXrDtth',
			thumbnail: {
				url: serverIcon,
			},
		};
		await interaction.reply({ embeds: [unbanEmbed] });
	},
};
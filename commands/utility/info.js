const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get information about a user or the server.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Information about a user.')
				.addUserOption(option => option.setName('user').setDescription('User')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Information about the server.')),
	async execute(interaction) {
		const infoEmbed = {
			color: 0x0099ff,
			title: 'Info',
		};

		if (interaction.options.getSubcommand() === 'user') {
			const user = interaction.options.getUser('user');

			if (user) {
				infoEmbed.fields = [
					{
						name: 'Username',
						value: user.username,
					},
					{
						name: 'ID',
						value: user.id,
					},
					{
						name: 'Account created on',
						value: user.createdAt,
					},
				];
				await interaction.reply({ embeds: [ infoEmbed ] });
			}
			else {
				infoEmbed.fields = [
					{
						name: 'Your username',
						value: interaction.user.username,
					},
					{
						name: 'Your ID',
						value: interaction.user.id,
					},
					{
						name: 'Account created on',
						value: interaction.user.createdAt,
					},
				];
				await interaction.reply({ embeds: [ infoEmbed ] });
			}
		}
		else if (interaction.options.getSubcommand() === 'server') {
			infoEmbed.fields = [
				{
					name: 'Server name',
					value: interaction.guild.name,
				},
				{
					name: 'Total members',
					value: interaction.guild.memberCount,
				},
			];
			await interaction.reply({ embeds: [ infoEmbed ] });
		}
	},
};
const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('info')
		.setDescription('Get info about a user or the server.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('user')
				.setDescription('Info about a user')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('server')
				.setDescription('Info about the server')),
	async execute(interaction) {
		const infoEmbed = {
			color: 0x0099ff,
			title: 'User information',
		};

		if (interaction.options.getSubcommand() === 'user') {
			const user = interaction.options.getUser('target');

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
			infoEmbed.title = 'Server information';
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
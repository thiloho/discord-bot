const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('invite')
		.setDescription('Get the permanent invite link for the server.'),
	async execute(interaction) {
		await interaction.reply('https://discord.gg/v4FXP6v8Xg');
	},
};
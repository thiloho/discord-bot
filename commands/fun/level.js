const { SlashCommandBuilder } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Level up by writing messages!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
				.setDescription('Show your level and required exp points for next level')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('rewards')
				.setDescription('Display rewards for certain level milestones')),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'info') {
			// test
		}
		else if (interaction.options.getSubcommand() === 'rewards') {
			// test
		}
	},
};
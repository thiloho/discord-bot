const { SlashCommandBuilder } = require('discord.js');
const { Users } = require('../../dbObjects.js');

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
			const target = interaction.options.getUser('target') || interaction.user;
			const user = await Users.findOne({ where: { user_id: target.id } });
			if (user) {
				const neededXP = 10 * Math.pow(2, user.level - 1);
				await interaction.reply(`Level: ${user.level}\nXP: ${user.experience_points}/${neededXP}`);
			}
			else {
				await interaction.reply('This user has not started leveling up yet.');
			}
		}
		else if (interaction.options.getSubcommand() === 'rewards') {
			const rewards = 'Level 5: Reward 1\nLevel 10: Reward 2\nLevel 15: Reward 3';
			await interaction.reply(`Level rewards:\n${rewards}`);
		}
	},
};
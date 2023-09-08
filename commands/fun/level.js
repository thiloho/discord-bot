const { SlashCommandBuilder, roleMention, userMention } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const rewards = require('../../level-rewards.json');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('level')
		.setDescription('Track your level and earn rewards by participating in the community.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('info')
				.setDescription('View your current level and experience points.')
				.addUserOption(option => option.setName('user').setDescription('User')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('rewards')
				.setDescription('Explore the rewards you can earn for leveling up.')),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'info') {
			const target = interaction.options.getUser('user') || interaction.user;
			let user = await Users.findOne({ where: { user_id: target.id } });

			if (!user) {
				user = await Users.create({ user_id: target.id });
			}

			const neededXP = 10 * Math.pow(2, user.level - 1);
			const infoEmbed = {
				color: 0x0099ff,
				title: 'Level',
				description: `${target.id === interaction.user.id ? 'Your current level information' : `${userMention(target.id)}'s current level information`}:`,
				fields: [
					{
						name: 'Level',
						value: `${user.level}`,
					},
					{
						name: 'Experience points',
						value: `${user.experience_points} / ${neededXP}`,
					},
				],
			};
			await interaction.reply({ embeds: [infoEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'rewards') {
			const rewardsEmbed = {
				color: 0x0099ff,
				title: 'Level',
				description: 'Here are the level rewards available:',
				fields: [],
			};

			for (const [level, roleId] of Object.entries(rewards)) {
				rewardsEmbed.fields.push({ name: `Level ${level}`, value: `${roleMention(roleId)}` });
			}

			await interaction.reply({ embeds: [rewardsEmbed] });
		}
	},
};

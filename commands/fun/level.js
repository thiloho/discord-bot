const { SlashCommandBuilder, roleMention, userMention, AttachmentBuilder } = require('discord.js');
const { Users } = require('../../dbObjects.js');
const rewards = require('../../level-rewards.json');
const Canvas = require('@napi-rs/canvas');

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
				.setDescription('Explore the rewards you can earn for leveling up.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('infonew')
				.setDescription('New level info command.')),
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
		else if (interaction.options.getSubcommand() === 'infonew') {
			const canvas = Canvas.createCanvas(700, 250);
			const context = canvas.getContext('2d');

			const background = await Canvas.loadImage('https://images.unsplash.com/photo-1534796636912-3b95b3ab5986?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1000&q=80');
			context.drawImage(background, 0, 0, canvas.width, canvas.height);

			context.font = '28px sans-serif';
			context.fillStyle = '#ffffff';
			context.fillText('Level', canvas.width / 2.5, canvas.height / 3.5);

			context.beginPath();
			context.arc(125, 125, 100, 0, Math.PI * 2, true);
			context.closePath();
			context.clip();

			const avatar = await Canvas.loadImage(interaction.user.displayAvatarURL());
			context.drawImage(avatar, 25, 25, 200, 200);

			const attachment = new AttachmentBuilder(await canvas.encode('png'), { name: 'level-image.png' });

			interaction.reply({ files: [attachment] });
		}
	},
};

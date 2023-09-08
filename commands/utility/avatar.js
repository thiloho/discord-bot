const { SlashCommandBuilder, userMention } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Display your or another user\'s avatar.')
		.addUserOption(option => option.setName('user').setDescription('User to preview the avatar of')),
	async execute(interaction) {
		const user = interaction.options.getUser('user');

		const avatarEmbed = {
			color: 0x0099ff,
			title: 'Avatar',
			description: 'Your avatar:',
			image: {
				url: `${interaction.user.displayAvatarURL()}`,
			},
		};

		if (user) {
			avatarEmbed.description = `${userMention(user.id)}'s avatar:`;
			avatarEmbed.image.url = `${user.displayAvatarURL({ dynamic: true })}`;

			return await interaction.reply({ embeds: [ avatarEmbed ] });
		}

		return await interaction.reply({ embeds: [ avatarEmbed ] });
	},
};
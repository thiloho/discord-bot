const { SlashCommandBuilder, userMention } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('avatar')
		.setDescription('Get the avatar URL of the selected user, or your own avatar.')
		.addUserOption(option => option.setName('target').setDescription('The user who you want an avatar preview of')),
	async execute(interaction) {
		const user = interaction.options.getUser('target');

		const avatarEmbed = {
			color: 0x0099ff,
			title: 'User avatar',
			description: 'Your avatar:',
			image: {
				url: `${interaction.user.displayAvatarURL()}`,
			},
		};

		if (user) {
			avatarEmbed.description = `Avatar for ${userMention(user.id)}:`;
			avatarEmbed.image.url = `${user.displayAvatarURL({ dynamic: true })}`;

			return await interaction.reply({ embeds: [ avatarEmbed ] });
		}

		return await interaction.reply({ embeds: [ avatarEmbed ] });
	},
};
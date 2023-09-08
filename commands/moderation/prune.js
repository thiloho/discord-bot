const { SlashCommandBuilder, PermissionFlagsBits, inlineCode } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription('Prune up to 99 messages.')
		.addIntegerOption(option => option.setName('message_count').setDescription('Number of messages to prune').setMinValue(1).setMaxValue(99).setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
		const amount = interaction.options.getInteger('message_count');
		await interaction.channel.bulkDelete(amount, true).catch(error => {
			console.error(error);
			const internalErrorEmbed = {
				color: 0x0099ff,
				title: 'Prune',
				description: 'There was an error trying to prune messages in this channel.',
			};
			interaction.reply({ embeds: [internalErrorEmbed], ephemeral: true });
		});

		const pruneEmbed = {
			color: 0x0099ff,
			title: 'Prune',
			description: `Successfully pruned ${inlineCode(amount)} message(s).`,
		};
		return interaction.reply({ embeds: [pruneEmbed], ephemeral: true });
	},
};
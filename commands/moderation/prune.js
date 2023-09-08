const { SlashCommandBuilder, PermissionFlagsBits, inlineCode } = require('discord.js');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('prune')
		.setDescription('Prune up to 99 messages.')
		.addIntegerOption(option => option.setName('amount').setDescription('Number of messages to prune').setRequired(true))
		.setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),
	async execute(interaction) {
		const amount = interaction.options.getInteger('amount');
		if (amount < 1 || amount > 99) {
			const invalidNumberEmbed = {
				color: 0x0099ff,
				title: 'Invalid number',
				description: 'You need to input a number between 1 and 99.',
			};
			return interaction.reply({ embeds: [invalidNumberEmbed], ephemeral: true });
		}
		await interaction.channel.bulkDelete(amount, true).catch(error => {
			console.error(error);
			const internalErrorEmbed = {
				color: 0x0099ff,
				title: 'Internal error',
				description: 'There was an error trying to prune messages in this channel!',
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
const { SlashCommandBuilder, codeBlock } = require('discord.js');
const { currency, getBalance, addBalance } = require('../../shared-currency-functions');
const { Users, CurrencyShop } = require('../../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('currency')
		.setDescription('Build your own wealth!')
		.addSubcommand(subcommand =>
			subcommand
				.setName('balance')
				.setDescription('Amount of money you or a user has')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('inventory')
				.setDescription('Show the items you or a user have')
				.addUserOption(option => option.setName('target').setDescription('The user')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('transfer')
				.setDescription('Transfer currency to another user')
				.addIntegerOption(option => option.setName('amount').setDescription('Amount of money').setRequired(true))
				.addUserOption(option => option.setName('target').setDescription('The user').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('buy')
				.setDescription('Buy an item')
				.addStringOption(option => option.setName('item').setDescription('Name of the item to buy').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('shop')
				.setDescription('Display the shop'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('leaderboard')
				.setDescription('Display the leaderboard'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('claim')
				.setDescription('Claim your daily money')),
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'balance') {
			const target = interaction.options.getUser('target') ?? interaction.user;

			return interaction.reply(`${target.tag} has ${getBalance(target.id)} Money`);
		}
		else if (interaction.options.getSubcommand() === 'inventory') {
			const target = interaction.options.getUser('target') ?? interaction.user;
			const user = await Users.findOne({ where: { user_id: target.id } });
			const items = await user.getItems();

			if (!items.length) return interaction.reply(`${target.tag} has nothing!`);

			return interaction.reply(`${target.tag} currently has ${items.map(i => `${i.amount} ${i.item.name}`).join(', ')}`);
		}
		else if (interaction.options.getSubcommand() === 'transfer') {
			const currentAmount = getBalance(interaction.user.id);
			const transferAmount = interaction.options.getInteger('amount');
			const transferTarget = interaction.options.getUser('target');

			if (transferAmount > currentAmount) return interaction.reply(`Sorry, ${interaction.user}, you have only ${currentAmount}`);
			if (transferAmount <= 0) return interaction.reply(`Please enter an amount greater than zero, ${interaction.user}.`);

			addBalance(interaction.user.id, -transferAmount);
			addBalance(transferTarget.id, transferAmount);

			return interaction.reply(`Successfully transferred ${transferAmount} to ${transferTarget}. Your current balance is ${getBalance(interaction.user.id)} money.`);
		}
		else if (interaction.options.getSubcommand() === 'buy') {
			const itemName = interaction.options.getString('item');
			const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });

			if (!item) return interaction.reply('That item does not exist.');
			if (item.cost > getBalance(interaction.user.id)) {
				return interaction.reply(`You currently have ${getBalance(interaction.user.id)}, but the ${item.name} costs ${item.cost}!`);
			}

			const user = await Users.findOne({ where: { user_id: interaction.user.id } });
			addBalance(interaction.user.id, -item.cost);
			await user.addItem(item);

			return interaction.reply(`You've bought: ${item.name}.`);
		}
		else if (interaction.options.getSubcommand() === 'shop') {
			const items = await CurrencyShop.findAll();
			return interaction.reply(codeBlock(items.map(i => `${i.name}: ${i.cost} money`).join('\n')));
		}
		else if (interaction.options.getSubcommand() === 'leaderboard') {
			return interaction.reply(
				codeBlock(
					currency.sort((a, b) => b.balance - a.balance)
						.filter(user => interaction.client.users.cache.has(user.user_id))
						.first(10)
						.map((user, position) => `(${position + 1}) ${(interaction.client.users.cache.get(user.user_id).tag)}: ${user.balance} money`)
						.join('\n'),
				),
			);
		}
		else if (interaction.options.getSubcommand() === 'claim') {
			let user = await Users.findOne({ where: { user_id: interaction.user.id } });

			if (!user) {
				user = await Users.create({ user_id: interaction.user.id });
				currency.set(interaction.user.id, user);
			}

			const lastClaim = user.last_claim;
			const now = new Date();
			const diffTime = Math.abs(now - lastClaim);
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays < 1) {
				return interaction.reply(`Sorry, ${interaction.user}, you have already claimed your daily money.`);
			}

			addBalance(interaction.user.id, 10);
			user.last_claim = now;
			await user.save();

			return interaction.reply(`You successfully claimed daily money. Your current balance is ${getBalance(interaction.user.id)} money.`);
		}
	},
};
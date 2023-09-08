const { SlashCommandBuilder, userMention } = require('discord.js');
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
			const balanceEmbed = {
				color: 0x0099ff,
				title: 'Balance',
				description: `${target.id === interaction.user.id ? 'You have' : `${userMention(target.id)} has`} ${getBalance(target.id)}$`,
			};
			return interaction.reply({ embeds: [balanceEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'inventory') {
			const target = interaction.options.getUser('target') ?? interaction.user;
			const user = await Users.findOne({ where: { user_id: target.id } });
			const items = await user.getItems();

			if (!items.length) {
				const inventoryEmptyEmbed = {
					color: 0x0099ff,
					title: 'No items',
					description: `${target.id === interaction.user.id ? 'You have' : `${userMention(target.id)} has`} nothing!`,
				};

				return interaction.reply({ embeds: [inventoryEmptyEmbed] });
			}

			const itemFields = items.map(i => ({
				name: i.item.name,
				value: `Amount: ${i.amount}`,
			}));

			const inventoryEmbed = {
				color: 0x0099ff,
				title: 'Inventory',
				description: `${target.id === interaction.user.id ? 'Your inventory' : `${userMention(target.id)}'s inventory`}`,
				fields: itemFields,
			};

			return interaction.reply({ embeds: [inventoryEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'transfer') {
			const currentAmount = getBalance(interaction.user.id);
			const transferAmount = interaction.options.getInteger('amount');
			const transferTarget = interaction.options.getUser('target');

			if (transferAmount > currentAmount) {
				const insufficientFundsEmbed = {
					color: 0x0099ff,
					title: 'Insufficient Funds',
					description: `Sorry, ${interaction.user}, you have only ${currentAmount}$`,
				};
				return interaction.reply({ embeds: [insufficientFundsEmbed] });
			}
			if (transferAmount <= 0) {
				const zeroAmountEmbed = {
					color: 0x0099ff,
					title: 'Invalid Amount',
					description: `Please enter an amount greater than zero, ${interaction.user}.`,
				};
				return interaction.reply({ embeds: [zeroAmountEmbed] });
			}

			addBalance(interaction.user.id, -transferAmount);
			addBalance(transferTarget.id, transferAmount);

			const transferSuccessEmbed = {
				color: 0x0099ff,
				title: 'Transfer Successful',
				description: `Successfully transferred ${transferAmount}$ to ${transferTarget}. Your current balance is ${getBalance(interaction.user.id)}$.`,
			};
			return interaction.reply({ embeds: [transferSuccessEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'buy') {
			const itemName = interaction.options.getString('item');
			const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });

			if (!item) return interaction.reply('That item does not exist.');
			if (item.cost > getBalance(interaction.user.id)) {
				const purchaseInsufficientFundsEmbed = {
					color: 0x0099ff,
					title: 'Insufficient funds',
					description: `You currently have ${getBalance(interaction.user.id)}$, but the ${item.name} costs ${item.cost}$`,
				};

				return interaction.reply({ embeds: [purchaseInsufficientFundsEmbed] });
			}

			const user = await Users.findOne({ where: { user_id: interaction.user.id } });
			addBalance(interaction.user.id, -item.cost);
			await user.addItem(item);

			const purchaseEmbed = {
				color: 0x0099ff,
				title: 'Purchase',
				description: `You have bought the following item: ${item.name}.`,
			};

			return interaction.reply({ embeds: [purchaseEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'shop') {
			const items = await CurrencyShop.findAll();

			const itemFields = items.map(i => ({
				name: i.name,
				value: `Cost: ${i.cost}$`,
			}));

			const shopEmbed = {
				color: 0x0099ff,
				title: 'Shop',
				fields: itemFields,
			};

			return interaction.reply({ embeds: [shopEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'leaderboard') {
			const leaderboardFields = currency.sort((a, b) => b.balance - a.balance)
				.filter(user => interaction.client.users.cache.has(user.user_id))
				.first(10)
				.map((user, position) => ({
					name: `(${position + 1}) ${interaction.client.users.cache.get(user.user_id).tag}`,
					value: `Balance: ${user.balance}$`,
				}));

			const leaderboardEmbed = {
				color: 0x0099ff,
				title: 'Leaderboard',
				fields: leaderboardFields,
			};

			return interaction.reply({ embeds: [leaderboardEmbed] });
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
				const claimedAlreadyEmbed = {
					color: 0x0099ff,
					title: 'Already claimed',
					description: 'You have already claimed your money in the last 24 hours. Please come back later.',
				};
				return interaction.reply({ embeds: [claimedAlreadyEmbed] });
			}

			const dailyMoneyAmount = 10;

			addBalance(interaction.user.id, dailyMoneyAmount);
			user.last_claim = now;
			await user.save();

			const claimSuccessfulEmbed = {
				color: 0x0099ff,
				title: 'Claimed money',
				description: `You have successfully claimed your ${dailyMoneyAmount} daily money!`,
			};

			return interaction.reply({ embeds: [claimSuccessfulEmbed] });
		}
	},
};
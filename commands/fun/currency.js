const { SlashCommandBuilder, userMention } = require('discord.js');
const { currency, getBalance, addBalance, getAllItems } = require('../../shared-currency-functions');
const { Users, CurrencyShop } = require('../../dbObjects.js');
const { Op } = require('sequelize');

module.exports = {
	data: new SlashCommandBuilder()
		.setName('currency')
		.setDescription('Manage your virtual wealth.')
		.addSubcommand(subcommand =>
			subcommand
				.setName('balance')
				.setDescription('Check your account balance or that of another user.')
				.addUserOption(option => option.setName('user').setDescription('User')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('inventory')
				.setDescription('View your or another user\'s item inventory.')
				.addUserOption(option => option.setName('user').setDescription('User')))
		.addSubcommand(subcommand =>
			subcommand
				.setName('transfer')
				.setDescription('Transfer currency to another user."')
				.addIntegerOption(option => option.setName('amount').setDescription('Amount of money').setMinValue(1).setRequired(true))
				.addUserOption(option => option.setName('recipient').setDescription('User who receives the money').setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('buy')
				.setDescription('Purchase an item from the shop.')
				.addStringOption(option => option.setName('item_name').setDescription('Name of the item to purchase').setAutocomplete(true).setRequired(true)))
		.addSubcommand(subcommand =>
			subcommand
				.setName('shop')
				.setDescription('Browse items available in the shop.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('leaderboard')
				.setDescription('View a list of the richest people on the server.'))
		.addSubcommand(subcommand =>
			subcommand
				.setName('claim')
				.setDescription('Claim your daily money.')),
	async autocomplete(interaction) {
		const focusedValue = interaction.options.getFocused();
		const choices = await getAllItems();
		console.log(choices);
		const filtered = choices.filter(choice => choice.startsWith(focusedValue));
		await interaction.respond(
			filtered.map(choice => ({ name: choice, value: choice })),
		);
	},
	async execute(interaction) {
		if (interaction.options.getSubcommand() === 'balance') {
			const target = interaction.options.getUser('user') ?? interaction.user;
			const balanceEmbed = {
				color: 0x0099ff,
				title: 'Balance',
				description: `${target.id === interaction.user.id ? 'Your current account balance is' : `${userMention(target.id)}'s current account balance is`} $${getBalance(target.id)}.`,
			};
			return interaction.reply({ embeds: [balanceEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'inventory') {
			const target = interaction.options.getUser('user') ?? interaction.user;
			let user = await Users.findOne({ where: { user_id: target.id } });

			if (!user) {
				user = await Users.create({ user_id: target.id });
			}

			const items = await user.getItems();

			if (!items.length) {
				const inventoryEmptyEmbed = {
					color: 0x0099ff,
					title: 'Inventory',
					description: `${target.id === interaction.user.id ? 'Your inventory' : `${userMention(target.id)}'s inventory`} is empty.`,
				};

				return interaction.reply({ embeds: [inventoryEmptyEmbed] });
			}

			const itemFields = items.map(i => ({
				name: i.item.name,
				value: `x${i.amount}`,
			}));

			const inventoryEmbed = {
				color: 0x0099ff,
				title: 'Inventory',
				description: `${target.id === interaction.user.id ? 'Your inventory' : `${userMention(target.id)}'s inventory`} contains the following items:`,
				fields: itemFields,
			};

			return interaction.reply({ embeds: [inventoryEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'transfer') {
			const currentAmount = getBalance(interaction.user.id);
			const transferAmount = interaction.options.getInteger('amount');
			const transferTarget = interaction.options.getUser('recipient');

			if (transferAmount > currentAmount) {
				const insufficientFundsEmbed = {
					color: 0x0099ff,
					title: 'Transfer',
					description: `Sorry, you have only $${currentAmount}, and you tried to transfer $${transferAmount}.`,
				};
				return interaction.reply({ embeds: [insufficientFundsEmbed] });
			}

			addBalance(interaction.user.id, -transferAmount);
			addBalance(transferTarget.id, transferAmount);

			const transferSuccessEmbed = {
				color: 0x0099ff,
				title: 'Buy',
				description: `You have successfully transferred $${transferAmount} to ${transferTarget}. Your current balance is $${getBalance(interaction.user.id)}.`,
			};
			return interaction.reply({ embeds: [transferSuccessEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'buy') {
			const itemName = interaction.options.getString('item_name');
			const item = await CurrencyShop.findOne({ where: { name: { [Op.like]: itemName } } });

			if (!item) return interaction.reply('The requested item does not exist.');
			if (item.cost > getBalance(interaction.user.id)) {
				const purchaseInsufficientFundsEmbed = {
					color: 0x0099ff,
					title: 'Buy',
					description: `You currently have $${getBalance(interaction.user.id)}, but the ${item.name} costs $${item.cost}.`,
				};

				return interaction.reply({ embeds: [purchaseInsufficientFundsEmbed] });
			}

			const user = await Users.findOne({ where: { user_id: interaction.user.id } });

			addBalance(interaction.user.id, -item.cost);
			await user.addItem(item);

			const purchaseEmbed = {
				color: 0x0099ff,
				title: 'Buy',
				description: `You have successfully purhcased the item: ${item.name}.`,
			};

			return interaction.reply({ embeds: [purchaseEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'shop') {
			const items = await CurrencyShop.findAll();

			const itemFields = items.map(i => ({
				name: i.name,
				value: `Cost: $${i.cost}`,
			}));

			const shopEmbed = {
				color: 0x0099ff,
				title: 'Shop',
				description: 'Here are the items available in the shop:',
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
					value: `Balance: $${user.balance}`,
				}));

			const leaderboardEmbed = {
				color: 0x0099ff,
				title: 'Leaderboard',
				description: 'Here are the top 10 users on the currency leaderboard:',
				fields: leaderboardFields,
			};

			return interaction.reply({ embeds: [leaderboardEmbed] });
		}
		else if (interaction.options.getSubcommand() === 'claim') {
			let user = await Users.findOne({ where: { user_id: interaction.user.id } });

			if (!user) {
				user = await Users.create({ user_id: interaction.user.id });
			}

			const lastClaim = user.last_claim;
			const now = new Date();
			const diffTime = Math.abs(now - lastClaim);
			const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

			if (diffDays < 1) {
				const claimedAlreadyEmbed = {
					color: 0x0099ff,
					title: 'Claim',
					description: 'You have already claimed your daily money in the last 24 hours. Please come back later.',
				};
				return interaction.reply({ embeds: [claimedAlreadyEmbed] });
			}

			const dailyMoneyAmount = 10;

			addBalance(interaction.user.id, dailyMoneyAmount);
			user.last_claim = now;
			await user.save();

			const claimSuccessfulEmbed = {
				color: 0x0099ff,
				title: 'Claim',
				description: 'You have successfully claimed your daily money.',
			};

			return interaction.reply({ embeds: [claimSuccessfulEmbed] });
		}
	},
};
const { Collection } = require('discord.js');
const { Users } = require('./dbObjects.js');

const currency = new Collection();

async function addBalance(id, amount) {
	let user = currency.get(id);

	if (user) {
		user.balance += Number(amount);
		await user.save();
	}
	else {
		user = await Users.findOne({ where: { user_id: id } });

		if (user) {
			user.balance += Number(amount);
			await user.save();
			currency.set(id, user);
		}
		else {
			user = await Users.create({ user_id: id, balance: amount });
			currency.set(id, user);
		}
	}

	return user;
}

function getBalance(id) {
	const user = currency.get(id);
	return user ? user.balance : 0;
}

module.exports = { currency, addBalance, getBalance };
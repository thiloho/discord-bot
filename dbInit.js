const Sequelize = require('sequelize');
const items = require('./shop.json');

const sequelize = new Sequelize('dcbot', 'postgres', null, {
	host: '/run/postgresql',
	dialect: 'postgres',
	logging: false,
});

const CurrencyShop = require('./models/CurrencyShop.js')(sequelize, Sequelize.DataTypes);
require('./models/Users.js')(sequelize, Sequelize.DataTypes);
require('./models/UserItems.js')(sequelize, Sequelize.DataTypes);

const force = process.argv.includes('--force') || process.argv.includes('-f');

sequelize.sync({ force }).then(async () => {
	const shop = items.map(item => CurrencyShop.upsert(item));

	await Promise.all(shop);
	console.log('Database synced');

	sequelize.close();
}).catch(console.error);
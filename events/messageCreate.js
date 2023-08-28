const { Events, roleMention } = require('discord.js');
const { Users } = require('../dbObjects.js');

module.exports = {
	name: Events.MessageCreate,
	async execute(message) {
		if (message.author.bot) return;

		const { author } = message;
		const now = Date.now();

		const { cooldowns } = message.client;

		if (cooldowns.has(author.id) && cooldowns.get(author.id) > now) {
			return;
		}

		cooldowns.set(author.id, now + 3000);

		const randomXP = Math.random() < 0.05 ? 2 : 1;

		const user = await Users.findOne({ where: { user_id: author.id } });
		if (user) {
			user.experience_points += randomXP;
			const neededXP = 10 * Math.pow(2, user.level - 1);
			if (user.experience_points >= neededXP) {
				user.level += 1;
				user.experience_points = 0;
				message.reply(`Congratulations! You have leveled up to level ${user.level}!`);

				if (user.level === 3) {
					const roleId = '1145397499784335501';
					const { member } = message;

					member.roles.add(roleId);
					message.reply(`You were given the ${roleMention(roleId)} role because you reached level ${user.level}. Congratulations!`);
				}

				if (user.level === 10) {
					const roleId = '1145397596819554474';
					const { member } = message;

					member.roles.add(roleId);
					message.reply(`You were given the ${roleMention(roleId)} role because you reached level ${user.level}. Congratulations!`);
				}

				if (user.level === 20) {
					const roleId = '1145397674334507110';
					const { member } = message;

					member.roles.add(roleId);
					message.reply(`You were given the ${roleMention(roleId)} role because you reached level ${user.level}. Congratulations!`);
				}
			}
			await user.save();
		}
		else {
			await Users.create({ user_id: author.id, experience_points: randomXP });
		}
	},
};
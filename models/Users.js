module.exports = (sequelize, DataTypes) => {
	return sequelize.define('users', {
		user_id: {
			type: DataTypes.STRING,
			primaryKey: true,
		},
		balance: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		experience_points: {
			type: DataTypes.INTEGER,
			defaultValue: 0,
			allowNull: false,
		},
		level: {
			type: DataTypes.INTEGER,
			defaultValue: 1,
			allowNull: false,
		},
		last_claim: {
			type: DataTypes.DATE,
			defaultValue: new Date(),
			allowNull: false,
		},
	}, {
		timestamps: false,
	});
};
const { REST, Routes } = require('discord.js');
const { guildId } = require('./config.json');
const fs = require('node:fs');
const path = require('node:path');

let token;
let clientId;

for (let i = 0; i < process.argv.length; i++) {
	if (process.argv[i].startsWith('--token=')) {
		const tokenPath = process.argv[i].split('=')[1];
		token = fs.readFileSync(tokenPath, 'utf8').trim();
	}

	if (process.argv[i].startsWith('--clientId=')) {
		clientId = process.argv[i].split('=')[1];
	}
}

if (!token) {
	token = require('./token.json').token;
}

if (!clientId) {
	clientId = require('./config.json').clientId;
}

const commands = [];
const foldersPath = path.join(__dirname, 'commands');
const commandFolders = fs.readdirSync(foldersPath);

for (const folder of commandFolders) {
	const commandsPath = path.join(foldersPath, folder);
	const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));
	for (const file of commandFiles) {
		const filePath = path.join(commandsPath, file);
		const command = require(filePath);
		if ('data' in command && 'execute' in command) {
			commands.push(command.data.toJSON());
		}
		else {
			console.log(`[WARNING] The command at ${filePath} is missing a required "data" or "execute" property.`);
		}
	}
}

const rest = new REST().setToken(token);

(async () => {
	try {
		console.log(`Started refreshing ${commands.length} application (/) commands.`);

		const data = await rest.put(
			Routes.applicationGuildCommands(clientId, guildId),
			{ body: commands },
		);

		console.log(`Successfully reloaded ${data.length} application (/) commands.`);
	}
	catch (error) {
		console.error(error);
	}
})();
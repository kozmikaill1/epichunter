const { Client, GatewayIntentBits, ActivityType, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const db = require('./dbb/database');

const prefix = process.env.PREFIX || '!';

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent
  ]
});

// Komutları yükle
client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const command = require(`./commands/${file}`);
  client.commands.set(command.name, command);
}

client.once('ready', () => {
  console.log(`Bot is online as ${client.user.tag}`);
  client.user.setActivity('beta v.1.0.0', { type: ActivityType.Watching });
});

client.on('messageCreate', message => {
  if (message.author.bot || !message.content.startsWith(prefix)) return;

  db.incrementMessageCount(message.author.id, message.author.username);

  const args = message.content.slice(prefix.length).trim().split(/ +/);
  const commandName = args.shift().toLowerCase();

  const command = client.commands.get(commandName);
  if (!command) return;

  try {
    command.execute(message, args, db);
  } catch (error) {
    console.error(error);
    message.reply('There was an error executing that command.');
  }
});

client.login(process.env.TOKEN);

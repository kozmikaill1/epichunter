// index.js - Lütfen bu kodu kopyalayıp dosyanı GÜNCELLE
const { Client, GatewayIntentBits, ActivityType, Collection } = require('discord.js');
const fs = require('fs');
require('dotenv').config();
const db = require('./dbb/database');

const prefix = process.env.PREFIX || ';';

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
        GatewayIntentBits.GuildMembers,
    ],
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Komutları yükleme
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    // Komut adını anahtar olarak ayarla
    client.commands.set(command.name, command);

    // Eğer komutun aliases özelliği varsa (ve bir dizi ise)
    if (command.aliases && Array.isArray(command.aliases)) {
        // Her bir alias için komutu Collection'a ekle
        for (const alias of command.aliases) {
            client.commands.set(alias, command); // Alias'ı anahtar olarak, komutun kendisini değer olarak ayarla
        }
    }
}

client.once('ready', () => {
    console.log(`Bot is online as ${client.user.tag}`);
    client.user.setActivity('beta v.1.0.0', { type: ActivityType.Watching });

    db.init();
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    try {
        await db.ensureUser(message.author.id, message.author.username);
        await db.addMessages(message.author.id, 1);
    } catch (err) {
        console.error('Database user ensure/message add error:', err);
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Komut adını veya alias'ını doğrudan Collection'dan alıyoruz
    const command = client.commands.get(commandName); 
    if (!command) return;

    try {
        await command.execute(message, args, db, client);
    } catch (error) {
        console.error('Command execution error:', error);
        message.reply('There was an error executing that command.');
    }
});

client.login(process.env.TOKEN);
// index.js
const { Client, GatewayIntentBits, ActivityType, Collection } = require('discord.js');
const fs = require('fs'); // Komutları otomatik yüklemek için
require('dotenv').config(); // .env dosyasını yükler
const db = require('./dbb/database'); // database.js dosyasını çağırır (dbb klasöründe olduğunu varsayarak)

const prefix = process.env.PREFIX || ';'; // Prefix'i .env'den veya varsayılan olarak ';' al

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,           // Sunucu olayları için
        GatewayIntentBits.GuildMessages,    // Sunucu mesajları için
        GatewayIntentBits.MessageContent,   // Mesaj içeriğini okuma izni (ÇOK ÖNEMLİ!)
        GatewayIntentBits.GuildMembers,     // Üyeler hakkında bilgi almak için (username ile arama, ensureUser için)
    ],
});

client.commands = new Collection();
const commandFiles = fs.readdirSync('./commands').filter(file => file.endsWith('.js'));

// Komutları yükleme
for (const file of commandFiles) {
    const command = require(`./commands/${file}`);
    client.commands.set(command.name, command);
}

client.once('ready', () => {
    console.log(`Bot is online as ${client.user.tag}`);
    client.user.setActivity('beta v.1.0.0', { type: ActivityType.Watching });

    // Veritabanı tablolarını başlatma veya varlıklarını kontrol etme
    db.init();
});

client.on('messageCreate', async (message) => {
    // Botların mesajlarını veya prefix ile başlamayan mesajları yok say
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    // Kullanıcının veritabanında var olduğundan emin ol ve mesaj sayısını artır
    try {
        await db.ensureUser(message.author.id, message.author.username); // Kullanıcıyı ekle/güncelle
        await db.addMessages(message.author.id, 1); // Mesaj sayısını artır
    } catch (err) {
        console.error('Database user ensure/message add error:', err);
        // Bu hata, botun çalışmasını durdurmamalı, sadece loglanmalı.
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = client.commands.get(commandName);
    if (!command) return; // Geçersiz komut

    try {
        // Komutu çalıştırırken 'message', 'args', 'db', 'client' parametrelerini sırayla veriyoruz
        await command.execute(message, args, db, client);
    } catch (error) {
        console.error('Command execution error:', error);
        message.reply('There was an error executing that command.');
    }
});

client.login(process.env.TOKEN);
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
        GatewayIntentBits.GuildMembers, // GuildMembers intent'i rol yönetimi için gerekli
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
    client.user.setActivity('Kedyland', { type: ActivityType.WATCHING });

    db.init();
});

client.on('messageCreate', async (message) => {
    if (message.author.bot || !message.content.startsWith(prefix)) return;

    try {
        await db.ensureUser(message.author.id, message.author.username);
        await db.addMessages(message.author.id, 1);
    } catch (err) {
        console.error('Database user ensure/message add error:', err); // Bu logu isterseniz bırakabilirsiniz, genel bir db hatası
    }

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    // Komut adını veya alias'ını doğrudan Collection'dan alıyoruz
    const command = client.commands.get(commandName); 
    if (!command) return;

    try {
        await command.execute(message, args, db, client);
    } catch (error) {
        console.error('Command execution error:', error); // Bu logu isterseniz bırakabilirsiniz, genel bir komut hatası
        message.reply('<:kedy_nah:1381743715000909955>');
    }
});

// Self-roles (kendi kendine rol alma) sistemi için interactionCreate event dinleyicisi
client.on('interactionCreate', async interaction => {
    // Sadece buton etkileşimlerini dinle
    if (!interaction.isButton()) return;

    // Butonun custom ID'si 'selfrole_' ile başlıyor mu kontrol et
    if (interaction.customId.startsWith('selfrole_')) {
        // Etkileşimi hemen defer et (Discord'a botun çalıştığını bildirir)
        await interaction.deferReply({ ephemeral: true }); 

        const roleId = interaction.customId.split('_')[1]; // Rol ID'sini al
        const role = interaction.guild.roles.cache.get(roleId); // Sunucudan rol objesini al
        const member = interaction.member; // Etkileşimi yapan üye

        // console.log(`[Self-Roles] User ${member.user.tag} clicked button for role ID: ${roleId}`); // Kaldırıldı
        // console.log(`[Self-Roles] Attempting to find role: ${role ? role.name : 'Not Found'}`); // Kaldırıldı

        if (!role) {
            return interaction.editReply({ content: 'Role not found. Please contact an administrator.' });
        }

        try {
            // Eğer üye rolu zaten sahipse, rolü kaldır
            if (member.roles.cache.has(role.id)) {
                // console.log(`[Self-Roles] User ${member.user.tag} has role ${role.name}. Attempting to remove.`); // Kaldırıldı
                await member.roles.remove(role.id);
                await interaction.editReply({ content: `The **${role.name}** role has been removed.` });
                // console.log(`[Self-Roles] Role ${role.name} removed for ${member.user.tag}.`); // Kaldırıldı
            } else {
                // Eğer üye rola sahip değilse, rolü ekle
                // console.log(`[Self-Roles] User ${member.user.tag} does NOT have role ${role.name}. Attempting to add.`); // Kaldırıldı
                await member.roles.add(role.id);
                await interaction.editReply({ content: `You have been given the **${role.name}** role.` });
                // console.log(`[Self-Roles] Role ${role.name} added for ${member.user.tag}.`); // Kaldırıldı
            }
        } catch (error) {
            // console.error('[Self-Roles] Error assigning/removing role:', error); // Kaldırıldı
            // Botun rolü atama veya kaldırma izni yoksa hata mesajı (Discord API 50013)
            if (error.code === 50013) { 
                await interaction.editReply({ content: 'I do not have permission to manage roles. Please ensure my role is above the roles I need to assign/remove.' });
            } else {
                // Diğer tüm hatalar için
                await interaction.editReply({ content: 'An error occurred while managing your role.' });
            }
        }
    }
});

client.login(process.env.TOKEN);

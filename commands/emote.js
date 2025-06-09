// commands/addemote.js
const { PermissionsBitField } = require('discord.js'); // İzinleri kontrol etmek için

module.exports = {
    name: 'addemote',
    description: 'Adds a custom emoji to the server from a Discord CDN link. Usage: ;addemote <name> <Discord_CDN_Emoji_Link>',
    async execute(message, args) {
        // Gerekli argümanların kontrolü
        if (args.length !== 2) {
            return message.reply('Incorrect usage. Please use: `;addemote <name> <Discord_CDN_Emoji_Link>`');
        }

        const emojiName = args[0];
        const emojiLink = args[1];

        // Botun gerekli izne sahip olup olmadığını kontrol et
        // 'ManageEmojisAndStickers' izni Discord.js v14'te PermissionsBitField.Flags.ManageEmojisAndStickers olarak geçer.
        if (!message.guild.members.me.permissions.has(PermissionsBitField.Flags.ManageEmojisAndStickers)) {
            return message.reply('I do not have the necessary permissions to add emojis. Please grant me "Manage Emojis and Stickers" permission.');
        }

        // Geçerli bir Discord CDN emoji linki olup olmadığını kontrol et
        const cdnRegex = /^https:\/\/cdn\.discordapp\.com\/emojis\/(\d+)\.(png|gif)(\?.*)?$/;
        const match = emojiLink.match(cdnRegex);

        if (!match) {
            return message.reply('The provided link is not a valid Discord CDN emoji link. Please make sure it starts with `https://cdn.discordapp.com/emojis/` and ends with `.png` or `.gif`.');
        }

        const emojiId = match[1]; // Emoji ID'sini al
        const isAnimated = match[2] === 'gif'; // .gif mi .png mi olduğuna bakarak animasyonlu olup olmadığını anla
        const emojiURL = `https://cdn.discordapp.com/emojis/${emojiId}.${isAnimated ? 'gif' : 'png'}`; // Kesin URL'i oluştur

        try {
            // Emojiyi sunucuya eklemeyi dene
            const newEmoji = await message.guild.emojis.create({
                attachment: emojiURL,
                name: emojiName,
                animated: isAnimated, // Animasyonlu ise belirt
                reason: `Added by ${message.author.tag} using the addemote command.`
            });

            message.channel.send(`Successfully added emoji: ${newEmoji} with the name \`${emojiName}\`!`);
        } catch (error) {
            console.error('Failed to add emoji:', error);

            // Discord API hatası durumunda daha spesifik mesajlar
            if (error.code === 50035) { // Invalid Form Body - Genellikle dosya boyutu veya format hatası
                return message.reply('Failed to add emoji: Invalid emoji file or name. Make sure the emoji is within Discord\'s size limits and the name is valid (alphanumeric, no spaces or special characters except underscores).');
            } else if (error.code === 30008) { // Maximum number of emojis reached
                return message.reply('Failed to add emoji: This server has reached its maximum emoji limit.');
            } else {
                return message.reply(`An error occurred while adding the emoji: ${error.message}`);
            }
        }
    },
};
// commands/buy.js
const { EmbedBuilder } = require('discord.js');
const rewards = require('../data/rewards.js');
const tools = rewards.tools;

// Xx emojisi için sabit bir değişken tanımlayalım
const xxEmoji = '<:xx:1381538571894259802>';

module.exports = {
    name: 'buy',
    description: 'Allows you to buy a hunting tool. Usage: ;buy <tool_name>',
    async execute(message, args, db) {
        if (args.length === 0) {
            // image_7132d0.png'deki gibi "Incorrect usage. Correct usage: ;buy <tool_name>" ve sonra tool listesi
            let availableTools = '';
            for (const toolName in tools) {
                const toolInfo = tools[toolName];
                if (toolInfo.price > 0) { // Fiyatı 0'dan büyük olanları göster
                    availableTools += `${toolName}: ${toolInfo.price}$\n`;
                }
            }
            return message.reply(`Incorrect usage. Correct usage: \`;buy <tool_name>\``);
        }

        const toolNameInput = args.join(' ').toLowerCase();
        let selectedTool = null;

        for (const toolKey in tools) {
            if (toolKey.toLowerCase() === toolNameInput) {
                selectedTool = tools[toolKey];
                selectedTool.name = toolKey; // Tool'un orijinal adını saklayalım
                break;
            }
        }

        if (!selectedTool) {
            return message.reply(`${xxEmoji} That tool does not exist or is not available.`);
        }

        if (selectedTool.price === 0) {
            return message.reply(`${xxEmoji} You cannot buy **${selectedTool.name}**. It costs 0$ (it's likely your starting tool).`);
        }

        try {
            const userMoney = await db.getUserMoney(message.author.id);

            if (userMoney < selectedTool.price) {
                // image_7132d0.png'deki gibi bir mesaj formatı
                return message.reply(`${xxEmoji} You don't have enough money to buy **${selectedTool.name}**. You need ${selectedTool.price}$ but you have ${userMoney}$.`);
            }

            const currentUserTool = await db.getUserTool(message.author.id);
            
            // Kullanıcının envanterindeki item miktarını kontrol et (zaten sahip olup olmadığını anlamak için)
            // Bu kısım, 'You already have a better or equally powerful tool' yerine geçiyor.
            const userItemQuantity = await db.getItemQuantity(message.author.id, selectedTool.name);
            if (userItemQuantity > 0) {
                return message.reply(`${xxEmoji} You already have **${selectedTool.name}**!`);
            }

            // 'better or equally powerful tool' kontrolü KALDIRILDI.

            // Satın alınan item'ı kullanıcının envanterine ekle
            await db.addItem(message.author.id, selectedTool.name, 1); 

            await db.addMoney(message.author.id, -selectedTool.price);
            await db.setUserTool(message.author.id, selectedTool.name); // Yeni alınan tool'u otomatik olarak tak

            // Tool emojisini rewards.js'deki tools objesinden çek
            const toolEmoji = tools[selectedTool.name]?.emoji || ''; 

            // image_70bb8c.png ve image_70c5f8.png'deki gibi embed formatı
            const buySuccessEmbed = new EmbedBuilder()
                .setColor('#00FF00') // Yeşil renk
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(
                    `Successfully purchased ${toolEmoji} **${selectedTool.name}** for ${selectedTool.price}$.\n` +
                    `It has also been equipped automatically!`
                );
            
            message.channel.send({ embeds: [buySuccessEmbed] });

        } catch (error) {
            console.error('Error buying tool:', error);
            message.reply(`${xxEmoji} An error occurred while trying to buy the tool: ${error.message}`);
        }
    },
};
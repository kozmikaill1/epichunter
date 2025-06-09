// commands/equip.js
const rewardsData = require('../data/rewards.js');
const tools = rewardsData.tools;
const xxEmoji = '<:xx:1381538571894259802>'; // Xx emojisini buraya da ekleyelim

module.exports = {
    name: 'equip',
    description: 'Changes your equipped hunting tool. Usage: ;equip <tool_name>',
    async execute(message, args, db) {
        // Eğer hiç argüman verilmezse, sadece kısa kullanım hatası
        if (args.length === 0) {
            return message.reply(`${xxEmoji} Enter tool name.`);
        }

        const requestedToolInput = args.join(' ').toLowerCase();
        let requestedToolName = null;

        for (const toolKey in tools) {
            if (toolKey.toLowerCase() === requestedToolInput) {
                requestedToolName = toolKey;
                break;
            }
        }

        // Eğer istenen tool geçerli bir tool değilse, sadece kısa hata mesajı
        if (!requestedToolName) {
            return message.reply(`${xxEmoji} Could not find any tool with that name.`);
        }

        try {
            const userTool = await db.getUserTool(message.author.id);
            const userInventoryArray = await db.getUserInventory(message.author.id);

            // Envanteri kolayca erişilebilir bir nesneye dönüştürelim
            const userInventory = {};
            for (const item of userInventoryArray) {
                userInventory[item.itemName] = item.quantity;
            }

            // Kullanıcının bu tool'a sahip olup olmadığını kontrol et
            if (requestedToolName === 'Fists') {
                 // Fists'i direkt takmasına izin ver
            } else if (!userInventory[requestedToolName] || userInventory[requestedToolName] < 1) {
                return message.reply(`${xxEmoji} You don't own this tool!`);
            }

            // Zaten aynı tool takılıysa
            if (userTool.toLowerCase() === requestedToolName.toLowerCase()) {
                return message.reply(`${xxEmoji} You already have **${requestedToolName}** equipped.`);
            }

            await db.setUserTool(message.author.id, requestedToolName);
            message.channel.send(`You have successfully equipped the **${requestedToolName}**!`);
        } catch (error) {
            console.error('Error changing user tool:', error);
            message.reply(`${xxEmoji} An error occurred while trying to change your tool.`);
        }
    },
};
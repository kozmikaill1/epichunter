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
            return message.reply(`${xxEmoji} Incorrect usage. Correct usage: \`;buy <tool_name>\``);
        }

        const toolNameInput = args.join(' ').toLowerCase();
        let selectedTool = null;

        for (const toolKey in tools) {
            if (toolKey.toLowerCase() === toolNameInput) {
                selectedTool = tools[toolKey];
                selectedTool.name = toolKey;
                break;
            }
        }

        if (!selectedTool) {
            return message.reply(`${xxEmoji} That tool does not exist or is not available.`);
        }

        if (selectedTool.price === 0) {
            return message.reply(`${xxEmoji} You cannot buy **${selectedTool.name}**. It costs 0💰 (it's likely your starting tool).`);
        }

        try {
            const userMoney = await db.getUserMoney(message.author.id);

            if (userMoney < selectedTool.price) {
                return message.reply(`${xxEmoji} You don't have enough money to buy **${selectedTool.name}**. You need ${selectedTool.price}💰 but you have ${userMoney}💰.`);
            }

            const currentUserTool = await db.getUserTool(message.author.id);

            const currentUserToolPower = tools[currentUserTool] ? tools[currentUserTool].power : 0;
            const selectedToolPower = selectedTool.power || 0;

            if (currentUserToolPower >= selectedToolPower && selectedToolPower > 0) {
                return message.reply(`${xxEmoji} You already have a better or equally powerful tool (**${currentUserTool}**).`);
            }
            
            if (currentUserTool.toLowerCase() === selectedTool.name.toLowerCase()) {
                 return message.reply(`${xxEmoji} You already have **${selectedTool.name}**!`);
            }

            // BURADA EKLEME YAPILDI: Satın alınan item'ı kullanıcının envanterine ekle
            await db.addItem(message.author.id, selectedTool.name, 1); 

            await db.addMoney(message.author.id, -selectedTool.price);
            await db.setUserTool(message.author.id, selectedTool.name);

            const toolEmoji = rewards.hunts.find(r => r.tool === selectedTool.name)?.tool_emoji || ''; 

            const buySuccessEmbed = new EmbedBuilder()
                .setColor('#00FF00')
                .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
                .setDescription(
                    `Successfully purchased ${toolEmoji} **${selectedTool.name}** for ${selectedTool.price}💰.\n` +
                    `It has also been equipped automatically!`
                );
            
            message.channel.send({ embeds: [buySuccessEmbed] });

        } catch (error) {
            console.error('Error buying tool:', error);
            message.reply(`${xxEmoji} An error occurred while trying to buy the tool: ${error.message}`);
        }
    },
};
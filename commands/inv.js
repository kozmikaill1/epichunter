// commands/inventory.js (veya inv.js)
const { EmbedBuilder } = require('discord.js');
const itemPrices = require('../data/itemPrices.js');
const rewardsData = require('../data/rewards.js');


module.exports = {
    name: 'inventory', // veya inv
    aliases: ['inv', 'show', 'profil', 'profile'],
    description: 'Displays your current profile and inventory.',
    async execute(message, args, db) {
        let targetUser = message.author; // Varsayılan olarak komutu kullanan kişi

        // Eğer argüman varsa, hedef kullanıcıyı bulmaya çalış
        if (args.length > 0) {
            let foundUser = null;

            const mentionedUser = message.mentions.users.first();
            if (mentionedUser) {
                foundUser = mentionedUser;
            } else {
                const id = args[0];
                if (message.client.users.cache.get(id)) {
                    foundUser = message.client.users.cache.get(id);
                } else {
                    const name = args.join(' ').toLowerCase();
                    // İsimle arama (guild member cache üzerinden)
                    const memberByName = message.guild.members.cache.find(member => 
                        member.user.username.toLowerCase() === name || 
                        member.displayName.toLowerCase() === name
                    );
                    if (memberByName) {
                        foundUser = memberByName.user;
                    }
                }
            }

            if (foundUser) {
                targetUser = foundUser;
            } 
        }

        const user = await db.getUser(targetUser.id);
        if (!user) {
            if (targetUser.id === message.author.id) {
                return message.reply("You don't have a profile yet! Start by using the hunt command.");
            } else {
                return message.reply(`${targetUser.username} does not have a profile yet!`);
            }
        }

        const userInventory = await db.getUserInventory(targetUser.id);

        let normalItems = [];
        let specialItems = [];

        const specialItemNames = ['Adalium'];

        const toolNames = Object.keys(rewardsData.tools);
        
        for (const item of userInventory) {
            if (item.quantity > 0) {
                if (toolNames.includes(item.itemName)) {
                    continue; 
                }

                if (specialItemNames.includes(item.itemName)) {
                    specialItems.push(item);
                } else {
                    normalItems.push(item);
                }
            }
        }

        normalItems.sort((a, b) => (itemPrices[b.itemName] || 0) - (itemPrices[a.itemName] || 0));
        specialItems.sort((a, b) => (itemPrices[b.itemName] || 0) - (itemPrices[a.itemName] || 0));

        const getEmojiForItem = (itemName) => {
            if (itemName === 'Adalium') {
                return '<:adalium:1360977749392752681>'; // Adalium emoji ID'sini buraya girin!
            }
            const huntReward = rewardsData.hunts.find(hunt => hunt.drop === itemName);
            return huntReward ? huntReward.drop_emoji : '📦';
        };

        const getToolEmoji = (toolName) => {
            return rewardsData.tools[toolName]?.emoji || '⚔️';
        };

        let inventoryDescription = '';
        if (normalItems.length > 0) {
            inventoryDescription = normalItems.map(item => {
                const emoji = getEmojiForItem(item.itemName);
                return `${emoji} ${item.itemName}: ${item.quantity}`;
            }).join('\n');
        } else {
            inventoryDescription = 'Your inventory is empty.';
        }

        let specialInventoryDescription = '';
        if (specialItems.length > 0) {
            specialInventoryDescription = specialItems.map(item => {
                const emoji = getEmojiForItem(item.itemName);
                return `${emoji} ${item.itemName}: ${item.quantity}`;
            }).join('\n');
        } else {
            specialInventoryDescription = 'You have no special items.';
        }

        const expForNextLevel = db.getExpForNextLevel(user.level);
        const levelProgress = `${user.exp}/${expForNextLevel}`;
        const toolEmoji = getToolEmoji(user.tool);

        const profileDescription = [
            `Balance: $${user.money.toLocaleString()}`,
            `Level: ${user.level} (${levelProgress})`,
            `Current Tool: ${toolEmoji} ${user.tool}`,
            `Current Dimension: Overworld`
        ].join('\n');

        const profileEmbed = new EmbedBuilder()
            .setColor('#B1A4F6')
            .setAuthor({ 
                name: `${targetUser.username}'s Inventory`, // "X's Inventory" buraya taşındı
                iconURL: targetUser.displayAvatarURL({ dynamic: true }) 
            })
            // .setTitle() kaldırıldı
            .setDescription(profileDescription)
            .addFields(
                { name: 'Inventory', value: inventoryDescription, inline: false }
            );

        if (specialItems.length > 0 || specialInventoryDescription !== 'You have no special items.') {
            profileEmbed.addFields(
                { name: 'Special Items', value: specialInventoryDescription, inline: false }
            );
        }

        message.channel.send({ embeds: [profileEmbed] });
    },
};
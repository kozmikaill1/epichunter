// commands/value.js
const { EmbedBuilder } = require('discord.js');
const itemPrices = require('../data/itemPrices');
const rewards = require('../data/rewards'); // rewards.js dosyasını dahil ediyoruz
const xxEmoji = '<:xx:1381538571894259802>'; // Hata mesajları için xx emojisi

module.exports = {
    name: 'value',
    description: 'Displays the total sell value of your or another user\'s inventory.',
    usage: ';value [mention/ID/username]',
    async execute(message, args, db) {
        let targetUser = message.author; // Varsayılan olarak komutu kullanan kişi

        // Eğer argümanlar varsa, belirtilen kullanıcıyı bulmaya çalış
        if (args.length > 0) {
            const userIdentifier = args.join(' ').toLowerCase();
            const mentionedUser = message.mentions.users.first();

            if (mentionedUser) {
                targetUser = mentionedUser;
            } else if (userIdentifier) {
                // ID veya username ile kullanıcı arama
                try {
                    const fetchedUser = await message.client.users.fetch(userIdentifier);
                    targetUser = fetchedUser;
                } catch (err) {
                    // Kullanıcı ID ile bulunamazsa, username ile deneme
                    const guildMembers = await message.guild.members.fetch();
                    const memberByUsername = guildMembers.find(member => 
                        member.user.username.toLowerCase() === userIdentifier ||
                        (member.nickname && member.nickname.toLowerCase() === userIdentifier)
                    );
                    if (memberByUsername) {
                        targetUser = memberByUsername.user;
                    } else {
                        return message.reply(`${xxEmoji} User '${args.join(' ')}' not found.`);
                    }
                }
            }
        }

        try {
            const userInventoryArray = await db.getUserInventory(targetUser.id);

            let inventoryValueDescription = '';
            let totalValue = 0;

            // Her bir item için değer hesaplama ve description oluşturma
            if (userInventoryArray && userInventoryArray.length > 0) {
                for (const item of userInventoryArray) {
                    const itemName = item.itemName;
                    const quantity = item.quantity;
                    const priceInfo = itemPrices[itemName];

                    if (priceInfo && priceInfo.sellPrice !== undefined && priceInfo.sellPrice > 0) {
                        const itemSellPrice = priceInfo.sellPrice;
                        const itemTotalValue = itemSellPrice * quantity;
                        totalValue += itemTotalValue;

                        // Item emojisini bulma
                        // rewards.hunts array'indeki 'drop' ve 'drop_emoji' kullanılıyor
                        const foundHunt = rewards.hunts.find(hunt => hunt.drop === itemName);
                        const itemEmoji = foundHunt ? foundHunt.drop_emoji : ''; // Emoji yoksa boş string

                        inventoryValueDescription += `${itemEmoji} ${itemName} ${quantity} x $${itemSellPrice} = $${itemTotalValue}\n`;
                    }
                }
            }

            // Envanter boşsa veya satılabilir item yoksa özel mesaj
            if (inventoryValueDescription === '') {
                inventoryValueDescription = 'No items in inventory.';
            }

            const username = targetUser.username;
            const possessiveSuffix = username.endsWith('s') ? "'" : "'s";

            const valueEmbed = new EmbedBuilder()
                .setColor('#B1A4F6')
                .setTitle(`${username}${possessiveSuffix} Inventory Value`)
                .setDescription(inventoryValueDescription)
                .setFooter({ text: `Total value: $${totalValue}` }); // Toplam değeri her zaman göster

            message.channel.send({ embeds: [valueEmbed] });

        } catch (error) {
            console.error('Error displaying inventory value:', error);
            message.reply(`${xxEmoji} An error occurred while trying to display the inventory value.`);
        }
    },
};

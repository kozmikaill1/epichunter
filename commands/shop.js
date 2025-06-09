// commands/shop.js
const { EmbedBuilder } = require('discord.js');
const rewards = require('../data/rewards.js');
const tools = rewards.tools;

module.exports = {
    name: 'shop',
    description: 'Displays available tools in the shop.',
    async execute(message, args, db) {
        try {
            const userMoney = await db.getUserMoney(message.author.id);
            const currentUserTool = await db.getUserTool(message.author.id);
            const userInventoryArray = await db.getUserInventory(message.author.id);

            const userInventory = {};
            for (const item of userInventoryArray) {
                userInventory[item.itemName] = item.quantity;
            }

            // Shop açıklamasının başlangıcı: Bakiye ve Mevcut Araç
            let shopDescription = `Balance: $${userMoney}\n`; // Bakiye bilgisi
            // Current Tool'un emojisini rewards.js'den çekiyoruz
            const currentToolEmoji = tools[currentUserTool]?.emoji || ''; 
            shopDescription += `Current Tool: ${currentToolEmoji} ${currentUserTool}\n\n`; // Mevcut araç bilgisi

            // Resimdeki sıraya göre manuel olarak kılıçları listeleyelim
            const swordOrder = [
                'Wooden Sword',
                'Stone Sword',
                'Iron Sword',
                'Gold Sword',
                'Diamond Sword'
            ];

            for (const toolName of swordOrder) {
                const toolInfo = tools[toolName];
                // Eğer tool bilgisi yoksa veya fiyatı tanımsızsa atla
                if (!toolInfo || toolInfo.price === undefined) {
                    continue;
                }

                const toolEmoji = toolInfo.emoji;

                let status = '';
                // Envanterde varsa "Owned"
                if (userInventory[toolName] && userInventory[toolName] > 0) {
                    status = ' - Owned';
                }
                // Resimde sadece "Owned" ve fiyat var, bu yüzden 'Equipped' durumunu dışarıda bırakıp sadece 'Owned' ve fiyatı göstereceğiz.
                else {
                    status = ` - $${toolInfo.price}`; // Fiyatı göster
                }
                shopDescription += `${toolEmoji} ${toolName} ${status}\n`;
            }
            
            // Eğer kılıçlar listesine hiç bir şey eklenmediyse bir mesaj göster
            // (Bu durum, `swordOrder` boşsa veya içindeki tüm kılıçlar rewards.js'de tanımsızsa meydana gelir)
            if (shopDescription.split('\n').length <= 2) { // Sadece bakiye ve mevcut tool satırları varsa
                shopDescription += 'No swords are currently available in the shop.';
            }

            const shopEmbed = new EmbedBuilder()
                .setColor('#B1A4F6')
                .setTitle('Tool Shop') // Başlık
                .setDescription(shopDescription); // Oluşturduğumuz tüm açıklamayı ekle

            message.channel.send({ embeds: [shopEmbed] });

        } catch (error) {
            console.error('Error displaying shop:', error);
            message.reply('An error occurred while trying to display the shop.');
        }
    },
};

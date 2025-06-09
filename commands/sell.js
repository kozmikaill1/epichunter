// commands/sell.js
const itemPrices = require('../data/itemPrices');
const rewards = require('../data/rewards'); // Item emojileri için rewards.js'yi ekledik
const xxEmoji = '<:xx:1381538571894259802>'; // Xx emojisi

module.exports = {
    name: 'sell',
    aliases: ['s'],
    description: 'Sells items from your inventory. Usage: ;sell <itemName> [amount] or ;sell all',
    async execute(message, args, db) {
        // Kullanım kontrolü
        if (args.length < 1) {
            // image_719c10.png'deki gibi "Incorrect usage. Correct usage: ;sell <itemName> [amount]"
            return message.reply(`Incorrect usage. Correct usage: \`;sell <itemName> [amount]\` or \`;sell all\``);
        }

        const firstArg = args[0].toLowerCase();

        // --- ;sell all Durumu ---
        if (firstArg === 'all') {
            try {
                const userInventoryArray = await db.getUserInventory(message.author.id);

                if (userInventoryArray.length === 0) {
                    // image_60ca76.png'deki "You have no items to sell!" mesajı
                    return message.reply(`${xxEmoji} You have no items to sell!`);
                }

                let totalMoneyGained = 0;
                const itemsSold = [];

                for (const item of userInventoryArray) {
                    const itemName = item.itemName;
                    const quantity = item.quantity;
                    const priceInfo = itemPrices[itemName];

                    if (priceInfo && priceInfo.sellPrice !== undefined && priceInfo.sellPrice > 0) {
                        const itemSellPrice = priceInfo.sellPrice;
                        const itemTotal = itemSellPrice * quantity;
                        totalMoneyGained += itemTotal;
                        itemsSold.push({ name: itemName, quantity: quantity, total: itemTotal });

                        await db.removeItem(message.author.id, itemName, quantity); // Tüm miktarı çıkar
                    }
                }

                if (totalMoneyGained > 0) {
                    await db.addMoney(message.author.id, totalMoneyGained);
                    // image_60ca76.png'deki "You sold all your items for $10" mesajı
                    message.channel.send(`✅ You sold all your items for $${totalMoneyGained}`);
                } else {
                    return message.reply(`${xxEmoji} You have no items to sell!`);
                }

            } catch (error) {
                console.error('Error selling all items:', error);
                message.reply(`${xxEmoji} An error occurred while selling your inventory: ${error.message}`);
            }
            return; // 'all' durumu işlendi, fonksiyonu bitir
        }

        // --- Tekil Item Satış Durumu ---
        let amountToSell = 1;
        let rawInputItemName;

        const lastArg = args[args.length - 1];
        if (!isNaN(parseInt(lastArg)) && args.length > 1) {
            amountToSell = parseInt(lastArg);
            rawInputItemName = args.slice(0, args.length - 1).join(' ');
        } else {
            rawInputItemName = args.join(' ');
        }

        if (amountToSell <= 0) {
            return message.reply(`${xxEmoji} Please provide a valid positive number for the amount to sell.`);
        }

        let foundItemName = null;
        for (const key in itemPrices) {
            if (key.toLowerCase() === rawInputItemName.toLowerCase()) {
                foundItemName = key;
                break;
            }
        }

        if (!foundItemName) {
            return message.reply(`${xxEmoji} **${rawInputItemName}** is not a recognizable item that can be sold.`);
        }

        try {
            const userItemQuantity = await db.getItemQuantity(message.author.id, foundItemName);
            if (userItemQuantity < amountToSell) {
                return message.reply(`${xxEmoji} You don't have enough **${foundItemName}** to sell. You have ${userItemQuantity}.`);
            }

            const priceInfo = itemPrices[foundItemName];
            if (!priceInfo || priceInfo.sellPrice === undefined || priceInfo.sellPrice === null || priceInfo.sellPrice <= 0) {
                return message.reply(`${xxEmoji} **${foundItemName}** cannot be sold or its sell price is not set.`);
            }

            const totalMoneyGained = priceInfo.sellPrice * amountToSell;

            await db.removeItem(message.author.id, foundItemName, amountToSell);
            await db.addMoney(message.author.id, totalMoneyGained);

            // Item emojisini bulma
            // rewards.hunts array'indeki 'drop' ve 'drop_emoji' kullanılıyor
            const foundHunt = rewards.hunts.find(hunt => hunt.drop === foundItemName);
            const itemEmoji = foundHunt ? foundHunt.drop_emoji : ''; 
            
            // image_60ca76.png'deki "You sold 1 :emoji: Raw Mutton for $12" mesajı
            message.channel.send(`✅ You sold ${amountToSell} ${itemEmoji} **${foundItemName}** for $${totalMoneyGained}!`);

        } catch (error) {
            console.error('Error selling item:', error);
            message.reply(`${xxEmoji} An error occurred while selling **${foundItemName}**: ${error.message}`);
        }
    },
};

// commands/sell.js
const itemPrices = require('../data/itemPrices');

module.exports = {
    name: 'sell',
    description: 'Sells items from your inventory. Usage: ;sell <itemName> [amount]',
    async execute(message, args, db) {
        if (args.length < 1) { // Minimum 1 arg (itemName)
            return message.reply('Incorrect usage. Correct usage: `;sell <itemName> [amount]`');
        }

        let amountToSell = 1; // Default to 1
        let rawInputItemName;

        // Check if the last argument is a number (the amount)
        const lastArg = args[args.length - 1];
        if (!isNaN(parseInt(lastArg)) && args.length > 1) { // If it's a number and there's more than one arg
            amountToSell = parseInt(lastArg);
            rawInputItemName = args.slice(0, args.length - 1).join(' '); // Item name is all but the last arg
        } else {
            rawInputItemName = args.join(' '); // Item name is all args
        }

        if (amountToSell <= 0) {
            return message.reply('Please provide a valid positive number for the amount to sell.');
        }

        // --- EŞLEŞTİRME MANTIĞI (Öncekiyle aynı, ancak rawInputItemName artık doğru) ---
        let foundItemName = null;
        for (const key in itemPrices) {
            if (key.toLowerCase() === rawInputItemName.toLowerCase()) {
                foundItemName = key;
                break;
            }
        }

        if (!foundItemName) {
            return message.reply(`**${rawInputItemName}** is not a recognizable item that can be sold.`);
        }
        // --- EŞLEŞTİRME MANTIĞI SONU ---

        try {
            const userItemQuantity = await db.getItemQuantity(message.author.id, foundItemName);
            if (userItemQuantity < amountToSell) {
                return message.reply(`You don't have enough **${foundItemName}** to sell. You have ${userItemQuantity}.`);
            }

            const priceInfo = itemPrices[foundItemName];
            if (!priceInfo || priceInfo.sellPrice === undefined || priceInfo.sellPrice === null || priceInfo.sellPrice <= 0) {
                return message.reply(`**${foundItemName}** cannot be sold or its sell price is not set.`);
            }

            const totalMoneyGained = priceInfo.sellPrice * amountToSell;

            await db.removeItem(message.author.id, foundItemName, amountToSell);
            await db.addMoney(message.author.id, totalMoneyGained);

            message.channel.send(`You successfully sold ${amountToSell} **${foundItemName}** for ${totalMoneyGained}💰!`);

        } catch (error) {
            console.error('Error selling item:', error);
            message.reply(`An error occurred while selling **${foundItemName}**: ${error.message}`);
        }
    },
};
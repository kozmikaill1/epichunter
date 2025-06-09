// commands/shop.js
const { EmbedBuilder } = require('discord.js');
const itemPrices = require('../data/itemPrices'); // itemPrices dosyasını çağırıyoruz

module.exports = {
    name: 'shop',
    description: 'Displays items and their sell prices in the shop.',
    async execute(message, args, db) {
        const allItems = Object.keys(itemPrices);

        if (allItems.length === 0) {
            return message.channel.send('The shop is currently empty! No items are listed.');
        }

        const shopEmbed = new EmbedBuilder()
            .setColor('#0099ff')
            .setTitle('🛒 Epic Hunter Shop')
            .setDescription('Here are the items you can sell and their prices:')
            .setTimestamp()
            .setFooter({ text: 'Use ;sell <item> <amount> to sell your items!' });

        allItems.forEach(itemName => {
            const prices = itemPrices[itemName];
            let sellInfo = prices.sellPrice !== undefined && prices.sellPrice > 0 ? `${prices.sellPrice}💰` : 'N/A';

            shopEmbed.addFields(
                { name: `• ${itemName}`, value: `Sell: ${sellInfo}`, inline: true }
            );
        });

        message.channel.send({ embeds: [shopEmbed] });
    },
};
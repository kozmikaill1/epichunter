// commands/reset.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'reset',
    description: 'Resets all data for a specified user. (Admin Only)',
    aliases: [],
    async execute(message, args, db, client) {
        // Bu komutu kullanmaya yetkili ID'ler (Örn: Sizin ID'niz)
        const authorizedUsers = [
            '688755035282079750', // Sizin ID'niz
            '817487630689632276'  // Başka bir yetkili ID
        ];

        if (!authorizedUsers.includes(message.author.id)) {
            return message.reply('You do not have permission to use this command.');
        }

        // Kimin datasının sıfırlanacağını belirle
        // argüman olarak kullanıcı ID'si veya etiket (@kullanıcı) beklenir
        const targetUser = message.mentions.users.first() || client.users.cache.get(args[0]);

        if (!targetUser) {
            const embed = new EmbedBuilder()
                .setColor('#B1A4F6')
                .setDescription('Please mention a user or provide a user ID to reset their data.');
            return message.channel.send({ embeds: [embed] });
        }

        const userIdToReset = targetUser.id;

        try {
            await db.resetUserData(userIdToReset);

            const embed = new EmbedBuilder()
                .setColor('#B1A4F6')
                .setDescription(`Successfully reset all data for **${targetUser.username}**.`);
            message.channel.send({ embeds: [embed] });

        } catch (error) {
            console.error('Error resetting user data via command:', error);
            const embed = new EmbedBuilder()
                .setColor('#B1A4F6')
                .setDescription(`An error occurred while resetting data for **${targetUser.username}**.`);
            message.channel.send({ embeds: [embed] });
        }
    },
};
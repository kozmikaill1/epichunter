// commands/hunt.js - Lütfen bu kodu kopyalayıp dosyanı GÜNCELLE
const { EmbedBuilder } = require('discord.js');
const rewardsData = require('../data/rewards.js'); // rewards.js'yi rewardsData olarak import ettik
const huntRewards = rewardsData.hunts; // rewardsData objesinin içindeki 'hunts' dizisini alıyoruz

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    name: 'hunt',
    description: 'Go hunting and get rewards based on your equipped tool!',
    async execute(message, args, db, client) {
        // Kullanıcının tool'unu getir, yoksa varsayılan olarak 'Fists'
        const userTool = await db.getUserTool(message.author.id) || 'Fists';

        // Kullanıcının tool'una uygun olası ödülleri filtrele
        // Artık rewards.filter yerine huntRewards.filter kullanıyoruz
        const possibleRewards = huntRewards.filter(r => r.tool.toLowerCase() === userTool.toLowerCase());

        if (possibleRewards.length === 0) {
            // Eğer kullanıcının tool'u için tanımlı ödül yoksa veya tool tanınmıyorsa
            return message.channel.send(`${message.author}, You have no valid hunting tool equipped or there are no rewards defined for your tool!`);
        }

        // Olası ödüller arasından rastgele birini seç
        const reward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];

        // expRange ve dropQuantityRange'in geçerli olduğundan emin ol
        if (!reward.expRange || !Array.isArray(reward.expRange) || reward.expRange.length < 2) {
            console.error(`Error: expRange is invalid for tool: ${reward.tool}`);
            return message.reply(`A configuration error occurred for your tool's rewards. Please contact an administrator.`);
        }
        const gainedExp = getRandomInt(reward.expRange[0], reward.expRange[1]);

        if (!reward.dropQuantityRange || !Array.isArray(reward.dropQuantityRange) || reward.dropQuantityRange.length < 2) {
            console.error(`Error: dropQuantityRange is invalid for tool: ${reward.tool}`);
            return message.reply(`A configuration error occurred for your tool's item drops. Please contact an administrator.`);
        }
        const droppedQuantity = getRandomInt(reward.dropQuantityRange[0], reward.dropQuantityRange[1]);

        // Veritabanına XP ve Item ekle
        await db.addExp(message.author.id, gainedExp);
        await db.addItem(message.author.id, reward.drop, droppedQuantity);

        // Embed için emojileri al
        const mobEmoji = reward.mob_emoji || '';
        const toolEmoji = reward.tool_emoji || '';
        const expEmoji = '<a:XPVF:1358424699515699281>'; // Bu emoji değişmedi
        const dropEmoji = reward.drop_emoji || '';

        // Hunt sonucunu gösteren Embed oluştur
        const huntEmbed = new EmbedBuilder()
            .setColor('#7289DA')
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(
                `You hunted a **${reward.mob}** ${mobEmoji} with your ${toolEmoji} **${reward.tool}** and ` +
                `received ${gainedExp} ${expEmoji} and ${droppedQuantity} ${dropEmoji} **${reward.drop}**`
            );

        message.channel.send({ embeds: [huntEmbed] });
    },
};
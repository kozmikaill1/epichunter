// commands/hunt.js
const { EmbedBuilder, Collection } = require('discord.js');
const rewardsData = require('../data/rewards.js');
const huntRewards = rewardsData.hunts;

const cooldowns = new Collection(); 
const COOLDOWN_SECONDS = 5; 

function getRandomInt(min, max) {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
}

module.exports = {
    name: 'hunt',
    aliases: ['h'],
    description: 'Go hunting and get rewards based on your equipped tool!',
    async execute(message, args, db, client) {
        if (cooldowns.has(message.author.id)) {
            const expirationTime = cooldowns.get(message.author.id);
            const currentTime = Date.now();

            if (currentTime < expirationTime) {
                const timeLeft = (expirationTime - currentTime) / 1000;
                const xxEmoji = '<:xx:1381538571894259802>'; 
                return message.reply(`${xxEmoji} You must wait ${timeLeft.toFixed(1)}s before hunting again.`);
            }
        }

        cooldowns.set(message.author.id, Date.now() + COOLDOWN_SECONDS * 1000);

        const userTool = await db.getUserTool(message.author.id) || 'Fists';

        const possibleRewards = huntRewards.filter(r => r.tool.toLowerCase() === userTool.toLowerCase());

        if (possibleRewards.length === 0) {
            return message.channel.send(`${message.author}, You have no valid hunting tool equipped or there are no rewards defined for your tool!`);
        }

        const reward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];

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
        
        await db.addExp(message.author.id, gainedExp);
        await db.addItem(message.author.id, reward.drop, droppedQuantity);

        const mobEmoji = reward.mob_emoji || '';
        const toolEmoji = rewardsData.tools[userTool]?.emoji || ''; 
        const expEmoji = '<a:XPVF:1358424699515699281>'; 
        const dropEmoji = reward.drop_emoji || '';

        const huntEmbed = new EmbedBuilder()
            .setColor('#B1A4F6')
            .setAuthor({ name: message.author.username, iconURL: message.author.displayAvatarURL({ dynamic: true }) })
            .setDescription(
                `You hunted a ${reward.mob} ${mobEmoji} with your ${toolEmoji} and ` + // Kılıç ismi tamamen kalktı
                `received ${gainedExp} ${expEmoji} and ${droppedQuantity} ${dropEmoji}` // Item ismi tamamen kalktı
            );

        message.channel.send({ embeds: [huntEmbed] });
    },
};
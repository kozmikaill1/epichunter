// commands/tool.js
const rewards = require('../data/rewards'); // Mevcut tool'ları rewards dosyasından al

module.exports = {
    name: 'equip',
    description: 'Changes your equipped hunting tool. Usage: ;tool <tool_name>',
    async execute(message, args, db) {
        if (args.length !== 1) {
            return message.reply('Incorrect usage. Correct usage: `;tool <tool_name>`');
        }

        const requestedTool = args[0];

        // rewards dosyasındaki tool'lar arasında var mı diye kontrol et
        const availableTools = rewards.map(r => r.tool);
        if (!availableTools.includes(requestedTool)) {
            return message.reply(`'${requestedTool}' is not a valid tool. Available tools: ${availableTools.join(', ')}`);
        }

        try {
            await db.setUserTool(message.author.id, requestedTool);
            message.channel.send(`You have successfully equipped the **${requestedTool}**!`);
        } catch (error) {
            console.error('Error changing user tool:', error);
            message.reply('An error occurred while trying to change your tool.');
        }
    },
};
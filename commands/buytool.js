// commands/buytool.js
const rewards = require('../data/rewards.js');
const tools = rewards.tools; // rewards objesinin içindeki tools kısmını al

module.exports = {
    name: 'buy', // Komut adı 'buy' olarak kalır
    description: 'Allows you to buy a hunting tool. Usage: ;buy <tool_name>',
    async execute(message, args, db) {
        // Eğer hiç argüman verilmezse, kullanım bilgisini ve mevcut tool'ları listele
        if (args.length === 0) { 
            let toolList = 'Available tools:\n';
            for (const key in tools) {
                if (tools[key].price > 0) { // Sadece satılabilir tool'ları göster
                    toolList += `**${key}**: ${tools[key].price}💰\n`;
                }
            }
            return message.reply(`Incorrect usage. Correct usage: \`;buy <tool_name>\`\n${toolList}`);
        }

        // Tüm argümanları birleştirerek tool adını oluştur
        const toolNameInput = args.join(' ').toLowerCase(); 
        let selectedTool = null;

        // tools objesindeki araçları gezerek eşleşen aracı bul
        for (const toolKey in tools) {
            if (toolKey.toLowerCase() === toolNameInput) {
                selectedTool = tools[toolKey];
                selectedTool.name = toolKey; // Orijinal ismi de obje içine ekle
                break;
            }
        }

        if (!selectedTool) {
            let toolList = 'Available tools:\n';
            for (const key in tools) {
                if (tools[key].price > 0) {
                    toolList += `**${key}**: ${tools[key].price}💰\n`;
                }
            }
            return message.reply(`That tool does not exist or is not available. ${toolList}`);
        }

        if (selectedTool.price === 0) {
            return message.reply(`You cannot buy **${selectedTool.name}**. It costs 0💰 (it's likely your starting tool).`);
        }

        try {
            const userMoney = await db.getUserMoney(message.author.id);

            if (userMoney < selectedTool.price) {
                return message.reply(`You don't have enough money to buy **${selectedTool.name}**. You need ${selectedTool.price}💰 but you have ${userMoney}💰.`);
            }

            const currentUserTool = await db.getUserTool(message.author.id);

            // Mevcut tool'un gücünü alalım (eğer power özelliği tanımlıysa)
            const currentUserToolPower = tools[currentUserTool] ? tools[currentUserTool].power : 0;
            // Yeni tool'un gücünü alalım
            const selectedToolPower = selectedTool.power || 0;

            // Eğer kullanıcının mevcut tool'u, satın almaya çalıştığı tool'dan daha güçlüyse veya aynı güçteyse
            if (currentUserToolPower >= selectedToolPower && selectedToolPower > 0) {
                return message.reply(`You already have a better or equally powerful tool (**${currentUserTool}**).`);
            }
            
            // Eğer mevcut tool ile satın alınacak tool aynı ise (güçleri farklı olsa bile)
            if (currentUserTool.toLowerCase() === selectedTool.name.toLowerCase()) {
                 return message.reply(`You already have **${selectedTool.name}**!`);
            }

            // Para düşür ve tool'u güncelle
            await db.addMoney(message.author.id, -selectedTool.price); // Eksi değer göndererek parayı düşür
            await db.setUserTool(message.author.id, selectedTool.name);

            message.channel.send(`You successfully bought **${selectedTool.name}** for ${selectedTool.price}💰! Your new tool is **${selectedTool.name}**.`);

        } catch (error) {
            console.error('Error buying tool:', error);
            message.reply(`An error occurred while trying to buy the tool: ${error.message}`);
        }
    },
};
// commands/help.js
const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
    name: 'help',
    description: 'Displays a list of available commands.',
    aliases: ['h'], 
    async execute(message, args, db, client) { 
        // client.commands bir Collection olduğu için, values() ile tüm komut objelerini alıp
        // Set kullanarak sadece benzersiz komut objelerini elde edebiliriz.
        // Böylece alias'lar yüzünden komutlar tekrar etmez.
        const uniqueCommands = new Set(client.commands.values()); 

        // Komutları kategorilere ayırma
        const economyCommands = Array.from(uniqueCommands).filter(cmd => ['buy', 'sell', 'shop', 'value'].includes(cmd.name)); 
        const huntingCommands = Array.from(uniqueCommands).filter(cmd => ['hunt', 'equip'].includes(cmd.name));
        
        // Dosya yapısında 'profile', 'balance', 'inventory' görünmüyor. Eğer bu komutlar varsa, aşağıdaki satırı aktif edip ilgili komut adlarını ekleyin:
        const profileCommands = Array.from(uniqueCommands).filter(cmd => ['profile', 'balance', 'inventory'].includes(cmd.name));
        
        const miscCommands = Array.from(uniqueCommands).filter(cmd => ['edit', 'help', 'ping', 'emote', 'show'].includes(cmd.name)); 

        // Her kategori için komut adlarını al
        const getCommandNames = (cmds) => {
            if (cmds.length === 0) return 'No commands in this category.'; // Array olduğu için .size yerine .length kullanıyoruz
            return cmds.map(cmd => `\`${cmd.name}\``).join(' , '); 
        };

        const economyList = getCommandNames(economyCommands);
        const huntingList = getCommandNames(huntingCommands);
        const profileList = getCommandNames(profileCommands); // Eğer profileCommands'ı aktif ederseniz bu satırı da aktif edin
        const miscList = getCommandNames(miscCommands);

        const helpEmbed = new EmbedBuilder()
            .setColor('#2F3136') 
            .setTitle('Help Menu')
            .setDescription('Here are the available command categories:');

        if (economyCommands.length > 0) { // .size yerine .length
            helpEmbed.addFields({ name: 'Economy', value: economyList, inline: false });
        }
        if (huntingCommands.length > 0) { // .size yerine .length
            helpEmbed.addFields({ name: 'Hunting', value: huntingList, inline: false });
        }
        // Eğer profileCommands'ı aktif ederseniz bu kısmı da aktif edin:
        if (profileCommands.length > 0) { // .size yerine .length
             helpEmbed.addFields({ name: 'Profile / Inventory', value: profileList, inline: false });
        }
        if (miscCommands.length > 0) { // .size yerine .length
            helpEmbed.addFields({ name: 'Misc', value: miscList, inline: false });
        }

        // Butonları oluştur
        const inviteButton = new ButtonBuilder()
            .setLabel('Invite Link')
            .setURL('https://discord.com/oauth2/authorize?client_id=1381334806192980038&permissions=346112&integration_type=0&scope=bot+applications.commands') 
            .setStyle(ButtonStyle.Link);

        const supportButton = new ButtonBuilder()
            .setLabel('Support Server')
            .setURL('https://discord.gg/CYSa4m5F') 
            .setStyle(ButtonStyle.Link);

        const row = new ActionRowBuilder()
            .addComponents(inviteButton, supportButton);

        message.channel.send({ embeds: [helpEmbed], components: [row] });
    },
};
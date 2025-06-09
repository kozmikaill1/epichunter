// commands/rules.js
const { EmbedBuilder } = require('discord.js');

module.exports = {
    name: 'rules',
    description: 'Displays the server rules.',
    aliases: ['rule', 'kurallar'], // İsteğe bağlı olarak farklı aliaslar ekleyebilirsiniz
    async execute(message, args, db, client) {
        const rulesEmbed = new EmbedBuilder()
            .setColor('#B1A4F6') // Belirtilen renk
            .setTitle('📜 Server Rules') // Başlık ve emoji
            .setDescription(
                `**Rule #1:** Be respectful toward other people. No harassing or personally attacking others.\n\n` + // Boşluk eklendi
                `**Rule #2:** No spamming in the text channels.\n\n` + // Boşluk eklendi
                `**Rule #3:** No pornographic or disturbing content.\n\n` + // Boşluk eklendi
                `**Rule #4:** Do not advertise in any channels. (Instant Ban or mute)\n\n` + // Boşluk eklendi
                `**Rule #5:** No hidden name or pfp.\n\n` + // Boşluk eklendi
                `**Rule #6:** Automating or exploiting the commands will result in a reset of your account!` // Son kuralda boşluk gerekmez
            )
            .setFooter({ text: 'Please read and follow these rules to ensure a positive community for everyone.' }); // İsteğe bağlı bir altbilgi

        message.channel.send({ embeds: [rulesEmbed] });
    },
};
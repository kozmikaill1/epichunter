// commands/show.js
const allowedUserIds = ['688755035282079750', '817487630689632276']; // İzin verilen kullanıcı ID'leri

module.exports = {
    name: 'show',
    description: 'Shows a user\'s database data. (Example: ;show <userID/userName> [data_name])',
    async execute(message, args, db, client) {
        // Komutu kullanan kullanıcının ID'sinin izin verilenler listesinde olup olmadığını kontrol et
        if (!allowedUserIds.includes(message.author.id)) {
            return message.reply('You do not have permission to use this command.');
        }

        if (args.length < 1) {
            return message.reply('Incorrect usage. Correct usage: `;show <userID/userName> [data_name]`');
        }

        const targetIdentifier = args[0]; // User ID or username
        const specificData = args[1] ? args[1].toLowerCase() : null; // Specific data to show (e.g., exp, money, level)

        let targetUserId;

        // Determine if the target is an ID or a username
        try {
            if (targetIdentifier.match(/^\d+$/)) { // If it consists only of digits, it's an ID
                targetUserId = targetIdentifier;
            } else { // Otherwise, treat it as a username and try to find the ID
                const member = await message.guild.members.fetch({ query: targetIdentifier, limit: 1 })
                    .then(collection => collection.first())
                    .catch(() => null);

                if (!member) {
                    return message.reply(`Could not find a user named '${targetIdentifier}'.`);
                }
                targetUserId = member.id;
            }
        } catch (fetchError) {
            console.error('Error fetching member in show command:', fetchError);
            return message.reply('An error occurred while trying to find the user.');
        }

        try {
            // Kullanıcının tüm verisini çekmek için db.getUser fonksiyonunu kullanıyoruz
            const userData = await db.getUser(targetUserId);

            if (!userData) { // Eğer userData null veya undefined ise, kullanıcı veritabanında yoktur
                return message.channel.send(`**${targetIdentifier}** user not found in the database.`);
            }

            let responseMessage = `**${userData.username || targetIdentifier}**'s data:\n`;

            if (specificData) {
                // If specific data is requested
                if (userData.hasOwnProperty(specificData)) {
                    responseMessage += `**${specificData}:** ${userData[specificData]}`;
                } else {
                    responseMessage += `No setting named **${specificData}** found in the database for this user.`;
                }
            } else {
                // If all data is requested
                for (const key in userData) {
                    // Exclude 'id' and 'username' as they are already in the title or implicitly known
                    if (key !== 'id' && key !== 'username') {
                        responseMessage += `**${key}:** ${userData[key]}\n`;
                    }
                }
            }

            message.channel.send(responseMessage);

        } catch (error) {
            console.error('Show command error:', error);
            message.reply(`An error occurred: ${error.message}`);
        }
    },
};
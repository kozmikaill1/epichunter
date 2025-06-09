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
        if (targetIdentifier.match(/^\d+$/)) { // If it consists only of digits, it's an ID
            targetUserId = targetIdentifier;
        } else { // Otherwise, treat it as a username and try to find the ID
            const member = message.guild.members.cache.find(m => m.user.username.toLowerCase() === targetIdentifier.toLowerCase() || m.displayName.toLowerCase() === targetIdentifier.toLowerCase());
            if (!member) {
                return message.reply(`Could not find a user named '${targetIdentifier}'.`);
            }
            targetUserId = member.id;
        }

        try {
            // Fetch all user data
            const userData = await new Promise((resolve, reject) => {
                db.db.get(`SELECT * FROM users WHERE id = ?`, [targetUserId], (err, row) => {
                    if (err) {
                        console.error('Database get error in show command:', err);
                        return reject(err);
                    }
                    resolve(row);
                });
            });

            if (!userData) {
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
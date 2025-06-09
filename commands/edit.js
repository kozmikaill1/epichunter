// commands/edit.js
const allowedUserIds = ['688755035282079750', '817487630689632276']; // İzin verilen kullanıcı ID'leri

module.exports = {
    name: 'edit',
    description: 'Edits a user\'s database data. (Example: ;edit <userID/userName> <data_name> <new_value>)',
    async execute(message, args, db, client) {
        // Komutu kullanan kullanıcının ID'sinin izin verilenler listesinde olup olmadığını kontrol et
        if (!allowedUserIds.includes(message.author.id)) {
            return message.reply('You do not have permission to use this command.');
        }

        if (args.length < 3) {
            return message.reply('Incorrect usage. Correct usage: `;edit <userID/userName> <data_name> <new_value>`');
        }

        const targetIdentifier = args[0]; // User ID or username
        const settingToEdit = args[1].toLowerCase(); // Data field to edit (e.g., exp, money, level)
        const newValue = args.slice(2).join(' '); // New value (can contain spaces)

        let targetUserId;

        // Determine if the target is an ID or a username
        try {
            if (targetIdentifier.match(/^\d+$/)) {
                targetUserId = targetIdentifier;
            } else {
                const member = await message.guild.members.fetch({ query: targetIdentifier, limit: 1 })
                    .then(collection => collection.first())
                    .catch(() => null);

                if (!member) {
                    return message.reply(`Could not find a user named '${targetIdentifier}'.`);
                }
                targetUserId = member.id;
            }
        } catch (fetchError) {
            console.error('Error fetching member in edit command:', fetchError);
            return message.reply('An error occurred while trying to find the user.');
        }

        // Validate the setting name to prevent SQL Injection or editing 'id'/'username'
        const allowedSettings = ['messages', 'tool', 'money', 'level', 'exp']; // Buraya düzenlenmesini istediğin diğer sütun isimlerini ekleyebilirsin
        if (!allowedSettings.includes(settingToEdit)) {
            return message.reply(`You cannot edit '${settingToEdit}'. Allowed settings are: ${allowedSettings.join(', ')}`);
        }

        try {
            // Kullanıcının varlığını db.getUser fonksiyonu ile kontrol edin
            const userData = await db.getUser(targetUserId);

            if (!userData) { // Eğer userData null veya undefined ise, kullanıcı veritabanında yoktur
                return message.channel.send(`**${targetIdentifier}** user not found in the database. Cannot edit.`);
            }

            // Database update query (db.updateUserSetting fonksiyonunu kullan)
            const changes = await db.updateUserSetting(targetUserId, settingToEdit, newValue);

            if (changes === 0) {
                 return message.channel.send(`**${targetIdentifier}**'s **${settingToEdit}** was already **${newValue}**, no changes made.`);
            }

            message.channel.send(`Successfully updated **${targetIdentifier}**'s **${settingToEdit}** to **${newValue}**.`);

        } catch (error) {
            console.error('Edit command error:', error);
            message.reply(`An error occurred: ${error.message}`);
        }
    },
};
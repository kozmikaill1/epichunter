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
        if (targetIdentifier.match(/^\d+$/)) {
            targetUserId = targetIdentifier;
        } else {
            const member = message.guild.members.cache.find(m => m.user.username.toLowerCase() === targetIdentifier.toLowerCase() || m.displayName.toLowerCase() === targetIdentifier.toLowerCase());
            if (!member) {
                return message.reply(`Could not find a user named '${targetIdentifier}'.`);
            }
            targetUserId = member.id;
        }

        // Validate the setting name to prevent SQL Injection or editing 'id'/'username'
        const allowedSettings = ['messages', 'tool', 'money', 'level', 'exp']; // Buraya düzenlenmesini istediğin diğer sütun isimlerini ekleyebilirsin
        if (!allowedSettings.includes(settingToEdit)) {
            return message.reply(`You cannot edit '${settingToEdit}'. Allowed settings are: ${allowedSettings.join(', ')}`);
        }

        try {
            // Check if the user exists first
            const userExists = await new Promise((resolve, reject) => {
                db.db.get(`SELECT id FROM users WHERE id = ?`, [targetUserId], (err, row) => {
                    if (err) return reject(err);
                    resolve(!!row); // Returns true if row exists, false otherwise
                });
            });

            if (!userExists) {
                return message.channel.send(`**${targetIdentifier}** user not found in the database. Cannot edit.`);
            }

            // Database update query
            await new Promise((resolve, reject) => {
                db.db.run(`UPDATE users SET ${settingToEdit} = ? WHERE id = ?`, [newValue, targetUserId], function(err) {
                    if (err) {
                        console.error('Database update error in edit command:', err);
                        return reject(err);
                    }
                    if (this.changes === 0) {
                        // This might happen if user exists but somehow update failed (e.g., no actual change)
                        // Or if the initial select check was somehow race-conditioned (less likely)
                        resolve('no_change');
                    } else {
                        resolve('success');
                    }
                });
            });

            message.channel.send(`Successfully updated **${targetIdentifier}**'s **${settingToEdit}** to **${newValue}**.`);

        } catch (error) {
            console.error('Edit command error:', error);
            message.reply(`An error occurred: ${error.message}`);
        }
    },
};
// commands/eval.js
const { Collection, Message, EmbedBuilder } = require('discord.js'); // EmbedBuilder'ı da import ettik

module.exports = {
    name: 'eval',
    description: 'Executes arbitrary JavaScript code. (Developer Only)',
    aliases: ['e'],
    async execute(message, args, db, client) {
        // Authorized user IDs
        const authorizedUsers = [
            '688755035282079750', 
            '817487630689632276' 
        ];

        // Check if the message author is authorized
        if (!authorizedUsers.includes(message.author.id)) {
            return message.reply('You are not authorized to use this command.');
        }

        const code = args.join(' ');
        if (!code) {
            return message.reply('Please provide code to execute.');
        }

        try {
            let evaled = eval(code); // Execute the code

            // Await if the result is a Promise
            if (evaled instanceof Promise) {
                evaled = await evaled;
            }

            let output;
            // If the result is a Discord Message object, check its content type
            if (evaled instanceof Message) {
                if (evaled.content) {
                    output = `Message sent successfully to ${evaled.channel.name} with content: "${evaled.content}"`;
                } else if (evaled.embeds.length > 0) { // Embed'li mesajı da yakalamak için
                    output = `Embed message sent successfully to ${evaled.channel.name} with title: "${evaled.embeds[0].title || 'No Title'}"`;
                }
                else if (evaled.attachments.size > 0) { // Ekli mesajı da yakalamak için
                    output = `Message with attachment(s) sent successfully to ${evaled.channel.name}`;
                }
                else { // Diğer durumlarda (boş mesaj vs.)
                    output = `Empty message sent successfully to ${evaled.channel.name}`;
                }
            } else {
                // Convert the result to a string format (e.g., for objects using JSON.stringify)
                output = typeof evaled === 'string' ? evaled : require('util').inspect(evaled, { depth: 0 });
            }

            // Censor sensitive information (e.g., bot token)
            output = output.replace(new RegExp(client.token, 'g'), '[TOKEN]');

            // Truncate very long output
            if (output.length > 1900) { 
                output = output.substring(0, 1890) + '... (Output truncated)';
            }
            
            // Send the output directly as a message
            message.channel.send(`\`\`\`js\n${output}\n\`\`\``);

        } catch (error) {
            // Send the error message directly
            message.channel.send(`\`\`\`js\nError: ${error.message}\n\`\`\``);
        }
    },
};
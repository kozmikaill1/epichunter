module.exports = {
    name: 'ping',
    description: 'Show message latency and API ping',
    async execute(message, args, db, client) {
      const sent = await message.channel.send('Pinging...');
      const latency = sent.createdTimestamp - message.createdTimestamp;
      const apiPing = client.ws.ping;
      sent.edit(`Pong! Message latency: ${latency}ms. API ping: ${apiPing}ms.`);
    },
  };
  
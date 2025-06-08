const rewards = require('../data/rewards');

module.exports = {
  name: 'hunt',
  description: 'Go hunting and get rewards based on your equipped tool!',
  async execute(message, args, db, client) { // db ve client sırası index.js ile aynı olmalı
    const userTool = await db.getUserTool(message.author.id) || 'Fists';

    const possibleRewards = rewards.filter(r => r.tool === userTool);

    if (possibleRewards.length === 0) {
      return message.channel.send(`${message.author}, You have no valid hunting tool equipped!`);
    }

    const reward = possibleRewards[Math.floor(Math.random() * possibleRewards.length)];

    await db.addExp(message.author.id, reward.exp);
    await db.addMoney(message.author.id, reward.money);
    await db.addItem(message.author.id, reward.drop);

    message.channel.send(`${message.author}, You hunted a **${reward.mob}** using **${reward.tool}** and got **${reward.drop}**! You gained ${reward.exp} XP and earned ${reward.money} coins.`);
  },
};

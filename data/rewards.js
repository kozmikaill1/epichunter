// data/rewards.js
// Lütfen bu kodu kopyalayıp dosyanı GÜNCELLE
module.exports = {
    // Mevcut rewards array'i burada kalacak, tools objesi içine taşınmadı
    hunts: [ //rewards array'inin adını "hunts" olarak değiştirdim, daha anlaşılır olur
        {
            tool: 'Fists',
            tool_emoji: '<:fists:1358407774979231857>', // Yumruk için emoji
            mob: 'Sheep',
            mob_emoji: '<:sheepmc:1358404231576686612>',
            drop: 'Raw Mutton',
            drop_emoji: '<:raw_mutton:1358404304997843014>',
            expRange: [5, 10],
            dropQuantityRange: [1, 3]
        },
        {
            tool: 'Wooden Sword',
            tool_emoji: '<:wooden_sword:1357809232237433105>',
            mob: 'Zombie',
            mob_emoji: '<:emoji_17:1358423928263020544>',
            drop: 'Rotten Flesh',
            drop_emoji: '<:rotten_flesh:1357811747888828519>',
            expRange: [10, 20],
            dropQuantityRange: [1, 4]
        },
        {
            tool: 'Stone Sword',
            tool_emoji: '<:stone_sword:1357809613780680724>',
            mob: 'Skeleton',
            mob_emoji: '<:emoji_17:1358423945597947955>',
            drop: 'Bone',
            drop_emoji: '<:bonee:1357815353811537990>',
            expRange: [15, 28],
            dropQuantityRange: [1, 5]
        },
        {
            tool: 'Iron Sword',
            tool_emoji: '<:iron_sword:1357809672639484095>',
            mob: 'Creeper',
            mob_emoji: '<:emoji_19:1358423970575024280>',
            drop: 'Gunpowder',
            drop_emoji: '<:gunpowder:1357815246483488880>',
            expRange: [20, 35],
            dropQuantityRange: [1, 6]
        },
        {
            tool: 'Gold Sword',
            tool_emoji: '<:gold_sword:1357809717061095645>',
            mob: 'Spider',
            mob_emoji: '<:emoji_20:1358423997401927842>',
            drop: 'String',
            drop_emoji: '<:stringg:1357815080753823874>',
            expRange: [25, 42],
            dropQuantityRange: [1, 7]
        },
        {
            tool: 'Diamond Sword',
            tool_emoji: '<:diamond_sword:1357809760912802023>',
            mob: 'Enderman',
            mob_emoji: '<:emoji_21:1358424019879198750>',
            drop: 'Ender Pearl',
            drop_emoji: '<:ender_pearl:1357815301697437697>',
            expRange: [30, 50],
            dropQuantityRange: [1, 8]
        }
    ],
    // Yeni eklenen tools objesi
    tools: {
        "Fists": {
            price: 0,
            power: 1, // Ekstra bir özellik ekleyebiliriz (örneğin, avlanma şansı veya hasar için)
            description: "Your bare hands. Not very effective.",
            emoji: '<:fists:1358407774979231857>' // Emoji eklendi
        },
        "Wooden Sword": {
            price: 50, // Fiyat ekledik
            power: 2,
            description: "A simple wooden sword.",
            emoji: '<:wooden_sword:1357809232237433105>' // Emoji eklendi
        },
        "Stone Sword": {
            price: 150,
            power: 3,
            description: "A sturdy stone sword.",
            emoji: '<:stone_sword:1357809613780680724>' // Emoji eklendi
        },
        "Iron Sword": {
            price: 400,
            power: 4,
            description: "A strong iron sword.",
            emoji: '<:iron_sword:1357809672639484095>' // Emoji eklendi
        },
        "Gold Sword": {
            price: 800,
            power: 3, // Altın kılıç genellikle daha zayıf ama daha hızlı olabilir, burada sadece örnek
            description: "A shiny, but not very durable, gold sword.",
            emoji: '<:gold_sword:1357809717061095645>' // Emoji eklendi
        },
        "Diamond Sword": {
            price: 2000,
            power: 5,
            description: "The most powerful sword.",
            emoji: '<:diamond_sword:1357809760912802023>' // Emoji eklendi
        }
    }
};
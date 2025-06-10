// database.js - Lütfen bu kodu kopyalayıp dosyanı GÜNCELLE
const sqlite3 = require('sqlite3').verbose();
const db = new sqlite3.Database('./epichunter.db'); // Veritabanı dosyasının adı

// Veritabanı tablolarını oluşturma veya varlıklarını kontrol etme
function init() {
    db.serialize(() => {
        // users tablosu
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id TEXT PRIMARY KEY,
            username TEXT,
            messages INTEGER DEFAULT 0,
            tool TEXT DEFAULT 'Fists',
            money INTEGER DEFAULT 0,
            level INTEGER DEFAULT 1,
            exp INTEGER DEFAULT 0
            -- lastDaily INTEGER DEFAULT 0 // Eğer lastDaily alanınız varsa ekleyin
        )`);

        // items tablosu (kullanıcı envanteri)
        db.run(`CREATE TABLE IF NOT EXISTS items (
            userId TEXT,
            itemName TEXT,
            quantity INTEGER DEFAULT 0,
            PRIMARY KEY (userId, itemName)
        )`);

        console.log('Database tables ensured.');
    });
}

// Kullanıcının veritabanında olduğundan emin ol
function ensureUser(userId, username) {
    return new Promise((resolve, reject) => {
        db.run(`INSERT OR IGNORE INTO users (id, username) VALUES (?, ?)`, [userId, username], function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

// Kullanıcının tool'unu getir
function getUserTool(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT tool FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row ? row.tool : 'Fists'); // Varsayılan olarak Fists döndür
        });
    });
}

// Kullanıcının tool'unu ayarla
function setUserTool(userId, toolName) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET tool = ? WHERE id = ?`, [toolName, userId], function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

// Mesaj sayısını artır
function addMessages(userId, amount) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET messages = messages + ? WHERE id = ?`, [amount, userId], function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

// Para ekle/çıkar
function addMoney(userId, amount) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET money = money + ? WHERE id = ?`, [amount, userId], function(err) {
            if (err) return reject(err);
            resolve();
        });
    });
}

// Kullanıcının parasını getir
function getUserMoney(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT money FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row ? row.money : 0);
        });
    });
}

// Envantere item ekle
function addItem(userId, itemName, quantity = 1) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT quantity FROM items WHERE userId = ? AND itemName = ?`, [userId, itemName], (err, row) => {
            if (err) return reject(err);

            if (!row) {
                db.run(
                    `INSERT INTO items (userId, itemName, quantity) VALUES (?, ?, ?)`,
                    [userId, itemName, quantity],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            } else {
                db.run(
                    `UPDATE items SET quantity = quantity + ? WHERE userId = ? AND itemName = ?`,
                    [quantity, userId, itemName],
                    function(err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            }
        });
    });
}

// Envanterden item çıkar
function removeItem(userId, itemName, quantity = 1) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT quantity FROM items WHERE userId = ? AND itemName = ?`, [userId, itemName], (err, row) => {
            if (err) return reject(err);

            if (!row || row.quantity < quantity) {
                return reject(new Error('Not enough items in inventory.'));
            }

            db.run(`UPDATE items SET quantity = quantity - ? WHERE userId = ? AND itemName = ?`, [quantity, userId, itemName], function(err) {
                if (err) return reject(err);
                if (this.changes === 0) return reject(new Error('Item not removed, possibly not found or quantity already 0.'));
                resolve();
            });
        });
    });
}

// Bir itemin envanterdeki miktarını getir
function getItemQuantity(userId, itemName) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT quantity FROM items WHERE userId = ? AND itemName = ?`, [userId, itemName], (err, row) => {
            if (err) return reject(err);
            resolve(row ? row.quantity : 0);
        });
    });
}

// Tüm kullanıcının envanterini getir
function getUserInventory(userId) {
    return new Promise((resolve, reject) => {
        db.all(`SELECT itemName, quantity FROM items WHERE userId = ? AND quantity > 0`, [userId], (err, rows) => {
            if (err) return reject(err);
            resolve(rows);
        });
    });
}

// Kullanıcının tüm verisini getir (show komutu için)
function getUser(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row);
        });
    });
}

// Kullanıcının belirli bir ayarını günceller (edit komutu için)
function updateUserSetting(userId, settingName, newValue) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET ${settingName} = ? WHERE id = ?`, [newValue, userId], function(err) {
            if (err) return reject(err);
            resolve(this.changes);
        });
    });
}

// Kullanıcının tüm verilerini sıfırlar
function resetUserData(userId) {
    return new Promise((resolve, reject) => {
        db.serialize(() => {
            db.run(
                `UPDATE users SET money = 0, exp = 0, level = 1, messages = 0, tool = 'Fists' WHERE id = ?`,
                [userId],
                function(err) {
                    if (err) {
                        console.error('Error resetting user stats:', err.message);
                        return reject(err);
                    }
                    console.log(`User ${userId} stats reset.`);
                }
            );

            db.run(`DELETE FROM items WHERE userId = ?`, [userId], function(err) {
                if (err) {
                    console.error('Error resetting user inventory:', err.message);
                    return reject(err);
                }
                console.log(`User ${userId} inventory reset.`);
                resolve();
            });
        });
    });
}

// Her level için gereken XP'yi hesaplayan yardımcı fonksiyon
function getExpForNextLevel(level) {
    // Örnek formül: level 1'den 2'ye 100 XP, sonra her level için +50 XP
    // Level 2 için: 100 XP
    // Level 3 için: 100 + 50 = 150 XP
    // Level 4 için: 150 + 50 + 50 = 200 XP
    return 50 * level + 50;
}


// XP ekle ve level atlama kontrolü yap
async function addExpAndCheckLevelUp(userId, username, amount) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT exp, level FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) {
                console.error('Error fetching user exp/level:', err);
                return reject(err);
            }

            let currentExp = row ? row.exp : 0;
            let currentLevel = row ? row.level : 1;
            let newExp = currentExp + amount;
            let levelUp = false;
            let earnedAdalium = 0;

            // Bu döngüde, her level atlandığında ulaşılan yeni level kadar Adalium ekleyeceğiz
            // Önceki level'ın XP'sini düşerek doğru XP ilerlemesini sağlıyoruz.
            while (newExp >= getExpForNextLevel(currentLevel)) {
                currentLevel++; // Yeni level'a geçtik
                levelUp = true;
                earnedAdalium += currentLevel; // <<< DEĞİŞİKLİK BURADA: Ulaşılan level kadar Adalium verir
                newExp -= getExpForNextLevel(currentLevel - 1); // Önceki level için gereken XP'yi düş
            }

            db.run(`UPDATE users SET exp = ?, level = ? WHERE id = ?`, [newExp, currentLevel, userId], async function(err) {
                if (err) {
                    console.error('Error updating user exp/level:', err);
                    return reject(err);
                }

                if (levelUp && earnedAdalium > 0) {
                    try {
                        await addItem(userId, 'Adalium', earnedAdalium);
                        resolve({ levelUp: levelUp, newLevel: currentLevel, remainingExp: newExp, earnedAdalium: earnedAdalium });
                    } catch (itemErr) {
                        console.error('Error adding Adalium item during level up:', itemErr);
                        resolve({ levelUp: levelUp, newLevel: currentLevel, remainingExp: newExp, earnedAdalium: 0, itemError: true });
                    }
                } else {
                    resolve({ levelUp: levelUp, newLevel: currentLevel, remainingExp: newExp, earnedAdalium: earnedAdalium });
                }
            });
        });
    });
}


// dbb/database.js - Bu kısmı kontrol et
module.exports = {
    init,
    ensureUser,
    addMessages,
    addMoney,
    getUserMoney,
    addItem,
    removeItem,
    getItemQuantity,
    getUserInventory,
    getUserTool,
    setUserTool,
    getUser,
    updateUserSetting,
    resetUserData,
    addExpAndCheckLevelUp,
    getExpForNextLevel, // <<< BU SATIRIN OLDUĞUNDAN KESİNLİKLE EMİN OLUN!
};
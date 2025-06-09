// database.js
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

// XP ekle
function addExp(userId, amount) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET exp = exp + ? WHERE id = ?`, [amount, userId], function(err) {
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

// Yeni eklenen fonksiyon: Kullanıcının belirli bir ayarını günceller (edit komutu için)
function updateUserSetting(userId, settingName, newValue) {
    return new Promise((resolve, reject) => {
        // settingName'in güvenli olduğundan emin ol (SQL Injection'ı önlemek için)
        // Normalde burada bir whitelist kontrolü yapılırdı
        db.run(`UPDATE users SET ${settingName} = ? WHERE id = ?`, [newValue, userId], function(err) {
            if (err) return reject(err);
            resolve(this.changes); // Kaç satırın etkilendiğini döner (1 veya 0)
        });
    });
}


module.exports = {
    init,
    ensureUser,
    addMessages,
    addExp,
    addMoney,
    getUserMoney,
    addItem,
    removeItem,
    getItemQuantity,
    getUserInventory,
    getUserTool,
    setUserTool,
    getUser, // show komutu için
    updateUserSetting // edit komutu için yeni fonksiyon
};
const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./dbb/database.db', (err) => {
    if (err) return console.error('Database connection error:', err.message);
    console.log('Connected to the database.');
});

// Create the 'users' table if it doesn't exist, including exp and money columns.
db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    username TEXT,
    messages INTEGER DEFAULT 0,
    tool TEXT DEFAULT 'Fists',
    money INTEGER DEFAULT 0,
    level INTEGER DEFAULT 1,
    exp INTEGER DEFAULT 0
)`);

// Create the 'items' table for user inventories.
db.run(`CREATE TABLE IF NOT EXISTS items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT,
    itemName TEXT,
    quantity INTEGER DEFAULT 1,
    UNIQUE(userId, itemName)
)`);

// ... (Diğer fonksiyonlar: incrementMessageCount, getMessageCount, getUserTool vb. aynı kalacak) ...
// Buraya kadar olan kısımları, önceki mesajımdan kopyalayıp buraya yapıştırabilirsin.

// Function to increment message count or register a new user.
function incrementMessageCount(userId, username) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) return reject(err);

            if (!row) {
                // User not found, insert new user
                db.run(
                    `INSERT INTO users(id, username, messages) VALUES (?, ?, 1)`,
                    [userId, username],
                    function (err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            } else {
                // User found, update message count
                db.run(
                    `UPDATE users SET messages = messages + 1 WHERE id = ?`,
                    [userId],
                    function (err) {
                        if (err) reject(err);
                        else resolve();
                    }
                );
            }
        });
    });
}

function getMessageCount(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT messages FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row ? row.messages : 0);
        });
    });
}

function getUserTool(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT tool FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row ? row.tool : 'Fists');
        });
    });
}

function setUserTool(userId, tool) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET tool = ? WHERE id = ?`, [tool, userId], function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

function getUserMoney(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT money FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row ? row.money : 0);
        });
    });
}

function setUserMoney(userId, amount) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET money = ? WHERE id = ?`, [amount, userId], function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

function addMoney(userId, amount) {
    return new Promise(async (resolve, reject) => {
        try {
            const currentMoney = await getUserMoney(userId);
            const newMoney = currentMoney + (amount || 0);
            db.run(`UPDATE users SET money = ? WHERE id = ?`, [newMoney, userId], function(err) {
                if (err) reject(err);
                else resolve(newMoney);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function getUserLevel(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT level FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row ? row.level : 1);
        });
    });
}

function setUserLevel(userId, level) {
    return new Promise((resolve, reject) => {
        db.run(`UPDATE users SET level = ? WHERE id = ?`, [level, userId], function(err) {
            if (err) reject(err);
            else resolve();
        });
    });
}

function getUserExp(userId) {
    return new Promise((resolve, reject) => {
        db.get(`SELECT exp FROM users WHERE id = ?`, [userId], (err, row) => {
            if (err) return reject(err);
            resolve(row ? row.exp : 0);
        });
    });
}

function addExp(userId, amount) {
    return new Promise(async (resolve, reject) => {
        try {
            const currentExp = await getUserExp(userId);
            const newExp = currentExp + (amount || 0);
            db.run(`UPDATE users SET exp = ? WHERE id = ?`, [newExp, userId], function(err) {
                if (err) reject(err);
                else resolve(newExp);
            });
        } catch (error) {
            reject(error);
        }
    });
}

function addItem(userId, itemName, quantity = 1) { // quantity parametresi eklendi, varsayılan 1
  return new Promise((resolve, reject) => {
      db.get(`SELECT quantity FROM items WHERE userId = ? AND itemName = ?`, [userId, itemName], (err, row) => {
          if (err) return reject(err);

          if (!row) {
              // Item not found, insert new item with specified quantity
              db.run(
                  `INSERT INTO items (userId, itemName, quantity) VALUES (?, ?, ?)`, // quantity de eklendi
                  [userId, itemName, quantity],
                  function(err) {
                      if (err) reject(err);
                      else resolve();
                  }
              );
          } else {
              // Item found, update quantity
              db.run(
                  `UPDATE items SET quantity = quantity + ? WHERE userId = ? AND itemName = ?`, // quantity kadar artır
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
module.exports = {
    // Önceki dışa aktardığın tüm fonksiyonlar
    incrementMessageCount,
    getMessageCount,
    getUserTool,
    setUserTool,
    getUserMoney,
    setUserMoney,
    addMoney,
    getUserLevel,
    setUserLevel,
    getUserExp,
    addExp,
    addItem,
    // Ve şimdi, db nesnesinin kendisini de dışa aktarıyoruz!
    db // <-- BU SATIR EKLENMELİ
};
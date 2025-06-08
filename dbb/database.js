const sqlite3 = require('sqlite3').verbose();

const db = new sqlite3.Database('./database.db', (err) => {
  if (err) return console.error('Veritabanı hatası:', err.message);
  console.log('Veritabanına başarıyla bağlanıldı.');
});

db.run(`CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  username TEXT,
  messages INTEGER
)`);

function incrementMessageCount(userId, username) {
  db.get(`SELECT * FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) return console.error(err.message);

    if (!row) {
      db.run(`INSERT INTO users(id, username, messages) VALUES (?, ?, ?)`, [
        userId,
        username,
        1
      ]);
    } else {
      db.run(`UPDATE users SET messages = ? WHERE id = ?`, [
        row.messages + 1,
        userId
      ]);
    }
  });
}

function getMessageCount(userId, callback) {
  db.get(`SELECT messages FROM users WHERE id = ?`, [userId], (err, row) => {
    if (err) return callback(err, null);
    callback(null, row);
  });
}

module.exports = {
  incrementMessageCount,
  getMessageCount
};

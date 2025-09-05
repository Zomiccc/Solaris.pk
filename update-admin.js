const sqlite3 = require('sqlite3').verbose();
const bcrypt = require('bcryptjs');

const db = new sqlite3.Database('./store.db');

// Delete old admin
db.run('DELETE FROM admin WHERE username = "admin"', (err) => {
  if (err) console.log('Error deleting old admin:', err);
  else console.log('Old admin deleted');
});

// Add new admin
const hash = bcrypt.hashSync('sol.pk', 10);
db.run('INSERT INTO admin (username, password) VALUES (?, ?)', ['zahra00', hash], (err) => {
  if (err) console.log('Error adding new admin:', err);
  else console.log('New admin added: zahra00 / sol.pk');
});

db.close();

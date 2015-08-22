var _sqlite3 = require('sqlite3');
var tmp = _sqlite3.verbose();
var sqlite = new tmp.Database('./sqlite3/main.db');

sqlite.run('CREATE TABLE IF NOT EXISTS git_url (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)');

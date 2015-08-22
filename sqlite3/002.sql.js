var _sqlite3 = require('sqlite3');
var tmp = _sqlite3.verbose();
var sqlite = new tmp.Database('./sqlite3/main.db');

sqlite.run('ALTER TABLE git_url ADD COLUMN package TEXT');

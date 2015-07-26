import co from 'co';
import moment from 'moment';
import _sqlite3 from 'sqlite3';

let tmp = _sqlite3.verbose();
let sqlite = new tmp.Database('./sqlite3/main.db');

export default class DB {
  static insertGitURL(gitURL) {
    return co(function*(){
      let sql;
      let data;
      let date = moment.utc().format('YYYY-MM-DD HH:mm:ss');
      let _ = yield this.selectGitURL(gitURL);

      if (_) {
        sql = 'UPDATE git_url SET updated_at = ? WHERE url = ?';
        data = [date, gitURL];
      } else {
        sql = 'INSERT INTO git_url (url, created_at, updated_at) VALUES (?, ?, ?)';
        data = [gitURL, date, date];
      }

      yield new Promise((resolve, reject)=>{
        sqlite.run(sql, ...data, (error, row)=>{
          error ? reject(error) : resolve(row);
        });
      });
    }.bind(this));
  }

  static selectGitURL(gitURL) {
    return new Promise((resolve, reject)=>{
      sqlite.get('SELECT * from git_url where url = ?', gitURL, (error, row)=>{
        error ? reject(error) : resolve(row);
      });
    });
  }

  static selectAllGitURL(order = 'order by url desc') {
    return new Promise((resolve, reject)=>{
      sqlite.all(`SELECT * from git_url ${order}`, (error, rows)=>{
        error ? reject(error) : resolve(rows);
      });
    });
  }
}

sqlite.run('CREATE TABLE IF NOT EXISTS git_url (id INTEGER PRIMARY KEY AUTOINCREMENT, url TEXT UNIQUE NOT NULL, created_at TEXT NOT NULL, updated_at TEXT NOT NULL)');

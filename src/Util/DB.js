import co from 'co';
import moment from 'moment';
import _sqlite3 from 'sqlite3';

let tmp = _sqlite3.verbose();
let sqlite = new tmp.Database('./sqlite3/main.db');

export default class DB {
  static insertGitURL(gitURL, packageJSON = '') {
    return co(function*(){
      let sql;
      let data;
      let date = moment.utc().format('YYYY-MM-DD HH:mm:ss');
      let _ = yield this.selectGitURL(gitURL);

      if (_) {
        sql = 'UPDATE git_url SET package = ?, updated_at = ?WHERE url = ?';
        data = [packageJSON, date, gitURL];
      } else {
        sql = 'INSERT INTO git_url (url, package, created_at, updated_at) VALUES (?, ?, ?, ?)';
        data = [gitURL, packageJSON, date, date];
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

  static deleteGitURL(gitURL) {
    return new Promise((resolve, reject)=>{
      sqlite.run('DELETE from git_url where url = ?', gitURL, (error, row)=>{
        error ? reject(error) : resolve(row);
      });
    });
  }
}

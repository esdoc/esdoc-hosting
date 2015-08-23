import co from 'co';
import moment from 'moment';
import _sqlite3 from 'sqlite3';

class DB {
  constructor() {
    let tmp = _sqlite3.verbose();
    this._sqlite = new tmp.Database('./sqlite3/main.db');
  }

  set path(path) {
    let tmp = _sqlite3.verbose();
    this._sqlite = new tmp.Database(path);
  }

  run(sql) {
    return new Promise((resolve, reject)=>{
      this._sqlite.run(sql, (error, row)=>{
        error ? reject(error) : resolve(row);
      });
    });
  }

  insertGitURL(gitURL, packageJSON = '') {
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
        this._sqlite.run(sql, ...data, (error, row)=>{
          error ? reject(error) : resolve(row);
        });
      });
    }.bind(this));
  }

  selectGitURL(gitURL) {
    return new Promise((resolve, reject)=>{
      this._sqlite.get('SELECT * from git_url where url = ?', gitURL, (error, row)=>{
        error ? reject(error) : resolve(row);
      });
    });
  }

  selectAllGitURL(order = 'order by url desc') {
    return new Promise((resolve, reject)=>{
      this._sqlite.all(`SELECT * from git_url ${order}`, (error, rows)=>{
        error ? reject(error) : resolve(rows);
      });
    });
  }

  deleteGitURL(gitURL) {
    return new Promise((resolve, reject)=>{
      this._sqlite.run('DELETE from git_url where url = ?', gitURL, (error, row)=>{
        error ? reject(error) : resolve(row);
      });
    });
  }
}

export default new DB();

import fs from 'fs-extra';
import path from 'path';

export default class File {
  static isExist(filePath) {
    try {
      fs.statSync(filePath);
      return true;
    } catch(e) {
      return false;
    }
  }

  static walk(dirPath, callback) {
    let entries = fs.readdirSync(dirPath);

    for (let entry of entries) {
      let entryPath = path.resolve(dirPath, entry);
      let stat = fs.statSync(entryPath);

      if (stat.isFile()) {
        const result = callback(entryPath);
        if (result === false) return;
      } else if (stat.isDirectory()) {
        this.walk(entryPath, callback);
      }
    }
  }
}

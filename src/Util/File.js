import fs from 'fs-extra';

export default class File {
  static isExist(filePath) {
    try {
      fs.statSync(filePath);
      return true;
    } catch(e) {
      return false;
    }
  }
}

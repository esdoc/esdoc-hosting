import fs from 'fs';
import moment from 'moment';

class Logger {
  write(text) {
    if (!text) return;

    console.log(text);
    const date = moment.utc().format('YYYY-MM-DD');
    const path = `./log/api-${date}.log`;
    fs.appendFileSync(path, text + '\n');
  }

  toText(obj, prefix = '') {
    if (!obj) return '';

    let text;

    if (obj instanceof Error) {
      text = obj.toString() + obj.stack;
    } else {
      try {
        text = JSON.stringify(obj);
      } catch(e) {
        text = obj.toString();
      }
    }

    let date = moment.utc().format('YYYY-MM-DD HH:mm:ss');

    return `[${date}] ${prefix} ${text}`;
  }

  d(obj) {
    let log = this.toText(obj, 'debug:');
    this.write(log);
  }

  e(obj) {
    let log = this.toText(obj, 'error:');
    this.write(log);
  }
}

export default new Logger();

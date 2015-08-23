import path from 'path';
import child_process from 'child_process';

export default class Process {
  static exec(cmd) {
    return new Promise(function(resolve, reject){
      cmd = cmd.replace(/\//g, path.sep);
      child_process.exec(cmd, {stdio: 'inherit'}, function(error){
        error ? reject(error) : resolve();
      });
    });
  }
}

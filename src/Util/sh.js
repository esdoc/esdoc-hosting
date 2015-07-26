import fs from 'fs-extra';
import path from 'path';
import child_process from 'child_process';

export function rm(path) {
  return new Promise(function(resolve, reject){
    fs.remove(path, function(error){
      error ? reject(error) : resolve();
    });
  });
}

export function mkdir(path) {
  return new Promise(function(resolve, reject){
    fs.mkdirs(path, function(error){
      error ? reject(reject) : resolve();
    });
  });
}

export function exec(cmd) {
  return new Promise(function(resolve, reject){
    cmd = cmd.replace(/\//g, path.sep);
    child_process.exec(cmd, {stdio: 'inherit'}, function(error){
      error ? reject(error) : resolve();
    });
  });
}

export function cp(src, dst) {
  return new Promise(function(resolve, reject){
    fs.copy(src, dst, function(error){
      error ? reject(error) : resolve();
    });
  });
}

export function cd(dst) {
  return new Promise(function(resolve, reject){
    process.chdir(dst);
    resolve();
  });
}

#!/usr/bin/env node
const sh = require('./sh');

sh.exec('node ./script/build.js');
const mochaOption = '-t 10000 --recursive ./out/test/src -R spec';
sh.exec(`./node_modules/.bin/mocha ${mochaOption}`);

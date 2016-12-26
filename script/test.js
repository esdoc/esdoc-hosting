#!/usr/bin/env node
const sh = require('./sh');
const mochaOption=" -t 100000 --require ./node_modules/babel-register --recursive ./test/src -R spec";
sh.exec('./node_modules/.bin/mocha' + mochaOption);

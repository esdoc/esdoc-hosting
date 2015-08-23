#!/usr/bin/env node
var sh = require('./sh');

sh.rm('./out/src');
sh.mkdir('./out/src');
sh.exec('./node_modules/.bin/babel --blacklist regenerator --out-dir out/src src');
//sh.chmod('./out/src/GeneratorCLI.js', '755');

sh.rm('./out/test');
sh.mkdir('./out/test');
sh.exec('./node_modules/.bin/babel --blacklist regenerator --out-dir out/test/src test/src');

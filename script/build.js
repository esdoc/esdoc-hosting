#!/usr/bin/env node
const sh = require('./sh');

sh.rm('./out/src');
sh.mkdir('./out/src');
sh.exec('./node_modules/.bin/babel --out-dir out/src src');
//sh.chmod('./out/src/GeneratorCLI.js', '755');

sh.rm('./out/test');
sh.mkdir('./out/test');
sh.exec('./node_modules/.bin/babel --out-dir out/test/src test/src');

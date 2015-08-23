#!/usr/bin/env node
var sh = require('./sh');

// judge node or io because run test with node and io on TRAVIS.
// send coverage report with only node.
var isNodeJS = process.version.indexOf('v0.12.') === 0;
var mochaOption=" -t 20000 --recursive ./out/test/src -R spec";

sh.exec('node ./script/build.js');

if (process.env.TRAVIS && isNodeJS) {
  sh.exec('node --harmony ./node_modules/.bin/istanbul cover ./node_modules/mocha/bin/_mocha --report lcovonly -- ' + mochaOption + ' && cat ./coverage/lcov.info | ./node_modules/coveralls/bin/coveralls.js');
} else {
  sh.exec('node --harmony ./node_modules/.bin/istanbul cover --include-all-sources --root ./out/src/ -x "Page/Template/*" -x "App.js" -i "**/*.js" ./node_modules/mocha/bin/_mocha  -- ' + mochaOption);
}

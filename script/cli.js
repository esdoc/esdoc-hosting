#!/usr/bin/env node
require('babel/register');
var GenerateCLI = require('../src/GeneratorCLI');
var cli = new GenerateCLI(process.argv);
cli.exec();

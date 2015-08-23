#!/usr/bin/env node
require('babel/register');
var GenerateCLI = require('GeneratorCLI');
var cli = new GenerateCLI(process.argv);
cli.exec();

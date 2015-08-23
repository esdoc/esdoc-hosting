import path from 'path';
import minimist from 'minimist';
import fs from 'fs-extra';
import Generator from './../src/Generator.js';

export default class GenerateCLI {
  constructor(argv) {
    this._argv = minimist(argv.slice(2));

    if (this._argv.h || this._argv.help) {
      this._showHelp();
      process.exit(0);
    }

    if (!this._argv.s || !this._argv.d) {
      this._showHelp();
      process.exit(0);
    }

    this._sourceGitURL = this._argv.s;
    this._destinationDirPath = path.resolve(this._argv.d);
  }

  exec() {
    let generator = new Generator(this._sourceGitURL, this._destinationDirPath);
    generator.exec();
  }

  _showHelp() {
    console.log('usage: generate-esdoc [-s git-url] [-d dest-dir]');
  }
}

// if this file is directory executed, work as CLI.
let executedFilePath = fs.realpathSync(process.argv[1]);
if (executedFilePath === __filename) {
  let cli = new GenerateCLI(process.argv);
  cli.exec();
}

import es6shim from 'core-js/shim';
import Process from './Util/Process.js';
import fs from 'fs-extra';
import path from 'path';
import co from 'co';
import Logger from './Util/Logger.js';
import File from './Util/File.js';

export default class Generator {
  constructor(sourceGitURL, destinationDirPath) {
    this._sourceGitURL = sourceGitURL;
    this._destinationDirPath = path.resolve(destinationDirPath);
    this._packageJSON = '';

    let gitDomain = sourceGitURL.match(/@(.*?):/)[1];
    let gitPath = sourceGitURL.match(/:(.*).git$/)[1];
    this._repoDirPath = `${gitDomain}/${gitPath}-repo`;
    this._esdocDirPath = `${gitDomain}/${gitPath}`;
    this._gitHTTPS = `https://github.com/${gitPath}.git`;
  }

  get outDirPath() {
    return this._esdocDirPath;
  }

  get outDirFullPath() {
    return `${this._destinationDirPath}/${this._esdocDirPath}`;
  }

  get packageJSON() {
    return this._packageJSON;
  }

  exec() {
    let url = this._sourceGitURL;
    let repoDirPath = `${this._destinationDirPath}/${this._repoDirPath}`;
    let esdocDirPath = `${this._destinationDirPath}/${this._esdocDirPath}`;
    let self = this;

    return co(function*() {
      let cmd;

      // clean up
      fs.removeSync(esdocDirPath);
      fs.removeSync(repoDirPath);

      // git clone
      cmd = `git clone --depth 1 ${self._gitHTTPS} ${repoDirPath}`;
      Logger.d(`${url}: ${cmd}`);
      try {
        yield Process.exec(cmd);
      } catch(e) {
        Logger.e(e);
        throw new Error('Fail git clone. Please check git url.');
      }

      // esdoc.json
      let esdocConfigPath;
      try {
        esdocConfigPath = self._writeSafeESDocConfig(repoDirPath, esdocDirPath);
      } catch(e) {
        Logger.e(e);
        throw new Error('Fail esdoc.json. Please check esdoc.json');
      }

      // esdoc
      cmd = `esdoc -c ${esdocConfigPath}`;
      Logger.d(`${url}: ${cmd}`);
      try {
        yield Process.exec(cmd);
      } catch(e) {
        throw new Error('Fail esdoc. Please check esdoc.json.');
      }

      // package.json
      try {
        fs.copySync(`${repoDirPath}/package.json`, `${esdocDirPath}/package.json`);
        self._packageJSON = fs.readFileSync(`${esdocDirPath}/package.json`).toString();
      } catch(e) {
        // ignore
      }

      // readme
      try {
        fs.copySync(`${repoDirPath}/README.md`, `${esdocDirPath}/README.md`);
      } catch(e) {
        // ignore
      }

      // clean up
      fs.removeSync(repoDirPath);

      Logger.d(`${url}: finish`);
    });
  }

  _writeSafeESDocConfig(repoDirPath, esdocDirPath) {
    this._guessConfig(repoDirPath, esdocDirPath);

    const esdocConfigPath = `${repoDirPath}/esdoc.json`;
    const config = JSON.parse(fs.readFileSync(esdocConfigPath));

    config.source = path.resolve(repoDirPath, config.source);
    config.destination = esdocDirPath;

    if (config.index) {
      config.index = path.resolve(repoDirPath, config.index);
    } else {
      config.index = path.resolve(repoDirPath, './README.md');
    }

    if (config.package) {
      config.package = path.resolve(repoDirPath, config.package);
    } else {
      config.package = path.resolve(repoDirPath, './package.json');
    }

    config.coverage = true;
    config.scripts = [];
    config.styles = [];
    config.plugins = this._selectSafePlugin(config.plugins);

    if (config.test) config.test.source = path.resolve(repoDirPath, config.test.source);

    if (!this._checkSafeESDocConfig(config, repoDirPath)) throw new Error('esdoc.json is unsafe. Please check esdoc.json');

    this._injectStyleAndScript(config);

    fs.writeFileSync(esdocConfigPath, JSON.stringify(config, null, 2));

    return esdocConfigPath;
  }

  _selectSafePlugin(plugins = []) {
    const safePluginNames = ['esdoc-es7-plugin', 'esdoc-importpath-plugin'];
    const results = [];

    for (let item of plugins) {
      if (safePluginNames.includes(item.name)) results.push(item);
    }

    // esdoc logo plugin
    results.push({name: './src/Plugin/LogoPlugin.js'});

    return results;
  }

  _checkSafeESDocConfig(config, repoDirPath) {
    let regexp = new RegExp(`^${repoDirPath}/`);

    if (!config.source.match(regexp)) return false;
    if (!config.index.match(regexp)) return false;
    if (!config.package.match(regexp)) return false;
    if (config.test && !config.test.source.match(regexp)) return false;

    return true;
  }

  _injectStyleAndScript(config) {
    config.scripts = ['./www/-/js/ga.js'];
    config.styles = ['./src/Page/Template/style.css'];
  }

  _guessConfig(repoDirPath, esdocDirPath) {
    // found esdoc config.
    const esdocConfigPath = `${repoDirPath}/esdoc.json`;
    if (File.isExist(esdocConfigPath)) return;

    // not found package.json, so this is not JS repository
    const packageJSONPath = `${repoDirPath}/package.json`;
    if (!File.isExist(packageJSONPath)) return;

    // guess source directory
    const srcPath = `${repoDirPath}/src`;
    if (!File.isExist(srcPath)) return;

    // guess ES6
    let isES6 = false;
    const ext = ['.js', '.es', '.es6', '.es7'];
    File.walk(srcPath, (entryPath)=>{
      if (!ext.includes(path.extname(entryPath))) return;

      const code = fs.readFileSync(entryPath).toString();
      if (code.match(/^import /m)) {
        isES6 = true;
        return false;
      }
    });
    if (!isES6) return;

    // make config
    const config = {
      source: srcPath,
      destination: esdocDirPath,
      plugins: [
        {name: 'esdoc-es7-plugin'}
      ]
    };

    // write config
    fs.writeFileSync(esdocConfigPath, JSON.stringify(config));
  }
}

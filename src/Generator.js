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

    this._checkCore(config, repoDirPath, esdocDirPath);
    this._checkPlugin(config);
    this._checkManualPlugin(config, repoDirPath);
    this._checkTestPlugin(config, repoDirPath);
    this._checkBrandPlugin(config, repoDirPath);
    this._checkScriptPlugin(config, repoDirPath);
    this._checkStylePlugin(config, repoDirPath);

    this._injectStyleAndScript(config);

    fs.writeFileSync(esdocConfigPath, JSON.stringify(config, null, 2));

    return esdocConfigPath;
  }

  _checkCore(config, repoDirPath, esdocDirPath) {
    config.source = path.resolve(repoDirPath, config.source);
    config.destination = esdocDirPath;

    if (config.index) {
      config.index = this._checkPath(repoDirPath, config.index);
    } else {
      config.index = this._checkPath(repoDirPath, './README.md');
    }

    if (config.package) {
      config.package = this._checkPath(repoDirPath, config.package);
    } else {
      config.package = this._checkPath(repoDirPath, './package.json');
    }
  }

  _checkPlugin(config) {
    const safePluginNames = [
      'esdoc-accessor-plugin',
      'esdoc-brand-plugin',
      'esdoc-coverage-plugin',
      'esdoc-ecmascript-proposal-plugin',
      'esdoc-exclude-source-plugin',
      'esdoc-external-ecmascript-plugin',
      'esdoc-external-nodejs-plugin',
      'esdoc-external-webapi-plugin',
      'esdoc-flow-type-plugin',
      'esdoc-importpath-plugin',
      'esdoc-inject-script-plugin',
      'esdoc-inject-style-plugin',
      'esdoc-integrate-manual-plugin',
      'esdoc-integrate-test-plugin',
      'esdoc-jsx-plugin',
      'esdoc-lint-plugin',
      'esdoc-publish-html-plugin',
      'esdoc-publish-markdown-plugin',
      'esdoc-react-plugin',
      'esdoc-standard-plugin',
      'esdoc-type-inference-plugin',
      'esdoc-typescript-plugin',
      'esdoc-undocumented-identifier-plugin',
      'esdoc-unexported-identifier-plugin'
    ];

    config.plugins = config.plugins.filter(plugin => safePluginNames.includes(plugin.name));
  }

  _checkManualPlugin(config, repoDirPath) {
    const check = (manual)=> {
      if (manual.asset) manual.asset = this._checkPath(repoDirPath, manual.asset);
      if (manual.index) manual.index = this._checkPath(repoDirPath, manual.index);
      for (let i = 0; i < manual.files.length; i++) {
        manual.files[i] = this._checkPath(repoDirPath, manual.files[i]);
      }
    };

    for (const plugin of config.plugins) {
      if (plugin.name === 'esdoc-standard-plugin') check(plugin.option.manual);
      if (plugin.name === 'esdoc-integrate-manual-plugin') check(plugin.option);
    }
  }

  _checkTestPlugin(config, repoDirPath) {
    const check = (test) => {
      test.source = this._checkPath(repoDirPath, test.source);
    };

    for (const plugin of config.plugins) {
      if (plugin.name === 'esdoc-standard-plugin') check(plugin.option.test);
      if (plugin.name === 'esdoc-integrate-test-plugin') check(plugin.option);
    }
  }

  _checkBrandPlugin(config, repoDirPath) {
    const check = (option) => {
      option.logo = this._checkPath(repoDirPath, option.logo);
    };

    for (const plugin of config.plugins) {
      if (plugin.name === 'esdoc-standard-plugin') check(plugin.option.brand);
      if (plugin.name === 'esdoc-brand-plugin') check(plugin.option);
    }
  }

  _checkScriptPlugin(config, repoDirPath) {
    const check = (option) => {
      option.scripts = [];
    };

    for (const plugin of config.plugins) {
      if (plugin.name === 'esdoc-inject-script-plugin') check(plugin.option);
    }
  }

  _checkStylePlugin(config, repoDirPath) {
    const check = (option) =>{
      option.styles = option.styles.map(style => this._checkPath(repoDirPath, style));
    };

    for (const plugin of config.plugins) {
      if (plugin.name === 'esdoc-inject-style-plugin') check(plugin.option);
    }
  }

  _checkPath(repoDirPath, filePath) {
    const safeFilePath = path.resolve(repoDirPath, filePath);
    const regexp = new RegExp(`^${repoDirPath}/`);
    if (!safeFilePath.match(regexp)) throw new Error(`file path is not safe: ${filePath}`);
    return safeFilePath;
  }

  _injectStyleAndScript(config) {
    const plugin = config.plugins.find(plugin => plugin.name === 'esdoc-inject-script-plugin');
    if (plugin) {
      plugin.option.scripts = ['./www/-/js/ga.js'];
    } else {
      config.plugins.push({
        name: 'esdoc-inject-script-plugin',
        option: {scripts: ['./www/-/js/ga.js']}
      });
    }
  }

  _guessConfig(repoDirPath, esdocDirPath) {
    // found esdoc config.
    const esdocConfigPath = `${repoDirPath}/esdoc.json`;
    if (File.isExist(esdocConfigPath)) return;

    // copy .esdoc.json to esdoc.json, if found .esdoc.json
    const dotESDocConfigPath = `${repoDirPath}/.esdoc.json`;
    if (File.isExist(dotESDocConfigPath)) {
      fs.copySync(dotESDocConfigPath, esdocConfigPath);
      return;
    }

    // write esdoc.json from `esdoc` in package.json if found `esdoc` in package.json
    const packageJSONPath = `${repoDirPath}/package.json`;
    if (File.isExist(packageJSONPath)) {
      const packageObj = fs.readJsonSync(packageJSONPath);
      if ('esdoc' in packageObj) {
        // write config
        fs.writeFileSync(esdocConfigPath, JSON.stringify(packageObj.esdoc));
        return;
      }
    } else {
      // not found package.json, so this is not JS repository
      return;
    }

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
      plugins: [{name: 'esdoc-standard-plugin'}]
    };

    // write config
    fs.writeFileSync(esdocConfigPath, JSON.stringify(config));
  }
}

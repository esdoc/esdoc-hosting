import co from 'co';
import fs from 'fs-extra';
import GitURL from './Util/GitURL.js';
import ESDocGenerator from './Generator';
import DB from './Util/DB.js';
import Logger from './Util/Logger.js';
import ElasticSearchUpdater from './ElasticSearch/ElasticSearchUpdater.js';
import ElasticSearcher from './ElasticSearch/ElasticSearcher.js';
import PageUpdater from './Page/PageUpdater.js';
import File from './Util/File.js';

let processing = [];
let MaxProcess = 10;

class API {
  constructor() {
    this._destinationDirPath = './www/';
  }

  set destinationDirPath(dest) {
    this._destinationDirPath = dest;
  }

  create(req, res) {
    let gitUrl = req.body.gitUrl;

    // check git url.
    if (!GitURL.validate(gitUrl)) {
      Logger.e(`git url is invalid. ${gitUrl}`);
      res.json({success: false, message: 'git url is invalid'});
      return;
    }

    // check processing count.
    if (processing.length >= MaxProcess) {
      Logger.e(`processing is max. ${gitUrl}`);
      res.json({success: false, message: 'System is busy. Please try after a little.'});
      return;
    }

    // check duplication
    if (processing.includes(gitUrl)) {
      Logger.e(`already processing. ${gitUrl} in [${processing.join()}]`);
      res.json({success: false, message: 'Now generating. Please wait a little.'});
      return;
    }
    processing.push(gitUrl);

    let generator = new ESDocGenerator(gitUrl, this._destinationDirPath);
    fs.removeSync(generator.outDirFullPath);

    const promise = co(function*(){
      try {
        yield generator.exec();

        const page = new PageUpdater(gitUrl, generator.packageJSON);
        yield page.update();

        const updater = new ElasticSearchUpdater(gitUrl, generator.outDirFullPath);
        yield updater.update();

        finish(generator.outDirFullPath, {success: true});
      } catch(e) {
        Logger.e(e);
        finish(generator.outDirFullPath, {success: false, message: e.message});
      }

      const index = processing.indexOf(gitUrl);
      processing.splice(index, 1);
    });

    res.json({success: true, path: `/${generator.outDirPath}`});

    return promise;
  }

  delete(req, res) {
    let gitUrl = req.body.gitUrl;

    // check git url.
    if (!GitURL.validate(gitUrl)) {
      Logger.e(`git url is invalid. ${gitUrl}`);
      res.json({success: false, message: 'git url is invalid'});
      return;
    }

    // delete directory
    let dirPath = GitURL.outputDirPath(gitUrl, this._destinationDirPath);
    if (!File.isExist(dirPath)) {
      res.json({success: false, message: `${gitUrl} is not exits`});
      return;
    }
    fs.removeSync(dirPath);

    // delete record in sqlite
    return co(function*(){
      yield DB.deleteGitURL(gitUrl);
      const page = new PageUpdater();
      yield page.update();
      yield ElasticSearchUpdater.delete(gitUrl);
      res.json({success: true});
    });
  }

  search(req, res) {
    return co(function*(){
      const keyword = req.query.keyword;
      if (!keyword) {
        res.json({success: false, message: 'keyword is not found'});
        return;
      }

      const searcher = new ElasticSearcher();
      const result = yield searcher.search(keyword);
      res.json({success: true, result: result});
    });
  }
}

function finish(dirFullPath, obj) {
  fs.outputFileSync(`${dirFullPath}/.finish.json`, JSON.stringify(obj, null, 2));
}

export default new API();

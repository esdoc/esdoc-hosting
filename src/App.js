import co from 'co';
import express from 'express';
import bodyParser from 'body-parser';
import fs from 'fs-extra';
import IceCap from 'ice-cap';
import GitURL from './Util/GitURL.js';
import ESDocGenerator from './Generator';
import DB from './Util/DB.js';
import Logger from './Util/Logger.js';

let app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

let processing = [];
let MaxProcess = 10;

app.post('/api/create', function (req, res) {
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

  let generator = new ESDocGenerator(gitUrl, './www/');
  fs.removeSync(generator.outDirFullPath);
  generator.exec().then(()=>{
    updateIndex(gitUrl);
    finish(generator.outDirFullPath, {success: true});
  }).catch((error)=>{
    Logger.e(error);
    finish(generator.outDirFullPath, {success: false, message: error.message});
  }).then(()=>{
    let index = processing.indexOf(gitUrl);
    processing.splice(index, 1);
  });

  res.json({success: true, path: `/${generator.outDirPath}`});
});

app.post('/api/delete', function(req, res) {
  let gitUrl = req.body.gitUrl;

  // check git url.
  if (!GitURL.validate(gitUrl)) {
    Logger.e(`git url is invalid. ${gitUrl}`);
    res.json({success: false, message: 'git url is invalid'});
    return;
  }

  // delete directory
  let dirPath = GitURL.outputDirPath(gitUrl, './www/');
  if (!isExits(dirPath)) {
    res.json({success: false, message: `${gitUrl} is not exits`});
    return;
  }
  fs.removeSync(dirPath);

  // delete record in sqlite
  DB.deleteGitURL(gitUrl).then(()=>{
    updateIndex();
  });

  res.json({success: true});
});

let server = app.listen(3000, function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('listening at http://%s:%s', host, port);
});

function finish(dirFullPath, obj) {
  fs.outputFileSync(`${dirFullPath}/.finish.json`, JSON.stringify(obj, null, 2));
}

function updateIndex(gitURL = '') {
  co(function*(){
    if (gitURL) yield DB.insertGitURL(gitURL);

    // /-/index.html
    {
      let rows = yield DB.selectAllGitURL();
      let template = fs.readFileSync('./src/template/index.html').toString();
      let ice = new IceCap(template);
      ice.loop('url', rows, (i, row, ice)=>{
        var matched = row.url.match(/^git@github.com:(.*)\.git$/);
        if (!matched) return;
        var path = 'github.com/' + matched[1];
        ice.attr('path', 'href', `../${path}`);
        ice.text('path', path);
        ice.attr('url', 'title', `created ${row.created_at} UTC / updated ${row.updated_at} UTC`);
        ice.attr('badge', 'src', `../${path}/badge.svg`);
        ice.attr('badgeLink', 'href', `../${path}/badge.svg`);
        ice.attr('repo', 'href', `https://${path}`);
        ice.attr('updateLink', 'href', `/-/generate.html#url=${row.url}`);
      });
      fs.writeFileSync('./www/-/index.html', ice.html);
    }

    // /index.html
    {
      let rows = yield DB.selectAllGitURL('order by created_at desc');
      rows = rows.slice(0, 20);
      let template = fs.readFileSync('./src/template/root.html').toString();
      let ice = new IceCap(template);
      ice.loop('url', rows, (i, row, ice)=>{
        var matched = row.url.match(/^git@github.com:(.*)\.git$/);
        if (!matched) return;
        var path = 'github.com/' + matched[1];
        ice.attr('path', 'href', `./${path}`);
        ice.text('path', path);
        ice.attr('url', 'title', `created ${row.created_at} UTC / updated ${row.updated_at} UTC`);
        ice.attr('badge', 'src', `./${path}/badge.svg`);
        ice.attr('badgeLink', 'href', `./${path}/badge.svg`);
        ice.attr('repo', 'href', `https://${path}`);
      });
      fs.writeFileSync('./www/index.html', ice.html);
    }

  }).catch((error)=>{
    Logger.e(error);
  });
}

function isExits(path) {
  try {
    fs.statSync(path);
    return true;
  } catch(e) {
    return false;
  }
}

if (!isExits('./www/index.html')) {
  updateIndex();
}

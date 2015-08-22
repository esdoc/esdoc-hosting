import path from 'path';
import fs from 'fs-extra';
import Logger from '../Util/Logger.js';
import client from './ElasticSearchClient.js';
import co from 'co';
import moment from 'moment';
import marked from 'marked';
import sanitize from 'sanitize-html';

export default class ElasticSearchUpdater {
  constructor(gitURL, documentDirPath) {
    this._gitURL = gitURL;
    this._documentDirPath = documentDirPath;
    this._rootUrl = path.relative('./', documentDirPath).replace(/^www/, '');
  }

  update() {
    return co(function*(){
      yield this._deleteCurrentIndex();
      yield this._updateMeta();
      yield this._updateTag();
    }.bind(this)).catch((e)=>{
      Logger.e(e);
    });
  }

  _updateMeta() {
    let packageObj;
    try {
      const packagePath = path.resolve(this._documentDirPath, 'package.json');
      const packageJSON = fs.readFileSync(packagePath);
      packageObj = JSON.parse(packageJSON);
    } catch (e) {
      Logger.e(e);
      // ignore
    }

    let readme;
    try {
      const readmePath = path.resolve(this._documentDirPath, 'README.md');
      const readmeMD = fs.readFileSync(readmePath).toString();
      const html = marked(readmeMD);
      readme = sanitize(html, {allowedTags: [], allowedAttributes: []});
    } catch (e) {
      Logger.e(e);
      // ignore
    }

    const body = {
      git_url: this._gitURL,
      url: this._rootUrl,
      created_at: moment.utc().format('YYYY-MM-DD HH:mm:ss')
    };

    if (packageObj) {
      body.name = packageObj.name;
      body.description = packageObj.description;
      if (packageObj.author) {
        if (packageObj.author.name) {
          body.author = packageObj.author.name;
        } else {
          body.author = packageObj.author.replace(/ *<.*$/, '');
        }
      }
    }

    if (readme) {
      body.readme = readme;
    }

    return client.index({
      index: 'esdoc',
      type: 'package',
      body: body
    });
  }

  _updateTag() {
    const dumpPath = path.resolve(this._documentDirPath, 'dump.json');
    let tags;
    try {
      const json = fs.readFileSync(dumpPath);
      tags = JSON.parse(json);
    } catch(e) {
      Logger.e(e);
      return;
    }

    const body = this._convertTagsToBody(tags);

    return client.bulk({
      index: 'esdoc',
      type: 'tag',
      body: body
    });
  }

  _convertTagsToBody(tags) {
    const records = this._convertTagsToRecords(tags);
    const body = [];

    for (let record of records) {
      body.push({index: {}});
      body.push(record);
    }

    return body;
  }

  _convertTagsToRecords(tags) {
    const date = moment.utc().format('YYYY-MM-DD HH:mm:ss');
    const records = [];

    for (let tag of tags) {
      const filePath = this._buildFilePath(tag);
      if (!filePath) continue;

      const record = {};
      record.git_url = this._gitURL;
      record.created_at = date;
      record.filePath = filePath;
      record.url = `${this._rootUrl}/${filePath}`;
      record.kind = tag.kind;
      if (!['testIt', 'testDescribe'].includes(tag.kind)) record.name = tag.name;
      record.description = tag.description || '';
      if (tag.todo) record.todo = tag.todo.join(' ');
      if (tag.extends) record.extends = tag.extends.join(' ');
      if (tag.implements) record.implements = tag.implements.join(' ');
      if (tag.type) record.type = tag.type.types.join(' ');
      if (tag.return) record.return = [...tag.return.types, tag.return.description];

      // params
      record.params = [];
      for (let v of tag.params || []) {
        if (v.types) record.params.push(...v.types);
        if (v.name) record.params.push(v.name);
        if (v.description) record.params.push(v.description);
      }
      record.params = record.params.join(' ');

      // properties
      record.properties = [];
      for (let v of tag.properties || []) {
        if (v.types) record.properties.push(...v.types);
        if (v.name) record.properties.push(v.name);
        if (v.description) record.properties.push(v.description);
      }
      record.properties = record.properties.join(' ');

      // throws
      record.throws = [];
      for (let v of tag.throws || []) {
        if (v.types) record.throws.push(...v.types);
        if (v.description) record.throws.push(v.description);
      }
      record.throws = record.throws.join(' ');

      // emits
      record.emits = [];
      for (let v of tag.emits || []) {
        if (v.types) record.emits.push(...v.types);
        if (v.description) record.emits.push(v.description);
      }
      record.emits = record.emits.join(' ');

      // listens
      record.listens = [];
      for (let v of tag.listens || []) {
        if (v.types) record.listens.push(...v.types);
        if (v.description) record.listens.push(v.description);
      }
      record.listens = record.listens.join(' ');

      // testTargets
      record.testTargets = [];
      if (tag.testTargets) record.test_targets = tag.testTargets.join(' ');

      records.push(record);
    }

    return records;
  }

  _buildFilePath(tag) {
    switch (tag.kind) {
      case 'class':
        return `class/${tag.longname}.html`;
      case 'constructor':
      case 'method':
      case 'member':
      case 'get':
      case 'set':
        return `class/${tag.memberof}.html`;
      case 'function':
        return 'function/';
      case 'variable':
        return 'variable/';
      case 'typedef':
        return 'typedef/';
      case 'testDescribe':
      case 'testIt':
        return 'test.html';
      default:
        return null;
    }
  }

  _deleteCurrentIndex() {
    return co(function*(){
      yield client.deleteByQuery({
        index: 'esdoc',
        type: 'tag',
        body: {
          "query": {
            "simple_query_string": {
              "query": this._gitURL,
              "fields": ["git_url"],
              "default_operator": "and"
            }
          }
        }
      });

      yield client.deleteByQuery({
        index: 'esdoc',
        type: 'package',
        body: {
          "query": {
            "simple_query_string": {
              "query": this._gitURL,
              "fields": ["git_url"],
              "default_operator": "and"
            }
          }
        }
      });
    }.bind(this));
  }
}

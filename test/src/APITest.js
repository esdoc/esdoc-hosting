import co from 'co';
import fs from 'fs-extra';
import assert from 'assert';
import API from '../../src/API.js';
import DB from '../../src/Util/DB.js';
import Generator from '../../src/Generator.js';
import {Response, Request} from './Mock.js';

API.destinationDirPath = './test/fixture/www';

fs.removeSync('./test/fixture/main.db');
DB.path = './test/fixture/main.db';

describe('API:', ()=>{
  it('can create DB', ()=>{
    return co(function*(){
      const paths = ['./sqlite3/001.sql', './sqlite3/002.sql'];
      for (let path of paths) {
        const sql = fs.readFileSync(path).toString();
        yield DB.run(sql);
      }
    });
  });

  it('can generate documentation', ()=>{
    const gitURL = {git: 'git@github.com:esdoc/esdoc-hosting-test.git', path: '/github.com/esdoc/esdoc-hosting-test'};

    return co(function*(){
      const req = new Request({
        body: {
          gitUrl: gitURL.git
        }
      });
      const res = new Response();
      yield API.create(req, res);
      assert(res.success);
      assert.equal(res.path, gitURL.path);

      // wait for elasticsearch
      yield new Promise((resolve)=>{
        setTimeout(resolve, 1000);
      })
    });
  });

  it('can search documentation', ()=>{
    const req = new Request({
      query: {
        keyword: 'decorator'
      }
    });

    const res = new Response();

    return co(function*(){
      yield API.search(req, res);
      assert(res.success);
      assert(res.result.hits.length);
    });
  });

  it('can delete documentation', ()=>{
    const req = new Request({
      body: {
        gitUrl: 'git@github.com:esdoc/esdoc-hosting-test.git'
      }
    });

    const res = new Response();
    return co(function*(){
      yield API.delete(req, res);
      assert(res.success);
    });
  });
});

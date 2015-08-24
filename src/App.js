import express from 'express';
import bodyParser from 'body-parser';
import PageUpdater from './Page/PageUpdater.js';
import File from './Util/File.js';
import API from './API.js';
import Logger from './Util/Logger.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/create', (req, res)=>{
  API.create(req, res).catch((e)=>{
    Logger.e(e);
  });
});

app.post('/api/delete', (req, res)=>{
  API.delete(req, res).catch((e)=>{
    Logger.e(e);
  });
});

app.get('/api/search', (req, res)=>{
  API.search(req, res).catch((e)=>{
    Logger.e(e);
  });
});

const server = app.listen(3000, 'localhost', function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('listening at http://%s:%s', host, port);
});

if (!File.isExist('./www/index.html')) {
  const page = new PageUpdater();
  page.update();
}

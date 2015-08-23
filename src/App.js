import express from 'express';
import bodyParser from 'body-parser';
import PageUpdater from './Page/PageUpdater.js';
import File from './Util/File.js';
import API from './API.js';

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

app.post('/api/create', API.create.bind(API));
app.post('/api/delete', API.delete.bind(API));
app.get('/api/search', API.search.bind(API));

const server = app.listen(3000, 'localhost', function () {
  let host = server.address().address;
  let port = server.address().port;

  console.log('listening at http://%s:%s', host, port);
});

if (!File.isExist('./www/index.html')) {
  const page = new PageUpdater();
  page.update();
}

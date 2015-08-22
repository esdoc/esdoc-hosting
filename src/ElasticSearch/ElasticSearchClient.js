import elasticsearch from 'elasticsearch';

export default new elasticsearch.Client({
  host: 'localhost:9200',
  log: 'trace'
});

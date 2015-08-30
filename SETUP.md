```sh
# install
apt-get install nginx sqlite3 git curl
wget https://nodejs.org/dist/v0.12.7/node-v0.12.7-linux-x64.tar.gz
git clone https://github.com/esdoc/esdoc-hosting.git

# setup nginx
mv /etc/nginx/nginx.conf /etc/nginx/nginx.conf.default
cp esdoc-hosting/nginx/esdoc-hosting.conf /etc/nginx/nginx.conf
mkdir /usr/local/var/log/nginx
cd /var/; ln -s esdoc-hosting/www ./www

# setup node
npm install -g esdoc forever
npm install -g esdoc-es7-plugin esdoc-importpath-plugin # safe plugin
npm install
npm run build

# start
nginx
npm run forever
```

# java
```sh
apt-get install software-properties-common
add-apt-repository ppa:webupd8team/java
apt-get update
apt-get install oracle-java8-installer
```

# Elasticsearch
```sh
wget https://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-1.7.1.zip
unzip elasticsearch-1.7.1.zip
export ES_HEAP_SIZE=1g
ce elasticsearch
./bin/plugin -install mobz/elasticsearch-head
./bin/elasticsearch -d

curl -XPOST localhost:9200/esdoc -d @elasticsearch/mapping.json

# curl -XDELETE localhost:9200/esdoc
```

# SQLite
```sh
sqlite sqlite3/main.db
001.sql
002.sql
```

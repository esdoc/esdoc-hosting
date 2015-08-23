```sh
# install
apt-get install nginx sqlite3 git curl
wget https://nodejs.org/dist/v0.12.7/node-v0.12.7-linux-x64.tar.gz
git clone git@github.com:h13i32maru/esdoc-hosting.git

# setup nginx
set nginx.conf
set /usr/local/var/log/nginx
set /var/www

# setup node
npm install -g esdoc-es7-plugin esdoc-importpath-plugin # safe plugin
npm install -g esdoc forever
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
unzip elasticsearch-1.7.1.zip
ce elasticsearch
./bin/plugin -install mobz/elasticsearch-head
./bin/elasticsearch -d

curl -XPOST localhost:9200/esdoc -d @elasticsearch/mapping.json

# curl -XDELETE localhost:9200/esdoc
```

#!/bin/bash

# git, sqlite3
apt-get install git sqlite3

# esdoc plugin
npm install -g esdoc esdoc-es7-plugin esdoc-importpath-plugin

# elasticsearch
cd elasticsearch
wget https://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-1.7.1.zip
unzip elasticsearch-1.7.1.zip
./elasticsearch-1.7.1/bin/elasticsearch &
sleep 10
curl -XPOST localhost:9200/esdoc -d @mapping.json
cd ../


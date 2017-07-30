#!/bin/bash

# git, sqlite3
apt-get install git sqlite3

# esdoc plugin
npm install -g esdoc \
esdoc-accessor-plugin \
esdoc-brand-plugin \
esdoc-coverage-plugin \
esdoc-ecmascript-proposal-plugin \
esdoc-exclude-source-plugin \
esdoc-external-ecmascript-plugin \
esdoc-external-nodejs-plugin \
esdoc-external-webapi-plugin \
esdoc-flow-type-plugin \
esdoc-importpath-plugin \
esdoc-inject-script-plugin \
esdoc-inject-style-plugin \
esdoc-integrate-manual-plugin \
esdoc-integrate-test-plugin \
esdoc-jsx-plugin \
esdoc-lint-plugin \
esdoc-publish-html-plugin \
esdoc-publish-markdown-plugin \
esdoc-react-plugin \
esdoc-standard-plugin \
esdoc-type-inference-plugin \
esdoc-typescript-plugin \
esdoc-undocumented-identifier-plugin \
esdoc-unexported-identifier-plugin

# elasticsearch
cd elasticsearch
wget https://download.elastic.co/elasticsearch/elasticsearch/elasticsearch-1.7.1.zip
unzip elasticsearch-1.7.1.zip
./elasticsearch-1.7.1/bin/elasticsearch &
sleep 10
curl -XPOST localhost:9200/esdoc -d @mapping.json
cd ../


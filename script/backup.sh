#!/bin/bash

filename=main.db-$(date "+%d")
mkdir -p /home/esdoc/backup
cp /home/esdoc/work/esdoc-hosting/sqlite3/main.db /home/esdoc/backup/$filename

require
- node
- nginx
- sqlite3

```sh
cd /var
sudo ln -s esdoc-hosting/www ./

cd /user/local/etc/nginx
ln -s esdoc-hosting/nginx/esdoc-hosting.conf nginx.conf

sudo nginx

cd esdoc-hosting
node --harmony src/App.js
```

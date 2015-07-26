```sh
# install
apt-get install nginx sqlite3 git
wget https://nodejs.org/dist/v0.12.7/node-v0.12.7-linux-x64.tar.gz
git clone git@github.com:h13i32maru/esdoc-hosting.git

# setup nginx
set nginx.conf
set /usr/local/var/log/nginx
set /var/www

# setup node
npm install -g esdoc forever
npm install
npm run build

# start
nginx
forever start -c "node --harmony" out/src/App.js
```

import co from 'co';
import IceCap from 'ice-cap';
import fs from 'fs-extra';
import DB from '../Util/DB.js';

export default class Page {
  constructor(gitURL = '', packageJSON = '') {
    this._gitURL = gitURL;
    this._packageJSON = packageJSON;
  }

  update() {
    return co(this._updateAsync.bind(this));
  }

  *_updateAsync() {
    const gitURL = this._gitURL;
    const packageJSON = this._packageJSON;

    if (gitURL) yield DB.insertGitURL(gitURL, packageJSON);

    // /-/index.html
    {
      let rows = yield DB.selectAllGitURL();
      let template = fs.readFileSync('./src/Page/Template/index.html').toString();
      let ice = new IceCap(template);
      ice.loop('url', rows, (i, row, ice)=>{
        var matched = row.url.match(/^git@github.com:(.*)\.git$/);
        if (!matched) return;
        var path = 'github.com/' + matched[1];
        ice.attr('path', 'href', `../${path}`);
        ice.text('path', path);
        ice.attr('url', 'title', `created ${row.created_at} UTC / updated ${row.updated_at} UTC`);
        ice.attr('badge', 'src', `../${path}/badge.svg`);
        ice.attr('badgeLink', 'href', `../${path}/badge.svg`);
        ice.attr('repo', 'href', `https://${path}`);
        ice.attr('updateLink', 'href', `/-/generate.html#url=${row.url}`);
      });
      fs.writeFileSync('./www/-/index.html', ice.html);
    }

    // /index.html
    {
      let rows = yield DB.selectAllGitURL('order by created_at desc');
      rows = rows.slice(0, 20);
      let template = fs.readFileSync('./src/Page/Template/root.html').toString();
      let ice = new IceCap(template);
      ice.loop('url', rows, (i, row, ice)=>{
        var matched = row.url.match(/^git@github.com:(.*)\.git$/);
        if (!matched) return;
        var path = 'github.com/' + matched[1];
        ice.attr('path', 'href', `./${path}`);
        ice.text('path', path);
        ice.attr('url', 'title', `created ${row.created_at} UTC / updated ${row.updated_at} UTC`);
        ice.attr('badge', 'src', `./${path}/badge.svg`);
        ice.attr('badgeLink', 'href', `./${path}/badge.svg`);
        ice.attr('repo', 'href', `https://${path}`);
      });
      fs.writeFileSync('./www/index.html', ice.html);
    }
  }
}

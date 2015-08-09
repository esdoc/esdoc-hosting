import path from 'path';

export default class GitURL {
  static validate(gitURL) {
    return !!gitURL.match(/^git@github\.com:[\w\d._-]+\/[\w\d._-]+\.git$/);
  }

  static outputDirPath(gitURL, destinationDirPath) {
    const rootPath = path.resolve(destinationDirPath);
    const gitDomain = gitURL.match(/@(.*?):/)[1];
    const gitPath = gitURL.match(/:(.*).git$/)[1];
    return `${rootPath}/${gitDomain}/${gitPath}`;
  }
}

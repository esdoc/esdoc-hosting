export default class GitURL {
  static validate(gitURL) {
    return !!gitURL.match(/^git@github\.com:[\w\d._-]+\/[\w\d._-]+\.git$/);
  }
}

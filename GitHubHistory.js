/**
 * GitHubHistory.js
 * Read-only history of commits successfully pushed to GitHub main.
 */

const NILAVARAM_GITHUB_REPOSITORY = 'Books4vm/Nilavaram';

function getCodeChangeHistory() {
  requireCurrentUser_();
  const cache = CacheService.getScriptCache();
  const cacheKey = 'github-main-history-v2';
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  const githubToken = PropertiesService.getScriptProperties()
    .getProperty('GITHUB_TOKEN');
  const headers = {
    Accept: 'application/vnd.github+json',
    'X-GitHub-Api-Version': '2022-11-28',
    'User-Agent': 'Nilavaram-Apps-Script'
  };
  if (githubToken) {
    headers.Authorization = 'Bearer ' + githubToken;
  }

  let page = 1;
  let commits = [];
  while (page <= 10) {
    const url =
      'https://api.github.com/repos/' +
      NILAVARAM_GITHUB_REPOSITORY +
      '/commits?sha=main&per_page=50&page=' + page;
    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: headers,
      muteHttpExceptions: true
    });
    const status = response.getResponseCode();
    if (status < 200 || status >= 300) {
      if (status === 403 && !githubToken) {
        throw new Error(
          'GitHub history is temporarily unavailable because the unauthenticated ' +
          'GitHub API limit was reached. An Admin can add GITHUB_TOKEN to ' +
          'Apps Script Project Settings, then try again.'
        );
      }
      if (status === 401 || (status === 403 && githubToken)) {
        throw new Error(
          'GitHub history is unavailable because the configured GitHub token ' +
          'was rejected or its API limit was reached. An Admin must replace ' +
          'GITHUB_TOKEN in Apps Script Project Settings.'
        );
      }
      throw new Error(
        'GitHub history could not be loaded. HTTP status: ' + status + '.'
      );
    }

    const pageCommits = JSON.parse(response.getContentText());
    commits = commits.concat(pageCommits);
    if (pageCommits.length < 50) break;
    page += 1;
  }

  const totalCommitCount = commits.length;
  const result = {
    repository: NILAVARAM_GITHUB_REPOSITORY,
    repositoryUrl: 'https://github.com/' + NILAVARAM_GITHUB_REPOSITORY,
    branch: 'main',
    loadedAt: new Date().toISOString(),
    commits: commits.map(function(item, index) {
      return {
        sha: item.sha,
        shortSha: item.sha.substring(0, 7),
        versionNumber: totalCommitCount - index,
        message: item.commit.message,
        committedAt: item.commit.committer.date,
        authorName: item.commit.author.name,
        url: item.html_url
      };
    })
  };
  cache.put(cacheKey, JSON.stringify(result), 300);
  return result;
}

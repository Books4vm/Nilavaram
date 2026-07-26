/**
 * GitHubHistory.js
 * Read-only history of commits successfully pushed to GitHub main.
 */

const NILAVARAM_GITHUB_REPOSITORY = 'Books4vm/Nilavaram';

function getCodeChangeHistory() {
  requireCurrentUser_();
  const cache = CacheService.getScriptCache();
  const cacheKey = 'github-main-history-v1';
  const cached = cache.get(cacheKey);
  if (cached) return JSON.parse(cached);

  let page = 1;
  let commits = [];
  while (page <= 10) {
    const url =
      'https://api.github.com/repos/' +
      NILAVARAM_GITHUB_REPOSITORY +
      '/commits?sha=main&per_page=100&page=' + page;
    const response = UrlFetchApp.fetch(url, {
      method: 'get',
      headers: {
        Accept: 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2026-03-10',
        'User-Agent': 'Nilavaram-Apps-Script'
      },
      muteHttpExceptions: true
    });
    const status = response.getResponseCode();
    if (status < 200 || status >= 300) {
      throw new Error(
        'GitHub history could not be loaded. HTTP status: ' + status
      );
    }

    const pageCommits = JSON.parse(response.getContentText());
    commits = commits.concat(pageCommits);
    if (pageCommits.length < 100) break;
    page += 1;
  }

  const result = {
    repository: NILAVARAM_GITHUB_REPOSITORY,
    repositoryUrl: 'https://github.com/' + NILAVARAM_GITHUB_REPOSITORY,
    branch: 'main',
    loadedAt: new Date().toISOString(),
    commits: commits.map(function(item) {
      return {
        sha: item.sha,
        shortSha: item.sha.substring(0, 7),
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

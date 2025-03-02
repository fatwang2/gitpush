import { GitHubRelease } from '../../../types/github';

type Params = {
  repos: Array<{
    owner: string;
    repo: string;
  }>;
  env?: {
    GITHUB_TOKEN?: string;
  };
};

export async function fetchReleases(params: Params) {
  const results = await Promise.all(
    params.repos.map(async ({ owner, repo }) => {
      const url = `https://api.github.com/repos/${owner}/${repo}/releases`;
      console.log('Sending request to:', url);

      // Build request headers
      const headers: Record<string, string> = {
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'User-Agent': 'GitHubTracker-Cloudflare-Workflow'
      };
      
      // Add GitHub Token to headers if available and not default value
      if (params.env?.GITHUB_TOKEN && params.env.GITHUB_TOKEN !== 'YOUR_GITHUB_TOKEN_HERE') {
        headers['Authorization'] = `Bearer ${params.env.GITHUB_TOKEN}`;
      }

      const response = await fetch(url, { headers });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('GitHub API Error:', {
          status: response.status,
          statusText: response.statusText,
          url: url,
          errorBody: errorText,
          headers: Object.fromEntries(response.headers.entries())
        });
        return {
          owner,
          repo,
          error: `GitHub API request failed: ${response.status} ${response.statusText}`
        };
      }

      const data = await response.json<GitHubRelease[]>();
      
      // Get yesterday's date (UTC)
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const targetDate = yesterday.toISOString().split('T')[0];
      
      // Filter releases published yesterday
      const todayReleases = data.filter(release => {
        const publishDate = release.published_at.split('T')[0];
        return publishDate === targetDate;
      });

      return {
        owner,
        repo,
        total: todayReleases.length,
        releases: todayReleases.map(release => ({
          url: release.url,
          id: release.id,
          tag_name: release.tag_name,
          name: release.name,
          body: release.body,
          published_at: release.published_at,
          author: release.author.login,
        }))
      };
    })
  );

  return {
    results,
    total_repos: results.length,
    repos_with_updates: results.filter(r => !r.error && r.total > 0).length
  };
}
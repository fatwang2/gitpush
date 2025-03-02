import { Params } from '../../../types/env';

function parseGitHubUrl(repo_url: string): { owner: string; repo: string } {
  // 1. Handle full URL format: https://github.com/owner/repo
  if (repo_url.startsWith('http')) {
    const url = new URL(repo_url);
    const parts = url.pathname.split('/').filter(Boolean);
    if (parts.length >= 2) {
      return { owner: parts[0], repo: parts[1] };
    }
  }
  
  // 2. Handle short format: owner/repo
  const parts = repo_url.split('/').filter(Boolean);
  if (parts.length === 2) {
    return { owner: parts[0], repo: parts[1] };
  }
  
  // 3. Use default values if parsing fails
  return {
    owner: 'fatwang2',
    repo: 'gitpush'
  };
}

export async function initializeParams(payload: Params) {
  console.log('Initializing with parameters:', payload);
  
  // Parse all repository URLs
  const repos = payload.repo_urls.map(url => parseGitHubUrl(url));
  
  console.log('Parameters initialized:', repos);
  return { repos };
}
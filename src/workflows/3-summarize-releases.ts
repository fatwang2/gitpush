import { Ai } from '../../../types/env';

type Release = {
  tag_name: string;
  name: string;
  body: string;
  published_at: string;
};

type RepoResult = {
  owner: string;
  repo: string;
  total: number;
  releases: Release[];
  error?: string;
};

type Releases = {
  results: RepoResult[];
  total_repos: number;
  repos_with_updates: number;
};

export async function summarizeReleases(releases: Releases, ai: Ai) {
  // If no repositories have updates
  if (releases.repos_with_updates === 0) {
    return {
      hasSummary: false,
      message: "No new releases today for any repository"
    };
  }

  // Prepare text for summarization
  const releasesText = releases.results
    .filter(repo => !repo.error && repo.total > 0) // Only process repos with updates and no errors
    .map(repo => {
      const repoHeader = `## ${repo.owner}/${repo.repo}`;
      
      const releaseDetails = repo.releases.map(release => `
Version: ${release.tag_name}
Title: ${release.name}
Release Date: ${release.published_at}
Content:
${release.body}
      `).join('\n---\n');

      return `${repoHeader}\n${releaseDetails}`;
    })
    .join('\n\n');

  const prompt = `Please provide a detailed summary of the following GitHub repository updates:
${releasesText}

Please format the output concisely:

**Repo Name**
* v1.0: Key features & breaking changes (⚠️)
* v0.9: Important updates & fixes

Guidelines:
1. Focus on key changes and breaking updates
2. Prioritize by importance
3. Keep each point brief but clear
4. Include critical code examples if any`;

  const response = await ai.run('@cf/deepseek-ai/deepseek-r1-distill-qwen-32b', {
    prompt: prompt
  });

  // Extract response field: use directly if string, extract response field if object
  let summaryText = typeof response === 'string' 
    ? response 
    : (typeof response === 'object' && response !== null && 'response' in response)
    ? response.response
    : JSON.stringify(response);

  // Remove think tags and their content
  summaryText = summaryText.replace(/^[\s\S]*?<\/think>/g, '');
  
  // Clean up text:
  // 1. Remove leading whitespace and empty lines
  // 2. Remove excessive empty lines (more than 2 consecutive)
  // 3. Ensure only one empty line before each [Repository Name] (except the first)
  summaryText = summaryText
    .replace(/^\s+/g, '')  // Remove all leading whitespace
    .replace(/\n{3,}/g, '\n\n')  // Convert 3+ consecutive empty lines to 2
    .replace(/\n+(\s*【)/g, '\n\n$1')  // Ensure one empty line before repository names
    .replace(/^\n+/, '')  // Remove all leading empty lines
    .trim();

  return {
    hasSummary: true,
    originalReleases: releases,
    summary: summaryText
  };
}
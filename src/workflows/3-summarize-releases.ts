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

Please format the output as follows:

**Repository Name**
* Version: New features, improvements, fixes, and other major changes
* Version: New features, improvements, fixes, and other major changes (mark breaking changes with ⚠️)

Guidelines:
1. Based on the original content, explain important changes to help users understand clearly
2. Sort by impact level, with the most important changes first
3. Maintain accuracy and readability, avoid oversimplification
4. If the update includes example code or important usage instructions, please preserve them`;

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
  summaryText = summaryText.replace(/<think>[\s\S]*?<\/think>/g, '');
  
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
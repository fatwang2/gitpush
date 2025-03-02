export interface FormatParams {
  hasSummary: boolean;
  summary?: string;
  originalReleases?: {
    results: Array<{
      owner: string;
      repo: string;
      total: number;
      releases: Array<{
        tag_name: string;
        name: string;
        body: string;
        published_at: string;
      }>;
      error?: string;
    }>;
    total_repos: number;
    repos_with_updates: number;
  };
}

// Implementation of Markdown to HTML conversion
function convertMarkdownToHtml(markdown: string): string {
  // Preprocess: Split text into lines and remove trailing whitespace
  let lines = markdown.split('\n').map(line => line.trimEnd());
  let html = [];
  let inList = false;
  let listLevel = 0;

  for (let i = 0; i < lines.length; i++) {
    let line = lines[i];
    
    // Process headings
    if (line.startsWith('# ')) {
      html.push(`<h1>${line.slice(2)}</h1>`);
      continue;
    }
    if (line.startsWith('## ')) {
      html.push(`<h2>${line.slice(3)}</h2>`);
      continue;
    }
    if (line.startsWith('### ')) {
      html.push(`<h3>${line.slice(4)}</h3>`);
      continue;
    }

    // Process list items
    const listMatch = line.match(/^(\s*)([-*])\s(.+)$/);
    if (listMatch) {
      const [, indent, marker, content] = listMatch;
      const currentLevel = indent.length;

      // Handle list start and end
      if (!inList) {
        html.push('<ul style="margin: 0; padding-left: 20px;">');
        inList = true;
      } else if (currentLevel < listLevel) {
        // End current list level
        html.push('</ul>'.repeat(Math.floor((listLevel - currentLevel) / 2)));
      } else if (currentLevel > listLevel) {
        // Start new nested list
        html.push('<ul style="margin: 0; padding-left: 20px;">');
      }

      listLevel = currentLevel;
      
      // Process list item content (support bold and italic)
      let processedContent = content
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');

      html.push(`<li style="margin-bottom: 4px;">${processedContent}</li>`);
      continue;
    }

    // If not a list item and previously in a list, end all lists
    if (inList && !listMatch) {
      html.push('</ul>'.repeat(Math.floor(listLevel / 2) + 1));
      inList = false;
      listLevel = 0;
    }

    // Process code blocks
    if (line.startsWith('```')) {
      const codeLines = [];
      i++;
      while (i < lines.length && !lines[i].startsWith('```')) {
        codeLines.push(lines[i]);
        i++;
      }
      html.push(`<pre><code>${codeLines.join('\n')}</code></pre>`);
      continue;
    }

    // Process regular text (support bold and italic)
    if (line.trim()) {
      let processedLine = line
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\*(.*?)\*/g, '<em>$1</em>')
        .replace(/`([^`]+)`/g, '<code>$1</code>');
      html.push(`<p style="margin: 0 0 8px 0;">${processedLine}</p>`);
    } else if (!inList) {  // Only add line break when not in a list
      html.push('<br>');
    }
  }

  // Ensure all lists are properly closed
  if (inList) {
    html.push('</ul>'.repeat(Math.floor(listLevel / 2) + 1));
  }

  return html.join('\n');
}

export function formatContent(params: FormatParams) {
  if (!params.hasSummary) {
    const html = `
      <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
        <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">GitHub Repository Update Daily Report</h1>
        <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; text-align: center;">
          <p style="margin: 0; font-size: 16px;">No new releases in any repositories today</p>
        </div>
      </div>
    `;
    return {
      subject: "GitHub Repository Update Daily Report",
      html
    };
  }

  const releases = params.originalReleases?.results || [];
  const totalUpdates = releases.reduce((sum, repo) => sum + repo.releases.length, 0);
  
  const html = `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; color: #333;">
      <!-- Title -->
      <h1 style="text-align: center; color: #2c3e50; margin-bottom: 30px;">GitHub Repository Update Daily Report</h1>

      <!-- Update Overview -->
      <div style="background-color: #f8f9fa; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="margin-top: 0; color: #2c3e50; font-size: 18px;">📊 Update Overview</h2>
        <ul style="list-style: none; padding-left: 0; margin: 0;">
          <li style="margin-bottom: 8px;">📦 Monitored Repositories: ${params.originalReleases?.total_repos || 0}</li>
          <li style="margin-bottom: 8px;">🔄 Repositories with Updates: ${params.originalReleases?.repos_with_updates || 0}</li>
          <li style="margin-bottom: 8px;">📝 Total Version Updates: ${totalUpdates}</li>
        </ul>
      </div>

      <!-- AI Summary -->
      <div style="background-color: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px; margin-bottom: 30px;">
        <h2 style="margin-top: 0; margin-bottom: 12px; color: #2c3e50; font-size: 18px;">🤖 AI Summary</h2>
        <div style="line-height: 1.6;">
          ${params.summary ? convertMarkdownToHtml(params.summary) : ''}
        </div>
      </div>

      <!-- Detailed Update Records -->
      <div style="background-color: #fff; border: 1px solid #e9ecef; padding: 20px; border-radius: 8px;">
        <h2 style="margin-top: 0; color: #2c3e50; font-size: 18px;">📦 Detailed Updates</h2>
        ${releases.map(repo => `
          <div style="margin-bottom: 20px; padding: 15px; background-color: #f8f9fa; border-radius: 4px;">
            <h3 style="color: #2c3e50; margin: 0 0 10px 0;">
              <a href="https://github.com/${repo.owner}/${repo.repo}" style="color: #007bff; text-decoration: none;">
                ${repo.owner}/${repo.repo}
              </a>
            </h3>
            <div style="color: #666; margin-left: 10px;">
              ${repo.releases.map(release => `
                <div style="margin-bottom: 8px;">
                  <span style="color: #666;">📌</span>
                  <a href="https://github.com/${repo.owner}/${repo.repo}/releases/tag/${release.tag_name}" 
                     style="color: #007bff; text-decoration: none; margin-right: 10px;">
                    ${release.tag_name}
                  </a>
                  <span style="color: #666; font-size: 14px;">
                    (${new Date(release.published_at).toLocaleString('zh-CN', { 
                      timeZone: 'Asia/Shanghai',
                      month: 'numeric',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: 'numeric'
                    })})
                  </span>
                </div>
              `).join('')}
            </div>
          </div>
        `).join('')}
      </div>

      <!-- Footer -->
      <div style="margin-top: 30px; padding-top: 20px; border-top: 1px solid #e9ecef; color: #6c757d; font-size: 14px; text-align: center;">
        Update report automatically generated by GitPush
      </div>
    </div>
  `;

  return {
    subject: "GitHub Repository Update Daily Report",
    html
  };
}
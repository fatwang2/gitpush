# GitPush

English | [简体中文](README_CN.md)

An AI-powered GitHub Release Tracker that monitors your favorite repositories, summarizes updates using AI, and delivers them straight to your inbox.

> 🚀 **Quick Start**: Try our [cloud version](https://gitpush.email) - No deployment needed!

![CleanShot 2025-03-07 at 14 53 02@2x](https://github.com/user-attachments/assets/8b8058a3-b886-4398-886b-357a8e73f62d)

## Technology Stack

GitPush is built on four core Cloudflare services:

- **Workers**: Serverless runtime environment for the application
- **Workflows**: Automated pipeline for release monitoring and processing
- **Workers AI**: AI-powered release summary generation with DeepSeek R1
- **Email Routing**: Reliable email notification delivery system

## Configuration

### Environment Variables

> **Security Note**: It is recommended to configure these environment variables through the Cloudflare Workers dashboard instead of storing them in the `wrangler.jsonc` file to prevent sensitive information from being exposed on GitHub.

| Variable Name | Description | Example | Notes |
|---------------|-------------|---------|--------|
| `GITHUB_REPOS` | GitHub repositories to monitor | "https://github.com/owner/repo1,https://github.com/owner/repo2" | Use commas to separate multiple repositories |
| `EMAIL_FROM_ADDRESS` | Notification sender email | "noreply@yourdomain.com" | Must be configured in Cloudflare like [this](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/) |
| `EMAIL_TO_ADDRESS` | Notification recipient email,must match your destination_address | "your.email@domain.com" | Must be configured in Cloudflare like [this](https://developers.cloudflare.com/email-routing/setup/email-routing-addresses/) |
| `GITHUB_TOKEN` | GitHub Personal Access Token | "xxxxxxxxxxxx" | Optional. Not required for personal use (60 unauthenticated requests/hour. You can get [More deails](https://docs.github.com/en/rest/using-the-rest-api/rate-limits-for-the-rest-api?apiVersion=2022-11-28) here. |

### Other Configuration on `wrangler.jsonc`
| Configuration | Description | Example | Notes |
|--------------|-------------|---------|--------|
| `send_email.destination_address` | Notification recipient email | "your.email@domain.com" | Must match EMAIL_TO_ADDRESS |
| `triggers.crons` | Schedule for monitoring repositories | "0 1 * * *" | Cron expression format (e.g., "0 1 * * *" means run at 1 AM daily and check updates from the past 24 hours) |

## Deployment

> **Note**: This project is designed to run on Cloudflare Workers and requires Cloudflare's infrastructure. It cannot be run locally due to its dependencies on Cloudflare-specific features like Email API and AI capabilities.

```bash
# Install dependencies
pnpm install

# Deploy to Cloudflare Workers
pnpm run publish
```

## Usage
### Automatic Updates

Once deployed, GitPush will automatically:
- Run daily at 1 AM (configurable via `triggers.crons` in `wrangler.jsonc`)
- Check for new releases in your monitored repositories
- Send email notifications if updates are found

### Manual Triggers

You can manually trigger the workflow in three ways:

1. **Using Web Interface**

The easiest way to use GitPush:
1. Visit your deployed application URL (e.g., `https://your-worker.workers.dev`)
2. Enter the GitHub repository URLs you want to monitor
3. Click "Start Workflow" to trigger the workflow

2. **Using API**

Create a workflow:
```bash
curl -X POST https://your-worker.workers.dev/api/workflow/create \
  -H "Content-Type: application/json" \
  -d '{
    "repo_urls": [
      "https://github.com/owner/repo1",
      "https://github.com/owner/repo2"
    ]
  }'
```

Check workflow status:
```bash
curl -X POST https://your-worker.workers.dev/api/workflow/status \
  -H "Content-Type: application/json" \
  -d '{
    "instanceId": "your-workflow-instance-id"
  }'
```

3. **Using Cloudflare Dashboard**

- Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
- Navigate to Compute(Workers) > Workflows > Your Workflow
- Click "Trigger" button
- Input your target repositories and trigger the workflow

```json
{
  "repo_urls": [
    "https://github.com/owner/repo1",
    "https://github.com/owner/repo2"
  ]
}
```

### Monitoring

To monitor the workflow execution:
1. Go to [Cloudflare Dashboard](https://dash.cloudflare.com)
2. Navigate to Compute(Workers) > Workflows > Your Workflow
3. Here you can view:
   - Execution history
   - Success/failure status
   - Detailed logs for each step
   - Email delivery status

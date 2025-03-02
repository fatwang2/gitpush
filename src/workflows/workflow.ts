import { WorkflowEntrypoint, WorkflowStep, WorkflowEvent } from 'cloudflare:workers';
import { Env, Params } from '../../types/env';
import { initializeParams } from './1-initialize-params';
import { fetchReleases } from './2-fetch-releases';
import { summarizeReleases } from './3-summarize-releases';
import { formatContent } from './4-format-content';
import { sendEmail } from './5-send-email';

export class GitPushWorkflow extends WorkflowEntrypoint<Env, Params> {
  async run(event: WorkflowEvent<Params>, step: WorkflowStep) {
    // Step 1: Validate and store parameters
    const params = await step.do('initialize-params', async () => {
      return initializeParams(event.payload);
    });

    // Step 2: Fetch releases using stored parameters
    const releases = await step.do('fetch-github-releases', async () => {
      return fetchReleases({
        ...params,
        env: {
          GITHUB_TOKEN: this.env.GITHUB_TOKEN
        }
      });
    });

    // Step 3: Summarize releases content using AI
    const summary = await step.do('summarize-releases', async () => {
      return summarizeReleases(releases, this.env.AI);
    });

    // Step 4: Format content
    const formattedContent = await step.do('format-content', async () => {
      return formatContent({
        hasSummary: summary.hasSummary,
        summary: summary.summary,
        originalReleases: releases
      });
    });

    // Step 5: Send email notification
    const emailResult = await step.do('send-email', 
      {
        retries: {
          limit: 10,
          delay: 5000 * 60,  // 5 minutes
          backoff: "constant"
        },
        timeout: "30 seconds"
      }, 
      async () => {
        return sendEmail({
          hasSummary: summary.hasSummary,
          summary: formattedContent.html,
          originalReleases: releases
        }, this.env);
      }
    );

    // Return complete results
    return {
      ...summary,
      email: emailResult
    };
  }
}
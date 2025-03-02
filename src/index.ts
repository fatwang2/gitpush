import { Env } from './types/env';
import { GitPushWorkflow } from './workflows/workflow';

// Export workflow class so Cloudflare Workers can find it
export { GitPushWorkflow };

// HTTP request handler
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    if (url.pathname.startsWith('/favicon')) {
      return Response.json({}, { status: 404 });
    }

    // Get the status of an existing instance
    const id = url.searchParams.get('instanceId');
    if (id) {
      const instance = await env.GITPUSH.get(id);
      const status = await instance.status();
      // Return only final output, excluding debug information
      return Response.json(status.output || {});
    }

    // Get repository URLs from request body
    const { repo_urls } = await req.json();
    
    // Create new workflow instance
    const instance = await env.GITPUSH.create({
      id: await crypto.randomUUID(),
      params: { repo_urls }
    });

    const status = await instance.status();
    return Response.json({
      id: instance.id,
      status
    });
  },

  workflows: {
    GITPUSH: GitPushWorkflow
  },
  
  // Handle scheduled triggers
  scheduled: async (event: ScheduledEvent, env: Env, ctx: ExecutionContext) => {
    // Use environment variable values directly without format conversion
    const repo_urls = env.GITHUB_REPOS.split(',').map(repo => repo.trim());
    
    const instance = await env.GITPUSH.create({
      id: await crypto.randomUUID(),
      params: {
        type: 'scheduled',
        repo_urls,
        scheduledTime: event.scheduledTime,
        cron: event.cron
      }
    });

    const status = await instance.status();
    return {
      id: instance.id,
      status
    };
  }
};
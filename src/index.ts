import { Env } from './types/env';
import { GitPushWorkflow } from './workflows/workflow';

// Export workflow class so Cloudflare Workers can find it
export { GitPushWorkflow };

// HTTP request handler
export default {
  async fetch(req: Request, env: Env): Promise<Response> {
    const url = new URL(req.url);

    // Redirect /demo to frontend dev server during development
    if (url.pathname.startsWith('/demo')) {
      return Response.redirect('http://localhost:5173', 302);
    }

    if (url.pathname.startsWith('/favicon')) {
      return Response.json({}, { status: 404 });
    }

    // API routes
    if (url.pathname === '/api/workflow/status') {
      // Get workflow status
      const body = await req.json();
      const instance = await env.GITPUSH.get(body.instanceId);
      const status = await instance.status();
      return Response.json(status.output || {});
    }

    if (url.pathname === '/api/workflow/create') {
      // Create new workflow
      const { repo_urls } = await req.json();
      const instance = await env.GITPUSH.create({
        id: await crypto.randomUUID(),
        params: { repo_urls }
      });

      const status = await instance.status();
      return Response.json({
        id: instance.id,
        status
      });
    }

    // Handle unknown routes
    return new Response('Not Found', { status: 404 });
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
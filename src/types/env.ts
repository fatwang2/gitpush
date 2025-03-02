// AI Type Definition
export interface Ai {
  run(model: string, options: { prompt: string }): Promise<any>;
}

// Environment Variable Type Definition
import { SendEmail } from 'cloudflare:email';

export type Env = {
  GITPUSH: Workflow;
  AI: Ai;
  GITHUB_TOKEN: string; // GitHub token if you need higher limits from GitHub
  GITHUB_REPOS: string;  // Added environment variable
  EMAIL_FROM_ADDRESS: string;  // Email sender address
  EMAIL_TO_ADDRESS: string;    // Email recipient address
  SEND_EMAIL: SendEmail;       // Cloudflare Email API
};

// Workflow Parameter Type Definition
export interface Params {
  repo_urls?: string[];  // HTTP request parameters
  type?: 'scheduled';    // Scheduled task type
  payload?: {           // Scheduled task parameters
    scheduledTime: number;
    cron: string;
  };
}

// Scheduled Event Type Definition
export interface ScheduledEvent {
  scheduledTime: number;
  cron: string;
  type: 'scheduled';
}
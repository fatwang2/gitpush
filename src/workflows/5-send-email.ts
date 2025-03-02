import { EmailMessage } from "cloudflare:email";
import { Env } from "../types/env";

export interface EmailParams {
  hasSummary: boolean;
  summary?: string;
  originalReleases?: any;
}

const genEmail = (summary: string, env: Env) => {
  const timestamp = Date.now();
  const random = Math.random().toString(36).substring(2, 15);
  const messageId = `<${timestamp}.${random}@search1api.com>`;
  const boundary = `----=_Part_${timestamp}_${random}`;

  const headers = [
    'MIME-Version: 1.0',
    'Content-Type: multipart/alternative; boundary="' + boundary + '"',
    `From: GitPush Release Bot <${env.EMAIL_FROM_ADDRESS}>`,
    `To: ${env.EMAIL_TO_ADDRESS}`,
    'Subject: New GitHub Release Updates',
    'Message-ID: ' + messageId,
    'Date: ' + new Date().toUTCString(),
    '',
    'This is a multi-part message in MIME format.',
    '',
    '--' + boundary,
    'Content-Type: text/html; charset=utf-8',
    'Content-Transfer-Encoding: 7bit',
    '',
    summary,
    '',
    '--' + boundary + '--'
  ].join('\r\n');

  return new EmailMessage(
    env.EMAIL_FROM_ADDRESS,
    env.EMAIL_TO_ADDRESS,
    headers
  );
};

export async function sendEmail(params: EmailParams, env: Env) {
  if (!params.hasSummary) {
    return {
      emailSent: false,
      message: "No summary to send"
    };
  }

  if (!params.summary) {
    return {
      emailSent: false,
      message: "No summary content to send"
    };
  }

  try {
    const message = genEmail(params.summary, env);
    try {
      await env.SEND_EMAIL.send(message);
    } catch (e) {
      const errorMessage = e instanceof Error ? e.message : 'Unknown error';
      throw new Error(`Failed to send email: ${errorMessage}`);
    }

    return {
      emailSent: true,
      message: "Email sent successfully"
    };
  } catch (e) {
    const errorMessage = e instanceof Error ? e.message : 'Unknown error';
    console.error("Failed to send email:", e);
    return {
      emailSent: false,
      message: `Failed to send email: ${errorMessage}`
    };
  }
}

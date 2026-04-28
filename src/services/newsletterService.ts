import { fetchJson } from '@/app/api/http';

export type NewsletterSubscribePayload = {
  email: string;
  name?: string;
};

export type NewsletterSubscribeResponse = {
  success: boolean;
  message: string;
};

const NEWSLETTER_SUBSCRIBE_ENDPOINT = '/newsletter/subscribe';

const normalizePayload = (payload: NewsletterSubscribePayload): NewsletterSubscribePayload => {
  const email = payload.email.trim();
  const name = payload.name?.trim();

  if (!email) {
    throw new Error('Email is required.');
  }

  if (name && name.length < 2) {
    throw new Error('Name must be at least 2 characters.');
  }

  return {
    email,
    ...(name ? { name } : {}),
  };
};

export async function subscribeToNewsletter(
  payload: NewsletterSubscribePayload,
  signal?: AbortSignal
): Promise<NewsletterSubscribeResponse> {
  return fetchJson<NewsletterSubscribeResponse>(NEWSLETTER_SUBSCRIBE_ENDPOINT, {
    method: 'POST',
    signal,
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(normalizePayload(payload)),
  });
}

/**
 * Pages Function for `/projects/<slug>` — serves the app shell with the project's real
 * title/OG/canonical injected from KV, so a case sheet has a linkable URL and crawls properly
 * without an SSR framework. `/projects` itself is a client route (no Function, no asset) and
 * falls through to the SPA index as before.
 */
import { shellResponse, type ApiEnv } from '../../src/lib/pages-api.ts';

interface Context {
  request: Request;
  env: ApiEnv;
  params: Record<string, string | string[]>;
}

export const onRequest = (context: Context): Promise<Response> => {
  const slugParam = context.params.slug;
  const slug = decodeURIComponent(Array.isArray(slugParam) ? slugParam[0] : (slugParam ?? ''));
  return shellResponse(context.request, context.env, new URL(context.request.url), slug);
};

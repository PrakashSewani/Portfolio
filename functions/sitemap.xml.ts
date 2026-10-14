/**
 * Pages Function for `/sitemap.xml` — generated from KV so a newly published project is crawlable
 * with no rebuild. `public/sitemap.xml` was removed with this Function, because a static asset at
 * the same path would win over the Function and go stale.
 */
import { sitemapResponse, type ApiEnv } from '../src/lib/pages-api.ts';

interface Context {
  request: Request;
  env: ApiEnv;
}

export const onRequest = (context: Context): Promise<Response> => sitemapResponse(context.request, context.env);

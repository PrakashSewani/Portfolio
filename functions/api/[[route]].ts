/**
 * Pages Function for `/api/*` — the catch-all adapter over src/lib/pages-api.ts.
 *
 * Pages invokes this for any path with no matching static asset, so `/api/projects` lands here
 * while `/api/projects.json` (the baked snapshot) is served straight from the build output.
 * No `run_worker_first` equivalent is needed on Pages.
 */
import { apiResponse, type ApiEnv } from '../../src/lib/pages-api.ts';

interface Context {
  request: Request;
  env: ApiEnv;
  params: Record<string, string | string[]>;
}

export const onRequest = (context: Context): Promise<Response> => {
  const route = context.params.route;
  const tail = Array.isArray(route) ? route.join('/') : (route ?? '');
  return apiResponse(context.request, context.env, tail);
};

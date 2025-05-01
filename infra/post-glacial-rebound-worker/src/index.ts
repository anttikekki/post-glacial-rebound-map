import {
  mapApiRoute,
  mapDataHttpRangeFetchRoute,
} from "./routes/mapDataHttpRangeRoute";
import { corsHeaders } from "./util/corsUtils";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (mapApiRoute.test(request.url)) {
      // Handle API CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders(),
        });
      }

      return mapDataHttpRangeFetchRoute(request, env, ctx);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

import {
  mapApiRoute,
  mapDataHttpRangeFetchRoute,
} from "./routes/mapDataHttpRangeRoute";
import { allowedMethods, corsHeaders } from "./util/corsUtils";

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (!allowedMethods.includes(request.method)) {
      return new Response("Method Not Allowed", {
        status: 405,
        headers: {
          Allow: allowedMethods.join(", "),
          "Content-Type": "text/plain",
        },
      });
    }

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

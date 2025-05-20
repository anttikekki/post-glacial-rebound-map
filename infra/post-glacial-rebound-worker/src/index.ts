import {
  mapApiRoute,
  mapDataHttpRangeFetchRoute,
} from "./routes/mapDataHttpRangeRoute";
import {
  mapDataVersionYearsRoute,
  mapVersionYearsApiRoute,
} from "./routes/mapDataVersionYearsRoute";
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
          headers: { ...corsHeaders, "Accept-Ranges": "bytes" },
        });
      }
      return mapDataHttpRangeFetchRoute(request, env);
    }
    if (mapVersionYearsApiRoute.test(request.url)) {
      // Handle API CORS preflight
      if (request.method === "OPTIONS") {
        return new Response(null, {
          status: 204,
          headers: corsHeaders,
        });
      }
      return mapDataVersionYearsRoute(request);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

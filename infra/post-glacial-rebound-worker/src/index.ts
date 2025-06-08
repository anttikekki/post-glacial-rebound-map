import {
  iceMapApiPath,
  iceMapDataHttpRangeFetchRoute,
  iceMapDataYearsRoute,
  iceMapYearsApiPath,
} from "./routes/iceMapRoute";
import {
  openApiHtmlPath,
  openApiHtmlRoute,
  openApiSpecJsonPath,
  openApiSpecJsonRoute,
} from "./routes/openApiRoute";
import {
  seaMapApiPath,
  seaMapDataHttpRangeFetchRoute,
  seaMapDataVersionYearsRoute,
  seaMapVersionYearsApiPath,
} from "./routes/seaMapRoute";
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

    // Handle CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        status: 204,
        headers: { ...corsHeaders, "Accept-Ranges": "bytes" },
      });
    }

    if (openApiHtmlPath.test(request.url)) {
      return openApiHtmlRoute();
    }
    if (openApiSpecJsonPath.test(request.url)) {
      return openApiSpecJsonRoute();
    }
    if (seaMapVersionYearsApiPath.test(request.url)) {
      return seaMapDataVersionYearsRoute(request);
    }
    if (iceMapYearsApiPath.test(request.url)) {
      return iceMapDataYearsRoute();
    }
    if (seaMapApiPath.test(request.url)) {
      return seaMapDataHttpRangeFetchRoute(request, env);
    }
    if (iceMapApiPath.test(request.url)) {
      return iceMapDataHttpRangeFetchRoute(request, env);
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

import { corsHeaders } from "../util/corsUtils";

export const stackFolderPath = new URLPattern({
  pathname: "/api/stac/*",
});

/**
 * Add CORS headers to STAC files.
 *
 * Files must be served from /api path even when  those are publicly
 * available from ASSETS root /stac folder because default ASSETS
 * route does not add CORS headers.
 */
export const stacRoute = async (
  request: Request,
  env: Env,
): Promise<Response> => {
  const assetsUrl = new URL(request.url);
  assetsUrl.pathname = assetsUrl.pathname.replace("/api/stac", "/stac");

  const assetsResponse = await env.ASSETS.fetch(
    new Request(assetsUrl, request),
  );

  return new Response(assetsResponse.body, {
    status: assetsResponse.status,
    statusText: assetsResponse.statusText,
    headers: new Headers({
      ...Object.fromEntries(assetsResponse.headers),
      ...corsHeaders,
    }),
  });
};

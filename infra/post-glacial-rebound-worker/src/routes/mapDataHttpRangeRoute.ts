import years from "../../../../common/mapLayerYears.json" assert { type: "json" };
import { corsHeaders } from "../util/corsUtils";
import { parseRangeHeader } from "../util/httpRangeUtil";

export const mapApiRoute = new URLPattern({ pathname: "/api/v1/:year" });

export const mapDataHttpRangeFetchRoute = async (
  request: Request,
  env: Env
): Promise<Response> => {
  const url = mapApiRoute.exec(request.url);
  const year = parseInt(url?.pathname.groups.year ?? "");

  if (isNaN(year)) {
    return new Response(
      "Year parameter in path /api/v1/:year is not a number",
      { status: 400, headers: { ...corsHeaders, "Accept-Ranges": "bytes" } }
    );
  }
  if (!years.includes(year)) {
    return new Response(
      `Year ${year} is not supported. Supported years: ${years.join(", ")}`,
      { status: 400, headers: { ...corsHeaders, "Accept-Ranges": "bytes" } }
    );
  }

  const r2key = `V1/${year}.tif`;

  // HEAD request to get metadata (size)
  const headObj = await env.MAP_DATA_BUCKET.head(r2key);
  if (!headObj) {
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }

  const rangeParseResult = parseRangeHeader(
    request.headers.get("Range"),
    headObj.size
  );
  if (!rangeParseResult.success) {
    return rangeParseResult.errorResponse; // HTTP 416 Range Not Satisfiable
  }
  const { start, end, offset, length } = rangeParseResult;

  const object = await env.MAP_DATA_BUCKET.get(r2key, {
    range: { offset, length },
  });
  if (!object) {
    return new Response("Not Found", { status: 404, headers: corsHeaders });
  }

  const headers = new Headers({
    "Content-Range": `bytes ${start}-${end}/${headObj.size}`,
    "Accept-Ranges": "bytes",
    etag: object.httpEtag,
    "Cache-Control": `public, max-age=86400`, // Cache 1 day on edge and browser
    Vary: "Accept-Encoding, Range", // Ensure the cache varies based on encoding and range requests
    ...corsHeaders,
  });
  object.writeHttpMetadata(headers);

  return new Response(object.body, {
    status: 206, // HTTP 206: Partial Content
    headers,
  });
};

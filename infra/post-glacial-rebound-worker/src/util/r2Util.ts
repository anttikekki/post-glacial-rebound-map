import { corsHeaders } from "./corsUtils";
import { parseRangeHeader } from "./httpRangeUtil";

const errorHeaders = { ...corsHeaders, "Accept-Ranges": "bytes" };

export const fetchR2FileRange = async (
  request: Request,
  r2Key: string,
  env: Env,
): Promise<Response> => {
  const object = await env.MAP_DATA_BUCKET.get(r2Key, {
    range: request.headers,
  });

  if (!object) {
    return new Response("Not Found", { status: 404, headers: errorHeaders });
  }

  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": `public, max-age=86400`, // Cache 1 day on browser
    Vary: "Accept-Encoding, Range", // Ensure the cache varies based on encoding and range requests
    ...corsHeaders,
  });

  headers.set("etag", object.httpEtag);
  object.writeHttpMetadata(headers);

  const rangeHeader = request.headers.get("Range");

  if (rangeHeader) {
    const rangeParseResult = parseRangeHeader(rangeHeader, object.size);
    if (!rangeParseResult.success) {
      // Important: Cancel the body stream if we're not going to use it, otherwise we leak resources
      await object.body.cancel();
      return rangeParseResult.errorResponse; // HTTP 416 Range Not Satisfiable
    }

    // If a range was actually applied by R2
    if (object.range) {
      const { start, end } = rangeParseResult;
      headers.set("Content-Range", `bytes ${start}-${end}/${object.size}`);
      return new Response(object.body, {
        status: 206, // HTTP 206: Partial Content
        headers,
      });
    }
  }

  // Return full file with valid filename
  headers.set(
    "Content-Disposition",
    `attachment; filename="${getFullDownloadFileName(r2Key)}"`,
  );
  return new Response(object.body, {
    status: 200,
    headers,
  });
};

const getFullDownloadFileName = (r2Key: string) => {
  // Extract "-100" from "V2/-100.tif"
  const match = r2Key.match(/(-?\d+)\.tif$/);
  if (!match) return "unknown.tif";

  const year = parseInt(match[1], 10);

  if (year < 0) return `${Math.abs(year)}bc.tif`;
  if (year === 0) return `0.tif`;
  return `${year}ad.tif`;
};

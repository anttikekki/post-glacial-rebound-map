import { corsHeaders } from "./corsUtils";
import { parseRangeHeader } from "./httpRangeUtil";

const errorHeaders = { ...corsHeaders, "Accept-Ranges": "bytes" };

export const fetchR2FileRange = async (
  request: Request,
  r2Key: string,
  env: Env
): Promise<Response> => {
  // HEAD request to get metadata (size)
  const headObj = await env.MAP_DATA_BUCKET.head(r2Key);
  if (!headObj) {
    return new Response("Not Found", { status: 404, headers: errorHeaders });
  }
  let offset = 0;
  let length = headObj.size;
  let status = 200;

  const headers = new Headers({
    "Accept-Ranges": "bytes",
    "Cache-Control": `public, max-age=86400`, // Cache 1 day on browser
    Vary: "Accept-Encoding, Range", // Ensure the cache varies based on encoding and range requests
    ...corsHeaders,
  });

  const rangeHeader = request.headers.get("Range");

  // Return range of bytes from full file if Range header is in request
  if (rangeHeader) {
    const rangeParseResult = parseRangeHeader(rangeHeader, headObj.size);
    if (!rangeParseResult.success) {
      return rangeParseResult.errorResponse; // HTTP 416 Range Not Satisfiable
    }
    const { start, end } = rangeParseResult;
    offset = rangeParseResult.offset;
    length = rangeParseResult.length;
    status = 206; // HTTP 206: Partial Content
    headers.set("Content-Range", `bytes ${start}-${end}/${headObj.size}`);
  }

  const object = await env.MAP_DATA_BUCKET.get(r2Key, {
    range: { offset, length },
  });
  if (!object) {
    return new Response("Not Found", { status: 404, headers: errorHeaders });
  }

  headers.set("etag", object.httpEtag);
  object.writeHttpMetadata(headers);

  return new Response(object.body, {
    status,
    headers,
  });
};

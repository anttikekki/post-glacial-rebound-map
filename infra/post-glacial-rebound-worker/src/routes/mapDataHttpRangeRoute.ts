import years from "../../../../common/mapLayerYears.json" assert { type: "json" };
import { corsHeaders } from "../util/corsUtils";
import { parseRangeHeader } from "../util/httpRangeUtil";

export const mapApiRoute = new URLPattern({ pathname: "/api/v1/:year" });

export const mapDataHttpRangeFetchRoute: ExportedHandlerFetchHandler<
  Env
> = async (request, env, ctx) => {
  const headers = new Headers(corsHeaders());
  const url = mapApiRoute.exec(request.url);
  const year = parseInt(url?.pathname.groups.year ?? "");

  if (isNaN(year)) {
    return new Response(
      "Year parameter in path /api/v1/:year is not a number",
      { status: 400, headers }
    );
  }
  if (!years.includes(year)) {
    return new Response(
      `Year ${year} is not supported. Supported years: ${years.join(", ")}`,
      { status: 400, headers }
    );
  }

  const r2key = `V1/${year}.tif`;

  // HEAD request to get metadata (size)
  const headObj = await env.MAP_DATA_BUCKET.head(r2key);
  if (!headObj) return new Response("Not Found", { status: 404, headers });

  const fileSizeInBytes = headObj.size;
  let status = 200; // HTTP 200 OK: Full file default

  const rangeParseResult = parseRangeHeader(
    request.headers.get("Range"),
    fileSizeInBytes
  );
  if (!rangeParseResult.success) {
    return rangeParseResult.errorResponse;
  }
  const { start, end, offset, length } = rangeParseResult;
  if (start !== undefined && end !== undefined) {
    status = 206; // HTTP 206: Partial Content
    headers.set("Content-Range", `bytes ${start}-${end}/${fileSizeInBytes}`);
    headers.set("Accept-Ranges", "bytes");
  }

  const object = await env.MAP_DATA_BUCKET.get(r2key, {
    range: { offset, length },
  });
  if (!object) return new Response("Not Found", { status: 404, headers });

  object.writeHttpMetadata(headers);
  headers.set("etag", object.httpEtag);

  return new Response(object.body, {
    status,
    headers,
  });
};

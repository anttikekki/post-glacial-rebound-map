import { corsHeaders } from "../util/corsUtils";

export const mapApiRoute = new URLPattern({ pathname: "/api/V1/:year" });

export const mapDataHttpRangeFetchRoute: ExportedHandlerFetchHandler<
  Env
> = async (request, env, ctx) => {
  const headers = new Headers(corsHeaders());

  const url = mapApiRoute.exec(request.url);
  const year = url?.pathname.groups.year;
  const key = `V1/${year}.tif`;

  // HEAD request to get metadata (size)
  const headObj = await env.MAP_DATA_BUCKET.head(key);
  if (!headObj) return new Response("Not Found", { status: 404, headers });

  const size = headObj.size;
  let offset = 0; // Full file default
  let length = size; // Full file default
  let status = 200; // Full file default
  const rangeHeader = request.headers.get("Range");

  if (rangeHeader) {
    // Only 'bytes=' range units are supported
    if (!rangeHeader.startsWith("bytes=")) {
      return new Response("Range Not Satisfiable: Unsupported unit", {
        status: 416,
        headers: {
          ...headers,
          "Content-Range": `bytes */${size}`,
        },
      });
    }

    const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
    if (!match) {
      return new Response("Range Not Satisfiable: Malformed", {
        status: 416,
        headers: {
          ...headers,
          "Content-Range": `bytes */${size}`,
        },
      });
    }

    let start = match[1] ? parseInt(match[1], 10) : null;
    let end = match[2] ? parseInt(match[2], 10) : null;

    // Validation and calculation
    if (start === null && end === null) {
      return new Response("Range Not Satisfiable: Missing range bounds", {
        status: 416,
        headers: {
          ...headers,
          "Content-Range": `bytes */${size}`,
        },
      });
    }

    if (start !== null && end !== null && (start > end || end >= size)) {
      return new Response("Range Not Satisfiable: Invalid range", {
        status: 416,
        headers: {
          ...headers,
          "Content-Range": `bytes */${size}`,
        },
      });
    }

    if (start !== null && end === null && start >= size) {
      return new Response("Range Not Satisfiable: Start beyond size", {
        status: 416,
        headers: {
          ...headers,
          "Content-Range": `bytes */${size}`,
        },
      });
    }

    if (start === null && end !== null) {
      if (end === 0) {
        return new Response("Range Not Satisfiable: Empty suffix", {
          status: 416,
          headers: {
            ...headers,
            "Content-Range": `bytes */${size}`,
          },
        });
      }
      start = Math.max(size - end, 0);
      end = size - 1;
    }

    if (start !== null && end !== null) {
      offset = start;
      length = end - start + 1;
      status = 206;

      headers.set("Content-Range", `bytes ${start}-${end}/${size}`);
      headers.set("Accept-Ranges", "bytes");
    }
  }

  const object = await env.MAP_DATA_BUCKET.get(key, {
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

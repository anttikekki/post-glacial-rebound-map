import { corsHeaders } from "./corsUtils";

type ParseRangeHeaderSuccess = {
  success: true;
  offset: number;
  length: number;
  start?: number;
  end?: number;
};
type ParseRangeHeaderFailure = {
  success: false;
  errorResponse: Response;
};
type ParseRangeHeaderResponse =
  | ParseRangeHeaderSuccess
  | ParseRangeHeaderFailure;

export const parseRangeHeader = (
  rangeHeader: string | null,
  fileSizeInBytes: number
): ParseRangeHeaderResponse => {
  let offset = 0; // Full file default
  let length = fileSizeInBytes; // Full file default

  if (!rangeHeader) {
    return {
      success: true,
      offset,
      length,
    };
  }
  // Only 'bytes=' range units are supported
  if (!rangeHeader.startsWith("bytes=")) {
    return {
      success: false,
      errorResponse: new Response("Range Not Satisfiable: Unsupported unit", {
        status: 416, // Range Not Satisfiable
        headers: {
          ...corsHeaders(),
          "Content-Range": `bytes */${fileSizeInBytes}`,
        },
      }),
    };
  }

  const match = rangeHeader.match(/^bytes=(\d*)-(\d*)$/);
  if (!match) {
    return {
      success: false,
      errorResponse: new Response("Range Not Satisfiable: Malformed", {
        status: 416, // Range Not Satisfiable
        headers: {
          ...corsHeaders(),
          "Content-Range": `bytes */${fileSizeInBytes}`,
        },
      }),
    };
  }

  let start = match[1] ? parseInt(match[1], 10) : null;
  let end = match[2] ? parseInt(match[2], 10) : null;

  if (start === null && end === null) {
    return {
      success: false,
      errorResponse: new Response(
        "Range Not Satisfiable: Missing range bounds",
        {
          status: 416, // Range Not Satisfiable
          headers: {
            ...corsHeaders(),
            "Content-Range": `bytes */${fileSizeInBytes}`,
          },
        }
      ),
    };
  }

  if (
    start !== null &&
    end !== null &&
    (start > end || end >= fileSizeInBytes)
  ) {
    return {
      success: false,
      errorResponse: new Response("Range Not Satisfiable: Invalid range", {
        status: 416, // Range Not Satisfiable
        headers: {
          ...corsHeaders(),
          "Content-Range": `bytes */${fileSizeInBytes}`,
        },
      }),
    };
  }

  if (start !== null && end === null && start >= fileSizeInBytes) {
    return {
      success: false,
      errorResponse: new Response("Range Not Satisfiable: Start beyond size", {
        status: 416, // Range Not Satisfiable
        headers: {
          ...corsHeaders(),
          "Content-Range": `bytes */${fileSizeInBytes}`,
        },
      }),
    };
  }

  if (start === null && end !== null) {
    if (end === 0) {
      return {
        success: false,
        errorResponse: new Response("Range Not Satisfiable: Empty suffix", {
          status: 416, // Range Not Satisfiable
          headers: {
            ...corsHeaders(),
            "Content-Range": `bytes */${fileSizeInBytes}`,
          },
        }),
      };
    }
    start = Math.max(fileSizeInBytes - end, 0);
    end = fileSizeInBytes - 1;
  }

  if (start !== null && end !== null) {
    offset = start;
    length = end - start + 1;
  }

  return {
    success: true,
    offset,
    length,
    start: start ?? undefined,
    end: end ?? undefined,
  };
};

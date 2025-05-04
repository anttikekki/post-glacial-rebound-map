import rangeParser from "range-parser";
import { corsHeaders } from "./corsUtils";

type ParseRangeHeaderSuccess = {
  success: true;
  offset: number;
  length: number;
  start: number;
  end: number;
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
  if (!rangeHeader) {
    return {
      success: false,
      errorResponse: new Response("No Range header detected", {
        status: 416, // Range Not Satisfiable
        headers: {
          ...corsHeaders,
          "Content-Range": `bytes */${fileSizeInBytes}`,
        },
      }),
    };
  }
  // Only 'bytes=' range units are supported
  if (!rangeHeader.startsWith("bytes=")) {
    return {
      success: false,
      errorResponse: new Response("Range Not Satisfiable: Unsupported unit", {
        status: 416, // Range Not Satisfiable
        headers: {
          ...corsHeaders,
          "Content-Range": `bytes */${fileSizeInBytes}`,
        },
      }),
    };
  }

  const ranges = rangeParser(fileSizeInBytes, rangeHeader);
  if (ranges === -1 || ranges === -2) {
    return {
      success: false,
      errorResponse: new Response("Range Not Satisfiable", {
        status: 416, // Range Not Satisfiable
        headers: {
          ...corsHeaders,
          "Content-Range": `bytes */${fileSizeInBytes}`,
        },
      }),
    };
  }
  if (ranges.length > 1) {
    return {
      success: false,
      errorResponse: new Response("Multiple ranges not supported", {
        status: 416, // Range Not Satisfiable
        headers: {
          ...corsHeaders,
          "Content-Range": `bytes */${fileSizeInBytes}`,
        },
      }),
    };
  }
  const { start, end } = ranges[0];

  return {
    success: true,
    offset: start,
    length: end - start + 1,
    start,
    end,
  };
};

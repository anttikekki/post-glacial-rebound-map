export const allowedMethods = ["GET", "HEAD", "OPTIONS"];

export function corsHeaders() {
  return new Headers({
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": allowedMethods.join(","),
    "Access-Control-Allow-Headers": "Range",
    "Access-Control-Expose-Headers":
      "Content-Range,Accept-Ranges,Content-Length,ETag",
    "Access-Control-Max-Age": "86400",
  });
}

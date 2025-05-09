export const allowedMethods = ["GET", "HEAD", "OPTIONS"];

export const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": allowedMethods.join(","),
  "Access-Control-Max-Age": "86400",
};

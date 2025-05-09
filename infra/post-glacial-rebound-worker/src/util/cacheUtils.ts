const cacheTTL = 86400; // 1 day

export const cacheHeaders = {
  "Cache-Control": `public, max-age=${cacheTTL}`, // Cache 1 day on edge and browser
  Vary: "Accept-Encoding, Range", // Ensure the cache varies based on encoding and range requests
};

export const getFromCacheOrExecute = async (
  request: Request,
  executeFn: (request: Request) => Promise<Response>
) => {
  // Use Cloudflare Cache API to get the response from cache
  const cache = caches.default;

  // Check if the response is already cached
  let response = await cache.match(request);

  if (response) {
    // Cache hit: Return the cached response
    return response;
  }

  // Cache miss: execute provided function for new value
  response = await executeFn(request);
  response.headers.set("CF-Cache-Status", "MISS");

  // Cache only succesfull HTTP 2XX responses
  if (response.status >= 200 && response.status < 300) {
    cache.put(request, response);
  }

  return response;
};

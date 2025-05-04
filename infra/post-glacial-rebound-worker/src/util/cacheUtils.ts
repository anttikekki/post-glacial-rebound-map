const cacheTTL = 86400; // 1 day

export const cacheHeaders = {
  "Cache-Control": `public, max-age=${cacheTTL}`, // Cache on edge and browser
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

  // Cache only succesfull HTTP 2XX responses
  if (response.status >= 200 && response.status < 300) {
    cache.put(request, response);
  }

  return response;
};

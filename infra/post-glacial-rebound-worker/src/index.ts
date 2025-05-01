const apiRoute = new URLPattern({ pathname: "/api" });

export default {
  async fetch(request, env, ctx): Promise<Response> {
    if (apiRoute.test(request.url)) {
      return new Response("API response");
    }

    return env.ASSETS.fetch(request);
  },
} satisfies ExportedHandler<Env>;

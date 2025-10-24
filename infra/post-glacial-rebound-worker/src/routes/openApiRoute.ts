import iceYears from "../../../../common/iceMapLayerYears.json" assert { type: "json" };
import years from "../../../../common/seaMapLayerYears.json" assert { type: "json" };

export const openApiHtmlPath = new URLPattern({ pathname: "/api" });
export const openApiSpecJsonPath = new URLPattern({
  pathname: "/api/spec.json",
});

export const openApiHtmlRoute = async (): Promise<Response> => {
  const html = `
    <!DOCTYPE html>
    <html>
        <head>
            <meta charset="utf-8" />
            <title>Maannousu GeoTIFF API Docs</title>
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <link rel="shortcut icon" href="../images/favicons/favicon.ico" />
        </head>
        <body>
            <redoc spec-url="api/spec.json"></redoc>
            <script src="https://cdn.redoc.ly/redoc/latest/bundles/redoc.standalone.js"></script>
        </body>
    </html>
    `;
  return new Response(html, {
    status: 200,
    headers: { "Content-Type": "text/html" },
  });
};

export const openApiSpecJsonRoute = async (): Promise<Response> => {
  return new Response(JSON.stringify(spec), {
    status: 200,
    headers: { "Content-Type": "application/json" },
  });
};

const spec = {
  openapi: "3.0.3",
  info: {
    title: "Maannousu GeoTIFF API",
    version: "1.0.0",
    description:
      "API serving GeoTIFF files and metadata for historical land uplift data.",
  },
  servers: [
    {
      url: "https://maannousu.info/",
    },
  ],
  paths: {
    "/api/v2/{year}": {
      get: {
        summary: "Get GeoTIFF for specified year",
        parameters: [
          {
            name: "year",
            in: "path",
            required: true,
            schema: {
              type: "integer",
              enum: years,
            },
          },
        ],
        responses: {
          "200": {
            description: "Full GeoTIFF file returned",
            headers: {
              ETag: { schema: { type: "string" } },
              "Accept-Ranges": { schema: { type: "string", example: "bytes" } },
              "Cache-Control": {
                schema: { type: "string", example: "public, max-age=86400" },
              },
              Vary: {
                schema: { type: "string", example: "Accept-Encoding, Range" },
              },
            },
          },
          "204": {
            description: "Partial GeoTIFF content returned",
            headers: {
              ETag: { schema: { type: "string" } },
              "Accept-Ranges": { schema: { type: "string", example: "bytes" } },
              "Cache-Control": {
                schema: { type: "string", example: "public, max-age=86400" },
              },
              Vary: {
                schema: { type: "string", example: "Accept-Encoding, Range" },
              },
            },
          },
          "400": { description: "Unsupported year" },
          "405": { description: "Method not allowed" },
          "416": { description: "Invalid range header" },
        },
      },
    },
    "/api/v2": {
      get: {
        summary: "Get list of supported years",
        responses: {
          "200": {
            description: "List of supported years",
            headers: {
              ETag: { schema: { type: "string" } },
            },
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: { type: "integer" },
                },
              },
            },
          },
          "405": { description: "Method not allowed" },
        },
      },
    },
    "/api/v2/ice/{year}": {
      get: {
        summary: "Get GeoTIFF for specified Glacial ice year",
        parameters: [
          {
            name: "year",
            in: "path",
            required: true,
            schema: {
              type: "integer",
              enum: iceYears,
            },
          },
        ],
        responses: {
          "200": {
            description: "Full GeoTIFF file returned",
            headers: {
              ETag: { schema: { type: "string" } },
              "Accept-Ranges": { schema: { type: "string", example: "bytes" } },
              "Cache-Control": {
                schema: { type: "string", example: "public, max-age=86400" },
              },
              Vary: {
                schema: { type: "string", example: "Accept-Encoding, Range" },
              },
            },
          },
          "204": {
            description: "Partial GeoTIFF content returned",
            headers: {
              ETag: { schema: { type: "string" } },
              "Accept-Ranges": { schema: { type: "string", example: "bytes" } },
              "Cache-Control": {
                schema: { type: "string", example: "public, max-age=86400" },
              },
              Vary: {
                schema: { type: "string", example: "Accept-Encoding, Range" },
              },
            },
          },
          "400": { description: "Unsupported year" },
          "405": { description: "Method not allowed" },
          "416": { description: "Invalid range header" },
        },
      },
    },
    "/api/v2/ice": {
      get: {
        summary: "Get list of available Glacial ice years",
        responses: {
          "200": {
            description: "List of available years for ice data",
            headers: {
              ETag: { schema: { type: "string" } },
            },
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    type: "integer",
                    enum: iceYears,
                  },
                },
              },
            },
          },
          "405": { description: "Method not allowed" },
        },
      },
    },
  },
};

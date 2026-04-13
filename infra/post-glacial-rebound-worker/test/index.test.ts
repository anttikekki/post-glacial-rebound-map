import { env, exports } from "cloudflare:workers";
import { describe, it, expect, beforeEach } from "vitest";

const R2_ICE_KEY = "V2/ice/-10000.tif";
const R2_SEA_KEY = "V2/-10000.tif";
const DUMMY_CONTENT = "dummy-content";
const DUMMY_CONTENT_LENGTH = DUMMY_CONTENT.length;

describe("Worker", () => {
  beforeEach(async () => {
    // Seed R2
    await env.MAP_DATA_BUCKET.put(R2_ICE_KEY, DUMMY_CONTENT);
    await env.MAP_DATA_BUCKET.put(R2_SEA_KEY, DUMMY_CONTENT);
  });

  describe("OpenAPI", () => {
    it("GET /api/spec.json returns the OpenAPI spec", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/spec.json",
      );

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain(
        "application/json",
      );
      const json = (await response.json()) as any;
      expect(json.openapi).toBe("3.0.3");
    });

    it("GET /api returns the ReDoc UI", async () => {
      const response = await exports.default.fetch("http://maannousu.info/api");

      expect(response.status).toBe(200);
      expect(response.headers.get("Content-Type")).toContain("text/html");
      const text = await response.text();
      expect(text).toContain("<redoc");
    });
  });

  describe("Ice Map API (/api/v2/ice)", () => {
    it("GET /api/v2/ice returns list of supported years", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/ice",
      );

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json).toContain(-10000);
    });

    it("POST /api/v2/ice returns 405 Method Not Allowed", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/ice",
        {
          method: "POST",
        },
      );

      expect(response.status).toBe(405);
    });

    it("GET /api/v2/ice/:year fetches file from R2", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/ice/-10000",
      );

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe(DUMMY_CONTENT);
    });

    it("GET /api/v2/ice/:year handles invalid year format", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/ice/abc",
      );

      expect(response.status).toBe(400);
    });

    it("GET /api/v2/ice/:year handles unsupported year", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/ice/99999",
      );

      expect(response.status).toBe(400);
    });
  });

  describe("Sea Map API (/api/v2)", () => {
    it("GET /api/v2 returns list of supported years", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2",
      );

      expect(response.status).toBe(200);
      const json = await response.json();
      expect(Array.isArray(json)).toBe(true);
      expect(json).toContain(-10000);
    });

    it("GET /api/v2/:year fetches file from R2", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/-10000",
      );

      expect(response.status).toBe(200);
      const text = await response.text();
      expect(text).toBe(DUMMY_CONTENT);
    });

    it("GET /api/v2/:year handles invalid year format", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/abc",
      );

      expect(response.status).toBe(400);
    });

    it("GET /api/v2/:year handles unsupported year", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/99999",
      );

      expect(response.status).toBe(400);
    });
  });

  describe("Range Requests (Shared Logic)", () => {
    it("GET /api/v2/ice/:year handles valid range request", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/ice/-10000",
        {
          method: "GET",
          headers: { Range: "bytes=0-4" },
        },
      );

      expect(response.status).toBe(206);
      const text = await response.text();
      expect(text).toBe(DUMMY_CONTENT.substring(0, 5));
      expect(response.headers.get("Content-Range")).toBe(
        `bytes 0-4/${DUMMY_CONTENT_LENGTH}`,
      );
    });

    it("GET /api/v2/:year handles valid range request", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/-10000",
        {
          method: "GET",
          headers: { Range: "bytes=0-4" },
        },
      );

      expect(response.status).toBe(206);
      const text = await response.text();
      expect(text).toBe(DUMMY_CONTENT.substring(0, 5));
      expect(response.headers.get("Content-Range")).toBe(
        `bytes 0-4/${DUMMY_CONTENT_LENGTH}`,
      );
    });

    it("returns 416 for invalid range unit", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/ice/-10000",
        {
          method: "GET",
          headers: { Range: "bits=0-4" },
        },
      );

      expect(response.status).toBe(416);
    });

    it("returns 416 for unsatisfiable range", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/ice/-10000",
        {
          method: "GET",
          headers: { Range: "bytes=1000-2000" }, // Content is much shorter
        },
      );

      expect(response.status).toBe(416);
    });

    it("returns 416 for multiple ranges (unsupported)", async () => {
      const response = await exports.default.fetch(
        "http://maannousu.info/api/v2/ice/-10000",
        {
          method: "GET",
          headers: { Range: "bytes=0-1,3-4" },
        },
      );

      expect(response.status).toBe(416);
    });
  });
});

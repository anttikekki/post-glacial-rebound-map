import yearsV1 from "../../../../common/mapLayerYearsModelV1.json" assert { type: "json" };
import yearsV2 from "../../../../common/mapLayerYearsModelV2.json" assert { type: "json" };
import { corsHeaders } from "../util/corsUtils";
import { fetchR2FileRange } from "../util/r2Util";

const API_VERSIONS = ["V1", "V2"];
const errorHeaders = { ...corsHeaders, "Accept-Ranges": "bytes" };

export const seaMapApiPath = new URLPattern({
  pathname: "/api/:version/:year",
});

export const seaMapDataHttpRangeFetchRoute = async (
  request: Request,
  env: Env
): Promise<Response> => {
  const url = seaMapApiPath.exec(request.url);
  const year = parseInt(url?.pathname.groups.year ?? "");
  const apiVersion = (url?.pathname.groups.version ?? "").toUpperCase();

  if (!API_VERSIONS.includes(apiVersion)) {
    return new Response(
      `API version ${apiVersion} is not supported. Supported versions: ${API_VERSIONS.join(
        ", "
      )}`,
      { status: 400, headers: errorHeaders }
    );
  }
  if (isNaN(year)) {
    return new Response(
      "Year parameter in path /api/:version/:year is not a number",
      { status: 400, headers: errorHeaders }
    );
  }
  if (apiVersion === "V1" && !yearsV1.includes(year)) {
    return new Response(
      `Year ${year} is not supported for API version V1. Supported years: ${yearsV1.join(
        ", "
      )}`,
      { status: 400, headers: errorHeaders }
    );
  }
  if (apiVersion === "V2" && !yearsV2.includes(year)) {
    return new Response(
      `Year ${year} is not supported for API version V2. Supported years: ${yearsV2.join(
        ", "
      )}`,
      { status: 400, headers: errorHeaders }
    );
  }

  const r2Key = `${apiVersion}/${year}.tif`;

  return fetchR2FileRange(request, r2Key, env);
};

export const seaMapVersionYearsApiPath = new URLPattern({
  pathname: "/api/:version",
});

export const seaMapDataVersionYearsRoute = async (
  request: Request
): Promise<Response> => {
  const url = seaMapVersionYearsApiPath.exec(request.url);
  const apiVersion = (url?.pathname.groups.version ?? "").toUpperCase();

  if (apiVersion === "V1") {
    return new Response(JSON.stringify(yearsV1), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  if (apiVersion === "V2") {
    return new Response(JSON.stringify(yearsV2), {
      status: 200,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
  return new Response(
    `API version ${apiVersion} is not supported. Supported versions: "V1", "V2"`,
    { status: 400, headers: errorHeaders }
  );
};

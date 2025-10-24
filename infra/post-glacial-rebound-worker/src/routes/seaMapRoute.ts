import years from "../../../../common/seaMapLayerYears.json" assert { type: "json" };
import { corsHeaders } from "../util/corsUtils";
import { fetchR2FileRange } from "../util/r2Util";

const errorHeaders = { ...corsHeaders, "Accept-Ranges": "bytes" };

export const seaMapApiPath = new URLPattern({
  pathname: "/api/v2/:year",
});

export const seaMapDataHttpRangeFetchRoute = async (
  request: Request,
  env: Env
): Promise<Response> => {
  const url = seaMapApiPath.exec(request.url);
  const year = parseInt(url?.pathname.groups.year ?? "");

  if (isNaN(year)) {
    return new Response(
      "Year parameter in path /api/v2/:year is not a number",
      { status: 400, headers: errorHeaders }
    );
  }
  if (!years.includes(year)) {
    return new Response(
      `Year ${year} is not supported. Supported years: ${years.join(", ")}`,
      { status: 400, headers: errorHeaders }
    );
  }

  const r2Key = `V2/${year}.tif`;

  return fetchR2FileRange(request, r2Key, env);
};

export const seaMapVersionYearsApiPath = new URLPattern({
  pathname: "/api/v2",
});

export const seaMapDataVersionYearsRoute = async (
  request: Request
): Promise<Response> => {
  return new Response(JSON.stringify(years), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

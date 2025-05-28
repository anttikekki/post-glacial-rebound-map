import iceYears from "../../../../common/iceMapLayerYears.json" assert { type: "json" };
import { corsHeaders } from "../util/corsUtils";
import { fetchR2FileRange } from "../util/r2Util";

const errorHeaders = { ...corsHeaders, "Accept-Ranges": "bytes" };

export const iceMapApiPath = new URLPattern({ pathname: "/api/v2/ice/:year" });

export const iceMapDataHttpRangeFetchRoute = async (
  request: Request,
  env: Env
): Promise<Response> => {
  const url = iceMapApiPath.exec(request.url);
  const year = parseInt(url?.pathname.groups.year ?? "");

  if (isNaN(year)) {
    return new Response(
      "Year parameter in path /api/:version/:year is not a number",
      { status: 400, headers: errorHeaders }
    );
  }
  if (!iceYears.includes(year)) {
    return new Response(
      `Year ${year} is not supported for API version glacier map. Supported years: ${iceYears.join(
        ", "
      )}`,
      { status: 400, headers: errorHeaders }
    );
  }

  const r2Key = `V2/ice/${year}.tif`;

  return fetchR2FileRange(request, r2Key, env);
};

export const iceMapYearsApiPath = new URLPattern({
  pathname: "/api/v2/ice",
});

export const iceMapDataYearsRoute = async (): Promise<Response> => {
  return new Response(JSON.stringify(iceYears), {
    status: 200,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
};

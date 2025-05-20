import yearsV1 from "../../../../common/mapLayerYearsModelV1.json" assert { type: "json" };
import yearsV2 from "../../../../common/mapLayerYearsModelV2.json" assert { type: "json" };
import { corsHeaders } from "../util/corsUtils";

const errorHeaders = { ...corsHeaders, "Accept-Ranges": "bytes" };

export const mapVersionYearsApiRoute = new URLPattern({
  pathname: "/api/:version",
});

export const mapDataVersionYearsRoute = async (
  request: Request
): Promise<Response> => {
  const url = mapVersionYearsApiRoute.exec(request.url);
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

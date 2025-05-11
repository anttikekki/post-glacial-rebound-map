import { Extent } from "ol/extent";
import { get as getProjection } from "ol/proj";
import { register as registerProj4 } from "ol/proj/proj4";
import proj4 from "proj4";

const projection = "EPSG:3067";

// OpenLayer does not support EPSG:3067 projection, that is used in Finland, out of the box.
// It needs to be configured.
export const initEPSG3067Projection = (): {
  extent: Extent;
  projection: "EPSG:3067";
} => {
  // https://epsg.io/3067
  proj4.defs(
    projection,
    "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
  );
  registerProj4(proj4);

  // Extent from NLS base map
  const extent: Extent = [50199.4814, 6582464.0358, 761274.6247, 7799839.8902];
  getProjection(projection)?.setExtent(extent);

  return { extent, projection };
};

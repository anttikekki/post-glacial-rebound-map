import "bootstrap/dist/css/bootstrap.min.css";
import OpenLayersMap from "ol/Map";
import View from "ol/View";
import { Extent } from "ol/extent";
import "ol/ol.css";
import { get as getProjection } from "ol/proj";
import { register as registerProj4 } from "ol/proj/proj4";
import proj4 from "proj4";
import LoadingAnimation from "./controls/loadingAnimation";
import { getMapControls } from "./controls/mapControls";
import { createMMLTaustakarttaLayer } from "./layer/MaanmittauslaitosTileLayer";
import PostGlacialReboundLayer from "./layer/PostGlacialReboundTileLayer";
import UserLocationVectorLayer from "./layer/UserLocationVectorLayer";

const projection = "EPSG:3067";

// https://epsg.io/3067
proj4.defs(
  projection,
  "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
registerProj4(proj4);

const extent: Extent = [50199.4814, 6582464.0358, 761274.6247, 7799839.8902];
getProjection(projection)?.setExtent(extent);

const view = new View({
  center: [385249.63630000036, 6672695.7579], // Helsinki
  projection,
  enableRotation: false,
  zoom: 5,
});
const loadingAnimation = new LoadingAnimation();

const initialYear = -6000;
const nlsBackgroundLayer = createMMLTaustakarttaLayer();
const userLocationLayer = new UserLocationVectorLayer(view);

const map = new OpenLayersMap({
  target: "map",
  layers: [nlsBackgroundLayer],
  view,
  controls: getMapControls({
    initialYear,
    loadingAnimation,
    centerToCurrentLocation: () => userLocationLayer.centerToCurrentPositions(),
    changeYear: (year) =>
      PostGlacialReboundLayer.changeYear(year, map, loadingAnimation),
  }),
});
const postGlacialReboundLayerGroup =
  PostGlacialReboundLayer.initializeLayerGroup(
    initialYear,
    map,
    loadingAnimation
  );

map.addLayer(userLocationLayer.getLayer());
map.addLayer(postGlacialReboundLayerGroup);

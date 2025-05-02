import Collection from "ol/Collection";
import Map from "ol/Map";
import View from "ol/View";
import { ScaleLine, Zoom } from "ol/control";
import { Extent } from "ol/extent";
import "ol/ol.css";
import { get as getProjection } from "ol/proj";
import { register as registerProj4 } from "ol/proj/proj4";
import proj4 from "proj4";
import YearMapButtons from "./component/yearMapButtons";
import { createMMLTaustakarttaLayer } from "./layer/MaanmittauslaitosTileLayer";
import PostGlacialReboundLayer from "./layer/PostGlacialReboundTileLayer";

// https://epsg.io/3067
proj4.defs(
  "EPSG:3067",
  "+proj=utm +zone=35 +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs"
);
registerProj4(proj4);

const extent: Extent = [50199.4814, 6582464.0358, 761274.6247, 7799839.8902];
getProjection("EPSG:3067")?.setExtent(extent);

const view = new View({
  center: [385249.63630000036, 6672695.7579], // Helsinki
  projection: "EPSG:3067",
  enableRotation: false,
  zoom: 5,
});

const nlsBackgroundLayer = createMMLTaustakarttaLayer();
const postGlacialReboundLayer = new PostGlacialReboundLayer();

const map = new Map({
  target: "map",
  layers: [nlsBackgroundLayer, postGlacialReboundLayer.getLayer()],
  view,
  controls: new Collection([
    new Zoom(),
    new ScaleLine({
      units: "metric",
    }),
    new YearMapButtons(postGlacialReboundLayer),
  ]),
});

import Collection from "ol/Collection";
import OpenLayersMap from "ol/Map";
import View from "ol/View";
import { FullScreen, ScaleLine, Zoom } from "ol/control";
import { Extent } from "ol/extent";
import "ol/ol.css";
import { get as getProjection } from "ol/proj";
import { register as registerProj4 } from "ol/proj/proj4";
import proj4 from "proj4";
import InfoButton from "./component/infoButton";
import LoadingAnimation from "./component/loadingAnimation";
import UserLocationButton from "./component/userLocationButton";
import YearMapControls from "./component/yearMapControls";
import { createMMLTaustakarttaLayer } from "./layer/MaanmittauslaitosTileLayer";
import PostGlacialReboundLayer from "./layer/PostGlacialReboundTileLayer";
import UserLocationVectorLayer from "./layer/UserLocationVectorLayer";

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
const loadingAnimation = new LoadingAnimation();

const initialYear = -6000;
const nlsBackgroundLayer = createMMLTaustakarttaLayer();
const userLocationLayer = new UserLocationVectorLayer(view);

const map = new OpenLayersMap({
  target: "map",
  layers: [nlsBackgroundLayer],
  view,
  controls: new Collection([
    new Zoom(),
    new FullScreen(),
    new ScaleLine({
      units: "metric",
    }),
    new YearMapControls(
      (year) => PostGlacialReboundLayer.changeYear(year, map, loadingAnimation),
      initialYear
    ),
    new UserLocationButton(() => userLocationLayer.centerToCurrentPositions()),
    new InfoButton(),
    loadingAnimation,
  ]),
});
const postGlacialReboundLayerGroup =
  PostGlacialReboundLayer.initializeLayerGroup(
    initialYear,
    map,
    loadingAnimation
  );

map.addLayer(userLocationLayer.getLayer());
map.addLayer(postGlacialReboundLayerGroup);

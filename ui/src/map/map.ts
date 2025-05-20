import OpenLayersMap from "ol/Map";
import View from "ol/View";
import { getMapControls } from "./controls/mapControls";
import { createMMLTaustakarttaLayer } from "./layer/MaanmittauslaitosTileLayer";
import PostGlacialReboundLayerGroup from "./layer/PostGlacialReboundTileLayerGroup";
import UserLocationVectorLayer from "./layer/UserLocationVectorLayer";
import { initEPSG3067Projection } from "./util/projectionUtil";
import { PostGlacialReboundApiVersion, Settings } from "./util/settings";

const { projection } = initEPSG3067Projection();

const view = new View({
  center: [385249.63630000036, 6672695.7579], // Helsinki
  projection,
  enableRotation: false,
  zoom: 5,
});
const nlsBackgroundLayer = createMMLTaustakarttaLayer();
const userLocationLayer = new UserLocationVectorLayer(view);
const settings = new Settings(-6000, PostGlacialReboundApiVersion.V2);

const zoom = (zoomChange: number) => {
  const zoom = view.getZoom();
  if (zoom) {
    view.animate({
      zoom: zoom + zoomChange,
      duration: 250,
    });
  }
};

const map = new OpenLayersMap({
  target: "map",
  layers: [nlsBackgroundLayer],
  view,
  controls: getMapControls({
    settings,
    centerToCurrentLocation: () => userLocationLayer.centerToCurrentPositions(),
    zoomIn: () => zoom(1),
    zoomOut: () => zoom(-1),
  }),
});
const postGlacialReboundLayerGroup = new PostGlacialReboundLayerGroup({
  settings,
  onMapRenderCompleteOnce: (fn) => map.once("rendercomplete", () => fn()),
});

map.addLayer(postGlacialReboundLayerGroup.getLayerGroup());
map.addLayer(userLocationLayer.getLayer());

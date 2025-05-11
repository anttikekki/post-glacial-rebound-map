import OpenLayersMap from "ol/Map";
import View from "ol/View";
import LoadingAnimation from "./controls/loadingAnimation";
import { getMapControls } from "./controls/mapControls";
import { createMMLTaustakarttaLayer } from "./layer/MaanmittauslaitosTileLayer";
import PostGlacialReboundLayer from "./layer/PostGlacialReboundTileLayer";
import UserLocationVectorLayer from "./layer/UserLocationVectorLayer";
import { initEPSG3067Projection } from "./util/projectionUtil";

const { projection } = initEPSG3067Projection();

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
    initialYear,
    loadingAnimation,
    centerToCurrentLocation: () => userLocationLayer.centerToCurrentPositions(),
    changeYear: (nextYear) => PostGlacialReboundLayer.changeYear(nextYear),
    zoomIn: () => zoom(1),
    zoomOut: () => zoom(-1),
  }),
});
const postGlacialReboundLayerGroup =
  PostGlacialReboundLayer.initializeLayerGroup({
    initialYear,
    onMapRenderCompleteOnce: (fn) => map.once("rendercomplete", () => fn()),
    loadingAnimation,
  });

map.addLayer(postGlacialReboundLayerGroup);
map.addLayer(userLocationLayer.getLayer());

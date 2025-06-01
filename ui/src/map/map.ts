import OpenLayersMap from "ol/Map";
import View from "ol/View";
import { getMapControls } from "./controls/mapControls";
import GlacialTileLayerGroup from "./layer/GlacialTileLayerGroup";
import { NLSBackgroundMapTileLayer } from "./layer/NLSBackgroundMapTileLayer";
import PostGlacialReboundLayerGroup from "./layer/PostGlacialReboundTileLayerGroup";
import UserLocationVectorLayer from "./layer/UserLocationVectorLayer";
import { initEPSG3067Projection } from "./util/projectionUtil";
import { Settings } from "./util/settings";
import {
  parseSettingsFromUrlHash,
  updateSettingsToUrlHash,
} from "./util/urlUtil";

const { projection } = initEPSG3067Projection();
const settings = new Settings(parseSettingsFromUrlHash());

const view = new View({
  center: settings.getMapCenter(),
  projection,
  enableRotation: false,
  zoom: settings.getZoom(),
});
const userLocationLayer = new UserLocationVectorLayer(view);
const nlsBackgroundLayer = new NLSBackgroundMapTileLayer(settings);

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
  layers: [nlsBackgroundLayer.getLayer()],
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
const glacialTileLayerGroup = new GlacialTileLayerGroup({
  settings,
  onMapRenderCompleteOnce: (fn) => map.once("rendercomplete", () => fn()),
});

map.addLayer(postGlacialReboundLayerGroup.getLayerGroup());
map.addLayer(glacialTileLayerGroup.getLayerGroup());
map.addLayer(userLocationLayer.getLayer());

settings.addEventListerner({
  onApiVersionChange: () => updateSettingsToUrlHash(settings),
  onYearChange: () => updateSettingsToUrlHash(settings),
  onBackgroundMapChange: () => updateSettingsToUrlHash(settings),
  onZoomChange: () => updateSettingsToUrlHash(settings),
  onMapCenterChange: () => updateSettingsToUrlHash(settings),
});

map.on("moveend", () => {
  const zoom = view.getZoom();
  if (zoom !== undefined) {
    settings.setZoom(zoom);
  }

  const mapCenter = view.getCenter();
  if (mapCenter) {
    settings.setMapCenter(mapCenter);
  }
});

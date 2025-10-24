import debounce from "debounce";
import OpenLayersMap from "ol/Map";
import View from "ol/View";
import { getMapControls } from "./map/controls/mapControls";
import GlacialTileLayerGroup from "./map/layer/GlacialTileLayerGroup";
import { NLSBackgroundMapTileLayer } from "./map/layer/NLSBackgroundMapTileLayer";
import PostGlacialReboundLayerGroup from "./map/layer/PostGlacialReboundTileLayerGroup";
import UserLocationVectorLayer from "./map/layer/UserLocationVectorLayer";
import { initEPSG3067Projection } from "./map/util/projectionUtil";
import { Settings } from "./map/util/settings";
import {
  parseSettingsFromUrlHash,
  updateSettingsToUrlHash,
} from "./map/util/urlUtil";

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
  onYearChange: () => updateSettingsToUrlHash(settings),
  onBackgroundMapChange: () => updateSettingsToUrlHash(settings),
  onZoomChange: () => updateSettingsToUrlHash(settings),
  onMapCenterChange: () => updateSettingsToUrlHash(settings),
  /**
   * Debounce URL updates for 500ms. Opacity slider triggers so many updates,
   * that Firefox starts to throw errors.
   */
  onLayerOpacityChange: debounce(() => updateSettingsToUrlHash(settings), 500),
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

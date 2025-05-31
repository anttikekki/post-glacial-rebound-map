import { LRUCache } from "lru-cache";
import LayerGroup from "ol/layer/Group";
import { NLSBackgroundMap, Settings } from "../util/settings";
import { isWebGLSupported } from "../util/webGLUtils";
import PostGlacialReboundLayer from "./PostGlacialReboundTileLayer";

export default class PostGlacialReboundLayerGroup {
  private readonly layerGroup = new LayerGroup();
  // Store only 5 layers to save memory. Older mobile devices crash if
  // too many layers are loaded.
  private readonly layers = new LRUCache<
    string, // "${apiVersion}_${year}"
    PostGlacialReboundLayer
  >({
    max: 5,
    dispose: (layer) => {
      this.layerGroup.getLayers().remove(layer.getLayer());
    },
  });
  private onMapRenderCompleteOnce?: (fn: () => void) => void;
  private settings: Settings;

  public constructor({
    settings,
    onMapRenderCompleteOnce,
  }: {
    settings: Settings;
    onMapRenderCompleteOnce: (fn: () => void) => void;
  }) {
    this.settings = settings;
    this.onMapRenderCompleteOnce = onMapRenderCompleteOnce;
    this.onYearOrApiVersionChange();

    this.settings.addEventListerner({
      onYearChange: () => this.onYearOrApiVersionChange(),
      onApiVersionChange: () => this.onYearOrApiVersionChange(),
      onBackgroundMapChange: (backgroundMap) =>
        this.onNLSBackgroundMapChange(backgroundMap),
    });
  }

  public getLayerGroup(): LayerGroup {
    return this.layerGroup;
  }

  private onYearOrApiVersionChange = (): void => {
    if (!isWebGLSupported()) {
      return;
    }

    const nextYear = this.settings.getYear();
    const apiVersion = this.settings.getApiVersion();
    const backgroundMap = this.settings.getBackgroundMap();

    // Hide all layers if current calendar year is selected.
    // This just shows the NLS base map.
    if (nextYear === new Date().getFullYear()) {
      this.hideAllLayers();
      return;
    }

    const cacheKey = `${apiVersion}_${nextYear}`;

    this.settings.setIsLoading(false);
    const nextLayer = this.layers.get(cacheKey);
    if (!nextLayer) {
      this.settings.setIsLoading(true);
      const newLayer = new PostGlacialReboundLayer(
        nextYear,
        apiVersion,
        backgroundMap
      );
      this.layers.set(cacheKey, newLayer);

      newLayer.getSource().once("tileloadend", () => {
        this.onMapRenderCompleteOnce?.(() => {
          this.setLayerVisible(newLayer);
          this.settings.setIsLoading(false);
        });
      });
      this.layerGroup.getLayers().push(newLayer.getLayer());
    } else {
      this.setLayerVisible(nextLayer);
    }
  };

  private setLayerVisible = (nextLayer: PostGlacialReboundLayer): void => {
    nextLayer.getLayer().setVisible(true);
    this.layers.forEach((prevLayer) => {
      if (
        (prevLayer.getYear() !== nextLayer.getYear() ||
          prevLayer.getApiVersion() !== nextLayer.getApiVersion()) &&
        prevLayer.getLayer().isVisible()
      ) {
        prevLayer.getLayer().setVisible(false);
      }
    });
  };

  private hideAllLayers = (): void => {
    this.layers.forEach((layer) => {
      layer.getLayer().setVisible(false);
    });
  };

  private onNLSBackgroundMapChange(backgroundMap: NLSBackgroundMap) {
    this.layers.forEach((layer) => {
      layer.updateLayerStyle(backgroundMap);
    });
  }
}

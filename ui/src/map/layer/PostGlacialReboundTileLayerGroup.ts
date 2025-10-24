import { LRUCache } from "lru-cache";
import LayerGroup from "ol/layer/Group";
import { isMobileDevice } from "../util/deviceDetectionUtil";
import { Settings } from "../util/settings";
import { isWebGLSupported } from "../util/webGLUtils";
import PostGlacialReboundLayer from "./PostGlacialReboundTileLayer";

export default class PostGlacialReboundLayerGroup {
  private readonly layerGroup = new LayerGroup();
  // Store only 5 layers to save memory. Older mobile devices crash if
  // too many layers are loaded.
  private readonly layers = new LRUCache<
    string, // "year"
    PostGlacialReboundLayer
  >({
    max: isMobileDevice() ? 5 : 10,
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
    this.onYearChange();

    this.settings.addEventListerner({
      onYearChange: () => this.onYearChange(),
      onBackgroundMapChange: () => this.onNLSBackgroundMapChange(),
      onZoomChange: () => this.onZoomChange(),
      onLayerOpacityChange: () => this.onLayerOpacityChange(),
    });
  }

  public getLayerGroup(): LayerGroup {
    return this.layerGroup;
  }

  private onYearChange = (): void => {
    if (!isWebGLSupported()) {
      return;
    }

    const nextYear = this.settings.getYear();

    // Hide all layers if current calendar year is selected.
    // This just shows the NLS base map.
    if (nextYear === new Date().getFullYear()) {
      this.hideAllLayers();
      return;
    }

    const cacheKey = String(nextYear);

    this.settings.setIsLoading(false);
    const nextLayer = this.layers.get(cacheKey);
    if (!nextLayer) {
      this.settings.setIsLoading(true);
      const newLayer = new PostGlacialReboundLayer(nextYear, this.settings);
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
        prevLayer.getYear() !== nextLayer.getYear() &&
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

  private onNLSBackgroundMapChange() {
    this.layers.forEach((layer) => {
      layer.updateLayerStyle(this.settings);
    });
  }

  private onZoomChange() {
    this.layers.forEach((layer) => {
      layer.updateLayerStyle(this.settings);
    });
  }

  private onLayerOpacityChange() {
    this.layers.forEach((layer) => {
      layer.onLayerOpacityChange(this.settings);
    });
  }
}

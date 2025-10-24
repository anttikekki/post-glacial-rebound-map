import { LRUCache } from "lru-cache";
import LayerGroup from "ol/layer/Group";
import { isMobileDevice } from "../util/deviceDetectionUtil";
import { Settings } from "../util/settings";
import { isWebGLSupported } from "../util/webGLUtils";
import GlacialTileLayer from "./GlacialTileLayer";

export default class GlacialTileLayerGroup {
  private readonly layerGroup = new LayerGroup();
  // Store only 5 layers to save memory. Older mobile devices crash if
  // too many layers are loaded.
  private readonly layers = new LRUCache<
    number, // Year
    GlacialTileLayer
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

    // Next year is not supported year for ice. Hide layer and return.
    if (!this.settings.getSupportedIceYears().includes(nextYear)) {
      this.hideAllLayers();
      return;
    }

    const nextLayer = this.layers.get(nextYear);
    if (!nextLayer) {
      const newLayer = new GlacialTileLayer(nextYear, this.settings);
      this.layers.set(nextYear, newLayer);

      newLayer.getSource().once("tileloadend", () => {
        this.onMapRenderCompleteOnce?.(() => {
          this.setLayerVisible(newLayer);
        });
      });
      this.layerGroup.getLayers().push(newLayer.getLayer());
    } else {
      this.setLayerVisible(nextLayer);
    }
  };

  private setLayerVisible = (nextLayer: GlacialTileLayer): void => {
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

  private onLayerOpacityChange() {
    this.layers.forEach((layer) => {
      layer.onLayerOpacityChange(this.settings);
    });
  }
}

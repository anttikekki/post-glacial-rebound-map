import { LRUCache } from "lru-cache";
import LayerGroup from "ol/layer/Group";
import { Settings } from "../util/settings";
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
    });
  }

  public getLayerGroup(): LayerGroup {
    return this.layerGroup;
  }

  public onYearOrApiVersionChange = (): void => {
    const nextYear = this.settings.getYear();
    const apiVersion = this.settings.getApiVersion();

    // Hide all layers if current year is selected. This just shows the NLS base map.
    if (nextYear === new Date().getFullYear()) {
      this.layers.forEach((layer) => {
        layer.getLayer().setVisible(false);
      });
      return;
    }

    const cacheKey = `${apiVersion}_${nextYear}`;

    this.settings.setIsLoading(false);
    const nextLayer = this.layers.get(cacheKey);
    if (!nextLayer) {
      this.settings.setIsLoading(true);
      const newLayer = new PostGlacialReboundLayer(nextYear, apiVersion);
      this.layers.set(cacheKey, newLayer);

      newLayer.getSource().once("tileloadend", () => {
        this.onMapRenderCompleteOnce?.(() => {
          this.setPostGlacialReboundLayerVisible(newLayer);
          this.settings.setIsLoading(false);
        });
      });
      this.layerGroup.getLayers().push(newLayer.getLayer());
    } else {
      this.setPostGlacialReboundLayerVisible(nextLayer);
    }
  };

  private setPostGlacialReboundLayerVisible = (
    nextLayer: PostGlacialReboundLayer
  ): void => {
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
}

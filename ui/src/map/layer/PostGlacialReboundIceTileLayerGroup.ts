import LayerGroup from "ol/layer/Group";
import { Settings } from "../util/settings";
import PostGlacialReboundIceTileLayer from "./PostGlacialReboundIceTileLayer";

export default class PostGlacialReboundIceTileLayerGroup {
  private readonly layerGroup = new LayerGroup();
  private layer?: PostGlacialReboundIceTileLayer;
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
    });
  }

  public getLayerGroup(): LayerGroup {
    return this.layerGroup;
  }

  public onYearChange = (): void => {
    const nextYear = this.settings.getYear();

    // Next year is not supported year for ice, remove layer and return
    if (!this.settings.getSupportedIceYears().includes(nextYear)) {
      if (this.layer) {
        this.layerGroup.getLayers().remove(this.layer.getLayer());
        this.layer = undefined;
      }
      return;
    }

    // Same year as current ice layer, do nothing
    if (this.layer?.getYear() === nextYear) {
      return;
    }

    this.settings.setIsLoading(true);

    const oldLayer = this.layer;
    const newLayer = new PostGlacialReboundIceTileLayer(nextYear);
    this.layer = newLayer;

    newLayer.getSource().once("tileloadend", () => {
      this.onMapRenderCompleteOnce?.(() => {
        if (oldLayer) {
          this.layerGroup.getLayers().remove(oldLayer?.getLayer());
        }
        this.settings.setIsLoading(false);
      });
    });
    this.layerGroup.getLayers().push(newLayer.getLayer());
  };
}

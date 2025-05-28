import LayerGroup from "ol/layer/Group";
import { PostGlacialReboundApiVersion, Settings } from "../util/settings";
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

    // Next year is not supported year for ice or api version is not Glare (V2),
    // remove layer and return
    if (
      !this.settings.getSupportedIceYears().includes(nextYear) ||
      apiVersion !== PostGlacialReboundApiVersion.V2
    ) {
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

    const oldLayer = this.layer;
    const newLayer = new PostGlacialReboundIceTileLayer(nextYear);
    this.layer = newLayer;

    newLayer.getSource().once("tileloadend", () => {
      this.onMapRenderCompleteOnce?.(() => {
        if (oldLayer) {
          this.layerGroup.getLayers().remove(oldLayer?.getLayer());
        }
      });
    });
    this.layerGroup.getLayers().push(newLayer.getLayer());
  };
}

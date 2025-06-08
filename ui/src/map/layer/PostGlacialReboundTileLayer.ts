import { deepEqual } from "fast-equals";
import WebGLTileLayer, { Style } from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import { isMobileDevice } from "../util/deviceDetectionUtil";
import {
  NLSBackgroundMap,
  PostGlacialReboundApiVersion,
  Settings,
} from "../util/settings";

export default class PostGlacialReboundLayer {
  private readonly year: number;
  private readonly apiVersion: PostGlacialReboundApiVersion;
  private readonly source: GeoTIFF;
  private readonly layer: WebGLTileLayer;
  private style: Style;

  public constructor(
    year: number,
    apiVersion: PostGlacialReboundApiVersion,
    settings: Settings
  ) {
    this.year = year;
    this.apiVersion = apiVersion;

    const host = process.env.MAANNOUSU_API_BASE_URL ?? "https://maannousu.info";
    this.source = new GeoTIFF({
      sources: [
        {
          url: `${host}/api/${this.apiVersion}/${this.year}`,
          bands: [1],
        },
      ],
      sourceOptions: {
        /**
         * Decrease block cache size from default 100 to 25 to save memory. One block is 64 kb.
         * Older mobile devices crash if too much data is loaded into memory.
         */
        cacheSize: isMobileDevice() ? 25 : 50,
      },
      convertToRGB: false,
      normalize: false,
      interpolate: false,
    });

    this.style = this.createStyle(settings);
    this.layer = new WebGLTileLayer({
      source: this.source,
      style: this.style,
      visible: true,
      opacity: settings.getLayerOpacity(),
    });
  }

  public getYear(): number {
    return this.year;
  }

  public getApiVersion(): PostGlacialReboundApiVersion {
    return this.apiVersion;
  }

  public getLayer(): WebGLTileLayer {
    return this.layer;
  }

  public getSource(): GeoTIFF {
    return this.source;
  }

  public onLayerOpacityChange(settings: Settings) {
    this.layer.setOpacity(settings.getLayerOpacity());
  }

  public updateLayerStyle(settings: Settings): void {
    const newStyle = this.createStyle(settings);

    if (newStyle !== this.style) {
      this.style = newStyle;
      this.layer.setStyle(newStyle);
    }
  }

  private createStyle(settings: Settings): Style {
    const colorLand = [0, 0, 0, 0]; // Invisible
    const noData = [0, 0, 0, 0]; // Invisible
    const colorIce = [255, 255, 255, 1]; // White

    /**
     * Change sea color based on selected National Land Survey of Finland
     * background map type and zoom level.
     */
    const colorSea = ((): number[] => {
      switch (settings.getBackgroundMap()) {
        case NLSBackgroundMap.TopographicMap: {
          const zoom = settings.getZoom();

          if (zoom <= 4.6) {
            return [153, 224, 255, 1];
          }
          if (zoom > 4.6 && zoom < 7) {
            return [153, 255, 255, 1];
          }
          if (zoom >= 7) {
            return [128, 255, 255, 1];
          }
        }
        case NLSBackgroundMap.BackgroundMap:
          return [201, 236, 250, 1];
        case NLSBackgroundMap.Orthophotos:
          return [0, 0, 52, 1];
      }
    })();

    const newStyle: Style = {
      color: [
        "case",
        ["==", ["band", 1], 0], // Value 0 = land
        colorLand,
        ["==", ["band", 1], 1], // Value 1 = sea
        colorSea,
        ["==", ["band", 1], 2], // Value 2 = Glacial ice
        colorIce,
        noData, // Fallback
      ],
    };

    // No changes in style, return the current one
    if (deepEqual(newStyle, this.style)) {
      return this.style;
    }

    return newStyle;
  }
}

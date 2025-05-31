import WebGLTileLayer, { Style } from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import {
  NLSBackgroundMap,
  PostGlacialReboundApiVersion,
} from "../util/settings";

export default class PostGlacialReboundLayer {
  private readonly year: number;
  private readonly apiVersion: PostGlacialReboundApiVersion;
  private readonly source: GeoTIFF;
  private readonly layer: WebGLTileLayer;

  public constructor(
    year: number,
    apiVersion: PostGlacialReboundApiVersion,
    backgroundMap: NLSBackgroundMap
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
         * Decrease cache size from default 100 to 50 tiles to save memory.
         * Older mobile devices crash if too many layers and tiles are loaded into memory.
         */
        cacheSize: 50,
      },
      convertToRGB: false,
      normalize: false,
    });

    this.layer = new WebGLTileLayer({
      source: this.source,
      style: this.createStyle(backgroundMap),
      visible: true,
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

  public updateLayerStyle(backgroundMap: NLSBackgroundMap): void {
    this.layer.setStyle(this.createStyle(backgroundMap));
  }

  private createStyle(backgroundMap: NLSBackgroundMap): Style {
    const colorLand = [0, 0, 0, 0]; // Invisible
    const noData = [0, 0, 0, 0]; // Invisible

    /**
     * Change sea color based on selected National Land Survey of Finland
     * background map type.
     */
    const colorSea = ((): number[] => {
      switch (backgroundMap) {
        case NLSBackgroundMap.TopographicMap:
          return [177, 252, 254, 1];
        case NLSBackgroundMap.BackgroundMap:
          return [201, 236, 250, 1];
        case NLSBackgroundMap.Orthophotos:
          return [31, 32, 58, 1];
      }
    })();

    return {
      color: [
        "case",
        ["==", ["band", 1], 0], // Value 0 = land
        colorLand,
        ["==", ["band", 1], 1], // Value 1 = sea
        colorSea,
        noData, // Fallback
      ],
    };
  }
}

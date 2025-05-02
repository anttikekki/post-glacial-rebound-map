import WebGLTileLayer from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";

export default class PostGlacialReboundLayer {
  private source: GeoTIFF;
  private readonly layer: WebGLTileLayer;

  public constructor() {
    this.source = PostGlacialReboundLayer.createGeoTIFFSource(-6000);

    const colorLand = [0, 0, 0, 0];
    const colorSea = [201, 236, 250, 1]; // National Land Survey of Finland background map sea color
    const noData = [0, 0, 0, 0];

    this.layer = new WebGLTileLayer({
      source: this.source,
      style: {
        color: [
          "case",
          ["==", ["band", 1], 0],
          colorLand,
          ["==", ["band", 1], 1],
          colorSea,
          noData, // Fallback
        ],
      },
    });
  }

  public getLayer(): WebGLTileLayer {
    return this.layer;
  }

  public changeYear(year: number): void {
    this.source = PostGlacialReboundLayer.createGeoTIFFSource(year);
    this.layer.setSource(this.source);
  }

  private static createGeoTIFFSource(year: number): GeoTIFF {
    return new GeoTIFF({
      sources: [
        {
          url: `http://localhost:3000/api/V1/${year}/`,
          //url: "https://maannousu.info/api/V1/-3000",
          bands: [1],
        },
      ],
      convertToRGB: false,
      normalize: false,
    });
  }
}

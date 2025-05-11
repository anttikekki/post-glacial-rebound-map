import LayerGroup from "ol/layer/Group";
import WebGLTileLayer, { Style } from "ol/layer/WebGLTile";
import OpenLayersMap from "ol/Map";
import { GeoTIFF } from "ol/source";
import LoadingAnimation from "../component/loadingAnimation";

const colorLand = [0, 0, 0, 0]; // Invisible
const colorSea = [201, 236, 250, 1]; // National Land Survey of Finland background map sea color
const noData = [0, 0, 0, 0]; // Invisible
const style: Style = {
  color: [
    "case",
    ["==", ["band", 1], 0], // Value 0 = land
    colorLand,
    ["==", ["band", 1], 1], // Value 1 = sea
    colorSea,
    noData, // Fallback
  ],
};

export default class PostGlacialReboundLayer {
  private readonly year: number;
  private readonly source: GeoTIFF;
  private readonly layer: WebGLTileLayer;

  private constructor(year: number) {
    this.year = year;

    const host = process.env.MAANNOUSU_API ?? "https://maannousu.info";
    this.source = new GeoTIFF({
      sources: [
        {
          url: `${host}/api/v1/${this.year}`,
          bands: [1],
        },
      ],
      convertToRGB: false,
      normalize: false,
    });

    this.layer = new WebGLTileLayer({
      source: this.source,
      style,
      visible: true,
    });
  }

  public getYear(): number {
    return this.year;
  }

  public getLayer(): WebGLTileLayer {
    return this.layer;
  }

  private static readonly layers = new Map<number, PostGlacialReboundLayer>();
  private static readonly layerGroup = new LayerGroup();

  public static getLayer(year: number): PostGlacialReboundLayer {
    const layer = this.layers.get(year);
    if (!layer) {
      throw new Error(`No layer created for year ${year}`);
    }
    return layer;
  }

  public static changeYear = (
    nextYear: number,
    map: OpenLayersMap,
    loadingAnimation: LoadingAnimation
  ): void => {
    // Hide all layers if current year is selected. This just shows the NLS base map.
    if (nextYear === new Date().getFullYear()) {
      this.layers.forEach((layer) => {
        layer.getLayer().setVisible(false);
      });
      return;
    }

    loadingAnimation.setVisible(false);
    const nextLayer = PostGlacialReboundLayer.layers.get(nextYear);
    if (!nextLayer) {
      loadingAnimation.setVisible(true);
      const newLayer = new PostGlacialReboundLayer(nextYear);
      this.layers.set(nextYear, newLayer);

      newLayer.source.once("tileloadend", () => {
        map.once("rendercomplete", () => {
          this.setPostGlacialReboundLayerVisible(newLayer);
          loadingAnimation.setVisible(false);
        });
      });
      this.layerGroup.getLayers().push(newLayer.layer);
    } else {
      this.setPostGlacialReboundLayerVisible(nextLayer);
    }
  };

  private static setPostGlacialReboundLayerVisible = (
    nextLayer: PostGlacialReboundLayer
  ): void => {
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

  public static initializeLayerGroup(
    initialYear: number,
    map: OpenLayersMap,
    loadingAnimation: LoadingAnimation
  ): LayerGroup {
    map.addLayer(this.layerGroup);
    this.changeYear(initialYear, map, loadingAnimation);
    return this.layerGroup;
  }
}

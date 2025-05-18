import { LRUCache } from "lru-cache";
import LayerGroup from "ol/layer/Group";
import WebGLTileLayer, { Style } from "ol/layer/WebGLTile";
import { GeoTIFF } from "ol/source";
import { PostGlacialReboundApiVersion, Settings } from "../util/settings";

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
  private readonly apiVersion: PostGlacialReboundApiVersion;
  private readonly source: GeoTIFF;
  private readonly layer: WebGLTileLayer;

  private constructor(year: number, apiVersion: PostGlacialReboundApiVersion) {
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
      style,
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

  private static readonly layerGroup = new LayerGroup();
  // Store only 5 layers to save memory. Older mobile devices crash if
  // too many layers are loaded.
  private static readonly layers = new LRUCache<
    string, // "${apiVersion}_${year}"
    PostGlacialReboundLayer
  >({
    max: 5,
    dispose: (layer) => {
      this.layerGroup.getLayers().remove(layer.getLayer());
    },
  });
  private static onMapRenderCompleteOnce?: (fn: () => void) => void;
  private static settings: Settings;

  public static initializeLayerGroup({
    settings,
    onMapRenderCompleteOnce,
  }: {
    settings: Settings;
    onMapRenderCompleteOnce: (fn: () => void) => void;
  }): LayerGroup {
    this.settings = settings;
    this.onMapRenderCompleteOnce = onMapRenderCompleteOnce;
    this.onYearOrApiVersionChange();
    return this.layerGroup;
  }

  public static onYearOrApiVersionChange = (): void => {
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
    const nextLayer = PostGlacialReboundLayer.layers.get(cacheKey);
    if (!nextLayer) {
      this.settings.setIsLoading(true);
      const newLayer = new PostGlacialReboundLayer(nextYear, apiVersion);
      this.layers.set(cacheKey, newLayer);

      newLayer.source.once("tileloadend", () => {
        this.onMapRenderCompleteOnce?.(() => {
          this.setPostGlacialReboundLayerVisible(newLayer);
          this.settings.setIsLoading(false);
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
        (prevLayer.getYear() !== nextLayer.getYear() ||
          prevLayer.getApiVersion() !== nextLayer.getApiVersion()) &&
        prevLayer.getLayer().isVisible()
      ) {
        prevLayer.getLayer().setVisible(false);
      }
    });
  };
}

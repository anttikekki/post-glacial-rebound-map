import { Feature, Geolocation, View } from "ol";
import { Geometry, Point } from "ol/geom";
import VectorLayer from "ol/layer/Vector";
import VectorSource from "ol/source/Vector";
import { Circle, Fill, Stroke, Style } from "ol/style";

export default class UserLocationVectorLayer {
  private readonly view: View;
  private readonly source: VectorSource;
  private readonly layer: VectorLayer;
  private geolocation: Geolocation | undefined;
  private currentPositionFeature?: Feature<Geometry>;

  public constructor(view: View) {
    this.view = view;
    this.source = new VectorSource();
    this.layer = new VectorLayer({
      source: this.source,
    });
  }

  private initGeolocation(): void {
    this.geolocation = new Geolocation({
      projection: this.view.getProjection(),
      tracking: true,
      trackingOptions: {
        enableHighAccuracy: true,
      },
    });
    this.geolocation.once("change:position", this.centerToCurrentPositions);
    this.geolocation.on("change:position", this.geolocationChanged);
  }

  public getLayer(): VectorLayer {
    return this.layer;
  }

  public centerToCurrentPositions = () => {
    if (!this.geolocation) {
      this.initGeolocation();
    }

    const position = this.geolocation?.getPosition();
    if (position) {
      this.view.setCenter(position);
    }
  };

  private geolocationChanged = () => {
    const coordinates = this.geolocation?.getPosition();
    if (!coordinates) {
      return;
    }

    if (this.currentPositionFeature) {
      this.currentPositionFeature.setGeometry(new Point(coordinates));
      return;
    }

    const fill = new Fill({
      color: "rgba(0, 0, 255, 1.0)",
    });
    const stroke = new Stroke({
      color: "rgba(255, 255, 255, 1.0)",
      width: 3,
    });

    this.currentPositionFeature = new Feature({
      geometry: new Point(coordinates),
    });
    this.currentPositionFeature.setStyle(
      new Style({
        image: new Circle({
          fill: fill,
          stroke: stroke,
          radius: 7,
        }),
        fill: fill,
        stroke: stroke,
      })
    );

    this.source.addFeature(this.currentPositionFeature);
  };
}

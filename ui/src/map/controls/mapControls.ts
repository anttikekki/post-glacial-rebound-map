import "bootstrap-icons/font/bootstrap-icons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Collection } from "ol";
import { ScaleLine } from "ol/control";
import InfoButton from "./infoButton";
import LoadingAnimation from "./loadingAnimation";
import "./mapControls.css";
import UserLocationButton from "./userLocationButton";
import YearMapControls from "./yearMapControls";
import ZoomInButton from "./zoomInButton";
import ZoomOutButton from "./zoomOutButton";

export const getMapControls = ({
  initialYear,
  changeYear,
  zoomIn,
  zoomOut,
  centerToCurrentLocation,
  loadingAnimation,
}: {
  initialYear: number;
  zoomIn: () => void;
  zoomOut: () => void;
  changeYear: (year: number) => void;
  centerToCurrentLocation: () => void;
  loadingAnimation: LoadingAnimation;
}) => {
  return new Collection([
    new ZoomInButton(zoomIn),
    new ZoomOutButton(zoomOut),
    new ScaleLine({
      units: "metric",
    }),
    new YearMapControls(changeYear, initialYear),
    new UserLocationButton(centerToCurrentLocation),
    new InfoButton(),
    loadingAnimation,
  ]);
};

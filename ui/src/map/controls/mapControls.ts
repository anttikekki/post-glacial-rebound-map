import "bootstrap-icons/font/bootstrap-icons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Collection } from "ol";
import { ScaleLine } from "ol/control";
import "ol/ol.css"; // This is just for ScaleLine styles
import { Settings } from "../util/settings";
import InfoButton from "./infoButton";
import LoadingAnimation from "./loadingAnimation";
import "./mapControls.css";
import ModelSelectionButton from "./modelSelectionButton";
import UserLocationButton from "./userLocationButton";
import YearMapControls from "./yearMapControls";
import ZoomInButton from "./zoomInButton";
import ZoomOutButton from "./zoomOutButton";

export const getMapControls = ({
  settings,
  zoomIn,
  zoomOut,
  centerToCurrentLocation,
}: {
  settings: Settings;
  zoomIn: () => void;
  zoomOut: () => void;
  centerToCurrentLocation: () => void;
}) => {
  return new Collection([
    new ZoomInButton(zoomIn),
    new ZoomOutButton(zoomOut),
    new ScaleLine({
      units: "metric",
    }),
    new YearMapControls(settings),
    new UserLocationButton(centerToCurrentLocation),
    new InfoButton(),
    new ModelSelectionButton(settings),
    new LoadingAnimation(settings),
  ]);
};

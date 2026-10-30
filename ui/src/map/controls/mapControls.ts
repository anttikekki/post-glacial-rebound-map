import "bootstrap-icons/font/bootstrap-icons.min.css";
import "bootstrap/dist/css/bootstrap.min.css";
import { Collection } from "ol";
import { ScaleLine } from "ol/control";
import Control from "ol/control/Control";
import "ol/ol.css"; // This is just for ScaleLine styles
import { mapTrans } from "../translations";
import { Settings } from "../util/settings";
import BackgoundMapSelectionButton from "./backgoundMapSelectionButton";
import { createIconButton } from "./createIconButton";
import LoadingAnimation from "./loadingAnimation";
import "./mapControls.css";
import WebGLSupportErrorMessage from "./webGLSupportErrorMessage";
import YearMapControls from "./yearMapControls";

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
  const buttonContainer = document.createElement("div");
  buttonContainer.className = "map-buttons";

  const buttons = [
    createIconButton({
      icon: "zoom-in",
      title: mapTrans.zoomIn,
      onClick: zoomIn,
    }),
    createIconButton({
      icon: "zoom-out",
      title: mapTrans.zoomOut,
      onClick: zoomOut,
    }),
    createIconButton({
      icon: "crosshair",
      title: mapTrans.userLocationButtonTitle,
      onClick: centerToCurrentLocation,
    }),
    createIconButton({
      icon: "info-circle",
      title: mapTrans.infoButton.title,
      onClick: () => window.open(mapTrans.infoButton.mainPageLink, "_blank"),
    }),
    new BackgoundMapSelectionButton(settings),
  ];
  buttons.forEach((button) => button.setTarget(buttonContainer));

  return new Collection([
    new Control({ element: buttonContainer }),
    ...buttons,
    new ScaleLine({
      units: "metric",
    }),
    new YearMapControls(settings),
    new LoadingAnimation(settings),
    new WebGLSupportErrorMessage(),
  ]);
};

import { Collection } from "ol";
import { FullScreen, ScaleLine, Zoom } from "ol/control";
import InfoButton from "./infoButton";
import LoadingAnimation from "./loadingAnimation";
import UserLocationButton from "./userLocationButton";
import YearMapControls from "./yearMapControls";

export const getMapControls = ({
  initialYear,
  changeYear,
  centerToCurrentLocation,
  loadingAnimation,
}: {
  initialYear: number;
  changeYear: (year: number) => void;
  centerToCurrentLocation: () => void;
  loadingAnimation: LoadingAnimation;
}) => {
  return new Collection([
    new Zoom(),
    new FullScreen(),
    new ScaleLine({
      units: "metric",
    }),
    new YearMapControls(changeYear, initialYear),
    new UserLocationButton(centerToCurrentLocation),
    new InfoButton(),
    loadingAnimation,
  ]);
};

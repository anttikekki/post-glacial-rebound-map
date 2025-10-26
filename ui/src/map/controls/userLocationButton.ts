import Control from "ol/control/Control";
import { mapTrans } from "../translations";

export default class UserLocationButton extends Control {
  public constructor(centerToCurrentLocation: () => void) {
    const icon = document.createElement("i");
    icon.className = "bi bi-crosshair";

    const button = document.createElement("button");
    button.title = mapTrans.userLocationButtonTitle;
    button.className = "user-location-button btn btn-info btn-sm";
    button.appendChild(icon);

    super({ element: button });

    button.addEventListener("click", () => {
      centerToCurrentLocation();
    });
  }
}

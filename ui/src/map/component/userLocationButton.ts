import Control from "ol/control/Control";
import "./userLocationButton.css";

export default class UserLocationButton extends Control {
  public constructor(centerToCurrentLocation: () => void) {
    const button = document.createElement("button");
    button.title = "Keskitä kartta nykyiseen sijaintiin";
    button.innerHTML = "📍";

    const element = document.createElement("div");
    element.className = "user-location-button ol-unselectable ol-control";
    element.appendChild(button);
    super({ element });

    button.addEventListener("click", () => {
      centerToCurrentLocation();
    });
  }
}

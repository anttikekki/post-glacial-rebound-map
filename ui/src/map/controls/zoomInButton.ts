import Control from "ol/control/Control";
import { mapTrans } from "../translations";

export default class ZoomInButton extends Control {
  public constructor(zoomIn: () => void) {
    const icon = document.createElement("i");
    icon.className = "bi bi-zoom-in";

    const button = document.createElement("button");
    button.title = mapTrans.zoomIn;
    button.className = "zoom-in-button btn btn-info btn-sm";
    button.appendChild(icon);

    super({ element: button });

    button.addEventListener("click", () => {
      zoomIn();
    });
  }
}

import Control from "ol/control/Control";

export default class ZoomOutButton extends Control {
  public constructor(zoomOut: () => void) {
    const icon = document.createElement("i");
    icon.className = "bi bi-zoom-out";

    const button = document.createElement("button");
    button.title = "Loitonna";
    button.className = "zoom-out-button btn btn-info btn-sm";
    button.appendChild(icon);

    super({ element: button });

    button.addEventListener("click", () => {
      zoomOut();
    });
  }
}

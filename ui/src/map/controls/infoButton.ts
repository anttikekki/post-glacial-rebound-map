import Control from "ol/control/Control";
import { mapTrans } from "../translations";

export default class InfoButton extends Control {
  public constructor() {
    const icon = document.createElement("i");
    icon.className = "bi bi-info-circle";

    const button = document.createElement("button");
    button.title = mapTrans.infoButton.title;
    button.className = "info-button btn btn-info btn-sm";
    button.appendChild(icon);

    super({ element: button });

    button.addEventListener("click", () => {
      window.open(mapTrans.infoButton.mainPageLink, "_blank");
    });
  }
}

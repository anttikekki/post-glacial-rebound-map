import Control from "ol/control/Control";
import "./infoButton.css";

export default class InfoButton extends Control {
  public constructor() {
    const button = document.createElement("button");
    button.title = "Lisätietoa sivustosta";
    button.innerHTML = "ℹ️";

    const element = document.createElement("div");
    element.className = "info-button ol-unselectable ol-control";
    element.appendChild(button);
    super({ element });

    button.addEventListener("click", () => {
      window.open("/", "_blank");
    });
  }
}

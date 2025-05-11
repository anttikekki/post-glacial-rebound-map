import Control from "ol/control/Control";
import "./loadingAnimation.css";

export default class LoadingAnimation extends Control {
  private readonly spinner: HTMLDivElement;

  constructor() {
    const spinner = document.createElement("div");
    spinner.className = "spinner";

    super({ element: spinner });
    this.spinner = spinner;
  }

  public setVisible(visibile: boolean) {
    if (visibile) {
      this.spinner.classList.remove("hidden");
    } else {
      this.spinner.classList.add("hidden");
    }
  }
}

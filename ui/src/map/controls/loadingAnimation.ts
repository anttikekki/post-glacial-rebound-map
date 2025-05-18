import Control from "ol/control/Control";
import { Settings } from "../util/settings";
import "./loadingAnimation.css";

export default class LoadingAnimation extends Control {
  private readonly spinner: HTMLDivElement;

  constructor(settings: Settings) {
    const spinner = document.createElement("div");
    spinner.className = "spinner";

    super({ element: spinner });
    this.spinner = spinner;

    settings.addEventListerner({
      onLoadingStatusChange: (isLoading) => this.setVisible(isLoading),
    });
  }

  private setVisible(visibile: boolean) {
    if (visibile) {
      this.spinner.classList.remove("hidden");
    } else {
      this.spinner.classList.add("hidden");
    }
  }
}

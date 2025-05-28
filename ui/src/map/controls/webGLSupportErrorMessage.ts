import Control from "ol/control/Control";
import { isWebGLSupported } from "../util/webGLUtils";

export default class WebGLSupportErrorMessage extends Control {
  public constructor() {
    const alert = document.createElement("div");
    alert.className = "alert alert-danger";
    alert.innerText =
      "Selaimesi ei tue WebGL-teknologiaa, jota tarvitaan tämän sivuston karttojen näyttämisessä. Sivusto ei valitettavasti toimi laitteellasi.";

    super({ element: !isWebGLSupported() ? alert : undefined });
  }
}

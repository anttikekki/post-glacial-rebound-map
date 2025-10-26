import Control from "ol/control/Control";
import { mapTrans } from "../translations";
import { isWebGLSupported } from "../util/webGLUtils";

export default class WebGLSupportErrorMessage extends Control {
  public constructor() {
    const alert = document.createElement("div");
    alert.className = "alert alert-danger";
    alert.innerText = mapTrans.webGlErrorMessage;

    super({ element: !isWebGLSupported() ? alert : undefined });
  }
}

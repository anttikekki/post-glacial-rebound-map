import Control from "ol/control/Control";
import { mapTrans } from "../translations";

export default class ServiceOutageNotice extends Control {
  public constructor() {
    const notice = document.createElement("div");
    notice.id = "service-outage-notice";
    notice.className = "alert alert-warning alert-dismissible shadow-sm";
    notice.setAttribute("role", "alert");

    const closeButton = document.createElement("button");
    closeButton.type = "button";
    closeButton.className = "btn-close";
    closeButton.setAttribute("aria-label", mapTrans.serviceOutage.close);
    closeButton.addEventListener("click", () => notice.remove());

    const content = document.createElement("div");
    content.className = "d-flex gap-2";

    const icon = document.createElement("i");
    icon.className = "bi bi-exclamation-triangle-fill";
    icon.setAttribute("aria-hidden", "true");

    const text = document.createElement("div");
    const title = document.createElement("strong");
    title.textContent = mapTrans.serviceOutage.title;

    const description = document.createElement("p");
    description.className = "mt-1 mb-2";
    description.textContent = mapTrans.serviceOutage.description;

    const link = document.createElement("a");
    link.className = "alert-link";
    link.href = mapTrans.serviceOutage.url;
    link.textContent = mapTrans.serviceOutage.link;

    text.append(title, description, link);
    content.append(icon, text);
    notice.append(closeButton, content);

    super({ element: notice });
  }
}

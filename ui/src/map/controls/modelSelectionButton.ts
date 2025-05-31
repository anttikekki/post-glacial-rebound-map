import { Popover } from "bootstrap";
import Control from "ol/control/Control";
import { PostGlacialReboundApiVersion, Settings } from "../util/settings";

export default class ModelSelectionButton extends Control {
  public constructor(settings: Settings) {
    const icon = document.createElement("i");
    icon.className = "bi bi-layers";

    const button = document.createElement("button");
    button.title = "Valitse maannousun laskentamalli";
    button.className = "model-selection-button btn btn-info btn-sm";
    button.setAttribute("data-bs-toggle", "popover");
    button.appendChild(icon);

    super({ element: button });

    const popOverContent = document.createElement("form");
    const v1Input = getModelSelectRadioInput(
      "lineaarinen maannousu NKG2016LU mallin perusteella",
      PostGlacialReboundApiVersion.V1,
      settings
    );

    const v2Input = getModelSelectRadioInput(
      "Glacial Land Adjustment Regenerator (Glare)",
      PostGlacialReboundApiVersion.V2,
      settings
    );

    popOverContent.appendChild(v1Input);
    popOverContent.appendChild(v2Input);

    new Popover(button, {
      content: popOverContent,
      html: true,
      sanitize: false,
      placement: "right",
    });
  }
}

const getModelSelectRadioInput = (
  name: string,
  apiVersion: PostGlacialReboundApiVersion,
  settings: Settings
) => {
  const formCheck = document.createElement("div");
  formCheck.className = "form-check";

  const inputId = `model-selection-${apiVersion}`;

  const input = document.createElement("input");
  input.type = "radio";
  input.name = "model-selection";
  input.className = "form-check-input";
  input.id = inputId;
  input.onchange = () => {
    settings.setApiVersion(apiVersion);
  };
  input.checked = settings.getApiVersion() === apiVersion;

  const label = document.createElement("label");
  label.htmlFor = inputId;
  label.className = "form-check-label";

  const labelHeading = document.createElement("b");
  labelHeading.innerText = `Laskentamalli ${apiVersion.toUpperCase()}: `;

  const docLink = document.createElement("a");
  docLink.innerText = "lisää tietoa";
  docLink.target = "_blank";
  docLink.href = `model-${apiVersion.toLowerCase()}.html`;

  label.append(
    labelHeading,
    document.createTextNode(`${name} (`),
    docLink,
    document.createTextNode(")")
  );

  formCheck.appendChild(input);
  formCheck.appendChild(label);

  return formCheck;
};

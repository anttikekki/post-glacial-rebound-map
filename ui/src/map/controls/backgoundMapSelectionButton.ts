import { Popover } from "bootstrap";
import Control from "ol/control/Control";
import { NLSBackgroundMap, Settings } from "../util/settings";

export default class BackgoundMapSelectionButton extends Control {
  public constructor(settings: Settings) {
    const icon = document.createElement("i");
    icon.className = "bi bi-layers";

    const button = document.createElement("button");
    button.title = "Valitse Maanmittauslaitoksen taustakartta";
    button.className = "backgound-map-selection-button btn btn-info btn-sm";
    button.setAttribute("data-bs-toggle", "popover");
    button.appendChild(icon);

    super({ element: button });

    const backgroundMap = getBackgoundMapRadioInput(
      "Taustakartta",
      NLSBackgroundMap.BackgroundMap,
      settings
    );
    const topographicMap = getBackgoundMapRadioInput(
      "Maastokartta",
      NLSBackgroundMap.TopographicMap,
      settings
    );
    const orthophotos = getBackgoundMapRadioInput(
      "Ortokuva",
      NLSBackgroundMap.Orthophotos,
      settings
    );

    const popOverContent = document.createElement("form");
    popOverContent.append(backgroundMap, topographicMap, orthophotos);

    new Popover(button, {
      content: popOverContent,
      html: true,
      sanitize: false,
      placement: "right",
    });
  }
}

const getBackgoundMapRadioInput = (
  name: string,
  backgroundMap: NLSBackgroundMap,
  settings: Settings
) => {
  const formCheck = document.createElement("div");
  formCheck.className = "form-check";

  const inputId = `background-map-selection-${backgroundMap}`;

  const input = document.createElement("input");
  input.type = "radio";
  input.name = "model-selection";
  input.className = "form-check-input";
  input.id = inputId;
  input.onchange = () => {
    settings.setBackgroundMap(backgroundMap);
  };
  input.checked = settings.getBackgroundMap() === backgroundMap;

  const label = document.createElement("label");
  label.htmlFor = inputId;
  label.className = "form-check-label";

  const docLink = document.createElement("a");
  docLink.innerText = "lisää tietoa";
  docLink.target = "_blank";
  docLink.href = ((): string => {
    switch (backgroundMap) {
      case NLSBackgroundMap.BackgroundMap:
        return "https://www.maanmittauslaitos.fi/kartat-ja-paikkatieto/aineistot-ja-rajapinnat/tuotekuvaukset/taustakarttasarja-rasteri";
      case NLSBackgroundMap.TopographicMap:
        return "https://www.maanmittauslaitos.fi/kartat-ja-paikkatieto/aineistot-ja-rajapinnat/tuotekuvaukset/maastokarttasarja-rasteri";
      case NLSBackgroundMap.Orthophotos:
        return "https://www.maanmittauslaitos.fi/kartat-ja-paikkatieto/aineistot-ja-rajapinnat/tuotekuvaukset/ortokuva";
    }
  })();

  label.append(
    document.createTextNode(`${name} (`),
    docLink,
    document.createTextNode(")")
  );

  formCheck.appendChild(input);
  formCheck.appendChild(label);

  return formCheck;
};

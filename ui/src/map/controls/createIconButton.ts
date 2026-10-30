import Control from "ol/control/Control";

export const createIconButton = ({
  icon,
  title,
  onClick,
}: {
  icon: string;
  title: string;
  onClick: () => void;
}): Control => {
  const iconElement = document.createElement("i");
  iconElement.className = `bi bi-${icon}`;
  iconElement.setAttribute("aria-hidden", "true");

  const button = document.createElement("button");
  button.type = "button";
  button.title = title;
  button.setAttribute("aria-label", title);
  button.className = "btn btn-info btn-sm";
  button.appendChild(iconElement);
  button.addEventListener("click", onClick);

  return new Control({ element: button });
};

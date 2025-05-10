import Control from "ol/control/Control";
import years from "../../../common/mapLayerYears.json";
import "./yearMapControls.css";

export default class YearMapControls extends Control {
  private readonly changeYear: (year: number) => void;
  private year: number;
  private yearSelect: HTMLSelectElement;
  private buttonPrev: HTMLButtonElement;
  private buttonNext: HTMLButtonElement;

  constructor(changeYear: (year: number) => void, initialYear: number) {
    const buttonPrev = createButton("<");
    const buttonNext = createButton(">");
    const yearSelect = createYearSelectElement();

    const element = document.createElement("div");
    element.className = "year-buttons ol-unselectable ol-control";
    element.appendChild(buttonPrev);
    element.appendChild(yearSelect);
    element.appendChild(buttonNext);

    super({ element });
    this.year = initialYear;
    this.yearSelect = yearSelect;
    this.buttonPrev = buttonPrev;
    this.buttonNext = buttonNext;
    this.changeYear = changeYear;

    buttonPrev.addEventListener("click", () => {
      this.prevYear();
    });
    buttonNext.addEventListener("click", () => {
      this.nextYear();
    });
    yearSelect.addEventListener("change", (event) => {
      const selectedValue = (event.target as HTMLSelectElement).value;
      this.updateYear(parseInt(selectedValue));
    });

    this.buttonPrev.disabled = !this.hasPrevYear();
    this.buttonNext.disabled = !this.hasNextYear();
  }

  private hasPrevYear(): boolean {
    const prevYearIndex = years.indexOf(this.year) - 1;
    return prevYearIndex >= 0;
  }

  private hasNextYear(): boolean {
    const nextYearIndex = years.indexOf(this.year) + 1;
    return nextYearIndex < years.length;
  }

  private updateYear(year: number) {
    this.year = year;
    this.yearSelect.value = year.toString();
    this.changeYear(this.year);
    this.buttonPrev.disabled = !this.hasPrevYear();
    this.buttonNext.disabled = !this.hasNextYear();
  }

  private prevYear() {
    const prevYearIndex = years.indexOf(this.year) - 1;
    if (this.hasPrevYear()) {
      this.updateYear(years[prevYearIndex]);
    }
  }

  private nextYear() {
    const nextYearIndex = years.indexOf(this.year) + 1;
    if (this.hasNextYear()) {
      this.updateYear(years[nextYearIndex]);
    }
  }
}

const createButton = (label: string): HTMLButtonElement => {
  const button = document.createElement("button");
  button.innerHTML = label;
  return button;
};

const createYearSelectElement = (): HTMLSelectElement => {
  const select = document.createElement("select");

  years.forEach((year) => {
    const option = document.createElement("option");
    option.value = year.toString();
    option.text = (() => {
      if (year >= 0) {
        return `Vuosi ${year} jaa.`;
      } else {
        return `Vuosi ${-year} eaa.`;
      }
    })();
    select.appendChild(option);
  });
  return select;
};

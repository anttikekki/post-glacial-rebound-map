import Control from "ol/control/Control";
import baseYears from "../../../common/mapLayerYears.json";
import "./yearMapControls.css";

export default class YearMapControls extends Control {
  private readonly years = [...baseYears, new Date().getFullYear()];
  private readonly changeYear: (year: number) => void;
  private readonly yearSelect: HTMLSelectElement;
  private readonly buttonPrev: HTMLButtonElement;
  private readonly buttonNext: HTMLButtonElement;
  private year: number;

  constructor(changeYear: (year: number) => void, initialYear: number) {
    const years = [...baseYears, new Date().getFullYear()];
    const buttonPrev = createButton("<");
    const buttonNext = createButton(">");
    const yearSelect = createYearSelectElement(years);

    const element = document.createElement("div");
    element.className = "year-buttons ol-unselectable ol-control";
    element.appendChild(buttonPrev);
    element.appendChild(yearSelect);
    element.appendChild(buttonNext);

    super({ element });
    this.years = years;
    this.yearSelect = yearSelect;
    this.buttonPrev = buttonPrev;
    this.buttonNext = buttonNext;
    this.changeYear = changeYear;
    this.year = initialYear;

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
    const prevYearIndex = this.years.indexOf(this.year) - 1;
    return prevYearIndex >= 0;
  }

  private hasNextYear(): boolean {
    const nextYearIndex = this.years.indexOf(this.year) + 1;
    return nextYearIndex < this.years.length;
  }

  private updateYear(year: number) {
    this.year = year;
    this.yearSelect.value = year.toString();
    this.changeYear(this.year);
    this.buttonPrev.disabled = !this.hasPrevYear();
    this.buttonNext.disabled = !this.hasNextYear();
  }

  private prevYear() {
    const prevYearIndex = this.years.indexOf(this.year) - 1;
    if (this.hasPrevYear()) {
      this.updateYear(this.years[prevYearIndex]);
    }
  }

  private nextYear() {
    const nextYearIndex = this.years.indexOf(this.year) + 1;
    if (this.hasNextYear()) {
      this.updateYear(this.years[nextYearIndex]);
    }
  }
}

const createButton = (label: string): HTMLButtonElement => {
  const button = document.createElement("button");
  button.innerHTML = label;
  return button;
};

const createYearSelectElement = (years: number[]): HTMLSelectElement => {
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

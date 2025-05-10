import Control from "ol/control/Control";
import years from "../../../common/mapLayerYears.json";
import "./yearMapButtons.css";

export default class YearMapButtons extends Control {
  private readonly changeYear: (year: number) => void;
  private year: number;
  private yearTextSpan: HTMLSpanElement;

  constructor(changeYear: (year: number) => void, initialYear: number) {
    const buttonPrev = document.createElement("button");
    buttonPrev.innerHTML = "<";
    const buttonNext = document.createElement("button");
    buttonNext.innerHTML = ">";
    const yearTextSpan = document.createElement("span");

    const element = document.createElement("div");
    element.className = "year-buttons ol-unselectable ol-control";
    element.appendChild(buttonPrev);
    element.appendChild(yearTextSpan);
    element.appendChild(buttonNext);

    super({ element });
    this.year = initialYear;
    this.yearTextSpan = yearTextSpan;
    this.changeYear = changeYear;
    yearTextSpan.innerHTML = this.year.toString();

    buttonPrev.addEventListener("click", () => {
      this.prevYear();
    });
    buttonNext.addEventListener("click", () => {
      this.nextYear();
    });
  }

  private updateYear(year: number) {
    this.year = year;
    this.yearTextSpan.innerHTML = this.year.toString();
    this.changeYear(this.year);
  }

  private prevYear() {
    const prevYearIndex = years.indexOf(this.year) - 1;
    if (prevYearIndex < 0) {
      return;
    }
    this.updateYear(years[prevYearIndex]);
  }

  private nextYear() {
    const nextYearIndex = years.indexOf(this.year) + 1;
    if (nextYearIndex >= years.length) {
      return;
    }
    this.updateYear(years[nextYearIndex]);
  }
}

import Control from "ol/control/Control";
import { Settings } from "../util/settings";

export default class YearMapControls extends Control {
  private years: number[];
  private readonly yearSelect: HTMLSelectElement;
  private readonly buttonPrev: HTMLButtonElement;
  private readonly buttonNext: HTMLButtonElement;
  private readonly settings: Settings;

  constructor(settings: Settings) {
    const years = [...settings.getSupportedYears(), new Date().getFullYear()];
    const buttonPrev = createButton("<", "Edellinen vuosi");
    const buttonNext = createButton(">", "Seuraava vuosi");
    const yearSelect = createYearSelectElement(years);

    const element = document.createElement("div");
    element.className = "year-buttons";
    element.appendChild(buttonPrev);
    element.appendChild(yearSelect);
    element.appendChild(buttonNext);

    super({ element });
    this.years = years;
    this.yearSelect = yearSelect;
    this.buttonPrev = buttonPrev;
    this.buttonNext = buttonNext;
    this.settings = settings;

    this.settings.addEventListerner({
      onApiVersionChange: () => {
        this.years = [
          ...settings.getSupportedYears(),
          new Date().getFullYear(),
        ];
        this.updateSelectYears();
        this.yearSelect.value = this.settings.getYear().toString();
      },
    });

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

    this.updateButtonsStatus();
  }

  private hasPrevYear(): boolean {
    const prevYearIndex = this.years.indexOf(this.settings.getYear()) - 1;
    return prevYearIndex >= 0;
  }

  private hasNextYear(): boolean {
    const nextYearIndex = this.years.indexOf(this.settings.getYear()) + 1;
    return nextYearIndex < this.years.length;
  }

  private updateYear(year: number) {
    this.yearSelect.value = year.toString();
    this.settings.setYear(year);
    this.updateButtonsStatus();
  }

  private updateButtonsStatus() {
    this.buttonPrev.disabled = !this.hasPrevYear();
    this.buttonNext.disabled = !this.hasNextYear();
  }

  private prevYear() {
    const prevYearIndex = this.years.indexOf(this.settings.getYear()) - 1;
    if (this.hasPrevYear()) {
      this.updateYear(this.years[prevYearIndex]);
    }
  }

  private nextYear() {
    const nextYearIndex = this.years.indexOf(this.settings.getYear()) + 1;
    if (this.hasNextYear()) {
      this.updateYear(this.years[nextYearIndex]);
    }
  }

  private updateSelectYears() {
    this.yearSelect.innerHTML = "";
    this.yearSelect.append(
      ...getSelectOptions(this.settings.getSupportedYears())
    );
  }
}

const createButton = (label: string, title: string): HTMLButtonElement => {
  const button = document.createElement("button");
  button.className = "btn btn-info btn-sm";
  button.title = title;
  button.innerHTML = label;
  return button;
};

const createYearSelectElement = (years: number[]): HTMLSelectElement => {
  const select = document.createElement("select");
  select.title = "Valitse vuosi";
  select.className = "form-select form-select-sm";
  select.append(...getSelectOptions(years));
  return select;
};

const getSelectOptions = (years: number[]): HTMLOptionElement[] => {
  return years.map((year) => {
    const option = document.createElement("option");
    option.value = year.toString();
    option.text = (() => {
      if (year >= 0) {
        return `${year} jaa.`;
      } else {
        return `${-year} eaa.`;
      }
    })();
    return option;
  });
};

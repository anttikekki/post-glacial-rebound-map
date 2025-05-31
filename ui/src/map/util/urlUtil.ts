import queryString from "query-string";
import { Settings } from "./settings";

type UrlSettings = {
  year: number;
  apiVersion: string;
  backgroundMap: string;
};

export const updateSettingsToUrlHash = (settings: Settings): void => {
  const params: UrlSettings = {
    year: settings.getYear(),
    apiVersion: settings.getApiVersion(),
    backgroundMap: settings.getBackgroundMap(),
  };

  window.location.hash = `#${queryString.stringify(params)}`;
};

export const parseSettingsFromUrlHash = (): Partial<UrlSettings> => {
  const { year, apiVersion, backgroundMap } = queryString.parse(
    window.location.hash,
    {
      parseNumbers: true,
    }
  );

  let settings: Partial<UrlSettings> = {};
  if (year !== undefined && typeof year === "number") {
    settings = { ...settings, year };
  }
  if (apiVersion !== undefined && typeof apiVersion === "string") {
    settings = { ...settings, apiVersion };
  }
  if (backgroundMap !== undefined && typeof backgroundMap === "string") {
    settings = { ...settings, backgroundMap };
  }
  return settings;
};

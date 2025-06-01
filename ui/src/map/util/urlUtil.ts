import queryString from "query-string";
import { Settings } from "./settings";

type UrlSettings = {
  year: number;
  apiVersion: string;
  backgroundMap: string;
  zoom: number;
  mapCenter: number[];
};

export const updateSettingsToUrlHash = (settings: Settings): void => {
  const params: UrlSettings = {
    year: settings.getYear(),
    apiVersion: settings.getApiVersion(),
    backgroundMap: settings.getBackgroundMap(),
    zoom: settings.getZoom(),
    mapCenter: settings.getMapCenter(),
  };

  window.location.hash = `#${queryString.stringify(params, {
    arrayFormat: "comma",
  })}`;
};

export const parseSettingsFromUrlHash = (): Partial<UrlSettings> => {
  const { year, apiVersion, backgroundMap, zoom, mapCenter } =
    queryString.parse(window.location.hash, {
      parseNumbers: true,
      arrayFormat: "comma",
    });

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
  if (zoom !== undefined && typeof zoom === "number") {
    settings = { ...settings, zoom };
  }
  if (
    mapCenter &&
    Array.isArray(mapCenter) &&
    mapCenter.every((v) => typeof v === "number")
  ) {
    settings = { ...settings, mapCenter };
  }
  return settings;
};

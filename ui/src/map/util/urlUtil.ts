import queryString from "query-string";
import { Settings } from "./settings";

type UrlSettings = {
  year: number;
  apiVersion: string;
  backgroundMap: string;
  zoom: number;
  mapCenter: number[];
  opacity: number;
};

const defaultSettings = new Settings({});

export const updateSettingsToUrlHash = (settings: Settings): void => {
  let params: Partial<UrlSettings> = {
    year: settings.getYear(),
    zoom: settings.getZoom(),
    mapCenter: settings.getMapCenter(),
  };

  if (defaultSettings.getApiVersion() !== settings.getApiVersion()) {
    params = { ...params, apiVersion: settings.getApiVersion() };
  }
  if (defaultSettings.getBackgroundMap() !== settings.getBackgroundMap()) {
    params = { ...params, backgroundMap: settings.getBackgroundMap() };
  }
  if (defaultSettings.getLayerOpacity() !== settings.getLayerOpacity()) {
    params = { ...params, opacity: settings.getLayerOpacity() };
  }

  window.location.hash = `#${queryString.stringify(params, {
    arrayFormat: "comma",
  })}`;
};

export const parseSettingsFromUrlHash = (): Partial<UrlSettings> => {
  const { year, apiVersion, backgroundMap, zoom, mapCenter, opacity } =
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
  if (opacity !== undefined && typeof opacity === "number") {
    settings = { ...settings, opacity };
  }
  return settings;
};

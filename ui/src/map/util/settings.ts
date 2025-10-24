import { Coordinate } from "ol/coordinate";
import yearsIce from "../../../../common/iceMapLayerYears.json";
import years from "../../../../common/seaMapLayerYears.json";

/**
 * National land survey of Finland (NLS) backgound map layer
 */
export enum NLSBackgroundMap {
  TopographicMap = "maastokartta",
  BackgroundMap = "taustakartta",
  Orthophotos = "ortokuva",
}

export type SettingsEventListner = {
  onYearChange?: (year: number) => void;
  onLoadingStatusChange?: (isLoading: boolean) => void;
  onBackgroundMapChange?: (backgroundMap: NLSBackgroundMap) => void;
  onZoomChange?: (zoom: number) => void;
  onMapCenterChange?: (mapCenter: Coordinate) => void;
  onLayerOpacityChange?: (layerOpacity: number) => void;
};

export class Settings {
  private readonly eventListerners: SettingsEventListner[] = [];
  private year: number;
  private isLoading: boolean;
  private backgroundMap: NLSBackgroundMap;
  private zoom: number;
  private mapCenter: Coordinate;
  private layerOpacity: number;

  public constructor({
    year,
    backgroundMap,
    zoom,
    mapCenter,
    opacity,
  }: {
    year?: number;
    backgroundMap?: string;
    zoom?: number;
    mapCenter?: number[];
    opacity?: number;
  }) {
    // Initial default values, if there no config in URL
    this.year = -6000;
    this.isLoading = false;
    this.backgroundMap = NLSBackgroundMap.BackgroundMap;
    this.zoom = 3;
    this.mapCenter = [414553.6179, 6948916.8145]; // Center area of Finland
    this.layerOpacity = 1;

    // Validate and set config from URL
    if (year !== undefined && this.getSupportedSeaYears().includes(year)) {
      this.year = year;
    }
    if (
      backgroundMap &&
      Object.values(NLSBackgroundMap).includes(
        backgroundMap as NLSBackgroundMap
      )
    ) {
      this.backgroundMap = backgroundMap as NLSBackgroundMap;
    }
    if (zoom !== undefined && zoom >= 0) {
      this.zoom = zoom;
    }
    if (mapCenter && mapCenter.length === 2) {
      this.mapCenter = mapCenter;
    }
    if (opacity !== undefined && opacity >= 0 && opacity <= 1) {
      this.layerOpacity = opacity;
    }
  }

  public getZoom(): number {
    return this.zoom;
  }

  public setZoom(zoom: number) {
    if (this.zoom === zoom) {
      return;
    }
    this.zoom = zoom;
    this.eventListerners.forEach((listerner) => {
      listerner.onZoomChange?.(this.zoom);
    });
  }

  public getMapCenter(): Coordinate {
    return this.mapCenter;
  }

  public setMapCenter(mapCenter: Coordinate) {
    if (
      this.mapCenter[0] === mapCenter[0] &&
      this.mapCenter[1] === mapCenter[1]
    ) {
      return;
    }
    this.mapCenter = mapCenter;
    this.eventListerners.forEach((listerner) => {
      listerner.onMapCenterChange?.(this.mapCenter);
    });
  }

  public getSupportedSeaYears(): number[] {
    return years;
  }

  public getSupportedIceYears(): number[] {
    return yearsIce;
  }

  public getYear(): number {
    return this.year;
  }

  public getIsLoading(): boolean {
    return this.isLoading;
  }

  public setYear(year: number): void {
    if (this.year === year) {
      return;
    }
    this.year = year;
    this.eventListerners.forEach((listerner) => {
      listerner.onYearChange?.(year);
    });
  }

  public setIsLoading(isLoading: boolean): void {
    if (this.isLoading === isLoading) {
      return;
    }
    this.isLoading = isLoading;
    this.eventListerners.forEach((listerner) => {
      listerner.onLoadingStatusChange?.(isLoading);
    });
  }

  public setBackgroundMap(backgroundMap: NLSBackgroundMap): void {
    if (this.backgroundMap === backgroundMap) {
      return;
    }
    this.backgroundMap = backgroundMap;
    this.eventListerners.forEach((listerner) => {
      listerner.onBackgroundMapChange?.(backgroundMap);
    });
  }

  public getBackgroundMap(): NLSBackgroundMap {
    return this.backgroundMap;
  }

  public setLayerOpacity(layerOpacity: number): void {
    if (this.layerOpacity === layerOpacity) {
      return;
    }
    this.layerOpacity = layerOpacity;
    this.eventListerners.forEach((listerner) => {
      listerner.onLayerOpacityChange?.(layerOpacity);
    });
  }

  public getLayerOpacity(): number {
    return this.layerOpacity;
  }

  public addEventListerner(listener: SettingsEventListner) {
    this.eventListerners.push(listener);
  }
}

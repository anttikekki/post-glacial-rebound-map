import yearsIce from "../../../../common/iceMapLayerYears.json";
import yearsV1 from "../../../../common/mapLayerYearsModelV1.json";
import yearsV2 from "../../../../common/mapLayerYearsModelV2.json";

export enum PostGlacialReboundApiVersion {
  V1 = "v1",
  V2 = "v2",
}

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
  onApiVersionChange?: (apiVersion: PostGlacialReboundApiVersion) => void;
  onLoadingStatusChange?: (isLoading: boolean) => void;
  onBackgroundMapChange?: (backgroundMap: NLSBackgroundMap) => void;
};

export class Settings {
  private readonly eventListerners: SettingsEventListner[] = [];
  private year: number;
  private apiVersion: PostGlacialReboundApiVersion;
  private isLoading: boolean;
  private backgroundMap: NLSBackgroundMap;

  public constructor({
    year,
    apiVersion,
    backgroundMap,
  }: {
    year?: number;
    apiVersion?: string;
    backgroundMap?: string;
  }) {
    this.year = -6000;
    this.apiVersion = PostGlacialReboundApiVersion.V2;
    this.isLoading = false;
    this.backgroundMap = NLSBackgroundMap.BackgroundMap;

    if (apiVersion && isValidApiVersion(apiVersion)) {
      this.apiVersion = apiVersion;
    }
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
  }

  public getSupportedSeaYears(): number[] {
    switch (this.apiVersion) {
      case PostGlacialReboundApiVersion.V1:
        return yearsV1;
      case PostGlacialReboundApiVersion.V2:
        return yearsV2;
    }
  }

  public getSupportedIceYears(): number[] {
    return yearsIce;
  }

  public getYear(): number {
    return this.year;
  }

  public getApiVersion(): PostGlacialReboundApiVersion {
    return this.apiVersion;
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

  public setApiVersion(apiVersion: PostGlacialReboundApiVersion): void {
    if (this.apiVersion === apiVersion) {
      return;
    }
    this.apiVersion = apiVersion;

    // If selected year is not allowed for new API version, default to closest value
    if (!this.getSupportedSeaYears().includes(this.year)) {
      this.year = this.getSupportedSeaYears().reduce((prev, curr) => {
        return Math.abs(curr - this.year) < Math.abs(prev - this.year)
          ? curr
          : prev;
      });
    }

    this.eventListerners.forEach((listerner) => {
      listerner.onApiVersionChange?.(apiVersion);
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

  public addEventListerner(listener: SettingsEventListner) {
    this.eventListerners.push(listener);
  }
}

const isValidApiVersion = (
  value: string
): value is PostGlacialReboundApiVersion =>
  Object.values(PostGlacialReboundApiVersion).includes(
    value as PostGlacialReboundApiVersion
  );

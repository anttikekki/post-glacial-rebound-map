import yearsIce from "../../../../common/iceMapLayerYears.json";
import yearsV1 from "../../../../common/mapLayerYearsModelV1.json";
import yearsV2 from "../../../../common/mapLayerYearsModelV2.json";

export enum PostGlacialReboundApiVersion {
  V1 = "v1",
  V2 = "v2",
}

export type SettingsEventListner = {
  onYearChange?: (year: number) => void;
  onApiVersionChange?: (apiVersion: PostGlacialReboundApiVersion) => void;
  onLoadingStatusChange?: (isLoading: boolean) => void;
};

export class Settings {
  private readonly eventListerners: SettingsEventListner[] = [];
  private year: number;
  private apiVersion: PostGlacialReboundApiVersion;
  private isLoading: boolean;

  public constructor(
    initialYear: number | undefined,
    initialApiVersion: string | undefined
  ) {
    this.year = -6000;
    this.apiVersion = PostGlacialReboundApiVersion.V2;
    this.isLoading = false;

    if (initialApiVersion && isValidApiVersion(initialApiVersion)) {
      this.apiVersion = initialApiVersion;
    }
    if (
      initialYear !== undefined &&
      this.getSupportedYears().includes(initialYear)
    ) {
      this.year = initialYear;
    }
  }

  public getSupportedYears(): number[] {
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

    // If selected year is nnot allowed for new API version, default to something
    if (!this.getSupportedYears().includes(this.year)) {
      this.year = this.getSupportedYears()[0];
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

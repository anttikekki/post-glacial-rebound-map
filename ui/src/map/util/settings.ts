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
    initialYear: number,
    initialApiVersion: PostGlacialReboundApiVersion
  ) {
    this.year = initialYear;
    this.apiVersion = initialApiVersion;
    this.isLoading = false;
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

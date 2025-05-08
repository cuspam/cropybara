export interface ConfigStateCommon {
  name: string;
  limit: number;
}

export interface ConfigStateManualDetector {
  detector: ConfigDetector.Manual;
}

export interface ConfigStatePixelComparisonDetector {
  detector: ConfigDetector.PixelComparison;
  sensitivity: number;
  step: number;
  margins: number;
}

export enum ConfigDetector {
  Manual = 'Manual',
  PixelComparison = 'PixelComparison',
}

export type ConfigState = ConfigStateCommon &
  (ConfigStateManualDetector | ConfigStatePixelComparisonDetector);

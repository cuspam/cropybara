export interface ConfigStateCommon {
  name: string;
  limit: number;
  denoiser: ConfigDenoiser;
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

export enum ConfigDenoiser {
  Off = 'Off',
  ManhwaNullONNX = 'ManhwaNullONNX',
  Unjpeg = 'Unjpeg',
}

export type ConfigState = ConfigStateCommon &
  (ConfigStateManualDetector | ConfigStatePixelComparisonDetector);

export interface ChartLegendLabelOptions {
  color?: string;
}

export interface ChartLegendOptions {
  labels?: ChartLegendLabelOptions;
}

export interface ChartPluginOptions {
  legend?: ChartLegendOptions;
}

export interface ChartAxisTickOptions {
  color?: string;
}

export interface ChartAxisGridOptions {
  color?: string;
}

export interface ChartAxisOptions {
  beginAtZero?: boolean;
  ticks?: ChartAxisTickOptions;
  grid?: ChartAxisGridOptions;
}

export interface ChartScaleOptions {
  x?: ChartAxisOptions;
  y?: ChartAxisOptions;
}

export interface ChartOptionsInput {
  maintainAspectRatio?: boolean;
  aspectRatio?: number;
  plugins?: ChartPluginOptions;
  scales?: ChartScaleOptions;
}

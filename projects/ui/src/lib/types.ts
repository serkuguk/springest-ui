export interface IconInterface {
  src: string;
  cssClass: string;
}

export type Value = number | string | boolean;

export interface ControlItemInterface {
  value: Value;
  label: string;
  icon?: IconInterface | null;
}

export interface ChartDataset {
  label: string;
  data: number[];
  backgroundColor: string[];
  borderColor: string[];
  borderWidth: number;
}

export interface ChartData {
  labels: string[];
  datasets: ChartDataset[];
}

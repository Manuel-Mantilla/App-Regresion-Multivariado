
export type DataSet = Record<string, any>[];

export interface Statistic {
  count: number;
  mean: number;
  std: number;
  min: number;
  '25%': number;
  '50%': number;
  '75%': number;
  max: number;
}

export interface ChartDataPoint {
  [key: string]: string | number;
}

export interface Chart {
  type: 'histogram' | 'bar';
  title: string;
  xLabel: string;
  yLabel: string;
  data: ChartDataPoint[];
}

export interface DescriptiveAnalysisResult {
  statistics: {
    [key: string]: Statistic;
  };
  charts: Chart[];
}

export interface RegressionResult {
  modelQuality: {
    rSquared: number;
    adjustedRSquared: number;
    fStatistic: number;
    p_value_f_statistic: number;
    summary: string;
  };
  coefficients: {
    [key: string]: number;
  };
  formula: string;
}

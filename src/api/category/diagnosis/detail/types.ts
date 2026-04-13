export interface CategoryDiagnosisDetailQuery {
  categoryId?: string | number;
  storeNo?: string;
  startDate?: string;
  endDate?: string;
  compareStartDate?: string;
  compareEndDate?: string;
}

export interface CategoryDiagnosisDetailFilterVO {
  currentDateRangeText: string;
  compareDateRangeText: string;
  orgName: string;
  retailTypeName: string;
  circleName: string;
  storeRangeName: string;
}

export interface CategoryDiagnosisDetailCoreVO {
  categoryCode: string;
  categoryName: string;
  categoryLevelName: string;
  currentRoleName: string;
  presetRoleName: string;
  presetSkuCount: number;
}

export interface CategoryDiagnosisDetailSummaryVO {
  filterInfo: CategoryDiagnosisDetailFilterVO;
  coreInfo: CategoryDiagnosisDetailCoreVO;
}

export type CompareType = 'growth' | 'diff';

export interface CategoryDiagnosisMetricVO {
  metricKey: string;
  metricName: string;
  metricDesc: string;
  currentValue: string | number;
  compareValue: number;
  compareType: CompareType;
  unit?: string;
}

export interface CategoryDiagnosisMetricGroupVO {
  firstRow: CategoryDiagnosisMetricVO[];
  secondRow: CategoryDiagnosisMetricVO[];
}

export interface CategoryDiagnosisTrendPointVO {
  date: string;
  value: number;
}

export interface CategoryDiagnosisTrendVO {
  metricKey: string;
  metricName: string;
  unit: string;
  currentSeries: CategoryDiagnosisTrendPointVO[];
  compareSeries: CategoryDiagnosisTrendPointVO[];
}

export interface CategoryDiagnosisDetailQuery {
  sessionId?: string;
  categoryId?: string | number;
  categoryName?: string;
  categoryLevel?: string | number;
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

export interface DiagnosisOverviewResponse {
  classNo?: string;
  className?: string;
  currentClassSku?: number;
  compareClassSku?: number;
  comparativeGrowthRate?: number;
  currentTurnoverRate?: number;
  compareTurnoverRate?: number;
  comparativeTurnoverRate?: number;
  currentPenetrateRate?: number;
  comparePenetrateRate?: number;
  comparativePenetrateRate?: number;
  currentTurnoverDays?: number;
  compareTurnoverDays?: number;
  comparativeTurnoverDays?: number;
  currentInventorySales?: number;
  compareInventorySales?: number;
  comparativeInventorySales?: number;
  currentAvgInventory?: number;
  compareAvgInventory?: number;
  comparativeAvgInventory?: number;
  currentSaleQuantity?: number;
  compareSaleQuantity?: number;
  comparativeSaleQuantity?: number;
  currentSales?: number;
  compareSales?: number;
  comparativeSales?: number;
  currentGross?: number;
  compareGross?: number;
  comparativeGross?: number;
  currentGrossRate?: number;
  compareGrossRate?: number;
  comparativeGrossRate?: number;
  currentCustomerCount?: number;
  compareCustomerCount?: number;
  comparativeCustomerCount?: number;
  currentCustomerPrice?: number;
  compareCustomerPrice?: number;
  comparativeCustomerPrice?: number;
  currentCustomerAvgQuantity?: number;
  compareCustomerAvgQuantity?: number;
  comparativeCustomerAvgQuantity?: number;
  currentPieceAvgPrice?: number;
  comparePieceAvgPrice?: number;
  comparativePieceAvgPrice?: number;
  currentSalesCost?: number;
  compareSalesCost?: number;
  currentCustomerCountTotal?: number;
  compareCustomerCountTotal?: number;
}

export interface DiagnosisTrendSnapshotRow {
  metricCode?: string;
  pointDate: string;
  currentValue?: number;
  compareValue?: number;
  growthRate?: number;
  periodLabel?: string;
}

export interface DiagnosisTrendsResponse {
  sessionId: string;
  metricCode?: string;
  dataVersion?: string;
  cacheHit: boolean;
  trends: DiagnosisTrendSnapshotRow[];
}

export interface DiagnosisSubClassQuery {
  sessionId?: string;
  categoryId?: string | number;
  categoryName?: string;
  storeNo?: string;
  startDate?: string;
  endDate?: string;
  compareStartDate?: string;
  compareEndDate?: string;
}

export interface DiagnosisSubClassPieItem {
  classNo: string;
  className: string;
  salesAmount: number;
  salesShare: number;
}

export interface DiagnosisSubClassTrendSeriesItem {
  classNo: string;
  className: string;
  color?: string;
  values: number[];
}

export interface DiagnosisSubClassTrendResponse {
  dates: string[];
  unit?: string;
  series: DiagnosisSubClassTrendSeriesItem[];
}

export interface DiagnosisSubClassTableRow {
  classNo: string;
  className: string;
  salesAmount: number;
  salesShare: number;
  grossAmount: number;
  grossShare: number;
  grossRate: number;
  customerCount: number;
  customerPrice: number;
  compareSalesAmount: number;
  compareSalesShare: number;
  salesGrowthRate: number;
  compareGrossAmount: number;
  compareGrossRate: number;
  compareCustomerCount: number;
  customerCountGrowthRate: number;
  compareCustomerPrice: number;
  customerPriceGrowthRate: number;
  turnoverRate: number;
  turnoverDays: number;
  gmroi: number;
}

export interface DiagnosisSubClassTableResponse {
  rows: DiagnosisSubClassTableRow[];
}

export interface DiagnosisChannelPieItem {
  channelCode: string;
  channelName: string;
  salesAmount: number;
  salesShare: number;
}

export interface DiagnosisChannelTrendSeriesItem {
  channelCode: string;
  channelName: string;
  color?: string;
  values: number[];
}

export interface DiagnosisChannelTrendResponse {
  dates: string[];
  unit?: string;
  series: DiagnosisChannelTrendSeriesItem[];
}

export interface DiagnosisChannelTableRow {
  channelCode: string;
  channelName: string;
  salesAmount: number;
  salesShare: number;
  grossAmount: number;
  grossShare: number;
  grossRate: number;
  customerCount: number;
  customerPrice: number;
  compareSalesAmount: number;
  compareSalesShare: number;
  salesGrowthRate: number;
  compareGrossAmount: number;
  compareGrossShare: number;
  grossGrowthRate: number;
  compareGrossRate: number;
  compareCustomerCount: number;
  customerCountGrowthRate: number;
  compareCustomerPrice: number;
  customerPriceGrowthRate: number;
}

export interface DiagnosisChannelTableResponse {
  rows: DiagnosisChannelTableRow[];
}

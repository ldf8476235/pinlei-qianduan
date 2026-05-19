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

export interface LegacyNodeResponse<T> {
  success: boolean;
  message: string;
  code: number;
  result: T;
  timestamp: number;
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

export type OverallSummaryStatus = 'NORMAL' | 'ABNORMAL' | 'OTHER';

export interface DiagnosisOverallSummarySection {
  status: OverallSummaryStatus;
  title: string;
  conclusion: string;
  descriptions: string[];
}

export interface DiagnosisOverallSummaryResponse {
  sessionId: string;
  classNo?: string;
  className?: string;
  sections: DiagnosisOverallSummarySection[];
}

export interface DiagnosisIntroduceDirectionColumn {
  label: string;
  value: string;
}

export interface DiagnosisIntroduceDirectionResponse {
  sessionId: string;
  columns: DiagnosisIntroduceDirectionColumn[];
  rows: Array<Record<string, string>>;
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
  classLevel?: string | number;
  storeNo?: string;
  startDate?: string;
  endDate?: string;
  compareStartDate?: string;
  compareEndDate?: string;
  deptId?: string;
  retailTypeId?: string;
  businessCircleId?: string;
  deptGroupId?: string;
}

export interface LegacySubclassContributionRequest {
  sessionId?: string;
  deptId?: string;
  retailTypeId?: string;
  businessCircleId?: string;
  deptGroupId?: string;
  storeNo?: string;
  classLevel?: string | number;
  classNo?: string;
  currentStartDate?: string;
  currentEndDate?: string;
  compareStartDate?: string;
  compareEndDate?: string;
}

export interface LegacySubclassContributionListRequest extends LegacySubclassContributionRequest {
  page?: number;
  size?: number;
  order?: string;
  orderType?: string;
}

export interface LegacySubclassSalesPerItem {
  classNo?: string;
  className?: string;
  classLevel?: number;
  parentClassNo?: string;
  sales?: number;
  salesPer?: number;
  dataDate?: string;
}

export interface LegacySubclassSalesTrendPointItem {
  dataDate?: string;
  classNo?: string;
  className?: string;
  sales?: number;
}

export interface LegacySubclassSalesTrendResponse {
  legend?: string[];
  lineDate?: LegacySubclassSalesTrendPointItem[];
  xdata?: string[];
}

export interface LegacySubclassSalesListItem {
  classNo: string;
  className: string;
  classLevel?: number;
  parentClassNo?: string;
  currentSales?: number;
  currentSalesPer?: number;
  currentGross?: number;
  currentGrossPer?: number;
  currentGrossRate?: number;
  currentSaleQuantity?: number;
  currentCustomerCount?: number;
  currentCustomerPrice?: number;
  compareSales?: number;
  compareSalesPer?: number;
  compareSalesAddRate?: number;
  compareGross?: number;
  compareGrossPer?: number;
  compareGrossAddRate?: number;
  compareGrossRate?: number;
  compareSaleQuantity?: number;
  compareSaleQuantityAddRate?: number;
  compareCustomerCount?: number;
  compareCustomerPrice?: number;
  compareCustomerPriceAddRate?: number;
  currentTurnoverRate?: number;
  currentTurnoverDays?: number;
  gmroi?: number;
  saleCost?: number;
}

export interface LegacySubclassSalesListResponse {
  content?: LegacySubclassSalesListItem[];
  totalElements?: number;
  list?: LegacySubclassSalesListItem[];
  total?: number;
}

export interface DiagnosisSubClassPieItem {
  classNo: string;
  className: string;
  salesAmount: number;
  salesShare: number;
  salesPer?: number;
}

export interface DiagnosisSubClassTableRow {
  classNo: string;
  className: string;
  classLevel?: number;
  parentClassNo?: string;
  currentSales: number;
  currentSalesPer: number;
  currentGross: number;
  currentGrossPer: number;
  currentGrossRate: number;
  currentSaleQuantity: number;
  currentCustomerCount: number;
  currentCustomerPrice: number;
  compareSales: number;
  compareSalesPer: number;
  compareSalesAddRate: number;
  compareGross: number;
  compareGrossPer: number;
  compareGrossAddRate: number;
  compareGrossRate: number;
  compareSaleQuantity: number;
  compareSaleQuantityAddRate: number;
  compareCustomerCount: number;
  compareCustomerPrice: number;
  compareCustomerPriceAddRate: number;
  currentTurnoverRate: number;
  currentTurnoverDays: number;
  gmroi: number;
  saleCost: number;
}

export interface DiagnosisSubClassTableResponse {
  content?: DiagnosisSubClassTableRow[];
  list?: DiagnosisSubClassTableRow[];
  rows?: DiagnosisSubClassTableRow[];
  totalElements?: number;
  total?: number;
}

export interface DiagnosisChannelPieItem {
  channelCode: string;
  channelName: string;
  salesAmount: number;
  salesShare: number;
}

export interface ChannelSalesPieItemResponse {
  name: string;
  value: number;
  per?: number;
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

export interface ChannelSalesTrendPointResponse {
  dataDate?: string;
  saleChannel?: number;
  onlineType?: number;
  onlineName?: string;
  sales?: number;
}

export interface ChannelSalesTrendResponse {
  lineDate?: ChannelSalesTrendPointResponse[];
  xdata?: string[];
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

export interface ChannelSalesDetailsItemResponse {
  channelName?: string;
  saleChannel?: number;
  onlineType?: number;
  onlineName?: string;
  currentSales?: number;
  currentSalesPer?: number;
  currentGross?: number;
  currentGrossPer?: number;
  currentGrossRate?: number;
  currentCustomerCount?: number;
  currentCustomerPrice?: number;
  compareSales?: number;
  compareSalesPer?: number;
  compareSalesInc?: number;
  compareGross?: number;
  compareGrossPer?: number;
  compareGrossInc?: number;
  compareGrossRate?: number;
  compareCustomerCount?: number;
  compareCustomerCountInc?: number;
  compareCustomerPrice?: number;
  compareCustomerPriceInc?: number;
}

export interface ChannelSalesDetailsResponse {
  records?: ChannelSalesDetailsItemResponse[];
  total?: number;
  size?: number;
  current?: number;
  pages?: number;
}

export interface CustomerAgeBucketResponse {
  ageCode?: string;
  ageName?: string;
  ageStart?: number;
  ageEnd?: number;
  orderNumber?: number;
}

export interface CustomerSalesRadarItemResponse {
  gender?: number;
  ageCode?: string;
  ageName?: string;
  ageStart?: number;
  ageEnd?: number;
  currentSales?: number;
  currentCustomerCount?: number;
  currentCustomerPrice?: number;
  currentUnitPrice?: number;
  currentCountAve?: number;
  currentSaleQuantity?: number;
  compareSales?: number;
  compareCustomerCount?: number;
  compareCustomerPrice?: number;
  compareUnitPrice?: number;
  compareCountAve?: number;
  compareSaleQuantity?: number;
  salesGrowth?: number;
  customerGrowth?: number;
}

export interface CustomerSalesDetailsItemResponse {
  ageCode?: string;
  ageName?: string;
  ageStart?: number;
  ageEnd?: number;
  ageOrder?: number;
  currentSales?: number;
  currentCustomerCount?: number;
  currentCustomerPrice?: number;
  currentUnitPrice?: number;
  currentCountAve?: number;
  currentSaleQuantity?: number;
  compareSales?: number;
  compareCustomerCount?: number;
  compareCustomerPrice?: number;
  compareUnitPrice?: number;
  compareCountAve?: number;
  compareSaleQuantity?: number;
  salesGrowth?: number;
  customerGrowth?: number;
  customerPriceGrowth?: number;
  unitPriceGrowth?: number;
  countAveGrowth?: number;
  saleQuantityGrowth?: number;
  currentManSales?: number;
  currentManCustomerCount?: number;
  currentManCustomerPrice?: number;
  currentManUnitPrice?: number;
  currentManCountAve?: number;
  currentWomanSales?: number;
  currentWomanCustomerCount?: number;
  currentWomanCustomerPrice?: number;
  currentWomanUnitPrice?: number;
  currentWomanCountAve?: number;
  currentUnknownSales?: number;
  currentUnknownCustomerCount?: number;
  currentUnknownCustomerPrice?: number;
  currentUnknownUnitPrice?: number;
  currentUnknownCountAve?: number;
}

export interface CustomerSalesDetailsResponse {
  records?: CustomerSalesDetailsItemResponse[];
  total?: number;
  size?: number;
  current?: number;
  pages?: number;
}

export interface TagTypeItemResponse {
  tagNo?: string;
  tagName?: string;
  sales?: number;
}

export interface TagTypeGroupResponse {
  tagType?: string;
  tagTypeName?: string;
  tagList?: TagTypeItemResponse[];
}

export interface TagSalesSkuItemResponse {
  tagName?: string;
  sales?: number;
  salesPer?: number;
  sku?: number;
  skuPer?: number;
}

export interface TagSalesPerResponse {
  salesAndSkuList?: TagSalesSkuItemResponse[];
  goodTagList?: string[];
  badTagList?: string[];
}

export interface TagDetailItemResponse {
  tagNo?: string;
  tagName?: string;
  sku?: number;
  skuChange?: number;
  skuInc?: number;
  skuPer?: number;
  saleQuantity?: number;
  saleQuantityChange?: number;
  saleQuantityInc?: number;
  saleQuantityPer?: number;
  saleQuantityPsd?: number;
  sales?: number;
  salesChange?: number;
  salesInc?: number;
  salesPer?: number;
  salesPsd?: number;
  gross?: number;
  grossChange?: number;
  grossInc?: number;
  grossPer?: number;
  grossPsd?: number;
  grossRate?: number;
  grossRateInc?: number;
  stockQuantity?: number;
  turnoverRate?: number;
  turnoverDays?: number;
  stockSalesRate?: number;
  contributionRate?: number;
  gmroi?: number;
  salesRate?: number;
  activitySku?: number;
}

export interface TagDetailPageResponse {
  records?: TagDetailItemResponse[];
  total?: number;
  size?: number;
  current?: number;
  pages?: number;
}

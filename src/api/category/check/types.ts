export interface CheckOptionVO {
  label: string;
  value: string | number;
}

export interface CategoryCheckFilterVO {
  storeOptions: CheckOptionVO[];
  levelOptions: CheckOptionVO[];
  categoryOptions: CheckOptionVO[];
}

export interface DateRangeValue {
  startDate: string;
  endDate: string;
}

export interface CategoryCheckQuery {
  storeScope?: string | number;
  categoryLevel?: string | number;
  categoryIds?: Array<string | number>;
  currentStartDate?: string;
  currentEndDate?: string;
  compareStartDate?: string;
  compareEndDate?: string;
}

export interface CategoryCheckAlertVO {
  roleAbnormalCount: number;
  skuStructureAbnormalCount: number;
  skuPresetAbnormalCount: number;
}

export interface CategoryRoleScatterItemVO {
  categoryId: string | number;
  categoryCode: string;
  categoryName: string;
  roleName?: string;
  presetRoleName?: string;
  evaluatedRoleName?: string;
  roleWarning?: boolean;
  roleMatchStatus: 'match' | 'mismatch' | 'unset';
  growthRate: number;
  contributionRate: number;
  skuCount: number;
  salesAmount?: number;
}

export interface CategoryCheckRoleVO {
  list: CategoryRoleScatterItemVO[];
  splitLineX?: number;
  splitLineY?: number;
}

export interface CategorySkuChartItemVO {
  categoryId: string | number;
  categoryName: string;
  skuRatio: number;
  salesRatio: number;
  ratioDiff: number;
  currentSkuCount: number;
  presetSkuCount: number;
  skuDiff: number;
}

export interface CategoryCheckSkuVO {
  list: CategorySkuChartItemVO[];
}

export interface CategorySalesChartItemVO {
  categoryId: string | number;
  categoryName: string;
  growthRate: number;
  salesAmount: number;
  compareSalesAmount?: number;
}

export interface CategoryCheckSalesQuery extends CategoryCheckQuery, PageQuery {}

export interface CategoryCheckSalesVO {
  rows: CategorySalesChartItemVO[];
  total: number;
  pageNum: number;
  pageSize: number;
}

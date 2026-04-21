export interface AllClassCheckRequest {
  deptId?: string | number;
  retailTypeId?: string | number;
  businessCircleId?: string | number;
  deptGroupId?: string | number;
  storeNo?: string | number;
  classLevel?: number;
  classNo?: string[];
  classRole?: string[];
  currentStartDate?: string;
  currentEndDate?: string;
  compareStartDate?: string;
  compareEndDate?: string;
}

export interface AllClassCheckListRequest extends AllClassCheckRequest {
  page?: number;
  size?: number;
  order?: string;
  orderType?: string;
}

export interface AllClassCheckSalesChangeItemResponse {
  classNo?: string;
  className?: string;
  classLevel?: number;
  sales?: number;
  salesCompare?: number;
  salesCompareRate?: number;
  contributionRatePer?: number;
  salesPer?: number;
  classRole?: string;
  classRoleName?: string;
  classRoleType?: string;
  classRoleTypeDescribe?: string;
}

export interface AllClassCheckSalesChangeResponse {
  content?: AllClassCheckSalesChangeItemResponse[];
  list?: AllClassCheckSalesChangeItemResponse[];
  totalElements?: number;
  total?: number;
}

export interface AllClassCheckScatterItemResponse {
  classNo?: string;
  className?: string;
  classLevel?: number;
  sales?: number;
  salesCompare?: number;
  gross?: number;
  saleQuantity?: number;
  salesCompareRate?: number;
  contributionRatePer?: number;
  salesPer?: number;
  classRole?: string;
  classRoleName?: string;
  classRoleType?: string;
  classRoleTypeDescribe?: string;
}

export interface AllClassCheckScatterXYResponse {
  avgPointX?: number;
  avgPointY?: number;
  xMin?: number;
  xMax?: number;
  yMin?: number;
  yMax?: number;
  xName?: string;
  yName?: string;
}

export interface AllClassCheckScatterResponse {
  warn?: number;
  scaleY?: number[];
  xyData?: AllClassCheckScatterXYResponse;
  list?: AllClassCheckScatterItemResponse[];
}

export interface AllClassCheckSkuItemResponse {
  classNo?: string;
  className?: string;
  parentClassNo?: string;
  classLevel?: number;
  sales?: number;
  gross?: number;
  saleQuantity?: number;
  suggestSaleSku?: number;
  haveSalesSku?: number;
  haveSalesSkuNo?: number;
  saleSku?: number;
  skuPer?: number;
  salesPer?: number;
  skuDifference?: number;
  classSku?: number;
  classRole?: string;
  classRoleName?: string;
  classRoleType?: string;
  classRoleTypeDescribe?: string;
}

export interface AllClassCheckSkuYDataResponse {
  yTwoSkuDifferenceMin?: number;
  yTwoSkuDifferenceMax?: number;
  yOneSkuPerMin?: number;
  yOneSalesPerMin?: number;
  yOneSkuPerMax?: number;
  yOneSalesPerMax?: number;
}

export interface AllClassCheckSkuResponse {
  warn?: number;
  yData?: AllClassCheckSkuYDataResponse;
  list?: AllClassCheckSkuItemResponse[];
}

export interface AllClassCheckSkuDifferItemResponse {
  classNo?: string;
  className?: string;
  parentClassNo?: string;
  classLevel?: number;
  suggestSaleSku?: number;
  saleSku?: number;
  roleNo?: string;
  roleType?: string;
  subClass?: string;
  skuDiffer?: number;
  sysSuggestSaleSku?: number;
}

export interface AllClassCheckSkuDifferResponse {
  warn?: number;
  list?: AllClassCheckSkuDifferItemResponse[];
}

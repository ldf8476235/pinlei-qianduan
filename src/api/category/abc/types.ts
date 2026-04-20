import type { DiagnosisApiResponse, DiagnosisSessionStatusResponse } from '@/api/category/diagnosis/types';

export type AbcTypeCode = 'sales' | 'gross' | 'contribution';

export interface AbcTypeParamVO {
  abcType: string;
  abcTypeName: string;
  salesPer?: number;
  grossPer?: number;
  salesQuantityPer?: number;
  arate?: number;
  brate?: number;
  crate?: number;
  askuRate?: number;
  bskuRate?: number;
  cskuRate?: number;
}

export interface AbcImageItemVO {
  abcType: string;
  currentSalesPer?: number;
  currentSkuPer?: number;
  compareSalesPer?: number;
  compareSkuPer?: number;
  setSalesPer?: number;
  setSkuPer?: number;
}

export interface AbcMatrixVO {
  aaNum?: number;
  abNum?: number;
  acNum?: number;
  anNum?: number;
  atNum?: number;
  baNum?: number;
  bbNum?: number;
  bcNum?: number;
  bnNum?: number;
  btNum?: number;
  caNum?: number;
  cbNum?: number;
  ccNum?: number;
  cnNum?: number;
  ctNum?: number;
}

export interface AbcDetailsItemVO {
  abcType: string;
  setSalesPer?: number;
  setSales?: number;
  setSkuPer?: number;
  setSku?: number;
  currentSku?: number;
  currentSkuPer?: number;
  stockQuantity?: number;
  stockQuantityPer?: number;
  compareSku?: number;
  compareSkuPer?: number;
  changeSku?: number;
  currentSales?: number;
}

export interface AbcParamUpdateItemVO {
  abcType: string;
  abcTypeName: string;
  salesPer?: number;
  grossPer?: number;
  salesQuantityPer?: number;
  arate?: number;
  brate?: number;
  crate?: number;
  askuRate?: number;
  bskuRate?: number;
  cskuRate?: number;
}

export interface AbcParamUpdateRequestVO {
  sessionId: string;
  abcList: AbcParamUpdateItemVO[];
}

export interface AbcParamUpdateResponseVO {
  jobId?: number;
  status?: string;
}

export interface AbcSalesListQuery extends PageQuery {
  sessionId: string;
  abcType: string;
  status?: string[];
  promotion?: string;
  currentAbc?: string;
  compareAbc?: string;
  order?: string;
  orderType?: 'asc' | 'desc';
}

export interface AbcSalesListItemVO {
  productNo: string;
  productName: string;
  productStatus?: string;
  productStatusNo?: string;
  storeNum?: number;
  currentAbc?: string;
  compareAbc?: string;
  contribution?: number;
  contributionPer?: number;
  saleQuantity?: number;
  saleQuantityPsd?: number;
  sales?: number;
  salesPer?: number;
  salesPsd?: number;
  gross?: number;
  grossPer?: number;
  grossPsd?: number;
  grossRate?: number;
  stockQuantity?: number;
  turnoverRate?: number;
  turnoverDays?: number;
  stockSalesRate?: number;
  contributionRate?: number;
  gmroi?: number;
  salesRate?: number;
  activity?: string;
  firstSaleDate?: string;
  newProduct?: string;
  keyProduct?: string;
  seasonableFlag?: string;
  seasonableFlagName?: string;
  seasonableStartDate?: string;
  seasonableEndDate?: string;
  classNo?: string;
  className?: string;
  classLevel?: number;
  productBarcode?: string;
  brandName?: string;
  spec?: string;
  inPrice?: number;
  salesPrice?: number;
  productVendorNo?: string;
  productVendorName?: string;
  productVendorNoName?: string;
}

export interface AbcSalesListResponseVO {
  records: AbcSalesListItemVO[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export type AbcDiagnosisApiResponse<T> = DiagnosisApiResponse<T>;
export type AbcSessionStatusVO = DiagnosisSessionStatusResponse;

import type { DiagnosisApiResponse } from '@/api/category/diagnosis/types';

export interface LegacyNodeResponse<T> {
  success: boolean;
  message: string;
  code: number;
  result: T;
  timestamp: number;
}

export interface GmroiQuadrantItemVO {
  gmroiType?: number;
  productNo?: string;
  productName?: string;
  sales?: number;
  saleQuantity?: number;
  gross?: number;
  grossRate?: number;
  turnoverRate?: number;
  grossRole?: string;
}

export interface GmroiQuadrantVO {
  grossRate?: number;
  turnoverRate?: number;
  list: GmroiQuadrantItemVO[];
  scaleX?: number[];
  scaleY?: number[];
}

export interface GmroiSalesListQuery {
  sessionId: string;
  status?: string[];
  promotion?: string;
  currentGmroi?: string;
  compareGmroi?: string;
  gmroiList?: string[];
  page?: number;
  size?: number;
  order?: string;
  orderType?: string;
}

export interface GmroiSalesListItemVO {
  productNo?: string;
  productName?: string;
  productStatus?: string;
  productStatusNo?: string;
  storeNum?: number;
  currentGrossRole?: string;
  currentGrossRoleName?: string;
  compareGrossRole?: string;
  compareGrossRoleName?: string;
  currentGmroiRole?: string;
  currentGmroiRoleName?: string;
  compareGmroiRole?: string;
  compareGmroiRoleName?: string;
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
  className?: string;
  productVendorName?: string;
}

export interface GmroiSalesListResponseVO {
  records: GmroiSalesListItemVO[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export type GmroiLegacyResponse<T> = LegacyNodeResponse<T>;
export type GmroiSessionStatusVO = DiagnosisApiResponse<any>;

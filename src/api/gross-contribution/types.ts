import type { DiagnosisApiResponse } from '@/api/category/diagnosis/types';

export interface LegacyNodeResponse<T> {
  success: boolean;
  message: string;
  code: number;
  result: T;
  timestamp: number;
}

export interface GrossFourQuadrantItemVO {
  contributionType?: number;
  productNo?: string;
  productName?: string;
  sales?: number;
  salesPer?: number;
  gross?: number;
  grossRate?: number;
}

export interface GrossFourQuadrantVO {
  salesPer?: number;
  gross?: number;
  list: GrossFourQuadrantItemVO[];
  scaleX?: number[];
}

export interface GrossSalesListQuery {
  sessionId: string;
  status?: string[];
  promotion?: string;
  currentGross?: string;
  compareGross?: string;
  page?: number;
  size?: number;
  order?: string;
  orderType?: string;
}

export interface GrossSalesListItemVO {
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

export interface GrossSalesListResponseVO {
  records: GrossSalesListItemVO[];
  total: number;
  size: number;
  current: number;
  pages: number;
}

export type GrossLegacyResponse<T> = LegacyNodeResponse<T>;

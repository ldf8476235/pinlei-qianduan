import type { DiagnosisApiResponse } from '@/api/category/diagnosis/types';

export interface VendorSalesShareItemVO {
  productVendorNo?: string;
  productVendorName?: string;
  sales?: number;
  salesPer?: number;
}

export interface VendorSummaryVO {
  summaryOne?: string[];
  summaryTwo?: string[];
  summaryThree?: string[];
}

export interface VendorRankingItemVO {
  productVendorNo?: string;
  productVendorName?: string;
  data?: number;
}

export interface VendorRankingVO {
  ave?: number;
  maxData?: number;
  minData?: number;
  total?: number;
  list: VendorRankingItemVO[];
}

export type SupplierApiResponse<T> = DiagnosisApiResponse<T>;

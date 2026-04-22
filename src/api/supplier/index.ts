import request from '@/utils/request';
import type { SupplierApiResponse, VendorRankingVO, VendorSalesShareItemVO, VendorSummaryVO } from './types';

export const getVendorSalesShare = (sessionId: string): Promise<SupplierApiResponse<VendorSalesShareItemVO[]>> => {
  return request({ url: '/api/v1/vendor-analysis/sales-share', method: 'get', params: { sessionId } });
};

export const getVendorSummary = (sessionId: string): Promise<SupplierApiResponse<VendorSummaryVO>> => {
  return request({ url: '/api/v1/vendor-analysis/summary', method: 'get', params: { sessionId } });
};

export const getVendorRanking = (
  sessionId: string,
  type?: string,
  page?: number,
  size?: number,
  orderType?: string
): Promise<SupplierApiResponse<VendorRankingVO>> => {
  return request({ url: '/api/v1/vendor-analysis/ranking', method: 'get', params: { sessionId, type, page, size, orderType } });
};

export default { getVendorSalesShare, getVendorSummary, getVendorRanking };

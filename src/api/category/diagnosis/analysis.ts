import request from '@/utils/request';
import type { AxiosPromise } from 'axios';

export interface DiagnosisApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  requestId: string;
  timestamp: string;
}

export const getPriceBandDiagram = (sessionId: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/price-band/diagram', method: 'get', params: { sessionId } });

export const getPriceBandRangeSummary = (sessionId: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/price-band/range-summary', method: 'get', params: { sessionId } });

export const getPriceBandDetails = (params: Record<string, any>): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/price-band/details', method: 'get', params });

export const getProductStoreDetails = (params: Record<string, any>): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/product-store/details', method: 'get', params });

export const getBrandOverview = (sessionId: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/brand-analysis/overview', method: 'get', params: { sessionId } });

export const getBrandSalesShare = (sessionId: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/brand-analysis/sales-share', method: 'get', params: { sessionId } });

export const getBrandRanking = (params: Record<string, any>): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/brand-analysis/ranking', method: 'get', params });

export const getBrandSkuSalesChange = (sessionId: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/brand-analysis/sku-sales-change', method: 'get', params: { sessionId } });

export const getBrandDetails = (params: Record<string, any>): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/brand-analysis/list', method: 'get', params });

export const getBrandSkuDetails = (params: Record<string, any>): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/brand-analysis/sku-list', method: 'get', params });

export const getBrandFilterOptions = (sessionId: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/brand-analysis/filter-options', method: 'get', params: { sessionId } });

export const getSpecOverview = (sessionId: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/spec-analysis/overview', method: 'get', params: { sessionId } });

export const getSpecSalesShare = (sessionId: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/spec-analysis/sales-share', method: 'get', params: { sessionId } });

export const getSpecRanking = (params: Record<string, any>): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/spec-analysis/ranking', method: 'get', params });

export const getSpecSkuSalesChange = (sessionId: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/spec-analysis/sku-sales-change', method: 'get', params: { sessionId } });

export const getSpecDetails = (params: Record<string, any>): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/spec-analysis/list', method: 'get', params });

export const getSpecFilterOptions = (sessionId: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/spec-analysis/filter-options', method: 'get', params: { sessionId } });

export const getTagTypes = (sessionId: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/tag-analysis/types', method: 'get', params: { sessionId } });

export const getTagSalesShare = (sessionId: string, tagType: string): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/tag-analysis/sales-share', method: 'get', params: { sessionId, tagType } });

export const getTagDetails = (params: Record<string, any>): AxiosPromise<DiagnosisApiResponse<any>> =>
  request({ url: '/api/v1/tag-analysis/list', method: 'get', params });

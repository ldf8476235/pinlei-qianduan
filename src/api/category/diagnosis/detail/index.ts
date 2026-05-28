import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DiagnosisApiResponse } from '../types';
import { getMockDiagnosisOverview, getMockOverallSummary, getMockTrend, isMockDiagnosisSession, mockApiResponse } from '../mock-demo';
import {
  ChannelSalesDetailsResponse,
  ChannelSalesPieItemResponse,
  ChannelSalesTrendResponse,
  DiagnosisOverviewResponse,
  DiagnosisIntroduceDirectionResponse,
  DiagnosisOverallSummaryResponse,
  LegacySubclassContributionListRequest,
  LegacySubclassContributionRequest,
  LegacyNodeResponse,
  LegacySubclassSalesListResponse,
  LegacySubclassSalesPerItem,
  LegacySubclassSalesTrendResponse,
  CustomerAgeBucketResponse,
  CustomerSalesDetailsResponse,
  CustomerSalesRadarItemResponse,
  DiagnosisTrendsResponse,
  TagDetailPageResponse,
  TagSalesPerResponse,
  TagTypeGroupResponse
} from './types';
import type {
  AllClassCheckListRequest,
  AllClassCheckRequest as LegacyAllClassCheckRequest,
  AllClassCheckSalesChangeResponse as LegacyAllClassCheckSalesChangeResponse,
  AllClassCheckScatterResponse as LegacyAllClassCheckScatterResponse,
  AllClassCheckSkuDifferResponse as LegacyAllClassCheckSkuDifferResponse,
  AllClassCheckSkuResponse as LegacyAllClassCheckSkuResponse
} from './all-class-check-types';

export const queryObsoleteGoodsList = (data: Record<string, any>): AxiosPromise<DiagnosisApiResponse<any>> => {
  return request({
    url: '/api/v1/obsolete-goods/list',
    method: 'post',
    data
  });
};

export const getCategoryDiagnosisDetailSummary = (sessionId: string): AxiosPromise<DiagnosisApiResponse<DiagnosisOverviewResponse>> => {
  if (isMockDiagnosisSession(sessionId)) {
    return mockApiResponse(getMockDiagnosisOverview()) as AxiosPromise<DiagnosisApiResponse<DiagnosisOverviewResponse>>;
  }
  return request({
    url: '/api/v1/diagnosis/overview',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisOverallSummary = (sessionId: string): AxiosPromise<DiagnosisApiResponse<DiagnosisOverallSummaryResponse>> => {
  if (isMockDiagnosisSession(sessionId)) {
    return mockApiResponse(getMockOverallSummary()) as AxiosPromise<DiagnosisApiResponse<DiagnosisOverallSummaryResponse>>;
  }
  return request({
    url: '/api/v1/diagnosis/overall-summary',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisIntroduceDirection = (
  sessionId: string
): AxiosPromise<DiagnosisApiResponse<DiagnosisIntroduceDirectionResponse>> => {
  return request({
    url: '/api/v1/diagnosis/introduce-direction',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisDetailTrend = (
  sessionId: string,
  metricCode?: string,
  tabType?: string
): AxiosPromise<DiagnosisApiResponse<DiagnosisTrendsResponse>> => {
  if (isMockDiagnosisSession(sessionId)) {
    return mockApiResponse(getMockTrend(metricCode || tabType || 'sales')) as AxiosPromise<DiagnosisApiResponse<DiagnosisTrendsResponse>>;
  }
  return request({
    url: '/api/v1/diagnosis/trends',
    method: 'get',
    params: {
      sessionId,
      metricCode,
      tabType
    }
  });
};

export const getCategoryDiagnosisSubClassPie = (
  data: LegacySubclassContributionRequest
): AxiosPromise<LegacyNodeResponse<LegacySubclassSalesPerItem[]>> => {
  return request({
    url: '/salesStoreClass/sonClassSalesPer',
    method: 'post',
    data
  });
};

export const getCategoryDiagnosisSubClassTrend = (
  data: LegacySubclassContributionRequest
): AxiosPromise<LegacyNodeResponse<LegacySubclassSalesTrendResponse>> => {
  return request({
    url: '/salesStoreClass/sonClassSalesTrendChart',
    method: 'post',
    data
  });
};

export const getCategoryDiagnosisSubClassTable = (
  data: LegacySubclassContributionListRequest
): AxiosPromise<LegacyNodeResponse<LegacySubclassSalesListResponse>> => {
  return request({
    url: '/salesStoreClass/sonClassSalesList',
    method: 'post',
    data
  });
};

export const getCategoryDiagnosisChannelPie = (sessionId: string): AxiosPromise<DiagnosisApiResponse<ChannelSalesPieItemResponse[]>> => {
  return request({
    url: '/api/v1/channel-performance/pie',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisChannelTrend = (sessionId: string): AxiosPromise<DiagnosisApiResponse<ChannelSalesTrendResponse>> => {
  return request({
    url: '/api/v1/channel-performance/trend',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisChannelTable = (sessionId: string): AxiosPromise<DiagnosisApiResponse<ChannelSalesDetailsResponse>> => {
  return request({
    url: '/api/v1/channel-performance/details',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisCustomerAgeBuckets = (sessionId: string): AxiosPromise<DiagnosisApiResponse<CustomerAgeBucketResponse[]>> => {
  return request({
    url: '/api/v1/customer-analysis/ages',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisCustomerRadar = (sessionId: string): AxiosPromise<DiagnosisApiResponse<CustomerSalesRadarItemResponse[]>> => {
  return request({
    url: '/api/v1/customer-analysis/radar',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisCustomerDetails = (
  sessionId: string,
  page?: number,
  size?: number,
  order?: string,
  orderType?: string
): AxiosPromise<DiagnosisApiResponse<CustomerSalesDetailsResponse>> => {
  return request({
    url: '/api/v1/customer-analysis/details',
    method: 'get',
    params: { sessionId, page, size, order, orderType }
  });
};

export const getCategoryDiagnosisTagTypes = (sessionId: string): AxiosPromise<DiagnosisApiResponse<TagTypeGroupResponse[]>> => {
  return request({
    url: '/api/v1/tag-analysis/types',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisTagSalesShare = (sessionId: string, tagType: string): AxiosPromise<DiagnosisApiResponse<TagSalesPerResponse>> => {
  return request({
    url: '/api/v1/tag-analysis/sales-share',
    method: 'get',
    params: { sessionId, tagType }
  });
};

export const getCategoryDiagnosisTagList = (
  sessionId: string,
  tagType: string,
  tagList?: string[],
  page?: number,
  size?: number,
  order?: string,
  orderType?: string
): AxiosPromise<DiagnosisApiResponse<TagDetailPageResponse>> => {
  return request({
    url: '/api/v1/tag-analysis/list',
    method: 'get',
    params: { sessionId, tagType, tagList, page, size, order, orderType }
  });
};

export const getAllClassCheckSalesChange = (
  data: AllClassCheckListRequest
): AxiosPromise<DiagnosisApiResponse<LegacyAllClassCheckSalesChangeResponse>> => {
  return request({
    url: '/salesStoreClass/classSalesChange',
    method: 'post',
    data
  });
};

export const getAllClassCheckScatter = (data: LegacyAllClassCheckRequest): AxiosPromise<DiagnosisApiResponse<LegacyAllClassCheckScatterResponse>> => {
  return request({
    url: '/salesStoreClass/allClassCheck',
    method: 'post',
    data
  });
};

export const getAllClassCheckSku = (data: LegacyAllClassCheckRequest): AxiosPromise<DiagnosisApiResponse<LegacyAllClassCheckSkuResponse>> => {
  return request({
    url: '/salesStoreClass/findClassSku',
    method: 'post',
    data
  });
};

export const getAllClassCheckSkuDiffer = (
  data: LegacyAllClassCheckRequest
): AxiosPromise<DiagnosisApiResponse<LegacyAllClassCheckSkuDifferResponse>> => {
  return request({
    url: '/salesStoreClass/findClassSkuDiffer',
    method: 'post',
    data
  });
};

export const getAllClassCheckRoleTypes = (): AxiosPromise<DiagnosisApiResponse<any>> => {
  return request({
    url: '/api/dict/findClassTreeRoleType',
    method: 'get'
  });
};

export default {
  queryObsoleteGoodsList,
  getCategoryDiagnosisDetailSummary,
  getCategoryDiagnosisOverallSummary,
  getCategoryDiagnosisIntroduceDirection,
  getCategoryDiagnosisDetailTrend,
  getCategoryDiagnosisSubClassPie,
  getCategoryDiagnosisSubClassTrend,
  getCategoryDiagnosisSubClassTable,
  getCategoryDiagnosisChannelPie,
  getCategoryDiagnosisChannelTrend,
  getCategoryDiagnosisChannelTable,
  getCategoryDiagnosisCustomerAgeBuckets,
  getCategoryDiagnosisCustomerRadar,
  getCategoryDiagnosisCustomerDetails,
  getCategoryDiagnosisTagTypes,
  getCategoryDiagnosisTagSalesShare,
  getCategoryDiagnosisTagList,
  getAllClassCheckSalesChange,
  getAllClassCheckScatter,
  getAllClassCheckSku,
  getAllClassCheckSkuDiffer,
  getAllClassCheckRoleTypes
};

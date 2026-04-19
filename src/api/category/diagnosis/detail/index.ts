import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { DiagnosisApiResponse } from '../types';
import {
  DiagnosisChannelPieItem,
  DiagnosisChannelTableResponse,
  DiagnosisChannelTrendResponse,
  DiagnosisOverviewResponse,
  DiagnosisSubClassPieItem,
  DiagnosisSubClassTableResponse,
  DiagnosisSubClassTrendResponse,
  DiagnosisTrendsResponse
} from './types';

export const getCategoryDiagnosisDetailSummary = (
  sessionId: string
): AxiosPromise<DiagnosisApiResponse<DiagnosisOverviewResponse>> => {
  return request({
    url: '/api/v1/diagnosis/overview',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisDetailTrend = (
  sessionId: string,
  metricCode?: string
): AxiosPromise<DiagnosisApiResponse<DiagnosisTrendsResponse>> => {
  return request({
    url: '/api/v1/diagnosis/trends',
    method: 'get',
    params: {
      sessionId,
      metricCode
    }
  });
};

export const getCategoryDiagnosisSubClassPie = (
  sessionId: string
): AxiosPromise<DiagnosisApiResponse<DiagnosisSubClassPieItem[]>> => {
  return request({
    url: '/api/v1/diagnosis/subClass/pie',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisSubClassTrend = (
  sessionId: string
): AxiosPromise<DiagnosisApiResponse<DiagnosisSubClassTrendResponse>> => {
  return request({
    url: '/api/v1/diagnosis/subClass/trend',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisSubClassTable = (
  sessionId: string
): AxiosPromise<DiagnosisApiResponse<DiagnosisSubClassTableResponse>> => {
  return request({
    url: '/api/v1/diagnosis/subClass/table',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisChannelPie = (
  sessionId: string
): AxiosPromise<DiagnosisApiResponse<DiagnosisChannelPieItem[]>> => {
  return request({
    url: '/api/v1/diagnosis/channel/pie',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisChannelTrend = (
  sessionId: string
): AxiosPromise<DiagnosisApiResponse<DiagnosisChannelTrendResponse>> => {
  return request({
    url: '/api/v1/diagnosis/channel/trend',
    method: 'get',
    params: { sessionId }
  });
};

export const getCategoryDiagnosisChannelTable = (
  sessionId: string
): AxiosPromise<DiagnosisApiResponse<DiagnosisChannelTableResponse>> => {
  return request({
    url: '/api/v1/diagnosis/channel/table',
    method: 'get',
    params: { sessionId }
  });
};

export default {
  getCategoryDiagnosisDetailSummary,
  getCategoryDiagnosisDetailTrend,
  getCategoryDiagnosisSubClassPie,
  getCategoryDiagnosisSubClassTrend,
  getCategoryDiagnosisSubClassTable,
  getCategoryDiagnosisChannelPie,
  getCategoryDiagnosisChannelTrend,
  getCategoryDiagnosisChannelTable
};

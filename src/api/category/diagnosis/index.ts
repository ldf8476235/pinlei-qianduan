import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  DiagnosisApiResponse,
  DiagnosisRecordPageResponse,
  DiagnosisRecordQuery,
  DiagnosisSessionCreateRequest,
  DiagnosisSessionCreateResponse,
  DiagnosisSessionStatusResponse
} from './types';
import { getMockDiagnosisStatus, isMockDiagnosisSession, mockApiResponse } from './mock-demo';

export const createDiagnosisSession = (
  data: DiagnosisSessionCreateRequest
): AxiosPromise<DiagnosisApiResponse<DiagnosisSessionCreateResponse>> => {
  return request({
    url: '/api/v1/diagnosis/sessions',
    method: 'post',
    data
  });
};

export const getDiagnosisSessionStatus = (
  sessionId: string
): AxiosPromise<DiagnosisApiResponse<DiagnosisSessionStatusResponse>> => {
  if (isMockDiagnosisSession(sessionId)) {
    return mockApiResponse(getMockDiagnosisStatus()) as AxiosPromise<DiagnosisApiResponse<DiagnosisSessionStatusResponse>>;
  }
  return request({
    url: `/api/v1/diagnosis/sessions/${sessionId}/status`,
    method: 'get',
    params: {}
  });
};

export const listDiagnosisRecords = (
  data: DiagnosisRecordQuery
): AxiosPromise<DiagnosisApiResponse<DiagnosisRecordPageResponse>> => {
  return request({
    url: '/api/v1/diagnosis/records',
    method: 'post',
    data
  });
};

export default {
  createDiagnosisSession,
  getDiagnosisSessionStatus,
  listDiagnosisRecords
};

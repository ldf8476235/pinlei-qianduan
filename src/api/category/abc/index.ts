import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type {
  AbcDetailsItemVO,
  AbcDiagnosisApiResponse,
  AbcImageItemVO,
  AbcMatrixVO,
  AbcParamUpdateRequestVO,
  AbcParamUpdateResponseVO,
  AbcSalesListQuery,
  AbcSalesListResponseVO,
  AbcTypeParamVO
} from './types';

export const getAbcParams = (sessionId: string): AxiosPromise<AbcDiagnosisApiResponse<AbcTypeParamVO[]>> => {
  return request({
    url: '/api/v1/abc-structure/params',
    method: 'get',
    params: { sessionId }
  });
};

export const updateAbcParams = (
  data: AbcParamUpdateRequestVO
): AxiosPromise<AbcDiagnosisApiResponse<AbcParamUpdateResponseVO>> => {
  return request({
    url: '/api/v1/abc-structure/params/update',
    method: 'post',
    data
  });
};

export const getAbcImage = (
  sessionId: string,
  abcType: string
): AxiosPromise<AbcDiagnosisApiResponse<AbcImageItemVO[]>> => {
  return request({
    url: '/api/v1/abc-structure/image',
    method: 'get',
    params: { sessionId, abcType }
  });
};

export const getAbcMatrix = (
  sessionId: string,
  abcType: string
): AxiosPromise<AbcDiagnosisApiResponse<AbcMatrixVO>> => {
  return request({
    url: '/api/v1/abc-structure/matrix',
    method: 'get',
    params: { sessionId, abcType }
  });
};

export const getAbcDetails = (
  sessionId: string,
  abcType: string
): AxiosPromise<AbcDiagnosisApiResponse<AbcDetailsItemVO[]>> => {
  return request({
    url: '/api/v1/abc-structure/details',
    method: 'get',
    params: { sessionId, abcType }
  });
};

export const getAbcSalesList = (
  params: AbcSalesListQuery
): AxiosPromise<AbcDiagnosisApiResponse<AbcSalesListResponseVO>> => {
  return request({
    url: '/api/v1/abc-structure/sales-list',
    method: 'get',
    params: {
      sessionId: params.sessionId,
      abcType: params.abcType,
      status: params.status,
      promotion: params.promotion,
      currentAbc: params.currentAbc,
      compareAbc: params.compareAbc,
      page: params.pageNum,
      size: params.pageSize,
      order: params.order,
      orderType: params.orderType
    }
  });
};

export default {
  getAbcParams,
  updateAbcParams,
  getAbcImage,
  getAbcMatrix,
  getAbcDetails,
  getAbcSalesList
};

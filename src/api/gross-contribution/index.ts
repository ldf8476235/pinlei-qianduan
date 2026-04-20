import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type {
  GrossFourQuadrantVO,
  GrossLegacyResponse,
  GrossSalesListQuery,
  GrossSalesListResponseVO
} from './types';

export const getGrossFourQuadrant = (sessionId: string): AxiosPromise<GrossLegacyResponse<GrossFourQuadrantVO>> => {
  return request({
    url: '/classDoctorGross/queryGrossFourQuadrant',
    method: 'post',
    data: { sessionId }
  });
};

export const getGrossSalesPer = (sessionId: string): AxiosPromise<GrossLegacyResponse<any>> => {
  return request({
    url: '/classDoctorGross/queryGrossSalesPer',
    method: 'post',
    data: { sessionId }
  });
};

export const getGrossSkuPer = (sessionId: string): AxiosPromise<GrossLegacyResponse<any>> => {
  return request({
    url: '/classDoctorGross/queryGrossSkuPer',
    method: 'post',
    data: { sessionId }
  });
};

export const getGrossSkuChange = (sessionId: string): AxiosPromise<GrossLegacyResponse<any>> => {
  return request({
    url: '/classDoctorGross/queryGrossSkuChange',
    method: 'post',
    data: { sessionId }
  });
};

export const getGrossSalesList = (
  params: GrossSalesListQuery
): AxiosPromise<GrossLegacyResponse<GrossSalesListResponseVO>> => {
  return request({
    url: '/classDoctorGross/queryGrossSalesList',
    method: 'post',
    data: params
  });
};

export default {
  getGrossFourQuadrant,
  getGrossSalesPer,
  getGrossSkuPer,
  getGrossSkuChange,
  getGrossSalesList
};

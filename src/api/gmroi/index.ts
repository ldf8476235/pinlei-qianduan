import request from '@/utils/request';
import type { AxiosPromise } from 'axios';
import type { GmroiLegacyResponse, GmroiQuadrantVO, GmroiSalesListQuery, GmroiSalesListResponseVO } from './types';

export const getGmroiFourQuadrant = (sessionId: string): AxiosPromise<GmroiLegacyResponse<GmroiQuadrantVO>> => {
  return request({ url: '/classDoctorGmroi/queryGmroiFourQuadrant', method: 'post', data: { sessionId } });
};

export const getGmroiSkuNum = (sessionId: string): AxiosPromise<GmroiLegacyResponse<any>> => {
  return request({ url: '/classDoctorGmroi/queryGmroiSkuNum', method: 'post', data: { sessionId } });
};

export const getGmroiSkuPer = (sessionId: string): AxiosPromise<GmroiLegacyResponse<any>> => {
  return request({ url: '/classDoctorGmroi/queryGmroiSkuPer', method: 'post', data: { sessionId } });
};

export const getGmroiSkuChange = (sessionId: string): AxiosPromise<GmroiLegacyResponse<any>> => {
  return request({ url: '/classDoctorGmroi/queryGmroiSkuChange', method: 'post', data: { sessionId } });
};

export const getGmroiSalesList = (params: GmroiSalesListQuery): AxiosPromise<GmroiLegacyResponse<GmroiSalesListResponseVO>> => {
  return request({ url: '/classDoctorGmroi/queryGmroiSalesList', method: 'post', data: params });
};

export default { getGmroiFourQuadrant, getGmroiSkuNum, getGmroiSkuPer, getGmroiSkuChange, getGmroiSalesList };

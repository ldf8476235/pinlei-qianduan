import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoryDiagnosisOverviewVO, CategoryDiagnosisQuery, CategoryDiagnosisTrendVO, CategoryDiagnosisVO } from './types';

/**
 * 查询品类诊断概览
 */
export const getCategoryDiagnosisOverview = (
  query: Omit<CategoryDiagnosisQuery, 'pageNum' | 'pageSize'>
): AxiosPromise<CategoryDiagnosisOverviewVO> => {
  return request({
    url: '/category/diagnosis/overview',
    method: 'get',
    params: query
  });
};

/**
 * 查询品类诊断趋势
 */
export const listCategoryDiagnosisTrend = (query: Omit<CategoryDiagnosisQuery, 'pageNum' | 'pageSize'>): AxiosPromise<CategoryDiagnosisTrendVO[]> => {
  return request({
    url: '/category/diagnosis/trend',
    method: 'get',
    params: query
  });
};

/**
 * 查询品类诊断列表
 */
export const listCategoryDiagnosis = (query: CategoryDiagnosisQuery): AxiosPromise<CategoryDiagnosisVO[]> => {
  return request({
    url: '/category/diagnosis/list',
    method: 'get',
    params: query
  });
};

export default {
  getCategoryDiagnosisOverview,
  listCategoryDiagnosisTrend,
  listCategoryDiagnosis
};

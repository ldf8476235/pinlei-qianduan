import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoryDiagnosisDetailQuery, CategoryDiagnosisDetailSummaryVO, CategoryDiagnosisMetricGroupVO, CategoryDiagnosisTrendVO } from './types';

/**
 * 查询品类诊断详情头部信息
 */
export const getCategoryDiagnosisDetailSummary = (query: CategoryDiagnosisDetailQuery): AxiosPromise<CategoryDiagnosisDetailSummaryVO> => {
  return request({
    url: '/category/diagnosis/detail/summary',
    method: 'get',
    params: query
  });
};

/**
 * 查询品类诊断详情指标卡片
 */
export const getCategoryDiagnosisDetailMetrics = (query: CategoryDiagnosisDetailQuery): AxiosPromise<CategoryDiagnosisMetricGroupVO> => {
  return request({
    url: '/category/diagnosis/detail/metrics',
    method: 'get',
    params: query
  });
};

/**
 * 查询品类诊断详情趋势图
 */
export const getCategoryDiagnosisDetailTrend = (
  query: CategoryDiagnosisDetailQuery & { metricKey: string }
): AxiosPromise<CategoryDiagnosisTrendVO> => {
  return request({
    url: '/category/diagnosis/detail/trend',
    method: 'get',
    params: query
  });
};

export default {
  getCategoryDiagnosisDetailSummary,
  getCategoryDiagnosisDetailMetrics,
  getCategoryDiagnosisDetailTrend
};

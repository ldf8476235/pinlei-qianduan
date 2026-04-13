import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  CategoryCheckAlertVO,
  CategoryCheckFilterVO,
  CategoryCheckQuery,
  CategoryCheckRoleVO,
  CategoryCheckSalesQuery,
  CategoryCheckSalesVO,
  CategoryCheckSkuVO
} from './types';

/**
 * 查询筛选选项
 */
export const getCategoryCheckFilter = (): AxiosPromise<CategoryCheckFilterVO> => {
  return request({
    url: '/category/check/filter',
    method: 'get'
  });
};

/**
 * 查询异常预警
 */
export const getCategoryCheckAlert = (data: CategoryCheckQuery): AxiosPromise<CategoryCheckAlertVO> => {
  return request({
    url: '/category/check/alert',
    method: 'post',
    data
  });
};

/**
 * 查询品类角色散点图
 */
export const getCategoryCheckRole = (data: CategoryCheckQuery): AxiosPromise<CategoryCheckRoleVO> => {
  return request({
    url: '/category/check/role',
    method: 'post',
    data
  });
};

/**
 * 查询品类SKU双图表
 */
export const getCategoryCheckSku = (data: CategoryCheckQuery): AxiosPromise<CategoryCheckSkuVO> => {
  return request({
    url: '/category/check/sku',
    method: 'post',
    data
  });
};

/**
 * 查询销售额变动图
 */
export const getCategoryCheckSales = (data: CategoryCheckSalesQuery): AxiosPromise<CategoryCheckSalesVO> => {
  return request({
    url: '/category/check/sales',
    method: 'post',
    data
  });
};

export default {
  getCategoryCheckFilter,
  getCategoryCheckAlert,
  getCategoryCheckRole,
  getCategoryCheckSku,
  getCategoryCheckSales
};

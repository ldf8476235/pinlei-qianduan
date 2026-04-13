import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import {
  CategoryFilterPayloadVO,
  CategorySankeyVO,
  CategoryTreeChildrenQuery,
  CategoryTreeQuery,
  CategoryClassTreeResponseVO,
  StoreFindRequest,
  StoreOptionResponse
} from './types';

export const getCategoryFilterOptions = (): AxiosPromise<CategoryFilterPayloadVO> => {
  return request({
    url: '/api/categories/filter-options',
    method: 'post'
  });
};

export const listCategoryRoles = (): AxiosPromise<any> => {
  return request({
    url: '/api/categories/filter-options',
    method: 'post'
  });
};

export const findStore = (data: StoreFindRequest): AxiosPromise<StoreOptionResponse[]> => {
  return request({
    url: '/api/store/findStore',
    method: 'post',
    data
  });
};

export const queryCategoryTree = (data: CategoryTreeQuery): AxiosPromise<CategorySankeyVO> => {
  return request({
    url: '/api/categories/tree/query',
    method: 'post',
    data
  });
};

export const queryCategoryClassTree = (level: number): AxiosPromise<CategoryClassTreeResponseVO> => {
  return request({
    url: '/api/categories/class-tree',
    method: 'post',
    data: { level }
  });
};

export const queryCategoryTreeChildren = (data: CategoryTreeChildrenQuery): AxiosPromise<CategorySankeyVO> => {
  const nextLevel = Math.min(Number(data.level || data.classLevel || 1) + 1, 4);
  return request({
    url: '/api/categories/tree/query',
    method: 'post',
    data: {
      ...data,
      classNo: [String(data.categoryId)],
      classLevel: nextLevel
    }
  });
};

export default {
  getCategoryFilterOptions,
  listCategoryRoles,
  findStore,
  queryCategoryClassTree,
  queryCategoryTree,
  queryCategoryTreeChildren
};

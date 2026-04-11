import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoryRoleVO, CategorySankeyVO, CategoryTreeChildrenQuery, CategoryTreeQuery } from './types';

/**
 * 查询品类角色列表
 */
export const listCategoryRoles = (): AxiosPromise<CategoryRoleVO[]> => {
  return request({
    url: '/category/role/list',
    method: 'get'
  });
};

/**
 * 查询品类树
 */
export const queryCategoryTree = (data: CategoryTreeQuery): AxiosPromise<CategorySankeyVO> => {
  return request({
    url: '/category/tree/query',
    method: 'post',
    data
  });
};

/**
 * 查询子级品类树
 */
export const queryCategoryTreeChildren = (data: CategoryTreeChildrenQuery): AxiosPromise<CategorySankeyVO> => {
  return request({
    url: '/category/tree/children',
    method: 'post',
    data
  });
};

export default {
  listCategoryRoles,
  queryCategoryTree,
  queryCategoryTreeChildren
};

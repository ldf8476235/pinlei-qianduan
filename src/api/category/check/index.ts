import request from '@/utils/request';
import { AxiosPromise } from 'axios';
import { CategoryCheckQuery, CategoryCheckVO } from './types';

/**
 * 查询品类核对分页
 */
export const listCategoryCheck = (query: CategoryCheckQuery): AxiosPromise<CategoryCheckVO[]> => {
  return request({
    url: '/category/check/list',
    method: 'get',
    params: query
  });
};

export default {
  listCategoryCheck
};

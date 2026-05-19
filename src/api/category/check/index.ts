import request from '@/utils/request';
import type {
  CategoryClassTreeNodeVO,
  CategoryFilterPayloadVO,
  StoreFindRequest,
  StoreOptionResponse,
  OptionVO
} from '@/api/category/tree/types';
import { getCategoryFilterOptions, findStore as fetchStoreOptions, queryCategoryClassTree } from '@/api/category/tree';
import type {
  CategoryCheckAlertVO,
  CategoryCheckFilterVO,
  CategoryCheckQuery,
  CategoryCheckRoleVO,
  CategoryCheckSalesQuery,
  CategoryCheckSalesVO,
  CategoryCheckSkuVO,
  CategoryRoleScatterItemVO,
  CategorySkuChartItemVO,
  CategorySalesChartItemVO
} from './types';

type BackendWrap<T> = Promise<{ data: T }>;

const unwrap = <T>(res: any): T => res?.data?.result ?? res?.data?.data ?? res?.data ?? res?.result ?? res;

const toNumber = (value: any): number => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
};

const toText = (value: any): string => String(value ?? '');

export type CategoryCheckTreeOption = OptionVO & {
  children?: CategoryCheckTreeOption[];
};

const resolveClassTreeChildren = (node: any): CategoryClassTreeNodeVO[] => {
  if (Array.isArray(node?.children)) return node.children;
  if (Array.isArray(node?.subClass)) return node.subClass;
  return [];
};

const toBackendQuery = (data: CategoryCheckQuery) => ({
  storeNo: toText(data.storeScope),
  classLevel: data.categoryLevel,
  classNo: (data.categoryIds || []).map((item) => toText(item)),
  currentStartDate: data.currentStartDate,
  currentEndDate: data.currentEndDate,
  compareStartDate: data.compareStartDate,
  compareEndDate: data.compareEndDate
});

const flattenClassTree = (nodes: CategoryClassTreeNodeVO[] = []): OptionVO[] => {
  const result: OptionVO[] = [];
  const walk = (list: CategoryClassTreeNodeVO[]) => {
    list.forEach((node) => {
      const value = toText((node as any).id || (node as any).classNo || node.label || node.level || '');
      const label = toText(node.labelName || node.className || node.label || value);
      const level = toText((node as any).classLevel || node.levelFlag || '');
      const children = resolveClassTreeChildren(node);
      if (value && value !== '0' && label) {
        result.push({
          label: label.startsWith(value) ? label : `${value}${label}`,
          value,
          level
        });
      }
      if (children.length) {
        walk(children);
      }
    });
  };
  walk(nodes);
  return result;
};

const normalizeClassTree = (nodes: CategoryClassTreeNodeVO[] = []): CategoryCheckTreeOption[] => {
  const walk = (list: CategoryClassTreeNodeVO[]): CategoryCheckTreeOption[] =>
    list.flatMap((node) => {
      const value = toText((node as any).id || (node as any).classNo || node.label || node.level || '');
      const label = toText(node.labelName || node.className || node.label || value);
      const level = toText((node as any).classLevel || node.levelFlag || '');
      const children = walk(resolveClassTreeChildren(node));
      if (!value || value === '0' || !label) {
        return children;
      }
      return [
        {
          label: label.startsWith(value) ? label : `${value}${label}`,
          value,
          level,
          children
        }
      ];
    });
  return walk(nodes);
};

const normalizeStoreOptions = (rows: StoreOptionResponse[] = []): OptionVO[] => {
  const mapped = rows
    .map((item) => {
      const storeNo = toText(item.storeNo);
      const storeName = toText(item.storeName);
      if (!storeNo) {
        return null;
      }
      return {
        label: storeName ? `${storeNo} ${storeName}` : storeNo,
        value: storeNo
      } as OptionVO;
    })
    .filter(Boolean) as OptionVO[];
  return [{ label: '全店', value: '0' }, ...mapped];
};

export const getCategoryCheckFilter = async (): BackendWrap<CategoryCheckFilterVO> => {
  const [filterRes, storeRes] = await Promise.all([
    getCategoryFilterOptions(),
    fetchStoreOptions({ keyword: '', limit: 50 } as StoreFindRequest)
  ]);

  const payload = unwrap<CategoryFilterPayloadVO>(filterRes) || {};

  return {
    data: {
      storeOptions: payload.storeOptions?.length ? payload.storeOptions : normalizeStoreOptions(unwrap<StoreOptionResponse[]>(storeRes) || []),
      levelOptions: (payload.categoryLevels || []).map((item) => ({ label: item.label, value: item.value })),
      categoryOptions: []
    }
  };
};

export const getCategoryCheckCategoryOptions = async (
  level: number | string
): BackendWrap<{ options: OptionVO[]; tree: CategoryCheckTreeOption[] }> => {
  const currentLevel = Number(level || 1);
  const treeRes = await queryCategoryClassTree(4);
  const treePayload = unwrap<{ content?: CategoryClassTreeNodeVO[] }>(treeRes) || {};
  const options = flattenClassTree(treePayload.content || []).filter((item) => String(item.level || currentLevel) === String(currentLevel));

  return {
    data: {
      options: options.length ? options : flattenClassTree(treePayload.content || []),
      tree: normalizeClassTree(treePayload.content || [])
    }
  };
};

export const getCategoryCheckAlert = async (data: CategoryCheckQuery): BackendWrap<CategoryCheckAlertVO> => {
  const payload = toBackendQuery(data);
  const [roleRes, skuRes, skuDiffRes] = await Promise.all([
    request({
      url: '/salesStoreClass/allClassCheck',
      method: 'post',
      data: payload
    }),
    request({
      url: '/salesStoreClass/findClassSku',
      method: 'post',
      data: payload
    }),
    request({
      url: '/salesStoreClass/findClassSkuDiffer',
      method: 'post',
      data: payload
    })
  ]);

  const roleData = unwrap<any>(roleRes) || {};
  const skuData = unwrap<any>(skuRes) || {};
  const skuDiffData = unwrap<any>(skuDiffRes) || {};

  return {
    data: {
      roleAbnormalCount: toNumber(roleData.warn ?? roleData.list?.length),
      skuStructureAbnormalCount: toNumber(skuData.warn ?? skuData.list?.length),
      skuPresetAbnormalCount: toNumber(skuDiffData.warn ?? skuDiffData.list?.length)
    }
  };
};

export const getCategoryCheckRole = async (data: CategoryCheckQuery): BackendWrap<CategoryCheckRoleVO> => {
  const res = await request({
    url: '/salesStoreClass/allClassCheck',
    method: 'post',
    data: toBackendQuery(data)
  });

  const payload = unwrap<any>(res) || {};
  const x = toNumber(payload.xyData?.avgPointX ?? 10);
  const y = toNumber(payload.xyData?.avgPointY ?? 10);
  const list = (payload.list || []).map((item: any) => {
    const contributionRate = toNumber(item.contributionRatePer ?? item.contributionRate);
    const growthRate = toNumber(item.salesCompareRate ?? item.growthRate);
    const roleMatchStatus: CategoryRoleScatterItemVO['roleMatchStatus'] =
      contributionRate === 0 && growthRate === 0
        ? 'unset'
        : contributionRate >= x && growthRate >= y
          ? 'match'
          : contributionRate < x && growthRate < y
            ? 'unset'
            : 'mismatch';

    return {
      categoryId: item.classNo,
      categoryCode: item.classNo,
      categoryName: item.className,
      roleName: item.classRoleName || item.classRoleTypeDescribe || item.classRoleType,
      roleMatchStatus,
      growthRate,
      contributionRate,
      skuCount: toNumber(item.saleQuantity),
      salesAmount: toNumber(item.sales),
      rawData: item
    } as CategoryRoleScatterItemVO;
  });

  return {
    data: {
      list,
      splitLineX: x,
      splitLineY: y
    }
  };
};

export const getCategoryCheckSku = async (data: CategoryCheckQuery): BackendWrap<CategoryCheckSkuVO> => {
  const payload = toBackendQuery(data);
  const [skuRes, skuDiffRes] = await Promise.all([
    request({
      url: '/salesStoreClass/findClassSku',
      method: 'post',
      data: payload
    }),
    request({
      url: '/salesStoreClass/findClassSkuDiffer',
      method: 'post',
      data: payload
    })
  ]);

  const skuPayload = unwrap<any>(skuRes) || {};
  const skuDiffPayload = unwrap<any>(skuDiffRes) || {};
  const diffMap = new Map<string, any>((skuDiffPayload.list || []).map((item: any) => [toText(item.classNo), item]));

  const list = (skuPayload.list || []).map((item: any) => {
    const diffItem = diffMap.get(toText(item.classNo)) || {};
    return {
      categoryId: item.classNo,
      categoryName: item.className,
      skuRatio: toNumber(item.skuPer),
      salesRatio: toNumber(item.salesPer),
      ratioDiff: toNumber(item.skuDifference),
      currentSkuCount: toNumber(diffItem.saleSku ?? item.classSku),
      presetSkuCount: toNumber(diffItem.suggestSaleSku),
      skuDiff: toNumber(diffItem.skuDiffer ?? 0)
    } as CategorySkuChartItemVO;
  });

  return {
    data: {
      list
    }
  };
};

export const getCategoryCheckSales = async (data: CategoryCheckSalesQuery): BackendWrap<CategoryCheckSalesVO> => {
  const res = await request({
    url: '/salesStoreClass/classSalesChange',
    method: 'post',
    data: {
      ...toBackendQuery(data),
      page: toNumber(data.pageNum ?? 1),
      size: toNumber(data.pageSize ?? 10)
    }
  });

  const payload = unwrap<any>(res) || {};
  const rows = (payload.content || payload.list || []).map((item: any) => {
    const growthRate = toNumber(item.salesCompareRate);
    const salesAmount = toNumber(item.sales);
    const explicitCompareSales = item.salesCompare ?? item.compareSales ?? item.compareSalesAmount ?? item.lastSales ?? item.lastYearSales ?? item.oldSales;
    const compareSalesAmount =
      explicitCompareSales !== undefined && explicitCompareSales !== null
        ? toNumber(explicitCompareSales)
        : growthRate === -100
          ? 0
          : salesAmount / (1 + growthRate / 100);

    return {
      categoryId: item.classNo,
      categoryName: item.className,
      growthRate,
      salesAmount,
      compareSalesAmount
    };
  }) as CategorySalesChartItemVO[];

  return {
    data: {
      rows,
      total: toNumber(payload.totalElements ?? payload.total ?? rows.length),
      pageNum: toNumber(data.pageNum ?? 1),
      pageSize: toNumber(data.pageSize ?? rows.length ?? 10)
    }
  };
};

export default {
  getCategoryCheckFilter,
  getCategoryCheckAlert,
  getCategoryCheckRole,
  getCategoryCheckSku,
  getCategoryCheckSales
};

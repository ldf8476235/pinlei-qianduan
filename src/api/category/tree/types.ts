export interface CategoryTreeQuery {
  deptId?: number;
  retailTypeId?: string;
  businessCircleId?: string;
  deptGroupId?: string;
  storeNo?: string;
  classLevel?: number;
  classNo?: string[];
  classRole?: string[];
  skuAbnormal?: string[];
}

export interface CategoryTreeChildrenQuery extends CategoryTreeQuery {
  categoryId: string | number;
  level?: number;
}

export interface OptionVO {
  label: string;
  value: string | number;
  level?: string;
}

export interface CategoryRoleVO {
  roleName: string;
  roleNo?: string;
}

export interface LegacyTreeNodeVO {
  classNo: string;
  className: string;
  parentClassNo?: string;
  classLevel?: number;
  suggestSaleSku?: number;
  saleSku?: number;
  roleNo?: string;
  roleType?: string;
  skuDiffer?: number | null;
  sysSuggestSaleSku?: number;
  subClass?: LegacyTreeNodeVO[] | null;
}

export interface CategoryFilterPayloadVO {
  categoryLevels?: OptionVO[];
  categories?: OptionVO[];
  categoryRoles?: OptionVO[];
  skuAbnormal?: OptionVO[];
  classSalesStatusNo?: Array<{ label?: string; value?: string | number }>;
  storeOptions?: OptionVO[];
}

export interface StoreFindRequest {
  keyword?: string;
  retailTypeId?: string;
  businessCircleId?: string;
  deptGroupId?: string;
  limit?: number;
}

export interface StoreOptionResponse {
  storeNo: string;
  storeName: string;
}

export interface CategoryClassTreeNodeVO {
  level?: string;
  flevel?: string;
  levelFlag?: number;
  className?: string;
  labelName?: string;
  canChoose?: boolean;
  children?: CategoryClassTreeNodeVO[];
  id?: string;
  label?: string;
}

export interface CategoryClassTreeResponseVO {
  content?: CategoryClassTreeNodeVO[];
}

export interface SankeyNodeVO {
  id: string | number;
  categoryId?: string | number;
  parentId?: string | number;
  level?: number;
  categoryCode?: string;
  categoryName?: string;
  roleName?: string;
  skuCount?: number;
  sales30d?: number;
  name: string;
  value?: number;
  itemStyle?: Record<string, any>;
  label?: Record<string, any>;
  [key: string]: any;
}

export interface SankeyLinkVO {
  source: string | number;
  target: string | number;
  value: number;
  [key: string]: any;
}

export interface CategorySankeyVO {
  success?: boolean;
  message?: string;
  code?: number;
  updateTime?: string;
  data?: any;
  result?: LegacyTreeNodeVO[];
  nodes?: SankeyNodeVO[];
  links?: SankeyLinkVO[];
  nodeList?: SankeyNodeVO[];
  linkList?: SankeyLinkVO[];
  [key: string]: any;
}

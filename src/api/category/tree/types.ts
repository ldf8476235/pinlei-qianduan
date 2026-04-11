export interface CategoryTreeQuery {
  storeScope?: string;
  categoryLevel?: 1 | 2 | 3;
  categoryIds?: Array<string | number>;
  roleNames?: string[];
  skuAbnormalTypes?: string[];
  disabledRoles?: string[];
}

export interface CategoryTreeChildrenQuery {
  categoryId: string | number;
  level?: number;
  disabledRoles?: string[];
  storeScope?: string;
  categoryLevel?: 1 | 2 | 3;
  categoryIds?: Array<string | number>;
  roleNames?: string[];
  skuAbnormalTypes?: string[];
}

export interface OptionVO {
  label: string;
  value: string | number;
}

export interface CategoryRoleVO {
  roleName: string;
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
  updateTime?: string;
  currentId?: string | number | null;
  currentName?: string;
  currentLevel?: number;
  parentId?: string | number | null;
  storeOptions?: OptionVO[];
  categoryOptions?: OptionVO[];
  skuAbnormalOptions?: OptionVO[];
  nodes?: SankeyNodeVO[];
  links?: SankeyLinkVO[];
  nodeList?: SankeyNodeVO[];
  linkList?: SankeyLinkVO[];
  [key: string]: any;
}

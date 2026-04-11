export interface CategoryCheckQuery extends PageQuery {
  storeCode?: string;
  checkDate?: string;
  keyword?: string;
}

export interface CategoryCheckVO {
  categoryId: string | number;
  categoryName: string;
  skuCount: number;
  mappedSkuCount: number;
  missingSkuCount: number;
  checkRate: number;
  checkDate: string;
}

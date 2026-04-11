export interface CategoryDiagnosisQuery extends PageQuery {
  storeCode?: string;
  startDate?: string;
  endDate?: string;
}

export interface CategoryDiagnosisOverviewVO {
  totalCategory: number;
  healthyCategory: number;
  warningCategory: number;
  riskCategory: number;
}

export interface CategoryDiagnosisTrendVO {
  categoryName: string;
  healthScore: number;
}

export interface CategoryDiagnosisVO {
  categoryId: string | number;
  categoryName: string;
  healthScore: number;
  salesAmount: number;
  grossMarginRate: number;
  issueCount: number;
  advice: string;
}

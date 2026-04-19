export interface SpecDetailQuery {
  specType?: string;
  specName?: string;
  newSaleSpec?: string;
  pageNum?: number;
  pageSize?: number;
  orderByColumn?: string;
  isAsc?: 'asc' | 'desc';
}

export interface SpecDetailRow {
  specCode: string;
  specName: string;
  specType: string;
  specTypeLabel: string;
  newSaleSpec: string;
  newSaleSpecLabel: string;
  skuCountTotal: number;
  skuCountGrowth: number;
  skuCountShare: number;
  saleQtyTotal: number;
  saleQtyGrowth: number;
  saleQtyShare: number;
  saleQtyPsd: number;
  salesAmountTotal: number;
  salesAmountGrowth: number;
  salesAmountShare: number;
  salesAmountPsd: number;
  grossAmountTotal: number;
  grossAmountGrowth: number;
  grossAmountShare: number;
  grossAmountPsd: number;
  grossRateTotal: number;
  grossRateGrowth: number;
  inventoryQty: number;
  turnoverRate: number;
  turnoverDays: number;
  inventorySalesRatio: number;
  grossContributionRate: number;
  gmroi: number;
  sellThroughRate: number;
  promotionSkuCount: number;
}

const mockRows: SpecDetailRow[] = [
  {
    specCode: 'S001',
    specName: '750ml',
    specType: 'large',
    specTypeLabel: '大规格',
    newSaleSpec: 'N',
    newSaleSpecLabel: '否',
    skuCountTotal: 12,
    skuCountGrowth: 8.2,
    skuCountShare: 13.4,
    saleQtyTotal: 6520,
    saleQtyGrowth: 16.6,
    saleQtyShare: 15.2,
    saleQtyPsd: 34.3,
    salesAmountTotal: 132800,
    salesAmountGrowth: 19.6,
    salesAmountShare: 15.4,
    salesAmountPsd: 698.9,
    grossAmountTotal: 46850,
    grossAmountGrowth: 18.2,
    grossAmountShare: 15.8,
    grossAmountPsd: 246.6,
    grossRateTotal: 35.28,
    grossRateGrowth: 1.6,
    inventoryQty: 820,
    turnoverRate: 3.7,
    turnoverDays: 29.1,
    inventorySalesRatio: 0.94,
    grossContributionRate: 14.6,
    gmroi: 3.38,
    sellThroughRate: 81.5,
    promotionSkuCount: 5
  },
  {
    specCode: 'S002',
    specName: '1kg',
    specType: 'large',
    specTypeLabel: '大规格',
    newSaleSpec: 'Y',
    newSaleSpecLabel: '是',
    skuCountTotal: 9,
    skuCountGrowth: 6.1,
    skuCountShare: 10.1,
    saleQtyTotal: 5980,
    saleQtyGrowth: 13.8,
    saleQtyShare: 13.9,
    saleQtyPsd: 31.4,
    salesAmountTotal: 118600,
    salesAmountGrowth: 14.2,
    salesAmountShare: 13.8,
    salesAmountPsd: 624.2,
    grossAmountTotal: 42120,
    grossAmountGrowth: 13.2,
    grossAmountShare: 14.2,
    grossAmountPsd: 221.7,
    grossRateTotal: 35.51,
    grossRateGrowth: 1.1,
    inventoryQty: 760,
    turnoverRate: 3.3,
    turnoverDays: 31.4,
    inventorySalesRatio: 0.99,
    grossContributionRate: 13.2,
    gmroi: 3.02,
    sellThroughRate: 78.6,
    promotionSkuCount: 4
  },
  {
    specCode: 'S003',
    specName: '500ml',
    specType: 'medium',
    specTypeLabel: '中规格',
    newSaleSpec: 'N',
    newSaleSpecLabel: '否',
    skuCountTotal: 11,
    skuCountGrowth: 3.8,
    skuCountShare: 12.3,
    saleQtyTotal: 4870,
    saleQtyGrowth: 9.7,
    saleQtyShare: 11.3,
    saleQtyPsd: 25.6,
    salesAmountTotal: 95400,
    salesAmountGrowth: 11.4,
    salesAmountShare: 11.1,
    salesAmountPsd: 501.9,
    grossAmountTotal: 33580,
    grossAmountGrowth: 10.1,
    grossAmountShare: 11.3,
    grossAmountPsd: 176.7,
    grossRateTotal: 35.2,
    grossRateGrowth: 0.9,
    inventoryQty: 620,
    turnoverRate: 2.9,
    turnoverDays: 35.6,
    inventorySalesRatio: 1.02,
    grossContributionRate: 10.9,
    gmroi: 2.76,
    sellThroughRate: 73.8,
    promotionSkuCount: 3
  },
  {
    specCode: 'S004',
    specName: '300ml',
    specType: 'medium',
    specTypeLabel: '中规格',
    newSaleSpec: 'Y',
    newSaleSpecLabel: '是',
    skuCountTotal: 8,
    skuCountGrowth: -1.6,
    skuCountShare: 8.9,
    saleQtyTotal: 3890,
    saleQtyGrowth: -2.4,
    saleQtyShare: 9.1,
    saleQtyPsd: 20.5,
    salesAmountTotal: 72800,
    salesAmountGrowth: -3.1,
    salesAmountShare: 8.5,
    salesAmountPsd: 382.9,
    grossAmountTotal: 24860,
    grossAmountGrowth: -2.2,
    grossAmountShare: 8.4,
    grossAmountPsd: 130.8,
    grossRateTotal: 34.15,
    grossRateGrowth: -0.4,
    inventoryQty: 540,
    turnoverRate: 2.4,
    turnoverDays: 41.7,
    inventorySalesRatio: 1.16,
    grossContributionRate: 7.8,
    gmroi: 2.21,
    sellThroughRate: 66.3,
    promotionSkuCount: 2
  },
  {
    specCode: 'S005',
    specName: '200ml',
    specType: 'small',
    specTypeLabel: '小规格',
    newSaleSpec: 'N',
    newSaleSpecLabel: '否',
    skuCountTotal: 6,
    skuCountGrowth: -3.4,
    skuCountShare: 6.7,
    saleQtyTotal: 2810,
    saleQtyGrowth: -5.1,
    saleQtyShare: 6.5,
    saleQtyPsd: 14.8,
    salesAmountTotal: 51600,
    salesAmountGrowth: -5.8,
    salesAmountShare: 6.0,
    salesAmountPsd: 271.6,
    grossAmountTotal: 17920,
    grossAmountGrowth: -4.9,
    grossAmountShare: 6.1,
    grossAmountPsd: 94.3,
    grossRateTotal: 34.73,
    grossRateGrowth: -0.6,
    inventoryQty: 430,
    turnoverRate: 2.1,
    turnoverDays: 46.3,
    inventorySalesRatio: 1.24,
    grossContributionRate: 5.6,
    gmroi: 1.98,
    sellThroughRate: 61.7,
    promotionSkuCount: 2
  },
  {
    specCode: 'S006',
    specName: '100ml',
    specType: 'small',
    specTypeLabel: '小规格',
    newSaleSpec: 'Y',
    newSaleSpecLabel: '是',
    skuCountTotal: 5,
    skuCountGrowth: 2.7,
    skuCountShare: 5.4,
    saleQtyTotal: 2140,
    saleQtyGrowth: 4.6,
    saleQtyShare: 4.9,
    saleQtyPsd: 11.3,
    salesAmountTotal: 38400,
    salesAmountGrowth: 5.2,
    salesAmountShare: 4.5,
    salesAmountPsd: 202.3,
    grossAmountTotal: 13260,
    grossAmountGrowth: 4.8,
    grossAmountShare: 4.4,
    grossAmountPsd: 69.9,
    grossRateTotal: 34.53,
    grossRateGrowth: 0.2,
    inventoryQty: 380,
    turnoverRate: 1.9,
    turnoverDays: 51.2,
    inventorySalesRatio: 1.31,
    grossContributionRate: 4.2,
    gmroi: 1.72,
    sellThroughRate: 58.4,
    promotionSkuCount: 1
  }
];

export const getSpecDetailList = async (query: SpecDetailQuery) => {
  const pageNum = Number(query.pageNum || 1);
  const pageSize = Number(query.pageSize || 10);
  const filtered = mockRows
    .filter((item) => {
      const matchSpecType = !query.specType || item.specType === query.specType;
      const matchSpecName = !query.specName || item.specName === query.specName;
      const matchNewSaleSpec = !query.newSaleSpec || item.newSaleSpec === query.newSaleSpec;
      return matchSpecType && matchSpecName && matchNewSaleSpec;
    })
    .sort((a, b) => {
      const field = query.orderByColumn;
      if (!field) return 0;
      const direction = query.isAsc === 'desc' ? -1 : 1;
      const left = Number((a as Record<string, any>)[field] ?? 0);
      const right = Number((b as Record<string, any>)[field] ?? 0);
      return (left - right) * direction;
    });

  return {
    rows: filtered.slice((pageNum - 1) * pageSize, pageNum * pageSize),
    total: filtered.length
  };
};

export const exportSpecDetailExcel = async (query: SpecDetailQuery) => {
  void query;
  return true;
};

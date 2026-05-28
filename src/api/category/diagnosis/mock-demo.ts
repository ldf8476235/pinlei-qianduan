import type { DiagnosisApiResponse, DiagnosisSessionStatusResponse } from './types';
import type { DiagnosisOverviewResponse, DiagnosisOverallSummaryResponse, DiagnosisTrendsResponse } from './detail/types';

export const MOCK_DIAGNOSIS_SESSION_ID = 'MOCK-WASH-DEMO';
export const MOCK_DIAGNOSIS_DATA_VERSION = 'mock-wash-202604';

export const isMockDiagnosisSession = (sessionId?: string) => String(sessionId || '') === MOCK_DIAGNOSIS_SESSION_ID;

export const mockApiResponse = <T>(data: T): Promise<{ data: DiagnosisApiResponse<T> }> =>
  Promise.resolve({
    data: {
      success: true,
      code: '200',
      message: 'OK',
      data,
      requestId: `mock-${Date.now()}`,
      timestamp: new Date().toISOString()
    }
  });

export const getMockDiagnosisStatus = (): DiagnosisSessionStatusResponse => ({
  sessionId: MOCK_DIAGNOSIS_SESSION_ID,
  queryHash: 'mock-wash-query',
  dataVersion: MOCK_DIAGNOSIS_DATA_VERSION,
  ready: true,
  status: 'SUCCESS',
  progressPercent: 100,
  currentStage: 'DONE',
  orchestratorStatus: 'SUCCESS'
});

export const getMockDiagnosisOverview = (): DiagnosisOverviewResponse => ({
  classNo: '004',
  className: '洗化部',
  currentClassSku: 842,
  compareClassSku: 786,
  currentTurnoverRate: 68.4,
  compareTurnoverRate: 62.1,
  currentPenetrateRate: 41.8,
  comparePenetrateRate: 38.6,
  currentTurnoverDays: 27.6,
  compareTurnoverDays: 31.2,
  currentInventorySales: 1.72,
  compareInventorySales: 1.96,
  currentAvgInventory: 128.4,
  compareAvgInventory: 119.8,
  currentSaleQuantity: 186420,
  compareSaleQuantity: 164880,
  currentSales: 428.6,
  compareSales: 381.2,
  currentGross: 96.8,
  compareGross: 80.5,
  currentGrossRate: 22.58,
  compareGrossRate: 21.12,
  currentCustomerCount: 72840,
  compareCustomerCount: 68150,
  currentCustomerPrice: 58.84,
  compareCustomerPrice: 55.94,
  currentCustomerAvgQuantity: 2.56,
  compareCustomerAvgQuantity: 2.42,
  currentPieceAvgPrice: 22.99,
  comparePieceAvgPrice: 23.12,
  currentSalesCost: 331.8,
  compareSalesCost: 300.7,
  currentCustomerCountTotal: 174320,
  compareCustomerCountTotal: 176520
});

export const getMockOverallSummary = (): DiagnosisOverallSummaryResponse => ({
  sessionId: MOCK_DIAGNOSIS_SESSION_ID,
  classNo: '004',
  className: '洗化部',
  sections: [
    {
      status: 'NORMAL',
      title: '整体规模提升',
      conclusion: '洗化部销售额、毛利额均较对比期增长，核心清洁用品带动明显。',
      descriptions: ['销售额增长 12.4%，毛利额增长 20.2%。', '动销率提升 6.3 个百分点，库存周转天数下降 3.6 天。']
    },
    {
      status: 'ABNORMAL',
      title: '结构仍需优化',
      conclusion: '洗衣液、洗洁精贡献高，但香皂和儿童洗护库存偏重。',
      descriptions: ['高库存低动销 SKU 主要集中在季节性套装和尾货规格。', '建议将弱动销 SKU 与强势品牌组合做陈列替换。']
    }
  ]
});

const metricBaseMap: Record<string, { base: number; compare: number; unit?: string }> = {
  sales: { base: 14.2, compare: 12.4, unit: '万元' },
  salesQuantity: { base: 6214, compare: 5496 },
  gross: { base: 3.1, compare: 2.5, unit: '万元' },
  grossRate: { base: 22.6, compare: 21.1, unit: '%' },
  customerCount: { base: 2428, compare: 2271 },
  customerPrice: { base: 58.8, compare: 55.9 },
  inventorySales: { base: 1.72, compare: 1.96 }
};

export const getMockTrend = (metricCode = 'sales'): DiagnosisTrendsResponse => {
  const metric = metricBaseMap[metricCode] || metricBaseMap.sales;
  const start = new Date(2026, 3, 1);
  const trends = Array.from({ length: 30 }, (_, index) => {
    const date = new Date(start);
    date.setDate(start.getDate() + index);
    const currentWave = 1 + Math.sin(index / 4) * 0.08 + (index % 6 === 0 ? 0.1 : 0);
    const compareWave = 1 + Math.cos(index / 5) * 0.06;
    const currentValue = Number((metric.base * currentWave).toFixed(2));
    const compareValue = Number((metric.compare * compareWave).toFixed(2));
    return {
      metricCode,
      pointDate: date.toISOString().slice(0, 10),
      currentValue,
      compareValue,
      growthRate: compareValue ? Number((((currentValue - compareValue) / compareValue) * 100).toFixed(2)) : 0,
      periodLabel: 'DAY'
    };
  });
  return {
    sessionId: MOCK_DIAGNOSIS_SESSION_ID,
    metricCode,
    dataVersion: MOCK_DIAGNOSIS_DATA_VERSION,
    cacheHit: true,
    trends
  };
};

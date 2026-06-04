import type { DiagnosisSessionStatusResponse } from './types';
import type {
  ChannelSalesDetailsResponse,
  ChannelSalesPieItemResponse,
  ChannelSalesTrendResponse,
  CustomerAgeBucketResponse,
  CustomerSalesDetailsResponse,
  CustomerSalesRadarItemResponse,
  DiagnosisIntroduceDirectionResponse,
  DiagnosisOverviewResponse,
  DiagnosisOverallSummaryResponse,
  DiagnosisTrendsResponse,
  LegacySubclassSalesListResponse,
  LegacySubclassSalesPerItem,
  LegacySubclassSalesTrendResponse,
  TagDetailPageResponse,
  TagSalesPerResponse,
  TagTypeGroupResponse
} from './detail/types';

export const MOCK_DIAGNOSIS_SESSION_ID = 'MOCK-WASH-DEMO';
export const MOCK_DIAGNOSIS_DATA_VERSION = 'mock-wash-202604';

// Captured from the vendor classDiagnoseReport page chunk.
export const MOCK_DIAGNOSIS_VENDOR_MENU = [
  {
    title: '纵观品类整体',
    code: '1',
    description: '掌握品类整体情况和发力点',
    children: [
      { title: '品类业绩', code: 'categoryPerformance', mockViewKey: 'performance' },
      { title: '子类贡献', code: 'subclassContribution', mockViewKey: 'subCategory' },
      { title: '渠道业绩', code: 'channelPerformance', mockViewKey: 'channel' },
      { title: '客户分析', code: 'customerAnalysis', mockViewKey: 'customer' }
    ]
  },
  {
    title: '定位异常品项',
    code: '2',
    description: '及时优化表现差单品',
    children: [
      { title: 'ABC结构分析', code: 'abcStructuralJudgment', mockViewKey: 'abcAnalysis' },
      { title: '毛利贡献率分析', code: 'analysisGrossProfitContribution', mockViewKey: 'grossContribution' },
      { title: 'GMROI分析', code: 'gmroiAnalysis', mockViewKey: 'gmroiAnalysis' },
      { title: '供应商分析', code: 'vendorAnalysis', mockViewKey: 'supplierAnalysis' }
    ]
  },
  {
    title: '深究用户需求',
    code: '3',
    description: '助力品项优化与补充',
    children: [
      { title: '价格带分析', code: 'priceBandAnalysis', mockViewKey: 'priceBandAnalysis' },
      { title: '品牌分析', code: 'brandAnalysis', mockViewKey: 'brandAnalysis' },
      { title: '规格分析', code: 'specAnalysis', mockViewKey: 'specAnalysis' },
      { title: '标签分析', code: 'tagAnalysis', mockViewKey: 'tagAnalysis' }
    ]
  },
  {
    title: '整合调整方向',
    code: '4',
    description: '指导品类优化与执行',
    children: [
      { title: '整体情况总结', code: 'allSummary', mockViewKey: 'summaryAnalysis' },
      { title: '建议淘汰商品', code: 'suggestOutGoods', mockViewKey: 'removeGoods' },
      { title: '建议引品方向', code: 'suggestDirection', mockViewKey: 'introduceDirection' }
    ]
  }
] as const;

export const isMockDiagnosisSession = (sessionId?: string) => String(sessionId || '') === MOCK_DIAGNOSIS_SESSION_ID;

export const mockApiResponse = <T>(data: T): Promise<{ data: T }> =>
  Promise.resolve({
    data
  });

export const mockLegacyResponse = <T>(result: T): Promise<{ success: boolean; message: string; code: number; result: T; timestamp: number }> =>
  Promise.resolve({
    success: true,
    message: 'OK',
    code: 200,
    result,
    timestamp: Date.now()
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
  currentClassSku: 4735,
  compareClassSku: -9.17,
  currentTurnoverRate: 95.27,
  comparativeTurnoverRate: 7.24,
  currentPenetrateRate: 10.91,
  comparativePenetrateRate: -0.99,
  currentTurnoverDays: 65.54,
  comparativeTurnoverDays: -6.32,
  currentInventorySales: 0.95,
  comparativeInventorySales: -6.33,
  currentAvgInventory: 6010702.08,
  comparativeAvgInventory: 3.54,
  currentSaleQuantity: 488900.49,
  comparativeSaleQuantity: 6.37,
  currentSales: 758.53,
  comparativeSales: 10.84,
  currentGross: 125.77,
  comparativeGross: 12.44,
  currentGrossRate: 16.58,
  comparativeGrossRate: 0.24,
  currentCustomerCount: 353543,
  comparativeCustomerCount: 49.78,
  currentCustomerPrice: 21.46,
  comparativeCustomerPrice: -26,
  currentCustomerAvgQuantity: 1.38,
  comparativeCustomerAvgQuantity: -28.98,
  currentPieceAvgPrice: 15.51,
  comparativePieceAvgPrice: 4.2,
  currentSalesCost: 632.76,
  compareSalesCost: 565.68,
  currentCustomerCountTotal: 3240540,
  compareCustomerCountTotal: 3302190
});

export const getMockOverallSummary = (): DiagnosisOverallSummaryResponse => ({
  sessionId: MOCK_DIAGNOSIS_SESSION_ID,
  classNo: '004',
  className: '洗化部',
  sections: [
    {
      status: 'NORMAL',
      title: '品类角色',
      conclusion: '基于本期查询日期范围下的业绩表现评估出品类角色为“结构品类”，与预设角色一致。',
      descriptions: ['请继续保持当前品类角色定位。']
    },
    {
      status: 'ABNORMAL',
      title: 'SKU数配置',
      conclusion: '当前品类本期在售SKU数为“4,735”，与预设的“4,319”不一致。',
      descriptions: ['可结合建议淘汰商品和引品方向完成SKU调整。']
    },
    {
      status: 'NORMAL',
      title: '销售情况',
      conclusion: '本期销售额为“7,585,282.91元”，对比增长率为“10.84%”。',
      descriptions: ['本期客数对比增长率为“49.78%”，客单价对比增长率为“-26.00%”，客均件数对比增长率为“-28.98%”，件均价对比增长率为“4.20%”。', '本期客数、件均价对比上涨是销售额上升的主要原因。']
    },
    {
      status: 'NORMAL',
      title: '毛利情况',
      conclusion: '本期毛利额为“1,257,694.67元”，对比增长率为“12.44%”。',
      descriptions: ['本期毛利率对比增长率为“0.24%”，销售额对比增长率为“10.84%”。']
    },
    {
      status: 'NORMAL',
      title: '动销率',
      conclusion: '本期动销率为“95.27%”，处于较高水平。',
      descriptions: ['不动销商品仍存在，可结合系统建议淘汰商品完成清理。']
    },
    {
      status: 'ABNORMAL',
      title: '渗透率',
      conclusion: '本期渗透率为“10.91%”，较对比日期下降“-0.99%”。',
      descriptions: ['渗透率下降反映客户购买意愿降低，可结合异常品项和用户需求进一步定位问题。']
    },
    {
      status: 'NORMAL',
      title: '库存周转',
      conclusion: '本期库存周转天数为“65.54”，较对比日期下降“-6.32%”；库销比为“0.95”。',
      descriptions: ['库存周转能力增强，当前库销比较为合理。']
    },
    {
      status: 'OTHER',
      title: '子类与渠道',
      conclusion: '本期“00401个人护理”销售贡献占比最大，为“43.13%”；“线下”渠道贡献占比最大，为“71.43%”。',
      descriptions: ['“00402清洁用品”子类销售贡献占比最小，为“22.43%”。', '“线上-线上自动贩卖机”销售贡献占比最小。']
    },
    {
      status: 'ABNORMAL',
      title: '异常品项',
      conclusion: '毛利贡献率问题商品1,153个，占比24.35%；GMROI问题商品1,082个，占比22.85%。',
      descriptions: ['存在CC商品2,072个，AC和BC品421个。', '存在GMROI<=1的商品4,686个，需要重点关注。']
    },
    {
      status: 'OTHER',
      title: '用户需求',
      conclusion: '价格点“29.90、9.90、49.90”更受用户偏好。',
      descriptions: ['品牌“立白、舒影、丝飘、超能、安安金纯”销售额相对较好。', '标签“植物精华、熏香配方、自然配方、天然配方、香氛配方”表现较好。']
    }
  ]
});

const metricBaseMap: Record<string, { base: number; compare: number; unit?: string }> = {
  sales: { base: 25.28, compare: 22.81, unit: '万元' },
  salesQuantity: { base: 16296.68, compare: 15320.74 },
  gross: { base: 4.19, compare: 3.73, unit: '万元' },
  grossRate: { base: 16.58, compare: 16.34, unit: '%' },
  customerCount: { base: 11784.77, compare: 7868.24 },
  customerPrice: { base: 21.46, compare: 29 },
  inventorySales: { base: 0.95, compare: 1.01 }
};

const dateLabels = Array.from({ length: 30 }, (_, index) => {
  const date = new Date(2026, 3, 1);
  date.setDate(date.getDate() + index);
  return date.toISOString().slice(0, 10);
});

const subClassRows = [
  { classNo: '00401', className: '个人护理', sales: 3271824.13, salesPer: 43.13, gross: 620276.72, grossPer: 49.32, grossRate: 18.96, customers: 160015, customerPrice: 20.45, compareSales: 2910773.06, compareSalesPer: 42.53, compareSalesAddRate: 12.4, compareGross: 495799.38, compareGrossPer: 44.32, compareGrossAddRate: 25.11, compareGrossRate: 17.03, compareCustomers: 116090, compareCustomerGrowth: 37.84, compareCustomerPrice: 25.07, compareCustomerPriceGrowth: -18.45, turnoverRate: 0.95, turnoverDays: 72.63, gmroi: 0.95 },
  { classNo: '00403', className: '卫生用品', sales: 2612293.97, salesPer: 34.44, gross: 381395.43, grossPer: 30.32, grossRate: 14.6, customers: 139496, customerPrice: 18.73, compareSales: 2357366.34, compareSalesPer: 34.45, compareSalesAddRate: 10.81, compareGross: 377842.94, compareGrossPer: 33.78, compareGrossAddRate: 0.94, compareGrossRate: 16.03, compareCustomers: 88103, compareCustomerGrowth: 58.33, compareCustomerPrice: 26.76, compareCustomerPriceGrowth: -30.01, turnoverRate: 1.14, turnoverDays: 60.53, gmroi: 0.88 },
  { classNo: '00402', className: '清洁用品', sales: 1701164.81, salesPer: 22.43, gross: 256022.52, grossPer: 20.36, grossRate: 15.05, customers: 101532, customerPrice: 16.75, compareSales: 1575322.13, compareSalesPer: 23.02, compareSalesAddRate: 7.99, compareGross: 244948.91, compareGrossPer: 21.9, compareGrossAddRate: 4.52, compareGrossRate: 15.55, compareCustomers: 71997, compareCustomerGrowth: 41.02, compareCustomerPrice: 21.88, compareCustomerPriceGrowth: -23.42, turnoverRate: 1.16, turnoverDays: 59.48, gmroi: 0.92 }
];

const buildGrowth = (current: number, compare: number) => Number((compare ? ((current - compare) / compare) * 100 : 0).toFixed(2));

export const getMockIntroduceDirection = (): DiagnosisIntroduceDirectionResponse => ({
  sessionId: MOCK_DIAGNOSIS_SESSION_ID,
  columns: [
    { label: '顺序', value: 'index' },
    { label: '价格区间', value: 'priceBand' },
    { label: '品牌', value: 'brand' },
    { label: '规格', value: 'spec' },
    { label: '产品形态', value: 'productShape' },
    { label: '原料', value: 'material' },
    { label: '功效', value: 'function' },
    { label: '香型', value: 'fragrance' },
    { label: '包装', value: 'package' },
    { label: '人群', value: 'crowd' },
    { label: '产地', value: 'origin' },
    { label: '供应商', value: 'vendor' },
    { label: '小分类', value: 'subClass' }
  ],
  rows: [
    {
      index: '1',
      priceBand: '9.90-24.81',
      brand: '立白',
      spec: '5kg',
      productShape: '液体',
      material: '植物精华',
      function: '洗沐套装',
      fragrance: '无香型',
      package: '瓶装',
      crowd: '通用',
      origin: '国产',
      vendor: '10800003501080000350有限公司',
      subClass: '卫生巾'
    },
    {
      index: '2',
      priceBand: '0.00-9.90',
      brand: '舒影',
      spec: '4.8kg',
      productShape: '',
      material: '熏香配方',
      function: '超值洁净',
      fragrance: '淡香',
      package: '袋装',
      crowd: '',
      origin: '',
      vendor: '10900000761090000076有限公司',
      subClass: '条包纸'
    },
    {
      index: '3',
      priceBand: '',
      brand: '丝飘',
      spec: '4.75kg',
      productShape: '',
      material: '自然配方',
      function: '清爽、去屑',
      fragrance: '混合香型',
      package: '',
      crowd: '',
      origin: '',
      vendor: '10900006941090000694有限公司',
      subClass: '软抽纸'
    }
  ]
});

export const getMockSubClassPie = (): LegacySubclassSalesPerItem[] => subClassRows;

export const getMockSubClassTrend = (): LegacySubclassSalesTrendResponse => ({
  legend: subClassRows.map((item) => item.className),
  xdata: dateLabels,
  lineDate: subClassRows.flatMap((item, rowIndex) =>
    dateLabels.map((dataDate, dateIndex) => ({
      dataDate,
      classNo: item.classNo,
      className: item.className,
      sales: Number(((item.sales / 30) * (1 + Math.sin((dateIndex + rowIndex) / 5) * 0.12)).toFixed(2))
    }))
  )
});

export const getMockSubClassTable = (): LegacySubclassSalesListResponse => ({
  totalElements: subClassRows.length,
  content: subClassRows.map((item) => ({
      classNo: item.classNo,
      className: item.className,
      classLevel: 2,
      parentClassNo: '004',
      currentSales: item.sales,
      currentSalesPer: item.salesPer,
      currentGross: item.gross,
      currentGrossPer: item.grossPer,
      currentGrossRate: item.grossRate,
      currentSaleQuantity: Number((item.sales / 15.51).toFixed(2)),
      currentCustomerCount: item.customers,
      currentCustomerPrice: item.customerPrice,
      compareSales: item.compareSales,
      compareSalesPer: item.compareSalesPer,
      compareSalesAddRate: item.compareSalesAddRate,
      compareGross: item.compareGross,
      compareGrossPer: item.compareGrossPer,
      compareGrossAddRate: item.compareGrossAddRate,
      compareGrossRate: item.compareGrossRate,
      compareSaleQuantity: Number((item.compareSales / 14.89).toFixed(2)),
      compareSaleQuantityAddRate: buildGrowth(Number((item.sales / 15.51).toFixed(2)), Number((item.compareSales / 14.89).toFixed(2))),
      compareCustomerCount: item.compareCustomers,
      compareCustomerPrice: item.compareCustomerPrice,
      compareCustomerPriceAddRate: item.compareCustomerPriceGrowth,
      currentTurnoverRate: item.turnoverRate,
      currentTurnoverDays: item.turnoverDays,
      gmroi: item.gmroi,
      saleCost: Number((item.sales - item.gross).toFixed(2))
    }))
});

const channelRows = [
  { name: '线下', value: 5757188.38, per: 71.43, gross: 975667.95, grossPer: 71.43, grossRate: 16.95, customers: 271057, customerPrice: 21.24, compareSales: 5876768.23, compareSalesPer: 71.43, compareSalesInc: -2.03, compareGross: 962468.37, compareGrossPer: 71.43, compareGrossInc: 1.37, compareGrossRate: 16.38, compareCustomers: 202988, compareCustomerInc: 33.53, compareCustomerPrice: 28.95, compareCustomerPriceInc: -26.63 },
  { name: '线上-线上美团外卖', value: 2302875.36, per: 28.57, gross: 390267.18, grossPer: 28.57, grossRate: 16.95, customers: 108422.8, customerPrice: 21.24, compareSales: 2350707.3, compareSalesPer: 28.57, compareSalesInc: -2.03, compareGross: 384987.35, compareGrossPer: 28.57, compareGrossInc: 1.37, compareGrossRate: 16.38, compareCustomers: 81195.2, compareCustomerInc: 33.53, compareCustomerPrice: 28.95, compareCustomerPriceInc: -26.63 },
  { name: '线上-线上自动贩卖机', value: 0, per: 0, gross: 0, grossPer: 0, grossRate: 0, customers: 0, customerPrice: 0, compareSales: 0, compareSalesPer: 0, compareSalesInc: 0, compareGross: 0, compareGrossPer: 0, compareGrossInc: 0, compareGrossRate: 0, compareCustomers: 0, compareCustomerInc: 0, compareCustomerPrice: 0, compareCustomerPriceInc: 0 }
];

export const getMockChannelPie = (): ChannelSalesPieItemResponse[] => channelRows.map(({ name, value, per }) => ({ name, value, per }));

export const getMockChannelTrend = (): ChannelSalesTrendResponse => ({
  xdata: dateLabels,
  lineDate: getMockChannelPie().flatMap((item, channelIndex) =>
    dateLabels.map((dataDate, dateIndex) => ({
      dataDate,
      saleChannel: channelIndex + 1,
      onlineType: channelIndex,
      onlineName: item.name,
      sales: Number(((item.value / 30) * (1 + Math.cos((dateIndex + channelIndex) / 4) * 0.1)).toFixed(2))
    }))
  )
});

export const getMockChannelTable = (): ChannelSalesDetailsResponse => ({
  current: 1,
  size: 20,
  total: channelRows.length,
  pages: 1,
  records: channelRows.map((item, index) => ({
      channelName: item.name,
      saleChannel: index + 1,
      onlineType: index,
      onlineName: item.name,
      currentSales: item.value,
      currentSalesPer: item.per,
      currentGross: item.gross,
      currentGrossPer: item.grossPer,
      currentGrossRate: item.grossRate,
      currentCustomerCount: item.customers,
      currentCustomerPrice: item.customerPrice,
      compareSales: item.compareSales,
      compareSalesPer: item.compareSalesPer,
      compareSalesInc: item.compareSalesInc,
      compareGross: item.compareGross,
      compareGrossPer: item.compareGrossPer,
      compareGrossInc: item.compareGrossInc,
      compareGrossRate: item.compareGrossRate,
      compareCustomerCount: item.compareCustomers,
      compareCustomerCountInc: item.compareCustomerInc,
      compareCustomerPrice: item.compareCustomerPrice,
      compareCustomerPriceInc: item.compareCustomerPriceInc
    }))
});

export const getMockCustomerAgeBuckets = (): CustomerAgeBucketResponse[] => [
  { ageCode: '0', ageName: '20岁及以下', ageStart: 0, ageEnd: 20, orderNumber: 1 },
  { ageCode: '1', ageName: '21-30岁', ageStart: 21, ageEnd: 30, orderNumber: 2 },
  { ageCode: '2', ageName: '31-40岁', ageStart: 31, ageEnd: 40, orderNumber: 3 },
  { ageCode: '3', ageName: '41-50岁', ageStart: 41, ageEnd: 50, orderNumber: 4 },
  { ageCode: '4', ageName: '51-60岁', ageStart: 51, ageEnd: 60, orderNumber: 5 },
  { ageCode: '5', ageName: '61岁及以上', ageStart: 61, ageEnd: 99, orderNumber: 6 }
];

const customerAgeRows = [
  { ageCode: '0', ageName: '20岁及以下', ageStart: 0, ageEnd: 20, currentSales: 275456.76, currentCustomerCount: 14693, currentCustomerPrice: 18.75, currentUnitPrice: 15.53, currentCountAve: 1.21, manSales: 183061.69, manCount: 9828, manPrice: 18.63, manUnit: 15.5, manAvg: 1.2, womanSales: 92395.07, womanCount: 4865, womanPrice: 18.99, womanUnit: 15.57, womanAvg: 1.22 },
  { ageCode: '1', ageName: '21-30岁', ageStart: 21, ageEnd: 30, currentSales: 6496.38, currentCustomerCount: 360, currentCustomerPrice: 18.05, currentUnitPrice: 15.68, currentCountAve: 1.15, manSales: 2544.86, manCount: 124, manPrice: 20.52, manUnit: 17.38, manAvg: 1.18, womanSales: 3951.52, womanCount: 236, womanPrice: 16.74, womanUnit: 14.75, womanAvg: 1.14 },
  { ageCode: '2', ageName: '31-40岁', ageStart: 31, ageEnd: 40, currentSales: 27412.69, currentCustomerCount: 1441, currentCustomerPrice: 19.02, currentUnitPrice: 15.73, currentCountAve: 1.21, manSales: 5949.24, manCount: 377, manPrice: 15.78, manUnit: 14.11, manAvg: 1.12, womanSales: 21463.45, womanCount: 1064, womanPrice: 20.17, womanUnit: 16.25, womanAvg: 1.24 },
  { ageCode: '3', ageName: '41-50岁', ageStart: 41, ageEnd: 50, currentSales: 27711.38, currentCustomerCount: 1469, currentCustomerPrice: 18.86, currentUnitPrice: 16.28, currentCountAve: 1.16, manSales: 7324.56, manCount: 409, manPrice: 17.91, manUnit: 15.55, manAvg: 1.15, womanSales: 20386.82, womanCount: 1060, womanPrice: 19.23, womanUnit: 16.56, womanAvg: 1.16 },
  { ageCode: '4', ageName: '51-60岁', ageStart: 51, ageEnd: 60, currentSales: 13054.23, currentCustomerCount: 753, currentCustomerPrice: 17.34, currentUnitPrice: 16, currentCountAve: 1.08, manSales: 4281.52, manCount: 260, manPrice: 16.47, manUnit: 15.41, manAvg: 1.07, womanSales: 8772.71, womanCount: 493, womanPrice: 17.79, womanUnit: 16.3, womanAvg: 1.09 },
  { ageCode: '5', ageName: '61岁及以上', ageStart: 61, ageEnd: 99, currentSales: 6207.17, currentCustomerCount: 359, currentCustomerPrice: 17.29, currentUnitPrice: 15.74, currentCountAve: 1.1, manSales: 2904.72, manCount: 171, manPrice: 16.99, manUnit: 15.88, manAvg: 1.07, womanSales: 3302.45, womanCount: 188, womanPrice: 17.57, womanUnit: 15.62, womanAvg: 1.12 }
];

const customerSummaryRow = {
  ageCode: 'ALL',
  ageName: '全部',
  ageStart: 0,
  ageEnd: 99,
  currentSales: 1157091.25,
  currentCustomerCount: 61514,
  currentCustomerPrice: 18.81,
  currentUnitPrice: 15.49,
  currentCountAve: 1.21,
  manSales: 1006819.26,
  manCount: 53608,
  manPrice: 18.78,
  manUnit: 15.44,
  manAvg: 1.22,
  womanSales: 150271.99,
  womanCount: 7906,
  womanPrice: 19.01,
  womanUnit: 15.81,
  womanAvg: 1.2
};

export const getMockCustomerRadar = (): CustomerSalesRadarItemResponse[] =>
  customerAgeRows.flatMap((age) => [
    {
      gender: 0,
      ageCode: age.ageCode,
      ageName: age.ageName,
      ageStart: age.ageStart,
      ageEnd: age.ageEnd,
      currentSales: age.currentSales,
      currentCustomerCount: age.currentCustomerCount,
      currentCustomerPrice: age.currentCustomerPrice,
      currentUnitPrice: age.currentUnitPrice,
      currentCountAve: age.currentCountAve,
      currentSaleQuantity: Number((age.currentSales / age.currentUnitPrice).toFixed(2))
    },
    {
      gender: 1,
      ageCode: age.ageCode,
      ageName: age.ageName,
      ageStart: age.ageStart,
      ageEnd: age.ageEnd,
      currentSales: age.manSales,
      currentCustomerCount: age.manCount,
      currentCustomerPrice: age.manPrice,
      currentUnitPrice: age.manUnit,
      currentCountAve: age.manAvg,
      currentSaleQuantity: Number((age.manSales / age.manUnit).toFixed(2))
    },
    {
      gender: 2,
      ageCode: age.ageCode,
      ageName: age.ageName,
      ageStart: age.ageStart,
      ageEnd: age.ageEnd,
      currentSales: age.womanSales,
      currentCustomerCount: age.womanCount,
      currentCustomerPrice: age.womanPrice,
      currentUnitPrice: age.womanUnit,
      currentCountAve: age.womanAvg,
      currentSaleQuantity: Number((age.womanSales / age.womanUnit).toFixed(2))
    }
  ]);

export const getMockCustomerDetails = (): CustomerSalesDetailsResponse => ({
  current: 1,
  size: 20,
  total: customerAgeRows.length + 1,
  pages: 1,
  records: [customerSummaryRow, ...customerAgeRows].map((age, index) => ({
    ...age,
    ageOrder: index,
    currentSaleQuantity: Number((age.currentSales / age.currentUnitPrice).toFixed(2)),
    currentManSales: age.manSales,
    currentManCustomerCount: age.manCount,
    currentManCustomerPrice: age.manPrice,
    currentManUnitPrice: age.manUnit,
    currentManCountAve: age.manAvg,
    currentWomanSales: age.womanSales,
    currentWomanCustomerCount: age.womanCount,
    currentWomanCustomerPrice: age.womanPrice,
    currentWomanUnitPrice: age.womanUnit,
    currentWomanCountAve: age.womanAvg,
    currentUnknownSales: 0,
    currentUnknownCustomerCount: 0,
    currentUnknownCustomerPrice: 0,
    currentUnknownUnitPrice: 0,
    currentUnknownCountAve: 0
  }))
});

export const getMockTagTypes = (): TagTypeGroupResponse[] => [
  {
    tagType: 'material',
    tagTypeName: '原料',
    tagList: [
      { tagNo: 'plant', tagName: '植物精华', sales: 986420 },
      { tagNo: 'incense', tagName: '熏香配方', sales: 824510 },
      { tagNo: 'nature', tagName: '自然配方', sales: 705260 },
      { tagNo: 'natural', tagName: '天然配方', sales: 612390 },
      { tagNo: 'fragrance', tagName: '香氛配方', sales: 548880 }
    ]
  },
  {
    tagType: 'function',
    tagTypeName: '功效',
    tagList: [
      { tagNo: 'set', tagName: '洗沐套装', sales: 732450 },
      { tagNo: 'clean-value', tagName: '超值洁净', sales: 584310 },
      { tagNo: 'fresh-dandruff', tagName: '清爽、去屑', sales: 421800 }
    ]
  },
  {
    tagType: 'fragrance',
    tagTypeName: '香型',
    tagList: [
      { tagNo: 'none', tagName: '无香型', sales: 936200 },
      { tagNo: 'light', tagName: '淡香', sales: 803600 },
      { tagNo: 'mixed', tagName: '混合香型', sales: 658430 },
      { tagNo: 'lavender', tagName: '薰衣草香', sales: 524700 },
      { tagNo: 'floral', tagName: '花香', sales: 476250 }
    ]
  },
  {
    tagType: 'package',
    tagTypeName: '包装',
    tagList: [
      { tagNo: 'bottle', tagName: '瓶装', sales: 1785400 },
      { tagNo: 'bag', tagName: '袋装', sales: 1263880 }
    ]
  },
  {
    tagType: 'crowd',
    tagTypeName: '人群',
    tagList: [
      { tagNo: 'general', tagName: '通用', sales: 2356920 },
      { tagNo: 'teen', tagName: '青少年', sales: 184300 },
      { tagNo: 'male', tagName: '男性', sales: 162550 }
    ]
  },
  {
    tagType: 'origin',
    tagTypeName: '产地',
    tagList: [
      { tagNo: 'domestic', tagName: '国产', sales: 7128600 },
      { tagNo: 'imported', tagName: '进口', sales: 118450 }
    ]
  },
  {
    tagType: 'shape',
    tagTypeName: '产品形态',
    tagList: [
      { tagNo: 'liquid', tagName: '液体', sales: 4386500 },
      { tagNo: 'spray-liquid', tagName: '喷液', sales: 235800 },
      { tagNo: 'tablet', tagName: '片剂', sales: 197650 }
    ]
  }
];

const tagSummaryMap: Record<string, { good: string[]; bad: string[] }> = {
  material: {
    good: ['植物精华', '熏香配方', '自然配方', '天然配方', '香氛配方'],
    bad: ['小苍兰香氛', '杀菌留香珠', '玫瑰留香技术', '母婴酵素配方', '运动型配方']
  },
  function: {
    good: ['洗沐套装', '超值洁净', '清爽、去屑'],
    bad: ['趣味洁净', '防脱育发', '控油、净润', '水润、顺滑', '衣物柔顺']
  },
  fragrance: {
    good: ['无香型', '淡香', '混合香型', '薰衣草香', '花香'],
    bad: ['粉红茉莉', '天然香型', '天然熏香', '甜橙', '清新蓝铃']
  },
  package: {
    good: ['瓶装', '袋装'],
    bad: ['翻盖装', '壶装', '泵装', '旅行装', '小瓶']
  },
  crowd: {
    good: ['通用'],
    bad: ['青少年', ' 通用 ', '男性', '婴儿', '儿童']
  },
  origin: {
    good: ['国产'],
    bad: [' 国产 ', '进口']
  },
  shape: {
    good: ['液体'],
    bad: ['喷液', '片剂', '喷雾', '液体+膏状', '泡沫']
  }
};

export const getMockTagSalesShare = (tagType: string): TagSalesPerResponse => {
  const group = getMockTagTypes().find((item) => item.tagType === tagType) || getMockTagTypes()[0];
  const summary = tagSummaryMap[group.tagType || 'material'] || tagSummaryMap.material;
  const totalSales = (group.tagList || []).reduce((sum, item) => sum + Number(item.sales || 0), 0) || 1;
  return {
    goodTagList: summary.good,
    badTagList: summary.bad,
    salesAndSkuList: (group.tagList || []).map((item, index) => ({
      tagName: item.tagName,
      sales: item.sales,
      salesPer: Number(((Number(item.sales || 0) / totalSales) * 100).toFixed(2)),
      sku: Math.max(18, 420 - index * 54),
      skuPer: Math.max(1, 28 - index * 4)
    }))
  };
};

export const getMockTagList = (tagType: string): TagDetailPageResponse => {
  const rows = getMockTagSalesShare(tagType).salesAndSkuList || [];
  return {
    current: 1,
    size: 200,
    total: rows.length,
    pages: 1,
    records: rows.map((item, index) => ({
      tagNo: `${tagType}-${index + 1}`,
      tagName: item.tagName,
      sku: item.sku,
      skuInc: 8 - index,
      skuPer: item.skuPer,
      saleQuantity: 42000 - index * 8200,
      saleQuantityInc: 9.5 - index,
      saleQuantityPer: 38 - index * 6,
      sales: item.sales,
      salesInc: 12.4 - index,
      salesPer: item.salesPer,
      gross: Number((Number(item.sales || 0) * 0.23).toFixed(2)),
      grossInc: 16.2 - index,
      grossPer: 40 - index * 6,
      grossRate: 22.8 - index,
      stockQuantity: 7200 - index * 1100,
      turnoverRate: 66 - index * 3,
      turnoverDays: 24 + index * 4,
      stockSalesRate: 1.6 + index * 0.2,
      contributionRate: 18 - index * 2,
      gmroi: 2.4 - index * 0.2,
      salesRate: 72 - index * 5,
      activitySku: 120 - index * 18
    }))
  };
};

const mockGoodsRows = [
  {
    productNo: '6902088720812',
    productBarcode: '6902088720812',
    productName: '奥妙深层洁净洗衣液1kg',
    productStatus: '进销',
    productStatusNo: '1',
    storeNum: 42,
    currentAbc: 'A',
    compareAbc: 'B',
    currentGrossRole: '1',
    currentGrossRoleName: '引流品',
    compareGrossRole: '2',
    compareGrossRoleName: '利润品',
    currentGmroiRole: '1',
    currentGmroiRoleName: '高回报',
    compareGmroiRole: '2',
    compareGmroiRoleName: '成长品',
    saleQuantity: 8420,
    sales: 18600,
    salesPer: 4.34,
    gross: 4.1,
    grossPer: 4.23,
    grossRate: 22.04,
    stockQuantity: 1260,
    turnoverRate: 74.2,
    turnoverDays: 19.8,
    stockSalesRate: 1.32,
    contributionRate: 4.6,
    gmroi: 2.84,
    salesRate: 82,
    activity: '是',
    brandName: '奥妙',
    spec: '1kg',
    classNo: '00401',
    className: '清洁用品',
    productVendorName: '联合利华',
    allTagName: '强效清洁,家庭囤货'
  },
  {
    productNo: '6956934833838',
    productBarcode: '6956934833838',
    productName: '云蕾超值装棉柔洗洁巾10片装',
    productStatus: '进销',
    productStatusNo: '1',
    storeNum: 39,
    currentAbc: 'B',
    compareAbc: 'B',
    currentGrossRole: '3',
    currentGrossRoleName: '问题品',
    compareGrossRole: '3',
    compareGrossRoleName: '问题品',
    currentGmroiRole: '3',
    currentGmroiRoleName: '低回报',
    compareGmroiRole: '3',
    compareGmroiRoleName: '低回报',
    saleQuantity: 5240,
    sales: 9.8,
    salesPer: 2.29,
    gross: 1.7,
    grossPer: 1.76,
    grossRate: 17.35,
    stockQuantity: 1880,
    turnoverRate: 48.6,
    turnoverDays: 34.2,
    stockSalesRate: 2.08,
    contributionRate: 1.9,
    gmroi: 1.42,
    salesRate: 58,
    activity: '否',
    brandName: '云蕾',
    spec: '10片装',
    classNo: '00404',
    className: '家居清洁',
    productVendorName: '云蕾日化',
    allTagName: '家庭清洁,低动销'
  },
  {
    productNo: '6903148144490',
    productBarcode: '6903148144490',
    productName: '舒肤佳芦荟呵护型香皂100g',
    productStatus: '进销',
    productStatusNo: '1',
    storeNum: 45,
    currentAbc: 'C',
    compareAbc: 'A',
    currentGrossRole: '4',
    currentGrossRoleName: '利润品',
    compareGrossRole: '1',
    compareGrossRoleName: '引流品',
    currentGmroiRole: '2',
    currentGmroiRoleName: '成长品',
    compareGmroiRole: '1',
    compareGmroiRoleName: '高回报',
    saleQuantity: 3120,
    sales: 4.6,
    salesPer: 1.07,
    gross: 1.3,
    grossPer: 1.34,
    grossRate: 28.26,
    stockQuantity: 2320,
    turnoverRate: 37.4,
    turnoverDays: 45.6,
    stockSalesRate: 2.78,
    contributionRate: 1.4,
    gmroi: 1.18,
    salesRate: 42,
    activity: '否',
    brandName: '舒肤佳',
    spec: '100g',
    classNo: '00402',
    className: '个人洗护',
    productVendorName: '宝洁',
    allTagName: '个人护理,库存偏高'
  }
];

const makeMockProductNo = (index: number, prefix = '004') => `${prefix}${String(6900000000000 + index).slice(3)}`;

const buildGrossQuadrantPoints = () => {
  const groups = [
    { count: 871, type: '1', prefix: '领跑商品', minGrossRate: 17.05, maxGrossRate: 35.2, minSalesPer: 0.03, maxSalesPer: 0.23 },
    { count: 1359, type: '2', prefix: '吸客商品', minGrossRate: 0.05, maxGrossRate: 16.8, minSalesPer: 0.04, maxSalesPer: 0.38 },
    { count: 1352, type: '4', prefix: '利润商品', minGrossRate: 17.2, maxGrossRate: 35.0, minSalesPer: 0.01, maxSalesPer: 0.2 },
    { count: 1153, type: '3', prefix: '问题商品', minGrossRate: 0.02, maxGrossRate: 16.7, minSalesPer: 0, maxSalesPer: 0.12 }
  ];
  const visibleOutliers = [
    { index: 38, grossRate: 8.9, salesPer: 2.55 },
    { index: 86, grossRate: 15.7, salesPer: 2.82 },
    { index: 128, grossRate: 16.05, salesPer: 2.98 },
    { index: 208, grossRate: 20.2, salesPer: 1.52 },
    { index: 322, grossRate: 14.7, salesPer: 1.45 },
    { index: 414, grossRate: 16.45, salesPer: 1.48 },
    { index: 596, grossRate: 11.3, salesPer: 1.0 },
    { index: 731, grossRate: 35.0, salesPer: 0.47 },
    { index: 848, grossRate: 26.0, salesPer: 0.31 },
    { index: 940, grossRate: 20.0, salesPer: 0.55 },
    { index: 1118, grossRate: 15.2, salesPer: 0.6 },
    { index: 1020, grossRate: -95764, salesPer: 0 },
    { index: 1210, grossRate: 2254, salesPer: 0 },
    { index: 1440, grossRate: 0, salesPer: 0 },
    { index: 1805, grossRate: 37.5, salesPer: 0.02 }
  ];
  const outlierMap = new Map(visibleOutliers.map((item) => [item.index, item]));
  let seq = 0;
  return groups.flatMap((group) =>
    Array.from({ length: group.count }, (_, index) => {
      seq += 1;
      const wave = ((index * 37 + Math.floor(index / 97) * 11) % 997) / 997;
      const wave2 = ((index * 53 + Math.floor(index / 43) * 17) % 991) / 991;
      const wave3 = ((index * 29 + Math.floor(index / 61) * 19) % 983) / 983;
      const outlier = outlierMap.get(seq);
      const grossRateBase = group.minGrossRate + (group.maxGrossRate - group.minGrossRate) * wave;
      const denseLowBand = group.minSalesPer + (group.maxSalesPer - group.minSalesPer) * Math.pow(wave2, group.type === '2' ? 0.82 : 1.35);
      const shoulder = group.type === '2' && grossRateBase > 8 && grossRateBase < 16.8 ? Math.max(0, 0.28 - Math.abs(grossRateBase - 13.2) * 0.035) * wave3 : 0;
      const rightRidge = (group.type === '1' || group.type === '4') && grossRateBase > 21 ? 0.08 * wave3 : 0;
      const grossRate = Number((outlier?.grossRate ?? grossRateBase).toFixed(2));
      const lowBand = seq % 13 === 0 ? 0 : denseLowBand + shoulder + rightRidge;
      const salesPer = Number((outlier?.salesPer ?? lowBand).toFixed(2));
      return {
        contributionType: group.type,
        productNo: makeMockProductNo(seq, 'G'),
        productName: `${group.prefix}${String(index + 1).padStart(4, '0')}`,
        sales: Number((7585282.91 * salesPer / 100).toFixed(2)),
        salesPer,
        gross: Number((7585282.91 * salesPer * grossRate / 10000).toFixed(2)),
        grossRate
      };
    })
  );
};

const buildGmroiQuadrantPoints = () => {
  const groups = [
    { count: 140, type: '1', prefix: '成功商品', minGrossRate: 18.2, maxGrossRate: 38.4, minTurnoverRate: 108, maxTurnoverRate: 198 },
    { count: 105, type: '2', prefix: '沉睡商品', minGrossRate: 18.3, maxGrossRate: 38.9, minTurnoverRate: 5, maxTurnoverRate: 86 },
    { count: 155, type: '4', prefix: '吸客商品', minGrossRate: 1.1, maxGrossRate: 15.4, minTurnoverRate: 105, maxTurnoverRate: 199 },
    { count: 120, type: '3', prefix: '问题商品', minGrossRate: 0.4, maxGrossRate: 15.2, minTurnoverRate: 2, maxTurnoverRate: 86 }
  ];
  const outlierMap = new Map<number, { grossRate: number; turnoverRate: number }>([
    [12, { grossRate: 0, turnoverRate: 0 }],
    [88, { grossRate: 40, turnoverRate: 220.73 }],
    [151, { grossRate: 39, turnoverRate: 95.27 }],
    [236, { grossRate: 37.6, turnoverRate: 76 }],
    [386, { grossRate: 0, turnoverRate: 95.27 }],
    [520, { grossRate: 15.6, turnoverRate: 192 }]
  ]);
  const pseudoRandom = (seed: number) => {
    const value = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
    return value - Math.floor(value);
  };
  let seq = 0;
  return groups.flatMap((group) =>
    Array.from({ length: group.count }, (_, index) => {
      seq += 1;
      const outlier = outlierMap.get(seq);
      const xRatio = pseudoRandom(seq * 17 + index * 3);
      const yRatio = pseudoRandom(seq * 29 + index * 5);
      const clusterRatio = pseudoRandom(seq * 41 + index * 7);
      const diagonalRatio = Math.max(0, Math.min(1, yRatio * 0.78 + xRatio * 0.16 + clusterRatio * 0.06));
      const turnoverBase = group.minTurnoverRate + (group.maxTurnoverRate - group.minTurnoverRate) * xRatio;
      const grossBase = group.minGrossRate + (group.maxGrossRate - group.minGrossRate) * diagonalRatio;
      const diagonalPull = (0.5 - xRatio) * (group.type === '1' || group.type === '2' ? 3.4 : 2.2);
      const verticalJitter = (pseudoRandom(seq * 53) - 0.5) * (group.type === '1' || group.type === '2' ? 6.8 : 4.8);
      const horizontalJitter = (pseudoRandom(seq * 61) - 0.5) * (group.type === '1' || group.type === '4' ? 10.8 : 7.8);
      const grossRate = Number(
        (outlier?.grossRate ?? Math.max(group.minGrossRate, Math.min(group.maxGrossRate, grossBase + diagonalPull + verticalJitter))).toFixed(2)
      );
      const turnoverRate = Number(
        (outlier?.turnoverRate ?? Math.max(group.minTurnoverRate, Math.min(group.maxTurnoverRate, turnoverBase + horizontalJitter))).toFixed(2)
      );
      return {
        gmroiType: group.type,
        productNo: makeMockProductNo(seq, 'M'),
        productName: `${group.prefix}${String(index + 1).padStart(4, '0')}`,
        sales: Number((7585282.91 / 4735).toFixed(2)),
        saleQuantity: Number((488900.49 / 4735).toFixed(2)),
        gross: Number((1257694.67 / 4735).toFixed(2)),
        grossRate,
        turnoverRate,
        grossRole: group.type
      };
    })
  );
};

const pagePayload = (records = mockGoodsRows, page = 1, size = 20) => ({
  records,
  list: records,
  content: records,
  total: records.length,
  totalElements: records.length,
  current: page,
  size,
  pages: 1
});

type MockAbcType = 'sales' | 'gross' | 'contribution';

const normalizeMockAbcType = (value?: string): MockAbcType => {
  const code = String(value || 'sales');
  if (code === 'gross' || code === 'contribution') return code;
  return 'sales';
};

const mockAbcBucketCounts: Record<MockAbcType, Array<{ compareAbc: string; currentAbc: string; count: number }>> = {
  sales: [
  { compareAbc: 'A', currentAbc: 'A', count: 175 },
    { compareAbc: 'A', currentAbc: 'B', count: 92 },
    { compareAbc: 'A', currentAbc: 'C', count: 29 },
    { compareAbc: 'B', currentAbc: 'A', count: 45 },
  { compareAbc: 'B', currentAbc: 'B', count: 1026 },
    { compareAbc: 'B', currentAbc: 'C', count: 392 },
    { compareAbc: 'C', currentAbc: 'A', count: 44 },
    { compareAbc: 'C', currentAbc: 'B', count: 398 },
  { compareAbc: 'C', currentAbc: 'C', count: 2072 },
  { compareAbc: 'NONE', currentAbc: 'A', count: 10 },
  { compareAbc: 'NONE', currentAbc: 'B', count: 111 },
  { compareAbc: 'NONE', currentAbc: 'C', count: 341 }
  ],
  gross: [
    { compareAbc: 'A', currentAbc: 'A', count: 191 },
    { compareAbc: 'A', currentAbc: 'B', count: 91 },
    { compareAbc: 'A', currentAbc: 'C', count: 31 },
    { compareAbc: 'B', currentAbc: 'A', count: 97 },
    { compareAbc: 'B', currentAbc: 'B', count: 949 },
    { compareAbc: 'B', currentAbc: 'C', count: 376 },
    { compareAbc: 'C', currentAbc: 'A', count: 54 },
    { compareAbc: 'C', currentAbc: 'B', count: 452 },
    { compareAbc: 'C', currentAbc: 'C', count: 2032 },
    { compareAbc: 'NONE', currentAbc: 'A', count: 13 },
    { compareAbc: 'NONE', currentAbc: 'B', count: 133 },
    { compareAbc: 'NONE', currentAbc: 'C', count: 316 }
  ],
  contribution: [
    { compareAbc: 'A', currentAbc: 'A', count: 176 },
    { compareAbc: 'A', currentAbc: 'B', count: 98 },
    { compareAbc: 'A', currentAbc: 'C', count: 29 },
    { compareAbc: 'B', currentAbc: 'A', count: 49 },
    { compareAbc: 'B', currentAbc: 'B', count: 1030 },
    { compareAbc: 'B', currentAbc: 'C', count: 386 },
    { compareAbc: 'C', currentAbc: 'A', count: 50 },
    { compareAbc: 'C', currentAbc: 'B', count: 406 },
    { compareAbc: 'C', currentAbc: 'C', count: 2049 },
    { compareAbc: 'NONE', currentAbc: 'A', count: 9 },
    { compareAbc: 'NONE', currentAbc: 'B', count: 117 },
    { compareAbc: 'NONE', currentAbc: 'C', count: 336 }
  ]
};

const abcTransitionCounts = mockAbcBucketCounts.sales;

const abcMockProductNames = [
  '立白大师香氛洗衣液1kg',
  '舒肤佳柠檬清新沐浴露400ml',
  '云南白药益生菌牙膏180g',
  '海飞丝丝质柔滑去屑洗发水400ml',
  '洁柔抽纸自然木亲肤3层100抽',
  '心相印茶语手帕纸10包装',
  '清风原木金装抽纸80抽',
  '维达超韧抽纸24包整箱',
  '蓝月亮深层洁净洗衣液3kg',
  '奥妙除菌除螨洗衣液4kg',
  '清扬男士去屑洗发水套装',
  '心相印卷纸家庭装30卷',
  '维达蓝色经典卷纸整箱',
  '超能植翠低泡洗衣液1.5kg',
  '舒肤佳纯白香皂100g',
  '雕牌强去油洗洁精1.12kg',
  '云蕾高级沐浴条',
  '蓝月亮芦荟抑菌洗手液',
  '飘柔海滩曼舞香氛滋润去屑洗发露',
  '温莎森林蛋白柔顺洗发乳'
];

const buildMockAbcSalesRows = (abcType: MockAbcType = 'sales') =>
  mockAbcBucketCounts[abcType].flatMap((bucket, bucketIndex) =>
    Array.from({ length: bucket.count }, (_, index) => {
      const seq = bucketIndex * 100 + index + 1;
      const salesBase = bucket.currentAbc === 'A' ? 36000 : bucket.currentAbc === 'B' ? 9200 : 1800;
      const sales = Number((salesBase + (bucket.count % 37) * 41 + index * 173.8).toFixed(2));
      const grossRate = Number((bucket.currentAbc === 'A' ? 24.5 : bucket.currentAbc === 'B' ? 18.8 : 11.6 + (index % 5)).toFixed(2));
      const saleQuantity = Number((sales / (bucket.currentAbc === 'A' ? 18.6 : bucket.currentAbc === 'B' ? 15.2 : 9.7)).toFixed(2));
      const className = seq % 3 === 0 ? '卫生用品' : seq % 3 === 1 ? '清洁用品' : '个人护理';
      return {
        productNo: makeMockProductNo(seq, '004'),
        productBarcode: String(6900000000000 + seq),
        productName: abcMockProductNames[seq % abcMockProductNames.length],
        productStatus: '上架',
        productStatusNo: '0',
        storeNum: 18 + (seq % 83),
        currentAbc: bucket.currentAbc,
        compareAbc: bucket.compareAbc,
        saleQuantity,
        saleQuantityPsd: Number((saleQuantity / 30).toFixed(4)),
        sales,
        salesPer: Number((sales / 7585282.91 * 100).toFixed(4)),
        salesPsd: Number((sales / 30).toFixed(4)),
        gross: Number((sales * grossRate / 100).toFixed(2)),
        grossPer: Number((sales * grossRate / 1257694.67).toFixed(4)),
        grossPsd: Number((sales * grossRate / 3000).toFixed(4)),
        grossRate,
        stockQuantity: 90 + seq * 7,
        turnoverRate: Number((1.2 + (seq % 19) / 10).toFixed(2)),
        turnoverDays: Number((18 + (seq % 31) * 1.7).toFixed(2)),
        stockSalesRate: Number((0.22 + (seq % 8) * 0.08).toFixed(2)),
        contributionRate: Number((sales / 7585282.91 * grossRate).toFixed(4)),
        gmroi: Number((0.7 + (seq % 17) * 0.22).toFixed(4)),
        salesRate: Number((65 + (seq % 29)).toFixed(2)),
        activity: seq % 4 === 0 ? '是' : '否',
        firstSaleDate: `2023/${String((seq % 12) + 1).padStart(2, '0')}/${String((seq % 26) + 1).padStart(2, '0')}`,
        newProduct: seq % 11 === 0 ? '是' : '否',
        keyProduct: bucket.currentAbc === 'A' ? '是' : '否',
        seasonableFlagName: seq % 9 === 0 ? '是' : '否',
        classNo: className === '卫生用品' ? '00403' : className === '清洁用品' ? '00402' : '00401',
        className,
        brandName: ['立白', '舒肤佳', '云南白药', '海飞丝', '洁柔', '维达'][seq % 6],
        spec: ['100g', '400ml', '1kg', '24包', '10包', '套装'][seq % 6],
        inPrice: Number((4.8 + (seq % 24) * 0.9).toFixed(2)),
        salesPrice: Number((8.9 + (seq % 36) * 1.6).toFixed(2)),
        productVendorNoName: `1090000${String(600 + (seq % 70)).padStart(3, '0')}有限公司`
      };
    })
  );

const mockAbcSalesRows = buildMockAbcSalesRows('sales');

const mockAbcAaVendorRows = [
  { productNo: '0040301030159', productName: '丝飘卫生纸', productStatus: '上架', productStatusNo: '0', storeNum: 36, currentAbc: 'A', compareAbc: 'A', contribution: 101867.48, contributionPer: 0.0286, saleQuantity: 5860.69, saleQuantityPsd: 2.495, sales: 227156.47, salesPer: 0.087, salesPsd: 96.7035, gross: 30822.28, grossPer: 0.0809, grossPsd: 13.1214, grossRate: 0.1357, stockQuantity: 2528, turnoverRate: 2.42, turnoverDays: 28.56, stockSalesRate: 0.41, contributionRate: 0.0041, gmroi: 0.33, salesRate: null, activity: null, firstSaleDate: '2023-04-05', newProduct: '否', keyProduct: '是', seasonableFlag: '0', seasonableFlagName: '否', seasonableStartDate: null, seasonableEndDate: null, classNo: '004', className: '洗化部', classLevel: null, productBarcode: '6971918876589', brandName: '丝飘', spec: '4.8kg', inPrice: 33.12, salesPrice: 49.5, productVendorNo: '1090000694', productVendorName: '1090000694有限公司', productVendorNoName: '10900006941090000694有限公司' },
  { productNo: '0040301030086', productName: '舒影柔厚可湿卷纸', productStatus: '上架', productStatusNo: '0', storeNum: 34, currentAbc: 'A', compareAbc: 'A', contribution: 95257.27, contributionPer: 0.0268, saleQuantity: 5120.67, saleQuantityPsd: 2.2819, sales: 213720.23, salesPer: 0.0818, salesPsd: 95.2407, gross: 27443.27, grossPer: 0.072, grossPsd: 12.2296, grossRate: 0.1284, stockQuantity: 1786, turnoverRate: 2.47, turnoverDays: 27.92, stockSalesRate: 0.4, contributionRate: 0.0036, gmroi: 0.32, salesRate: null, activity: null, firstSaleDate: '2023-04-05', newProduct: '否', keyProduct: '是', seasonableFlag: '0', seasonableFlagName: '否', seasonableStartDate: null, seasonableEndDate: null, classNo: '004', className: '洗化部', classLevel: null, productBarcode: '6959204900101', brandName: '舒影', spec: '5kg', inPrice: 35, salesPrice: 49.9, productVendorNo: '1090000076', productVendorName: '1090000076有限公司', productVendorNoName: '10900000761090000076有限公司' },
  { productNo: '0040301030126', productName: '萌力优竹木混浆本色纸', productStatus: '上架', productStatusNo: '0', storeNum: 33, currentAbc: 'A', compareAbc: 'A', contribution: 83470.55, contributionPer: 0.0235, saleQuantity: 6378.46, saleQuantityPsd: 2.9286, sales: 192579.01, salesPer: 0.0737, salesPsd: 88.4201, gross: 15084.69, grossPer: 0.0396, grossPsd: 6.9259, grossRate: 0.0783, stockQuantity: 1308, turnoverRate: 4.73, turnoverDays: 14.58, stockSalesRate: 0.21, contributionRate: 0.002, gmroi: 0.37, salesRate: null, activity: null, firstSaleDate: '2023-04-05', newProduct: '否', keyProduct: '是', seasonableFlag: '0', seasonableFlagName: '否', seasonableStartDate: null, seasonableEndDate: null, classNo: '004', className: '洗化部', classLevel: null, productBarcode: '6959204922226', brandName: '萌力优', spec: '4.75kg', inPrice: 26.94, salesPrice: 39.9, productVendorNo: '1090000076', productVendorName: '1090000076有限公司', productVendorNoName: '10900000761090000076有限公司' },
  { productNo: '0040101030540', productName: '优妮洗沐套装', productStatus: '上架', productStatusNo: '0', storeNum: 25, currentAbc: 'A', compareAbc: 'A', contribution: 53450.66, contributionPer: 0.015, saleQuantity: 1677.21, saleQuantityPsd: 1.0165, sales: 114914.07, salesPer: 0.044, salesPsd: 69.6449, gross: 23272.88, grossPer: 0.0611, grossPsd: 14.1048, grossRate: 0.2025, stockQuantity: 0, turnoverRate: null, turnoverDays: null, stockSalesRate: 0, contributionRate: 0.0031, gmroi: 0, salesRate: null, activity: null, firstSaleDate: '2023-04-05', newProduct: '否', keyProduct: '是', seasonableFlag: '0', seasonableFlagName: '否', seasonableStartDate: null, seasonableEndDate: null, classNo: '004', className: '洗化部', classLevel: null, productBarcode: '00401010305404', brandName: '优妮', spec: '500ml*3', inPrice: 0, salesPrice: 99, productVendorNo: '1080000080', productVendorName: '1080000080有限公司', productVendorNoName: '10800000801080000080有限公司' },
  { productNo: '0040302030200', productName: '舒影抽取式面巾纸', productStatus: '上架', productStatusNo: '0', storeNum: 36, currentAbc: 'A', compareAbc: 'A', contribution: 54628.24, contributionPer: 0.0154, saleQuantity: 17102.88, saleQuantityPsd: 7.2809, sales: 111054.98, salesPer: 0.0425, salesPsd: 47.2776, gross: 16917.93, grossPer: 0.0444, grossPsd: 7.2022, grossRate: 0.1523, stockQuantity: 9354.9, turnoverRate: 1.5, turnoverDays: 45.85, stockSalesRate: 0.66, contributionRate: 0.0022, gmroi: 0.23, salesRate: null, activity: null, firstSaleDate: '2023-04-05', newProduct: '否', keyProduct: '是', seasonableFlag: '0', seasonableFlagName: '否', seasonableStartDate: null, seasonableEndDate: null, classNo: '004', className: '洗化部', classLevel: null, productBarcode: '6959204900521', brandName: '舒影', spec: '72抽*6', inPrice: 5.4, salesPrice: 12.9, productVendorNo: '1090000076', productVendorName: '1090000076有限公司', productVendorNoName: '10900000761090000076有限公司' },
  { productNo: '0040302030114', productName: '舒影本色抽取式面巾纸6连包', productStatus: '上架', productStatusNo: '0', storeNum: 35, currentAbc: 'A', compareAbc: 'A', contribution: 20268.27, contributionPer: 0.0057, saleQuantity: 4726.22, saleQuantityPsd: 2.0702, sales: 40984.73, salesPer: 0.0157, salesPsd: 17.9521, gross: 8188.38, grossPer: 0.0215, grossPsd: 3.5867, grossRate: 0.1998, stockQuantity: 3992, turnoverRate: 0.97, turnoverDays: 71.3, stockSalesRate: 1.03, contributionRate: 0.0011, gmroi: 0.19, salesRate: null, activity: null, firstSaleDate: '2023-04-05', newProduct: '否', keyProduct: '是', seasonableFlag: '0', seasonableFlagName: '否', seasonableStartDate: null, seasonableEndDate: null, classNo: '004', className: '洗化部', classLevel: null, productBarcode: '6959204900019', brandName: '舒影', spec: '360张*6', inPrice: 6.8, salesPrice: 9.9, productVendorNo: '1090000076', productVendorName: '1090000076有限公司', productVendorNoName: '10900000761090000076有限公司' },
  { productNo: '0040201020091', productName: '好爸爸熏香皂粉', productStatus: '上架', productStatusNo: '0', storeNum: 36, currentAbc: 'A', compareAbc: 'A', contribution: 14321.17, contributionPer: 0.004, saleQuantity: 1103.08, saleQuantityPsd: 0.4696, sales: 32660.75, salesPer: 0.0125, salesPsd: 13.9041, gross: 3086.5, grossPer: 0.0081, grossPsd: 1.314, grossRate: 0.0945, stockQuantity: 536, turnoverRate: 2.18, turnoverDays: 31.6, stockSalesRate: 0.46, contributionRate: 0.0004, gmroi: 0.21, salesRate: null, activity: null, firstSaleDate: '2023-04-05', newProduct: '否', keyProduct: '是', seasonableFlag: '0', seasonableFlagName: '否', seasonableStartDate: null, seasonableEndDate: null, classNo: '004', className: '洗化部', classLevel: null, productBarcode: '6920174758085', brandName: '好爸爸', spec: '1.208kg', inPrice: 27, salesPrice: 29.9, productVendorNo: '1030000016', productVendorName: '1030000016有限公司', productVendorNoName: '10300000161030000016有限公司' },
  { productNo: '0040203020204', productName: '雕牌红柚薄荷洗洁精', productStatus: '上架', productStatusNo: '0', storeNum: 36, currentAbc: 'A', compareAbc: 'A', contribution: 13414.6, contributionPer: 0.0038, saleQuantity: 2592.95, saleQuantityPsd: 1.1039, sales: 28803.39, salesPer: 0.011, salesPsd: 12.262, gross: 3717.86, grossPer: 0.0098, grossPsd: 1.5827, grossRate: 0.1291, stockQuantity: 765, turnoverRate: 2.78, turnoverDays: 24.83, stockSalesRate: 0.36, contributionRate: 0.0005, gmroi: 0.36, salesRate: null, activity: null, firstSaleDate: '2023-04-05', newProduct: '否', keyProduct: '是', seasonableFlag: '0', seasonableFlagName: '否', seasonableStartDate: null, seasonableEndDate: null, classNo: '004', className: '洗化部', classLevel: null, productBarcode: '6910019025854', brandName: '雕牌', spec: '1.5kg', inPrice: 14, salesPrice: 16.8, productVendorNo: '1030000025', productVendorName: '1030000025有限公司', productVendorNoName: '10300000251030000025有限公司' },
  { productNo: '0040201010341', productName: '雕牌除菌无磷洗衣粉', productStatus: '上架', productStatusNo: '0', storeNum: 35, currentAbc: 'A', compareAbc: 'A', contribution: 12553.73, contributionPer: 0.0035, saleQuantity: 948.4, saleQuantityPsd: 0.4154, sales: 28315.62, salesPer: 0.0108, salesPsd: 12.4028, gross: 3143.22, grossPer: 0.0083, grossPsd: 1.3768, grossRate: 0.111, stockQuantity: 281, turnoverRate: 2.55, turnoverDays: 27.01, stockSalesRate: 0.39, contributionRate: 0.0004, gmroi: 0.28, salesRate: null, activity: null, firstSaleDate: '2023-04-05', newProduct: '否', keyProduct: '是', seasonableFlag: '0', seasonableFlagName: '否', seasonableStartDate: null, seasonableEndDate: null, classNo: '004', className: '洗化部', classLevel: null, productBarcode: '6910019017255', brandName: '雕牌', spec: '3.68kg', inPrice: 26.9, salesPrice: 29.9, productVendorNo: '1030000025', productVendorName: '1030000025有限公司', productVendorNoName: '10300000251030000025有限公司' },
  { productNo: '0040201030056', productName: '立白全效馨香洗衣皂', productStatus: '上架', productStatusNo: '0', storeNum: 36, currentAbc: 'A', compareAbc: 'A', contribution: 13438.16, contributionPer: 0.0038, saleQuantity: 4913.92, saleQuantityPsd: 2.0919, sales: 27398.91, salesPer: 0.0105, salesPsd: 11.6641, gross: 3348.08, grossPer: 0.0088, grossPsd: 1.4253, grossRate: 0.1222, stockQuantity: 2752, turnoverRate: 2.5, turnoverDays: 27.55, stockSalesRate: 0.4, contributionRate: 0.0004, gmroi: 0.31, salesRate: null, activity: null, firstSaleDate: '2023-04-05', newProduct: '否', keyProduct: '是', seasonableFlag: '0', seasonableFlagName: '否', seasonableStartDate: null, seasonableEndDate: null, classNo: '004', className: '洗化部', classLevel: null, productBarcode: '6920174744613', brandName: '立白', spec: '190g*2', inPrice: 6.2, salesPrice: 7.9, productVendorNo: '1030000016', productVendorName: '1030000016有限公司', productVendorNoName: '10300000161030000016有限公司' }
];

const getMockAbcAaRows = (abcType: MockAbcType = 'sales') => {
  const generated = buildMockAbcSalesRows(abcType).filter((row) => row.currentAbc === 'A' && row.compareAbc === 'A');
  const total = mockAbcBucketCounts[abcType].find((row) => row.currentAbc === 'A' && row.compareAbc === 'A')?.count || 0;
  return Array.from({ length: total }, (_, index) => {
    if (index < mockAbcAaVendorRows.length) return mockAbcAaVendorRows[index];
    const source = generated[index % generated.length] || generated[0];
    return {
      ...source,
      productNo: makeMockProductNo(5000 + index, '004'),
      productBarcode: String(6970000000000 + index),
      productName: `${source.productName}${index + 1}`,
      currentAbc: 'A',
      compareAbc: 'A'
    };
  });
};

const mockAbcSalesList = (input: Record<string, any> = {}) => {
  const abcType = normalizeMockAbcType(input.abcType);
  const currentAbc = String(input.currentAbc || '').toUpperCase();
  const compareAbc = String(input.compareAbc || '').toUpperCase();
  const page = Number(input.page || input.pageNum || 1);
  const size = Number(input.size || input.pageSize || 10);
  let rows = currentAbc === 'A' && compareAbc === 'A' ? getMockAbcAaRows(abcType) : buildMockAbcSalesRows(abcType);
  if (currentAbc) rows = rows.filter((row) => row.currentAbc === currentAbc);
  if (compareAbc) rows = rows.filter((row) => row.compareAbc === compareAbc);
  const start = (page - 1) * size;
  return {
    ...pagePayload(rows.slice(start, start + size) as any, page, size),
    total: rows.length,
    totalElements: rows.length,
    pages: Math.max(1, Math.ceil(rows.length / size))
  };
};

const apiEnvelope = <T>(data: T) => ({
  success: true,
  code: '200',
  message: 'OK',
  data,
  result: data,
  requestId: `mock-${Date.now()}`,
  timestamp: new Date().toISOString()
});

const legacyEnvelope = <T>(result: T) => ({
  success: true,
  message: 'OK',
  code: 200,
  data: result,
  result,
  timestamp: Date.now()
});

const findSessionId = (value: unknown): string => {
  if (!value) return '';
  if (typeof value === 'string') {
    if (value.includes(MOCK_DIAGNOSIS_SESSION_ID)) return MOCK_DIAGNOSIS_SESSION_ID;
    try {
      return findSessionId(JSON.parse(value));
    } catch {
      return '';
    }
  }
  if (Array.isArray(value)) {
    for (const item of value) {
      const found = findSessionId(item);
      if (found) return found;
    }
    return '';
  }
  if (typeof value === 'object') {
    const record = value as Record<string, unknown>;
    if (String(record.sessionId || '') === MOCK_DIAGNOSIS_SESSION_ID) return MOCK_DIAGNOSIS_SESSION_ID;
    for (const item of Object.values(record)) {
      const found = findSessionId(item);
      if (found) return found;
    }
  }
  return '';
};

const mockPriceBandDiagram = () => ({
  priceLineNum: 385,
  priceRangeText: '0.00 - 688.00',
  pricePointList: [{ pricePoint: '29.90' }, { pricePoint: '9.90' }, { pricePoint: '49.90' }],
  rangePerformanceList: mockPriceBandRows.map((item) => ({ priceBand: item.priceBand, priceBandMin: item.priceBandMin, priceBandMax: item.priceBandMax, sku: item.sku, sales: item.sales, saleQuantity: item.saleQuantity })),
  linePerformanceList: [
    { pricePoint: 9.9, sku: 874, sales: 1365902.93 },
    { pricePoint: 29.9, sku: 903, sales: 1537487.32 },
    { pricePoint: 49.9, sku: 499, sales: 1317328.57 }
  ]
});

const mockPriceBandRows = [
  { priceBand: '0.00-9.90', priceBandMin: 0, priceBandMax: 9.9, sku: 874, skuPer: 18.46, saleQuantity: 207886.29, saleQuantityPer: 42.53, avgProduct: 237.86, sales: 1365902.93, salesPer: 18.01, promoSku: 0, suggestSku: 2014, suggestSkuPer: 42.53 },
  { priceBand: '9.90-24.81', priceBandMin: 9.9, priceBandMax: 24.81, sku: 1539, skuPer: 32.5, saleQuantity: 171599.6, saleQuantityPer: 35.1, avgProduct: 111.5, sales: 2228029.54, salesPer: 29.37, promoSku: 0, suggestSku: 1662, suggestSkuPer: 35.1 },
  { priceBand: '24.81-39.72', priceBandMin: 24.81, priceBandMax: 39.72, sku: 903, skuPer: 19.07, saleQuantity: 57010.48, saleQuantityPer: 11.66, avgProduct: 63.13, sales: 1537487.32, salesPer: 20.27, promoSku: 0, suggestSku: 552, suggestSkuPer: 11.66 },
  { priceBand: '39.72-54.63', priceBandMin: 39.72, priceBandMax: 54.63, sku: 499, skuPer: 10.54, saleQuantity: 35294.36, saleQuantityPer: 7.22, avgProduct: 70.73, sales: 1317328.57, salesPer: 17.37, promoSku: 0, suggestSku: 342, suggestSkuPer: 7.22 },
  { priceBand: '54.63-69.54', priceBandMin: 54.63, priceBandMax: 69.54, sku: 258, skuPer: 5.45, saleQuantity: 5708.24, saleQuantityPer: 1.17, avgProduct: 22.12, sales: 252283.64, salesPer: 3.33, promoSku: 0, suggestSku: 55, suggestSkuPer: 1.16 },
  { priceBand: '69.54-84.45', priceBandMin: 69.54, priceBandMax: 84.45, sku: 161, skuPer: 3.4, saleQuantity: 3269.97, saleQuantityPer: 0.67, avgProduct: 20.31, sales: 206743.23, salesPer: 2.73, promoSku: 0, suggestSku: 32, suggestSkuPer: 0.68 },
  { priceBand: '84.45-99.36', priceBandMin: 84.45, priceBandMax: 99.36, sku: 206, skuPer: 4.35, saleQuantity: 4810.53, saleQuantityPer: 0.98, avgProduct: 23.35, sales: 315234.2, salesPer: 4.16, promoSku: 0, suggestSku: 47, suggestSkuPer: 0.99 },
  { priceBand: '99.36-114.27', priceBandMin: 99.36, priceBandMax: 114.27, sku: 67, skuPer: 1.41, saleQuantity: 846.05, saleQuantityPer: 0.17, avgProduct: 12.63, sales: 73666.29, salesPer: 0.97, promoSku: 0, suggestSku: 8, suggestSkuPer: 0.17 },
  { priceBand: '114.27-129.18', priceBandMin: 114.27, priceBandMax: 129.18, sku: 44, skuPer: 0.93, saleQuantity: 301.01, saleQuantityPer: 0.06, avgProduct: 6.84, sales: 23883.06, salesPer: 0.31, promoSku: 0, suggestSku: 3, suggestSkuPer: 0.06 },
  { priceBand: '129.18-144.09', priceBandMin: 129.18, priceBandMax: 144.09, sku: 52, skuPer: 1.1, saleQuantity: 603.64, saleQuantityPer: 0.12, avgProduct: 11.61, sales: 47990.85, salesPer: 0.63, promoSku: 0, suggestSku: 6, suggestSkuPer: 0.13 },
  { priceBand: '144.09-159.00', priceBandMin: 144.09, priceBandMax: 159, sku: 39, skuPer: 0.82, saleQuantity: 825.6, saleQuantityPer: 0.17, avgProduct: 21.17, sales: 124699.4, salesPer: 1.64, promoSku: 0, suggestSku: 8, suggestSkuPer: 0.17 },
  { priceBand: '159.00-168.00', priceBandMin: 159, priceBandMax: 168, sku: 10, skuPer: 0.21, saleQuantity: 60.44, saleQuantityPer: 0.01, avgProduct: 6.04, sales: 6541.1, salesPer: 0.09, promoSku: 0, suggestSku: 0, suggestSkuPer: 0 },
  { priceBand: '168.00-688.00', priceBandMin: 168, priceBandMax: 688, sku: 83, skuPer: 1.75, saleQuantity: 610.92, saleQuantityPer: 0.12, avgProduct: 7.36, sales: 85492.78, salesPer: 1.13, promoSku: 0, suggestSku: 6, suggestSkuPer: 0.13 }
];

const mockPriceBandSummary = () => ({
  summaryOne: ['当前价格带存在3个价格点“29.90、9.90、49.90”，用户更愿意购买该售价商品。'],
  summaryTwo: ['客户购买“9.90-24.81”区间的商品意愿较高，但此区间配置SKU数较少，可参考建议SKU数增加配置。'],
  summaryThree: ['客户购买“69.54-84.45、114.27-129.18、159.00-168.00”区间的商品意愿较低，但此区间配置SKU数较多，可减少配置或更换SKU。'],
  list: mockPriceBandRows
});

const mockPriceBandGoodsBase = {
  productStatus: '上架',
  productStatusNo: '上架',
  activity: 'N',
  newProduct: '否',
  keyProduct: '否',
  seasonableFlag: '否',
  seasonableFlagName: '否',
  classNo: '00403',
  className: '卫生用品',
  productVendorNoName: '10900006381090000638有限公司'
};

const mockPriceBandGoodsRows = [
  { priceBand: '0.00-9.90', productNo: '004******001', productName: '洁柔抽纸自然木亲肤3层100抽', productBarcode: '6922266450011', brandName: '洁柔', spec: '100抽', salesPrice: 8.9, inPrice: 5.2, storeNum: 128, saleQuantity: 18246, saleQuantityPsd: 2.138, sales: 162389.4, salesPer: 2.14, salesPsd: 19.02, gross: 41220.6, grossPer: 3.28, grossPsd: 4.83, grossRate: 25.38, stockQuantity: 3820, turnoverRate: 4.7764, turnoverDays: 7.6412, stockSalesRate: 0.21, contributionRate: 0.54, gmroi: 10.79, salesRate: 97.25 },
  { priceBand: '0.00-9.90', productNo: '004******002', productName: '心相印茶语手帕纸10包装', productBarcode: '6922266450028', brandName: '心相印', spec: '10包', salesPrice: 9.9, inPrice: 6.1, storeNum: 116, saleQuantity: 15320, saleQuantityPsd: 1.836, sales: 151668, salesPer: 2, salesPsd: 18.18, gross: 36560, grossPer: 2.91, grossPsd: 4.38, grossRate: 24.1, stockQuantity: 4265, turnoverRate: 3.592, turnoverDays: 10.161, stockSalesRate: 0.28, contributionRate: 0.48, gmroi: 8.57, salesRate: 95.42 },
  { priceBand: '0.00-9.90', productNo: '004******003', productName: '清风原木金装抽纸80抽', productBarcode: '6922266450035', brandName: '清风', spec: '80抽', salesPrice: 8.8, inPrice: 5.8, storeNum: 104, saleQuantity: 12480, saleQuantityPsd: 1.482, sales: 109824, salesPer: 1.45, salesPsd: 13.04, gross: 26124, grossPer: 2.08, grossPsd: 3.1, grossRate: 23.79, stockQuantity: 3188, turnoverRate: 3.9147, turnoverDays: 9.323, stockSalesRate: 0.26, contributionRate: 0.34, gmroi: 8.2, salesRate: 93.58 },
  { priceBand: '9.90-24.81', productNo: '004******101', productName: '立白大师香氛洗衣液1kg', productBarcode: '6931009910101', brandName: '立白', spec: '1kg', salesPrice: 19.9, inPrice: 12.4, storeNum: 156, saleQuantity: 10286, saleQuantityPsd: 1.102, sales: 204691.4, salesPer: 2.7, salesPsd: 21.94, gross: 77145, grossPer: 6.13, grossPsd: 8.27, grossRate: 37.69, stockQuantity: 2360, turnoverRate: 4.3585, turnoverDays: 8.374, stockSalesRate: 0.23, contributionRate: 1.02, gmroi: 32.69, salesRate: 98.26 },
  { priceBand: '9.90-24.81', productNo: '004******102', productName: '舒肤佳柠檬清新沐浴露400ml', productBarcode: '6903148221020', brandName: '舒肤佳', spec: '400ml', salesPrice: 22.8, inPrice: 14.7, storeNum: 143, saleQuantity: 8615, saleQuantityPsd: 0.974, sales: 196422, salesPer: 2.59, salesPsd: 22.21, gross: 69781.5, grossPer: 5.55, grossPsd: 7.89, grossRate: 35.53, stockQuantity: 1986, turnoverRate: 4.3389, turnoverDays: 8.4118, stockSalesRate: 0.23, contributionRate: 0.92, gmroi: 35.14, salesRate: 97.03 },
  { priceBand: '9.90-24.81', productNo: '004******103', productName: '超能植翠低泡洗衣液1.5kg', productBarcode: '6901234561034', brandName: '超能', spec: '1.5kg', salesPrice: 24.8, inPrice: 15.6, storeNum: 132, saleQuantity: 7024, saleQuantityPsd: 0.821, sales: 174195.2, salesPer: 2.3, salesPsd: 20.37, gross: 64620.8, grossPer: 5.14, grossPsd: 7.56, grossRate: 37.1, stockQuantity: 1564, turnoverRate: 4.491, turnoverDays: 8.128, stockSalesRate: 0.22, contributionRate: 0.85, gmroi: 41.32, salesRate: 96.8 },
  { priceBand: '24.81-39.72', productNo: '004******201', productName: '云南白药益生菌牙膏180g', productBarcode: '6901070602010', brandName: '云南白药', spec: '180g', salesPrice: 29.9, inPrice: 18.5, storeNum: 121, saleQuantity: 5964, saleQuantityPsd: 0.642, sales: 178323.6, salesPer: 2.35, salesPsd: 19.19, gross: 67989.6, grossPer: 5.41, grossPsd: 7.31, grossRate: 38.13, stockQuantity: 1320, turnoverRate: 4.5182, turnoverDays: 8.0807, stockSalesRate: 0.22, contributionRate: 0.9, gmroi: 51.51, salesRate: 96.16 },
  { priceBand: '24.81-39.72', productNo: '004******202', productName: '海飞丝丝质柔滑去屑洗发水400ml', productBarcode: '6903148222027', brandName: '海飞丝', spec: '400ml', salesPrice: 39.6, inPrice: 25.2, storeNum: 109, saleQuantity: 3812, saleQuantityPsd: 0.422, sales: 150955.2, salesPer: 1.99, salesPsd: 16.72, gross: 54892.8, grossPer: 4.36, grossPsd: 6.08, grossRate: 36.36, stockQuantity: 1088, turnoverRate: 3.5037, turnoverDays: 10.4175, stockSalesRate: 0.29, contributionRate: 0.72, gmroi: 50.45, salesRate: 94.2 },
  { priceBand: '39.72-54.63', productNo: '004******301', productName: '维达超韧抽纸24包整箱', productBarcode: '6901234563014', brandName: '维达', spec: '24包', salesPrice: 49.9, inPrice: 33.8, storeNum: 98, saleQuantity: 2268, saleQuantityPsd: 0.281, sales: 113173.2, salesPer: 1.49, salesPsd: 14.02, gross: 36514.8, grossPer: 2.9, grossPsd: 4.52, grossRate: 32.26, stockQuantity: 846, turnoverRate: 2.6809, turnoverDays: 13.614, stockSalesRate: 0.37, contributionRate: 0.48, gmroi: 43.16, salesRate: 91.5 },
  { priceBand: '54.63-69.54', productNo: '004******401', productName: '蓝月亮深层洁净洗衣液3kg', productBarcode: '6902022134018', brandName: '蓝月亮', spec: '3kg', salesPrice: 59.9, inPrice: 40.5, storeNum: 86, saleQuantity: 986, saleQuantityPsd: 0.122, sales: 59061.4, salesPer: 0.78, salesPsd: 7.31, gross: 19128.4, grossPer: 1.52, grossPsd: 2.37, grossRate: 32.39, stockQuantity: 512, turnoverRate: 1.9258, turnoverDays: 18.952, stockSalesRate: 0.52, contributionRate: 0.25, gmroi: 37.36, salesRate: 88.2 },
  { priceBand: '69.54-84.45', productNo: '004******501', productName: '奥妙除菌除螨洗衣液4kg', productBarcode: '6902088975010', brandName: '奥妙', spec: '4kg', salesPrice: 79.9, inPrice: 55.6, storeNum: 64, saleQuantity: 462, saleQuantityPsd: 0.061, sales: 36913.8, salesPer: 0.49, salesPsd: 4.87, gross: 11226.6, grossPer: 0.89, grossPsd: 1.48, grossRate: 30.41, stockQuantity: 336, turnoverRate: 1.375, turnoverDays: 26.545, stockSalesRate: 0.73, contributionRate: 0.15, gmroi: 33.41, salesRate: 82.8 },
  { priceBand: '84.45-99.36', productNo: '004******601', productName: '清扬男士去屑洗发水套装', productBarcode: '6901234566015', brandName: '清扬', spec: '套装', salesPrice: 89.9, inPrice: 61.8, storeNum: 59, saleQuantity: 386, saleQuantityPsd: 0.052, sales: 34691.4, salesPer: 0.46, salesPsd: 4.68, gross: 10846.6, grossPer: 0.86, grossPsd: 1.46, grossRate: 31.27, stockQuantity: 288, turnoverRate: 1.3403, turnoverDays: 27.232, stockSalesRate: 0.75, contributionRate: 0.14, gmroi: 37.66, salesRate: 80.1 },
  { priceBand: '99.36-114.27', productNo: '004******701', productName: '心相印卷纸家庭装30卷', productBarcode: '6901234567012', brandName: '心相印', spec: '30卷', salesPrice: 109, inPrice: 75.8, storeNum: 42, saleQuantity: 188, saleQuantityPsd: 0.026, sales: 20492, salesPer: 0.27, salesPsd: 2.84, gross: 6241.6, grossPer: 0.5, grossPsd: 0.87, grossRate: 30.46, stockQuantity: 160, turnoverRate: 1.175, turnoverDays: 31.064, stockSalesRate: 0.85, contributionRate: 0.08, gmroi: 39.01, salesRate: 76.5 },
  { priceBand: '114.27-129.18', productNo: '004******801', productName: '维达蓝色经典卷纸整箱', productBarcode: '6901234568019', brandName: '维达', spec: '整箱', salesPrice: 119, inPrice: 85.4, storeNum: 31, saleQuantity: 106, saleQuantityPsd: 0.015, sales: 12614, salesPer: 0.17, salesPsd: 1.78, gross: 3561.6, grossPer: 0.28, grossPsd: 0.5, grossRate: 28.23, stockQuantity: 118, turnoverRate: 0.8983, turnoverDays: 40.632, stockSalesRate: 1.11, contributionRate: 0.05, gmroi: 30.18, salesRate: 70.4 }
].map((item) => ({ ...mockPriceBandGoodsBase, ...item }));

const mockPriceBandDetails = (input: Record<string, any> = {}) => {
  const selectedBands = Array.isArray(input.priceBandList) ? input.priceBandList.map(String) : input.priceBandList ? [String(input.priceBandList)] : [];
  const rows = selectedBands.length ? mockPriceBandGoodsRows.filter((row) => selectedBands.includes(row.priceBand)) : mockPriceBandGoodsRows;
  const page = Number(input.page || 1);
  const size = Number(input.size || 10);
  const start = (page - 1) * size;
  return {
    ...pagePayload(rows.slice(start, start + size) as any, page, size),
    total: rows.length,
    totalElements: rows.length,
    pages: Math.max(1, Math.ceil(rows.length / size))
  };
};

const mockBrandOptions = () => ({
  brandList: [
    { brandNo: 'LIBY', brandName: '立白' },
    { brandNo: 'SHUYING', brandName: '舒影' },
    { brandNo: 'SIPIAO', brandName: '丝飘' },
    { brandNo: 'CHNICE', brandName: '超能' },
    { brandNo: 'ANAN', brandName: '安安金纯' }
  ],
  summaryOne: ['立白', '舒影', '丝飘', '超能', '安安金纯'],
  summaryTwo: ['优洁王', '欧乐B', '简洁', '子晞', '半懒'],
  summaryThree: ['青蛙王子', '冰泉', '安安', 'fe金典', '萌力优'],
  summaryFour: ['简洁', '半懒', '自然乐园', '子晞', '雪玲妃']
});

const mockBrandShareRows = () => {
  const seedRows = [
    { name: 'G.DUCK小黄鸭', value: 58520, salesPer: 0.77 },
    { name: '丽洁丽净', value: 52680, salesPer: 0.69 },
    { name: '云南白药菁羽', value: 48240, salesPer: 0.64 },
    { name: '完净', value: 43860, salesPer: 0.58 },
    { name: '立白', value: 494691.6, salesPer: 6.52 },
    { name: '舒影', value: 398420, salesPer: 5.25 },
    { name: '丝飘', value: 229780, salesPer: 3.03 },
    { name: '超能', value: 200940, salesPer: 2.65 },
    { name: '安安金纯', value: 199620, salesPer: 2.63 },
    { name: '云南白药', value: 198450, salesPer: 2.62 },
    { name: '萌力优', value: 197850, salesPer: 2.61 },
    { name: '心相印', value: 195720, salesPer: 2.58 },
    { name: '雕牌', value: 172680, salesPer: 2.28 },
    { name: '七度空间', value: 166420, salesPer: 2.19 }
  ];
  const generatedRows = Array.from({ length: 102 }, (_, index) => {
    const value = Math.max(3600, 41000 - index * 330);
    return {
      name: `品牌${String(index + 15).padStart(3, '0')}`,
      value,
      salesPer: Number((value / 7585282.91 * 100).toFixed(2))
    };
  });
  return [...seedRows, ...generatedRows].map((item) => ({
    ...item,
    brandName: item.name,
    productBrand: item.name,
    data: item.value,
    sales: item.value
  }));
};

const mockBrandRankingRows = () => [
  { name: '立白', brandName: '立白', productBrand: '立白', value: 494691.6, data: 494691.6, sales: 494691.6, salesPer: 6.52, sku: 186, gross: 83108.19, grossRate: 16.8 },
  { name: '舒影', brandName: '舒影', productBrand: '舒影', value: 398420, data: 398420, sales: 398420, salesPer: 5.25, sku: 148, gross: 65978.35, grossRate: 16.56 },
  { name: '丝飘', brandName: '丝飘', productBrand: '丝飘', value: 229780, data: 229780, sales: 229780, salesPer: 3.03, sku: 132, gross: 39386.29, grossRate: 17.14 },
  { name: '超能', brandName: '超能', productBrand: '超能', value: 200940, data: 200940, sales: 200940, salesPer: 2.65, sku: 121, gross: 31768.61, grossRate: 15.81 },
  { name: '安安金纯', brandName: '安安金纯', productBrand: '安安金纯', value: 199620, data: 199620, sales: 199620, salesPer: 2.63, sku: 96, gross: 34993.39, grossRate: 17.53 },
  { name: '云南白药', brandName: '云南白药', productBrand: '云南白药', value: 198450, data: 198450, sales: 198450, salesPer: 2.62, sku: 88, gross: 33677.17, grossRate: 16.97 },
  { name: '萌力优', brandName: '萌力优', productBrand: '萌力优', value: 197850, data: 197850, sales: 197850, salesPer: 2.61, sku: 74, gross: 32942.03, grossRate: 16.65 },
  { name: '心相印', brandName: '心相印', productBrand: '心相印', value: 195720, data: 195720, sales: 195720, salesPer: 2.58, sku: 69, gross: 31614.39, grossRate: 16.15 },
  { name: '雕牌', brandName: '雕牌', productBrand: '雕牌', value: 172680, data: 172680, sales: 172680, salesPer: 2.28, sku: 63, gross: 27922.38, grossRate: 16.17 },
  { name: '七度空间', brandName: '七度空间', productBrand: '七度空间', value: 166420, data: 166420, sales: 166420, salesPer: 2.19, sku: 58, gross: 27143.75, grossRate: 16.31 }
];

const mockBrandSkuSalesChangeRows = () => [
  { name: '花香5', brandName: '花香5', productBrand: '花香5', sku: 0, skuChange: 0, salesGrowth: -32.5 },
  { name: '欧莱雅', brandName: '欧莱雅', productBrand: '欧莱雅', sku: 1, skuChange: 1, salesGrowth: 42.8 },
  { name: '隆力奇', brandName: '隆力奇', productBrand: '隆力奇', sku: 3, skuChange: 3, salesGrowth: -16.4 },
  { name: '兰亭', brandName: '兰亭', productBrand: '兰亭', sku: -3, skuChange: -3, salesGrowth: -86.2 },
  { name: '蒂花之秀', brandName: '蒂花之秀', productBrand: '蒂花之秀', sku: 20, skuChange: 20, salesGrowth: 190.5 },
  { name: '安安金纯', brandName: '安安金纯', productBrand: '安安金纯', sku: 2, skuChange: 2, salesGrowth: 12.1 },
  { name: '海飞丝', brandName: '海飞丝', productBrand: '海飞丝', sku: -7, skuChange: -7, salesGrowth: 9.8 },
  { name: '力士', brandName: '力士', productBrand: '力士', sku: -6, skuChange: -6, salesGrowth: 18.2 },
  { name: '飘柔', brandName: '飘柔', productBrand: '飘柔', sku: -12, skuChange: -12, salesGrowth: -18.6 }
];

const mockSpecOptions = () => ({
  specList: [{ specName: '5kg' }, { specName: '4.8kg' }, { specName: '4.75kg' }, { specName: '50g' }, { specName: '100g' }],
  summaryOne: ['5kg', '4.8kg', '4.75kg', '50g', '100g'],
  summaryTwo: ['1支装(J)', '1500g', '278', '五双圈', '13p'],
  summaryThree: ['3000g', '2.5L', '720g+280g', '2.38kg', '100g+100g'],
  summaryFour: ['278', '五双圈', '250g(J)', '285cm*5p', '13p']
});

const mockShareList = () => [
  { name: '立白', value: 918600, per: 12.11, sales: 918600, salesPer: 12.11, sku: 186, skuPer: 3.93 },
  { name: '舒影', value: 782450, per: 10.32, sales: 782450, salesPer: 10.32, sku: 148, skuPer: 3.13 },
  { name: '丝飘', value: 693200, per: 9.14, sales: 693200, salesPer: 9.14, sku: 132, skuPer: 2.79 },
  { name: '超能', value: 658730, per: 8.68, sales: 658730, salesPer: 8.68, sku: 121, skuPer: 2.56 },
  { name: '安安金纯', value: 512600, per: 6.76, sales: 512600, salesPer: 6.76, sku: 96, skuPer: 2.03 }
];

const mockBrandChartRows = () => [
  { name: '立白', brandName: '立白', productBrand: '立白', value: 918600, data: 918600, sales: 918600, salesPer: 12.11, sku: 18, skuChange: 18, salesGrowth: 21.34, gross: 154320, grossRate: 16.8 },
  { name: '舒影', brandName: '舒影', productBrand: '舒影', value: 782450, data: 782450, sales: 782450, salesPer: 10.32, sku: 12, skuChange: 12, salesGrowth: 18.62, gross: 129600, grossRate: 16.56 },
  { name: '丝飘', brandName: '丝飘', productBrand: '丝飘', value: 693200, data: 693200, sales: 693200, salesPer: 9.14, sku: 9, skuChange: 9, salesGrowth: 14.28, gross: 118840, grossRate: 17.14 },
  { name: '超能', brandName: '超能', productBrand: '超能', value: 658730, data: 658730, sales: 658730, salesPer: 8.68, sku: 7, skuChange: 7, salesGrowth: 11.76, gross: 104120, grossRate: 15.81 },
  { name: '安安金纯', brandName: '安安金纯', productBrand: '安安金纯', value: 512600, data: 512600, sales: 512600, salesPer: 6.76, sku: 5, skuChange: 5, salesGrowth: 9.35, gross: 89850, grossRate: 17.53 },
  { name: '青蛙王子', brandName: '青蛙王子', productBrand: '青蛙王子', value: 356420, data: 356420, sales: 356420, salesPer: 4.7, sku: 15, skuChange: 15, salesGrowth: 38.24, gross: 60230, grossRate: 16.9 },
  { name: '冰泉', brandName: '冰泉', productBrand: '冰泉', value: 286510, data: 286510, sales: 286510, salesPer: 3.78, sku: 11, skuChange: 11, salesGrowth: 31.47, gross: 45210, grossRate: 15.78 },
  { name: '安安', brandName: '安安', productBrand: '安安', value: 242300, data: 242300, sales: 242300, salesPer: 3.19, sku: 8, skuChange: 8, salesGrowth: 27.85, gross: 41980, grossRate: 17.33 },
  { name: 'fe金典', brandName: 'fe金典', productBrand: 'fe金典', value: 186540, data: 186540, sales: 186540, salesPer: 2.46, sku: 6, skuChange: 6, salesGrowth: 24.56, gross: 29850, grossRate: 16 },
  { name: '萌力优', brandName: '萌力优', productBrand: '萌力优', value: 162880, data: 162880, sales: 162880, salesPer: 2.15, sku: 4, skuChange: 4, salesGrowth: 22.18, gross: 27120, grossRate: 16.65 },
  { name: '简洁', brandName: '简洁', productBrand: '简洁', value: 68200, data: 68200, sales: 68200, salesPer: 0.9, sku: -8, skuChange: -8, salesGrowth: -36.42, gross: 9200, grossRate: 13.49 },
  { name: '半懒', brandName: '半懒', productBrand: '半懒', value: 61500, data: 61500, sales: 61500, salesPer: 0.81, sku: -7, skuChange: -7, salesGrowth: -32.15, gross: 8400, grossRate: 13.66 },
  { name: '自然乐园', brandName: '自然乐园', productBrand: '自然乐园', value: 54880, data: 54880, sales: 54880, salesPer: 0.72, sku: -5, skuChange: -5, salesGrowth: -28.64, gross: 7730, grossRate: 14.09 },
  { name: '子晞', brandName: '子晞', productBrand: '子晞', value: 49220, data: 49220, sales: 49220, salesPer: 0.65, sku: -4, skuChange: -4, salesGrowth: -25.31, gross: 6610, grossRate: 13.43 },
  { name: '雪玲妃', brandName: '雪玲妃', productBrand: '雪玲妃', value: 42160, data: 42160, sales: 42160, salesPer: 0.56, sku: -3, skuChange: -3, salesGrowth: -22.76, gross: 6010, grossRate: 14.26 }
];

const mockSpecChartRows = () => [
  { name: '5kg', productSpec: '5kg', specName: '5kg', value: 614200, data: 614200, sales: 614200, salesPer: 8.1, sku: 21, skuChange: 21, salesGrowth: 18.2 },
  { name: '4.8kg', productSpec: '4.8kg', specName: '4.8kg', value: 486300, data: 486300, sales: 486300, salesPer: 6.41, sku: 16, skuChange: 16, salesGrowth: 15.7 },
  { name: '4.75kg', productSpec: '4.75kg', specName: '4.75kg', value: 421800, data: 421800, sales: 421800, salesPer: 5.56, sku: 12, skuChange: 12, salesGrowth: 13.9 },
  { name: '50g', productSpec: '50g', specName: '50g', value: 389100, data: 389100, sales: 389100, salesPer: 5.13, sku: 34, skuChange: 34, salesGrowth: 11.2 },
  { name: '100g', productSpec: '100g', specName: '100g', value: 356700, data: 356700, sales: 356700, salesPer: 4.7, sku: 28, skuChange: 28, salesGrowth: 9.8 },
  { name: '3000g', productSpec: '3000g', specName: '3000g', value: 288400, data: 288400, sales: 288400, salesPer: 3.8, sku: 18, skuChange: 18, salesGrowth: 35.6 },
  { name: '2.5L', productSpec: '2.5L', specName: '2.5L', value: 266900, data: 266900, sales: 266900, salesPer: 3.52, sku: 15, skuChange: 15, salesGrowth: 29.4 },
  { name: '720g+280g', productSpec: '720g+280g', specName: '720g+280g', value: 201300, data: 201300, sales: 201300, salesPer: 2.65, sku: 11, skuChange: 11, salesGrowth: 26.8 },
  { name: '2.38kg', productSpec: '2.38kg', specName: '2.38kg', value: 186500, data: 186500, sales: 186500, salesPer: 2.46, sku: 9, skuChange: 9, salesGrowth: 22.3 },
  { name: '100g+100g', productSpec: '100g+100g', specName: '100g+100g', value: 154600, data: 154600, sales: 154600, salesPer: 2.04, sku: 7, skuChange: 7, salesGrowth: 19.7 },
  { name: '278', productSpec: '278', specName: '278', value: 42100, data: 42100, sales: 42100, salesPer: 0.56, sku: -7, skuChange: -7, salesGrowth: -31.4 },
  { name: '五双圈', productSpec: '五双圈', specName: '五双圈', value: 38600, data: 38600, sales: 38600, salesPer: 0.51, sku: -6, skuChange: -6, salesGrowth: -27.6 },
  { name: '250g(J)', productSpec: '250g(J)', specName: '250g(J)', value: 32400, data: 32400, sales: 32400, salesPer: 0.43, sku: -5, skuChange: -5, salesGrowth: -24.1 },
  { name: '285cm*5p', productSpec: '285cm*5p', specName: '285cm*5p', value: 28800, data: 28800, sales: 28800, salesPer: 0.38, sku: -4, skuChange: -4, salesGrowth: -21.9 },
  { name: '13p', productSpec: '13p', specName: '13p', value: 24600, data: 24600, sales: 24600, salesPer: 0.32, sku: -3, skuChange: -3, salesGrowth: -19.3 }
];

const mockRanking = () => ({
  ave: 204944.2,
  maxData: 494691.6,
  minData: 42160,
  total: 350,
  list: mockBrandRankingRows()
});

const mockAbcParams = () => [
  { abcType: 'sales', abcTypeName: '销售额ABC', arate: 50, brate: 40, crate: 10, askuRate: 10, bskuRate: 30, cskuRate: 60 },
  { abcType: 'gross', abcTypeName: '毛利额ABC', arate: 50, brate: 40, crate: 10, askuRate: 10, bskuRate: 30, cskuRate: 60 },
  { abcType: 'contribution', abcTypeName: '综合业绩ABC', salesPer: 0.4, grossPer: 0.4, salesQuantityPer: 0.2, arate: 50, brate: 40, crate: 10, askuRate: 10, bskuRate: 30, cskuRate: 60 }
];

const mockAbcDatasets: Record<MockAbcType, {
  metricLabel: string;
  rows: Array<{
    bucket: 'A' | 'B' | 'C';
    setPer: number;
    setValue: number;
    setSkuPer: number;
    setSku: number;
    currentSku: number;
    currentSkuPer: number;
    stockQuantity: number;
    stockQuantityPer: number;
    compareSku: number;
    compareSkuPer: number;
    changeSku: number;
  }>;
}> = {
  sales: {
    metricLabel: '销售额',
    rows: [
      { bucket: 'A', setPer: 50, setValue: 3792641.46, setSkuPer: 10, setSku: 474, currentSku: 274, currentSkuPer: 5.79, stockQuantity: 130988.9, stockQuantityPer: 27.34, compareSku: 301, compareSkuPer: 5.77, changeSku: -27 },
      { bucket: 'B', setPer: 40, setValue: 3034113.16, setSkuPer: 30, setSku: 1421, currentSku: 1627, currentSkuPer: 34.36, stockQuantity: 249261.45, stockQuantityPer: 52.02, compareSku: 1549, compareSkuPer: 29.71, changeSku: 78 },
      { bucket: 'C', setPer: 10, setValue: 758528.29, setSkuPer: 60, setSku: 2841, currentSku: 2834, currentSkuPer: 59.85, stockQuantity: 98936.96, stockQuantityPer: 20.65, compareSku: 3363, compareSkuPer: 64.51, changeSku: -529 }
    ]
  },
  gross: {
    metricLabel: '毛利额',
    rows: [
      { bucket: 'A', setPer: 50, setValue: 625102.11, setSkuPer: 10, setSku: 474, currentSku: 355, currentSkuPer: 7.5, stockQuantity: 155755.9, stockQuantityPer: 32.5, compareSku: 320, compareSkuPer: 6.14, changeSku: 35 },
      { bucket: 'B', setPer: 40, setValue: 500081.69, setSkuPer: 30, setSku: 1421, currentSku: 1625, currentSkuPer: 34.32, stockQuantity: 223238.45, stockQuantityPer: 46.59, compareSku: 1507, compareSkuPer: 28.91, changeSku: 118 },
      { bucket: 'C', setPer: 10, setValue: 125020.42, setSkuPer: 60, setSku: 2841, currentSku: 2755, currentSkuPer: 58.18, stockQuantity: 100192.96, stockQuantityPer: 20.91, compareSku: 3386, compareSkuPer: 64.95, changeSku: -631 }
    ]
  },
  contribution: {
    metricLabel: '综合业绩',
    rows: [
      { bucket: 'A', setPer: 50, setValue: 1777911.28, setSkuPer: 10, setSku: 474, currentSku: 284, currentSkuPer: 6, stockQuantity: 145502.9, stockQuantityPer: 30.36, compareSku: 317, compareSkuPer: 6.08, changeSku: -33 },
      { bucket: 'B', setPer: 40, setValue: 1422329.03, setSkuPer: 30, setSku: 1421, currentSku: 1651, currentSkuPer: 34.87, stockQuantity: 241974.45, stockQuantityPer: 50.5, compareSku: 1577, compareSkuPer: 30.25, changeSku: 74 },
      { bucket: 'C', setPer: 10, setValue: 355582.26, setSkuPer: 60, setSku: 2841, currentSku: 2800, currentSkuPer: 59.13, stockQuantity: 91709.96, stockQuantityPer: 19.14, compareSku: 3319, compareSkuPer: 63.67, changeSku: -519 }
    ]
  }
};

const mockAbcImage = (abcType = 'sales') => {
  const dataset = mockAbcDatasets[normalizeMockAbcType(abcType)];
  return dataset.rows.map((item) => ({
    abcType: item.bucket,
    currentSalesPer: item.setPer,
    currentSkuPer: item.currentSkuPer,
    compareSalesPer: item.setPer,
    compareSkuPer: item.compareSkuPer,
    setSalesPer: item.setPer,
    setSkuPer: item.setSkuPer
  }));
};

const buildMockAbcMatrix = (abcType = 'sales') => {
  const map = new Map(mockAbcBucketCounts[normalizeMockAbcType(abcType)].map((item) => [`${item.compareAbc}-${item.currentAbc}`, item.count]));
  const count = (compareAbc: string, currentAbc: string) => Number(map.get(`${compareAbc}-${currentAbc}`) || 0);
  return {
    aaNum: count('A', 'A'),
    baNum: count('A', 'B'),
    caNum: count('A', 'C'),
    abNum: count('B', 'A'),
    bbNum: count('B', 'B'),
    cbNum: count('B', 'C'),
    acNum: count('C', 'A'),
    bcNum: count('C', 'B'),
    ccNum: count('C', 'C'),
    anNum: count('NONE', 'A'),
    bnNum: count('NONE', 'B'),
    cnNum: count('NONE', 'C'),
    atNum: count('A', 'A') + count('B', 'A') + count('C', 'A') + count('NONE', 'A'),
    btNum: count('A', 'B') + count('B', 'B') + count('C', 'B') + count('NONE', 'B'),
    ctNum: count('A', 'C') + count('B', 'C') + count('C', 'C') + count('NONE', 'C')
  };
};

const mockAbcDetails = (abcType = 'sales') =>
  mockAbcDatasets[normalizeMockAbcType(abcType)].rows.map((item) => ({
    abcType: item.bucket,
    setSalesPer: item.setPer,
    setSales: item.setValue,
    setSkuPer: item.setSkuPer,
    setSku: item.setSku,
    currentSku: item.currentSku,
    currentSkuPer: item.currentSkuPer,
    stockQuantity: item.stockQuantity,
    stockQuantityPer: item.stockQuantityPer,
    compareSku: item.compareSku,
    compareSkuPer: item.compareSkuPer,
    changeSku: item.changeSku,
    currentSales: item.setValue
  }));

const mockGrossQuadrant = () => ({
  salesPer: 16.58,
  gross: 1257694.67,
  scaleX: [-95764, 0, 17, 19, 21, 26, 35, 2254],
  list: buildGrossQuadrantPoints()
});

const mockGrossRole = () => ({
  currentSalesPer_1: 42.18,
  currentSalesPer_2: 31.76,
  currentSalesPer_3: 9.84,
  currentSalesPer_4: 16.22,
  compareSalesPer_1: 40.62,
  compareSalesPer_2: 32.11,
  compareSalesPer_3: 11.35,
  compareSalesPer_4: 15.92,
  currentSku_3: 1153,
  currentSkuPer_1: 18.4,
  currentSkuPer_2: 28.7,
  currentSkuPer_3: 24.35,
  currentSkuPer_4: 28.55,
  compareSkuPer_1: 17.9,
  compareSkuPer_2: 29.1,
  compareSkuPer_3: 25.1,
  compareSkuPer_4: 27.9,
  sku_1: 0,
  sku_2: 308,
  sku_3: 1153,
  sku_4: 0
});

const mockGmroiQuadrant = () => ({
  grossRate: 16.58,
  turnoverRate: 95.27,
  scaleX: [0, 25, 50, 75, 95.27, 150, 220],
  scaleY: [0, 8, 16.58, 25, 35, 50],
  list: buildGmroiQuadrantPoints()
});

const mockGmroiRole = () => ({
  currentSku_1: 1286,
  currentSku_2: 964,
  currentSku_3: 1082,
  currentSku_4: 1403,
  currentSkuPer_1: 27.16,
  currentSkuPer_2: 20.36,
  currentSkuPer_3: 22.85,
  currentSkuPer_4: 29.63,
  compareSkuPer_1: 26.41,
  compareSkuPer_2: 20.88,
  compareSkuPer_3: 23.64,
  compareSkuPer_4: 29.07,
  sku_1: 4686,
  sku_2: 289,
  sku_3: 1082,
  sku_4: 4686
});

const mockVendorSummary = () => ({
  summaryOne: ['10300000461030000046有限公司、10400000751040000075有限公司、10800003161080000316有限公司、10800004141080000414有限公司、10800004231080000423有限公司等，单品产出较少且毛利率较低，建议优化该供应商下的商品。'],
  summaryTwo: ['10900006381090000638有限公司、10900006731090000673有限公司、10400000461040000046有限公司、10900005251090000525有限公司、10900005791090000579有限公司等，单品产出较少，建议减少或更换该供应商下的商品。'],
  summaryThree: ['10800003161080000316有限公司、10900005251090000525有限公司、10400000751040000075有限公司、10900004501090000450有限公司、10900006261090000626有限公司等，缺货率相对较高，建议规范供应商履约行为。']
});

const mockVendorShareRows = () => [
  { productVendorNo: '1030000046', productVendorName: '10300000461030000046有限公司', sales: 412600, salesPer: 5.44, data: 412600 },
  { productVendorNo: '1040000075', productVendorName: '10400000751040000075有限公司', sales: 386420, salesPer: 5.09, data: 386420 },
  { productVendorNo: '1080000316', productVendorName: '10800003161080000316有限公司', sales: 342880, salesPer: 4.52, data: 342880 },
  { productVendorNo: '1080000414', productVendorName: '10800004141080000414有限公司', sales: 298740, salesPer: 3.94, data: 298740 },
  { productVendorNo: '1080000423', productVendorName: '10800004231080000423有限公司', sales: 254300, salesPer: 3.35, data: 254300 },
  { productVendorNo: '1090000638', productVendorName: '10900006381090000638有限公司', sales: 186200, salesPer: 2.45, data: 186200 },
  { productVendorNo: '1090000673', productVendorName: '10900006731090000673有限公司', sales: 164800, salesPer: 2.17, data: 164800 },
  { productVendorNo: '1040000046', productVendorName: '10400000461040000046有限公司', sales: 142360, salesPer: 1.88, data: 142360 },
  { productVendorNo: '1090000525', productVendorName: '10900005251090000525有限公司', sales: 126400, salesPer: 1.67, data: 126400 },
  { productVendorNo: '1090000579', productVendorName: '10900005791090000579有限公司', sales: 108900, salesPer: 1.44, data: 108900 }
];

const mockVendorRanking = () => ({
  ave: 242360,
  maxData: 412600,
  minData: 108900,
  total: mockVendorShareRows().length,
  list: mockVendorShareRows()
});

const mockObsoleteBase = {
  handleStatus: '未处理',
  productStatus: '上架',
  currentSalesAbc: 'C',
  compareSalesAbc: 'C',
  currentGrossAbc: 'C',
  compareGrossAbc: 'C',
  currentContributionAbc: 'C',
  compareContributionAbc: 'C',
  currentContributionRole: '问题商品',
  compareContributionRole: '问题商品',
  currentGmroiRole: '问题商品',
  compareGmroiRole: '问题商品',
  saleQuantity: undefined,
  saleQuantityPsd: undefined,
  sales: undefined,
  salesPer: undefined,
  salesPsd: undefined,
  gross: undefined,
  grossGrowth: undefined,
  grossPer: undefined,
  grossPsd: undefined,
  grossRate: undefined,
  grossRateGrowth: undefined,
  turnoverRate: undefined,
  turnoverDays: undefined,
  stockSalesRate: undefined,
  contributionRate: 0,
  gmroi: 0,
  salesRate: undefined,
  activitySku: '-',
  newProduct: '否',
  keyProduct: '否',
  seasonableFlagName: '否'
};

const mockObsoleteGoodsRows = [
  {
    ...mockObsoleteBase,
    productNo: '004******314',
    productName: '飘柔海滩曼舞香氛滋润去屑洗发露',
    storeNum: 1,
    stockQuantity: 16,
    firstSaleDate: '2023/04/05',
    productTags: '国产 果香 液体 滋润、去屑 瓶装 通用 香氛精华'
  },
  {
    ...mockObsoleteBase,
    productNo: '004******464',
    productName: '清扬男士头皮劲活专研去屑洗发露劲爽控油型',
    storeNum: 1,
    stockQuantity: 5,
    firstSaleDate: '2023/07/11',
    productTags: '国产 控油、劲爽 液体 瓶装 男性 茶树精油 薄荷香'
  },
  {
    ...mockObsoleteBase,
    productNo: '004******482',
    productName: '三个魔发匠菁萃净澈去屑洗发水',
    storeNum: 1,
    stockQuantity: 3,
    firstSaleDate: '2023/07/18',
    productTags: '净澈、去屑 国产 液体 淡香 瓶装 菁萃精华 通用'
  },
  {
    ...mockObsoleteBase,
    productNo: '004******500',
    productName: '温莎森林蛋白去屑洗发乳',
    storeNum: 1,
    stockQuantity: 12,
    firstSaleDate: '2023/08/01',
    productTags: '乳液 去屑、滋养 国产 淡香 瓶装 蛋白 通用'
  },
  {
    ...mockObsoleteBase,
    productNo: '004******524',
    productName: '联合利华赠品（金纺衣物护理剂z）',
    storeNum: 3,
    stockQuantity: 48,
    firstSaleDate: '2023/08/17',
    productTags: '国产 液体 淡香 衣物护理剂 衣物柔顺 袋装 通用'
  },
  {
    ...mockObsoleteBase,
    productNo: '004******250',
    productName: '丝蕴水润顺滑洗发水',
    storeNum: 1,
    stockQuantity: 5,
    firstSaleDate: '2023/03/21',
    productTags: '国产 水润、顺滑 水润精华 液体 淡香 瓶装 通用'
  },
  {
    ...mockObsoleteBase,
    productNo: '004******279',
    productName: '满婷氨基酸表活柔顺去屑洗发乳',
    storeNum: 1,
    stockQuantity: 16,
    firstSaleDate: '2023/03/28',
    productTags: '国产 成人 柔顺、去屑 氨基酸配方 液体 瓶装'
  },
  {
    ...mockObsoleteBase,
    productNo: '004******285',
    productName: '温莎森林蛋白柔顺洗发乳',
    storeNum: 1,
    stockQuantity: 9,
    firstSaleDate: '2023/03/30',
    productTags: '乳液 成人 柔顺 瓶装 蛋白 进口'
  },
  {
    ...mockObsoleteBase,
    productNo: '004******304',
    productName: '滋源无患子保湿滋养护发素',
    storeNum: 1,
    stockQuantity: 2,
    firstSaleDate: '2023/04/03',
    productTags: '保湿滋养 国产 无患子提取物 无香 瓶装 膏状 通用'
  },
  {
    ...mockObsoleteBase,
    productNo: '004******550',
    productName: '温莎森林蛋白修护洗发乳',
    storeNum: 1,
    stockQuantity: 2,
    firstSaleDate: '2023/08/23',
    productTags: '乳液 修护发质 国产 淡香 瓶装 蛋白 通用'
  }
];

const mockObsoleteGoods = () => pagePayload(mockObsoleteGoodsRows as any);

export const isMockDiagnosisRequestConfig = (config: { url?: string; params?: unknown; data?: unknown }) =>
  findSessionId(config.url) === MOCK_DIAGNOSIS_SESSION_ID ||
  findSessionId(config.params) === MOCK_DIAGNOSIS_SESSION_ID ||
  findSessionId(config.data) === MOCK_DIAGNOSIS_SESSION_ID;

export const getMockDiagnosisRequestData = (config: { url?: string; params?: Record<string, any>; data?: any }) => {
  const url = String(config.url || '');
  const params = config.params || {};
  const data = typeof config.data === 'string' ? (() => {
    try {
      return JSON.parse(config.data);
    } catch {
      return {};
    }
  })() : config.data || {};
  const tagType = String(params.tagType || data.tagType || 'function');

  if (url.includes('/api/v1/diagnosis/sessions/') && url.includes('/status')) return apiEnvelope(getMockDiagnosisStatus());
  if (url.includes('/api/v1/diagnosis/overview')) return apiEnvelope(getMockDiagnosisOverview());
  if (url.includes('/api/v1/diagnosis/overall-summary')) return apiEnvelope(getMockOverallSummary());
  if (url.includes('/api/v1/diagnosis/introduce-direction')) return apiEnvelope(getMockIntroduceDirection());
  if (url.includes('/api/v1/diagnosis/trends')) return apiEnvelope(getMockTrend(String(params.metricCode || params.tabType || 'sales')));
  if (url.includes('/salesStoreClass/sonClassSalesPer')) return legacyEnvelope(getMockSubClassPie());
  if (url.includes('/salesStoreClass/sonClassSalesTrendChart')) return legacyEnvelope(getMockSubClassTrend());
  if (url.includes('/salesStoreClass/sonClassSalesList')) return legacyEnvelope(getMockSubClassTable());
  if (url.includes('/api/v1/channel-performance/pie')) return apiEnvelope(getMockChannelPie());
  if (url.includes('/api/v1/channel-performance/trend')) return apiEnvelope(getMockChannelTrend());
  if (url.includes('/api/v1/channel-performance/details')) return apiEnvelope(getMockChannelTable());
  if (url.includes('/api/v1/customer-analysis/ages')) return apiEnvelope(getMockCustomerAgeBuckets());
  if (url.includes('/api/v1/customer-analysis/radar')) return apiEnvelope(getMockCustomerRadar());
  if (url.includes('/api/v1/customer-analysis/details')) return apiEnvelope(getMockCustomerDetails());
  if (url.includes('/api/v1/tag-analysis/types')) return apiEnvelope(getMockTagTypes());
  if (url.includes('/api/v1/tag-analysis/sales-share')) return apiEnvelope(getMockTagSalesShare(tagType));
  if (url.includes('/api/v1/tag-analysis/list')) return apiEnvelope(getMockTagList(tagType));
  if (url.includes('/api/v1/obsolete-goods/list')) return apiEnvelope(mockObsoleteGoods());

  if (url.includes('/api/v1/price-band/diagram')) return apiEnvelope(mockPriceBandDiagram());
  if (url.includes('/api/v1/price-band/range-summary')) return apiEnvelope(mockPriceBandSummary());
  if (url.includes('/api/v1/price-band/details')) return apiEnvelope(mockPriceBandDetails({ ...params, ...data }));
  if (url.includes('/api/v1/brand-analysis/overview')) return apiEnvelope({ totalNum: 346, newNum: 27, ownNum: 0 });
  if (url.includes('/api/v1/brand-analysis/sales-share')) return apiEnvelope(mockBrandShareRows());
  if (url.includes('/api/v1/brand-analysis/filter-options')) return apiEnvelope(mockBrandOptions());
  if (url.includes('/api/v1/brand-analysis/ranking')) return apiEnvelope(mockRanking());
  if (url.includes('/api/v1/brand-analysis/sku-sales-change')) return apiEnvelope({ list: mockBrandSkuSalesChangeRows(), records: mockBrandSkuSalesChangeRows() });
  if (url.includes('/api/v1/brand-analysis/list') || url.includes('/api/v1/brand-analysis/sku-list')) return apiEnvelope(pagePayload(mockBrandChartRows() as any));
  if (url.includes('/api/v1/spec-analysis/overview')) return apiEnvelope({ totalNum: 1198, newNum: 72 });
  if (url.includes('/api/v1/spec-analysis/sales-share')) return apiEnvelope(mockSpecChartRows().slice(0, 10));
  if (url.includes('/api/v1/spec-analysis/filter-options')) return apiEnvelope(mockSpecOptions());
  if (url.includes('/api/v1/spec-analysis/ranking')) return apiEnvelope({ ave: 257486, maxData: 614200, minData: 24600, total: mockSpecChartRows().length, list: mockSpecChartRows() });
  if (url.includes('/api/v1/spec-analysis/sku-sales-change')) return apiEnvelope({ list: mockSpecChartRows(), records: mockSpecChartRows() });
  if (url.includes('/api/v1/spec-analysis/list')) return apiEnvelope(pagePayload(mockSpecChartRows() as any));

  if (url.includes('/api/v1/abc-structure/params/update')) return apiEnvelope({ jobId: 0, status: 'SUCCESS' });
  if (url.includes('/api/v1/abc-structure/params')) return apiEnvelope(mockAbcParams());
  if (url.includes('/api/v1/abc-structure/image')) return apiEnvelope(mockAbcImage(String(params.abcType || 'sales')));
  if (url.includes('/api/v1/abc-structure/matrix')) return apiEnvelope(buildMockAbcMatrix(String(params.abcType || 'sales')));
  if (url.includes('/api/v1/abc-structure/details')) return apiEnvelope(mockAbcDetails(String(params.abcType || 'sales')));
  if (url.includes('/api/v1/abc-structure/sales-list')) return apiEnvelope(mockAbcSalesList({ ...params, ...data }));

  if (url.includes('/classDoctorGross/queryGrossFourQuadrant')) return legacyEnvelope(mockGrossQuadrant());
  if (url.includes('/classDoctorGross/queryGrossSalesList')) return legacyEnvelope(pagePayload());
  if (url.includes('/classDoctorGross/queryGrossSalesPer') || url.includes('/classDoctorGross/queryGrossSkuPer') || url.includes('/classDoctorGross/queryGrossSkuChange')) return legacyEnvelope(mockGrossRole());
  if (url.includes('/classDoctorGmroi/queryGmroiFourQuadrant')) return legacyEnvelope(mockGmroiQuadrant());
  if (url.includes('/classDoctorGmroi/queryGmroiSalesList')) return legacyEnvelope(pagePayload());
  if (url.includes('/classDoctorGmroi/queryGmroiSkuNum') || url.includes('/classDoctorGmroi/queryGmroiSkuPer') || url.includes('/classDoctorGmroi/queryGmroiSkuChange')) return legacyEnvelope(mockGmroiRole());

  if (url.includes('/api/v1/vendor-analysis/sales-share')) return apiEnvelope(mockVendorShareRows());
  if (url.includes('/api/v1/vendor-analysis/summary')) return apiEnvelope(mockVendorSummary());
  if (url.includes('/api/v1/vendor-analysis/ranking')) return apiEnvelope(mockVendorRanking());

  return apiEnvelope({ records: [], list: [], total: 0, current: 1, size: 20, pages: 0 });
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

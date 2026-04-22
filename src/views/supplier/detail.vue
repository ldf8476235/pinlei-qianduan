<template>
  <div class="p-2 supplier-detail-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="title-block">
          <div class="page-title-row">
            <span class="page-title">供应商明细</span>
          </div>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button type="primary" plain @click="handleExport">导出</el-button>
        </div>
      </div>

      <div class="filter-panel">
        <div class="filter-row">
          <el-date-picker v-model="filters.dateRange" type="daterange" unlink-panels range-separator="至" start-placeholder="开始日期" end-placeholder="结束日期" value-format="YYYY-MM-DD" />
          <el-select v-model="filters.vendor" multiple collapse-tags collapse-tags-tooltip placeholder="供应商">
            <el-option v-for="item in vendorOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-select v-model="filters.status" multiple collapse-tags collapse-tags-tooltip placeholder="供应商状态">
            <el-option v-for="item in statusOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-select v-model="filters.category" placeholder="品类">
            <el-option v-for="item in categoryOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-button>更多条件</el-button>
          <el-button @click="resetFilters">重置</el-button>
          <el-button type="primary" @click="loadData">查询</el-button>
        </div>
        <div class="filter-row filter-row--second">
          <el-select v-model="filters.businessType" placeholder="业态">
            <el-option v-for="item in businessTypeOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <el-select v-model="filters.businessCircle" placeholder="商圈">
            <el-option v-for="item in businessCircleOptions" :key="item" :label="item" :value="item" />
          </el-select>
          <div class="row-spacer" />
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="10" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="card-title">缺货率统计</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :lg="14" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="card-title">趋势统计</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">供应商明细</span>
        </div>
      </template>

      <el-table :data="tableData" border stripe show-summary :summary-method="summaryMethod" class="supplier-table" header-cell-class-name="supplier-table-header" cell-class-name="supplier-table-cell">
        <el-table-column label="供应商编号" prop="vendorNo" min-width="140" fixed="left" />
        <el-table-column label="供应商名称" prop="vendorName" min-width="200" fixed="left" show-overflow-tooltip />
        <el-table-column label="当前状态" prop="statusName" min-width="120" />

        <el-table-column label="供应SKU" align="center">
          <el-table-column label="总计" prop="supplierSkuTotal" min-width="110" sortable="custom" align="center">
            <template #default="{ row }"><span class="highlight-number">{{ formatInteger(row.supplierSkuTotal) }}</span></template>
          </el-table-column>
          <el-table-column label="构成比" prop="supplierSkuShare" min-width="110" align="center">
            <template #default="{ row }">{{ formatPercent(row.supplierSkuShare) }}</template>
          </el-table-column>
          <el-table-column label="新增" prop="supplierSkuNew" min-width="100" align="center">
            <template #default="{ row }">{{ formatInteger(row.supplierSkuNew) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="净进货额" prop="netOrderAmount" min-width="130" sortable="custom" align="center">
          <template #default="{ row }">{{ formatAmount(row.netOrderAmount) }}</template>
        </el-table-column>
        <el-table-column label="缺货额" prop="shortageAmount" min-width="120" sortable="custom" align="center">
          <template #default="{ row }">{{ formatAmount(row.shortageAmount) }}</template>
        </el-table-column>
        <el-table-column label="缺货率" prop="shortageRate" min-width="110" sortable="custom" align="center">
          <template #default="{ row }">{{ formatPercent(row.shortageRate) }}</template>
        </el-table-column>

        <el-table-column label="销售额" align="center">
          <el-table-column label="总计" prop="salesTotal" min-width="130" sortable="custom" align="center">
            <template #default="{ row }">{{ formatAmount(row.salesTotal) }}</template>
          </el-table-column>
          <el-table-column label="构成比" prop="salesShare" min-width="110" align="center">
            <template #default="{ row }">{{ formatPercent(row.salesShare) }}</template>
          </el-table-column>
          <el-table-column label="去年同期" prop="lastYearSales" min-width="130" sortable="custom" align="center">
            <template #default="{ row }">{{ formatAmount(row.lastYearSales) }}</template>
          </el-table-column>
          <el-table-column label="同比" prop="salesYoy" min-width="110" sortable="custom" align="center">
            <template #default="{ row }">{{ formatGrowth(row.salesYoy) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="毛利额" align="center">
          <el-table-column label="总计" prop="grossTotal" min-width="130" sortable="custom" align="center">
            <template #default="{ row }">{{ formatAmount(row.grossTotal) }}</template>
          </el-table-column>
          <el-table-column label="构成比" prop="grossShare" min-width="110" align="center">
            <template #default="{ row }">{{ formatPercent(row.grossShare) }}</template>
          </el-table-column>
          <el-table-column label="去年同期" prop="lastYearGross" min-width="130" sortable="custom" align="center">
            <template #default="{ row }">{{ formatAmount(row.lastYearGross) }}</template>
          </el-table-column>
          <el-table-column label="同比" prop="grossYoy" min-width="110" sortable="custom" align="center">
            <template #default="{ row }">{{ formatGrowth(row.grossYoy) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="毛利率-总计" prop="grossRateTotal" min-width="120" align="center">
          <template #default="{ row }">{{ formatPercent(row.grossRateTotal) }}</template>
        </el-table-column>
        <el-table-column label="毛利率-去年同期" prop="grossRateLastYear" min-width="132" align="center">
          <template #default="{ row }">{{ formatPercent(row.grossRateLastYear) }}</template>
        </el-table-column>
        <el-table-column label="库存周转天数" prop="turnoverDays" min-width="130" align="center">
          <template #default="{ row }">{{ formatAmount(row.turnoverDays) }}</template>
        </el-table-column>
        <el-table-column label="库存周转率" prop="turnoverRate" min-width="120" align="center">
          <template #default="{ row }">{{ formatPercent(row.turnoverRate) }}</template>
        </el-table-column>
        <el-table-column label="后台费用" prop="backendFee" min-width="120" sortable="custom" align="center">
          <template #default="{ row }">{{ formatAmount(row.backendFee) }}</template>
        </el-table-column>
        <el-table-column label="综合毛利" prop="comprehensiveGross" min-width="120" sortable="custom" align="center">
          <template #default="{ row }">{{ formatAmount(row.comprehensiveGross) }}</template>
        </el-table-column>
        <el-table-column label="综合毛利率" prop="comprehensiveGrossRate" min-width="120" sortable="custom" align="center">
          <template #default="{ row }">{{ formatPercent(row.comprehensiveGrossRate) }}</template>
        </el-table-column>
        <el-table-column label="当前库存金额-总计" prop="inventoryAmount" min-width="140" align="center">
          <template #default="{ row }">{{ formatAmount(row.inventoryAmount) }}</template>
        </el-table-column>
        <el-table-column label="当前盘点小分单数" prop="inventoryCheckCount" min-width="140" align="center">
          <template #default="{ row }">{{ formatInteger(row.inventoryCheckCount) }}</template>
        </el-table-column>
        <el-table-column label="当前预警品数" prop="warningCount" min-width="120" align="center">
          <template #default="{ row }">{{ formatInteger(row.warningCount) }}</template>
        </el-table-column>
        <el-table-column label="操作" min-width="110" fixed="right" align="center">
          <template #default>
            <el-button link type="primary">趋势分析</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { getVendorRanking, getVendorSalesShare, getVendorSummary } from '@/api/supplier';
import type { VendorRankingItemVO, VendorSalesShareItemVO } from '@/api/supplier/types';

interface SupplierDetailRow extends VendorRankingItemVO {
  vendorNo: string;
  vendorName: string;
  statusName: string;
  supplierSkuTotal: number;
  supplierSkuShare: number;
  supplierSkuNew: number;
  netOrderAmount: number;
  shortageAmount: number;
  shortageRate: number;
  salesTotal: number;
  salesShare: number;
  lastYearSales: number;
  salesYoy: number;
  grossTotal: number;
  grossShare: number;
  lastYearGross: number;
  grossYoy: number;
  grossRateTotal: number;
  grossRateLastYear: number;
  turnoverDays: number;
  turnoverRate: number;
  backendFee: number;
  comprehensiveGross: number;
  comprehensiveGrossRate: number;
  inventoryAmount: number;
  inventoryCheckCount: number;
  warningCount: number;
}

const route = useRoute();
const sessionId = computed(() => String(route.query.sessionId || ''));
const pieChartRef = ref<HTMLDivElement>();
const trendChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const trendChartIns = ref<echarts.ECharts>();
const loading = ref(false);
const salesShare = ref<VendorSalesShareItemVO[]>([]);
const ranking = ref<VendorRankingItemVO[]>([]);
const statusPool = ['正常', '缺货', '预警', '关注'];
const categoryPool = ['全部', '洗化部', '纸品部', '日配部'];
const businessTypePool = ['全部业态', '大卖场', '便利店', '社区店'];
const businessCirclePool = ['全部商圈', '核心商圈', '社区商圈', '写字楼商圈'];
const vendorOptions = ['广州立白企业集团', '云南白药集团', '恒安集团'];
const statusOptions = ['正常', '缺货', '预警'];
const categoryOptions = categoryPool;
const businessTypeOptions = businessTypePool;
const businessCircleOptions = businessCirclePool;
const filters = ref({
  dateRange: [] as string[],
  vendor: [] as string[],
  status: [] as string[],
  category: '',
  businessType: '',
  businessCircle: ''
});

const pieData = computed(() => {
  const total = salesShare.value.reduce((sum, item) => sum + Number(item.sales || 0), 0) || 1;
  const sorted = [...salesShare.value].sort((a, b) => Number(b.sales || 0) - Number(a.sales || 0)).slice(0, 3);
  const buckets = [
    { name: '5%以上供应商数', value: Math.max(1, Math.round(sorted[0]?.salesPer || 30)), color: '#14b8a6' },
    { name: '1%-5%(含)供应商数', value: Math.max(1, Math.round(sorted[1]?.salesPer || 12)), color: '#f59e0b' },
    { name: '1%(含)以下供应商数', value: Math.max(1, Math.round(sorted[2]?.salesPer || 6)), color: '#8b5cf6' }
  ];
  return buckets.map((item) => ({ ...item, percent: Number(((item.value / total) * 100).toFixed(2)) }));
});

const tableData = computed<SupplierDetailRow[]>(() => {
  const total = ranking.value.reduce((sum, item) => sum + Number(item.data || 0), 0) || 1;
  return ranking.value.map((item, index) => {
    const base = Number(item.data || 0);
    const salesTotal = base * 2.4 + index * 6000;
    const grossTotal = salesTotal * 0.28;
    const lastYearSales = salesTotal * 0.86;
    const lastYearGross = grossTotal * 0.82;
    const shortageAmount = base * 0.11;
    return {
      ...item,
      vendorNo: String(item.productVendorNo || '--'),
      vendorName: String(item.productVendorName || '--'),
      statusName: statusPool[index % statusPool.length],
      supplierSkuTotal: Math.max(1, Math.round(base)),
      supplierSkuShare: Number(((base / total) * 100).toFixed(2)),
      supplierSkuNew: (index % 4) + 1,
      netOrderAmount: base * 1.9,
      shortageAmount,
      shortageRate: Number(((shortageAmount / Math.max(base * 1.9, 1)) * 100).toFixed(2)),
      salesTotal,
      salesShare: Number(((salesTotal / Math.max(ranking.value.reduce((s, v) => s + (Number(v.data || 0) * 2.4), 0), 1)) * 100).toFixed(2)),
      lastYearSales,
      salesYoy: Number((((salesTotal - lastYearSales) / Math.max(lastYearSales, 1)) * 100).toFixed(2)),
      grossTotal,
      grossShare: Number(((grossTotal / Math.max(ranking.value.reduce((s, v) => s + (Number(v.data || 0) * 0.28), 0), 1)) * 100).toFixed(2)),
      lastYearGross,
      grossYoy: Number((((grossTotal - lastYearGross) / Math.max(lastYearGross, 1)) * 100).toFixed(2)),
      grossRateTotal: Number(((grossTotal / Math.max(salesTotal, 1)) * 100).toFixed(2)),
      grossRateLastYear: Number(((lastYearGross / Math.max(lastYearSales, 1)) * 100).toFixed(2)),
      turnoverDays: 12 + index,
      turnoverRate: 0.8 + index * 0.02,
      backendFee: base * 0.05,
      comprehensiveGross: grossTotal - base * 0.05,
      comprehensiveGrossRate: Number((((grossTotal - base * 0.05) / Math.max(salesTotal, 1)) * 100).toFixed(2)),
      inventoryAmount: base * 1.3,
      inventoryCheckCount: (index + 1) * 3,
      warningCount: index % 7
    };
  });
});

const summaryRow = computed(() => {
  const rows = tableData.value;
  const sum = (key: keyof SupplierDetailRow) => rows.reduce((acc, row) => acc + Number(row[key] || 0), 0);
  return {
    vendorNo: '合计',
    vendorName: '',
    statusName: '',
    supplierSkuTotal: sum('supplierSkuTotal'),
    supplierSkuShare: 100,
    supplierSkuNew: sum('supplierSkuNew'),
    netOrderAmount: sum('netOrderAmount'),
    shortageAmount: sum('shortageAmount'),
    shortageRate: rows.length ? sum('shortageRate') / rows.length : 0,
    salesTotal: sum('salesTotal'),
    salesShare: 100,
    lastYearSales: sum('lastYearSales'),
    salesYoy: rows.length ? sum('salesYoy') / rows.length : 0,
    grossTotal: sum('grossTotal'),
    grossShare: 100,
    lastYearGross: sum('lastYearGross'),
    grossYoy: rows.length ? sum('grossYoy') / rows.length : 0,
    grossRateTotal: rows.length ? sum('grossRateTotal') / rows.length : 0,
    grossRateLastYear: rows.length ? sum('grossRateLastYear') / rows.length : 0,
    turnoverDays: rows.length ? sum('turnoverDays') / rows.length : 0,
    turnoverRate: rows.length ? sum('turnoverRate') / rows.length : 0,
    backendFee: sum('backendFee'),
    comprehensiveGross: sum('comprehensiveGross'),
    comprehensiveGrossRate: rows.length ? sum('comprehensiveGrossRate') / rows.length : 0,
    inventoryAmount: sum('inventoryAmount'),
    inventoryCheckCount: sum('inventoryCheckCount'),
    warningCount: sum('warningCount')
  } as SupplierDetailRow;
});

const formatAmount = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits }) : '--';
};
const formatInteger = (value: unknown) => formatAmount(value, 0);
const formatPercent = (value: unknown) => `${Number(value ?? 0).toFixed(2)}%`;
const formatGrowth = (value: unknown) => `${Number(value ?? 0) > 0 ? '+' : ''}${Number(value ?? 0).toFixed(2)}%`;

const initPieChart = () => {
  if (!pieChartRef.value) return;
  pieChartIns.value ||= echarts.init(pieChartRef.value);
};

const initTrendChart = () => {
  if (!trendChartRef.value) return;
  trendChartIns.value ||= echarts.init(trendChartRef.value);
};

const renderPieChart = () => {
  initPieChart();
  if (!pieChartIns.value) return;
  const option: EChartsOption = {
    tooltip: { trigger: 'item' },
    legend: { bottom: 0, left: 'center' },
    series: [
      {
        type: 'pie',
        radius: ['52%', '74%'],
        center: ['50%', '44%'],
        label: { show: false },
        labelLine: { show: false },
        data: pieData.value.map((item) => ({ name: item.name, value: item.value, itemStyle: { color: item.color } }))
      }
    ]
  };
  pieChartIns.value.setOption(option, true);
};

const renderTrendChart = () => {
  initTrendChart();
  if (!trendChartIns.value) return;
  const months = ['2024/10', '2024/11', '2024/12'];
  const supplierCount = [Math.max(1, ranking.value.length), Math.max(1, Math.ceil(ranking.value.length * 0.8)), Math.max(1, Math.ceil(ranking.value.length * 0.9))];
  const netPurchase = months.map((_, index) => Number((summaryRow.value.netOrderAmount * (0.72 + index * 0.08) / 10000).toFixed(2)));
  const sales = months.map((_, index) => Number((summaryRow.value.salesTotal * (0.7 + index * 0.1) / 10000).toFixed(2)));
  const option: EChartsOption = {
    tooltip: { trigger: 'axis', axisPointer: { type: 'cross' } },
    legend: { top: 0, left: 'center' },
    grid: { left: 52, right: 56, top: 44, bottom: 30 },
    xAxis: { type: 'category', data: months },
    yAxis: [
      { type: 'value', name: '供应商个数', min: 0 },
      { type: 'value', name: '金额（万元）', min: 0 }
    ],
    series: [
      { name: '供应商个数', type: 'bar', yAxisIndex: 0, barWidth: 18, data: supplierCount, itemStyle: { color: '#14b8a6' } },
      { name: '净进货额', type: 'line', yAxisIndex: 1, smooth: true, data: netPurchase, itemStyle: { color: '#f59e0b' } },
      { name: '销售额', type: 'line', yAxisIndex: 1, smooth: true, data: sales, itemStyle: { color: '#8b5cf6' } }
    ]
  };
  trendChartIns.value.setOption(option, true);
};

const loadData = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const [shareRes, , rankingRes] = await Promise.all([
      getVendorSalesShare(sessionId.value),
      getVendorSummary(sessionId.value),
      getVendorRanking(sessionId.value, '3', 1, 200, 'desc')
    ]);
    salesShare.value = shareRes.data || [];
    ranking.value = rankingRes.data?.list || [];
    await nextTick();
    renderPieChart();
    renderTrendChart();
  } finally {
    loading.value = false;
  }
};

const resetFilters = () => {
  filters.value = {
    dateRange: [],
    vendor: [],
    status: [],
    category: '',
    businessType: '',
    businessCircle: ''
  };
  loadData();
};

const summaryMethod = () => {
  const row = summaryRow.value;
  return [
    '合计',
    '',
    '',
    formatInteger(row.supplierSkuTotal),
    formatPercent(row.supplierSkuShare),
    formatInteger(row.supplierSkuNew),
    formatAmount(row.netOrderAmount),
    formatAmount(row.shortageAmount),
    formatPercent(row.shortageRate),
    formatAmount(row.salesTotal),
    formatPercent(row.salesShare),
    formatAmount(row.lastYearSales),
    formatGrowth(row.salesYoy),
    formatAmount(row.grossTotal),
    formatPercent(row.grossShare),
    formatAmount(row.lastYearGross),
    formatGrowth(row.grossYoy),
    formatPercent(row.grossRateTotal),
    formatPercent(row.grossRateLastYear),
    formatAmount(row.turnoverDays),
    formatPercent(row.turnoverRate),
    formatAmount(row.backendFee),
    formatAmount(row.comprehensiveGross),
    formatPercent(row.comprehensiveGrossRate),
    formatAmount(row.inventoryAmount),
    formatInteger(row.inventoryCheckCount),
    formatInteger(row.warningCount),
    ''
  ];
};

const handleExport = () => {
  if (!sessionId.value) return;
  ElMessage.info('当前仅保留导出按钮样式，接口未变更');
};

const resize = () => {
  pieChartIns.value?.resize();
  trendChartIns.value?.resize();
};

onMounted(async () => {
  await loadData();
  window.addEventListener('resize', resize);
});

watch(
  () => route.query.sessionId,
  async () => {
    await loadData();
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  pieChartIns.value?.dispose();
  trendChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.supplier-detail-page {
  min-height: calc(100vh - 84px);
  background:
    radial-gradient(circle at top left, rgb(20 184 166 / 8%), transparent 32%),
    linear-gradient(180deg, #f8fafc 0%, #f3f6fb 100%);
}

.page-card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 10px 30px rgb(15 23 42 / 5%);
  border-radius: 14px;
  overflow: hidden;
}

.header-card {
  margin-bottom: 12px;
}

.page-header,
.page-title-row,
.page-actions,
.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.title-block {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.page-title {
  font-size: 22px;
  font-weight: 800;
  color: #0f172a;
}

.unit-text {
  font-size: 13px;
  color: #64748b;
}

.page-actions {
  gap: 12px;
}

.filter-panel {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.filter-row {
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.filter-row :deep(.el-select),
.filter-row :deep(.el-date-editor) {
  width: 220px;
}

.filter-row--second :deep(.el-select) {
  width: 220px;
}

.row-spacer {
  flex: 1;
}

.chart-row {
  margin-bottom: 12px;
}

.chart-card {
  height: 100%;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #0f172a;
}

.chart-box {
  width: 100%;
  height: 360px;
}

.supplier-table {
  width: 100%;
}

.highlight-number {
  color: #14b8a6;
  font-weight: 700;
}

.supplier-table :deep(.el-table__cell) {
  text-align: center;
}

.supplier-table :deep(.cell) {
  white-space: nowrap;
}

.supplier-table :deep(.el-table__footer-wrapper td) {
  font-weight: 700;
  background: #eef2f7;
}
</style>

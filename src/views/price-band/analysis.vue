<template>
  <div class="p-2 price-band-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="page-title-line" />
          <span class="page-title">价格带分析</span>
        </div>
        <div class="page-actions">
          <el-button link type="primary" @click="handleViewDetail">详情</el-button>
          <span class="unit-text">金额单位：元</span>
          <el-button link type="primary" @click="settingVisible = true">价格区间设置</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="18" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="pageLoading">
          <template #header>
            <div class="card-header">
              <span class="card-title">价格带分布图</span>
            </div>
          </template>
          <div ref="chartRef" class="chart-box large-chart" />
        </el-card>
      </el-col>
      <el-col :lg="6" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card stat-card" v-loading="pageLoading">
          <template #header>
            <div class="card-header">
              <span class="card-title">统计概览</span>
            </div>
          </template>
          <div class="stat-list">
            <div class="stat-item">
              <div class="stat-label">价格带(PZ)区间范围</div>
              <div class="stat-value">{{ statisticsInfo.pzRanges }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">价格线(PL)总数</div>
              <div class="stat-value">{{ formatNumber(statisticsInfo.plTotal, 0) }}</div>
            </div>
            <div class="stat-item">
              <div class="stat-label">价格点(PP)明细</div>
              <div class="stat-value">{{ statisticsInfo.ppDetails }}</div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card" v-loading="pageLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">价格区间明细</span>
        </div>
      </template>

      <el-table :data="tableRows" border stripe class="price-table">
        <el-table-column label="价格区间" prop="priceRange" min-width="120" fixed="left" align="left" sortable show-overflow-tooltip />
        <el-table-column label="SKU数量" min-width="110" align="right" sortable :sort-method="sortNumber('skuCount')">
          <template #default="{ row }"><span :class="{ 'is-total': row.isTotal }">{{ formatNumber(row.skuCount, 0) }}</span></template>
        </el-table-column>
        <el-table-column label="SKU占比" min-width="110" align="right" sortable :sort-method="sortNumber('skuShare')">
          <template #default="{ row }"><span :class="{ 'is-total': row.isTotal }">{{ formatPercent(row.skuShare) }}</span></template>
        </el-table-column>
        <el-table-column label="销售量" min-width="110" align="right" sortable :sort-method="sortNumber('saleQty')">
          <template #default="{ row }"><span :class="{ 'is-total': row.isTotal }">{{ formatNumber(row.saleQty, 0) }}</span></template>
        </el-table-column>
        <el-table-column label="销售量占比" min-width="120" align="right" sortable :sort-method="sortNumber('saleQtyShare')">
          <template #default="{ row }"><span :class="{ 'is-total': row.isTotal }">{{ formatPercent(row.saleQtyShare) }}</span></template>
        </el-table-column>
        <el-table-column label="单品平均" min-width="110" align="right" sortable :sort-method="sortNumber('avgSaleQty')">
          <template #default="{ row }"><span :class="{ 'is-total': row.isTotal }">{{ formatNumber(row.avgSaleQty) }}</span></template>
        </el-table-column>
        <el-table-column label="销售额" min-width="130" align="right" sortable :sort-method="sortNumber('saleAmount')">
          <template #default="{ row }"><span :class="{ 'is-total': row.isTotal }">{{ formatAmount(row.saleAmount) }}</span></template>
        </el-table-column>
        <el-table-column label="销售额占比" min-width="120" align="right" sortable :sort-method="sortNumber('saleAmountShare')">
          <template #default="{ row }"><span :class="{ 'is-total': row.isTotal }">{{ formatPercent(row.saleAmountShare) }}</span></template>
        </el-table-column>
        <el-table-column label="促销SKU" min-width="110" align="right" sortable :sort-method="sortNumber('promotionSku')">
          <template #default="{ row }"><span :class="{ 'is-total': row.isTotal }">{{ formatNumber(row.promotionSku, 0) }}</span></template>
        </el-table-column>
        <el-table-column label="建议SKU" min-width="110" align="right" sortable :sort-method="sortNumber('suggestSku')">
          <template #default="{ row }"><span :class="{ 'is-total': row.isTotal }">{{ formatNumber(row.suggestSku, 0) }}</span></template>
        </el-table-column>
        <el-table-column label="建议SKU占比" min-width="120" align="right" sortable :sort-method="sortNumber('suggestSkuShare')">
          <template #default="{ row }"><span :class="{ 'is-total': row.isTotal }">{{ formatPercent(row.suggestSkuShare) }}</span></template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="hover" class="page-card advice-card">
      <template #header>
        <div class="advice-header">
          <span class="card-title">总结与建议</span>
        </div>
      </template>
      <ul class="advice-list">
        <li><strong>价格点偏好建议：</strong> 10-29.9 元价格带是当前用户偏好最明显的成交区间，建议优先保障核心价格点不断货并提升主推权重。</li>
        <li><strong>区间铺货建议：</strong> 对高销量高销售额但 SKU 覆盖不足的中价位带，可适度补充相邻价格点商品，完善区间梯度。</li>
        <li><strong>SKU优化建议：</strong> 对高价带和低价带中销售贡献较低且 SKU 占比偏高的区间，建议压缩冗余 SKU，优化结构效率。</li>
        <li><strong>陈列调整建议：</strong> 陈列资源建议向核心价格带倾斜，系统建议 SKU 配置可作为门店优化和品项调整的参考依据。</li>
      </ul>
    </el-card>

    <el-dialog v-model="settingVisible" title="价格区间设置" width="760px" destroy-on-close>
      <el-form :model="generatorForm" inline class="generator-form">
        <el-form-item label="起始价格">
          <el-input-number v-model="generatorForm.startPrice" :min="0" :precision="2" :step="1" controls-position="right" />
        </el-form-item>
        <el-form-item label="结束价格">
          <el-input-number v-model="generatorForm.endPrice" :min="0" :precision="2" :step="1" controls-position="right" />
        </el-form-item>
        <el-form-item label="步长">
          <el-input-number v-model="generatorForm.step" :min="0.01" :precision="2" :step="1" controls-position="right" />
        </el-form-item>
        <el-form-item>
          <el-button type="primary" @click="handleGenerateRanges">生成区间</el-button>
        </el-form-item>
      </el-form>

      <el-table :data="rangeList" border stripe class="range-table">
        <el-table-column label="区间开始值(不包含)" min-width="220" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.start" :min="0" :precision="2" :step="1" controls-position="right" class="range-input" />
          </template>
        </el-table-column>
        <el-table-column label="区间结束值(包含)" min-width="220" align="center">
          <template #default="{ row }">
            <el-input-number v-model="row.end" :min="0" :precision="2" :step="1" controls-position="right" class="range-input" />
          </template>
        </el-table-column>
        <el-table-column label="操作" width="120" align="center">
          <template #default="{ $index }">
            <el-button link type="danger" @click="handleDeleteRange($index)">删除</el-button>
          </template>
        </el-table-column>
      </el-table>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="handleAddRange">+新增区间</el-button>
          <div class="dialog-footer-right">
            <el-button @click="settingVisible = false">取消</el-button>
            <el-button type="primary" @click="handleSaveSetting">确定</el-button>
          </div>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="PriceBandAnalysis" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface PriceBandRow {
  priceRange: string;
  skuCount: number;
  skuShare: number;
  saleQty: number;
  saleQtyShare: number;
  avgSaleQty: number;
  saleAmount: number;
  saleAmountShare: number;
  promotionSku: number;
  suggestSku: number;
  suggestSkuShare: number;
  isTotal?: boolean;
}

interface PriceRangeItem {
  start: number;
  end: number;
}

const router = useRouter();
const route = useRoute();

const chartRef = ref<HTMLDivElement>();
const chartIns = ref<echarts.ECharts>();
const settingVisible = ref(false);
const pageLoading = ref(false);
const tableRows = ref<PriceBandRow[]>([]);
const rangeList = ref<PriceRangeItem[]>([
  { start: 0, end: 9.9 },
  { start: 10, end: 19.9 },
  { start: 20, end: 29.9 },
  { start: 30, end: 39.9 },
  { start: 40, end: 59.9 }
]);

const generatorForm = reactive({
  startPrice: 0,
  endPrice: 49.9,
  step: 10
});

const statisticsInfo = reactive({
  pzRanges: '',
  plTotal: 0,
  ppDetails: ''
});

const chartSource = reactive({
  xAxisData: [] as string[],
  skuLineData: [] as number[],
  saleAmountLineData: [] as number[],
  saleQtyLineData: [] as number[],
  priceLineSkuBarData: [] as number[],
  priceLineSaleAmountBarData: [] as number[]
});

const buildMockRows = (): PriceBandRow[] => {
  const presets = [
    { skuCount: 26, saleQty: 2180, avgSaleQty: 83.85, saleAmount: 28600, promotionSku: 6, suggestSku: 8 },
    { skuCount: 54, saleQty: 6350, avgSaleQty: 117.59, saleAmount: 125800, promotionSku: 10, suggestSku: 15 },
    { skuCount: 42, saleQty: 4830, avgSaleQty: 115.0, saleAmount: 102600, promotionSku: 8, suggestSku: 12 },
    { skuCount: 23, saleQty: 2610, avgSaleQty: 113.48, saleAmount: 64820, promotionSku: 4, suggestSku: 7 },
    { skuCount: 12, saleQty: 840, avgSaleQty: 70.0, saleAmount: 34160, promotionSku: 2, suggestSku: 4 },
    { skuCount: 8, saleQty: 420, avgSaleQty: 52.5, saleAmount: 18880, promotionSku: 1, suggestSku: 2 }
  ];

  const rows = rangeList.value.map((item, index) => {
    const preset = presets[index] || presets[presets.length - 1];
    return {
      priceRange: formatRangeLabel(item),
      skuCount: preset.skuCount,
      skuShare: 0,
      saleQty: preset.saleQty,
      saleQtyShare: 0,
      avgSaleQty: preset.avgSaleQty,
      saleAmount: preset.saleAmount,
      saleAmountShare: 0,
      promotionSku: preset.promotionSku,
      suggestSku: preset.suggestSku,
      suggestSkuShare: 0
    };
  });

  const totalSku = rows.reduce((sum, item) => sum + item.skuCount, 0);
  const totalSaleQty = rows.reduce((sum, item) => sum + item.saleQty, 0);
  const totalSaleAmount = rows.reduce((sum, item) => sum + item.saleAmount, 0);
  const totalPromotionSku = rows.reduce((sum, item) => sum + item.promotionSku, 0);
  const totalSuggestSku = rows.reduce((sum, item) => sum + item.suggestSku, 0);

  rows.forEach((item) => {
    item.skuShare = totalSku ? (item.skuCount / totalSku) * 100 : 0;
    item.saleQtyShare = totalSaleQty ? (item.saleQty / totalSaleQty) * 100 : 0;
    item.saleAmountShare = totalSaleAmount ? (item.saleAmount / totalSaleAmount) * 100 : 0;
    item.suggestSkuShare = totalSuggestSku ? (item.suggestSku / totalSuggestSku) * 100 : 0;
  });

  rows.push({
    priceRange: '总计',
    skuCount: totalSku,
    skuShare: 100,
    saleQty: totalSaleQty,
    saleQtyShare: 100,
    avgSaleQty: totalSku ? totalSaleQty / totalSku : 0,
    saleAmount: totalSaleAmount,
    saleAmountShare: 100,
    promotionSku: totalPromotionSku,
    suggestSku: totalSuggestSku,
    suggestSkuShare: 100,
    isTotal: true
  });

  return rows;
};

const syncStatistics = () => {
  statisticsInfo.pzRanges = rangeList.value.map((item) => formatRangeLabel(item)).join(' / ');
  statisticsInfo.plTotal = rangeList.value.length * 3 + 3;
  statisticsInfo.ppDetails = rangeList.value
    .map((item) => Number(item.end).toFixed(1).replace(/\.0$/, ''))
    .slice(0, 6)
    .join('、');
};

const syncChartSource = (rows: PriceBandRow[]) => {
  const effectiveRows = rows.filter((item) => !item.isTotal);
  chartSource.xAxisData = effectiveRows.map((item) => item.priceRange);
  chartSource.skuLineData = effectiveRows.map((item) => item.skuCount);
  chartSource.saleAmountLineData = effectiveRows.map((item) => item.saleAmount);
  chartSource.saleQtyLineData = effectiveRows.map((item) => item.saleQty);
  chartSource.priceLineSkuBarData = effectiveRows.map((item) => Math.max(1, Math.round(item.promotionSku)));
  chartSource.priceLineSaleAmountBarData = effectiveRows.map((item) => Math.round(item.saleAmount * 0.18));
};

const initChart = () => {
  if (!chartRef.value) return;
  if (!chartIns.value) {
    chartIns.value = echarts.init(chartRef.value);
  }
};

const renderChart = () => {
  initChart();
  if (!chartIns.value) return;

  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      axisPointer: { type: 'cross' }
    },
    legend: {
      top: 6,
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      textStyle: { color: '#606266', fontSize: 13 },
      data: ['SKU数', '销售额', '销售量', '价格线SKU数', '价格线销售额']
    },
    grid: {
      left: 56,
      right: 56,
      top: 48,
      bottom: 32
    },
    xAxis: {
      type: 'category',
      data: chartSource.xAxisData,
      axisLine: { lineStyle: { color: '#dcdfe6' } },
      axisLabel: { color: '#606266' }
    },
    yAxis: [
      {
        type: 'value',
        name: '销售额',
        axisLine: { show: false },
        axisLabel: { color: '#606266' },
        splitLine: { lineStyle: { color: '#ebeef5' } }
      },
      {
        type: 'value',
        name: 'SKU数量',
        axisLine: { show: false },
        axisLabel: { color: '#606266' },
        splitLine: { show: false }
      }
    ],
    series: [
      { name: 'SKU数', type: 'line', smooth: true, yAxisIndex: 1, data: chartSource.skuLineData, itemStyle: { color: '#f59e0b' }, lineStyle: { color: '#f59e0b', width: 2 } },
      { name: '销售额', type: 'line', smooth: true, data: chartSource.saleAmountLineData, itemStyle: { color: '#3b82f6' }, lineStyle: { color: '#3b82f6', width: 2 } },
      { name: '销售量', type: 'line', smooth: true, yAxisIndex: 1, data: chartSource.saleQtyLineData, itemStyle: { color: '#14b8a6' }, lineStyle: { color: '#14b8a6', width: 2 } },
      { name: '价格线SKU数', type: 'bar', barWidth: 10, yAxisIndex: 1, data: chartSource.priceLineSkuBarData, itemStyle: { color: '#e53e3e', borderRadius: [4, 4, 0, 0] } },
      { name: '价格线销售额', type: 'bar', barWidth: 10, data: chartSource.priceLineSaleAmountBarData, itemStyle: { color: '#60a5fa', borderRadius: [4, 4, 0, 0] } }
    ]
  };

  chartIns.value.setOption(option, true);
};

const loadPriceBandData = async () => {
  pageLoading.value = true;
  try {
    // TODO: replace with real backend request for price band analysis.
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    const rows = buildMockRows();
    tableRows.value = rows;
    syncStatistics();
    syncChartSource(rows);
    await nextTick();
    renderChart();
  } finally {
    pageLoading.value = false;
  }
};

const formatRangeLabel = (item: PriceRangeItem) => `${formatRangeNumber(item.start)}-${formatRangeNumber(item.end)}`;

const formatRangeNumber = (value: number) => Number(value).toFixed(1).replace(/\.0$/, '');

const validateRangeList = () => {
  if (!rangeList.value.length) {
    ElMessage.warning('请至少保留一个价格区间');
    return false;
  }
  const sorted = [...rangeList.value].sort((a, b) => a.start - b.start);
  const invalid = sorted.some((item) => item.end <= item.start || item.start < 0);
  if (invalid) {
    ElMessage.warning('价格区间设置不合法，请检查开始值和结束值');
    return false;
  }
  return true;
};

const handleGenerateRanges = () => {
  const { startPrice, endPrice, step } = generatorForm;
  if (endPrice <= startPrice || step <= 0) {
    ElMessage.warning('请检查起始价格、结束价格和步长');
    return;
  }
  const ranges: PriceRangeItem[] = [];
  let currentStart = startPrice;
  while (currentStart < endPrice) {
    const currentEnd = Math.min(currentStart + step - 0.1, endPrice);
    ranges.push({
      start: Number(currentStart.toFixed(2)),
      end: Number(currentEnd.toFixed(2))
    });
    currentStart = Number((currentStart + step).toFixed(2));
  }
  rangeList.value = ranges;
};

const handleAddRange = () => {
  const lastItem = rangeList.value[rangeList.value.length - 1];
  const nextStart = lastItem ? Number((lastItem.end + 0.1).toFixed(2)) : 0;
  rangeList.value.push({
    start: nextStart,
    end: Number((nextStart + 9.9).toFixed(2))
  });
};

const handleDeleteRange = (index: number) => {
  if (rangeList.value.length === 1) {
    ElMessage.warning('请至少保留一个价格区间');
    return;
  }
  rangeList.value.splice(index, 1);
};

const handleSaveSetting = async () => {
  if (!validateRangeList()) return;
  settingVisible.value = false;
  ElMessage.success('价格区间设置已保存');
  await loadPriceBandData();
};

const handleViewDetail = () => {
  router.push({
    path: '/price-band/analysis/detail',
    query: {
      ...route.query,
      ranges: JSON.stringify(rangeList.value)
    }
  });
};

const sortNumber = (field: keyof PriceBandRow) => (a: PriceBandRow, b: PriceBandRow) => Number(a[field] || 0) - Number(b[field] || 0);

const formatNumber = (value: number | string | null | undefined, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
};

const formatAmount = (value: number | string | null | undefined) => formatNumber(value);

const formatPercent = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${num.toFixed(2)}%`;
};

const resizeChart = () => chartIns.value?.resize();

onMounted(async () => {
  await loadPriceBandData();
  window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  chartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.price-band-analysis-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.header-card,
.chart-row,
.table-card {
  margin-bottom: 12px;
}

.page-header,
.page-title-wrap,
.page-actions,
.card-header,
.advice-header,
.dialog-footer,
.dialog-footer-right {
  display: flex;
  align-items: center;
}

.page-header,
.card-header,
.advice-header,
.dialog-footer {
  justify-content: space-between;
  gap: 12px;
}

.page-title-wrap {
  gap: 8px;
}

.page-title-line {
  width: 3px;
  height: 16px;
  border-radius: 999px;
  background: var(--el-color-primary);
}

.page-title {
  font-size: 20px;
  font-weight: 700;
  color: var(--el-text-color-primary);
  line-height: 1;
}

.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.page-actions,
.dialog-footer-right {
  gap: 12px;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.chart-box {
  width: 100%;
}

.large-chart {
  height: 360px;
}

.stat-list {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.stat-item {
  padding: 14px 12px;
  border-radius: 8px;
  background: #f8fafc;
}

.stat-label {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.stat-value {
  margin-top: 8px;
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  line-height: 1.7;
  word-break: break-word;
}

.price-table :deep(.el-table__header th),
.range-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.is-total {
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.advice-list {
  margin: 0;
  padding-left: 18px;
  color: var(--el-text-color-regular);
  line-height: 1.8;
}

.advice-list li + li {
  margin-top: 10px;
}

.generator-form {
  margin-bottom: 16px;
}

.range-input {
  width: 180px;
}

@media (max-width: 992px) {
  .page-header,
  .dialog-footer {
    flex-direction: column;
    align-items: flex-start;
  }

  .page-actions,
  .dialog-footer-right {
    width: 100%;
    justify-content: space-between;
  }
}
</style>

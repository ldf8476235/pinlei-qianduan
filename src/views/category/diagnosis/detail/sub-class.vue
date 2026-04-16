<template>
  <div class="p-2 category-diagnosis-sub-class-page">
    <el-card shadow="hover" class="header-card">
      <div class="page-header">
        <div class="page-title">子类贡献</div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button link type="success" class="export-button" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="chart-card" v-loading="pieRequest.loading.value">
          <template #header>
            <div class="card-title">本期销售占比</div>
          </template>
          <div ref="pieChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="chart-card" v-loading="trendRequest.loading.value">
          <template #header>
            <div class="card-title">本期销售趋势</div>
          </template>
          <div ref="trendChartRef" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="table-card" v-loading="tableRequest.loading.value">
      <el-table :data="tableRows" border stripe row-key="categoryKey" class="sub-class-table">
        <el-table-column label="品类" fixed="left" min-width="180">
          <template #default="{ row }">
            <div class="category-cell">
              <span class="category-code">{{ row.classNo }}</span>
              <span class="category-name">{{ row.className }}</span>
            </div>
          </template>
        </el-table-column>

        <el-table-column label="本期" align="center">
          <el-table-column label="销售额" min-width="110" align="right">
            <template #default="{ row }">{{ formatAmount(row.salesAmount) }}</template>
          </el-table-column>
          <el-table-column label="占比" min-width="170" align="center">
            <template #default="{ row }">
              <div class="ratio-cell">
                <span class="ratio-text">{{ formatPercent(row.salesShare) }}</span>
                <el-progress :percentage="safePercent(row.salesShare)" :show-text="false" :stroke-width="8" color="#20b2aa" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="毛利额" min-width="110" align="right">
            <template #default="{ row }">{{ formatAmount(row.grossAmount) }}</template>
          </el-table-column>
          <el-table-column label="占比" min-width="170" align="center">
            <template #default="{ row }">
              <div class="ratio-cell">
                <span class="ratio-text">{{ formatPercent(row.grossShare) }}</span>
                <el-progress :percentage="safePercent(row.grossShare)" :show-text="false" :stroke-width="8" color="#20b2aa" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="毛利率" min-width="90" align="right">
            <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
          </el-table-column>
          <el-table-column label="客数" min-width="90" align="right">
            <template #default="{ row }">{{ formatInteger(row.customerCount) }}</template>
          </el-table-column>
          <el-table-column label="客单价" min-width="100" align="right">
            <template #default="{ row }">{{ formatAmount(row.customerPrice) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="对比日期" align="center">
          <el-table-column label="销售额" min-width="110" align="right">
            <template #default="{ row }">{{ formatAmount(row.compareSalesAmount) }}</template>
          </el-table-column>
          <el-table-column label="占比" min-width="170" align="center">
            <template #default="{ row }">
              <div class="ratio-cell">
                <span class="ratio-text">{{ formatPercent(row.compareSalesShare) }}</span>
                <el-progress :percentage="safePercent(row.compareSalesShare)" :show-text="false" :stroke-width="8" color="#20b2aa" />
              </div>
            </template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="100" align="center">
            <template #default="{ row }">
              <span :class="growthClass(row.salesGrowthRate)">{{ formatGrowth(row.salesGrowthRate) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="毛利额" min-width="110" align="right">
            <template #default="{ row }">{{ formatAmount(row.compareGrossAmount) }}</template>
          </el-table-column>
          <el-table-column label="毛利率" min-width="90" align="right">
            <template #default="{ row }">{{ formatPercent(row.compareGrossRate) }}</template>
          </el-table-column>
          <el-table-column label="客数" min-width="90" align="right">
            <template #default="{ row }">{{ formatInteger(row.compareCustomerCount) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="100" align="center">
            <template #default="{ row }">
              <span :class="growthClass(row.customerCountGrowthRate)">{{ formatGrowth(row.customerCountGrowthRate) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="客单价" min-width="100" align="right">
            <template #default="{ row }">{{ formatAmount(row.compareCustomerPrice) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" min-width="100" align="center">
            <template #default="{ row }">
              <span :class="growthClass(row.customerPriceGrowthRate)">{{ formatGrowth(row.customerPriceGrowthRate) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="库存周转率" min-width="110" align="right">
            <template #default="{ row }">{{ formatDecimal(row.turnoverRate) }}</template>
          </el-table-column>
          <el-table-column label="库存周转天数" min-width="120" align="right">
            <template #default="{ row }">{{ formatDecimal(row.turnoverDays) }}</template>
          </el-table-column>
          <el-table-column label="GMROI" min-width="100" align="right">
            <template #default="{ row }">{{ formatDecimal(row.gmroi) }}</template>
          </el-table-column>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="CategoryDiagnosisSubClassDetail" lang="ts">
import * as echarts from 'echarts';
import { download } from '@/utils/request';
import { useRequest } from '@/hooks/useRequest';
import {
  getCategoryDiagnosisSubClassPie,
  getCategoryDiagnosisSubClassTable,
  getCategoryDiagnosisSubClassTrend
} from '@/api/category/diagnosis/detail';
import type {
  DiagnosisSubClassPieItem,
  DiagnosisSubClassQuery,
  DiagnosisSubClassTableResponse,
  DiagnosisSubClassTableRow,
  DiagnosisSubClassTrendResponse,
  DiagnosisSubClassTrendSeriesItem
} from '@/api/category/diagnosis/detail/types';

interface SubClassTableViewRow extends DiagnosisSubClassTableRow {
  categoryKey: string;
}

const route = useRoute();

const pieChartRef = ref<HTMLDivElement>();
const trendChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const trendChartIns = ref<echarts.ECharts>();

const pieData = ref<DiagnosisSubClassPieItem[]>([]);
const trendData = ref<DiagnosisSubClassTrendResponse>({
  dates: [],
  unit: '元',
  series: []
});
const tableRows = ref<SubClassTableViewRow[]>([]);

const colorPalette = ['#20b2aa', '#f59e0b', '#8b5cf6', '#3b82f6', '#ef4444', '#14b8a6'];

const query = computed<DiagnosisSubClassQuery>(() => ({
  sessionId: (route.query.sessionId as string) || '',
  categoryId: route.query.categoryId as string,
  categoryName: (route.query.categoryName as string) || '',
  storeNo: (route.query.storeNo as string) || '',
  startDate: (route.query.startDate as string) || '',
  endDate: (route.query.endDate as string) || '',
  compareStartDate: (route.query.compareStartDate as string) || '',
  compareEndDate: (route.query.compareEndDate as string) || ''
}));

const sessionId = computed(() => query.value.sessionId || '');

const toNumber = (value: unknown, digits?: number) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return 0;
  if (typeof digits === 'number') {
    return Number(num.toFixed(digits));
  }
  return num;
};

const normalizePercent = (value: unknown) => {
  const num = toNumber(value, 4);
  if (Math.abs(num) <= 1) {
    return Number((num * 100).toFixed(2));
  }
  return Number(num.toFixed(2));
};

const extractArrayPayload = (raw: any): any[] => {
  if (Array.isArray(raw)) return raw;
  const queue: any[] = [raw];
  while (queue.length) {
    const current = queue.shift();
    if (Array.isArray(current)) return current;
    if (current && typeof current === 'object') {
      Object.keys(current).forEach((key) => {
        const value = current[key];
        if (value != null) {
          queue.push(value);
        }
      });
    }
  }
  return [];
};

const normalizePieData = (payload: any): DiagnosisSubClassPieItem[] => {
  return extractArrayPayload(payload)
    .map((item: any) => ({
      classNo: String(item.classNo || item.subClassNo || item.categoryCode || item.code || ''),
      className: String(item.className || item.subClassName || item.categoryName || item.name || ''),
      salesAmount: toNumber(item.salesAmount ?? item.currentSales ?? item.value ?? 0, 2),
      salesShare: normalizePercent(item.salesShare ?? item.share ?? item.ratio ?? item.proportion ?? 0)
    }))
    .filter((item) => item.classNo || item.className);
};

const normalizeTrendData = (payload: any): DiagnosisSubClassTrendResponse => {
  const source = payload && typeof payload === 'object' ? payload : {};
  const dates = extractArrayPayload(source.dates || source.xAxis || source.labels || []).map((item) => String(item || ''));
  const rawSeries = extractArrayPayload(source.series || source.rows || source.items || []);
  const series = rawSeries
    .map((item: any, index: number) => ({
      classNo: String(item.classNo || item.subClassNo || item.categoryCode || item.code || ''),
      className: String(item.className || item.subClassName || item.categoryName || item.name || `系列${index + 1}`),
      color: String(item.color || colorPalette[index % colorPalette.length]),
      values: extractArrayPayload(item.values || item.data || []).map((value) => toNumber(value, 2))
    }))
    .filter((item) => item.values.length);

  return {
    dates,
    unit: String(source.unit || '元'),
    series
  };
};

const normalizeTableRows = (payload: any): SubClassTableViewRow[] => {
  const source = payload && typeof payload === 'object' ? payload : {};
  const rows = extractArrayPayload(source.rows || source.list || source.items || payload);
  return rows.map((item: any, index: number) => {
    const classNo = String(item.classNo || item.subClassNo || item.categoryCode || item.code || '');
    const className = String(item.className || item.subClassName || item.categoryName || item.name || '');
    return {
      categoryKey: `${classNo || 'sub-class'}-${index}`,
      classNo,
      className,
      salesAmount: toNumber(item.salesAmount ?? item.currentSales ?? 0, 2),
      salesShare: normalizePercent(item.salesShare ?? item.currentSalesShare ?? item.salesRatio ?? 0),
      grossAmount: toNumber(item.grossAmount ?? item.currentGross ?? 0, 2),
      grossShare: normalizePercent(item.grossShare ?? item.currentGrossShare ?? item.grossRatio ?? 0),
      grossRate: normalizePercent(item.grossRate ?? item.currentGrossRate ?? 0),
      customerCount: toNumber(item.customerCount ?? item.currentCustomerCount ?? 0),
      customerPrice: toNumber(item.customerPrice ?? item.currentCustomerPrice ?? 0, 2),
      compareSalesAmount: toNumber(item.compareSalesAmount ?? item.compareSales ?? 0, 2),
      compareSalesShare: normalizePercent(item.compareSalesShare ?? item.compareSalesRatio ?? 0),
      salesGrowthRate: normalizePercent(item.salesGrowthRate ?? item.comparativeSales ?? item.compareSalesGrowthRate ?? 0),
      compareGrossAmount: toNumber(item.compareGrossAmount ?? item.compareGross ?? 0, 2),
      compareGrossRate: normalizePercent(item.compareGrossRate ?? 0),
      compareCustomerCount: toNumber(item.compareCustomerCount ?? 0),
      customerCountGrowthRate: normalizePercent(item.customerCountGrowthRate ?? item.comparativeCustomerCount ?? 0),
      compareCustomerPrice: toNumber(item.compareCustomerPrice ?? 0, 2),
      customerPriceGrowthRate: normalizePercent(item.customerPriceGrowthRate ?? item.comparativeCustomerPrice ?? 0),
      turnoverRate: toNumber(item.turnoverRate ?? item.inventoryTurnoverRate ?? 0, 2),
      turnoverDays: toNumber(item.turnoverDays ?? item.inventoryTurnoverDays ?? 0, 2),
      gmroi: toNumber(item.gmroi ?? item.GMROI ?? 0, 2)
    };
  });
};

const pieRequest = useRequest(async (id: string) => await getCategoryDiagnosisSubClassPie(id), {
  onSuccess: async (res) => {
    pieData.value = normalizePieData(res?.data);
    await nextTick();
    renderPieChart();
  }
});

const trendRequest = useRequest(async (id: string) => await getCategoryDiagnosisSubClassTrend(id), {
  onSuccess: async (res) => {
    trendData.value = normalizeTrendData(res?.data);
    await nextTick();
    renderTrendChart();
  }
});

const tableRequest = useRequest(async (id: string) => await getCategoryDiagnosisSubClassTable(id), {
  onSuccess: (res) => {
    tableRows.value = normalizeTableRows((res?.data || {}) as DiagnosisSubClassTableResponse);
  }
});

const initPieChart = () => {
  if (!pieChartRef.value) return;
  if (!pieChartIns.value) {
    pieChartIns.value = echarts.init(pieChartRef.value);
  }
};

const initTrendChart = () => {
  if (!trendChartRef.value) return;
  if (!trendChartIns.value) {
    trendChartIns.value = echarts.init(trendChartRef.value);
  }
};

const renderPieChart = () => {
  initPieChart();
  if (!pieChartIns.value) return;

  const seriesData = pieData.value.map((item, index) => ({
    name: `${item.classNo} ${item.className}`.trim(),
    value: item.salesAmount,
    itemStyle: {
      color: colorPalette[index % colorPalette.length]
    }
  }));

  pieChartIns.value.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => `${params.name}<br/>销售额：${formatAmount(params.value)}<br/>占比：${params.percent || 0}%`
    },
    legend: {
      orient: 'vertical',
      right: 10,
      top: 'center',
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#374151',
        fontSize: 13
      }
    },
    series: [
      {
        type: 'pie',
        radius: ['50%', '68%'],
        center: ['35%', '50%'],
        avoidLabelOverlap: false,
        label: {
          show: false
        },
        emphasis: {
          scale: true,
          scaleSize: 6
        },
        labelLine: {
          show: false
        },
        data: seriesData
      }
    ]
  });
};

const renderTrendChart = () => {
  initTrendChart();
  if (!trendChartIns.value) return;

  trendChartIns.value.setOption({
    tooltip: {
      trigger: 'axis',
      axisPointer: {
        type: 'shadow'
      },
      valueFormatter: (value: number) => `${formatAmount(value)}`
    },
    legend: {
      top: 8,
      itemWidth: 10,
      itemHeight: 10,
      textStyle: {
        color: '#374151',
        fontSize: 13
      }
    },
    grid: {
      left: 52,
      right: 24,
      top: 48,
      bottom: 36
    },
    xAxis: {
      type: 'category',
      data: trendData.value.dates,
      axisTick: {
        alignWithLabel: true
      },
      axisLine: {
        lineStyle: {
          color: '#d1d5db'
        }
      },
      axisLabel: {
        color: '#6b7280',
        fontSize: 12,
        rotate: trendData.value.dates.length > 8 ? 35 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: trendData.value.unit || '元',
      nameTextStyle: {
        color: '#6b7280'
      },
      splitLine: {
        lineStyle: {
          color: '#eef2f7'
        }
      },
      axisLabel: {
        color: '#6b7280',
        formatter: (value: number) => formatAmount(value, 0)
      }
    },
    series: trendData.value.series.map((item: DiagnosisSubClassTrendSeriesItem, index: number) => ({
      name: `${item.classNo} ${item.className}`.trim(),
      type: 'bar',
      stack: 'sales',
      barMaxWidth: 26,
      itemStyle: {
        color: item.color || colorPalette[index % colorPalette.length],
        borderRadius: [4, 4, 0, 0]
      },
      data: item.values
    }))
  });
};

const loadPageData = async () => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法加载子类贡献详情');
    return;
  }
  await Promise.all([pieRequest.run(sessionId.value), trendRequest.run(sessionId.value), tableRequest.run(sessionId.value)]);
};

const handleExport = () => {
  if (!sessionId.value) {
    ElMessage.warning('缺少 sessionId，无法导出');
    return;
  }
  download('/api/v1/diagnosis/subClass/export', { sessionId: sessionId.value }, `子类贡献_${sessionId.value}.xlsx`);
};

const formatAmount = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
};

const formatInteger = (value: unknown) => formatAmount(value, 0);

const formatDecimal = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatPercent = (value: unknown) => `${toNumber(value, 2).toFixed(2)}%`;

const formatGrowth = (value: unknown) => {
  const num = toNumber(value, 2);
  const prefix = num > 0 ? '+' : '';
  return `${prefix}${num.toFixed(2)}%`;
};

const safePercent = (value: unknown) => {
  const num = toNumber(value, 2);
  return Math.max(0, Math.min(100, num));
};

const growthClass = (value: unknown) => {
  const num = Number(value ?? 0);
  if (num > 0) return 'growth-text is-up';
  if (num < 0) return 'growth-text is-down';
  return 'growth-text is-flat';
};

const resizeCharts = () => {
  pieChartIns.value?.resize();
  trendChartIns.value?.resize();
};

watch(
  () => route.query.sessionId,
  async () => {
    await loadPageData();
  }
);

onMounted(async () => {
  await loadPageData();
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  pieChartIns.value?.dispose();
  trendChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.category-diagnosis-sub-class-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.header-card,
.chart-card,
.table-card {
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.header-card {
  margin-bottom: 12px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
}

.page-title {
  font-size: 22px;
  font-weight: 700;
  color: #111827;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 14px;
}

.unit-text {
  font-size: 14px;
  color: #4b5563;
}

.export-button {
  color: #20b2aa;
  font-size: 14px;
  padding: 0;
}

.chart-row {
  margin-bottom: 12px;
}

.card-title {
  font-size: 16px;
  font-weight: 700;
  color: #111827;
}

.chart-box {
  width: 100%;
  height: 360px;
}

.category-cell {
  display: flex;
  align-items: center;
  gap: 6px;
  line-height: 1.5;
}

.category-code {
  color: #111827;
  font-weight: 700;
}

.category-name {
  color: #374151;
}

.ratio-cell {
  display: flex;
  align-items: center;
  gap: 10px;
}

.ratio-text {
  width: 52px;
  color: #374151;
  text-align: right;
  font-variant-numeric: tabular-nums;
}

.growth-text {
  font-weight: 600;
}

.growth-text.is-up {
  color: #16a34a;
}

.growth-text.is-down {
  color: #dc2626;
}

.growth-text.is-flat {
  color: #6b7280;
}

.sub-class-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: #374151;
  font-weight: 700;
}

.sub-class-table :deep(.el-table__body td) {
  color: #1f2937;
}

.sub-class-table :deep(.cell) {
  font-size: 13px;
}

.sub-class-table :deep(.el-progress-bar__outer) {
  background: #e6f6f5;
}

.sub-class-table :deep(.el-table__empty-block) {
  min-height: 220px;
}

@media (max-width: 992px) {
  .page-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .page-actions {
    width: 100%;
    justify-content: space-between;
  }

  .chart-box {
    height: 320px;
  }

  .ratio-cell {
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
  }

  .ratio-text {
    width: auto;
    text-align: left;
  }
}
</style>

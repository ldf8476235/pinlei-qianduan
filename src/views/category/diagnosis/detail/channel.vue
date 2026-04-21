<template>
  <div class="p-2 category-diagnosis-channel-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">销售渠道业绩</span>
          </div>
          <el-tag effect="plain" type="success" class="role-tag">本期角色：结构品类</el-tag>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button link type="primary" class="export-button" @click="handleExport">导出</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="pieRequest.loading.value">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期销售占比</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-box" />
        </el-card>
      </el-col>
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="trendRequest.loading.value">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期销售趋势</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-box" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card" v-loading="tableRequest.loading.value">
      <template #header>
        <div class="card-header">
          <span class="card-title">明细数据</span>
        </div>
      </template>

      <el-table :data="tableRows" border stripe row-key="channelKey" class="channel-table">
        <el-table-column label="销售渠道" fixed="left" min-width="180" align="left">
          <template #default="{ row }">
            <div class="channel-cell">
              <span class="channel-name">{{ row.channelName || '-' }}</span>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="本期-销售额" min-width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.currentSales) }}</template>
        </el-table-column>
        <el-table-column label="本期-占比" min-width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.currentSalesPer) }}</template>
        </el-table-column>
        <el-table-column label="本期-毛利额" min-width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.currentGross) }}</template>
        </el-table-column>
        <el-table-column label="本期-毛利额占比" min-width="140" align="right">
          <template #default="{ row }">{{ formatPercent(row.currentGrossPer) }}</template>
        </el-table-column>
        <el-table-column label="本期-毛利率" min-width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.currentGrossRate) }}</template>
        </el-table-column>
        <el-table-column label="本期-客数" min-width="110" align="right">
          <template #default="{ row }">{{ formatInteger(row.currentCustomerCount) }}</template>
        </el-table-column>
        <el-table-column label="本期-客单价" min-width="120" align="right">
          <template #default="{ row }">{{ formatAmount(row.currentCustomerPrice) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-销售额" min-width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.compareSales) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-占比" min-width="130" align="right">
          <template #default="{ row }">{{ formatPercent(row.compareSalesPer) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-销售增长" min-width="140" align="right">
          <template #default="{ row }">
            <span :class="growthClass(row.compareSalesInc)">{{ formatGrowth(row.compareSalesInc) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="对比日期-毛利额" min-width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.compareGross) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-毛利额占比" min-width="150" align="right">
          <template #default="{ row }">{{ formatPercent(row.compareGrossPer) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-毛利增长" min-width="170" align="right">
          <template #default="{ row }">
            <span :class="growthClass(row.compareGrossInc)">{{ formatGrowth(row.compareGrossInc) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="对比日期-毛利率" min-width="130" align="right">
          <template #default="{ row }">{{ formatPercent(row.compareGrossRate) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-客数" min-width="120" align="right">
          <template #default="{ row }">{{ formatInteger(row.compareCustomerCount) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-客数增长" min-width="170" align="right">
          <template #default="{ row }">
            <span :class="growthClass(row.compareCustomerCountInc)">{{ formatGrowth(row.compareCustomerCountInc) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="对比日期-客单价" min-width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.compareCustomerPrice) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-客单价增长" min-width="180" align="right">
          <template #default="{ row }">
            <span :class="growthClass(row.compareCustomerPriceInc)">{{ formatGrowth(row.compareCustomerPriceInc) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="CategoryDiagnosisChannelDetail" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { useRequest } from '@/hooks/useRequest';
import {
  getCategoryDiagnosisChannelPie,
  getCategoryDiagnosisChannelTable,
  getCategoryDiagnosisChannelTrend
} from '@/api/category/diagnosis/detail';
import type {
  ChannelSalesDetailsItemResponse,
  ChannelSalesDetailsResponse,
  ChannelSalesPieItemResponse,
  ChannelSalesTrendResponse,
  DiagnosisSubClassQuery
} from '@/api/category/diagnosis/detail/types';

interface ChannelTableViewRow extends ChannelSalesDetailsItemResponse {
  channelKey: string;
}

interface PieChartItem extends ChannelSalesPieItemResponse {
  displayName: string;
  color: string;
}

interface TrendChartSeriesItem {
  key: string;
  displayName: string;
  color: string;
  values: number[];
}

const route = useRoute();

const pieChartRef = ref<HTMLDivElement>();
const trendChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const trendChartIns = ref<echarts.ECharts>();

const colorMap: Record<string, string> = {
  offline: '#ff6b4a',
  meituan: '#4ecdc4',
  vending: '#a78bfa'
};

const pieData = ref<PieChartItem[]>([]);
const trendData = ref<ChannelSalesTrendResponse>({
  lineDate: [],
  xdata: []
});
const tableRows = ref<ChannelTableViewRow[]>([]);

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
  if (typeof digits === 'number') return Number(num.toFixed(digits));
  return num;
};

const resolveColor = (channelCode: string, index: number) => {
  const colors = Object.values(colorMap);
  return colorMap[channelCode] || colors[index % colors.length] || '#ff6b4a';
};

const resolveDisplayName = (channelName: string) => channelName || '-';

const normalizePieData = (payload: ChannelSalesPieItemResponse[] | undefined): PieChartItem[] => {
  const rows = Array.isArray(payload) ? payload : [];
  return rows.map((item, index) => ({
    ...item,
    displayName: resolveDisplayName(item.name),
    color: resolveColor(item.name, index)
  }));
};

const normalizeTrendData = (payload: ChannelSalesTrendResponse | undefined): ChannelSalesTrendResponse => {
  const source = payload || {};
  return {
    xdata: Array.isArray(source.xdata) ? source.xdata.map((item) => String(item || '')) : [],
    lineDate: Array.isArray(source.lineDate)
      ? source.lineDate.map((item) => ({
          dataDate: item.dataDate,
          saleChannel: item.saleChannel,
          onlineType: item.onlineType,
          onlineName: item.onlineName,
          sales: toNumber(item.sales, 2)
        }))
      : []
  };
};

const normalizeTableRows = (payload: ChannelSalesDetailsResponse | undefined): ChannelTableViewRow[] => {
  const rows = payload?.records || [];
  return rows.map((item, index) => ({
    ...item,
    channelKey: `${item.channelName || 'channel'}-${index}`
  }));
};

const trendSeries = computed<TrendChartSeriesItem[]>(() => {
  const xdata = trendData.value.xdata || [];
  const map = new Map<string, { displayName: string; values: Record<string, number> }>();
  (trendData.value.lineDate || []).forEach((item) => {
    const key = `${item.saleChannel ?? ''}-${item.onlineType ?? ''}-${item.onlineName ?? ''}`;
    if (!map.has(key)) {
      map.set(key, { displayName: item.onlineName || String(item.saleChannel ?? ''), values: {} });
    }
    map.get(key)!.values[String(item.dataDate || '')] = toNumber(item.sales, 2);
  });
  const palette = Object.values(colorMap);
  return Array.from(map.entries()).map(([key, row], index) => ({
    key,
    displayName: row.displayName,
    color: palette[index % palette.length] || '#ff6b4a',
    values: xdata.map((date) => row.values[date] ?? 0)
  }));
});

const pieRequest = useRequest(async (id: string) => await getCategoryDiagnosisChannelPie(id), {
  onSuccess: async (res) => {
    pieData.value = normalizePieData(res?.data);
    await nextTick();
    renderPieChart();
  }
});

const trendRequest = useRequest(async (id: string) => await getCategoryDiagnosisChannelTrend(id), {
  onSuccess: async (res) => {
    trendData.value = normalizeTrendData(res?.data);
    await nextTick();
    renderTrendChart();
  }
});

const tableRequest = useRequest(async (id: string) => await getCategoryDiagnosisChannelTable(id), {
  onSuccess: (res) => {
    tableRows.value = normalizeTableRows(res?.data);
  }
});

const initPieChart = () => {
  if (!pieChartRef.value) return;
  if (!pieChartIns.value) pieChartIns.value = echarts.init(pieChartRef.value);
};

const initTrendChart = () => {
  if (!trendChartRef.value) return;
  if (!trendChartIns.value) trendChartIns.value = echarts.init(trendChartRef.value);
};

const formatAmount = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '-';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
};

const formatInteger = (value: unknown) => formatAmount(value, 0);

const formatPercent = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${toNumber(value, 2).toFixed(2)}%`;
};

const formatGrowth = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  const fixed = toNumber(value, 2).toFixed(2);
  return `${Number(fixed) > 0 ? '+' : ''}${fixed}%`;
};

const renderPieChart = () => {
  initPieChart();
  if (!pieChartIns.value) return;

  const option: EChartsOption = {
    color: pieData.value.map((item) => item.color),
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        const percent = toNumber(params.percent, 2).toFixed(2);
        return `${params.name}<br/>销售额：${formatAmount(params.value)}<br/>占比：${percent}%`;
      }
    },
    legend: {
      orient: 'vertical',
      right: 12,
      top: 'middle',
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      textStyle: {
        color: '#606266',
        fontSize: 13
      }
    },
    series: [
      {
        name: '本期销售占比',
        type: 'pie',
        radius: ['52%', '72%'],
        center: ['34%', '50%'],
        avoidLabelOverlap: true,
        label: { show: false },
        labelLine: { show: false },
        emphasis: {
          scale: true,
          scaleSize: 6
        },
        data: pieData.value.map((item) => ({
          name: item.displayName,
          value: item.value,
          itemStyle: { color: item.color }
        }))
      }
    ]
  };

  pieChartIns.value.setOption(option, true);
};

const renderTrendChart = () => {
  initTrendChart();
  if (!trendChartIns.value) return;

  const option: EChartsOption = {
    color: trendSeries.value.map((item) => item.color),
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const rows = Array.isArray(params) ? params : [params];
        const title = rows[0]?.axisValueLabel || rows[0]?.axisValue || '';
        const lines = rows.map((item) => `${item.marker}${item.seriesName}：${formatAmount(item.value)}`);
        return [title, ...lines].join('<br/>');
      }
    },
    legend: {
      top: 0,
      left: 'center',
      itemWidth: 10,
      itemHeight: 10,
      icon: 'circle',
      textStyle: {
        color: '#606266',
        fontSize: 13
      }
    },
    grid: {
      left: 56,
      right: 24,
      top: 52,
      bottom: 36
    },
    xAxis: {
      type: 'category',
      boundaryGap: false,
      data: trendData.value.xdata || [],
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      },
      axisTick: {
        show: false
      },
      axisLabel: {
        color: '#606266',
        fontSize: 12,
        rotate: (trendData.value.xdata || []).length > 8 ? 30 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: '元',
      nameTextStyle: {
        color: '#909399'
      },
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#606266',
        formatter: (value: number) => formatAmount(value, 0)
      },
      splitLine: {
        lineStyle: {
          color: '#ebeef5'
        }
      }
    },
    series: trendSeries.value.map((item) => ({
      name: item.displayName,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 6,
      showSymbol: true,
      data: item.values,
      lineStyle: {
        width: 2,
        color: item.color
      },
      itemStyle: {
        color: item.color,
        borderColor: '#fff',
        borderWidth: 1
      },
      areaStyle: {
        color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
          { offset: 0, color: `${item.color}66` },
          { offset: 1, color: `${item.color}12` }
        ])
      }
    }))
  };

  trendChartIns.value.setOption(option, true);
};

const loadPageData = async () => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法加载渠道业绩详情');
    return;
  }
  await Promise.all([pieRequest.run(sessionId.value), trendRequest.run(sessionId.value), tableRequest.run(sessionId.value)]);
};

const handleExport = () => {
  ElMessage.info('后端暂未提供渠道业绩导出接口');
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
  pieData.value = normalizePieData(undefined);
  trendData.value = normalizeTrendData(undefined);
  await nextTick();
  renderPieChart();
  renderTrendChart();
  await loadPageData();
  window.addEventListener('resize', resizeCharts);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeCharts);
  pieChartIns.value?.dispose();
  trendChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.category-diagnosis-channel-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgba(15, 23, 42, 0.04);
}

.header-card {
  margin-bottom: 12px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-header-left {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.page-title-wrap {
  display: flex;
  align-items: center;
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

.role-tag {
  width: fit-content;
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 14px;
  padding-top: 2px;
}

.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.export-button {
  padding: 0;
  font-size: 14px;
}

.chart-row {
  margin-bottom: 12px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.chart-box {
  width: 100%;
  height: 360px;
}

.channel-cell {
  display: flex;
  align-items: center;
  min-width: 0;
}

.channel-name {
  color: var(--el-text-color-regular);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.growth-text {
  font-weight: 600;
}

.growth-text.is-up {
  color: var(--el-color-danger);
}

.growth-text.is-down {
  color: var(--el-color-success);
}

.growth-text.is-flat {
  color: var(--el-text-color-secondary);
}

.channel-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.channel-table :deep(.cell) {
  font-size: 13px;
}

.channel-table :deep(.el-table__body td) {
  color: var(--el-text-color-regular);
}

.channel-table :deep(.el-table__empty-block) {
  min-height: 220px;
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
  }

  .page-actions {
    width: 100%;
    justify-content: space-between;
  }

  .chart-box {
    height: 320px;
  }
}
</style>

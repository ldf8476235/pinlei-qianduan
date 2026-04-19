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
          <template #default="{ row }">{{ formatAmount(row.salesAmount) }}</template>
        </el-table-column>
        <el-table-column label="本期-占比" min-width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.salesShare) }}</template>
        </el-table-column>
        <el-table-column label="本期-毛利额" min-width="130" align="right">
          <template #default="{ row }">{{ formatAmount(row.grossAmount) }}</template>
        </el-table-column>
        <el-table-column label="本期-毛利额占比" min-width="140" align="right">
          <template #default="{ row }">{{ formatPercent(row.grossShare) }}</template>
        </el-table-column>
        <el-table-column label="本期-毛利率" min-width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
        </el-table-column>
        <el-table-column label="本期-客数" min-width="110" align="right">
          <template #default="{ row }">{{ formatInteger(row.customerCount) }}</template>
        </el-table-column>
        <el-table-column label="本期-客单价" min-width="120" align="right">
          <template #default="{ row }">{{ formatAmount(row.customerPrice) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-销售额" min-width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.compareSalesAmount) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-占比" min-width="130" align="right">
          <template #default="{ row }">{{ formatPercent(row.compareSalesShare) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-对比增长" min-width="140" align="right">
          <template #default="{ row }">
            <span :class="growthClass(row.salesGrowthRate)">{{ formatGrowth(row.salesGrowthRate) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="对比日期-毛利额" min-width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.compareGrossAmount) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-毛利额占比" min-width="150" align="right">
          <template #default="{ row }">{{ formatPercent(row.compareGrossShare) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-毛利额对比增长" min-width="170" align="right">
          <template #default="{ row }">
            <span :class="growthClass(row.grossGrowthRate)">{{ formatGrowth(row.grossGrowthRate) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="对比日期-毛利率" min-width="130" align="right">
          <template #default="{ row }">{{ formatPercent(row.compareGrossRate) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-客数" min-width="120" align="right">
          <template #default="{ row }">{{ formatInteger(row.compareCustomerCount) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-客数对比增长" min-width="170" align="right">
          <template #default="{ row }">
            <span :class="growthClass(row.customerCountGrowthRate)">{{ formatGrowth(row.customerCountGrowthRate) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="对比日期-客单价" min-width="140" align="right">
          <template #default="{ row }">{{ formatAmount(row.compareCustomerPrice) }}</template>
        </el-table-column>
        <el-table-column label="对比日期-客单价对比增长" min-width="180" align="right">
          <template #default="{ row }">
            <span :class="growthClass(row.customerPriceGrowthRate)">{{ formatGrowth(row.customerPriceGrowthRate) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="CategoryDiagnosisChannelDetail" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { download } from '@/utils/request';
import { useRequest } from '@/hooks/useRequest';
import {
  getCategoryDiagnosisChannelPie,
  getCategoryDiagnosisChannelTable,
  getCategoryDiagnosisChannelTrend
} from '@/api/category/diagnosis/detail';
import type {
  DiagnosisChannelPieItem,
  DiagnosisChannelTableResponse,
  DiagnosisChannelTableRow,
  DiagnosisChannelTrendResponse,
  DiagnosisChannelTrendSeriesItem,
  DiagnosisSubClassQuery
} from '@/api/category/diagnosis/detail/types';

interface ChannelTableViewRow extends DiagnosisChannelTableRow {
  channelKey: string;
}

interface PieChartItem extends DiagnosisChannelPieItem {
  displayName: string;
  color: string;
}

interface TrendChartSeriesItem extends DiagnosisChannelTrendSeriesItem {
  displayName: string;
  color: string;
}

const route = useRoute();

const pieChartRef = ref<HTMLDivElement>();
const trendChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const trendChartIns = ref<echarts.ECharts>();

const fallbackChannelMap: Record<string, string> = {
  offline: '线下',
  meituan: '线上-美团外卖',
  vending: '线上-自动贩卖机'
};

const fallbackPieData: DiagnosisChannelPieItem[] = [
  { channelCode: 'offline', channelName: '线下', salesAmount: 468520, salesShare: 52.44 },
  { channelCode: 'meituan', channelName: '线上-美团外卖', salesAmount: 278630, salesShare: 31.21 },
  { channelCode: 'vending', channelName: '线上-自动贩卖机', salesAmount: 145980, salesShare: 16.35 }
];

const fallbackTrendData: DiagnosisChannelTrendResponse = {
  dates: Array.from({ length: 10 }).map((_, index) => `2024/10/${String(index + 1).padStart(2, '0')}`),
  unit: '元',
  series: [
    { channelCode: 'offline', channelName: '线下', values: [41800, 43200, 44700, 45800, 46900, 48100, 49500, 50300, 51700, 52800] },
    { channelCode: 'meituan', channelName: '线上-美团外卖', values: [24300, 25200, 26100, 27400, 28100, 28900, 29700, 30400, 31500, 32700] },
    { channelCode: 'vending', channelName: '线上-自动贩卖机', values: [12100, 12600, 13200, 13700, 14100, 14600, 14900, 15300, 15800, 16200] }
  ]
};

const colorMap: Record<string, string> = {
  offline: '#ff6b4a',
  meituan: '#4ecdc4',
  vending: '#a78bfa'
};

const pieData = ref<PieChartItem[]>([]);
const trendData = ref<DiagnosisChannelTrendResponse>({
  dates: [],
  unit: '元',
  series: []
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

const resolveColor = (channelCode: string, index: number) => {
  const colors = Object.values(colorMap);
  return colorMap[channelCode] || colors[index % colors.length] || '#ff6b4a';
};

const resolveDisplayName = (channelCode: string, channelName: string) => {
  return channelName || fallbackChannelMap[channelCode] || '-';
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

const normalizePieData = (payload: any): PieChartItem[] => {
  const source = extractArrayPayload(payload);
  const rows = source.length ? source : fallbackPieData;
  return rows
    .map((item: any, index: number) => {
      const channelCode = String(item.channelCode || item.code || item.channelType || fallbackPieData[index]?.channelCode || '');
      const channelName = String(item.channelName || item.name || item.channelLabel || fallbackChannelMap[channelCode] || '');
      return {
        channelCode,
        channelName,
        salesAmount: toNumber(item.salesAmount ?? item.currentSales ?? item.value ?? fallbackPieData[index]?.salesAmount ?? 0, 2),
        salesShare: normalizePercent(item.salesShare ?? item.share ?? item.ratio ?? item.proportion ?? fallbackPieData[index]?.salesShare ?? 0),
        displayName: resolveDisplayName(channelCode, channelName),
        color: resolveColor(channelCode, index)
      };
    })
    .filter((item) => item.channelCode || item.channelName);
};

const normalizeTrendData = (payload: any): DiagnosisChannelTrendResponse => {
  const source = payload && typeof payload === 'object' ? payload : {};
  const fallbackSource = fallbackTrendData;
  const dates = extractArrayPayload(source.dates || source.xAxis || source.labels || fallbackSource.dates).map((item) => String(item || ''));
  const rawSeries = extractArrayPayload(source.series || source.rows || source.items || fallbackSource.series);
  const series = rawSeries
    .map((item: any, index: number) => {
      const channelCode = String(item.channelCode || item.code || item.channelType || fallbackSource.series[index]?.channelCode || '');
      const channelName = String(item.channelName || item.name || item.channelLabel || fallbackChannelMap[channelCode] || '');
      return {
        channelCode,
        channelName,
        color: resolveColor(channelCode, index),
        values: extractArrayPayload(item.values || item.data || fallbackSource.series[index]?.values || []).map((value) => toNumber(value, 2))
      };
    })
    .filter((item) => item.values.length);

  return {
    dates,
    unit: String(source.unit || fallbackSource.unit || '元'),
    series
  };
};

const normalizeTableRows = (payload: any): ChannelTableViewRow[] => {
  const source = payload && typeof payload === 'object' ? payload : {};
  const rows = extractArrayPayload(source.rows || source.list || source.items || payload);
  return rows.map((item: any, index: number) => {
    const channelCode = String(item.channelCode || item.code || item.channelType || '');
    const channelName = String(item.channelName || item.name || item.channelLabel || fallbackChannelMap[channelCode] || '');
    return {
      channelKey: `${channelCode || 'channel'}-${index}`,
      channelCode,
      channelName,
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
      compareGrossShare: normalizePercent(item.compareGrossShare ?? item.compareGrossRatio ?? item.lastGrossShare ?? 0),
      grossGrowthRate: normalizePercent(item.grossGrowthRate ?? item.comparativeGross ?? item.compareGrossGrowthRate ?? 0),
      compareGrossRate: normalizePercent(item.compareGrossRate ?? item.lastGrossRate ?? 0),
      compareCustomerCount: toNumber(item.compareCustomerCount ?? 0),
      customerCountGrowthRate: normalizePercent(item.customerCountGrowthRate ?? item.comparativeCustomerCount ?? 0),
      compareCustomerPrice: toNumber(item.compareCustomerPrice ?? 0, 2),
      customerPriceGrowthRate: normalizePercent(item.customerPriceGrowthRate ?? item.comparativeCustomerPrice ?? 0)
    };
  });
};

const trendSeries = computed<TrendChartSeriesItem[]>(() =>
  trendData.value.series.map((item, index) => ({
    ...item,
    displayName: resolveDisplayName(item.channelCode, item.channelName),
    color: resolveColor(item.channelCode, index)
  }))
);

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
    tableRows.value = normalizeTableRows((res?.data || {}) as DiagnosisChannelTableResponse);
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
          value: item.salesAmount,
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
      data: trendData.value.dates,
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
        rotate: trendData.value.dates.length > 8 ? 30 : 0
      }
    },
    yAxis: {
      type: 'value',
      name: trendData.value.unit || '元',
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
      stack: 'sales',
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
  if (!sessionId.value) {
    ElMessage.warning('缺少 sessionId，无法导出');
    return;
  }
  download('/api/v1/diagnosis/channel/export', { sessionId: sessionId.value }, `渠道业绩_${sessionId.value}.xlsx`);
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

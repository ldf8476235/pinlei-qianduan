<template>
  <div class="p-2 spec-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-title-wrap">
          <span class="page-title">规格分析</span>
          <el-button link type="primary" class="detail-link" @click="handleViewDetail">详情 &gt;</el-button>
        </div>
        <span class="unit-text">金额单位：元</span>
      </div>
    </el-card>

    <section class="metric-row">
      <el-card
        v-for="item in metrics"
        :key="item.label"
        shadow="hover"
        class="page-card metric-card"
        :class="{ 'metric-card--clickable': item.drillable }"
        :tabindex="item.drillable ? 0 : -1"
        :role="item.drillable ? 'button' : undefined"
        :aria-label="item.drillable ? `${item.label}，点击查看规格清单` : undefined"
        @click="handleMetricClick(item)"
        @keydown.enter.prevent="handleMetricClick(item)"
        @keydown.space.prevent="handleMetricClick(item)"
      >
        <div class="metric-label">{{ item.label }}</div>
        <div class="metric-value" :class="{ emphasis: item.emphasis }">{{ item.value }}</div>
      </el-card>
    </section>

    <section class="main-grid">
      <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">本期各规格销售占比</span>
          </div>
        </template>
        <div class="pie-layout">
          <div class="vue-chart-tooltip-wrap pie-tooltip-wrap" @mousemove="handleSpecTooltipMousemove($event, 'pie')" @mouseleave="hideSpecTooltip">
            <div ref="pieChartRef" class="chart-box pie-chart" />
            <div
              v-if="activeTooltipType === 'pie' && chartTooltip.visible"
              class="vue-chart-tooltip"
              :style="{ left: `${chartTooltip.x}px`, top: `${chartTooltip.y}px` }"
            >
              <div class="tooltip-title">{{ chartTooltip.title }}</div>
              <div v-for="item in chartTooltip.rows" :key="item.name" class="tooltip-row">
                <span v-if="item.color" class="tooltip-dot" :style="{ background: item.color }" />
                <span>{{ item.name }}：{{ item.value }}</span>
              </div>
            </div>
          </div>
          <div class="pie-legend">
            <div class="pie-legend-list">
              <div v-for="item in visiblePieLegendItems" :key="item.name" class="pie-legend-item">
                <span class="legend-dot" :style="{ background: item.color }" />
                <span class="legend-name" :title="item.name">{{ item.name }}</span>
              </div>
            </div>
            <div class="legend-pager">
              <button type="button" class="legend-arrow" :disabled="!canPrevLegend" @click="handlePrevLegend">&lt;</button>
              <span class="legend-page">{{ legendPageDisplay }}/{{ legendTotalDisplay }}</span>
              <button type="button" class="legend-arrow" :disabled="!canNextLegend" @click="handleNextLegend">&gt;</button>
            </div>
          </div>
        </div>
      </el-card>

      <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
        <template #header>
          <div class="panel-header panel-header--rank">
            <div class="panel-title-wrap">
              <span class="panel-title">本期规格业绩排名</span>
              <el-button link type="primary" class="sort-text" @click="toggleRankDesc">{{ rankDesc ? '降序' : '升序' }}</el-button>
            </div>
            <el-select v-model="rankMetric" class="rank-select" size="small">
              <el-option label="销售额" value="1" />
              <el-option label="销售量" value="2" />
              <el-option label="毛利额" value="3" />
              <el-option label="毛利率" value="4" />
            </el-select>
          </div>
        </template>
        <div class="rank-nav">
          <el-pagination
            v-model:current-page="rankPage.page"
            :page-size="rankPage.pageSize"
            :total="rankPage.total"
            layout="prev, pager, next"
            :pager-count="6"
            background
            small
            @current-change="handleRankPageChange"
          />
        </div>
        <div class="vue-chart-tooltip-wrap rank-tooltip-wrap" @mousemove="handleSpecTooltipMousemove($event, 'rank')" @mouseleave="hideSpecTooltip">
          <div ref="rankChartRef" class="chart-box rank-chart" />
          <div
            v-if="activeTooltipType === 'rank' && chartTooltip.visible"
            class="vue-chart-tooltip"
            :style="{ left: `${chartTooltip.x}px`, top: `${chartTooltip.y}px` }"
          >
            <div class="tooltip-title">{{ chartTooltip.title }}</div>
            <div v-for="item in chartTooltip.rows" :key="item.name" class="tooltip-row">
              <span v-if="item.color" class="tooltip-dot" :style="{ background: item.color }" />
              <span>{{ item.name }}：{{ item.value }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </section>

    <section class="combo-section">
      <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
        <template #header>
          <div class="panel-header">
            <span class="panel-title">规格SKU数及销售对比变化</span>
          </div>
        </template>
        <div class="vue-chart-tooltip-wrap combo-tooltip-wrap" @mousemove="handleSpecTooltipMousemove($event, 'combo')" @mouseleave="hideSpecTooltip">
          <div ref="comboChartRef" class="chart-box combo-chart" />
          <div
            v-if="activeTooltipType === 'combo' && chartTooltip.visible"
            class="vue-chart-tooltip"
            :style="{ left: `${chartTooltip.x}px`, top: `${chartTooltip.y}px` }"
          >
            <div class="tooltip-title">{{ chartTooltip.title }}</div>
            <div v-for="item in chartTooltip.rows" :key="item.name" class="tooltip-row">
              <span v-if="item.color" class="tooltip-dot" :style="{ background: item.color }" />
              <span>{{ item.name }}：{{ item.value }}</span>
            </div>
          </div>
        </div>
      </el-card>
    </section>

    <el-card shadow="hover" class="page-card summary-card">
      <template #header>
        <div class="panel-header">
          <span class="panel-title">总结与建议</span>
        </div>
      </template>
      <ul class="summary-list">
        <li v-for="line in summaryLines" :key="line">{{ line }}</li>
      </ul>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { createVueChartTooltip, getCategoryIndexByMouseY, hideVueChartTooltip, showVueChartTooltip } from './useVueChartTooltip';
import {
  getSpecDetails,
  getSpecOverview,
  getSpecRanking,
  getSpecFilterOptions,
  getSpecSalesShare,
  getSpecSkuSalesChange
} from '@/api/category/diagnosis/analysis';

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => String(route.query.sessionId || ''));
const loading = ref(false);

interface SpecMetric {
  label: string;
  value: string;
  emphasis?: boolean;
  drillable?: boolean;
}

const metrics = ref<SpecMetric[]>([
  { label: '规格总数', value: '1198', emphasis: true, drillable: true },
  { label: '新销规格', value: '72', emphasis: true }
]);

const pieChartRef = ref<HTMLDivElement>();
const rankChartRef = ref<HTMLDivElement>();
const comboChartRef = ref<HTMLDivElement>();
const pieChartIns = ref<echarts.ECharts>();
const rankChartIns = ref<echarts.ECharts>();
const comboChartIns = ref<echarts.ECharts>();
const chartTooltip = createVueChartTooltip();
type SpecChartType = 'pie' | 'rank' | 'combo';
const activeTooltipType = ref<SpecChartType | ''>('');

const rankMetric = ref('1');
const rankDesc = ref(true);
const rankPage = reactive({
  page: 1,
  pageSize: 10,
  total: 0,
  maxData: 0
});

const legendPageSize = 4;
const legendStart = ref(0);
const pieItems = ref<any[]>([]);
const rankItems = ref<any[]>([]);
const comboItems = ref<any[]>([]);
const detailRows = ref<any[]>([]);
const specSummary = ref<{ summaryOne?: string[]; summaryTwo?: string[]; summaryThree?: string[]; summaryFour?: string[] }>({});

const colors = ['#f97316', '#fb923c', '#f59e0b', '#ea580c', '#fdba74', '#c2410c', '#fbbf24', '#7c2d12'];
const formatAmount = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: digits, maximumFractionDigits: digits });
};

const formatPercent = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return `${num.toFixed(2)}%`;
};

const getName = (item: any, index = 0) => item?.productSpec || item?.specName || item?.name || item?.spec || item?.label || `规格${index + 1}`;
const getSales = (item: any) => Number(item?.sales ?? item?.salesAmount ?? item?.value ?? item?.data ?? 0);
const getQuantity = (item: any) => Number(item?.sku ?? item?.skuNum ?? item?.currentSku ?? item?.value ?? item?.data ?? 0);
const getRankValue = (item: any) => Number(item?.data ?? item?.value ?? item?.sales ?? item?.salesAmount ?? 0);
const getGrowth = (item: any) => Number(item?.sales ?? item?.growthRate ?? item?.salesGrowthRate ?? item?.compareRate ?? item?.rate ?? 0);
const getSkuChange = (item: any) => Number(item?.sku ?? item?.skuChange ?? item?.skuInc ?? item?.changeSku ?? 0);

const getComboIndexByMouse = (event: MouseEvent, itemCount: number) => {
  if (!comboChartRef.value || !comboChartIns.value || itemCount <= 0) return -1;
  const chartRect = comboChartRef.value.getBoundingClientRect();
  const point: [number, number] = [event.clientX - chartRect.left, event.clientY - chartRect.top];
  if (!comboChartIns.value.containPixel({ gridIndex: 0 }, point)) return -1;
  const coord = comboChartIns.value.convertFromPixel({ gridIndex: 0 }, point);
  const rawIndex = Array.isArray(coord) ? Number(coord[0]) : Number(coord);
  const index = Math.round(rawIndex);
  return Number.isInteger(index) && index >= 0 && index < itemCount ? index : -1;
};

const hideSpecTooltip = () => {
  activeTooltipType.value = '';
  hideVueChartTooltip(chartTooltip);
};

const handleSpecTooltipMousemove = (event: MouseEvent, type: SpecChartType) => {
  activeTooltipType.value = type;
  if (type === 'pie') {
    if (!pieChartRef.value || !pieChartIns.value || !pieItems.value.length) {
      hideSpecTooltip();
      return;
    }
    const rect = pieChartRef.value.getBoundingClientRect();
    const point = [event.clientX - rect.left, event.clientY - rect.top];
    const index = pieItems.value.findIndex((_, dataIndex) => pieChartIns.value?.containPixel({ seriesIndex: 0, dataIndex }, point));
    const item = index >= 0 ? pieItems.value[index] : null;
    if (!item) {
      hideSpecTooltip();
      return;
    }
    showVueChartTooltip(
      chartTooltip,
      event,
      getName(item, index),
      [{ name: '销售额', value: formatAmount(getSales(item)), color: item?.color || colors[index % colors.length] }],
      { width: 220, height: 82 }
    );
    return;
  }

  if (type === 'rank') {
    if (!rankChartRef.value) {
      hideSpecTooltip();
      return;
    }
    const data = sortedRankItems.value.slice(0, 10);
    const index = getCategoryIndexByMouseY(event, rankChartRef.value, data.length, { top: 10, bottom: 20 });
    const item = data[index];
    if (!item) {
      hideSpecTooltip();
      return;
    }
    showVueChartTooltip(
      chartTooltip,
      event,
      getName(item, index),
      [
        {
          name: rankMetric.value === '2' ? '销售量' : rankMetric.value === '3' ? '毛利额' : rankMetric.value === '4' ? '毛利率' : '销售额',
          value: formatAmount(getRankValue(item)),
          color: '#f97316'
        }
      ],
      { width: 230, height: 82 }
    );
    return;
  }

  const source = comboItems.value.length ? comboItems.value : detailRows.value;
  if (!comboChartRef.value || !source.length) {
    hideSpecTooltip();
    return;
  }
  const index = getComboIndexByMouse(event, source.length);
  const item = source[index];
  if (!item) {
    hideSpecTooltip();
    return;
  }
  showVueChartTooltip(
    chartTooltip,
    event,
    getName(item, index),
    [
      { name: 'SKU变动数', value: formatAmount(getSkuChange(item), 0), color: '#f59e0b' },
      { name: '销售额增长率', value: formatPercent(getGrowth(item)), color: '#9ca3af' }
    ],
    { width: 240, height: 108 }
  );
};

const pieLegendItems = computed(() =>
  pieItems.value.map((item, index) => ({
    name: getName(item, index),
    color: item?.color || colors[index % colors.length]
  }))
);

const visiblePieLegendItems = computed(() => pieLegendItems.value.slice(legendStart.value, legendStart.value + legendPageSize));
const legendPageDisplay = computed(() => (pieLegendItems.value.length ? legendStart.value + 1 : 1));
const legendTotalDisplay = computed(() => Math.max(1, pieLegendItems.value.length));
const canPrevLegend = computed(() => legendStart.value > 0);
const canNextLegend = computed(() => legendStart.value + legendPageSize < pieLegendItems.value.length);

const sortedRankItems = computed(() =>
  [...rankItems.value].sort((left, right) => {
    const leftValue = getRankValue(left);
    const rightValue = getRankValue(right);
    const diff = leftValue - rightValue;
    return rankDesc.value ? -diff : diff;
  })
);

const defaultSummaryLines = [
  '规格“5kg”“4.8kg”“4.75kg”“50g”“100g”销售额相对较好，客户购买意向高。',
  '规格“1支装”“1500g”“278”“五双装”“13p”销售额相对较差，客户购买意向偏低。',
  '规格“3000g”“2.5L”“720g+280g”“2.38kg”“100g+100g”销售额对比上升较大，排除促销因素影响，反映出客户对该类规格的购买意向增加。',
  '规格“278”“五双装”“250g(J)”“285cm*5p”“13p”销售额对比下降较大，排除促销因素影响，反映出客户对该类规格的购买意向降低。'
];

const summaryLines = computed(() => {
  const one = (specSummary.value.summaryOne || []).filter(Boolean);
  const two = (specSummary.value.summaryTwo || []).filter(Boolean);
  const three = (specSummary.value.summaryThree || []).filter(Boolean);
  const four = (specSummary.value.summaryFour || []).filter(Boolean);

  return [
    one.length ? `规格“${one.join('”“')}”销售额相对较好，客户购买意向高。` : defaultSummaryLines[0],
    two.length ? `规格“${two.join('”“')}”销售额相对较差，客户购买意向偏低。` : defaultSummaryLines[1],
    three.length ? `规格“${three.join('”“')}”销售额对比上升较大，排除促销因素影响，反映出客户对该类规格的购买意向增加。` : defaultSummaryLines[2],
    four.length ? `规格“${four.join('”“')}”销售额对比下降较大，排除促销因素影响，反映出客户对该类规格的购买意向降低。` : defaultSummaryLines[3]
  ];
});

const renderPieChart = () => {
  if (!pieChartRef.value) return;
  pieChartIns.value ||= echarts.init(pieChartRef.value);
  pieChartIns.value.setOption(
    {
      color: colors,
      tooltip: { show: false },
      series: [
        {
          type: 'pie',
          radius: ['60%', '78%'],
          center: ['38%', '50%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          itemStyle: { borderColor: '#fff', borderWidth: 3 },
          data: pieItems.value.map((item, index) => ({
            name: getName(item, index),
            value: getSales(item),
            itemStyle: { color: item?.color || colors[index % colors.length] }
          }))
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderRankChart = () => {
  if (!rankChartRef.value) return;
  rankChartIns.value ||= echarts.init(rankChartRef.value);
  const data = sortedRankItems.value.slice(0, 10);
  const topLabel = data.length ? getName(data[0], 0) : '';
  const values = data.map((item) => getRankValue(item));
  const maxValue = Math.max(rankPage.maxData, ...values, 1);
  const axisMax = Number((maxValue * 1.12).toFixed(2));
  const axisInterval = Number((axisMax / 5).toFixed(2));
  rankChartIns.value.setOption(
    {
      animationDuration: 300,
      tooltip: { show: false },
      grid: { left: 96, right: 22, top: 10, bottom: 20, containLabel: true },
      xAxis: {
        type: 'value',
        min: 0,
        max: axisMax,
        interval: axisInterval,
        boundaryGap: [0, 0],
        axisLabel: {
          color: '#111827',
          fontSize: 12,
          formatter: (value: number) => Number(value).toFixed(2)
        },
        splitLine: { lineStyle: { color: '#edf1f5' } },
        axisLine: { lineStyle: { color: '#dfe6ee' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'category',
        inverse: true,
        axisTick: { show: false },
        axisLine: { show: false },
        axisLabel: { color: '#111827', fontSize: 12, margin: 14 },
        data: data.map((item, index) => getName(item, index))
      },
      series: [
        {
          name: rankMetric.value === '2' ? '销售量' : rankMetric.value === '3' ? '毛利额' : rankMetric.value === '4' ? '毛利率' : '销售额',
          type: 'bar',
          barWidth: 14,
          barCategoryGap: '36%',
          data: data.map((item) => ({
            value: getRankValue(item),
            itemStyle: { color: '#f97316', borderRadius: 0 }
          })),
          markLine: {
            symbol: 'none',
            label: { show: false },
            lineStyle: { color: '#ef4444', width: 1.2, type: 'dashed' },
            data: [{ xAxis: axisMax }]
          },
          markPoint: {
            symbol: 'triangle',
            symbolSize: 12,
            label: { show: false },
            symbolOffset: [0, -8],
            data: topLabel
              ? [
                  {
                    coord: [axisMax, topLabel],
                    itemStyle: { color: '#ef4444' }
                  }
                ]
              : []
          }
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderComboChart = () => {
  if (!comboChartRef.value) return;
  comboChartIns.value ||= echarts.init(comboChartRef.value);
  const source = comboItems.value.length ? comboItems.value : detailRows.value;
  const names = source.map((item, index) => getName(item, index));
  const skuData = source.map((item) => getSkuChange(item));
  const rateData = source.map((item) => getGrowth(item));
  const visibleCount = 12;
  const zoomEnd = names.length > visibleCount ? Number(((visibleCount / names.length) * 100).toFixed(2)) : 100;
  const minRate = rateData.length ? Math.min(...rateData, 0) : -10;
  const maxRate = rateData.length ? Math.max(...rateData, 0) : 10;
  const ratePadding = Math.max(10, Math.ceil((maxRate - minRate) * 0.15));
  const minSku = skuData.length ? Math.min(...skuData, 0) : -5;
  const maxSku = skuData.length ? Math.max(...skuData, 0) : 5;
  const skuPadding = Math.max(2, Math.ceil((maxSku - minSku) * 0.2));
  comboChartIns.value.setOption(
    {
      tooltip: { show: false },
      legend: {
        top: 6,
        left: 16,
        itemWidth: 10,
        itemHeight: 10,
        data: ['SKU变动数', '销售额增长率']
      },
      grid: { left: 52, right: 56, top: 38, bottom: names.length > visibleCount ? 48 : 28, containLabel: true },
      xAxis: {
        type: 'category',
        data: names,
        axisTick: { show: false },
        axisLine: { lineStyle: { color: '#d9e0e7' } },
        axisLabel: {
          color: '#475569',
          interval: 0,
          rotate: 0,
          hideOverlap: true,
          formatter: (value: string) => (value.length > 7 ? `${value.slice(0, 7)}...` : value)
        }
      },
      yAxis: [
        {
          type: 'value',
          min: Math.floor((minRate - ratePadding) / 10) * 10,
          max: Math.ceil((maxRate + ratePadding) / 10) * 10,
          axisLabel: { formatter: '{value}' },
          splitLine: { lineStyle: { color: '#edf1f5' } }
        },
        {
          type: 'value',
          min: Math.floor(minSku - skuPadding),
          max: Math.ceil(maxSku + skuPadding),
          axisLabel: { formatter: '{value}' },
          splitLine: { show: false }
        }
      ],
      series: [
        {
          name: 'SKU变动数',
          type: 'bar',
          yAxisIndex: 1,
          barWidth: 16,
          data: skuData,
          itemStyle: { color: '#f59e0b' }
        },
        {
          name: '销售额增长率',
          type: 'line',
          yAxisIndex: 0,
          symbol: 'circle',
          symbolSize: 7,
          data: rateData,
          itemStyle: { color: '#9ca3af' },
          lineStyle: { color: '#9ca3af', width: 2.5 }
        }
      ],
      dataZoom:
        names.length > visibleCount
          ? [
              {
                type: 'inside',
                xAxisIndex: 0,
                filterMode: 'none',
                start: 0,
                end: zoomEnd,
                zoomLock: true,
                zoomOnMouseWheel: false,
                moveOnMouseMove: true,
                moveOnMouseWheel: true
              },
              {
                type: 'slider',
                xAxisIndex: 0,
                filterMode: 'none',
                height: 14,
                bottom: 8,
                start: 0,
                end: zoomEnd,
                brushSelect: false,
                showDetail: false,
                borderColor: 'transparent',
                backgroundColor: '#eef2f7',
                fillerColor: 'rgba(249, 115, 22, 0.18)',
                handleSize: '70%',
                handleStyle: {
                  color: '#f97316',
                  borderColor: '#f97316'
                },
                moveHandleSize: 10,
                moveHandleStyle: { color: '#f97316' },
                dataBackground: {
                  lineStyle: { color: '#cbd5e1' },
                  areaStyle: { color: '#e2e8f0' }
                },
                selectedDataBackground: {
                  lineStyle: { color: '#f97316' },
                  areaStyle: { color: 'rgba(249, 115, 22, 0.12)' }
                }
              }
            ]
          : []
    } as EChartsOption,
    true
  );
};

const reload = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const [overviewRes, shareRes, rankingRes, comboRes, detailsRes, filterRes] = await Promise.all([
      getSpecOverview(sessionId.value),
      getSpecSalesShare(sessionId.value),
      getSpecRanking({
        sessionId: sessionId.value,
        page: rankPage.page,
        size: rankPage.pageSize,
        type: rankMetric.value,
        order: rankDesc.value ? 'desc' : 'asc'
      }),
      getSpecSkuSalesChange(sessionId.value),
      getSpecDetails({ sessionId: sessionId.value, page: 1, size: 20 }),
      getSpecFilterOptions(sessionId.value)
    ]);

    const overview: any = overviewRes.data || {};
    metrics.value = [
      { label: '规格总数', value: formatAmount(overview.totalNum ?? overview.specTotalNum ?? 1198, 0), emphasis: true, drillable: true },
      { label: '新销规格', value: formatAmount(overview.newNum ?? overview.newSpecNum ?? 72, 0), emphasis: true }
    ];

    pieItems.value = Array.isArray((shareRes.data as any)?.data)
      ? (shareRes.data as any).data
      : Array.isArray(shareRes.data as any)
        ? (shareRes.data as any)
        : [];
    const rankingData = (rankingRes.data as any)?.data || (rankingRes.data as any) || {};
    rankItems.value = Array.isArray(rankingData.list)
      ? rankingData.list
      : Array.isArray(rankingData.records)
        ? rankingData.records
        : Array.isArray(rankingData)
          ? rankingData
          : [];
    const comboData = (comboRes.data as any)?.data || (comboRes.data as any) || {};
    comboItems.value = Array.isArray(comboData.list)
      ? comboData.list
      : Array.isArray(comboData.records)
        ? comboData.records
        : Array.isArray(comboData)
          ? comboData
          : [];
    detailRows.value = Array.isArray((detailsRes.data as any)?.data?.records)
      ? (detailsRes.data as any).data.records
      : Array.isArray((detailsRes.data as any)?.data?.list)
        ? (detailsRes.data as any).data.list
        : Array.isArray((detailsRes.data as any)?.data)
          ? (detailsRes.data as any).data
          : [];
    specSummary.value = (filterRes.data as any)?.data || (filterRes.data as any) || {};

    rankPage.total = Number(rankingData.total || rankingData.pages || rankItems.value.length || 0);
    rankPage.maxData = Number(rankingData.maxData || Math.max(...rankItems.value.map((item) => getRankValue(item)), 0));
    legendStart.value = Math.min(legendStart.value, Math.max(0, pieLegendItems.value.length - legendPageSize));
    if (!pieLegendItems.value.length) legendStart.value = 0;

    await nextTick();
    renderPieChart();
    renderRankChart();
    renderComboChart();
  } finally {
    loading.value = false;
  }
};

const handleViewDetail = () => {
  router.push({ path: '/spec/analysis/detail', query: { ...route.query } });
};

const handleMetricClick = (item: SpecMetric) => {
  if (!item.drillable) return;
  handleViewDetail();
};

const handleRankPageChange = async (page: number) => {
  rankPage.page = page;
  await reload();
};

const handlePrevLegend = () => {
  if (canPrevLegend.value) legendStart.value -= 1;
};

const handleNextLegend = () => {
  if (canNextLegend.value) legendStart.value += 1;
};

const toggleRankDesc = async () => {
  rankDesc.value = !rankDesc.value;
  rankPage.page = 1;
  await reload();
};

const resizeCharts = () => {
  pieChartIns.value?.resize();
  rankChartIns.value?.resize();
  comboChartIns.value?.resize();
};

watch(
  () => [rankMetric.value, route.query.sessionId],
  async () => {
    rankPage.page = 1;
    legendStart.value = 0;
    await reload();
  }
);

onMounted(async () => {
  await reload();
  window.addEventListener('resize', resizeCharts);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeCharts);
  pieChartIns.value?.dispose();
  rankChartIns.value?.dispose();
  comboChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.spec-analysis-page {
  display: flex;
  flex-direction: column;
  gap: 10px;
  height: calc(100vh - 84px);
  overflow: hidden;
  background: #f5f7fa;
}

.page-card {
  border: 1px solid #e5e7eb;
  box-shadow: none;
  background: #fff;
}

.header-card {
  flex: none;
  padding: 10px 16px;
}

.page-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.page-title {
  font-size: 20px;
  font-weight: 600;
  color: #0f172a;
}

.detail-link {
  padding-left: 0;
  color: #0f9f9a;
}

.unit-text {
  font-size: 13px;
  color: #94a3b8;
}

.metric-row {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  flex: none;
}

.metric-card {
  height: 84px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 8px 12px;
}

.metric-card--clickable {
  position: relative;
  cursor: pointer;
  transition:
    border-color 0.2s ease,
    box-shadow 0.2s ease,
    transform 0.2s ease;
}

.metric-card--clickable::after {
  content: '查看清单';
  position: absolute;
  top: 10px;
  right: 14px;
  padding: 2px 8px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.1);
  color: #f97316;
  font-size: 12px;
  opacity: 0;
  transform: translateY(-2px);
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
}

.metric-card--clickable:hover,
.metric-card--clickable:focus-visible {
  border-color: rgba(249, 115, 22, 0.55);
  box-shadow: 0 10px 24px rgba(249, 115, 22, 0.14);
  transform: translateY(-1px);
  outline: none;
}

.metric-card--clickable:hover::after,
.metric-card--clickable:focus-visible::after {
  opacity: 1;
  transform: translateY(0);
}

.metric-label {
  font-size: 13px;
  color: #64748b;
  line-height: 1;
}

.metric-value {
  margin-top: 10px;
  font-size: 30px;
  font-weight: 700;
  color: #0f9f9a;
  line-height: 1;
}

.main-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
  height: 292px;
  flex: none;
}

.chart-card {
  height: 100%;
  overflow: hidden;
}

.panel-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  height: 24px;
}

.panel-title {
  font-size: 15px;
  font-weight: 400;
  color: #0f172a;
}

.panel-title-wrap {
  display: flex;
  align-items: center;
  gap: 10px;
}

.panel-header--rank {
  align-items: center;
}

.panel-header--rank .panel-title-wrap {
  flex: 1 1 auto;
}

.sort-text {
  padding-left: 0;
  color: #16c2a3;
  font-size: 13px;
}

.rank-select {
  width: 108px;
}

.rank-select :deep(.el-select__wrapper) {
  min-height: 28px;
  border-radius: 4px;
  box-shadow: 0 0 0 1px #d8e2ea inset;
}

.rank-select :deep(.el-select__selected-item) {
  color: #111827;
  font-size: 12px;
}

.pie-layout {
  display: flex;
  align-items: center;
  gap: 12px;
  height: calc(100% - 24px);
}

.pie-chart {
  flex: 1 1 auto;
  height: 232px;
}

.vue-chart-tooltip-wrap {
  position: relative;
}

.pie-tooltip-wrap {
  flex: 1 1 auto;
  height: 232px;
}

.rank-tooltip-wrap {
  height: 206px;
}

.combo-tooltip-wrap {
  height: 180px;
}

.vue-chart-tooltip {
  position: absolute;
  z-index: 20;
  min-width: 220px;
  max-width: 300px;
  padding: 10px 12px;
  border-radius: 10px;
  background: rgba(17, 24, 39, 0.94);
  color: #fff;
  font-size: 12px;
  line-height: 1.6;
  pointer-events: none;
  box-shadow: 0 14px 30px rgba(15, 23, 42, 0.24);
}

.tooltip-title {
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 800;
}

.tooltip-row {
  display: flex;
  align-items: center;
  gap: 7px;
  white-space: nowrap;
}

.tooltip-dot {
  width: 8px;
  height: 8px;
  flex-shrink: 0;
  border-radius: 999px;
}

.pie-legend {
  width: 176px;
  height: 232px;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
}

.pie-legend-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.pie-legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  min-height: 18px;
  font-size: 12px;
  color: #334155;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  flex: none;
}

.legend-name {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.legend-pager {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  color: #64748b;
  font-size: 12px;
}

.legend-arrow {
  border: none;
  background: transparent;
  color: #0f9f9a;
  cursor: pointer;
  padding: 0 2px;
}

.legend-arrow:disabled {
  color: #cbd5e1;
  cursor: not-allowed;
}

.rank-nav {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 6px;
}

.rank-chart {
  height: 206px;
}

.combo-section {
  flex: none;
  height: 218px;
}

.combo-chart {
  height: 180px;
}

.summary-card {
  flex: none;
  height: 128px;
  overflow: hidden;
  border: none;
  background: #eef2f5;
  box-shadow: none;
}

.summary-list {
  margin: 0;
  padding-left: 18px;
  display: flex;
  flex-direction: column;
  gap: 6px;
  line-height: 1.35;
  font-size: 13px;
  color: #334155;
}

.summary-list li {
  list-style: disc;
}

:deep(.el-card__header) {
  padding: 10px 14px 0;
  border-bottom: none;
}

:deep(.el-card__body) {
  padding: 10px 14px 12px;
}

:deep(.metric-card .el-card__body) {
  padding: 0;
  height: 100%;
}

:deep(.el-pagination.is-background .el-pager li.is-active) {
  background-color: #16c2a3;
  color: #fff;
}

:deep(.rank-nav .el-pagination) {
  --el-pagination-button-height: 24px;
  --el-pagination-button-width: 24px;
  gap: 2px;
}

:deep(.rank-nav .btn-prev),
:deep(.rank-nav .btn-next),
:deep(.rank-nav .el-pager li) {
  min-width: 24px;
  height: 24px;
  border-radius: 4px;
  font-size: 12px;
}

:deep(.rank-nav .btn-prev),
:deep(.rank-nav .btn-next) {
  color: #6b7280;
  background: #fff;
  border: 1px solid #e5e7eb;
}

:deep(.rank-nav .el-pager li) {
  color: #6b7280;
  background: #f3f4f6;
}

:deep(.rank-nav .btn-prev:hover),
:deep(.rank-nav .btn-next:hover),
:deep(.rank-nav .el-pager li:hover) {
  color: #16c2a3;
}

:deep(.el-pagination button:hover) {
  color: #16c2a3;
}
</style>

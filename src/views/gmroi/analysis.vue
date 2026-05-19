<template>
  <div class="p-2 gmroi-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div>
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">GMROI(年毛利回报率)分析</span>
            <el-button link type="primary" class="detail-link" @click="handleViewDetail">详情 &gt;</el-button>
          </div>
        </div>
        <div class="page-actions">
          <span class="unit-text">金额单位：元</span>
          <el-button class="export-btn" circle title="导出" @click="handleExport">
            <el-icon><Download /></el-icon>
          </el-button>
        </div>
      </div>
    </el-card>

    <el-alert
      v-if="!sessionReady"
      class="mb-[12px]"
      type="info"
      :closable="false"
      :title="`诊断预计算中，当前阶段：${statusState?.currentStage || 'WAIT_PRECOMPUTE'}`"
      :description="`进度 ${formatPercent(statusState?.progressPercent)}，页面会自动刷新。`"
      show-icon
    />

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="14" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期GMROI四象限图</span>
            </div>
          </template>
          <div class="gmroi-scatter-chart-wrap">
            <div ref="scatterChartRef" class="chart-box large-chart" />
            <div v-if="quadrantTooltip.visible" class="gmroi-quadrant-tooltip" :style="{ left: `${quadrantTooltip.x}px`, top: `${quadrantTooltip.y}px` }">
              <div class="gmroi-quadrant-tooltip-title">{{ quadrantTooltip.title }}</div>
              <ul class="gmroi-quadrant-tooltip-list">
                <li v-for="item in quadrantTooltip.items" :key="item">{{ item }}</li>
              </ul>
            </div>
          </div>
        </el-card>
      </el-col>
      <el-col :lg="10" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="card-title">本期GMROI区间SKU数统计</span>
            </div>
          </template>
          <div ref="pieChartRef" class="chart-box small-chart" />
        </el-card>
        <el-card shadow="hover" class="page-card chart-card mt-[12px]" v-loading="loading">
          <template #header>
            <div class="card-header">
              <span class="card-title">四象限异动变化SKU数统计</span>
            </div>
          </template>
          <el-table :data="changeRows" border class="change-table">
            <el-table-column label="对比日期" prop="label" min-width="170" align="center" />
            <el-table-column v-for="column in changeColumns" :key="column.key" :label="column.label" :prop="column.key" min-width="110" align="center">
              <template #default="{ row }">
                <el-button
                  link
                  type="primary"
                  class="change-count-link"
                  :disabled="!isChangeCellClickable(row, column)"
                  @click="handleChangeCellClick(row, column)"
                >
                  {{ formatInteger(row[column.key]) }}
                </el-button>
              </template>
            </el-table-column>
          </el-table>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card chart-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">四象限SKU占比变化统计</span>
        </div>
      </template>
      <div class="gmroi-bar-chart-wrap" @mousemove="handleBarTooltipMousemove" @mouseleave="hideBarTooltip">
        <div ref="barChartRef" class="chart-box medium-chart" />
        <div v-if="barTooltip.visible" class="gmroi-bar-tooltip" :style="{ left: `${barTooltip.x}px`, top: `${barTooltip.y}px` }">
          <div class="gmroi-bar-tooltip-title">{{ barTooltip.title }}</div>
          <div v-for="item in barTooltip.rows" :key="item.name" class="gmroi-bar-tooltip-row">
            <span class="gmroi-bar-tooltip-dot" :style="{ background: item.color }" />
            <span class="gmroi-bar-tooltip-name">{{ item.name }}</span>
            <span class="gmroi-bar-tooltip-value">{{ item.value }}</span>
          </div>
        </div>
      </div>
    </el-card>

    <el-card shadow="hover" class="page-card summary-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">总结与建议</span>
        </div>
      </template>
      <div class="summary-box">
        <ul class="summary-list">
          <li>该品类存在问题商品(低毛利率低周转){{ formatInteger(skuPerState.currentSku_3 || skuNumState.sku_3 || 0) }}个，占比{{ formatPercent(skuPerState.currentSkuPer_3 || skuNumState.skuPer_3 || 0) }}，建议重点关注，可结合其他异常带分析及用户需求进行末位淘汰</li>
          <li>存在由对比周期的第一象限降为本期较差象限的商品{{ formatInteger((skuChangeState.sku_2 || 0) + (skuChangeState.sku_3 || 0) + (skuChangeState.sku_4 || 0)) }}个，请加以关注和分析!</li>
          <li>存在GMROI<=1的商品{{ formatInteger(skuNumState.sku_1 || 0) }}个，该类商品具有经营风险，请加以关注!</li>
          <li>点击GMROI四象限名称可查看对应的商品策略!</li>
        </ul>
      </div>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { Download } from '@element-plus/icons-vue';
import { getDiagnosisSessionStatus } from '@/api/category/diagnosis';
import { getGmroiFourQuadrant, getGmroiSkuChange, getGmroiSkuNum, getGmroiSkuPer } from '@/api/gmroi';
import type { GmroiQuadrantItemVO, GmroiQuadrantVO } from '@/api/gmroi/types';

interface GmroiSkuNumState {
  sku_1?: number;
  sku_2?: number;
  sku_3?: number;
  sku_4?: number;
  skuPer_1?: number;
  skuPer_2?: number;
  skuPer_3?: number;
  skuPer_4?: number;
}

interface GmroiSkuPerState {
  currentSkuPer_1?: number;
  currentSkuPer_2?: number;
  currentSkuPer_3?: number;
  currentSku_3?: number;
  currentSkuPer_4?: number;
  compareSkuPer_1?: number;
  compareSkuPer_2?: number;
  compareSkuPer_3?: number;
  compareSkuPer_4?: number;
}

interface GmroiSkuChangeState {
  sku_2?: number;
  sku_3?: number;
  sku_4?: number;
  gmroiType?: number;
  num?: number;
}

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => String(route.query.sessionId || ''));
const scatterChartRef = ref<HTMLDivElement>();
const pieChartRef = ref<HTMLDivElement>();
const barChartRef = ref<HTMLDivElement>();
const scatterChartIns = ref<echarts.ECharts>();
const pieChartIns = ref<echarts.ECharts>();
const barChartIns = ref<echarts.ECharts>();
const statusState = ref<any>();
const quadrantState = ref<GmroiQuadrantVO>({ list: [] });
const skuNumState = ref<GmroiSkuNumState>({});
const skuPerState = ref<GmroiSkuPerState>({});
const skuChangeState = ref<GmroiSkuChangeState>({});
const loading = ref(false);
const barTooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  rows: [] as Array<{ name: string; value: string; color: string }>
});
const quadrantTooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  title: '',
  items: [] as string[]
});

const sessionReady = computed(() => Boolean(statusState.value?.ready));

const quadrantPointColor = '#f97316';
const quadrantLabels = [
  {
    id: 'sleep',
    text: '沉睡商品\n(高毛低周转)',
    title: '沉睡商品(高毛低周转)',
    x: '18%',
    y: '12%',
    tips: ['核查定价', '核查陈列', '增加促销', '增加关联销售']
  },
  {
    id: 'success',
    text: '成功商品\n(高毛高周转)',
    title: '成功商品(高毛高周转)',
    x: '68%',
    y: '12%',
    tips: ['保持销售优势', '维持重点陈列', '稳定库存供给', '关注竞争变化']
  },
  {
    id: 'problem',
    text: '问题商品\n(低毛低周转)',
    title: '问题商品(低毛低周转)',
    x: '18%',
    y: '72%',
    tips: ['核查定价', '核查陈列', '减少补货', '末位淘汰出局']
  },
  {
    id: 'attract',
    text: '吸客商品\n(低毛高周转)',
    title: '吸客商品(低毛高周转)',
    x: '68%',
    y: '72%',
    tips: ['核查定价', '优化毛利', '控制促销力度', '增加关联销售']
  }
];

const pieItems = computed(() => [
  { name: 'GMROI<=1', value: Number(skuNumState.value.sku_1 || 0), color: '#21b7a8' },
  { name: '1<GMROI<=2', value: Number(skuNumState.value.sku_2 || 0), color: '#f59e0b' },
  { name: '2<GMROI<=3', value: Number(skuNumState.value.sku_3 || 0), color: '#8b5cf6' },
  { name: 'GMROI>3', value: Number(skuNumState.value.sku_4 || 0), color: '#ef4444' }
]);

const changeRows = computed(() => [
  {
    label: '成功商品(对比日期)',
    compareGmroi: '1',
    sleep: Number(skuChangeState.value.sku_2 || 0),
    attract: Number(skuChangeState.value.sku_4 || 0),
    problem: Number(skuChangeState.value.sku_3 || 0)
  }
]);

const changeColumns = [
  { key: 'sleep', label: '沉睡商品', currentGmroi: '2' },
  { key: 'attract', label: '吸客商品', currentGmroi: '4' },
  { key: 'problem', label: '问题商品', currentGmroi: '3' }
] as const;

const barSeriesData = computed(() => [
  { name: '成功商品', color: '#21b7a8', data: [Number(skuPerState.value.currentSkuPer_1 || 0), Number(skuPerState.value.compareSkuPer_1 || 0)] },
  { name: '沉睡商品', color: '#f59e0b', data: [Number(skuPerState.value.currentSkuPer_2 || 0), Number(skuPerState.value.compareSkuPer_2 || 0)] },
  { name: '吸客商品', color: '#8b5cf6', data: [Number(skuPerState.value.currentSkuPer_4 || 0), Number(skuPerState.value.compareSkuPer_4 || 0)] },
  { name: '问题商品', color: '#ef4444', data: [Number(skuPerState.value.currentSkuPer_3 || 0), Number(skuPerState.value.compareSkuPer_3 || 0)] }
]);

const formatInteger = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num.toLocaleString('zh-CN', { maximumFractionDigits: 0 }) : '0';
};

const formatPercent = (value: unknown) => `${Number(value || 0).toFixed(2)}%`;

const hideBarTooltip = () => {
  barTooltip.visible = false;
};

const hideQuadrantTooltip = () => {
  quadrantTooltip.visible = false;
};

const showQuadrantTooltip = (event: any, item: (typeof quadrantLabels)[number]) => {
  const chartWidth = scatterChartRef.value?.clientWidth || 0;
  const chartHeight = scatterChartRef.value?.clientHeight || 0;
  const tooltipWidth = 188;
  const tooltipHeight = 168;
  const offsetX = Number(event?.event?.offsetX ?? 0);
  const offsetY = Number(event?.event?.offsetY ?? 0);

  quadrantTooltip.visible = true;
  quadrantTooltip.title = item.title;
  quadrantTooltip.items = item.tips;
  quadrantTooltip.x = Math.min(Math.max(12, offsetX + 14), Math.max(12, chartWidth - tooltipWidth - 12));
  quadrantTooltip.y = Math.min(Math.max(12, offsetY + 14), Math.max(12, chartHeight - tooltipHeight - 12));
};

const handleBarTooltipMousemove = (event: MouseEvent) => {
  const wrap = event.currentTarget as HTMLElement;
  const rect = wrap.getBoundingClientRect();
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left) / Math.max(rect.width, 1)));
  const dataIndex = ratio < 0.5 ? 0 : 1;
  const tooltipWidth = 220;
  const tooltipHeight = 170;

  barTooltip.visible = true;
  barTooltip.title = dataIndex === 0 ? '本期' : '对比日期';
  barTooltip.rows = barSeriesData.value.map((item) => ({
    name: item.name,
    value: formatPercent(item.data[dataIndex]),
    color: item.color
  }));
  barTooltip.x = Math.min(Math.max(12, event.clientX - rect.left + 14), Math.max(12, rect.width - tooltipWidth - 12));
  barTooltip.y = Math.min(Math.max(12, event.clientY - rect.top - 86), Math.max(12, rect.height - tooltipHeight - 12));
};

const formatPointLabel = (item: GmroiQuadrantItemVO) => {
  return item.productName || item.productNo || '--';
};

const resolveAxisRange = (values: number[], center: number) => {
  const finiteValues = values.filter((value) => Number.isFinite(value));
  const maxValue = Math.max(0, center, ...finiteValues);
  return {
    min: 0,
    max: Math.max(1, Number((maxValue * 1.12).toFixed(2)))
  };
};

const renderScatter = () => {
  if (!scatterChartRef.value) return;
  scatterChartIns.value ||= echarts.init(scatterChartRef.value);
  const points = (quadrantState.value.list || []).map((item) => [Number(item.turnoverRate || 0), Number(item.grossRate || 0), formatPointLabel(item)]);
  const xCenter = Number(quadrantState.value.turnoverRate || 0);
  const yCenter = Number(quadrantState.value.grossRate || 0);
  const xRange = resolveAxisRange(points.map((item) => Number(item[0])), xCenter);
  scatterChartIns.value.setOption(
    {
      tooltip: {
        trigger: 'item',
        appendToBody: true,
        confine: false,
        formatter: (params: any) => `${params.data[2]}<br/>年库存周转率：${Number(params.data[0] || 0).toFixed(2)}<br/>毛利率%：${Number(params.data[1] || 0).toFixed(2)}`
      },
      grid: { left: 56, right: 30, top: 46, bottom: 48 },
      xAxis: {
        type: 'value',
        name: '年库存周转率',
        min: xRange.min,
        max: xRange.max,
        splitNumber: 5,
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisTick: { show: false }
      },
      yAxis: {
        type: 'value',
        name: '毛利率%',
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } },
        axisLine: { lineStyle: { color: '#cbd5e1' } },
        axisTick: { show: false }
      },
      graphic: quadrantLabels.map((item) => ({
        id: `gmroi-quadrant-${item.id}`,
        type: 'text',
        left: item.x,
        top: item.y,
        cursor: 'help',
        z: 10,
        onmousemove: (event: any) => showQuadrantTooltip(event, item),
        onmouseout: hideQuadrantTooltip,
        style: {
          text: item.text,
          fill: '#64748b',
          fontSize: 12,
          fontWeight: 600,
          lineHeight: 18,
          align: 'center'
        }
      })),
      series: [
        {
          type: 'scatter',
          symbolSize: 12,
          itemStyle: { color: quadrantPointColor, opacity: 0.72 },
          emphasis: {
            itemStyle: {
              color: '#ea580c',
              opacity: 0.95,
              borderColor: '#ffedd5',
              borderWidth: 2
            }
          },
          data: points,
          markLine: {
            silent: true,
            symbol: 'none',
            lineStyle: { color: '#94a3b8', type: 'solid', width: 1.2 },
            data: [{ xAxis: xCenter }, { yAxis: yCenter }]
          }
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderPie = () => {
  if (!pieChartRef.value) return;
  pieChartIns.value ||= echarts.init(pieChartRef.value);
  pieChartIns.value.setOption(
    {
      tooltip: { trigger: 'item', appendToBody: true, confine: false, formatter: (params: any) => `${params.name}<br/>SKU：${formatInteger(params.value)}` },
      legend: { bottom: 0, icon: 'circle', itemWidth: 10, itemHeight: 10 },
      color: pieItems.value.map((item) => item.color),
      series: [
        {
          type: 'pie',
          radius: ['58%', '78%'],
          center: ['50%', '44%'],
          avoidLabelOverlap: true,
          label: { show: false },
          labelLine: { show: false },
          data: pieItems.value.map((item) => ({ name: item.name, value: item.value, itemStyle: { color: item.color } }))
        }
      ]
    } as EChartsOption,
    true
  );
};

const renderBar = () => {
  if (!barChartRef.value) return;
  barChartIns.value ||= echarts.init(barChartRef.value);
  barChartIns.value.setOption(
    {
      tooltip: { show: false },
      legend: { top: 0, icon: 'roundRect' },
      grid: { left: 48, right: 24, top: 48, bottom: 30 },
      xAxis: { type: 'category', data: ['本期', '对比日期'] },
      yAxis: {
        type: 'value',
        min: 0,
        max: 100,
        axisLabel: { formatter: '{value}%' },
        splitLine: { lineStyle: { color: '#e5e7eb', type: 'dashed' } }
      },
      series: barSeriesData.value.map((item) => ({
        name: item.name,
        type: 'bar',
        stack: 'gmroi',
        barWidth: 32,
        itemStyle: { color: item.color },
        data: item.data
      }))
    } as EChartsOption,
    true
  );
};

const loadData = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const [statusRes, quadrantRes, skuNumRes, skuPerRes, skuChangeRes] = await Promise.all([
      getDiagnosisSessionStatus(sessionId.value),
      getGmroiFourQuadrant(sessionId.value),
      getGmroiSkuNum(sessionId.value),
      getGmroiSkuPer(sessionId.value),
      getGmroiSkuChange(sessionId.value)
    ]);
    statusState.value = statusRes.data;
    quadrantState.value = quadrantRes.result || { list: [] };
    skuNumState.value = skuNumRes.result || {};
    skuPerState.value = skuPerRes.result || {};
    skuPerState.value.currentSku_3 = Number((skuPerRes.result as any)?.currentSku_3 || 0);
    skuChangeState.value = skuChangeRes.result || {};
    await nextTick();
    renderScatter();
    renderPie();
    renderBar();
  } finally {
    loading.value = false;
  }
};

const goGmroiDetail = (extraQuery: Record<string, string> = {}) => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法查看 GMROI 商品明细');
    return;
  }
  router.push({ path: '/gmroi/analysis/detail', query: { ...route.query, ...extraQuery } });
};

const handleViewDetail = () => {
  goGmroiDetail();
};

const isChangeCellClickable = (row: Record<string, unknown>, column: (typeof changeColumns)[number]) => {
  const value = Number(row[column.key] || 0);
  return Number.isFinite(value) && value > 0;
};

const handleChangeCellClick = (row: Record<string, unknown>, column: (typeof changeColumns)[number]) => {
  if (!isChangeCellClickable(row, column)) {
    return;
  }
  goGmroiDetail({
    compareGmroi: String(row.compareGmroi || '1'),
    currentGmroi: column.currentGmroi
  });
};

const handleExport = () => {
  ElMessage.info('导出功能保持不变');
};

const resize = () => {
  scatterChartIns.value?.resize();
  pieChartIns.value?.resize();
  barChartIns.value?.resize();
};

watch(
  () => route.query.sessionId,
  async () => {
    await loadData();
  }
);

onMounted(async () => {
  await loadData();
  window.addEventListener('resize', resize);
});

onBeforeUnmount(() => {
  window.removeEventListener('resize', resize);
  scatterChartIns.value?.dispose();
  pieChartIns.value?.dispose();
  barChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.gmroi-analysis-page {
  min-height: calc(100vh - 84px);
  background: #f5f7fa;
}

.page-card {
  border: 1px solid var(--el-border-color-light);
  box-shadow: 0 2px 8px rgb(15 23 42 / 4%);
}

.header-card,
.chart-row,
.table-card,
.summary-card {
  margin-bottom: 12px;
}

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 12px;
}

.page-title-wrap {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-wrap: wrap;
}

.page-title-line {
  width: 3px;
  height: 16px;
  background: var(--el-color-primary);
  border-radius: 999px;
}

.page-title {
  font-size: 20px;
  font-weight: 700;
}

.detail-link {
  padding: 0;
}

.page-subtitle,
.unit-text {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.export-btn {
  background: #fff;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.card-title {
  font-size: 15px;
  font-weight: 600;
}

.chart-box {
  width: 100%;
}

.gmroi-scatter-chart-wrap {
  position: relative;
}

.large-chart {
  height: 500px;
}

.small-chart {
  height: 320px;
}

.medium-chart {
  height: 360px;
}

.gmroi-bar-chart-wrap {
  position: relative;
}

.gmroi-bar-tooltip {
  position: absolute;
  z-index: 20;
  min-width: 208px;
  padding: 14px 16px;
  border: 1px solid rgba(229, 231, 235, 0.92);
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.97);
  box-shadow: 0 14px 34px rgba(15, 23, 42, 0.16);
  color: #555;
  pointer-events: none;
}

.gmroi-bar-tooltip-title {
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 600;
}

.gmroi-bar-tooltip-row {
  display: grid;
  grid-template-columns: 12px 1fr auto;
  align-items: center;
  gap: 8px;
  min-height: 26px;
  font-size: 14px;
}

.gmroi-bar-tooltip-dot {
  width: 10px;
  height: 10px;
  border-radius: 999px;
}

.gmroi-bar-tooltip-value {
  font-weight: 700;
  color: #666;
}

.gmroi-quadrant-tooltip {
  position: absolute;
  z-index: 30;
  width: 176px;
  padding: 12px 14px;
  border-radius: 8px;
  background: rgba(76, 76, 76, 0.78);
  box-shadow: 0 14px 32px rgb(15 23 42 / 18%);
  color: #fff;
  pointer-events: none;
}

.gmroi-quadrant-tooltip-title {
  margin-bottom: 8px;
  font-size: 15px;
  font-weight: 700;
  line-height: 1.4;
}

.gmroi-quadrant-tooltip-list {
  margin: 0;
  padding-left: 18px;
  font-size: 14px;
  line-height: 1.65;
}

.gmroi-quadrant-tooltip-list li::marker {
  color: #fff;
}

.change-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.change-table :deep(.cell) {
  text-align: center;
}

.summary-box {
  background: #f3f4f6;
  border-radius: 12px;
  padding: 18px 20px;
}

.summary-list {
  margin: 0;
  padding-left: 18px;
  color: #475569;
  line-height: 1.9;
}
</style>

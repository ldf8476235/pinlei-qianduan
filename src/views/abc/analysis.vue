<template>
  <div class="p-2 abc-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div class="page-header-left">
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">ABC结构分析</span>
          </div>
          <div class="title-row">
            <span class="category-title">{{ summaryInfo.categoryName }}</span>
            <el-tag effect="plain" type="success" class="role-tag">本期角色：{{ summaryInfo.currentRole }}</el-tag>
          </div>
          <div class="sku-hint">预设SKU数：<strong>{{ summaryInfo.presetSkuCount }}</strong></div>
        </div>
        <div class="page-actions">
          <el-button link type="primary" @click="handleViewDetail">详情</el-button>
          <el-button link type="primary" @click="openSettingDialog">ABC定义设置</el-button>
        </div>
      </div>
    </el-card>

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">ABC变化图谱</span>
            </div>
          </template>
          <div ref="trendChartRef" class="chart-box" />
        </el-card>
      </el-col>

      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card">
          <template #header>
            <div class="card-header">
              <span class="card-title">ABC变化矩阵</span>
            </div>
          </template>
          <div class="matrix-layout">
            <div class="matrix-table-wrap">
              <el-table :data="matrixRows" border class="matrix-table">
                <el-table-column label="类别" min-width="72" align="center">
                  <template #default="{ row }">
                    <span :class="{ 'is-total': row.isTotal }">{{ row.label }}</span>
                  </template>
                </el-table-column>
                <el-table-column v-for="column in matrixColumns" :key="column.key" :label="column.label" min-width="76" align="center">
                  <template #default="{ row }">
                    <div class="matrix-cell" :class="[resolveMatrixClass(row.key, column.key), { 'is-total': row.isTotal || column.isTotal }]">
                      {{ formatMatrixValue(row[column.key]) }}
                    </div>
                  </template>
                </el-table-column>
              </el-table>
            </div>

            <div class="matrix-legend">
              <div class="legend-title">状态图例</div>
              <div v-for="item in matrixLegend" :key="item.label" class="legend-item">
                <span class="legend-dot" :style="{ backgroundColor: item.color }" />
                <span class="legend-label">{{ item.label }}</span>
              </div>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">ABC定义设定明细</span>
          <el-button type="primary" link @click="handleExport">导出</el-button>
        </div>
      </template>

      <el-table :data="detailRows" border stripe class="detail-table">
        <el-table-column label="类别" min-width="90" align="left" fixed="left">
          <template #default="{ row }">{{ row.category }}</template>
        </el-table-column>
        <el-table-column label="综合业绩占比" min-width="120" align="right">
          <template #default="{ row }">{{ formatPercent(row.performanceShare) }}</template>
        </el-table-column>
        <el-table-column label="综合业绩" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.performanceValue) }}</template>
        </el-table-column>
        <el-table-column label="SKU占比" min-width="110" align="right">
          <template #default="{ row }">{{ formatPercent(row.skuShare) }}</template>
        </el-table-column>
        <el-table-column label="理论SKU" min-width="100" align="right">
          <template #default="{ row }">{{ formatNumber(row.theorySku, 0) }}</template>
        </el-table-column>
        <el-table-column label="实际SKU" min-width="100" align="right">
          <template #default="{ row }">{{ formatNumber(row.actualSku, 0) }}</template>
        </el-table-column>
        <el-table-column label="【本期】占比" min-width="110" align="right">
          <template #default="{ row }">{{ formatPercent(row.currentInventoryShare) }}</template>
        </el-table-column>
        <el-table-column label="【本期】库存数量" min-width="130" align="right">
          <template #default="{ row }">{{ formatNumber(row.currentInventoryQty, 0) }}</template>
        </el-table-column>
        <el-table-column label="【本期】占比" min-width="110" align="right">
          <template #default="{ row }">{{ formatPercent(row.currentPromotionShare) }}</template>
        </el-table-column>
        <el-table-column label="【本期】促销SKU" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.currentPromotionSku, 0) }}</template>
        </el-table-column>
        <el-table-column label="【本期】实际SKU" min-width="120" align="right">
          <template #default="{ row }">{{ formatNumber(row.currentActualSku, 0) }}</template>
        </el-table-column>
        <el-table-column label="【本期】占比" min-width="110" align="right">
          <template #default="{ row }">{{ formatPercent(row.currentActualShare) }}</template>
        </el-table-column>
        <el-table-column label="【对比日期】实际SKU" min-width="140" align="right">
          <template #default="{ row }">{{ formatNumber(row.compareActualSku, 0) }}</template>
        </el-table-column>
        <el-table-column label="【对比日期】占比" min-width="130" align="right">
          <template #default="{ row }">{{ formatPercent(row.compareActualShare) }}</template>
        </el-table-column>
        <el-table-column label="【实际SKU对比变化】" min-width="150" align="right">
          <template #default="{ row }">
            <span :class="changeClass(row.actualSkuChange)">{{ formatSignedNumber(row.actualSkuChange, 0) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="hover" class="page-card advice-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">总结与建议</span>
        </div>
      </template>

      <ol class="advice-list">
        <li>
          <strong>A类占比合理建议：</strong>
          维持高贡献核心SKU稳定供应，优先确保头部品牌与高复购单品不断档，保持A类结构稳定。
        </li>
        <li>
          <strong>B类占比合理建议：</strong>
          B类建议承担结构承接功能，结合促销和动销效率持续筛选可上探A类的潜力SKU。
        </li>
        <li>
          <strong>C类/AC/BC品项分析建议：</strong>
          对C类低效SKU优先做淘汰与替换评估，对跨层迁移品项结合库存、促销和门店反馈做专项复盘。
        </li>
      </ol>
    </el-card>

    <el-dialog v-model="settingDialogVisible" title="ABC定义设置" width="760px" destroy-on-close>
      <div class="setting-tip">最多支持添加3种ABC类型！</div>

      <div class="setting-tab-tools">
        <el-button type="primary" plain size="small" :disabled="settingTabs.length >= 3" @click="handleAddTab">新增ABC类型</el-button>
      </div>

      <el-tabs v-model="activeTabKey" type="card" closable @tab-remove="handleRemoveTab">
        <el-tab-pane v-for="item in settingTabs" :key="item.key" :label="item.label" :name="item.key" />
      </el-tabs>

      <el-form :model="activeSettingForm" label-width="130px" class="setting-form">
        <el-form-item label="类型选择" required>
          <el-select v-model="activeSettingForm.type" style="width: 100%">
            <el-option label="销售额ABC" value="sales_abc" />
            <el-option label="毛利额ABC" value="gross_abc" />
            <el-option label="销售量ABC" value="quantity_abc" />
          </el-select>
        </el-form-item>

        <div class="setting-grid">
          <el-form-item label="A类业绩占比" required>
            <el-input-number v-model="activeSettingForm.performanceA" :min="0" :max="100" :precision="2" :step="1" controls-position="right" />
            <span class="unit-suffix">%</span>
          </el-form-item>
          <el-form-item label="B类业绩占比" required>
            <el-input-number v-model="activeSettingForm.performanceB" :min="0" :max="100" :precision="2" :step="1" controls-position="right" />
            <span class="unit-suffix">%</span>
          </el-form-item>
          <el-form-item label="C类业绩占比" required>
            <el-input-number v-model="activeSettingForm.performanceC" :min="0" :max="100" :precision="2" :step="1" controls-position="right" />
            <span class="unit-suffix">%</span>
          </el-form-item>
          <el-form-item label="A类SKU占比" required>
            <el-input-number v-model="activeSettingForm.skuA" :min="0" :max="100" :precision="2" :step="1" controls-position="right" />
            <span class="unit-suffix">%</span>
          </el-form-item>
          <el-form-item label="B类SKU占比" required>
            <el-input-number v-model="activeSettingForm.skuB" :min="0" :max="100" :precision="2" :step="1" controls-position="right" />
            <span class="unit-suffix">%</span>
          </el-form-item>
          <el-form-item label="C类SKU占比" required>
            <el-input-number v-model="activeSettingForm.skuC" :min="0" :max="100" :precision="2" :step="1" controls-position="right" />
            <span class="unit-suffix">%</span>
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="settingDialogVisible = false">取消</el-button>
          <el-button type="primary" @click="handleSaveSettings">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="AbcAnalysis" lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';

interface TrendPoint {
  skuShare: number;
  performanceShare: number;
}

interface TrendSeriesItem {
  name: string;
  color: string;
  points: TrendPoint[];
}

interface MatrixColumn {
  key: 'a' | 'b' | 'c' | 'slash' | 'current' | 'compare';
  label: string;
  isTotal?: boolean;
}

interface MatrixRow {
  key: string;
  label: string;
  a: string | number | null;
  b: string | number | null;
  c: string | number | null;
  slash: string | number | null;
  current: string | number | null;
  compare: string | number | null;
  isTotal?: boolean;
}

interface DetailRow {
  category: string;
  performanceShare: number;
  performanceValue: number;
  skuShare: number;
  theorySku: number;
  actualSku: number;
  currentInventoryShare: number;
  currentInventoryQty: number;
  currentPromotionShare: number;
  currentPromotionSku: number;
  currentActualSku: number;
  currentActualShare: number;
  compareActualSku: number;
  compareActualShare: number;
  actualSkuChange: number;
}

interface SummaryInfo {
  categoryCode: string;
  categoryName: string;
  currentRole: string;
  presetSkuCount: number;
}

interface AbcSettingTab {
  key: string;
  label: string;
  type: string;
  performanceA: number;
  performanceB: number;
  performanceC: number;
  skuA: number;
  skuB: number;
  skuC: number;
}

interface GoodsConfigSource {
  summary: SummaryInfo;
  matrixRows: MatrixRow[];
  detailRows: DetailRow[];
  trends: TrendSeriesItem[];
}

const route = useRoute();
const router = useRouter();

const trendChartRef = ref<HTMLDivElement>();
const trendChartIns = ref<echarts.ECharts>();

const trendColorMap = {
  current: '#4ecdc4',
  compare: '#ff6b4a',
  setting: '#e53e3e'
};

const abcNodes = ref([
  { label: 'A类', x: 10 },
  { label: 'B类', x: 40 },
  { label: 'C类', x: 100 }
]);

const summaryInfo = reactive<SummaryInfo>({
  categoryCode: '004',
  categoryName: '004洗化部（一级品类）',
  currentRole: '结构品类',
  presetSkuCount: 132
});

const matrixColumns: MatrixColumn[] = [
  { key: 'a', label: 'A类' },
  { key: 'b', label: 'B类' },
  { key: 'c', label: 'C类' },
  { key: 'slash', label: '/' },
  { key: 'current', label: '本期', isTotal: true },
  { key: 'compare', label: '对比日期', isTotal: true }
];

const matrixLegend = [
  { label: '建议淘汰', color: '#fde2e0' },
  { label: '考虑淘汰', color: '#fdebd2' },
  { label: '保持观察', color: '#e1efff' },
  { label: '继续保留', color: '#eceff3' }
];

const matrixRows = ref<MatrixRow[]>([]);
const detailRows = ref<DetailRow[]>([]);
const trendSeries = ref<TrendSeriesItem[]>([]);

const settingDialogVisible = ref(false);
const settingTabs = ref<AbcSettingTab[]>([]);
const activeTabKey = ref('');
const createSettingTab = (index: number): AbcSettingTab => ({
  key: `tab-${Date.now()}-${index}`,
  label: `ABC类型${index}`,
  type: 'sales_abc',
  performanceA: 50,
  performanceB: 40,
  performanceC: 10,
  skuA: 10,
  skuB: 30,
  skuC: 60
});

const ensureTabsInitialized = () => {
  if (settingTabs.value.length) return;
  settingTabs.value = [createSettingTab(1)];
  activeTabKey.value = settingTabs.value[0].key;
};

const activeSettingForm = computed(() => {
  ensureTabsInitialized();
  return settingTabs.value.find((item) => item.key === activeTabKey.value) || settingTabs.value[0];
});

const buildMockDataBySetting = (setting: AbcSettingTab): GoodsConfigSource => {
  const presetSkuCount = 132;
  const actualSkuA = 12;
  const actualSkuB = 34;
  const actualSkuC = 89;
  const theoreticalSkuA = Math.round((presetSkuCount * setting.skuA) / 100);
  const theoreticalSkuB = Math.round((presetSkuCount * setting.skuB) / 100);
  const theoreticalSkuC = presetSkuCount - theoreticalSkuA - theoreticalSkuB;
  const totalPerformance = 1319240;
  const performanceA = Number(((totalPerformance * setting.performanceA) / 100).toFixed(0));
  const performanceB = Number(((totalPerformance * setting.performanceB) / 100).toFixed(0));
  const performanceC = totalPerformance - performanceA - performanceB;

  return {
    summary: {
      categoryCode: '004',
      categoryName: '004洗化部（一级品类）',
      currentRole: '结构品类',
      presetSkuCount
    },
    matrixRows: [
      { key: 'a', label: 'A类', a: 8, b: 3, c: 1, slash: '-', current: actualSkuA, compare: 11 },
      { key: 'b', label: 'B类', a: 2, b: 26, c: 6, slash: '-', current: actualSkuB, compare: 36 },
      { key: 'c', label: 'C类', a: '-', b: 4, c: 82, slash: 3, current: actualSkuC, compare: 85 },
      { key: 'slash', label: '/', a: '-', b: '-', c: 1, slash: '-', current: 1, compare: '-' },
      { key: 'total', label: '总计', a: 10, b: 33, c: 90, slash: 3, current: 136, compare: 132, isTotal: true }
    ],
    detailRows: [
      {
        category: 'A类',
        performanceShare: setting.performanceA,
        performanceValue: performanceA,
        skuShare: setting.skuA,
        theorySku: theoreticalSkuA,
        actualSku: actualSkuA,
        currentInventoryShare: 25.8,
        currentInventoryQty: 1820,
        currentPromotionShare: 18.2,
        currentPromotionSku: 6,
        currentActualSku: actualSkuA,
        currentActualShare: Number(((actualSkuA / 136) * 100).toFixed(2)),
        compareActualSku: 11,
        compareActualShare: 8.33,
        actualSkuChange: actualSkuA - 11
      },
      {
        category: 'B类',
        performanceShare: setting.performanceB,
        performanceValue: performanceB,
        skuShare: setting.skuB,
        theorySku: theoreticalSkuB,
        actualSku: actualSkuB,
        currentInventoryShare: 41.5,
        currentInventoryQty: 2930,
        currentPromotionShare: 37.9,
        currentPromotionSku: 14,
        currentActualSku: actualSkuB,
        currentActualShare: Number(((actualSkuB / 136) * 100).toFixed(2)),
        compareActualSku: 36,
        compareActualShare: 27.27,
        actualSkuChange: actualSkuB - 36
      },
      {
        category: 'C类',
        performanceShare: setting.performanceC,
        performanceValue: performanceC,
        skuShare: setting.skuC,
        theorySku: theoreticalSkuC,
        actualSku: actualSkuC,
        currentInventoryShare: 32.7,
        currentInventoryQty: 2316,
        currentPromotionShare: 43.9,
        currentPromotionSku: 21,
        currentActualSku: actualSkuC,
        currentActualShare: Number(((actualSkuC / 136) * 100).toFixed(2)),
        compareActualSku: 85,
        compareActualShare: 64.39,
        actualSkuChange: actualSkuC - 85
      }
    ],
    trends: [
      {
        name: '本期',
        color: trendColorMap.current,
        points: [
          { skuShare: 0, performanceShare: 0 },
          { skuShare: Number(setting.skuA.toFixed(2)), performanceShare: Number((setting.performanceA + 12).toFixed(2)) },
          { skuShare: Number((setting.skuA + setting.skuB).toFixed(2)), performanceShare: Number((setting.performanceA + setting.performanceB + 3).toFixed(2)) },
          { skuShare: 100, performanceShare: 100 }
        ]
      },
      {
        name: '对比日期',
        color: trendColorMap.compare,
        points: [
          { skuShare: 0, performanceShare: 0 },
          { skuShare: Number(setting.skuA.toFixed(2)), performanceShare: Number((setting.performanceA + 6).toFixed(2)) },
          { skuShare: Number((setting.skuA + setting.skuB).toFixed(2)), performanceShare: Number((setting.performanceA + setting.performanceB + 1).toFixed(2)) },
          { skuShare: 100, performanceShare: 100 }
        ]
      },
      {
        name: '设定',
        color: trendColorMap.setting,
        points: [
          { skuShare: 0, performanceShare: 0 },
          { skuShare: Number(setting.skuA.toFixed(2)), performanceShare: Number(setting.performanceA.toFixed(2)) },
          { skuShare: Number((setting.skuA + setting.skuB).toFixed(2)), performanceShare: Number((setting.performanceA + setting.performanceB).toFixed(2)) },
          { skuShare: 100, performanceShare: 100 }
        ]
      }
    ]
  };
};

const applyAnalysisData = (payload: GoodsConfigSource) => {
  Object.assign(summaryInfo, payload.summary);
  matrixRows.value = payload.matrixRows;
  detailRows.value = payload.detailRows;
  trendSeries.value = payload.trends;
  abcNodes.value = [
    { label: 'A类', x: activeSettingForm.value.skuA },
    { label: 'B类', x: Number((activeSettingForm.value.skuA + activeSettingForm.value.skuB).toFixed(2)) },
    { label: 'C类', x: 100 }
  ];
};

const loadAnalysisData = async () => {
  ensureTabsInitialized();
  const response = buildMockDataBySetting(activeSettingForm.value);
  // TODO: replace with real backend request for ABC analysis.
  applyAnalysisData(response);
  await nextTick();
  renderTrendChart();
};

const openSettingDialog = () => {
  ensureTabsInitialized();
  settingDialogVisible.value = true;
};

const handleAddTab = () => {
  if (settingTabs.value.length >= 3) {
    ElMessage.warning('最多支持添加3种ABC类型');
    return;
  }
  const nextIndex = settingTabs.value.length + 1;
  const newTab = createSettingTab(nextIndex);
  settingTabs.value.push(newTab);
  activeTabKey.value = newTab.key;
};

const handleRemoveTab = (targetKey: string | number) => {
  if (settingTabs.value.length <= 1) {
    ElMessage.warning('至少保留1种ABC类型');
    return;
  }
  const target = String(targetKey);
  const currentIndex = settingTabs.value.findIndex((item) => item.key === target);
  settingTabs.value = settingTabs.value.filter((item) => item.key !== target).map((item, index) => ({
    ...item,
    label: `ABC类型${index + 1}`
  }));
  const fallback = settingTabs.value[currentIndex] || settingTabs.value[currentIndex - 1] || settingTabs.value[0];
  activeTabKey.value = fallback.key;
};

const validateTab = (tab: AbcSettingTab) => {
  const performanceTotal = Number((tab.performanceA + tab.performanceB + tab.performanceC).toFixed(2));
  const skuTotal = Number((tab.skuA + tab.skuB + tab.skuC).toFixed(2));
  if (performanceTotal !== 100) {
    return `${tab.label} 的业绩占比总和必须为100%`;
  }
  if (skuTotal !== 100) {
    return `${tab.label} 的SKU占比总和必须为100%`;
  }
  return '';
};

const handleSaveSettings = async () => {
  ensureTabsInitialized();
  const errorMessage = settingTabs.value.map(validateTab).find(Boolean);
  if (errorMessage) {
    ElMessage.error(errorMessage);
    return;
  }
  // TODO: replace with real backend save request for ABC settings.
  settingDialogVisible.value = false;
  await loadAnalysisData();
  ElMessage.success('ABC定义设置已更新');
};

const handleViewDetail = () => {
  router.push({
    path: '/abc/analysis/detail',
    query: {
      ...route.query
    }
  });
};

const handleExport = () => {
  // TODO: replace with RuoYi native download integration after backend API is ready.
  ElMessage.info('导出入口已预留，后续可直接接若依原生导出逻辑');
};

const initTrendChart = () => {
  if (!trendChartRef.value) return;
  if (!trendChartIns.value) {
    trendChartIns.value = echarts.init(trendChartRef.value);
  }
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
        const axisValue = Number(rows[0]?.axisValue || 0).toFixed(2);
        return rows
          .map((item) => `${item.marker}${item.seriesName}：SKU占比 ${axisValue}% / 业绩占比 ${Number(item.value ?? 0).toFixed(2)}%`)
          .join('<br/>');
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
      right: 26,
      top: 50,
      bottom: 42
    },
    xAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        lineStyle: {
          color: '#dcdfe6'
        }
      },
      axisLabel: {
        color: '#606266',
        formatter: (value: number) => `${value.toFixed(2)}%`
      },
      name: 'SKU占比',
      nameTextStyle: {
        color: '#909399'
      }
    },
    yAxis: {
      type: 'value',
      min: 0,
      max: 100,
      axisLine: {
        show: false
      },
      axisLabel: {
        color: '#606266',
        formatter: (value: number) => `${value}%`
      },
      splitLine: {
        lineStyle: {
          color: '#ebeef5'
        }
      },
      name: '综合业绩占比',
      nameTextStyle: {
        color: '#909399'
      }
    },
    series: trendSeries.value.map((item) => ({
      name: item.name,
      type: 'line',
      smooth: true,
      symbol: 'circle',
      symbolSize: 7,
      data: item.points.map((point) => [point.skuShare, point.performanceShare]),
      lineStyle: {
        width: item.name === '设定' ? 2.5 : 2,
        type: item.name === '设定' ? 'dashed' : 'solid',
        color: item.color
      },
      itemStyle: {
        color: item.color,
        borderColor: '#fff',
        borderWidth: 1
      },
      areaStyle: item.name === '设定'
        ? undefined
        : {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: `${item.color}55` },
              { offset: 1, color: `${item.color}10` }
            ])
          },
      markLine: {
        symbol: 'none',
        label: {
          show: true,
          position: 'insideEndTop',
          color: '#e53e3e',
          formatter: (params: any) => params.name
        },
        lineStyle: {
          color: '#e53e3e',
          type: 'dashed',
          width: 1
        },
        data: item.name === '设定'
          ? abcNodes.value.map((node) => ({
              xAxis: node.x,
              name: `${node.label}（${node.x.toFixed(2)}%）`
            }))
          : []
      }
    }))
  };

  trendChartIns.value.setOption(option, true);
};

const resolveMatrixClass = (rowKey: string, columnKey: string) => {
  if (rowKey === 'total' || columnKey === 'current' || columnKey === 'compare') return 'is-neutral';
  if ((rowKey === 'c' && columnKey === 'a') || (rowKey === 'slash' && columnKey === 'c')) return 'is-danger';
  if ((rowKey === 'c' && columnKey === 'b') || (rowKey === 'b' && columnKey === 'c')) return 'is-warning';
  if ((rowKey === 'b' && columnKey === 'a') || (rowKey === 'a' && columnKey === 'b')) return 'is-info';
  return 'is-keep';
};

const formatMatrixValue = (value: string | number | null) => {
  if (value === null || value === undefined || value === '') return '-';
  return value;
};

const formatNumber = (value: number | string | null | undefined, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
};

const formatPercent = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  return `${num.toFixed(2)}%`;
};

const formatSignedNumber = (value: number | string | null | undefined, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '-';
  const fixed = num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
  return num > 0 ? `+${fixed}` : fixed;
};

const changeClass = (value: number) => {
  if (value > 0) return 'change-text is-up';
  if (value < 0) return 'change-text is-down';
  return 'change-text is-flat';
};

const resizeChart = () => trendChartIns.value?.resize();

onMounted(async () => {
  ensureTabsInitialized();
  await loadAnalysisData();
  window.addEventListener('resize', resizeChart);
});

onUnmounted(() => {
  window.removeEventListener('resize', resizeChart);
  trendChartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.abc-analysis-page {
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

.page-header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 16px;
}

.page-header-left {
  display: flex;
  flex-direction: column;
  gap: 10px;
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

.title-row {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.category-title {
  font-size: 18px;
  font-weight: 700;
  color: var(--el-text-color-primary);
}

.role-tag {
  width: fit-content;
}

.sku-hint {
  font-size: 13px;
  color: var(--el-text-color-secondary);
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
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

.matrix-layout {
  display: grid;
  grid-template-columns: minmax(0, 1fr) 124px;
  gap: 16px;
  align-items: start;
}

.matrix-table-wrap {
  overflow-x: auto;
}

.matrix-table :deep(.el-table__header th),
.detail-table :deep(.el-table__header th) {
  background: #f8fafc;
  color: var(--el-text-color-primary);
  font-weight: 600;
}

.matrix-table :deep(.cell) {
  padding: 0;
}

.detail-table :deep(.cell) {
  font-size: 13px;
}

.matrix-cell {
  padding: 12px 8px;
  font-size: 13px;
  color: var(--el-text-color-primary);
}

.matrix-cell.is-danger {
  background: #fde2e0;
}

.matrix-cell.is-warning {
  background: #fdebd2;
}

.matrix-cell.is-info {
  background: #e1efff;
}

.matrix-cell.is-keep {
  background: #eceff3;
}

.matrix-cell.is-neutral {
  background: #f8fafc;
  font-weight: 600;
}

.matrix-cell.is-total,
.is-total {
  font-weight: 700;
}

.matrix-legend {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 14px 12px;
  background: #fff;
}

.legend-title {
  font-size: 13px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 13px;
  color: var(--el-text-color-regular);
  margin-bottom: 10px;
}

.legend-item:last-child {
  margin-bottom: 0;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  flex-shrink: 0;
}

.detail-table :deep(.el-table__body td) {
  color: var(--el-text-color-regular);
}

.change-text {
  font-weight: 600;
}

.change-text.is-up {
  color: var(--el-color-success);
}

.change-text.is-down {
  color: var(--el-color-danger);
}

.change-text.is-flat {
  color: var(--el-text-color-secondary);
}

.advice-list {
  margin: 0;
  padding-left: 18px;
  color: var(--el-text-color-regular);
  line-height: 1.9;
  font-size: 14px;
}

.advice-list li + li {
  margin-top: 10px;
}

.setting-tip {
  margin-bottom: 12px;
  color: #f56c6c;
  font-size: 13px;
  font-weight: 600;
}

.setting-tab-tools {
  display: flex;
  justify-content: flex-end;
  margin-bottom: 10px;
}

.setting-form {
  margin-top: 8px;
}

.setting-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 4px 18px;
}

.setting-grid :deep(.el-form-item__content) {
  display: flex;
  align-items: center;
  gap: 8px;
}

.unit-suffix {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
  }

  .page-actions {
    width: 100%;
    justify-content: flex-start;
  }

  .chart-box {
    height: 320px;
  }

  .matrix-layout,
  .setting-grid {
    grid-template-columns: 1fr;
  }
}
</style>

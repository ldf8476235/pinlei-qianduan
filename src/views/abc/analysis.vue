<template>
  <div class="p-2 abc-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div>
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">ABC结构分析</span>
          </div>
        </div>
        <div class="page-actions">
          <el-tabs v-model="activeAbcType" class="type-tabs" type="card" @tab-change="handleAbcTypeChange">
            <el-tab-pane v-for="item in typeOptions" :key="item.value" :name="item.value" :label="item.label" />
          </el-tabs>
          <span class="unit-text">金额单位：元</span>
          <el-button link type="primary" @click="handleViewDetail">详情</el-button>
          <el-button link type="primary" :disabled="editableParams.length === 0" @click="openSettingDialog">ABC定义设置</el-button>
          <el-button type="primary" plain circle class="export-btn" title="导出">
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
      :description="`进度 ${formatPercent(statusState?.progressPercent)}%，页面会自动刷新。`"
      show-icon
    />

    <el-row :gutter="12" class="chart-row">
      <el-col :lg="10" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="chartLoading">
          <template #header>
            <div class="card-header">
              <span class="card-title">ABC变化图谱</span>
            </div>
          </template>
          <div ref="imageChartRef" class="chart-box" />
        </el-card>
      </el-col>

      <el-col :lg="14" :md="24" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="matrixLoading">
          <template #header>
            <div class="card-header">
              <span class="card-title">ABC变化矩阵</span>
            </div>
          </template>
          <div class="matrix-wrap">
            <div class="matrix-table-wrap">
              <table class="matrix-table">
                <thead>
                  <tr>
                    <th class="matrix-head matrix-head--left" colspan="2" rowspan="2">对比变化</th>
                    <th class="matrix-head matrix-head--top" colspan="3">本期</th>
                  </tr>
                  <tr>
                    <th v-for="column in matrixColumns" :key="column.key" class="matrix-head matrix-head--sub">{{ column.label }}</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="(row, rowIndex) in matrixRows" :key="row.rowKey">
                    <th v-if="rowIndex === 0" class="matrix-side-title" :rowspan="matrixRows.length">对比日期</th>
                    <th class="matrix-row-label">{{ row.label }}</th>
                    <td v-for="column in matrixColumns" :key="`${row.rowKey}-${column.key}`" class="matrix-data-cell">
                      <button
                        type="button"
                        class="matrix-value"
                        :class="[
                          resolveMatrixCellClass(row.rowKey, column.key, row[column.key]),
                          { 'matrix-value--link': isMatrixCellClickable(row.rowKey, column.key, row[column.key]) }
                        ]"
                        :title="buildMatrixCellTitle(row.rowKey, column.key, row[column.key])"
                        :disabled="!isMatrixCellClickable(row.rowKey, column.key, row[column.key])"
                        @click="handleMatrixCellClick(row.rowKey, column.key, row[column.key])"
                      >
                        {{ formatNumber(row[column.key], 0) }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
            <div class="matrix-legend">
              <span><i class="legend-dot danger" />建议淘汰</span>
              <span><i class="legend-dot warning" />考虑淘汰</span>
              <span><i class="legend-dot stable" />保持观察</span>
              <span><i class="legend-dot info" />继续保留</span>
            </div>
          </div>
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="page-card table-card" v-loading="detailsLoading">
      <template #header>
        <div class="card-header">
          <span class="card-title">ABC定义设定明细</span>
        </div>
      </template>
      <el-table :data="detailDisplayRows" border stripe class="detail-table">
        <el-table-column label="类别" min-width="90" align="center" prop="abcTypeName">
          <template #default="{ row }">
            <span class="category-cell">{{ row.abcTypeName }}</span>
          </template>
        </el-table-column>
        <el-table-column label="ABC定义设定" align="center">
          <el-table-column label="销售额占比" min-width="110" align="right">
            <template #default="{ row }">{{ formatPercent(row.setSalesPer) }}</template>
          </el-table-column>
          <el-table-column label="销售额" min-width="120" align="right">
            <template #default="{ row }">{{ formatNumber(row.setSales, 2) }}</template>
          </el-table-column>
          <el-table-column label="SKU占比" min-width="110" align="right">
            <template #default="{ row }">{{ formatPercent(row.setSkuPer) }}</template>
          </el-table-column>
          <el-table-column label="理论SKU" min-width="100" align="right">
            <template #default="{ row }">{{ formatNumber(row.setSku, 2) }}</template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="本期分组" align="center">
          <el-table-column label="实际SKU" min-width="110" align="right">
            <template #default="{ row }">
              <button type="button" class="sku-link" @click="handleBucketSkuClick(row, 'current')">
                {{ formatNumber(row.currentSku, 2) }}
              </button>
            </template>
          </el-table-column>
          <el-table-column label="占比" min-width="110" align="right">
            <template #default="{ row }">{{ formatPercent(row.currentSkuPer) }}</template>
          </el-table-column>
          <el-table-column label="库存数量" min-width="110" align="right">
            <template #default="{ row }">{{ formatNumber(row.stockQuantity, 2) }}</template>
          </el-table-column>
          <el-table-column label="占比" min-width="110" align="right">
            <template #default="{ row }">{{ formatPercent(row.stockQuantityPer) }}</template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="对比日期分组" align="center">
          <el-table-column label="促销SKU" min-width="110" align="right">
            <template #default="{ row }">{{ formatNumber(row.compareSku, 2) }}</template>
          </el-table-column>
          <el-table-column label="实际SKU" min-width="110" align="right">
            <template #default="{ row }">
              <button type="button" class="sku-link" @click="handleBucketSkuClick(row, 'compare')">
                {{ formatNumber(row.compareSku, 2) }}
              </button>
            </template>
          </el-table-column>
          <el-table-column label="占比" min-width="110" align="right">
            <template #default="{ row }">{{ formatPercent(row.compareSkuPer) }}</template>
          </el-table-column>
        </el-table-column>
        <el-table-column label="实际SKU对比变化" min-width="120" align="right">
          <template #default="{ row }">
            <span :class="changeClass(Number(row.changeSku || 0))">{{ formatSignedNumber(row.changeSku, 2) }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>

    <el-card shadow="hover" class="page-card summary-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">总结与建议</span>
        </div>
      </template>
      <div class="summary-box">
        <ul class="summary-list">
          <li v-for="line in summaryLines" :key="line">{{ line }}</li>
        </ul>
      </div>
    </el-card>

    <el-dialog v-model="settingDialogVisible" title="ABC定义设置" width="760px" destroy-on-close>
      <el-tabs v-model="activeEditType" type="card">
        <el-tab-pane
          v-for="item in editableParams"
          :key="item.abcType"
          :name="item.abcType"
          :label="item.abcTypeName"
        />
      </el-tabs>

      <el-form v-if="activeEditableItem" label-width="130px" class="setting-form">
        <el-form-item label="ABC类型">
          <el-input :model-value="activeEditableItem.abcTypeName" disabled />
        </el-form-item>

        <div v-if="activeEditableItem.abcType === 'contribution'" class="setting-grid">
          <el-form-item label="销售额占比">
            <el-input-number v-model="activeEditableItem.salesPer" :min="0" :max="1" :step="0.01" :precision="2" />
          </el-form-item>
          <el-form-item label="毛利额占比">
            <el-input-number v-model="activeEditableItem.grossPer" :min="0" :max="1" :step="0.01" :precision="2" />
          </el-form-item>
          <el-form-item label="销量占比">
            <el-input-number v-model="activeEditableItem.salesQuantityPer" :min="0" :max="1" :step="0.01" :precision="2" />
          </el-form-item>
        </div>

        <div class="setting-grid">
          <el-form-item label="A类阈值">
            <el-input-number v-model="activeEditableItem.arate" :min="0" :max="100" :step="1" :precision="2" />
          </el-form-item>
          <el-form-item label="B类阈值">
            <el-input-number v-model="activeEditableItem.brate" :min="0" :max="100" :step="1" :precision="2" />
          </el-form-item>
          <el-form-item label="C类阈值">
            <el-input-number v-model="activeEditableItem.crate" :min="0" :max="100" :step="1" :precision="2" />
          </el-form-item>
          <el-form-item label="A类SKU占比">
            <el-input-number v-model="activeEditableItem.askuRate" :min="0" :max="100" :step="1" :precision="2" />
          </el-form-item>
          <el-form-item label="B类SKU占比">
            <el-input-number v-model="activeEditableItem.bskuRate" :min="0" :max="100" :step="1" :precision="2" />
          </el-form-item>
          <el-form-item label="C类SKU占比">
            <el-input-number v-model="activeEditableItem.cskuRate" :min="0" :max="100" :step="1" :precision="2" />
          </el-form-item>
        </div>
      </el-form>

      <template #footer>
        <div class="dialog-footer">
          <el-button @click="settingDialogVisible = false">取消</el-button>
          <el-button type="primary" :loading="saveLoading" @click="handleSaveSettings">确定</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup lang="ts">
import * as echarts from 'echarts';
import type { EChartsOption } from 'echarts';
import { Download } from '@element-plus/icons-vue';
import { getDiagnosisSessionStatus } from '@/api/category/diagnosis';
import {
  getAbcDetails,
  getAbcImage,
  getAbcMatrix,
  getAbcParams,
  updateAbcParams
} from '@/api/category/abc';
import type {
  AbcDetailsItemVO,
  AbcImageItemVO,
  AbcMatrixVO,
  AbcParamUpdateItemVO,
  AbcTypeParamVO
} from '@/api/category/abc/types';

type ImageMetricType = 'sales' | 'sku';
type MatrixColumnKey = 'a' | 'b' | 'c';
type BucketDrillMode = 'current' | 'compare';

interface MatrixRowVO {
  rowKey: string;
  label: string;
  a: number;
  b: number;
  c: number;
  total: number;
}

const route = useRoute();
const router = useRouter();

const imageChartRef = ref<HTMLDivElement>();
const imageChartIns = ref<echarts.ECharts>();
const pollTimer = ref<number | null>(null);

const statusState = ref<any>();
const paramsSnapshot = ref<AbcTypeParamVO[]>([]);
const editableParams = ref<AbcParamUpdateItemVO[]>([]);
const imageRows = ref<AbcImageItemVO[]>([]);
const matrixState = ref<AbcMatrixVO>({});
const detailRows = ref<AbcDetailsItemVO[]>([]);

const chartLoading = ref(false);
const matrixLoading = ref(false);
const detailsLoading = ref(false);
const saveLoading = ref(false);
const settingDialogVisible = ref(false);

const imageMetric = ref<ImageMetricType>('sales');
const activeAbcType = ref('');
const activeEditType = ref('');

const sessionId = computed(() => String(route.query.sessionId || ''));
const sessionReady = computed(() => Boolean(statusState.value?.ready));

const typeOptions = computed(() =>
  paramsSnapshot.value.map((item) => ({
    label: item.abcTypeName || item.abcType,
    value: item.abcType
  }))
);

const activeEditableItem = computed<AbcParamUpdateItemVO | undefined>(() =>
  editableParams.value.find((item) => item.abcType === activeEditType.value)
);

const detailDisplayRows = computed(() => {
  const orderMap: Record<string, number> = { B: 0, C: 1, A: 2 };
  const resolveTypeName = (value: string) => {
    const code = String(value || '').toUpperCase();
    if (code.includes('B')) return 'B类';
    if (code.includes('C')) return 'C类';
    return 'A类';
  };
  return [...detailRows.value].sort((left, right) => {
    const leftName = String(left.abcType || '').toUpperCase();
    const rightName = String(right.abcType || '').toUpperCase();
    const leftKey = leftName.includes('B') ? 'B' : leftName.includes('C') ? 'C' : 'A';
    const rightKey = rightName.includes('B') ? 'B' : rightName.includes('C') ? 'C' : 'A';
    return orderMap[leftKey] - orderMap[rightKey];
  }).map((item) => ({
    ...item,
    abcTypeName: item.abcTypeName || resolveTypeName(item.abcType)
  }));
});

const summaryLines = computed(() => {
  const matrix = matrixState.value || {};
  const ccCount = Number(matrix.ccNum || 0);
  const acBcCount = Number(matrix.caNum || 0) + Number(matrix.cbNum || 0);
  return [
    buildSkuShareSummary('A'),
    buildSkuShareSummary('B'),
    `存在CC商品${formatInteger(ccCount)}个，建议将其中近似品优先淘汰，可结合其他异常品项分析法及用户需求进行末位淘汰。`,
    `存在AC和BC品${formatInteger(acBcCount)}个，需进一步分析确认是否需要淘汰。`
  ];
});

const matrixColumns = [
  { key: 'a', label: 'A类' },
  { key: 'b', label: 'B类' },
  { key: 'c', label: 'C类' }
] as const;

const matrixRows = computed<MatrixRowVO[]>(() => {
  const matrix = matrixState.value || {};
  return [
    {
      rowKey: 'A',
      label: 'A类',
      a: Number(matrix.aaNum || 0),
      b: Number(matrix.baNum || 0),
      c: Number(matrix.caNum || 0),
      total: Number(matrix.atNum || 0)
    },
    {
      rowKey: 'B',
      label: 'B类',
      a: Number(matrix.abNum || 0),
      b: Number(matrix.bbNum || 0),
      c: Number(matrix.cbNum || 0),
      total: Number(matrix.btNum || 0)
    },
    {
      rowKey: 'C',
      label: 'C类',
      a: Number(matrix.acNum || 0),
      b: Number(matrix.bcNum || 0),
      c: Number(matrix.ccNum || 0),
      total: Number(matrix.ctNum || 0)
    },
    {
      rowKey: 'N',
      label: '/',
      a: Number(matrix.anNum || 0),
      b: Number(matrix.bnNum || 0),
      c: Number(matrix.cnNum || 0),
      total: Number(matrix.anNum || 0) + Number(matrix.bnNum || 0) + Number(matrix.cnNum || 0)
    },
    {
      rowKey: 'TOTAL',
      label: '总计',
      a: Number(matrix.atNum || 0),
      b: Number(matrix.btNum || 0),
      c: Number(matrix.ctNum || 0),
      total: Number(matrix.atNum || 0) + Number(matrix.btNum || 0) + Number(matrix.ctNum || 0)
    }
  ];
});

const syncEditableParams = (rows: AbcTypeParamVO[]) => {
  editableParams.value = rows.map((item) => ({
    abcType: item.abcType,
    abcTypeName: item.abcTypeName,
    salesPer: toNumber(item.salesPer),
    grossPer: toNumber(item.grossPer),
    salesQuantityPer: toNumber(item.salesQuantityPer),
    arate: toNumber(item.arate),
    brate: toNumber(item.brate),
    crate: toNumber(item.crate),
    askuRate: toNumber(item.askuRate),
    bskuRate: toNumber(item.bskuRate),
    cskuRate: toNumber(item.cskuRate)
  }));
  if (!activeEditType.value && editableParams.value.length > 0) {
    activeEditType.value = editableParams.value[0].abcType;
  }
};

const initChart = () => {
  if (!imageChartRef.value) return;
  if (!imageChartIns.value) {
    imageChartIns.value = echarts.init(imageChartRef.value);
  }
};

const renderImageChart = () => {
  initChart();
  if (!imageChartIns.value) return;
  const source = imageRows.value.length ? imageRows.value : [];
  const skuValues = source.map((item) => percentValue(item.currentSkuPer ?? item.setSkuPer));
  const compareSkuValues = source.map((item) => percentValue(item.compareSkuPer ?? item.setSkuPer));
  const salesValues = source.map((item) => percentValue(item.currentSalesPer ?? item.setSalesPer));
  const compareSalesValues = source.map((item) => percentValue(item.compareSalesPer ?? item.setSalesPer));
  const setSkuValues = source.map((item) => percentValue(item.setSkuPer));
  const setSalesValues = source.map((item) => percentValue(item.setSalesPer));
  const cumulative = (list: number[]) => {
    let sum = 0;
    const total = list.reduce((acc, value) => acc + Number(value || 0), 0) || 1;
    return list.map((value) => {
      sum += Number(value || 0);
      return Number(((sum / total) * 100).toFixed(2));
    });
  };
  const xCurrent = cumulative(skuValues);
  const xCompare = cumulative(compareSkuValues);
  const xSet = cumulative(setSkuValues);
  const currentSalesCum = cumulative(salesValues);
  const compareSalesCum = cumulative(compareSalesValues);
  const setSalesCum = cumulative(setSalesValues);
  const buildPoint = (
    item: AbcImageItemVO | undefined,
    skuPercent: number,
    salesPercent: number,
    categorySkuPercent: number,
    categorySalesPercent: number
  ) => ({
    value: [skuPercent, salesPercent],
    abcType: item?.abcType || '--',
    skuPercent: categorySkuPercent,
    salesPercent: categorySalesPercent
  });
  const formatTooltipPercent = (value: unknown) => `${Number(value || 0).toFixed(2)}%`;
  const option: EChartsOption = {
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove|click',
      appendToBody: true,
      confine: true,
      backgroundColor: 'rgba(255,255,255,0.96)',
      borderColor: '#e5e7eb',
      borderWidth: 1,
      padding: [12, 14],
      textStyle: {
        color: '#4b5563',
        fontSize: 14,
        lineHeight: 22
      },
      extraCssText: 'box-shadow: 0 12px 30px rgba(15,23,42,.16); border-radius: 8px;',
      formatter: (params: any) => {
        const data = params?.data || {};
        const value = Array.isArray(data.value) ? data.value : [0, 0];
        const color = params?.color || '#f97316';
        return [
          `<div style="font-size:15px;font-weight:600;margin-bottom:8px;color:#6b7280;">${data.abcType || '--'}</div>`,
          `<div style="display:flex;align-items:center;gap:8px;margin-bottom:6px;"><span style="width:10px;height:10px;border-radius:50%;background:${color};display:inline-block;"></span><span>${params?.seriesName || '--'}</span></div>`,
          `<div>销售额占比：${formatTooltipPercent(data.salesPercent)}</div>`,
          `<div>SKU占比：${formatTooltipPercent(data.skuPercent)}</div>`,
          `<div style="color:#9ca3af;margin-top:6px;">累计：${formatTooltipPercent(value[1])} / ${formatTooltipPercent(value[0])}</div>`
        ].join('');
      }
    },
    axisPointer: {
      show: true,
      type: 'cross',
      lineStyle: {
        type: 'dashed',
        color: '#9ca3af'
      },
      label: {
        show: true,
        formatter: (params: any) => `${Number(params.value || 0).toFixed(2)}%`,
        backgroundColor: '#6b7280'
      }
    },
    legend: { top: 0, data: ['本期', '对比日期', '设定基准'] },
    grid: { left: 52, right: 24, top: 42, bottom: 42 },
    xAxis: {
      type: 'value',
      name: 'SKU累计占比',
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { type: 'dashed', color: '#dbe4ea' } }
    },
    yAxis: {
      type: 'value',
      name: '销售额累计占比',
      axisLabel: { formatter: '{value}%' },
      splitLine: { lineStyle: { type: 'dashed', color: '#dbe4ea' } }
    },
    series: [
      {
        name: '本期',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: true,
        itemStyle: { color: '#1ca29b' },
        lineStyle: { width: 2.5, color: '#1ca29b' },
        emphasis: { focus: 'series', scale: true },
        data: xCurrent.map((x, i) => buildPoint(source[i], x, currentSalesCum[i], skuValues[i] ?? 0, salesValues[i] ?? 0))
      },
      {
        name: '对比日期',
        type: 'line',
        smooth: true,
        symbol: 'circle',
        symbolSize: 7,
        showSymbol: true,
        itemStyle: { color: '#f4c542' },
        lineStyle: { width: 2.5, color: '#f4c542' },
        emphasis: { focus: 'series', scale: true },
        data: xCompare.map((x, i) => buildPoint(source[i], x, compareSalesCum[i], compareSkuValues[i] ?? 0, compareSalesValues[i] ?? 0))
      },
      {
        name: '设定基准',
        type: 'line',
        smooth: false,
        symbol: 'circle',
        symbolSize: 6,
        showSymbol: true,
        itemStyle: { color: '#ef4444' },
        lineStyle: { width: 2, type: 'dashed', color: '#ef4444' },
        emphasis: { focus: 'series', scale: true },
        data: xSet.map((x, i) => buildPoint(source[i], x, setSalesCum[i], setSkuValues[i] ?? 0, setSalesValues[i] ?? 0))
      }
    ]
  };
  imageChartIns.value.setOption(option, true);
};

const loadParams = async () => {
  if (!sessionId.value) return;
  const res: any = await getAbcParams(sessionId.value);
  const rows = Array.isArray(res?.data) ? res.data : [];
  paramsSnapshot.value = rows;
  syncEditableParams(rows);
  if (!activeAbcType.value && rows.length > 0) {
    const routeType = String(route.query.abcType || '');
    activeAbcType.value = rows.some((item) => item.abcType === routeType) ? routeType : rows[0].abcType;
  }
};

const loadImage = async () => {
  if (!sessionId.value || !activeAbcType.value || !sessionReady.value) return;
  chartLoading.value = true;
  try {
    const res: any = await getAbcImage(sessionId.value, activeAbcType.value);
    imageRows.value = Array.isArray(res?.data) ? res.data : [];
    await nextTick();
    renderImageChart();
  } finally {
    chartLoading.value = false;
  }
};

const loadMatrix = async () => {
  if (!sessionId.value || !activeAbcType.value || !sessionReady.value) return;
  matrixLoading.value = true;
  try {
    const res: any = await getAbcMatrix(sessionId.value, activeAbcType.value);
    matrixState.value = res?.data || {};
  } finally {
    matrixLoading.value = false;
  }
};

const loadDetails = async () => {
  if (!sessionId.value || !activeAbcType.value || !sessionReady.value) return;
  detailsLoading.value = true;
  try {
    const res: any = await getAbcDetails(sessionId.value, activeAbcType.value);
    detailRows.value = Array.isArray(res?.data) ? res.data : [];
  } finally {
    detailsLoading.value = false;
  }
};

const loadReadyData = async () => {
  await loadParams();
  if (!activeAbcType.value) return;
  await Promise.all([loadImage(), loadMatrix(), loadDetails()]);
};

const clearPolling = () => {
  if (pollTimer.value != null) {
    window.clearTimeout(pollTimer.value);
    pollTimer.value = null;
  }
};

const schedulePolling = () => {
  clearPolling();
  pollTimer.value = window.setTimeout(async () => {
    await loadSessionState();
  }, 2000);
};

const loadSessionState = async () => {
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法加载 ABC 结构分析');
    return;
  }
  const res: any = await getDiagnosisSessionStatus(sessionId.value);
  statusState.value = res?.data;
  await loadParams();
  if (!statusState.value) return;
  if (statusState.value.ready) {
    clearPolling();
    await loadReadyData();
    return;
  }
  if (['FAILED', 'STOPPED'].includes(String(statusState.value.status || '').toUpperCase())) {
    clearPolling();
    return;
  }
  schedulePolling();
};

const handleAbcTypeChange = async (value: string) => {
  activeAbcType.value = value;
  await loadReadyData();
};

const openSettingDialog = () => {
  if (editableParams.value.length === 0) return;
  activeEditType.value = editableParams.value[0].abcType;
  settingDialogVisible.value = true;
};

const validateSettings = () => {
  for (const item of editableParams.value) {
    const performanceTotal = round2(item.arate) + round2(item.brate) + round2(item.crate);
    const skuTotal = round2(item.askuRate) + round2(item.bskuRate) + round2(item.cskuRate);
    if (Math.abs(performanceTotal - 100) > 0.001) {
      return `${item.abcTypeName} 的业绩占比总和必须等于 100`;
    }
    if (Math.abs(skuTotal - 100) > 0.001) {
      return `${item.abcTypeName} 的 SKU 占比总和必须等于 100`;
    }
    if (item.abcType === 'contribution') {
      const weightTotal = round2(item.salesPer) + round2(item.grossPer) + round2(item.salesQuantityPer);
      if (Math.abs(weightTotal - 1) > 0.001) {
        return `${item.abcTypeName} 的综合权重总和必须等于 1`;
      }
    }
  }
  return '';
};

const handleSaveSettings = async () => {
  const errorMessage = validateSettings();
  if (errorMessage) {
    ElMessage.error(errorMessage);
    return;
  }
  if (!sessionId.value) {
    ElMessage.error('缺少 sessionId，无法保存 ABC 参数');
    return;
  }
  saveLoading.value = true;
  try {
    const res: any = await updateAbcParams({
      sessionId: sessionId.value,
      abcList: editableParams.value
    });
    const response = res?.data || {};
    settingDialogVisible.value = false;
    paramsSnapshot.value = editableParams.value.map((item) => ({ ...item }));
    ElMessage.success(`ABC定义设置已提交，任务状态：${response.status || 'RUNNING'}，任务ID：${response.jobId || '--'}`);
    await loadSessionState();
  } finally {
    saveLoading.value = false;
  }
};

const handleViewDetail = () => {
  router.push({
    path: '/abc/analysis/detail',
    query: {
      ...route.query,
      abcType: activeAbcType.value
    }
  });
};

const normalizeBucketValue = (value?: string | null) => {
  const code = String(value || '').trim().toUpperCase();
  return code || 'NONE';
};

const matrixColumnToBucket = (columnKey: MatrixColumnKey) => {
  const map: Record<MatrixColumnKey, string> = { a: 'A', b: 'B', c: 'C' };
  return map[columnKey];
};

const matrixRowToBucket = (rowKey: string) => {
  if (rowKey === 'N') return 'NONE';
  if (rowKey === 'TOTAL') return '';
  return rowKey;
};

const hasMatrixStrategyValue = (value: number | string | null | undefined) => Number(value || 0) > 0;

const resolveMatrixCellClass = (rowKey: string, columnKey: MatrixColumnKey, value: number | string | null | undefined) => {
  if (!hasMatrixStrategyValue(value) || rowKey === 'TOTAL') {
    return '';
  }
  const currentAbc = matrixColumnToBucket(columnKey);
  const compareAbc = matrixRowToBucket(rowKey);
  if (compareAbc === 'NONE' && currentAbc === 'C') return 'is-stable';
  if ((compareAbc === 'A' || compareAbc === 'B') && currentAbc === 'C') return 'is-warning';
  if (compareAbc === 'C' && currentAbc === 'C') return 'is-danger';
  if (compareAbc === 'C' && currentAbc === 'B') return 'is-stable';
  return 'is-info';
};

const isMatrixCellClickable = (rowKey: string, _columnKey: MatrixColumnKey, value: number | string | null | undefined) => {
  return hasMatrixStrategyValue(value) && rowKey !== 'TOTAL';
};

const buildMatrixCellTitle = (rowKey: string, columnKey: MatrixColumnKey, value: number | string | null | undefined) => {
  const currentAbc = matrixColumnToBucket(columnKey);
  const compareAbc = matrixRowToBucket(rowKey);
  const compareLabel = compareAbc === 'NONE' ? '/' : compareAbc || '--';
  return `本期: ${currentAbc}，对比: ${compareLabel}，SKU数: ${formatNumber(value, 0)}`;
};

const navigateToGoodsList = (currentAbc?: string, compareAbc?: string) => {
  router.push({
    path: '/abc/analysis/detail',
    query: {
      ...route.query,
      sessionId: sessionId.value,
      abcType: activeAbcType.value,
      currentAbc: currentAbc || '',
      compareAbc: compareAbc || ''
    }
  });
};

const handleMatrixCellClick = (rowKey: string, columnKey: MatrixColumnKey, value: number | string | null | undefined) => {
  if (!isMatrixCellClickable(rowKey, columnKey, value)) return;
  navigateToGoodsList(matrixColumnToBucket(columnKey), matrixRowToBucket(rowKey));
};

const handleBucketSkuClick = (row: AbcDetailsItemVO, mode: BucketDrillMode) => {
  const bucket = normalizeBucketValue(row.abcType);
  if (bucket === 'NONE') return;
  if (mode === 'current') {
    navigateToGoodsList(bucket, '');
    return;
  }
  navigateToGoodsList('', bucket);
};

const findBucketDetail = (bucket: 'A' | 'B') => {
  return detailRows.value.find((row) => {
    const code = String(row.abcType || row.abcTypeName || '').trim().toUpperCase();
    return code === bucket || code.includes(bucket);
  });
};

const buildSkuShareSummary = (bucket: 'A' | 'B') => {
  const row = findBucketDetail(bucket);
  if (!row) {
    return `该品类${bucket}类品暂无占比数据，请等待诊断结果生成后复核。`;
  }

  const currentSkuPer = percentValue(row.currentSkuPer);
  const setSkuPer = percentValue(row.setSkuPer);
  const diff = currentSkuPer - setSkuPer;
  const tolerance = 2;
  if (Math.abs(diff) <= tolerance) {
    return `该品类${bucket}类品占比合理，本期SKU占比${formatPercent(row.currentSkuPer)}，设定占比${formatPercent(row.setSkuPer)}，请继续保持。`;
  }
  if (diff > 0) {
    return `该品类${bucket}类品占比偏高，本期SKU占比${formatPercent(row.currentSkuPer)}，高于设定占比${formatPercent(row.setSkuPer)}，建议复核分组阈值和商品结构。`;
  }
  return `该品类${bucket}类品占比偏低，本期SKU占比${formatPercent(row.currentSkuPer)}，低于设定占比${formatPercent(row.setSkuPer)}，建议关注核心商品覆盖是否不足。`;
};

const formatNumber = (value: number | string | null | undefined, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: digits >= 2 ? 2 : 0,
    maximumFractionDigits: digits
  });
};

const formatPercent = (value: number | string | null | undefined) => {
  const num = percentValue(value);
  return `${num.toFixed(2)}%`;
};

const formatInteger = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { maximumFractionDigits: 0 });
};

const formatRatio = (value: number | string | null | undefined) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  return num.toFixed(2);
};

const formatSignedNumber = (value: number | string | null | undefined, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  const text = num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
  return num > 0 ? `+${text}` : text;
};

const changeClass = (value: number) => {
  if (value > 0) return 'change-text is-up';
  if (value < 0) return 'change-text is-down';
  return 'change-text is-flat';
};

const toNumber = (value: unknown) => {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
};

const round2 = (value: unknown) => Number(toNumber(value).toFixed(2));

const percentValue = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return 0;
  return Math.abs(num) <= 1 ? num * 100 : num;
};

const resizeChart = () => imageChartIns.value?.resize();

onMounted(async () => {
  await loadSessionState();
  window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  clearPolling();
  window.removeEventListener('resize', resizeChart);
  imageChartIns.value?.dispose();
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
}

.page-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

.type-tabs {
  min-width: 420px;
}

.unit-text {
  color: var(--el-text-color-secondary);
  font-size: 13px;
  white-space: nowrap;
}

.export-btn {
  border-radius: 8px;
  width: 34px;
  height: 34px;
  padding: 0;
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

.legend-dot {
  display: inline-flex;
  width: 10px;
  height: 10px;
  border-radius: 50%;
  margin-right: 6px;
}

.legend-dot.stable { background: #9fcef0; }
.legend-dot.warning { background: #fde49c; }
.legend-dot.danger { background: #f6a5b4; }
.legend-dot.info {
  background: #fff;
  border: 1px solid #c7d2e5;
}

.matrix-wrap {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.matrix-table-wrap {
  overflow-x: auto;
}

.matrix-table {
  width: 100%;
  min-width: 500px;
  border-collapse: collapse;
  table-layout: fixed;
}

.matrix-head,
.matrix-row-label,
.matrix-side-title,
.matrix-data-cell {
  border: 1px solid #d7deeb;
}

.matrix-head {
  background: linear-gradient(180deg, #ffb35c 0%, #ff9738 100%);
  color: #723417;
  font-weight: 700;
  text-align: center;
  padding: 8px 6px;
}

.matrix-head--top {
  font-size: 15px;
}

.matrix-head--left,
.matrix-side-title {
  width: 52px;
}

.matrix-head--sub,
.matrix-row-label {
  font-size: 12px;
}

.matrix-side-title {
  background: linear-gradient(180deg, #ffb35c 0%, #ff9738 100%);
  color: #723417;
  font-weight: 700;
  text-align: center;
  writing-mode: vertical-rl;
  text-orientation: mixed;
  letter-spacing: 1px;
  padding: 6px 2px;
}

.matrix-row-label {
  background: linear-gradient(180deg, #ffb35c 0%, #ff9738 100%);
  color: #723417;
  font-weight: 700;
  text-align: center;
  padding: 8px 4px;
  width: 48px;
}

.matrix-data-cell {
  padding: 0;
  background: #fff;
  text-align: center;
}

.matrix-value {
  width: 100%;
  height: 100%;
  min-height: 44px;
  border: 0;
  background: transparent;
  color: #334155;
  font-size: 12px;
  font-weight: 500;
  cursor: default;
  transition: background-color .2s ease, color .2s ease, box-shadow .2s ease;
}

.matrix-value:disabled {
  opacity: 1;
}

.matrix-value.is-danger { background: #f8a9b6; color: #24334b; }
.matrix-value.is-warning { background: #fde8a3; color: #24334b; }
.matrix-value.is-stable { background: #a9d1ef; color: #24334b; }
.matrix-value.is-info { background: #fff; color: #24334b; }

.matrix-value--link {
  cursor: pointer;
  color: #ff6b00;
}

.matrix-value--link:hover {
  box-shadow: inset 0 0 0 2px rgba(255, 107, 0, 0.18);
}

.matrix-legend {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  align-items: center;
  font-size: 10px;
  color: var(--el-text-color-secondary);
}

.detail-table :deep(.el-table__header th) {
  background: #f2f5f8;
  font-weight: 600;
}

.category-cell {
  display: inline-block;
  min-width: 42px;
  text-align: center;
  font-weight: 600;
}

.summary-box {
  background: #f3f4f6;
  border-radius: 10px;
  padding: 16px 18px;
  color: #4b5563;
  line-height: 1.8;
}

.summary-list {
  margin: 0;
  padding-left: 20px;
}

.summary-list li + li {
  margin-top: 6px;
}

.param-grid {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
}

.param-item {
  border: 1px solid var(--el-border-color-light);
  border-radius: 8px;
  padding: 12px;
  background: #fff;
}

.param-name {
  font-size: 14px;
  font-weight: 600;
  color: var(--el-text-color-primary);
  margin-bottom: 8px;
}

.param-line {
  font-size: 13px;
  color: var(--el-text-color-regular);
  line-height: 1.8;
}

.setting-form {
  margin-top: 8px;
}

.setting-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 8px 18px;
}

.dialog-footer {
  display: flex;
  justify-content: flex-end;
  gap: 8px;
}

.change-text {
  font-weight: 600;
}

.change-text.is-up {
  color: var(--el-color-danger);
}

.change-text.is-down {
  color: var(--el-color-success);
}

.change-text.is-flat {
  color: var(--el-text-color-secondary);
}

.sku-link {
  border: 0;
  background: transparent;
  padding: 0;
  color: #0f766e;
  font-weight: 600;
  cursor: pointer;
}

.sku-link:hover {
  color: #0b5f5a;
}

@media (max-width: 992px) {
  .page-header {
    flex-direction: column;
  }

  .page-actions,
  .param-grid,
  .setting-grid {
    width: 100%;
    grid-template-columns: 1fr;
  }

  .type-select {
    width: 100%;
  }

  .chart-box {
    height: 320px;
  }

  .matrix-table {
    min-width: 460px;
  }
}

@media (max-width: 1400px) {
  .matrix-table {
    min-width: 480px;
  }

  .matrix-head--top {
    font-size: 14px;
  }

  .matrix-value {
    min-height: 40px;
    font-size: 11px;
  }
}
</style>

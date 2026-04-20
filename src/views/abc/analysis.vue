<template>
  <div class="p-2 abc-analysis-page">
    <el-card shadow="hover" class="page-card header-card">
      <div class="page-header">
        <div>
          <div class="page-title-wrap">
            <span class="page-title-line" />
            <span class="page-title">ABC结构分析</span>
          </div>
          <div class="page-subtitle">
            <span>sessionId: {{ sessionId || '--' }}</span>
            <span v-if="statusState?.dataVersion">版本: {{ statusState.dataVersion }}</span>
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
      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="chartLoading">
          <template #header>
            <div class="card-header">
              <span class="card-title">ABC变化图谱</span>
            </div>
          </template>
          <div ref="imageChartRef" class="chart-box" />
        </el-card>
      </el-col>

      <el-col :lg="12" :md="12" :sm="24" :xs="24">
        <el-card shadow="hover" class="page-card chart-card" v-loading="matrixLoading">
          <template #header>
            <div class="card-header">
              <span class="card-title">ABC变化矩阵</span>
            </div>
          </template>
          <div class="matrix-wrap">
            <el-table :data="matrixRows" border class="matrix-table">
              <el-table-column label="对比日期" min-width="120" align="center" fixed="left">
                <template #header>
                  <div class="matrix-header-stack">
                    <span>对比日期</span>
                    <span>对比变化</span>
                  </div>
                </template>
                <template #default="{ row }">
                  <span class="matrix-row-label">{{ row.label }}</span>
                </template>
              </el-table-column>
              <el-table-column label="本期" align="center">
                <el-table-column v-for="column in matrixColumns" :key="column.key" :label="column.label" min-width="86" align="center">
                  <template #default="{ row }">
                    <div class="matrix-cell" :class="resolveMatrixClass(row.rowKey, column.key)">
                      {{ formatNumber(row[column.key], 0) }}
                    </div>
                  </template>
                </el-table-column>
              </el-table-column>
            </el-table>
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
            <template #default="{ row }"><span class="sku-highlight">{{ formatNumber(row.currentSku, 2) }}</span></template>
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
            <template #default="{ row }"><span class="sku-highlight">{{ formatNumber(row.compareSku, 2) }}</span></template>
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
          <li>该品类A类品占比合理，请继续保持。</li>
          <li>该品类B类品占比合理，请继续保持。</li>
          <li>存在CC商品{{ formatInteger(summaryMetrics.ccCount) }}个，建议将其中近似品优先淘汰，可结合其他异常品项分析法及用户需求进行末位淘汰。</li>
          <li>存在AC和BC品{{ formatInteger(summaryMetrics.acBcCount) }}个，需进一步分析确认是否需要淘汰。</li>
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

interface MatrixRowVO {
  rowKey: string;
  label: string;
  a: number;
  b: number;
  c: number;
  n: number;
  t: number;
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

const summaryMetrics = computed(() => {
  const rows = detailRows.value as Array<Record<string, any>>;
  const getCode = (row: Record<string, any>, keys: string[]) => {
    for (const key of keys) {
      const value = row[key];
      if (value != null && value !== '') return String(value).toUpperCase();
    }
    return '';
  };
  const ccCount = rows.filter((row) => {
    const currentCode = getCode(row, ['currentAbc', 'curAbc', 'nowAbc', 'abcType']);
    const compareCode = getCode(row, ['compareAbc', 'preAbc', 'lastAbc', 'oldAbc']);
    return currentCode === 'C' && compareCode === 'C';
  }).length;
  const acBcCount = rows.filter((row) => {
    const currentCode = getCode(row, ['currentAbc', 'curAbc', 'nowAbc', 'abcType']);
    const compareCode = getCode(row, ['compareAbc', 'preAbc', 'lastAbc', 'oldAbc']);
    return currentCode === 'C' && (compareCode === 'A' || compareCode === 'B');
  }).length;
  return { ccCount, acBcCount };
});

const matrixColumns = [
  { key: 'a', label: 'A' },
  { key: 'b', label: 'B' },
  { key: 'c', label: 'C' }
] as const;

const matrixRows = computed<MatrixRowVO[]>(() => {
  const matrix = matrixState.value || {};
  const aTotal = Number(matrix.aaNum || 0) + Number(matrix.abNum || 0) + Number(matrix.acNum || 0);
  const bTotal = Number(matrix.baNum || 0) + Number(matrix.bbNum || 0) + Number(matrix.bcNum || 0);
  const cTotal = Number(matrix.caNum || 0) + Number(matrix.cbNum || 0) + Number(matrix.ccNum || 0);
  return [
    { rowKey: 'A', label: 'A类', a: Number(matrix.aaNum || 0), b: Number(matrix.abNum || 0), c: Number(matrix.acNum || 0), n: 0, t: 0, total: aTotal },
    { rowKey: 'B', label: 'B类', a: Number(matrix.baNum || 0), b: Number(matrix.bbNum || 0), c: Number(matrix.bcNum || 0), n: 0, t: 0, total: bTotal },
    { rowKey: 'C', label: 'C类', a: Number(matrix.caNum || 0), b: Number(matrix.cbNum || 0), c: Number(matrix.ccNum || 0), n: 0, t: 0, total: cTotal },
    { rowKey: 'SEP', label: '/', a: 0, b: 0, c: 0, n: 0, t: 0, total: 0 },
    { rowKey: 'TOTAL', label: '总计', a: aTotal, b: bTotal, c: cTotal, n: 0, t: 0, total: aTotal + bTotal + cTotal }
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
  const option: EChartsOption = {
    tooltip: {
      trigger: 'axis',
      formatter: (params: any) => {
        const idx = params?.[0]?.dataIndex ?? 0;
        const item = source[idx] || {};
        const sku = skuValues[idx] ?? 0;
        const sales = salesValues[idx] ?? 0;
        return [`日期：${item.abcType || '--'}`, `销售额占比：${sales.toFixed(2)}%`, `SKU占比：${sku.toFixed(2)}%`].join('<br/>');
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
      { name: '本期', type: 'line', smooth: true, symbol: 'circle', symbolSize: 7, showSymbol: true, itemStyle: { color: '#1ca29b' }, lineStyle: { width: 2.5, color: '#1ca29b' }, data: xCurrent.map((x, i) => [x, currentSalesCum[i]]) },
      { name: '对比日期', type: 'line', smooth: true, symbol: 'circle', symbolSize: 7, showSymbol: true, itemStyle: { color: '#f4c542' }, lineStyle: { width: 2.5, color: '#f4c542' }, data: xCompare.map((x, i) => [x, compareSalesCum[i]]) },
      { name: '设定基准', type: 'line', smooth: false, symbol: 'circle', symbolSize: 6, showSymbol: true, itemStyle: { color: '#ef4444' }, lineStyle: { width: 2, type: 'dashed', color: '#ef4444' }, data: xSet.map((x, i) => [x, setSalesCum[i]]) }
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

const resolveMatrixClass = (rowKey: string, columnKey: string) => {
  if (rowKey === 'SEP') return 'is-separator';
  if (rowKey === 'TOTAL' || columnKey === 'total') return 'is-total';
  if (rowKey === columnKey.toUpperCase()) return 'is-keep';
  return 'is-shift';
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

.page-subtitle {
  display: flex;
  gap: 16px;
  margin-top: 10px;
  font-size: 13px;
  color: var(--el-text-color-secondary);
  flex-wrap: wrap;
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

.matrix-legend {
  display: flex;
  flex-direction: column;
  gap: 10px;
  align-items: flex-start;
  font-size: 12px;
  color: var(--el-text-color-secondary);
  min-width: 116px;
  padding-left: 10px;
  border-left: 1px solid var(--el-border-color-light);
  justify-content: center;
}

.legend-dot {
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  margin-right: 6px;
}

.legend-dot.stable { background: #60a5fa; }
.legend-dot.warning { background: #f59e0b; }
.legend-dot.danger { background: #ef4444; }
.legend-dot.info { background: #0f766e; }

.matrix-wrap {
  display: flex;
  align-items: stretch;
  gap: 12px;
}

.matrix-wrap :deep(.el-table) {
  flex: 1;
  border-radius: 12px;
  overflow: hidden;
}

.matrix-header-stack {
  display: flex;
  flex-direction: column;
  gap: 2px;
  align-items: center;
  line-height: 1.2;
}

.matrix-row-label {
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.matrix-table :deep(.el-table__header th),
.detail-table :deep(.el-table__header th) {
  background: #f2f5f8;
  font-weight: 600;
}

.matrix-table :deep(.el-table__header th) {
  color: #475569;
}

.matrix-cell {
  padding: 10px 4px;
  border-radius: 6px;
}

.matrix-cell.is-keep {
  background: #e8f4ff;
}

.matrix-cell.is-shift {
  background: #fff8db;
}

.matrix-cell.is-total {
  background: #ffe8e8;
  font-weight: 700;
}

.matrix-cell.is-separator {
  background: transparent;
  color: transparent;
  min-height: 20px;
}

.sku-highlight {
  color: #0f766e;
  text-decoration: underline;
  text-underline-offset: 2px;
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
  color: var(--el-color-success);
}

.change-text.is-down {
  color: var(--el-color-danger);
}

.change-text.is-flat {
  color: var(--el-text-color-secondary);
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
}
</style>




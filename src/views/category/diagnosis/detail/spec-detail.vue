<template>
  <div class="p-2 spec-detail-page">
    <el-card shadow="hover" class="page-card filter-card">
      <div class="summary-line">{{ summaryLine }}</div>
      <div class="filter-header">
        <div class="page-title-wrap">
          <span class="page-title-line" />
          <span class="page-title">品类规格清单</span>
        </div>
        <div class="page-actions">
          <el-button link @click="emit('back')">返回</el-button>
          <span class="unit-text">金额单位：元</span>
          <el-button type="primary" link @click="handleExport">导出</el-button>
        </div>
      </div>

      <div class="category-title-row">
        <span class="category-title">004洗化部</span>
      </div>

      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="规格类型">
          <el-select v-model="queryForm.specType" clearable style="width: 160px">
            <el-option label="全部" value="" />
            <el-option label="标准规格" value="normal" />
            <el-option label="大规格" value="large" />
            <el-option label="小规格" value="small" />
          </el-select>
        </el-form-item>
        <el-form-item label="规格">
          <el-select v-model="queryForm.specName" clearable style="width: 180px">
            <el-option label="全部" value="" />
            <el-option v-for="item in specOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>
        <el-form-item label="新销规格">
          <el-select v-model="queryForm.newSaleSpec" clearable style="width: 160px">
            <el-option label="全部" value="" />
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">规格明细</span>
        </div>
      </template>

      <el-table v-loading="tableLoading" :data="tableRows" border stripe class="spec-table" height="560" @sort-change="handleSortChange">
        <el-table-column label="规格名称" prop="specName" min-width="140" fixed="left" align="left" sortable show-overflow-tooltip />
        <el-table-column label="规格类型" prop="specTypeLabel" min-width="120" align="left" sortable show-overflow-tooltip />
        <el-table-column label="新销规格" prop="newSaleSpecLabel" min-width="120" align="left" sortable show-overflow-tooltip />

        <el-table-column label="SKU数-总计" min-width="120" align="right" sortable :sort-method="sortNumber('skuTotal')">
          <template #default="{ row }">{{ formatNumber(row.skuTotal, 0) }}</template>
        </el-table-column>
        <el-table-column label="SKU数-对比增长" min-width="140" align="right" sortable :sort-method="sortNumber('skuGrowth')">
          <template #default="{ row }"><span :class="growthClass(row.skuGrowth)">{{ formatGrowth(row.skuGrowth) }}</span></template>
        </el-table-column>
        <el-table-column label="SKU数-占比" min-width="120" align="right" sortable :sort-method="sortNumber('skuShare')">
          <template #default="{ row }">{{ formatPercent(row.skuShare) }}</template>
        </el-table-column>

        <el-table-column label="销售量-总计" min-width="120" align="right" sortable :sort-method="sortNumber('saleQtyTotal')">
          <template #default="{ row }">{{ formatNumber(row.saleQtyTotal, 0) }}</template>
        </el-table-column>
        <el-table-column label="销售量-对比增长" min-width="140" align="right" sortable :sort-method="sortNumber('saleQtyGrowth')">
          <template #default="{ row }"><span :class="growthClass(row.saleQtyGrowth)">{{ formatGrowth(row.saleQtyGrowth) }}</span></template>
        </el-table-column>
        <el-table-column label="销售量-占比" min-width="120" align="right" sortable :sort-method="sortNumber('saleQtyShare')">
          <template #default="{ row }">{{ formatPercent(row.saleQtyShare) }}</template>
        </el-table-column>
        <el-table-column label="销售量-PSD" min-width="120" align="right" sortable :sort-method="sortNumber('saleQtyPsd')">
          <template #default="{ row }">{{ formatNumber(row.saleQtyPsd) }}</template>
        </el-table-column>

        <el-table-column label="销售额-总计" min-width="130" align="right" sortable :sort-method="sortNumber('salesAmountTotal')">
          <template #default="{ row }">{{ formatAmount(row.salesAmountTotal) }}</template>
        </el-table-column>
        <el-table-column label="销售额-对比增长" min-width="140" align="right" sortable :sort-method="sortNumber('salesAmountGrowth')">
          <template #default="{ row }"><span :class="growthClass(row.salesAmountGrowth)">{{ formatGrowth(row.salesAmountGrowth) }}</span></template>
        </el-table-column>
        <el-table-column label="销售额-占比" min-width="120" align="right" sortable :sort-method="sortNumber('salesAmountShare')">
          <template #default="{ row }">{{ formatPercent(row.salesAmountShare) }}</template>
        </el-table-column>
        <el-table-column label="销售额-PSD" min-width="120" align="right" sortable :sort-method="sortNumber('salesAmountPsd')">
          <template #default="{ row }">{{ formatAmount(row.salesAmountPsd) }}</template>
        </el-table-column>

        <el-table-column label="毛利额-总计" min-width="130" align="right" sortable :sort-method="sortNumber('grossAmountTotal')">
          <template #default="{ row }">{{ formatAmount(row.grossAmountTotal) }}</template>
        </el-table-column>
        <el-table-column label="毛利额-对比增长" min-width="140" align="right" sortable :sort-method="sortNumber('grossAmountGrowth')">
          <template #default="{ row }"><span :class="growthClass(row.grossAmountGrowth)">{{ formatGrowth(row.grossAmountGrowth) }}</span></template>
        </el-table-column>
        <el-table-column label="毛利额-占比" min-width="120" align="right" sortable :sort-method="sortNumber('grossAmountShare')">
          <template #default="{ row }">{{ formatPercent(row.grossAmountShare) }}</template>
        </el-table-column>
        <el-table-column label="毛利额-PSD" min-width="120" align="right" sortable :sort-method="sortNumber('grossAmountPsd')">
          <template #default="{ row }">{{ formatAmount(row.grossAmountPsd) }}</template>
        </el-table-column>

        <el-table-column label="毛利率-总计" min-width="120" align="right" sortable :sort-method="sortNumber('grossRateTotal')">
          <template #default="{ row }">{{ formatPercent(row.grossRateTotal) }}</template>
        </el-table-column>
        <el-table-column label="毛利率-对比增长" min-width="140" align="right" sortable :sort-method="sortNumber('grossRateGrowth')">
          <template #default="{ row }"><span :class="growthClass(row.grossRateGrowth)">{{ formatGrowth(row.grossRateGrowth) }}</span></template>
        </el-table-column>

        <el-table-column label="当前库存数量" min-width="120" align="right" sortable :sort-method="sortNumber('inventoryQty')">
          <template #default="{ row }">{{ formatNumber(row.inventoryQty, 0) }}</template>
        </el-table-column>
        <el-table-column label="库存周转率" min-width="120" align="right" sortable :sort-method="sortNumber('turnoverRate')">
          <template #default="{ row }">{{ formatNumber(row.turnoverRate) }}</template>
        </el-table-column>
        <el-table-column label="库存周转天数" min-width="130" align="right" sortable :sort-method="sortNumber('turnoverDays')">
          <template #default="{ row }">{{ formatNumber(row.turnoverDays) }}</template>
        </el-table-column>
        <el-table-column label="库销比" min-width="100" align="right" sortable :sort-method="sortNumber('inventorySalesRatio')">
          <template #default="{ row }">{{ formatNumber(row.inventorySalesRatio) }}</template>
        </el-table-column>
        <el-table-column label="毛利贡献率" min-width="120" align="right" sortable :sort-method="sortNumber('grossContributionRate')">
          <template #default="{ row }">{{ formatPercent(row.grossContributionRate) }}</template>
        </el-table-column>
        <el-table-column label="GMROI" min-width="100" align="right" sortable :sort-method="sortNumber('gmroi')">
          <template #default="{ row }">{{ formatNumber(row.gmroi) }}</template>
        </el-table-column>
        <el-table-column label="销售率" min-width="100" align="right" sortable :sort-method="sortNumber('sellThroughRate')">
          <template #default="{ row }">{{ formatPercent(row.sellThroughRate) }}</template>
        </el-table-column>
        <el-table-column label="本期促销SKU" min-width="120" align="right" sortable :sort-method="sortNumber('promotionSkuCount')">
          <template #default="{ row }">{{ formatNumber(row.promotionSkuCount, 0) }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[5, 10, 20, 50]"
          :total="total"
          @size-change="handlePageChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup name="SpecAnalysisDetail" lang="ts">
interface SpecRow {
  specName: string;
  specType: string;
  specTypeLabel: string;
  newSaleSpec: string;
  newSaleSpecLabel: string;
  skuTotal: number;
  skuGrowth: number;
  skuShare: number;
  saleQtyTotal: number;
  saleQtyGrowth: number;
  saleQtyShare: number;
  saleQtyPsd: number;
  salesAmountTotal: number;
  salesAmountGrowth: number;
  salesAmountShare: number;
  salesAmountPsd: number;
  grossAmountTotal: number;
  grossAmountGrowth: number;
  grossAmountShare: number;
  grossAmountPsd: number;
  grossRateTotal: number;
  grossRateGrowth: number;
  inventoryQty: number;
  turnoverRate: number;
  turnoverDays: number;
  inventorySalesRatio: number;
  grossContributionRate: number;
  gmroi: number;
  sellThroughRate: number;
  promotionSkuCount: number;
}

interface QueryForm {
  specType: string;
  specName: string;
  newSaleSpec: string;
  pageNum: number;
  pageSize: number;
}

const emit = defineEmits<{
  back: [];
}>();

const summaryLine = '数据日期:2024/10/01至2024/12/08 ｜ 对比日期:2023/10/01至2023/12/08 ｜ 组织: 华南大区 ｜ 业态: 标准店 ｜ 商圈: 社区店 ｜ 门店: 全部门店';
const specOptions = ['规格A', '规格B', '规格C', '规格D'];

const queryForm = reactive<QueryForm>({
  specType: '',
  specName: '',
  newSaleSpec: '',
  pageNum: 1,
  pageSize: 10
});

const tableLoading = ref(false);
const total = ref(0);

const mockRows: SpecRow[] = [
  { specName: '规格A', specType: 'normal', specTypeLabel: '标准规格', newSaleSpec: 'Y', newSaleSpecLabel: '是', skuTotal: 28, skuGrowth: 6.2, skuShare: 12.4, saleQtyTotal: 1820, saleQtyGrowth: 8.4, saleQtyShare: 14.7, saleQtyPsd: 9.2, salesAmountTotal: 86500, salesAmountGrowth: 11.8, salesAmountShare: 15.2, salesAmountPsd: 438.6, grossAmountTotal: 31620, grossAmountGrowth: 9.4, grossAmountShare: 13.8, grossAmountPsd: 160.2, grossRateTotal: 36.54, grossRateGrowth: 0.7, inventoryQty: 420, turnoverRate: 3.8, turnoverDays: 27.6, inventorySalesRatio: 0.88, grossContributionRate: 11.36, gmroi: 3.42, sellThroughRate: 82.4, promotionSkuCount: 8 },
  { specName: '规格B', specType: 'large', specTypeLabel: '大规格', newSaleSpec: 'N', newSaleSpecLabel: '否', skuTotal: 16, skuGrowth: -2.1, skuShare: 8.6, saleQtyTotal: 1090, saleQtyGrowth: 4.2, saleQtyShare: 8.9, saleQtyPsd: 5.8, salesAmountTotal: 64820, salesAmountGrowth: 7.6, salesAmountShare: 11.5, salesAmountPsd: 345.6, grossAmountTotal: 18150, grossAmountGrowth: 3.1, grossAmountShare: 8.2, grossAmountPsd: 96.8, grossRateTotal: 28.0, grossRateGrowth: -0.6, inventoryQty: 510, turnoverRate: 1.4, turnoverDays: 43.8, inventorySalesRatio: 1.24, grossContributionRate: 6.29, gmroi: 1.86, sellThroughRate: 67.2, promotionSkuCount: 4 },
  { specName: '规格C', specType: 'small', specTypeLabel: '小规格', newSaleSpec: 'Y', newSaleSpecLabel: '是', skuTotal: 11, skuGrowth: 1.3, skuShare: 6.1, saleQtyTotal: 1250, saleQtyGrowth: 12.8, saleQtyShare: 9.4, saleQtyPsd: 6.9, salesAmountTotal: 31800, salesAmountGrowth: 14.1, salesAmountShare: 7.2, salesAmountPsd: 177.7, grossAmountTotal: 4770, grossAmountGrowth: 1.8, grossAmountShare: 2.5, grossAmountPsd: 26.6, grossRateTotal: 15.0, grossRateGrowth: 0.4, inventoryQty: 860, turnoverRate: 3.2, turnoverDays: 54.9, inventorySalesRatio: 1.37, grossContributionRate: 1.65, gmroi: 1.27, sellThroughRate: 58.5, promotionSkuCount: 2 }
];

const tableRows = ref<SpecRow[]>([]);

const formatNumber = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '-';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

const formatAmount = (value: unknown) => formatNumber(value);
const formatPercent = (value: unknown) => `${Number(value ?? 0).toFixed(2)}%`;
const formatGrowth = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '-';
  return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
};
const growthClass = (value: unknown) => (Number(value ?? 0) > 0 ? 'is-up' : Number(value ?? 0) < 0 ? 'is-down' : 'is-flat');
const sortNumber = (key: keyof SpecRow) => (a: SpecRow, b: SpecRow) => Number(a[key] ?? 0) - Number(b[key] ?? 0);

const loadTable = async () => {
  tableLoading.value = true;
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    const filtered = mockRows.filter((item) => {
      const matchType = !queryForm.specType || item.specType === queryForm.specType;
      const matchName = !queryForm.specName || item.specName === queryForm.specName;
      const matchNew = !queryForm.newSaleSpec || item.newSaleSpec === queryForm.newSaleSpec;
      return matchType && matchName && matchNew;
    });
    total.value = filtered.length;
    const start = (queryForm.pageNum - 1) * queryForm.pageSize;
    tableRows.value = filtered.slice(start, start + queryForm.pageSize);
  } finally {
    tableLoading.value = false;
  }
};

const handlePageChange = async () => {
  await loadTable();
};

const handleSortChange = async () => {
  await loadTable();
};

const handleExport = () => {
  ElMessage.info('导出功能后续对接真实接口');
};

onMounted(async () => {
  await loadTable();
});
</script>

<style scoped lang="scss">
.spec-detail-page { background:#f5f7fa; }
.page-card { border:1px solid var(--el-border-color-light); box-shadow:0 2px 8px rgba(15,23,42,.04); }
.filter-card { margin-bottom:12px; }
.summary-line { color:#475569; font-size:13px; line-height:1.7; }
.filter-header { display:flex; justify-content:space-between; gap:16px; align-items:flex-start; margin-top:6px; }
.page-title-wrap { display:flex; align-items:center; gap:8px; }
.page-title-line { width:3px; height:16px; border-radius:999px; background:var(--el-color-primary); }
.page-title { font-size:20px; font-weight:700; color:#0f172a; }
.page-actions { display:flex; align-items:center; gap:12px; }
.unit-text { color:#64748b; font-size:13px; }
.category-title-row { margin:10px 0 6px; }
.category-title { font-size:16px; font-weight:600; color:#111827; }
.filter-form { margin-top:8px; }
.card-header { display:flex; align-items:center; justify-content:space-between; }
.card-title { font-size:15px; font-weight:600; color:#0f172a; }
.spec-table :deep(.el-table__header th) { background:#f8fafc; font-weight:600; color:#0f172a; }
.spec-table :deep(.cell) { font-size:13px; }
.spec-table :deep(.el-table__body td) { color:#334155; }
.is-up { color: var(--el-color-success); font-weight:600; }
.is-down { color: var(--el-color-danger); font-weight:600; }
.is-flat { color: var(--el-text-color-secondary); font-weight:600; }
.pagination-wrap { display:flex; justify-content:flex-end; margin-top:12px; }
</style>

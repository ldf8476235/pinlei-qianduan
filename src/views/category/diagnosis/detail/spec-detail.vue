<template>
  <div class="p-2 spec-detail-page">
    <el-card shadow="hover" class="page-card summary-card">
      <div class="summary-line">数据日期：2024/10/01至2024/12/08；对比日期：2023/10/01至2023/12/08</div>
      <div class="summary-line">组织：总部；业态：全部业态；商圈：全部商圈；</div>
      <div class="summary-line">门店：全部</div>
      <div class="category-title">004洗化部（一级品类）</div>
    </el-card>

    <el-card shadow="hover" class="page-card filter-card">
      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="规格类型">
          <el-select
            v-model="queryForm.specType"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            clearable
            placeholder="全部 +2"
            style="width: 220px"
          >
            <el-option label="标准规格" value="normal" />
            <el-option label="大规格" value="large" />
            <el-option label="小规格" value="small" />
          </el-select>
        </el-form-item>

        <el-form-item label="规格">
          <el-select
            v-model="queryForm.specName"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            clearable
            placeholder="全部 +1198"
            style="width: 260px"
          >
            <el-option v-for="item in specOptions" :key="item" :label="item" :value="item" />
          </el-select>
        </el-form-item>

        <el-form-item label="新销规格">
          <el-select v-model="queryForm.newSaleSpec" clearable placeholder="全部" style="width: 160px">
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
          <span class="card-title">品类规格清单</span>
          <div class="card-actions">
            <span class="unit-text">*金额单位：元</span>
            <el-button type="primary" link @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <el-table
        v-loading="tableLoading"
        :data="tableRows"
        border
        stripe
        height="560"
        class="spec-table"
        @sort-change="handleSortChange"
      >
        <el-table-column label="规格" prop="specName" min-width="140" fixed="left" align="left" sortable="custom" show-overflow-tooltip />
        <el-table-column
          label="规格类型"
          prop="specTypeLabel"
          min-width="120"
          fixed="left"
          align="left"
          sortable="custom"
          show-overflow-tooltip
        />
        <el-table-column
          label="新销规格"
          prop="newSaleSpecLabel"
          min-width="120"
          fixed="left"
          align="left"
          sortable="custom"
          show-overflow-tooltip
        />

        <el-table-column label="SKU数" align="center">
          <el-table-column label="总计" prop="skuTotal" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">
              <span class="major-number">{{ formatNumber(row.skuTotal, 0) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="对比增长" prop="skuGrowth" min-width="120" align="center" sortable="custom">
            <template #default="{ row }"><span :class="growthClass(row.skuGrowth)">{{ formatGrowth(row.skuGrowth) }}</span></template>
          </el-table-column>
          <el-table-column label="占比" prop="skuShare" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.skuShare) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="销售量-总计" prop="saleQtyTotal" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.saleQtyTotal, 0) }}</template>
        </el-table-column>
        <el-table-column label="销售量-对比增长" prop="saleQtyGrowth" min-width="130" align="center" sortable="custom">
          <template #default="{ row }"><span :class="growthClass(row.saleQtyGrowth)">{{ formatGrowth(row.saleQtyGrowth) }}</span></template>
        </el-table-column>
        <el-table-column label="销售量-占比" prop="saleQtyShare" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.saleQtyShare) }}</template>
        </el-table-column>
        <el-table-column label="销售量-PSD" prop="saleQtyPsd" min-width="110" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.saleQtyPsd) }}</template>
        </el-table-column>

        <el-table-column label="销售额-总计" prop="salesAmountTotal" min-width="130" align="center" sortable="custom">
          <template #default="{ row }">
            <span class="major-number">{{ formatAmount(row.salesAmountTotal) }}</span>
          </template>
        </el-table-column>
        <el-table-column label="销售额-对比增长" prop="salesAmountGrowth" min-width="130" align="center" sortable="custom">
          <template #default="{ row }"><span :class="growthClass(row.salesAmountGrowth)">{{ formatGrowth(row.salesAmountGrowth) }}</span></template>
        </el-table-column>
        <el-table-column label="销售额-占比" prop="salesAmountShare" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.salesAmountShare) }}</template>
        </el-table-column>
        <el-table-column label="销售额-PSD" prop="salesAmountPsd" min-width="110" align="center" sortable="custom">
          <template #default="{ row }">{{ formatAmount(row.salesAmountPsd) }}</template>
        </el-table-column>

        <el-table-column label="毛利额-总计" prop="grossAmountTotal" min-width="130" align="center" sortable="custom">
          <template #default="{ row }">{{ formatAmount(row.grossAmountTotal) }}</template>
        </el-table-column>
        <el-table-column label="毛利额-对比增长" prop="grossAmountGrowth" min-width="130" align="center" sortable="custom">
          <template #default="{ row }"><span :class="growthClass(row.grossAmountGrowth)">{{ formatGrowth(row.grossAmountGrowth) }}</span></template>
        </el-table-column>
        <el-table-column label="毛利额-占比" prop="grossAmountShare" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.grossAmountShare) }}</template>
        </el-table-column>
        <el-table-column label="毛利额-PSD" prop="grossAmountPsd" min-width="110" align="center" sortable="custom">
          <template #default="{ row }">{{ formatAmount(row.grossAmountPsd) }}</template>
        </el-table-column>

        <el-table-column label="毛利率-总计" prop="grossRateTotal" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.grossRateTotal) }}</template>
        </el-table-column>
        <el-table-column label="毛利率-对比增长" prop="grossRateGrowth" min-width="130" align="center" sortable="custom">
          <template #default="{ row }"><span :class="growthClass(row.grossRateGrowth)">{{ formatGrowth(row.grossRateGrowth) }}</span></template>
        </el-table-column>

        <el-table-column label="当前库存数量" prop="inventoryQty" min-width="130" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.inventoryQty, 0) }}</template>
        </el-table-column>
        <el-table-column label="库存周转率" prop="turnoverRate" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.turnoverRate) }}</template>
        </el-table-column>
        <el-table-column label="库存周转天数" prop="turnoverDays" min-width="130" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.turnoverDays) }}</template>
        </el-table-column>
        <el-table-column label="库销比" prop="inventorySalesRatio" min-width="100" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.inventorySalesRatio) }}</template>
        </el-table-column>
        <el-table-column label="毛利贡献率" prop="grossContributionRate" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.grossContributionRate) }}</template>
        </el-table-column>
        <el-table-column label="GMROI" prop="gmroi" min-width="100" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.gmroi) }}</template>
        </el-table-column>
        <el-table-column label="销售率" prop="sellThroughRate" min-width="100" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.sellThroughRate) }}</template>
        </el-table-column>
        <el-table-column label="本期促销SKU" prop="promotionSkuCount" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.promotionSkuCount, 0) }}</template>
        </el-table-column>

        <el-table-column label="操作" min-width="90" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleProcess(row)">处理</el-button>
          </template>
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
  specType: string[];
  specName: string[];
  newSaleSpec: string;
  pageNum: number;
  pageSize: number;
}

type SortOrder = 'ascending' | 'descending' | null;

const specOptions = ['规格A', '规格B', '规格C', '规格D'];

const queryForm = reactive<QueryForm>({
  specType: [],
  specName: [],
  newSaleSpec: '',
  pageNum: 1,
  pageSize: 10
});

const tableLoading = ref(false);
const total = ref(0);
const sortState = reactive<{ prop: keyof SpecRow; order: SortOrder }>({
  prop: 'salesAmountTotal',
  order: 'descending'
});

const mockRows: SpecRow[] = [
  { specName: '规格A', specType: 'normal', specTypeLabel: '标准规格', newSaleSpec: 'Y', newSaleSpecLabel: '是', skuTotal: 28, skuGrowth: 6.2, skuShare: 12.4, saleQtyTotal: 1820, saleQtyGrowth: 8.4, saleQtyShare: 14.7, saleQtyPsd: 9.2, salesAmountTotal: 86500, salesAmountGrowth: 11.8, salesAmountShare: 15.2, salesAmountPsd: 438.6, grossAmountTotal: 31620, grossAmountGrowth: 9.4, grossAmountShare: 13.8, grossAmountPsd: 160.2, grossRateTotal: 36.54, grossRateGrowth: 0.7, inventoryQty: 420, turnoverRate: 3.8, turnoverDays: 27.6, inventorySalesRatio: 0.88, grossContributionRate: 11.36, gmroi: 3.42, sellThroughRate: 82.4, promotionSkuCount: 8 },
  { specName: '规格B', specType: 'large', specTypeLabel: '大规格', newSaleSpec: 'N', newSaleSpecLabel: '否', skuTotal: 16, skuGrowth: -2.1, skuShare: 8.6, saleQtyTotal: 1090, saleQtyGrowth: 4.2, saleQtyShare: 8.9, saleQtyPsd: 5.8, salesAmountTotal: 64820, salesAmountGrowth: 7.6, salesAmountShare: 11.5, salesAmountPsd: 345.6, grossAmountTotal: 18150, grossAmountGrowth: 3.1, grossAmountShare: 8.2, grossAmountPsd: 96.8, grossRateTotal: 28.0, grossRateGrowth: -0.6, inventoryQty: 510, turnoverRate: 1.4, turnoverDays: 43.8, inventorySalesRatio: 1.24, grossContributionRate: 6.29, gmroi: 1.86, sellThroughRate: 67.2, promotionSkuCount: 4 },
  { specName: '规格C', specType: 'small', specTypeLabel: '小规格', newSaleSpec: 'Y', newSaleSpecLabel: '是', skuTotal: 11, skuGrowth: 1.3, skuShare: 6.1, saleQtyTotal: 1250, saleQtyGrowth: 12.8, saleQtyShare: 9.4, saleQtyPsd: 6.9, salesAmountTotal: 31800, salesAmountGrowth: 14.1, salesAmountShare: 7.2, salesAmountPsd: 177.7, grossAmountTotal: 4770, grossAmountGrowth: 1.8, grossAmountShare: 2.5, grossAmountPsd: 26.6, grossRateTotal: 15.0, grossRateGrowth: 0.4, inventoryQty: 860, turnoverRate: 3.2, turnoverDays: 54.9, inventorySalesRatio: 1.37, grossContributionRate: 1.65, gmroi: 1.27, sellThroughRate: 58.5, promotionSkuCount: 2 }
];

const tableRows = ref<SpecRow[]>([]);

const formatNumber = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

const formatAmount = (value: unknown) => formatNumber(value);
const formatPercent = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return `${num.toFixed(2)}%`;
};
const formatGrowth = (value: unknown) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return `${num > 0 ? '+' : ''}${num.toFixed(2)}%`;
};

const growthClass = (value: unknown) =>
  Number(value ?? 0) > 0 ? 'growth-text is-up' : Number(value ?? 0) < 0 ? 'growth-text is-down' : 'growth-text is-flat';

const buildSortedRows = (rows: SpecRow[]) => {
  if (!sortState.prop || !sortState.order) return rows;
  const direction = sortState.order === 'ascending' ? 1 : -1;
  return [...rows].sort((a, b) => {
    const leftValue = a[sortState.prop];
    const rightValue = b[sortState.prop];
    const leftNumber = Number(leftValue ?? 0);
    const rightNumber = Number(rightValue ?? 0);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
      return (leftNumber - rightNumber) * direction;
    }
    return String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'zh-CN') * direction;
  });
};

const loadTable = async () => {
  tableLoading.value = true;
  try {
    await new Promise((resolve) => window.setTimeout(resolve, 180));
    const filtered = mockRows.filter((item) => {
      const matchType = !queryForm.specType.length || queryForm.specType.includes(item.specType);
      const matchName = !queryForm.specName.length || queryForm.specName.includes(item.specName);
      const matchNew = !queryForm.newSaleSpec || item.newSaleSpec === queryForm.newSaleSpec;
      return matchType && matchName && matchNew;
    });
    const sorted = buildSortedRows(filtered);
    total.value = sorted.length;
    const start = (queryForm.pageNum - 1) * queryForm.pageSize;
    tableRows.value = sorted.slice(start, start + queryForm.pageSize);
  } finally {
    tableLoading.value = false;
  }
};

const handlePageChange = async () => {
  await loadTable();
};

const handleSortChange = async ({ prop, order }: { prop: string; order: 'ascending' | 'descending' | null }) => {
  sortState.prop = (prop as keyof SpecRow) || 'salesAmountTotal';
  sortState.order = order;
  await loadTable();
};

const handleExport = () => {
  ElMessage.info('导出功能后续对接真实接口');
};

const handleProcess = (_row: SpecRow) => {
  ElMessage.info('处理功能待接入');
};

onMounted(async () => {
  await loadTable();
});
</script>

<style scoped lang="scss">
.spec-detail-page {
  background:
    linear-gradient(180deg, #f7fbff 0%, #f5f7fa 180px),
    #f5f7fa;
  min-height: calc(100vh - 84px);
}

.page-card {
  border: 1px solid #dbe4f0;
  box-shadow: 0 10px 24px rgba(15, 23, 42, 0.05);
}

.summary-card,
.filter-card {
  margin-bottom: 12px;
}

.summary-line {
  color: #475569;
  font-size: 13px;
  line-height: 1.8;
}

.category-title {
  margin-top: 14px;
  font-size: 24px;
  font-weight: 700;
  color: #0f172a;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  gap: 8px 0;
  width: 100%;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 0;
  margin-right: 18px;
}

.filter-form :deep(.el-form-item__label) {
  color: #334155;
  font-weight: 600;
}

.filter-form :deep(.el-input__wrapper),
.filter-form :deep(.el-select__wrapper) {
  border-radius: 10px;
  box-shadow: 0 0 0 1px #d7e0ea inset;
}

.card-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.card-title {
  font-size: 20px;
  font-weight: 700;
  color: #0f172a;
}

.card-actions {
  display: flex;
  align-items: center;
  gap: 12px;
}

.unit-text {
  color: #64748b;
  font-size: 13px;
}

.spec-table {
  width: 100%;
}

.spec-table :deep(.el-table__header-wrapper thead tr:first-child th) {
  background: #eef4fb;
  color: #0f172a;
  font-weight: 700;
}

.spec-table :deep(.el-table__header-wrapper thead tr:nth-child(2) th) {
  background: #f8fbff;
  color: #334155;
  font-weight: 600;
}

.spec-table :deep(.el-table__body td) {
  color: #334155;
}

.spec-table :deep(.cell) {
  font-size: 13px;
}

.spec-table :deep(.el-table__body tr:hover > td) {
  background: #f6fbff;
}

.spec-table :deep(.el-table__fixed-left),
.spec-table :deep(.el-table__fixed-right) {
  box-shadow: 0 0 18px rgba(15, 23, 42, 0.06);
}

.major-number {
  color: #0f9f9a;
  font-weight: 700;
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
  color: #64748b;
}

.pagination-wrap {
  display: flex;
  justify-content: flex-end;
  margin-top: 12px;
}

@media (max-width: 992px) {
  .card-header {
    flex-direction: column;
    align-items: flex-start;
  }

  .card-actions {
    width: 100%;
    justify-content: space-between;
  }

  .pagination-wrap {
    justify-content: center;
  }
}
</style>

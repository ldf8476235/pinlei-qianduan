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
            @change="handleFilterChange"
          >
            <el-option
              v-for="item in specTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
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
            @change="handleFilterChange"
          >
            <el-option v-for="item in specOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="新销规格">
          <el-select v-model="queryForm.newSaleSpec" clearable placeholder="全部" style="width: 160px" @change="handleFilterChange">
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
import type { Sort } from 'element-plus';
import { getSpecDetails, getSpecFilterOptions } from '@/api/category/diagnosis/analysis';

interface SpecRow {
  [key: string]: unknown;
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

interface OptionItem {
  label: string;
  value: string;
}

const route = useRoute();
const sessionId = computed(() => String(route.query.sessionId || ''));
const specTypeOptions = ref<OptionItem[]>([]);
const specOptions = ref<OptionItem[]>([]);

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

const orderFieldMap: Partial<Record<keyof SpecRow, string>> = {
  skuTotal: 'sku',
  skuGrowth: 'skuInc',
  saleQtyTotal: 'saleQuantity',
  saleQtyGrowth: 'saleQuantityInc',
  salesAmountTotal: 'sales',
  salesAmountGrowth: 'salesInc',
  salesAmountShare: 'salesPer',
  grossAmountTotal: 'gross',
  grossAmountGrowth: 'grossInc',
  grossRateTotal: 'grossRate',
  grossRateGrowth: 'grossRateInc',
  inventoryQty: 'stockQuantity'
};

const tableRows = ref<SpecRow[]>([]);

const resolveNumber = (row: Record<string, unknown>, fields: string[]) => {
  for (const field of fields) {
    const value = Number(row[field]);
    if (Number.isFinite(value)) return value;
  }
  return 0;
};

const resolveText = (row: Record<string, unknown>, fields: string[], fallback = '--') => {
  for (const field of fields) {
    const value = row[field];
    if (value !== undefined && value !== null && String(value).trim() !== '') return String(value);
  }
  return fallback;
};

const normalizeSpecRow = (row: Record<string, unknown>): SpecRow => ({
  specName: resolveText(row, ['specName', 'productSpec', 'spec']),
  specType: resolveText(row, ['specType', 'type'], ''),
  specTypeLabel: resolveText(row, ['specTypeName', 'specTypeLabel', 'specType']),
  newSaleSpec: resolveText(row, ['newSpecType', 'newSaleSpec'], ''),
  newSaleSpecLabel: resolveText(row, ['newSpecTypeName', 'newSaleSpecLabel', 'newSpecType']),
  skuTotal: resolveNumber(row, ['sku', 'skuTotal']),
  skuGrowth: resolveNumber(row, ['skuInc', 'skuGrowth', 'skuChange']),
  skuShare: resolveNumber(row, ['skuPer', 'skuShare']),
  saleQtyTotal: resolveNumber(row, ['saleQuantity', 'saleQtyTotal']),
  saleQtyGrowth: resolveNumber(row, ['saleQuantityInc', 'saleQtyGrowth', 'saleQuantityChange']),
  saleQtyShare: resolveNumber(row, ['saleQuantityPer', 'saleQtyShare']),
  saleQtyPsd: resolveNumber(row, ['saleQuantityPsd', 'saleQtyPsd']),
  salesAmountTotal: resolveNumber(row, ['sales', 'salesAmountTotal']),
  salesAmountGrowth: resolveNumber(row, ['salesInc', 'salesAmountGrowth', 'salesChange']),
  salesAmountShare: resolveNumber(row, ['salesPer', 'salesAmountShare']),
  salesAmountPsd: resolveNumber(row, ['salesPsd', 'salesAmountPsd']),
  grossAmountTotal: resolveNumber(row, ['gross', 'grossAmountTotal']),
  grossAmountGrowth: resolveNumber(row, ['grossInc', 'grossAmountGrowth', 'grossChange']),
  grossAmountShare: resolveNumber(row, ['grossPer', 'grossAmountShare']),
  grossAmountPsd: resolveNumber(row, ['grossPsd', 'grossAmountPsd']),
  grossRateTotal: resolveNumber(row, ['grossRate', 'grossRateTotal']),
  grossRateGrowth: resolveNumber(row, ['grossRateInc', 'grossRateGrowth']),
  inventoryQty: resolveNumber(row, ['stockQuantity', 'inventoryQty']),
  turnoverRate: resolveNumber(row, ['turnoverRate']),
  turnoverDays: resolveNumber(row, ['turnoverDays']),
  inventorySalesRatio: resolveNumber(row, ['stockSalesRate', 'inventorySalesRatio']),
  grossContributionRate: resolveNumber(row, ['contributionRate', 'grossContributionRate']),
  gmroi: resolveNumber(row, ['gmroi']),
  sellThroughRate: resolveNumber(row, ['salesRate', 'sellThroughRate']),
  promotionSkuCount: resolveNumber(row, ['activitySku', 'promotionSkuCount'])
});

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

const loadTable = async () => {
  if (!sessionId.value) return;
  tableLoading.value = true;
  try {
    const res = await getSpecDetails({
      sessionId: sessionId.value,
      page: queryForm.pageNum,
      size: queryForm.pageSize,
      specTypeList: queryForm.specType.length ? queryForm.specType : undefined,
      specList: queryForm.specName.length ? queryForm.specName : undefined,
      newSpecType: queryForm.newSaleSpec || undefined,
      order: orderFieldMap[sortState.prop] || sortState.prop,
      orderType: sortState.order === 'ascending' ? 'asc' : 'desc'
    });
    const payload = (res as any)?.data?.data || (res as any)?.data || {};
    const records = Array.isArray(payload.records) ? payload.records : Array.isArray(payload.list) ? payload.list : [];
    tableRows.value = records.map((item: Record<string, unknown>) => normalizeSpecRow(item));
    total.value = Number(payload.total ?? tableRows.value.length);
  } finally {
    tableLoading.value = false;
  }
};

const loadFilterOptions = async () => {
  if (!sessionId.value) return;
  const res = await getSpecFilterOptions(sessionId.value);
  const payload = (res as any)?.data?.data || (res as any)?.data || {};
  const rows = Array.isArray(payload.specList) ? payload.specList : [];
  const specTypeMap = new Map<string, string>();
  const specMap = new Map<string, string>();
  rows.forEach((row: Record<string, unknown>) => {
    const type = resolveText(row, ['type'], '');
    const specName = resolveText(row, ['specName'], '');
    if (type) specTypeMap.set(type, type);
    if (specName) specMap.set(specName, specName);
  });
  specTypeOptions.value = Array.from(specTypeMap.entries()).map(([value, label]) => ({ value, label }));
  specOptions.value = Array.from(specMap.entries()).map(([value, label]) => ({ value, label }));
};

const handlePageChange = async () => {
  await loadTable();
};

const handleFilterChange = async () => {
  queryForm.pageNum = 1;
  await loadTable();
};

const handleSortChange = async ({ prop, order }: { prop: string; order: Sort['order'] }) => {
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
  await loadFilterOptions();
  await loadTable();
});

watch(() => route.query.sessionId, async () => {
  queryForm.pageNum = 1;
  await loadFilterOptions();
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
  color: #dc2626;
}

.growth-text.is-down {
  color: #16a34a;
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

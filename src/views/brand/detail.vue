<template>
  <div class="p-2 brand-detail-page">
    <el-card shadow="hover" class="page-card summary-card">
      <div class="summary-line">数据日期：2024/10/01至2024/12/08；对比日期：2023/10/01至2023/12/08</div>
      <div class="summary-line">组织：总部；业态：全部业态；商圈：全部商圈；</div>
      <div class="summary-line">门店：全部</div>
      <div class="category-title">004洗化部（一级品类）</div>
    </el-card>

    <el-card shadow="hover" class="page-card filter-card">
      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="品牌类型">
          <el-select
            v-model="queryForm.brandType"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            clearable
            placeholder="全部 +3"
            style="width: 220px"
          >
            <el-option
              v-for="item in brandTypeOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="品牌">
          <el-select
            v-model="queryForm.brandName"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            clearable
            placeholder="全部 +346"
            style="width: 260px"
          >
            <el-option
              v-for="item in brandNameOptions"
              :key="item.value"
              :label="item.label"
              :value="item.value"
            />
          </el-select>
        </el-form-item>

        <el-form-item label="新销品牌">
          <el-select v-model="queryForm.newSaleBrand" clearable placeholder="全部" style="width: 160px">
            <el-option label="全部" value="" />
            <el-option label="是" value="Y" />
            <el-option label="否" value="N" />
          </el-select>
        </el-form-item>

        <el-form-item class="filter-actions">
          <el-button type="primary" @click="loadData">查询</el-button>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card" v-loading="loading">
      <template #header>
        <div class="card-header">
          <span class="card-title">品类品牌清单</span>
          <div class="card-actions">
            <span class="unit-text">*金额单位：元</span>
            <el-button plain class="export-btn" @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <el-table
        :data="displayRows"
        border
        stripe
        height="560"
        class="brand-table"
        @sort-change="handleSortChange"
      >
        <el-table-column
          label="品牌编码"
          prop="brandNo"
          min-width="130"
          fixed="left"
          align="left"
          sortable="custom"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ resolveBrandCode(row) }}
          </template>
        </el-table-column>

        <el-table-column
          label="品牌名称"
          prop="productBrand"
          min-width="160"
          fixed="left"
          align="left"
          sortable="custom"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            <el-button link type="primary" class="name-link" @click="handleBrandDetail(row)">
              {{ resolveBrandName(row) }}
            </el-button>
          </template>
        </el-table-column>

        <el-table-column
          label="品牌类型"
          prop="brandTypeName"
          min-width="120"
          fixed="left"
          align="left"
          sortable="custom"
          show-overflow-tooltip
        >
          <template #default="{ row }">
            {{ resolveBrandType(row) }}
          </template>
        </el-table-column>

        <el-table-column
          label="新销品牌"
          prop="newBrandTypeName"
          min-width="110"
          fixed="left"
          align="left"
          sortable="custom"
        >
          <template #default="{ row }">
            {{ resolveYesNo(resolveField(row, ['newBrandTypeName', 'newBrandType', 'newSaleBrand'])) }}
          </template>
        </el-table-column>

        <el-table-column label="SKU&销量核心列" align="center">
          <el-table-column label="SKU数-总计" prop="sku" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">
              <span class="major-number">{{ formatNumber(resolveNumber(row, ['sku'])) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="SKU数-对比增长" prop="skuChange" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatGrowth(resolveNumber(row, ['skuChange', 'skuInc', 'skuGrowth', 'skuDiff'])) }}</template>
          </el-table-column>
          <el-table-column label="销售量-总计" prop="saleQuantity" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(resolveNumber(row, ['saleQuantity', 'salesQuantity'])) }}</template>
          </el-table-column>
          <el-table-column label="销售量-对比增长" prop="saleQuantityChange" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">
              {{ formatGrowth(resolveNumber(row, ['saleQuantityChange', 'saleQuantityInc', 'salesQuantityGrowth', 'saleQuantityGrowth'])) }}
            </template>
          </el-table-column>
          <el-table-column label="销售量-占比" prop="saleQuantityPer" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(resolveNumber(row, ['saleQuantityPer', 'salesQuantityPer'])) }}</template>
          </el-table-column>
          <el-table-column label="销售量-PSD" prop="saleQuantityPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(resolveNumber(row, ['saleQuantityPsd', 'salesQuantityPsd'])) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="销售额&毛利额核心列" align="center">
          <el-table-column label="销售额-总计" prop="sales" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">
              <span class="major-number">{{ formatNumber(resolveNumber(row, ['sales', 'salesAmount'])) }}</span>
            </template>
          </el-table-column>
          <el-table-column label="销售额-对比增长" prop="salesChange" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatGrowth(resolveNumber(row, ['salesChange', 'salesInc', 'growthRate', 'salesGrowthRate'])) }}</template>
          </el-table-column>
          <el-table-column label="销售额-占比" prop="salesPer" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(resolveNumber(row, ['salesPer'])) }}</template>
          </el-table-column>
          <el-table-column label="销售额-PSD" prop="salesPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(resolveNumber(row, ['salesPsd'])) }}</template>
          </el-table-column>
          <el-table-column label="毛利额-总计" prop="gross" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(resolveNumber(row, ['gross'])) }}</template>
          </el-table-column>
          <el-table-column label="毛利额-对比增长" prop="grossChange" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatGrowth(resolveNumber(row, ['grossChange', 'grossInc', 'grossGrowth'])) }}</template>
          </el-table-column>
          <el-table-column label="毛利额-占比" prop="grossPer" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(resolveNumber(row, ['grossPer'])) }}</template>
          </el-table-column>
          <el-table-column label="毛利额-PSD" prop="grossPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(resolveNumber(row, ['grossPsd'])) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="经营&效率扩展列" align="center">
          <el-table-column label="毛利率" prop="grossRate" min-width="100" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(resolveNumber(row, ['grossRate'])) }}</template>
          </el-table-column>
          <el-table-column label="当前库存数量" prop="stockQuantity" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(resolveNumber(row, ['stockQuantity']), 0) }}</template>
          </el-table-column>
          <el-table-column label="库存周转率" prop="turnoverRate" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(resolveNumber(row, ['turnoverRate'])) }}</template>
          </el-table-column>
          <el-table-column label="库存周转天数" prop="turnoverDays" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(resolveNumber(row, ['turnoverDays'])) }}</template>
          </el-table-column>
          <el-table-column label="库销比" prop="stockSalesRate" min-width="100" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(resolveNumber(row, ['stockSalesRate'])) }}</template>
          </el-table-column>
          <el-table-column label="毛利贡献率" prop="contributionRate" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(resolveNumber(row, ['contributionRate'])) }}</template>
          </el-table-column>
          <el-table-column label="GMROI" prop="gmroi" min-width="100" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(resolveNumber(row, ['gmroi'])) }}</template>
          </el-table-column>
          <el-table-column label="销售率" prop="salesRate" min-width="100" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(resolveNumber(row, ['salesRate'])) }}</template>
          </el-table-column>
          <el-table-column label="本期促销SKU" prop="activitySku" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(resolveNumber(row, ['activitySku', 'promotionSkuCount']), 0) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="操作" min-width="90" fixed="right" align="center">
          <template #default="{ row }">
            <el-button type="primary" link @click="handleProcess(row)">处理</el-button>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup lang="ts">
import type { Sort } from 'element-plus';
import { getBrandDetails } from '@/api/category/diagnosis/analysis';

interface BrandRow {
  [key: string]: unknown;
}

interface OptionItem {
  label: string;
  value: string;
}

type SortOrder = 'ascending' | 'descending' | null;

const route = useRoute();
const sessionId = computed(() => String(route.query.sessionId || ''));
const loading = ref(false);
const tableRows = ref<BrandRow[]>([]);

const queryForm = reactive({
  brandType: [] as string[],
  brandName: [] as string[],
  newSaleBrand: ''
});

const sortState = reactive<{ prop: string; order: SortOrder }>({
  prop: 'sales',
  order: 'descending'
});

const optionMapByField = (fields: string[]) =>
  computed<OptionItem[]>(() => {
    const map = new Map<string, string>();
    tableRows.value.forEach((row) => {
      const value = resolveField(row, fields);
      if (value && value !== '--') {
        map.set(value, value);
      }
    });
    return Array.from(map.entries()).map(([value, label]) => ({ value, label }));
  });

const brandTypeOptions = optionMapByField(['brandTypeName', 'brandType']);
const brandNameOptions = optionMapByField(['productBrand', 'brandName']);

const resolveField = (row: BrandRow, fields: string[]) => {
  for (const field of fields) {
    const value = row[field];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value);
    }
  }
  return '--';
};

const resolveNumber = (row: BrandRow, fields: string[]) => {
  for (const field of fields) {
    const value = Number(row[field]);
    if (Number.isFinite(value)) return value;
  }
  return NaN;
};

const resolveBrandCode = (row: BrandRow) => resolveField(row, ['brandNo', 'brandCode', 'productBrandNo']);
const resolveBrandName = (row: BrandRow) => resolveField(row, ['productBrand', 'brandName']);
const resolveBrandType = (row: BrandRow) => resolveField(row, ['brandTypeName', 'brandType']);

const resolveYesNo = (value: string) => {
  if (['Y', '1', '是', '新销品牌'].includes(value)) return '是';
  if (['N', '0', '否', '--'].includes(value)) return value === '--' ? '--' : '否';
  return value;
};

const getSortValue = (row: BrandRow, prop: string) => {
  switch (prop) {
    case 'brandNo':
      return resolveBrandCode(row);
    case 'productBrand':
      return resolveBrandName(row);
    case 'brandTypeName':
      return resolveBrandType(row);
    case 'newBrandTypeName':
      return resolveYesNo(resolveField(row, ['newBrandTypeName', 'newBrandType', 'newSaleBrand']));
    default:
      return row[prop];
  }
};

const displayRows = computed(() => {
  const rows = [...tableRows.value];
  if (!sortState.prop || !sortState.order) return rows;
  const direction = sortState.order === 'ascending' ? 1 : -1;
  return rows.sort((left, right) => {
    const leftValue = getSortValue(left, sortState.prop);
    const rightValue = getSortValue(right, sortState.prop);
    const leftNumber = Number(leftValue);
    const rightNumber = Number(rightValue);
    if (Number.isFinite(leftNumber) && Number.isFinite(rightNumber)) {
      return (leftNumber - rightNumber) * direction;
    }
    return String(leftValue ?? '').localeCompare(String(rightValue ?? ''), 'zh-CN') * direction;
  });
});

const loadData = async () => {
  if (!sessionId.value) return;
  loading.value = true;
  try {
    const res = await getBrandDetails({
      sessionId: sessionId.value,
      page: 1,
      size: 100,
      brandTypeList: queryForm.brandType.length ? queryForm.brandType : undefined,
      brandList: queryForm.brandName.length ? queryForm.brandName : undefined,
      newBrandType: queryForm.newSaleBrand || undefined
    });
    const payload = (res as any)?.data?.records || (res as any)?.data?.data?.records || [];
    tableRows.value = Array.isArray(payload) ? payload : [];
  } finally {
    loading.value = false;
  }
};

const handleSortChange = ({ prop, order }: { prop: string; order: Sort['order'] }) => {
  sortState.prop = prop || 'sales';
  sortState.order = order as SortOrder;
};

const handleExport = () => {
  ElMessage.info('导出功能待接入');
};

const handleBrandDetail = (_row: BrandRow) => {
  ElMessage.info('品牌详情跳转功能待接入');
};

const handleProcess = (_row: BrandRow) => {
  ElMessage.info('处理功能待接入');
};

const formatNumber = (value: unknown, digits = 2) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', {
    minimumFractionDigits: 0,
    maximumFractionDigits: digits
  });
};

const formatPercent = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  const actual = Math.abs(num) <= 1 ? num * 100 : num;
  return `${actual.toFixed(2)}%`;
};

const formatGrowth = (value: unknown) => {
  const num = Number(value);
  if (!Number.isFinite(num)) return '--';
  const actual = Math.abs(num) <= 1 ? num * 100 : num;
  const fixed = actual.toFixed(2);
  return `${Number(fixed) > 0 ? '+' : ''}${fixed}%`;
};

onMounted(loadData);
watch(() => route.query.sessionId, loadData);
</script>

<style scoped lang="scss">
.brand-detail-page {
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
  font-size: 13px;
  color: #475569;
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

.filter-actions {
  margin-left: auto;
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
  font-size: 13px;
  color: #64748b;
}

.export-btn {
  border-radius: 10px;
  border-color: #d6dde8;
  color: #334155;
  background: #fff;
}

.brand-table {
  width: 100%;
}

.brand-table :deep(.el-table__header-wrapper thead tr:first-child th) {
  background: #eef4fb;
  color: #0f172a;
  font-weight: 700;
}

.brand-table :deep(.el-table__header-wrapper thead tr:nth-child(2) th) {
  background: #f8fbff;
  color: #334155;
  font-weight: 600;
}

.brand-table :deep(.el-table__body td) {
  color: #334155;
}

.brand-table :deep(.cell) {
  font-size: 13px;
}

.brand-table :deep(.el-table__body tr:hover > td) {
  background: #f6fbff;
}

.brand-table :deep(.el-table__fixed-left),
.brand-table :deep(.el-table__fixed-right) {
  box-shadow: 0 0 18px rgba(15, 23, 42, 0.06);
}

.name-link {
  padding: 0;
  font-weight: 600;
}

.major-number {
  color: #0f9f9a;
  font-weight: 700;
}

@media (max-width: 1200px) {
  .filter-actions {
    margin-left: 0;
  }
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
}
</style>

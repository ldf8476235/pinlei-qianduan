<template>
  <div class="p-2 tag-detail-page">
    <el-card shadow="hover" class="page-card summary-card">
      <div class="summary-line">数据日期：{{ currentDateRangeText }}；对比日期：{{ compareDateRangeText }}</div>
      <div class="summary-line">组织：总部；业态：全部业态；商圈：全部商圈；</div>
      <div class="summary-line">门店：全部</div>
      <div class="category-title">{{ categoryTitle }}</div>
    </el-card>

    <el-card shadow="hover" class="page-card filter-card">
      <el-form :model="queryForm" inline class="filter-form">
        <el-form-item label="标签类型">
          <el-select v-model="queryForm.tagType" placeholder="请选择标签类型" style="width: 220px" @change="handleTagTypeChange">
            <el-option v-for="item in tagTypeOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>

        <el-form-item label="标签">
          <el-select
            v-model="queryForm.tagList"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="1"
            clearable
            placeholder="全部"
            style="width: 260px"
            @change="handleFilterChange"
          >
            <el-option v-for="item in tagOptions" :key="item.value" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
      </el-form>
    </el-card>

    <el-card shadow="hover" class="page-card table-card">
      <template #header>
        <div class="card-header">
          <span class="card-title">品类标签清单</span>
          <div class="card-actions">
            <span class="unit-text">*金额单位：元</span>
            <el-button type="primary" link @click="handleExport">导出</el-button>
          </div>
        </div>
      </template>

      <el-table v-loading="tableLoading" :data="tableRows" border stripe height="560" class="tag-table" @sort-change="handleSortChange">
        <el-table-column label="标签" prop="tagName" min-width="160" fixed="left" align="left" sortable="custom" show-overflow-tooltip />

        <el-table-column label="SKU数" align="center">
          <el-table-column label="总计" prop="sku" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">
              <button type="button" class="sku-link" @click="handleSkuDetail(row)">
                {{ formatNumber(row.sku, 0) }}
              </button>
            </template>
          </el-table-column>
          <el-table-column label="对比增长" prop="skuInc" min-width="120" align="center" sortable="custom">
            <template #default="{ row }"><span :class="growthClass(row.skuInc)">{{ formatGrowth(row.skuInc) }}</span></template>
          </el-table-column>
          <el-table-column label="占比" prop="skuPer" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.skuPer) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="销售量" align="center">
          <el-table-column label="总计" prop="saleQuantity" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.saleQuantity, 0) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" prop="saleQuantityInc" min-width="130" align="center" sortable="custom">
            <template #default="{ row }"><span :class="growthClass(row.saleQuantityInc)">{{ formatGrowth(row.saleQuantityInc) }}</span></template>
          </el-table-column>
          <el-table-column label="占比" prop="saleQuantityPer" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.saleQuantityPer) }}</template>
          </el-table-column>
          <el-table-column label="PSD" prop="saleQuantityPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.saleQuantityPsd) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="销售额" align="center">
          <el-table-column label="总计" prop="sales" min-width="130" align="center" sortable="custom">
            <template #default="{ row }"><span class="major-number">{{ formatNumber(row.sales) }}</span></template>
          </el-table-column>
          <el-table-column label="对比增长" prop="salesInc" min-width="130" align="center" sortable="custom">
            <template #default="{ row }"><span :class="growthClass(row.salesInc)">{{ formatGrowth(row.salesInc) }}</span></template>
          </el-table-column>
          <el-table-column label="占比" prop="salesPer" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.salesPer) }}</template>
          </el-table-column>
          <el-table-column label="PSD" prop="salesPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.salesPsd) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="毛利额" align="center">
          <el-table-column label="总计" prop="gross" min-width="130" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.gross) }}</template>
          </el-table-column>
          <el-table-column label="对比增长" prop="grossInc" min-width="130" align="center" sortable="custom">
            <template #default="{ row }"><span :class="growthClass(row.grossInc)">{{ formatGrowth(row.grossInc) }}</span></template>
          </el-table-column>
          <el-table-column label="占比" prop="grossPer" min-width="120" align="center" sortable="custom">
            <template #default="{ row }">{{ formatPercent(row.grossPer) }}</template>
          </el-table-column>
          <el-table-column label="PSD" prop="grossPsd" min-width="110" align="center" sortable="custom">
            <template #default="{ row }">{{ formatNumber(row.grossPsd) }}</template>
          </el-table-column>
        </el-table-column>

        <el-table-column label="毛利率" prop="grossRate" min-width="110" align="center" sortable="custom">
          <template #default="{ row }">{{ formatPercent(row.grossRate) }}</template>
        </el-table-column>
        <el-table-column label="当前库存数量" prop="stockQuantity" min-width="130" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.stockQuantity, 0) }}</template>
        </el-table-column>
        <el-table-column label="库存周转率" prop="turnoverRate" min-width="120" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.turnoverRate) }}</template>
        </el-table-column>
        <el-table-column label="GMROI" prop="gmroi" min-width="100" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.gmroi) }}</template>
        </el-table-column>
        <el-table-column label="促销SKU" prop="activitySku" min-width="110" align="center" sortable="custom">
          <template #default="{ row }">{{ formatNumber(row.activitySku, 0) }}</template>
        </el-table-column>
      </el-table>

      <div class="pagination-wrap">
        <el-pagination
          v-model:current-page="queryForm.pageNum"
          v-model:page-size="queryForm.pageSize"
          background
          layout="total, sizes, prev, pager, next, jumper"
          :page-sizes="[10, 20, 50, 100]"
          :total="total"
          @size-change="handleSizeChange"
          @current-change="handlePageChange"
        />
      </div>
    </el-card>
  </div>
</template>

<script setup name="TagAnalysisDetail" lang="ts">
import type { Sort } from 'element-plus';
import type { TagDetailItemResponse, TagTypeGroupResponse } from '@/api/category/diagnosis/detail/types';
import { getCategoryDiagnosisTagList, getCategoryDiagnosisTagTypes } from '@/api/category/diagnosis/detail';
import { STATIC_TAG_ANALYSIS_DATA, STATIC_TAG_CATEGORY_ALIASES, type StaticTagMetric } from './data/staticTagAnalysisData';

type SortOrder = 'ascending' | 'descending' | null;

interface OptionItem {
  label: string;
  value: string;
}

const route = useRoute();
const router = useRouter();
const sessionId = computed(() => String(route.query.sessionId || ''));

const queryForm = reactive({
  tagType: '',
  tagList: [] as string[],
  pageNum: 1,
  pageSize: 10
});

const tableLoading = ref(false);
const tableRows = ref<TagDetailItemResponse[]>([]);
const total = ref(0);
const tagGroups = ref<TagTypeGroupResponse[]>([]);
const isUsingStaticFallback = ref(false);
const sortState = reactive<{ prop: string; order: SortOrder }>({
  prop: 'sales',
  order: 'descending'
});

const orderFieldMap: Record<string, string> = {
  sku: 'sku',
  skuInc: 'skuInc',
  saleQuantity: 'saleQuantity',
  saleQuantityInc: 'saleQuantityInc',
  sales: 'sales',
  salesInc: 'salesInc',
  salesPer: 'salesPer',
  gross: 'gross',
  grossInc: 'grossInc',
  grossRate: 'grossRate',
  grossRateInc: 'grossRateInc',
  stockQuantity: 'stockQuantity',
  turnoverRate: 'turnoverRate',
  gmroi: 'gmroi',
  activitySku: 'activitySku'
};

const tagTypeOptions = computed<OptionItem[]>(() =>
  tagGroups.value
    .filter((item) => item.tagType)
    .map((item) => ({
      label: item.tagTypeName || item.tagType || '',
      value: item.tagType || ''
    }))
);

const activeTagGroup = computed(() => tagGroups.value.find((item) => item.tagType === queryForm.tagType));
const tagOptions = computed<OptionItem[]>(() =>
  (activeTagGroup.value?.tagList || [])
    .filter((item) => item.tagNo)
    .map((item) => ({
      label: item.tagName || item.tagNo || '',
      value: item.tagNo || ''
    }))
);

const currentDateRangeText = computed(() => {
  const start = resolveQueryValue(route.query.startDate as string | string[] | undefined, '2024/10/01');
  const end = resolveQueryValue(route.query.endDate as string | string[] | undefined, '2024/12/08');
  return `${start}至${end}`;
});

const compareDateRangeText = computed(() => {
  const start = resolveQueryValue(route.query.compareStartDate as string | string[] | undefined, '2023/10/01');
  const end = resolveQueryValue(route.query.compareEndDate as string | string[] | undefined, '2023/12/08');
  return `${start}至${end}`;
});

const categoryTitle = computed(() => {
  const categoryId = resolveQueryValue(route.query.categoryId as string | string[] | undefined, '004');
  const categoryName = resolveQueryValue(route.query.categoryName as string | string[] | undefined, '洗化部');
  const categoryLevel = resolveQueryValue(route.query.categoryLevel as string | string[] | undefined, '1');
  return `${categoryId}${categoryName}（${formatCategoryLevelName(categoryLevel)}）`;
});

const routeCategoryName = computed(() => resolveQueryValue(route.query.categoryName as string | string[] | undefined, '').trim());
const routeCategoryId = computed(() => resolveQueryValue(route.query.categoryId as string | string[] | undefined, '').trim());
const staticCategoryNames = computed(() => resolveStaticCategoryNames(routeCategoryName.value, routeCategoryId.value));

function resolveQueryValue(value: string | string[] | undefined, fallback: string) {
  if (Array.isArray(value)) return String(value[0] || fallback);
  return String(value || fallback);
}

const formatCategoryLevelName = (level?: string | number) => {
  const levelNumber = Number(level || 1);
  if (levelNumber >= 1 && levelNumber <= 5) {
    return `${['', '一级', '二级', '三级', '四级', '五级'][levelNumber]}品类`;
  }
  return '一级品类';
};

const unwrapPayload = <T,>(res: any, fallback: T): T => {
  return (res?.data?.data ?? res?.data?.result ?? res?.data ?? res?.result ?? fallback) as T;
};

const resolveStaticCategoryNames = (categoryName: string, categoryId: string) => {
  const sourceNames = Object.keys(STATIC_TAG_ANALYSIS_DATA);
  const candidates = [categoryId, categoryName].map((item) => item.trim()).filter(Boolean);
  for (const candidate of candidates) {
    const aliasKey = Object.keys(STATIC_TAG_CATEGORY_ALIASES).find((key) => candidate.includes(key));
    if (aliasKey) return STATIC_TAG_CATEGORY_ALIASES[aliasKey].filter((item) => sourceNames.includes(item));
    const direct = sourceNames.find((item) => candidate.includes(item));
    if (direct) return [direct];
  }
  return [];
};

const normalizeStaticRows = (rows: StaticTagMetric[]): TagDetailItemResponse[] => {
  const totalSku = rows.reduce((sum, item) => sum + Number(item.sku || 0), 0) || 1;
  return rows
    .map((item) => ({
      tagNo: item.tagName,
      tagName: item.tagName,
      sku: item.sku,
      skuInc: 0,
      skuPer: (Number(item.sku || 0) / totalSku) * 100,
      saleQuantity: 0,
      saleQuantityInc: 0,
      saleQuantityPer: 0,
      saleQuantityPsd: 0,
      sales: 0,
      salesInc: 0,
      salesPer: 0,
      salesPsd: 0,
      gross: 0,
      grossInc: 0,
      grossPer: 0,
      grossPsd: 0,
      grossRate: 0,
      stockQuantity: 0,
      turnoverRate: 0,
      gmroi: 0,
      activitySku: 0
    }))
    .sort((left, right) => Number(right.sku || 0) - Number(left.sku || 0));
};

const mergeStaticRows = (categoryNames: string[], tagType: string) => {
  const rowMap = new Map<string, StaticTagMetric>();
  categoryNames.forEach((categoryName) => {
    const rows = STATIC_TAG_ANALYSIS_DATA[categoryName]?.[tagType] || [];
    rows.forEach((item) => {
      const key = item.tagName.trim();
      if (!key) return;
      const current = rowMap.get(key);
      rowMap.set(key, {
        tagName: key,
        sku: Number(current?.sku || 0) + Number(item.sku || 0)
      });
    });
  });
  return normalizeStaticRows([...rowMap.values()]);
};

const loadStaticTagTypes = () => {
  const typeSet = new Set<string>();
  staticCategoryNames.value.forEach((categoryName) => {
    Object.keys(STATIC_TAG_ANALYSIS_DATA[categoryName] || {}).forEach((tagType) => typeSet.add(tagType));
  });
  tagGroups.value = [...typeSet].map((tagType) => ({
    tagType,
    tagTypeName: tagType,
    tagList: mergeStaticRows(staticCategoryNames.value, tagType).map((item) => ({
      tagNo: item.tagNo,
      tagName: item.tagName,
      sku: item.sku,
      skuPer: item.skuPer
    }))
  }));
  const routeTagType = resolveQueryValue(route.query.tagType as string | string[] | undefined, '');
  queryForm.tagType = tagGroups.value.some((item) => item.tagType === routeTagType)
    ? routeTagType
    : tagGroups.value[0]?.tagType || '';
};

const loadStaticTable = () => {
  if (!queryForm.tagType) {
    tableRows.value = [];
    total.value = 0;
    return;
  }
  let rows = mergeStaticRows(staticCategoryNames.value, queryForm.tagType);
  if (queryForm.tagList.length) {
    const selected = new Set(queryForm.tagList);
    rows = rows.filter((item) => item.tagNo && selected.has(item.tagNo));
  }
  total.value = rows.length;
  const start = (queryForm.pageNum - 1) * queryForm.pageSize;
  tableRows.value = rows.slice(start, start + queryForm.pageSize);
};

const loadTagTypes = async () => {
  if (!sessionId.value) return;
  const res = await getCategoryDiagnosisTagTypes(sessionId.value);
  tagGroups.value = unwrapPayload<TagTypeGroupResponse[]>(res, []);
  if (!tagGroups.value.length && staticCategoryNames.value.length) {
    isUsingStaticFallback.value = true;
    loadStaticTagTypes();
    return;
  }
  isUsingStaticFallback.value = false;
  const routeTagType = resolveQueryValue(route.query.tagType as string | string[] | undefined, '');
  queryForm.tagType = tagGroups.value.some((item) => item.tagType === routeTagType)
    ? routeTagType
    : tagGroups.value[0]?.tagType || '';
};

const loadTable = async () => {
  if (isUsingStaticFallback.value) {
    loadStaticTable();
    return;
  }
  if (!sessionId.value || !queryForm.tagType) {
    tableRows.value = [];
    total.value = 0;
    return;
  }
  tableLoading.value = true;
  try {
    const res = await getCategoryDiagnosisTagList(
      sessionId.value,
      queryForm.tagType,
      queryForm.tagList.length ? queryForm.tagList : ['-1'],
      queryForm.pageNum,
      queryForm.pageSize,
      orderFieldMap[sortState.prop] || sortState.prop,
      sortState.order === 'ascending' ? 'asc' : 'desc'
    );
    const payload = unwrapPayload<{ records?: TagDetailItemResponse[]; total?: number }>(res, {});
    tableRows.value = Array.isArray(payload.records) ? payload.records : [];
    total.value = Number(payload.total ?? 0);
    if (!total.value && staticCategoryNames.value.length) {
      isUsingStaticFallback.value = true;
      loadStaticTagTypes();
      loadStaticTable();
    }
  } finally {
    tableLoading.value = false;
  }
};

const handleTagTypeChange = async () => {
  queryForm.tagList = [];
  queryForm.pageNum = 1;
  await loadTable();
};

const handleFilterChange = async () => {
  queryForm.pageNum = 1;
  await loadTable();
};

const handlePageChange = async (page: number) => {
  queryForm.pageNum = page;
  await loadTable();
};

const handleSizeChange = async (size: number) => {
  queryForm.pageSize = size;
  queryForm.pageNum = 1;
  await loadTable();
};

const handleSortChange = async ({ prop, order }: { prop: string; order: Sort['order'] }) => {
  sortState.prop = prop || 'sales';
  sortState.order = (order as SortOrder) || 'descending';
  await loadTable();
};

const handleSkuDetail = (row: TagDetailItemResponse) => {
  const tagNo = String(row.tagNo || '').trim();
  const tagName = String(row.tagName || '').trim();
  if (!tagNo) {
    ElMessage.warning('缺少标签编码，无法查看标签SKU商品明细');
    return;
  }
  router.push({
    path: '/brand/analysis/detail/sku',
    query: {
      ...route.query,
      source: 'tag-sku',
      tagType: queryForm.tagType,
      tagTypeName: activeTagGroup.value?.tagTypeName || queryForm.tagType,
      tagNo,
      tagName
    }
  });
};

const handleExport = () => {
  ElMessage.info('导出功能待接入');
};

const formatNumber = (value: unknown, digits = 2) => {
  const num = Number(value ?? 0);
  if (!Number.isFinite(num)) return '--';
  return num.toLocaleString('zh-CN', { minimumFractionDigits: 0, maximumFractionDigits: digits });
};

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

onMounted(async () => {
  await loadTagTypes();
  await loadTable();
});

watch(
  () => route.query.sessionId,
  async () => {
    queryForm.pageNum = 1;
    await loadTagTypes();
    await loadTable();
  }
);
</script>

<style scoped lang="scss">
.tag-detail-page {
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

.sku-link {
  border: 0;
  background: transparent;
  color: #ea580c;
  cursor: pointer;
  font: inherit;
  font-weight: 700;
  padding: 0;
}

.sku-link:hover {
  color: #c2410c;
  text-decoration: underline;
}

.tag-table {
  width: 100%;
}

.tag-table :deep(.el-table__header-wrapper thead tr:first-child th) {
  background: #fff3e8;
  color: #0f172a;
  font-weight: 700;
}

.tag-table :deep(.el-table__header-wrapper thead tr:nth-child(2) th) {
  background: #f8fbff;
  color: #334155;
  font-weight: 600;
}

.tag-table :deep(.el-table__body td) {
  color: #334155;
}

.tag-table :deep(.cell) {
  font-size: 13px;
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
</style>

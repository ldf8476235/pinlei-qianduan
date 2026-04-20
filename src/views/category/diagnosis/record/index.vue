<template>
  <div class="p-2 category-diagnosis-record-page">
    <el-card shadow="hover" class="filter-card">
      <el-form :model="queryForm" inline label-width="80px" class="filter-form">
        <el-form-item label="门店范围">
          <el-input :model-value="storeScopeText" readonly class="filter-item-fixed" />
        </el-form-item>
        <el-form-item label="品类级别">
          <el-select v-model="queryForm.classLevel" class="filter-item-fixed" placeholder="请选择">
            <el-option v-for="item in levelOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="品类">
          <el-select
            v-model="queryForm.classNos"
            multiple
            collapse-tags
            collapse-tags-tooltip
            :max-collapse-tags="2"
            class="filter-item-category"
            placeholder="请选择品类"
          >
            <el-option v-for="item in categoryOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期日期">
          <el-date-picker
            v-model="currentDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            range-separator="-"
            class="filter-item-date"
          />
        </el-form-item>
        <el-form-item class="filter-action-item">
          <el-button text type="primary" @click="moreConditionVisible = !moreConditionVisible">
            {{ moreConditionVisible ? '收起' : '更多条件' }}
          </el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" class="query-button" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>

      <div v-show="moreConditionVisible" class="more-condition-wrap">
        <el-form :model="queryForm" inline label-width="80px" class="filter-form">
          <el-form-item label="对比日期">
            <el-date-picker
              v-model="compareDateRange"
              type="daterange"
              value-format="YYYY-MM-DD"
              start-placeholder="开始日期"
              end-placeholder="结束日期"
              range-separator="-"
              class="filter-item-date"
            />
          </el-form-item>
        </el-form>
      </div>
    </el-card>

    <el-card shadow="hover" class="record-card">
      <template #header>
        <div class="record-title">品类诊断记录</div>
      </template>

      <el-table v-loading="tableLoading" :data="tableData" border stripe @sort-change="handleSortChange">
        <el-table-column label="品类" prop="classNo" min-width="150" sortable="custom">
          <template #default="{ row }">
            <div class="category-cell">
              <div class="category-code">{{ row.classNo }}</div>
              <div class="category-name">{{ row.className }}</div>
            </div>
          </template>
        </el-table-column>
        <el-table-column label="组织" prop="deptName" min-width="110" show-overflow-tooltip />
        <el-table-column label="业态" prop="retailTypeName" min-width="110" show-overflow-tooltip />
        <el-table-column label="商圈" prop="businessCircleName" min-width="110" show-overflow-tooltip />
        <el-table-column label="店组" prop="deptGroupName" min-width="110" show-overflow-tooltip />
        <el-table-column label="门店" prop="storeRangeName" min-width="110" show-overflow-tooltip />
        <el-table-column label="状态" prop="status" min-width="110">
          <template #default="{ row }">
            <span class="status-text" :class="{ generated: isGenerated(row) }">
              <span class="status-dot" />
              {{ row.statusLabel || row.status || '--' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="本期日期" prop="periodStart" min-width="180" sortable="custom">
          <template #default="{ row }">
            {{ formatRange(row.periodStart, row.periodEnd) }}
          </template>
        </el-table-column>
        <el-table-column label="对比日期" prop="compareStart" min-width="180" sortable="custom">
          <template #default="{ row }">
            {{ formatRange(row.compareStart, row.compareEnd) }}
          </template>
        </el-table-column>
        <el-table-column label="生成人" prop="createByName" min-width="120" show-overflow-tooltip />
        <el-table-column label="生成时间" prop="createTime" min-width="170" sortable="custom">
          <template #default="{ row }">
            {{ formatDateTime(row.createTime) }}
          </template>
        </el-table-column>
        <el-table-column label="操作" fixed="right" width="110">
          <template #default="{ row }">
            <el-button v-if="row.canViewReport" link type="success" @click="handleViewReport(row)">查看报告</el-button>
            <span v-else class="disabled-report">--</span>
          </template>
        </el-table-column>
      </el-table>
    </el-card>
  </div>
</template>

<script setup name="CategoryDiagnosisRecord" lang="ts">
import { createDiagnosisSession, listDiagnosisRecords } from '@/api/category/diagnosis';
import type { DiagnosisRecordPageResponse, DiagnosisRecordQuery, DiagnosisRecordRow } from '@/api/category/diagnosis/types';
import { findStore, queryCategoryClassTree } from '@/api/category/tree';
import type { CategoryClassTreeNodeVO, OptionVO } from '@/api/category/tree/types';
import { useRequest } from '@/hooks/useRequest';

interface SortState {
  orderByColumn?: string;
  isAsc?: 'asc' | 'desc';
}

const router = useRouter();

const DEFAULT_CURRENT_RANGE: [string, string] = ['2024-10-01', '2024-12-08'];
const DEFAULT_COMPARE_RANGE: [string, string] = ['2023-10-01', '2023-12-08'];

const moreConditionVisible = ref(false);
const storeScopeText = ref('全店');
const currentDateRange = ref<[string, string]>([...DEFAULT_CURRENT_RANGE]);
const compareDateRange = ref<[string, string]>([...DEFAULT_COMPARE_RANGE]);
const tableData = ref<DiagnosisRecordRow[]>([]);
const levelOptions = ref<OptionVO[]>([
  { label: '一级品类', value: '1' },
  { label: '二级品类', value: '2' },
  { label: '三级品类', value: '3' },
  { label: '四级品类', value: '4' }
]);
const categoryOptions = ref<OptionVO[]>([]);
const storeOptions = ref<OptionVO[]>([]);
const sortState = reactive<SortState>({
  orderByColumn: undefined,
  isAsc: undefined
});

const queryForm = reactive({
  storeScope: '0',
  classLevel: '1' as string | number,
  classNos: [] as Array<string | number>,
  deptName: '',
  retailTypeName: '',
  businessCircleName: '',
  deptGroupName: ''
});

const normalizeText = (value?: string | number | null) => String(value ?? '').trim();
const findOptionByText = (options: OptionVO[], text: string) => options.find((item) => String(item.label || '').includes(text));

const parseClassTreePayload = (raw: any): CategoryClassTreeNodeVO[] => {
  const isCategoryNodeArray = (arr: any[]) =>
    Array.isArray(arr) &&
    arr.some((item) => typeof item === 'object' && item && (item.classNo || item.className || item.labelName || item.label || item.id || item.level));

  const queue: any[] = [raw];
  while (queue.length) {
    const current = queue.shift();
    if (Array.isArray(current) && isCategoryNodeArray(current)) {
      return current as CategoryClassTreeNodeVO[];
    }
    if (current && typeof current === 'object') {
      const preferred = [current.content, current.rows, current.list, current.result, current.data];
      preferred.forEach((item) => item != null && queue.push(item));
      Object.keys(current).forEach((key) => {
        const value = current[key];
        if (value != null && !preferred.includes(value)) {
          queue.push(value);
        }
      });
    }
  }
  return [];
};

const flattenClassTreeByLevel = (nodes: CategoryClassTreeNodeVO[], level: number): OptionVO[] => {
  const result: OptionVO[] = [];
  const walk = (list: CategoryClassTreeNodeVO[]) => {
    list.forEach((node) => {
      const value = normalizeText(node.id || node.level);
      const label = normalizeText(node.labelName || node.label || node.className);
      const levelFlag = Number(node.levelFlag || 0);
      if (value && label && levelFlag === level && value !== '0') {
        result.push({ label, value });
      }
      if (Array.isArray(node.children) && node.children.length) {
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return result;
};

const applyDefaults = () => {
  storeScopeText.value = storeOptions.value.find((item) => String(item.value) === '0')?.label || '全店';
  queryForm.storeScope = '0';
  queryForm.deptName = '';
  queryForm.retailTypeName = '';
  queryForm.businessCircleName = '';
  queryForm.deptGroupName = '';
  queryForm.classLevel = findOptionByText(levelOptions.value, '一级品类')?.value ?? levelOptions.value[0]?.value ?? '1';

  const defaultCategory = findOptionByText(categoryOptions.value, '004洗化部') ?? categoryOptions.value[0];
  queryForm.classNos = defaultCategory ? [defaultCategory.value] : [];
  currentDateRange.value = [...DEFAULT_CURRENT_RANGE];
  compareDateRange.value = [...DEFAULT_COMPARE_RANGE];
};

const buildQuery = (): DiagnosisRecordQuery => ({
  pageNum: 1,
  pageSize: 20,
  storeScope: queryForm.storeScope,
  classLevel: queryForm.classLevel,
  classNos: queryForm.classNos,
  periodStart: currentDateRange.value?.[0],
  periodEnd: currentDateRange.value?.[1],
  compareStart: compareDateRange.value?.[0],
  compareEnd: compareDateRange.value?.[1],
  orderByColumn: sortState.orderByColumn,
  isAsc: sortState.isAsc
});

const storeRequest = useRequest(async () => await findStore({ keyword: '', limit: 50 }), {
  onSuccess: (res) => {
    const rows = (res?.result || res?.data?.result || res?.data || res || []) as any[];
    const stores = rows
      .map((item) => {
        const storeNo = normalizeText(item.storeNo || item.value);
        const storeName = normalizeText(item.storeName || item.label);
        return {
          label: storeName ? `${storeNo} ${storeName}` : storeNo,
          value: storeNo
        } as OptionVO;
      })
      .filter((item) => item.value);
    storeOptions.value = [{ label: '全店', value: '0' }, ...stores];
  }
});

const listRequest = useRequest(async (params: DiagnosisRecordQuery) => await listDiagnosisRecords(params), {
  onSuccess: (res) => {
    const page = (res?.data?.data || res?.data || res || {}) as DiagnosisRecordPageResponse;
    tableData.value = Array.isArray(page.rows) ? page.rows : [];
  }
});

const tableLoading = computed(() => storeRequest.loading.value || listRequest.loading.value);

const loadClassTreeOptions = async (level: number) => {
  const res = await queryCategoryClassTree(level);
  const tree = parseClassTreePayload(res);
  categoryOptions.value = flattenClassTreeByLevel(tree, level);
};

const formatDate = (value?: string) => {
  if (!value) return '--';
  return value.replace(/-/g, '/');
};

const formatRange = (start?: string, end?: string) => {
  if (!start || !end) return '--';
  return `${formatDate(start)} - ${formatDate(end)}`;
};

const formatDateTime = (value?: string) => {
  if (!value) return '--';
  return value.replace('T', ' ').replace(/-/g, '/');
};

const isGenerated = (row: DiagnosisRecordRow) => {
  const text = `${row.statusLabel || ''}${row.status || ''}`.toUpperCase();
  return text.includes('生成') || text.includes('SUCCESS') || text.includes('READY');
};

const loadTableData = async () => {
  await listRequest.run(buildQuery());
};

const handleSearch = async () => {
  await loadTableData();
};

const handleReset = async () => {
  moreConditionVisible.value = false;
  sortState.orderByColumn = undefined;
  sortState.isAsc = undefined;
  await loadClassTreeOptions(Number(queryForm.classLevel || 1) || 1);
  applyDefaults();
  await loadTableData();
};

const handleSortChange = ({ prop, order }: { prop: string; order: 'ascending' | 'descending' | null }) => {
  const sortMap: Record<string, string> = {
    classNo: 'classNo',
    periodStart: 'periodStart',
    compareStart: 'compareStart',
    createTime: 'createTime'
  };
  sortState.orderByColumn = order ? sortMap[prop] : undefined;
  sortState.isAsc = order === 'ascending' ? 'asc' : order === 'descending' ? 'desc' : undefined;
  loadTableData();
};

const handleViewReport = async (row: DiagnosisRecordRow) => {
  const response = await createDiagnosisSession({
    classLevel: row.classLevel,
    classNo: row.classNo,
    className: row.className,
    deptId: row.deptId,
    retailTypeId: row.retailTypeId,
    businessCircleId: row.businessCircleId,
    deptGroupId: row.deptGroupId,
    storeNo: row.storeNo,
    periodStart: row.periodStart,
    periodEnd: row.periodEnd,
    compareStart: row.compareStart,
    compareEnd: row.compareEnd,
    triggerIfMissing: false,
    waitSeconds: 0
  });
  const session = response?.data?.data ?? response?.data;
  if (!session?.sessionId || !session.ready) {
    ElMessage.warning('报告尚未生成完成');
    return;
  }
  router.push({
    name: 'CategoryDiagnosisDetail',
    query: {
      sessionId: session.sessionId,
      categoryId: row.classNo,
      categoryName: row.className,
      storeNo: row.storeNo || '',
      startDate: row.periodStart,
      endDate: row.periodEnd,
      compareStartDate: row.compareStart || '',
      compareEndDate: row.compareEnd || ''
    }
  });
};

const initPage = async () => {
  await storeRequest.run(undefined as never);
  await loadClassTreeOptions(Number(queryForm.classLevel || 1) || 1);
  applyDefaults();
  await loadTableData();
};

watch(
  () => queryForm.classLevel,
  async (value) => {
    const level = Number(value || 1) || 1;
    await loadClassTreeOptions(level);
    const validSet = new Set(categoryOptions.value.map((item) => String(item.value)));
    queryForm.classNos = queryForm.classNos.filter((item) => validSet.has(String(item)));
    if (!queryForm.classNos.length && categoryOptions.value.length) {
      const defaultCategory = findOptionByText(categoryOptions.value, '004洗化部') ?? categoryOptions.value[0];
      if (defaultCategory) {
        queryForm.classNos = [defaultCategory.value];
      }
    }
  }
);

onMounted(() => {
  initPage();
});
</script>

<style scoped lang="scss">
.category-diagnosis-record-page {
  background: #f5f7fa;
  min-height: calc(100vh - 84px);
}

.filter-card,
.record-card {
  background: #fff;
  border: 1px solid #e5e7eb;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.filter-card {
  margin-bottom: 12px;
}

.filter-form {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
}

.filter-form :deep(.el-form-item) {
  margin-bottom: 12px;
}

.filter-item-fixed {
  width: 160px;
}

.filter-item-category {
  width: 220px;
}

.filter-item-date {
  width: 250px;
}

.filter-action-item {
  margin-left: auto;
}

.query-button {
  background: #20b2aa;
  border-color: #20b2aa;
}

.query-button:hover,
.query-button:focus {
  background: #1ca29b;
  border-color: #1ca29b;
}

.more-condition-wrap {
  padding-top: 4px;
  border-top: 1px solid #f0f2f5;
}

.record-title {
  font-size: 18px;
  font-weight: 700;
  color: #111827;
}

.category-cell {
  line-height: 1.5;
}

.category-code {
  font-weight: 700;
  color: #111827;
}

.category-name {
  color: #4b5563;
}

.status-text {
  display: inline-flex;
  align-items: center;
  color: #4b5563;
}

.status-text.generated {
  color: #16a34a;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  margin-right: 6px;
}

.record-card :deep(.el-table th) {
  background: #fafafa;
  color: #374151;
  font-weight: 600;
}

.record-card :deep(.el-button--success.is-link) {
  color: #20b2aa;
}

.record-card :deep(.el-button--success.is-link:hover) {
  color: #1ca29b;
}

.disabled-report {
  color: #9ca3af;
}

@media (max-width: 1400px) {
  .filter-action-item {
    margin-left: 0;
  }
}
</style>

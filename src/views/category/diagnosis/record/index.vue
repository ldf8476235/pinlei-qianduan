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
            :disabled="queryForm.classLevel === ''"
            class="filter-item-category"
            :placeholder="queryForm.classLevel === '' ? '全部级别不筛选品类' : '请选择品类'"
          >
            <el-option v-for="item in categoryOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="生成时间">
          <el-segmented v-model="dateShortcut" :options="dateShortcutOptions" class="date-shortcut" />
        </el-form-item>
        <el-form-item class="filter-action-item">
          <el-button @click="handleReset">重置</el-button>
          <el-button type="success" class="query-button" @click="handleSearch">查询</el-button>
        </el-form-item>
      </el-form>
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
            <span class="status-text" :class="{ generated: isGenerated(row), failed: isFailed(row) }">
              <span class="status-dot" />
              {{ row.statusLabel || row.status || '--' }}
            </span>
          </template>
        </el-table-column>
        <el-table-column label="计算进度" prop="progressPercent" min-width="180">
          <template #default="{ row }">
            <div class="progress-cell">
              <el-progress
                :percentage="normalizeProgress(row)"
                :status="progressStatus(row)"
                :stroke-width="8"
                :show-text="false"
              />
              <div class="progress-meta">
                <span>{{ normalizeProgress(row) }}%</span>
                <span>{{ stageLabel(row.currentStage) }}</span>
              </div>
            </div>
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

const storeScopeText = ref('全店');
const dateShortcut = ref<'all' | 'today' | 'yesterday' | 'last30'>('all');
const tableData = ref<DiagnosisRecordRow[]>([]);
const levelOptions = ref<OptionVO[]>([
  { label: '全部级别', value: '' },
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
  classLevel: '' as string | number,
  classNos: [] as Array<string | number>,
  deptName: '',
  retailTypeName: '',
  businessCircleName: '',
  deptGroupName: ''
});

const dateShortcutOptions = [
  { label: '全部', value: 'all' },
  { label: '今日', value: 'today' },
  { label: '昨日', value: 'yesterday' },
  { label: '近30日', value: 'last30' }
];

const normalizeText = (value?: string | number | null) => String(value ?? '').trim();

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
  queryForm.classLevel = '';
  queryForm.classNos = [];
  dateShortcut.value = 'all';
};

const toDateString = (date: Date) => {
  const year = date.getFullYear();
  const month = `${date.getMonth() + 1}`.padStart(2, '0');
  const day = `${date.getDate()}`.padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const addDays = (date: Date, days: number) => {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
};

const resolveCreateRange = () => {
  const today = new Date();
  if (dateShortcut.value === 'today') {
    const value = toDateString(today);
    return { createStart: value, createEnd: value };
  }
  if (dateShortcut.value === 'yesterday') {
    const value = toDateString(addDays(today, -1));
    return { createStart: value, createEnd: value };
  }
  if (dateShortcut.value === 'last30') {
    return { createStart: toDateString(addDays(today, -29)), createEnd: toDateString(today) };
  }
  return {};
};

const buildQuery = (): DiagnosisRecordQuery => {
  const query: DiagnosisRecordQuery = {
    pageNum: 1,
    pageSize: 0,
    storeScope: queryForm.storeScope,
    classNos: queryForm.classNos,
    orderByColumn: sortState.orderByColumn,
    isAsc: sortState.isAsc,
    ...resolveCreateRange()
  };
  if (queryForm.classLevel !== '') {
    query.classLevel = queryForm.classLevel;
  }
  return query;
};

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

const parseLocalDate = (value?: string) => {
  if (!value) return undefined;
  const [year, month, day] = value.split('-').map(Number);
  if (!year || !month || !day) return undefined;
  return new Date(year, month - 1, day);
};

const formatLocalDate = (date: Date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

const inclusiveDays = (start?: string, end?: string) => {
  const startDate = parseLocalDate(start);
  const endDate = parseLocalDate(end);
  if (!startDate || !endDate) return 0;
  return Math.floor((endDate.getTime() - startDate.getTime()) / 86400000) + 1;
};

const alignCompareEnd = (periodStart?: string, periodEnd?: string, compareStart?: string, compareEnd?: string) => {
  const days = inclusiveDays(periodStart, periodEnd);
  const start = parseLocalDate(compareStart);
  if (days <= 0 || !start) return compareEnd;
  const end = new Date(start);
  end.setDate(end.getDate() + days - 1);
  return formatLocalDate(end);
};

const formatDateTime = (value?: string) => {
  if (!value) return '--';
  return value.replace('T', ' ').replace(/-/g, '/');
};

const isGenerated = (row: DiagnosisRecordRow) => {
  const text = `${row.statusLabel || ''}${row.status || ''}`.toUpperCase();
  if (isFailed(row)) return false;
  return text.includes('生成成功') || text.includes('已生成') || text.includes('SUCCESS') || text.includes('READY') || text.includes('DONE');
};

const isFailed = (row: DiagnosisRecordRow) => {
  const text = `${row.statusLabel || ''}${row.status || ''}${row.currentStage || ''}`.toUpperCase();
  return text.includes('失败') || text.includes('FAILED') || text.includes('ERROR');
};

const normalizeProgress = (row: DiagnosisRecordRow) => {
  if (isGenerated(row)) return 100;
  const value = Number(row.progressPercent ?? 0);
  if (!Number.isFinite(value)) return 0;
  return Math.max(0, Math.min(100, Math.round(value)));
};

const progressStatus = (row: DiagnosisRecordRow) => {
  if (isFailed(row)) return 'exception';
  if (isGenerated(row)) return 'success';
  return undefined;
};

const stageLabel = (stage?: string) => {
  const map: Record<string, string> = {
    WAIT_PRECOMPUTE: '等待计算',
    PLAN_WINDOW: '规划窗口',
    INIT: '初始化',
    PREPARE: '准备数据',
    READ_SOURCE: '读取数据',
    WRITE_SNAPSHOT: '写入快照',
    DONE: '已完成',
    FAILED: '计算失败',
    ERROR: '计算失败'
  };
  const key = String(stage || '').trim();
  return map[key] || key || '等待计算';
};

const loadTableData = async () => {
  await listRequest.run(buildQuery());
};

const handleSearch = async () => {
  await loadTableData();
};

const handleReset = async () => {
  sortState.orderByColumn = undefined;
  sortState.isAsc = undefined;
  applyDefaults();
  categoryOptions.value = [];
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
  const alignedCompareEnd = alignCompareEnd(row.periodStart, row.periodEnd, row.compareStart, row.compareEnd);
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
    compareEnd: alignedCompareEnd,
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
      compareEndDate: alignedCompareEnd || ''
    }
  });
};

const initPage = async () => {
  await storeRequest.run(undefined as never);
  applyDefaults();
  await loadTableData();
};

watch(
  () => queryForm.classLevel,
  async (value) => {
    if (value === '') {
      categoryOptions.value = [];
      queryForm.classNos = [];
      return;
    }
    const level = Number(value || 1) || 1;
    await loadClassTreeOptions(level);
    const validSet = new Set(categoryOptions.value.map((item) => String(item.value)));
    queryForm.classNos = queryForm.classNos.filter((item) => validSet.has(String(item)));
  }
);

watch(dateShortcut, () => {
  loadTableData();
});

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

.date-shortcut {
  --el-segmented-item-selected-color: #fff;
  --el-segmented-item-selected-bg-color: #ff6a00;
  --el-border-radius-base: 999px;
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

.status-text.failed {
  color: #dc2626;
}

.status-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: currentColor;
  margin-right: 6px;
}

.progress-cell {
  min-width: 140px;
}

.progress-cell :deep(.el-progress-bar__outer) {
  background: #fff3e8;
}

.progress-cell :deep(.el-progress-bar__inner) {
  background: linear-gradient(90deg, #ff9a1f 0%, #ff6a00 100%);
}

.progress-meta {
  display: flex;
  justify-content: space-between;
  gap: 8px;
  margin-top: 4px;
  color: #8a4b20;
  font-size: 12px;
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

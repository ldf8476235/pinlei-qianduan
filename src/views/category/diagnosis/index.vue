<template>
  <div class="p-2 category-diagnosis-page">
    <el-row :gutter="16" class="feature-row">
      <el-col v-for="item in featureCards" :key="item.title" :lg="6" :md="12" :sm="12" :xs="24">
        <el-card shadow="hover" class="feature-card">
          <div class="feature-icon-wrap">
            <el-icon class="feature-icon">
              <component :is="item.icon" />
            </el-icon>
          </div>
          <div class="feature-title">{{ item.title }}</div>
          <div class="feature-subtitle">{{ item.subtitle }}</div>
          <span class="feature-corner" />
        </el-card>
      </el-col>
    </el-row>

    <el-card shadow="hover" class="diagnosis-card">
      <template #header>
        <div class="diagnosis-header">
          <span class="diagnosis-title">诊断对象</span>
          <el-button type="primary" plain class="history-btn" @click="handleHistory">历史诊断记录</el-button>
        </div>
      </template>

      <el-form ref="formRef" :model="form" :rules="rules" label-width="90px" class="diagnosis-form">
        <el-form-item label="品类" prop="categoryId">
          <el-cascader
            v-model="form.categoryId"
            class="full-input category-cascader"
            :options="categoryTreeOptions"
            :props="categoryCascaderProps"
            clearable
            filterable
            :show-all-levels="false"
            placeholder="请选择品类"
            popper-class="category-cascader-popper"
          >
            <template #default="{ node, data }">
              <span class="category-option-left">
                <span class="category-radio-wrap">
                  <span class="category-radio-outer" :class="{ active: isCategoryActive(data) }">
                    <span class="category-radio-inner" />
                  </span>
                </span>
                <span class="category-option-label">{{ data.label }}</span>
              </span>
            </template>
          </el-cascader>
        </el-form-item>
        <el-form-item label="门店范围" prop="storeScope">
          <el-select v-model="form.storeScope" clearable filterable placeholder="请选择门店范围" class="full-input">
            <el-option v-for="item in storeOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
          </el-select>
        </el-form-item>
        <el-form-item label="本期日期" prop="currentDateRange">
          <el-date-picker
            v-model="form.currentDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            range-separator="-"
            class="full-input"
          />
        </el-form-item>
        <el-form-item label="对比日期" prop="compareDateRange">
          <el-date-picker
            v-model="form.compareDateRange"
            type="daterange"
            value-format="YYYY-MM-DD"
            start-placeholder="开始日期"
            end-placeholder="结束日期"
            range-separator="-"
            class="full-input"
          />
        </el-form-item>

        <div class="submit-wrap">
          <el-button type="primary" size="large" class="submit-btn" :loading="submitLoading" @click="handleSubmit">立即诊断</el-button>
        </div>
      </el-form>
    </el-card>
  </div>
</template>

<script setup name="CategoryDiagnosis" lang="ts">
import type { FormInstance, FormRules } from 'element-plus';
import { Aim, DataAnalysis, Goods, TrendCharts } from '@element-plus/icons-vue';
import { findStore, queryCategoryClassTree } from '@/api/category/tree';
import type { CategoryClassTreeNodeVO, OptionVO } from '@/api/category/tree/types';
import { createDiagnosisSession } from '@/api/category/diagnosis';
import { useRequest } from '@/hooks/useRequest';

interface DiagnosisForm {
  categoryId: string | number | undefined;
  storeScope: string | number | undefined;
  currentDateRange: string[];
  compareDateRange: string[];
}

interface CategoryTreeOption {
  label: string;
  value: string;
  classLevel?: number;
  className?: string;
  children?: CategoryTreeOption[];
}

const featureCards = [
  { title: '纵观品类整体', subtitle: '掌握品类整体情况和发力点', icon: DataAnalysis },
  { title: '定位异常品项', subtitle: '及时优化表现差的商品', icon: Aim },
  { title: '深究用户需求', subtitle: '助力品项优化与补充', icon: Goods },
  { title: '整合调整方向', subtitle: '指导品类优化与执行', icon: TrendCharts }
];

const formRef = ref<FormInstance>();
const router = useRouter();
const route = useRoute();
const categoryTreeOptions = ref<CategoryTreeOption[]>([]);
const storeOptions = ref<OptionVO[]>([]);
const submitLoading = ref(false);

const DEFAULT_DIAGNOSIS_CATEGORY_ID = '001';
const DEFAULT_STORE_SCOPE = '0';
const DEFAULT_CURRENT_DATE_RANGE = ['2026-04-01', '2026-04-30'];
const DEFAULT_COMPARE_DATE_RANGE = ['2026-03-01', '2026-03-30'];

const form = reactive<DiagnosisForm>({
  categoryId: undefined,
  storeScope: undefined,
  currentDateRange: [],
  compareDateRange: []
});

const rules: FormRules<DiagnosisForm> = {
  categoryId: [{ required: true, message: '品类不能为空', trigger: 'change' }],
  storeScope: [{ required: true, message: '门店范围不能为空', trigger: 'change' }],
  currentDateRange: [{ required: true, message: '本期日期不能为空', trigger: 'change' }],
  compareDateRange: [{ required: true, message: '对比日期不能为空', trigger: 'change' }]
};

const normalizeText = (value?: string | number | null) => String(value ?? '').trim();

const firstRouteQueryValue = (...keys: string[]) => {
  for (const key of keys) {
    const rawValue = route.query[key];
    const value = Array.isArray(rawValue) ? rawValue[0] : rawValue;
    const text = normalizeText(value as string | number | null);
    if (text) return text;
  }
  return '';
};

const resolveRouteStoreScope = () => {
  const storeNo = firstRouteQueryValue('storeNo', 'storeScope');
  return storeNo || DEFAULT_STORE_SCOPE;
};

const resolveRouteDateRange = (startKeys: string[], endKeys: string[], fallback: string[]) => {
  const start = firstRouteQueryValue(...startKeys);
  const end = firstRouteQueryValue(...endKeys);
  return start && end ? [start, end] : [...fallback];
};

const normalizeLevel = (value?: string | number | null): number | undefined => {
  const level = Number(value);
  return Number.isInteger(level) && level > 0 ? level : undefined;
};

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

const categoryCascaderProps = {
  value: 'value',
  label: 'label',
  children: 'children',
  emitPath: false as const,
  checkStrictly: true,
  expandTrigger: 'hover' as const
};

const formatCategoryLabel = (value: string, name: string) => {
  if (!value) return name;
  if (!name) return value;
  return name.startsWith(value) ? name : `${value}${name}`;
};

const toCategoryTreeOptions = (nodes: CategoryClassTreeNodeVO[]): CategoryTreeOption[] => {
  const resolveChildren = (node: any): CategoryClassTreeNodeVO[] => {
    if (Array.isArray(node?.children)) return node.children as CategoryClassTreeNodeVO[];
    if (Array.isArray(node?.subClass)) return node.subClass as CategoryClassTreeNodeVO[];
    return [];
  };

  const resolveValue = (node: any) => normalizeText(node?.id || node?.classNo || node?.value || node?.level);
  const resolveName = (node: any) => normalizeText(node?.labelName || node?.label || node?.className || node?.name);
  const resolveParent = (node: any) => normalizeText(node?.parentClassNo || node?.parentId || node?.pId || node?.pid);
  const resolveLevel = (node: any) => normalizeLevel(node?.classLevel || node?.levelFlag || node?.level || node?.flevel);

  const normalizeTree = (list: CategoryClassTreeNodeVO[]): CategoryClassTreeNodeVO[] => {
    const hasNested = list.some((item: any) => resolveChildren(item).length > 0);
    if (hasNested) return list;

    const hasParentField = list.some((item: any) => resolveParent(item));
    if (!hasParentField) return list;

    const nodeMap = new Map<string, any>();
    const roots: any[] = [];
    list.forEach((item: any) => {
      const key = resolveValue(item);
      if (!key) return;
      nodeMap.set(key, { ...item, children: [] });
    });
    nodeMap.forEach((item) => {
      const parentKey = resolveParent(item);
      if (!parentKey || parentKey === '0' || !nodeMap.has(parentKey)) {
        roots.push(item);
      } else {
        nodeMap.get(parentKey).children.push(item);
      }
    });
    return roots as CategoryClassTreeNodeVO[];
  };

  const toNodeList = (list: CategoryClassTreeNodeVO[], depth = 1): CategoryTreeOption[] => {
    const result: CategoryTreeOption[] = [];
    list.forEach((node) => {
      const value = resolveValue(node);
      const name = resolveName(node);
      const children = toNodeList(resolveChildren(node), depth + 1);
      if (!value || value === '0' || !name) {
        if (children.length) {
          result.push(...children);
        }
        return;
      }
      const current: CategoryTreeOption = {
        label: formatCategoryLabel(value, name),
        value,
        classLevel: resolveLevel(node) || depth,
        className: name
      };
      if (children.length) {
        current.children = children;
      }
      result.push(current);
    });
    return result;
  };
  return toNodeList(normalizeTree(nodes));
};

const findCategoryOption = (
  value: string | number | undefined,
  list: CategoryTreeOption[]
): CategoryTreeOption | undefined => {
  const target = String(value || '');
  if (!target) return undefined;
  for (const item of list) {
    if (String(item.value) === target) {
      return item;
    }
    if (item.children?.length) {
      const child = findCategoryOption(target, item.children);
      if (child) return child;
    }
  }
  return undefined;
};

const classTreeRequest = useRequest(async () => await queryCategoryClassTree(4), {
  onSuccess: (res) => {
    const tree = parseClassTreePayload(res);
    categoryTreeOptions.value = toCategoryTreeOptions(tree);
  }
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

const initOptions = async () => {
  await Promise.all([classTreeRequest.run(undefined as never), storeRequest.run(undefined as never)]);
};

const applyInitialFormValues = () => {
  const routeCategoryId = firstRouteQueryValue('categoryId', 'classNo', 'classNos');
  const defaultCategory = findCategoryOption(routeCategoryId || DEFAULT_DIAGNOSIS_CATEGORY_ID, categoryTreeOptions.value);
  const fallbackCategory = categoryTreeOptions.value[0];
  form.categoryId = defaultCategory?.value || fallbackCategory?.value;
  form.storeScope = resolveRouteStoreScope();
  form.currentDateRange = resolveRouteDateRange(['currentStartDate', 'startDate', 'periodStart'], ['currentEndDate', 'endDate', 'periodEnd'], DEFAULT_CURRENT_DATE_RANGE);
  form.compareDateRange = resolveRouteDateRange(['compareStartDate', 'compareStart'], ['compareEndDate', 'compareEnd'], DEFAULT_COMPARE_DATE_RANGE);
};

const isCategoryActive = (data: CategoryTreeOption) => String(form.categoryId || '') === String(data.value);

const handleHistory = () => {
  router.push('/category/diagnosis/record');
};

const handleSubmit = async () => {
  if (!formRef.value) return;
  await formRef.value.validate(async (valid) => {
    if (!valid) return;
    submitLoading.value = true;
    try {
      const categoryId = form.categoryId ? String(form.categoryId) : '';
      const categoryOption = findCategoryOption(form.categoryId, categoryTreeOptions.value);
      const categoryName = categoryOption?.className || categoryOption?.label || '';
      const classLevel = categoryOption?.classLevel || 1;
      const storeNo = form.storeScope && String(form.storeScope) !== '0' ? String(form.storeScope) : '';
      const response = await createDiagnosisSession({
        classLevel,
        classNo: categoryId,
        className: categoryName,
        storeNo,
        periodStart: form.currentDateRange?.[0] || '',
        periodEnd: form.currentDateRange?.[1] || '',
        compareStart: form.compareDateRange?.[0] || '',
        compareEnd: form.compareDateRange?.[1] || '',
        triggerIfMissing: true,
        waitSeconds: 0
      });
      const session = response?.data?.data ?? response?.data;
      if (!session?.sessionId) {
        ElMessage.error('诊断会话创建失败');
        return;
      }
      if (!session.ready) {
        await ElMessageBox.alert('当前诊断任务正在计算中，请稍后在历史诊断记录中查看。', '提示', {
          confirmButtonText: '我知道了',
          type: 'info'
        });
        return;
      }
      await router.push({
        name: 'CategoryDiagnosisDetail',
        query: {
          sessionId: session.sessionId,
          categoryId,
          categoryName,
          categoryLevel: String(classLevel),
          storeNo,
          startDate: form.currentDateRange?.[0] || '',
          endDate: form.currentDateRange?.[1] || '',
          compareStartDate: form.compareDateRange?.[0] || '',
          compareEndDate: form.compareDateRange?.[1] || ''
        }
      });
    } finally {
      submitLoading.value = false;
    }
  });
};

onMounted(() => {
  initOptions().then(() => {
    applyInitialFormValues();
  });
});
</script>

<style scoped lang="scss">
.category-diagnosis-page {
  background:
    radial-gradient(circle at 12% 6%, rgba(249, 115, 22, 0.1), transparent 28%),
    linear-gradient(180deg, #fffaf5 0%, #f6f7fb 42%, #f5f7fa 100%);
  min-height: calc(100vh - 84px);
}

.feature-row {
  margin-bottom: 16px;
}

.feature-card {
  position: relative;
  overflow: hidden;
  background:
    radial-gradient(circle at 86% 16%, rgba(251, 146, 60, 0.18), transparent 30%),
    linear-gradient(180deg, #ffffff 0%, #fffaf5 100%);
  border: 1px solid #fed7aa;
  box-shadow: 0 12px 30px rgba(154, 52, 18, 0.08);
  text-align: center;
  min-height: 220px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease,
    border-color 0.2s ease;
}

.feature-card:hover {
  transform: translateY(-3px);
  border-color: #fb923c;
  box-shadow: 0 18px 42px rgba(249, 115, 22, 0.16);
}

.feature-card :deep(.el-card__body) {
  position: relative;
  z-index: 1;
  width: 100%;
  height: 100%;
  overflow: hidden;
  padding: 18px 20px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.feature-icon-wrap {
  width: 76px;
  height: 76px;
  margin: 0 auto 14px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 26px;
  background:
    linear-gradient(135deg, rgba(255, 237, 213, 0.96), rgba(255, 247, 237, 0.96)),
    #fff7ed;
  border: 1px solid rgba(251, 146, 60, 0.34);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 14px 28px rgba(249, 115, 22, 0.18);
}

.feature-icon {
  font-size: 38px;
  color: #f97316;
}

.feature-corner {
  position: absolute;
  right: -24px;
  bottom: -24px;
  width: 92px;
  height: 92px;
  border-radius: 999px;
  background: rgba(249, 115, 22, 0.08);
}

.feature-title {
  font-size: 18px;
  font-weight: 700;
  color: #7c2d12;
  margin-bottom: 8px;
}

.feature-subtitle {
  font-size: 14px;
  font-weight: 400;
  color: #9a3412;
  line-height: 1.4;
}

.diagnosis-card {
  background: rgba(255, 255, 255, 0.92);
  border: 1px solid #fed7aa;
  box-shadow: 0 14px 32px rgba(154, 52, 18, 0.08);
}

.diagnosis-card :deep(.el-card__header) {
  background: linear-gradient(90deg, #fff7ed 0%, #ffffff 100%);
  border-bottom-color: #ffedd5;
}

.diagnosis-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.diagnosis-title {
  font-size: 16px;
  font-weight: 800;
  color: #7c2d12;
}

.history-btn {
  border-radius: 999px;
  color: #f97316;
  border-color: #fdba74;
  background: #fff7ed;
}

.history-btn:hover,
.history-btn:focus {
  color: #fff;
  border-color: #f97316;
  background: #f97316;
}

.diagnosis-form {
  padding-top: 8px;
  max-width: 800px;
  margin: 0 auto;
}

.diagnosis-form :deep(.el-form-item) {
  margin-bottom: 18px;
  justify-content: center;
}

.diagnosis-form :deep(.el-form-item__label) {
  text-align: left;
  color: #7c2d12;
  font-weight: 700;
}

.diagnosis-form :deep(.el-form-item__content) {
  max-width: 480px;
  flex: 0 1 480px;
}

.full-input {
  width: 100%;
}

.full-input :deep(.el-input__wrapper),
.full-input :deep(.el-range-editor.el-input__wrapper) {
  min-height: 40px;
  border-radius: 10px;
  box-shadow: 0 0 0 1px #e5e7eb inset;
}

.full-input :deep(.el-input__wrapper:hover),
.full-input :deep(.el-range-editor.el-input__wrapper:hover),
.full-input :deep(.el-input__wrapper.is-focus),
.full-input :deep(.el-range-editor.el-input__wrapper.is-focus) {
  box-shadow: 0 0 0 1px #f97316 inset;
}

.category-cascader :deep(.el-input__wrapper) {
  border-radius: 6px;
}

:deep(.category-cascader-popper) {
  border-radius: 6px;
  padding: 0;
}

:deep(.category-cascader-popper .el-cascader-panel) {
  border: 0;
}

:deep(.category-cascader-popper .el-scrollbar__wrap) {
  overflow-x: hidden;
}

:deep(.category-cascader-popper .el-cascader-menu) {
  min-width: 220px;
}

:deep(.category-cascader-popper .el-cascader-menu:first-child) {
  border-right: 1px solid var(--el-border-color-lighter);
}

:deep(.category-cascader-popper .el-cascader-node) {
  padding: 0 10px;
}

:deep(.category-cascader-popper .el-cascader-node__label) {
  width: 100%;
  padding: 0;
}

:deep(.category-cascader-popper .el-cascader-node__postfix) {
  color: #9ca3af;
}

:deep(.category-cascader-popper .el-cascader-node:hover .el-cascader-node__postfix) {
  color: #4b5563;
}

.category-option-left {
  display: inline-flex;
  align-items: center;
  width: 100%;
  color: #111827;
  font-size: 14px;
}

.category-radio-wrap {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  margin-right: 8px;
}

.category-radio-outer {
  width: 14px;
  height: 14px;
  border-radius: 50%;
  border: 1.5px solid #9ca3af;
  position: relative;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.category-radio-inner {
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: transparent;
}

.category-radio-outer.active {
  border-color: #f97316;
}

.category-radio-outer.active .category-radio-inner {
  background: #f97316;
}

.category-option-label {
  flex: 1;
}

:deep(.category-cascader-popper .el-cascader-node.is-active .category-option-label) {
  color: #f97316;
  font-weight: 700;
}

.submit-wrap {
  margin-top: 20px;
  text-align: center;
}

.submit-btn {
  min-width: 160px;
  border-radius: 999px;
  background: linear-gradient(135deg, #ff8a1c 0%, #f97316 50%, #ea580c 100%);
  border-color: #f97316;
  box-shadow: 0 12px 28px rgba(249, 115, 22, 0.22);
}

.submit-btn:hover,
.submit-btn:focus {
  background: linear-gradient(135deg, #fb923c 0%, #f97316 50%, #c2410c 100%);
  border-color: #ea580c;
  transform: translateY(-1px);
}

@media (max-width: 992px) {
  .feature-card {
    min-height: 190px;
  }

  .diagnosis-form :deep(.el-form-item__content) {
    max-width: 100%;
    flex: 1 1 auto;
  }
}
</style>

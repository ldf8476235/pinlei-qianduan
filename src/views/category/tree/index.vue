<template>
  <div class="p-2 category-tree-page">
    <el-card shadow="hover" class="mb-[12px]">
      <div class="query-header">
        <div class="update-time">更新时间：{{ updateTimeText }}</div>
        <div class="query-actions">
          <el-button text @click="queryCollapsed = !queryCollapsed">{{ queryCollapsed ? '展开' : '收起' }}</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-hasPermi="['category:tree:list']" type="success" icon="Search" @click="handleSearch">查询</el-button>
        </div>
      </div>

      <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
        <div v-show="!queryCollapsed" class="query-form-wrap">
          <el-form :model="queryForm" :inline="true" label-width="88px">
            <el-form-item label="门店范围">
              <el-select v-model="queryForm.storeScopeMode" style="width: 170px" @change="handleStoreScopeChange">
                <el-option label="全部" value="0" />
                <el-option label="其他店铺" value="other" />
              </el-select>
            </el-form-item>

            <el-form-item v-if="queryForm.storeScopeMode === 'other'" label="选择门店">
              <el-select
                v-model="queryForm.storeNo"
                filterable
                clearable
                remote
                reserve-keyword
                placeholder="请输入门店编码或名称"
                :remote-method="handleStoreSearch"
                :loading="storeLoading"
                style="width: 260px"
                @visible-change="handleStoreVisible"
              >
                <el-option
                  v-for="item in storeCandidates"
                  :key="item.storeNo"
                  :label="`${item.storeNo} ${item.storeName || ''}`"
                  :value="item.storeNo"
                />
              </el-select>
            </el-form-item>

            <el-form-item label="品类级别">
              <el-select v-model="queryForm.categoryLevel" style="width: 160px">
                <el-option v-for="item in categoryLevelOptions" :key="String(item.value)" :label="item.label" :value="Number(item.value)" />
              </el-select>
            </el-form-item>

            <el-form-item label="品类">
              <el-select
                v-model="queryForm.categoryIds"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="2"
                placeholder="全部"
                style="width: 280px"
              >
                <el-option v-for="item in categoryOptions" :key="String(item.value)" :label="item.label" :value="String(item.value)" />
              </el-select>
            </el-form-item>

            <el-form-item label="品类角色">
              <el-select
                v-model="queryForm.roleNos"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="2"
                placeholder="全部"
                style="width: 260px"
              >
                <el-option v-for="item in roleOptions" :key="String(item.value)" :label="item.label" :value="String(item.value)" />
              </el-select>
            </el-form-item>

            <el-form-item label="SKU异常">
              <el-select
                v-model="queryForm.skuAbnormalTypes"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="2"
                placeholder="全部"
                style="width: 260px"
              >
                <el-option v-for="item in skuAbnormalOptions" :key="String(item.value)" :label="item.label" :value="String(item.value)" />
              </el-select>
            </el-form-item>
          </el-form>
        </div>
      </transition>
    </el-card>

    <el-card shadow="hover" class="tree-card">
      <template #header>
        <div class="tree-header">
          <div class="tree-title">品类树</div>
          <el-button class="download-btn" @click="downloadTreeImage">下载树图</el-button>
        </div>
      </template>

      <div class="tips-banner">
        品类实际SKU数以所选门店范围下在向前30天内有（销售或有库存）且状态为上架的商品作为统计依据！品类角色和标准SKU数来源于企业设置！
      </div>

      <div class="legend-wrap">
        <div v-for="item in legendItems" :key="item.roleName" class="legend-item">
          <span class="legend-dot" :style="{ backgroundColor: item.color }" />
          <span>{{ item.roleName }}</span>
        </div>
      </div>

      <div v-loading="treeLoading" class="chart-wrap" :style="{ height: chartHeight }">
        <div ref="chartRef" class="chart-inner" />
      </div>
    </el-card>
  </div>
</template>

<script setup name="CategoryTree" lang="ts">
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { findStore, getCategoryFilterOptions, queryCategoryClassTree, queryCategoryTree } from '@/api/category/tree';
import type {
  CategoryClassTreeNodeVO,
  CategoryFilterPayloadVO,
  CategoryTreeQuery,
  LegacyTreeNodeVO,
  OptionVO,
  StoreOptionResponse
} from '@/api/category/tree/types';

const proxy = getCurrentInstance()?.proxy as any;
const chartRef = ref<HTMLDivElement>();
const chartIns = ref<echarts.ECharts>();

const queryCollapsed = ref(false);
const treeLoading = ref(false);
const storeLoading = ref(false);
const updateTime = ref('');
const chartHeight = ref('560px');

const categoryLevelOptions = ref<OptionVO[]>([
  { label: '一级品类', value: '1' },
  { label: '二级品类', value: '2' },
  { label: '三级品类', value: '3' },
  { label: '四级品类', value: '4' }
]);
const categoryOptions = ref<OptionVO[]>([]);
const roleOptions = ref<OptionVO[]>([]);
const skuAbnormalOptions = ref<OptionVO[]>([]);
const storeCandidates = ref<StoreOptionResponse[]>([]);

const legendItems = [
  { roleName: '明星品类', color: '#e53935' },
  { roleName: '幼童品类', color: '#fb8c00' },
  { roleName: '结构品类', color: '#43a047' },
  { roleName: '金牛品类', color: '#1e88e5' }
];

const ROLE_COLOR_MAP: Record<string, string> = {
  明星品类: '#e53935',
  幼童品类: '#fb8c00',
  结构品类: '#43a047',
  金牛品类: '#1e88e5'
};

const DEFAULT_CLASS_ROLE = ['0', '1', '2', '3', '4', '5'];
const DEFAULT_SKU_ABNORMAL = ['0', '1', '2', '3'];

const queryForm = reactive({
  storeScopeMode: '0',
  storeNo: '',
  categoryLevel: 1,
  categoryIds: [] as string[],
  roleNos: [] as string[],
  skuAbnormalTypes: [] as string[]
});

const updateTimeText = computed(() => updateTime.value || '--');

const normalizeText = (value?: string | number | null) => String(value ?? '').trim();

const parseFilterPayload = (raw: any): CategoryFilterPayloadVO => {
  return (raw?.result || raw?.data?.result || raw?.data || raw || {}) as CategoryFilterPayloadVO;
};

const parseTreePayload = (raw: any): LegacyTreeNodeVO[] => {
  const data = raw?.result || raw?.data?.result || raw?.data;
  if (Array.isArray(data)) return data as LegacyTreeNodeVO[];
  return [];
};

const parseClassTreePayload = (raw: any): CategoryClassTreeNodeVO[] => {
  const data = raw?.content || raw?.result?.content || raw?.data?.content || [];
  return Array.isArray(data) ? (data as CategoryClassTreeNodeVO[]) : [];
};

const toOption = (item: any): OptionVO | null => {
  const label = normalizeText(item?.label);
  const value = normalizeText(item?.value);
  if (!label || !value) return null;
  return { label, value };
};

const initFilterOptions = async () => {
  const res = await getCategoryFilterOptions();
  const payload = parseFilterPayload(res);

  const levels = Array.isArray(payload.categoryLevels) ? (payload.categoryLevels.map(toOption).filter(Boolean) as OptionVO[]) : [];
  if (levels.length) categoryLevelOptions.value = levels;

  const roles = Array.isArray(payload.categoryRoles) ? (payload.categoryRoles.map(toOption).filter(Boolean) as OptionVO[]) : [];
  roleOptions.value = roles;

  const skuSource = Array.isArray(payload.skuAbnormal) ? payload.skuAbnormal : [];
  skuAbnormalOptions.value = skuSource.map(toOption).filter(Boolean) as OptionVO[];
};

const flattenClassTreeByLevel = (nodes: CategoryClassTreeNodeVO[], level: number): OptionVO[] => {
  const result: OptionVO[] = [];
  const walk = (list: CategoryClassTreeNodeVO[]) => {
    list.forEach((node) => {
      const value = normalizeText(node.level || node.id);
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

const loadClassTreeOptions = async (level: number) => {
  const res = await queryCategoryClassTree(level);
  const tree = parseClassTreePayload(res);
  categoryOptions.value = flattenClassTreeByLevel(tree, level);
};

const handleStoreScopeChange = () => {
  if (queryForm.storeScopeMode !== 'other') {
    queryForm.storeNo = '';
  }
};

const handleStoreVisible = async (visible: boolean) => {
  if (!visible || queryForm.storeScopeMode !== 'other' || storeCandidates.value.length) return;
  await handleStoreSearch('');
};

const handleStoreSearch = async (keyword: string) => {
  if (queryForm.storeScopeMode !== 'other') return;
  storeLoading.value = true;
  try {
    const res = await findStore({ keyword: normalizeText(keyword), limit: 50 });
    const rows = (res?.result || res?.data?.result || res?.data || res || []) as any[];
    storeCandidates.value = rows
      .map((item) => ({
        storeNo: normalizeText(item.storeNo || item.value),
        storeName: normalizeText(item.storeName || item.label)
      }))
      .filter((item) => item.storeNo);
  } finally {
    storeLoading.value = false;
  }
};

const resolveClassNo = (): string[] => {
  if (queryForm.categoryIds.length) return queryForm.categoryIds.map((item) => String(item));
  const allCodes = categoryOptions.value.map((item) => String(item.value)).filter((item) => /^\d+$/.test(item));
  return allCodes;
};

const buildTreeQuery = (): CategoryTreeQuery => ({
  deptId: 1,
  retailTypeId: '0',
  businessCircleId: '0',
  deptGroupId: '0',
  storeNo: queryForm.storeScopeMode === 'other' && queryForm.storeNo ? String(queryForm.storeNo) : '0',
  classLevel: Number(queryForm.categoryLevel || 1),
  classNo: resolveClassNo(),
  classRole: queryForm.roleNos.length ? queryForm.roleNos.map((item) => String(item)) : DEFAULT_CLASS_ROLE,
  skuAbnormal: queryForm.skuAbnormalTypes.length ? queryForm.skuAbnormalTypes.map((item) => String(item)) : DEFAULT_SKU_ABNORMAL
});

const resolveRoleName = (node: LegacyTreeNodeVO): string => {
  const roleType = normalizeText((node as any).roleType);
  if (roleType) return roleType;
  const roleNo = normalizeText((node as any).roleNo);
  if (roleNo === '1') return '明星品类';
  if (roleNo === '2') return '幼童品类';
  if (roleNo === '4') return '金牛品类';
  return '结构品类';
};

const resolveNodeChildren = (node: LegacyTreeNodeVO): LegacyTreeNodeVO[] => {
  if (Array.isArray((node as any).subClass)) return (node as any).subClass;
  if (Array.isArray((node as any).children)) return (node as any).children;
  return [];
};

const formatNodeLabel = (node: LegacyTreeNodeVO) => {
  const code = normalizeText((node as any).classNo);
  const name = normalizeText((node as any).className || (node as any).name);
  const sku = Number((node as any).saleSku ?? (node as any).skuCount ?? 0);
  return `${code ? `${code} ` : ''}${name} (${sku})`;
};

const countNodes = (nodes: LegacyTreeNodeVO[]): number => {
  let count = 0;
  const walk = (list: LegacyTreeNodeVO[]) => {
    list.forEach((node) => {
      count += 1;
      const children = resolveNodeChildren(node);
      if (children.length) walk(children);
    });
  };
  walk(nodes);
  return count;
};

const buildTreeSeriesData = (nodes: LegacyTreeNodeVO[], isRoot = false): any[] => {
  return nodes
    .filter((item) => normalizeText((item as any).classNo))
    .map((item) => {
      const roleName = resolveRoleName(item);
      const color = ROLE_COLOR_MAP[roleName] || '#90a4ae';
      const children = buildTreeSeriesData(resolveNodeChildren(item), false);
      return {
        id: normalizeText((item as any).classNo),
        name: isRoot ? '全部' : formatNodeLabel(item),
        categoryCode: normalizeText((item as any).classNo),
        categoryName: normalizeText((item as any).className || (item as any).name),
        roleName,
        skuCount: Number((item as any).saleSku ?? (item as any).skuCount ?? 0),
        symbol: isRoot ? 'emptyCircle' : 'circle',
        symbolSize: isRoot ? 8 : 7,
        itemStyle: isRoot ? { color: '#ffffff', borderColor: '#9aa0a6', borderWidth: 1.5 } : { color },
        label: {
          show: true,
          color: isRoot ? '#5f6368' : '#2f3b52',
          fontSize: 13,
          fontWeight: isRoot ? 600 : 400
        },
        children
      };
    });
};

const renderTree = (treeRows: LegacyTreeNodeVO[]) => {
  if (!chartRef.value) return;
  if (!chartIns.value) {
    chartIns.value = echarts.init(chartRef.value);
  }

  if (!treeRows.length) {
    chartIns.value.clear();
    return;
  }

  const explicitRoot = treeRows.find((item) => normalizeText((item as any).classNo) === '0');
  const rootNode: LegacyTreeNodeVO = explicitRoot
    ? ({
        ...(explicitRoot as any),
        classNo: '0',
        className: '全部'
      } as any)
    : ({
        classNo: '0',
        className: '全部',
        saleSku: treeRows.reduce((sum, item) => sum + Number((item as any).saleSku ?? 0), 0),
        subClass: treeRows
      } as any);

  const totalCount = countNodes([rootNode]);
  const targetHeight = Math.max(560, totalCount * 30 + 160);
  chartHeight.value = `${targetHeight}px`;

  const data = buildTreeSeriesData([rootNode], true);

  chartIns.value.setOption({
    animationDuration: 300,
    animationDurationUpdate: 250,
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        const d = params?.data || {};
        return [
          `品类：${d.categoryName || d.name || '--'}`,
          `编码：${d.categoryCode || '--'}`,
          `SKU数：${d.skuCount ?? 0}`,
          `角色：${d.roleName || '--'}`
        ].join('<br/>');
      }
    },
    series: [
      {
        type: 'tree',
        data,
        top: 20,
        bottom: 20,
        left: 40,
        right: 140,
        layout: 'orthogonal',
        orient: 'LR',
        edgeShape: 'curve',
        edgeForkPosition: '50%',
        initialTreeDepth: -1,
        expandAndCollapse: true,
        roam: true,
        lineStyle: {
          color: '#e0e0e0',
          width: 1.5,
          curveness: 0.35
        },
        label: {
          position: 'right',
          align: 'left',
          verticalAlign: 'middle',
          distance: 8,
          fontSize: 13,
          color: '#2f3b52'
        },
        leaves: {
          label: {
            position: 'right',
            align: 'left',
            verticalAlign: 'middle',
            fontSize: 13,
            color: '#2f3b52'
          }
        },
        emphasis: {
          focus: 'descendant'
        }
      }
    ]
  });

  nextTick(() => chartIns.value?.resize());
};

const loadTreeData = async () => {
  treeLoading.value = true;
  try {
    const res = await queryCategoryTree(buildTreeQuery());
    const rows = parseTreePayload(res);
    updateTime.value = normalizeText(res?.updateTime || res?.data?.updateTime) || new Date().toLocaleString();
    if (!rows.length) {
      chartHeight.value = '560px';
      chartIns.value?.clear();
      ElMessage.warning('未查询到品类树数据');
      return;
    }
    renderTree(rows);
  } finally {
    treeLoading.value = false;
  }
};

const handleSearch = async () => {
  if (queryForm.storeScopeMode === 'other' && !queryForm.storeNo) {
    ElMessage.warning('请选择门店');
    return;
  }
  await loadTreeData();
};

const handleReset = () => {
  queryForm.storeScopeMode = '0';
  queryForm.storeNo = '';
  queryForm.categoryLevel = 1;
  queryForm.categoryIds = [];
  queryForm.roleNos = [];
  queryForm.skuAbnormalTypes = [];
  void loadClassTreeOptions(1);
};

const downloadTreeImage = () => {
  if (!chartIns.value) return;
  const dataUrl = chartIns.value.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#ffffff'
  });
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `品类树_${Date.now()}.png`;
  link.click();
};

const resizeChart = () => chartIns.value?.resize();

onMounted(async () => {
  await Promise.all([initFilterOptions(), loadClassTreeOptions(queryForm.categoryLevel), loadTreeData()]);
  window.addEventListener('resize', resizeChart);
});

watch(
  () => queryForm.categoryLevel,
  async (level) => {
    queryForm.categoryIds = [];
    await loadClassTreeOptions(Number(level || 1));
  }
);

onBeforeUnmount(() => {
  window.removeEventListener('resize', resizeChart);
  chartIns.value?.dispose();
});
</script>

<style scoped lang="scss">
.category-tree-page {
  background: transparent;
}

.query-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 10px;
}

.update-time {
  color: var(--el-text-color-secondary);
  font-size: 13px;
}

.query-actions {
  display: flex;
  gap: 8px;
}

.query-form-wrap {
  border-top: 1px solid var(--el-border-color-lighter);
  padding-top: 12px;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.tree-title {
  font-size: 18px;
  font-weight: 600;
  color: #2f3b52;
}

.download-btn {
  background: #26a69a;
  border-color: #26a69a;
  color: #fff;
  border-radius: 8px;
  padding: 8px 16px;
}

.download-btn:hover,
.download-btn:focus {
  background: #1f9388;
  border-color: #1f9388;
  color: #fff;
}

.tips-banner {
  margin-bottom: 12px;
  padding: 10px 12px;
  border: 1px solid #26a69a;
  background: #e8f5f8;
  color: #2f3b52;
  border-radius: 8px;
  text-align: left;
  line-height: 1.5;
}

.legend-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  margin-bottom: 12px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #2f3b52;
  font-size: 14px;
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.chart-wrap {
  border: 1px solid #edf0f3;
  border-radius: 10px;
  overflow: hidden;
}

.chart-inner {
  width: 100%;
  height: 100%;
  min-height: 560px;
}

@media (max-width: 1200px) {
  .legend-wrap {
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 12px;
  }
}
</style>

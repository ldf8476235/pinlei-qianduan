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
          <div>
            <div class="tree-title">品类树</div>
            <div class="tree-subtitle">点击节点可选中品类；点击节点后的编辑图标设置设定品类</div>
          </div>
          <div class="tree-actions">
            <el-button class="guide-btn" @click="guideDialogVisible = true">品类定位设定指南</el-button>
            <el-button type="primary" :disabled="!selectedTreeNode" @click="handleOpenSelectedNodeConfig">修改选中品类</el-button>
            <el-button class="download-btn" @click="downloadTreeImage">下载树图</el-button>
          </div>
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

      <div class="selected-node-bar">
        <span class="selected-node-label">当前选中：</span>
        <span class="selected-node-value">{{ selectedNodeText }}</span>
      </div>

      <div v-loading="treeLoading" class="chart-wrap" :style="{ height: chartViewportHeight }">
        <div ref="chartRef" class="chart-inner" :style="{ height: chartHeight }" />
      </div>
      <el-empty v-if="!treeLoading && !hasSearched" description="请先设置筛选条件并点击查询" class="mt-[12px]" />
    </el-card>

    <el-dialog
      v-model="guideDialogVisible"
      width="min(1120px, calc(100vw - 48px))"
      class="category-guide-dialog"
      append-to-body
      destroy-on-close
      align-center
    >
      <template #header>
        <div class="guide-dialog-title">品类定位设定指南</div>
      </template>

      <div class="guide-content">
        <section class="guide-section">
          <h3>1. 品类定位的定义：</h3>
          <p>
            品类定位即品类角色。零售企业从自身发展规划和商品策略出发，根据每个品类在实际经营中的表现，结合市场发展趋势、顾客定位、
            竞争对手和供应商等因素，为每个品类确定其在企业中所承担的角色和要发挥的作用。
          </p>
        </section>

        <section class="guide-section">
          <h3>2. 如何设定品类定位：</h3>
          <p>
            不同业态或者性质的门店对于同一品类的角色定位也会有所不同，因此零售企业需要根据自身实际情况决定划分品类角色的门店组。
            系统也支持对单门店进行品类角色划分。
          </p>
          <p>
            依据企业自身要求，划分品类角色的方式也有所不同。以行业内常用的一种划分方式为例：以品类“综合贡献率”和“销售增长率”
            作为矩阵横纵轴，将企业同一级别的品类进行划分，从而定位品类的初始角色；企业可在此基础上结合自身策略进一步调整。
          </p>
        </section>

        <section class="guide-matrix-wrap" aria-label="品类定位四象限说明">
          <div class="guide-axis-y">品类销售增长率</div>
          <div class="guide-matrix">
            <div v-for="item in guideRoleCards" :key="item.title" class="guide-role-card" :class="item.className">
              <h4>{{ item.title }}</h4>
              <p><strong>特点：</strong>{{ item.feature }}</p>
              <p><strong>策略：</strong>{{ item.strategy }}</p>
            </div>
          </div>
          <div class="guide-axis-x">
            <span>品类综合贡献率</span>
            <small>（销售额占比*权重 + 销售量占比*权重 + 毛利额占比*权重）</small>
          </div>
        </section>
      </div>
    </el-dialog>

    <el-dialog
      v-model="nodeConfigDialog.visible"
      title="设置设定品类"
      width="560px"
      destroy-on-close
      append-to-body
    >
      <div class="node-config-panel">
        <div class="node-config-meta">当前节点：{{ nodeConfigDialog.classNo }} {{ nodeConfigDialog.className }}</div>

        <el-form label-width="96px" class="node-config-form">
          <el-form-item label="当前品类">
            <div class="node-config-current">{{ nodeConfigDialog.currentRoleName || '未设置' }}</div>
          </el-form-item>
          <el-form-item label="设定品类" required>
            <el-select
              v-model="nodeConfigDialog.roleNo"
              placeholder="请选择设定品类"
              style="width: 100%"
              :disabled="nodeConfigDialog.submitting"
            >
              <el-option
                v-for="item in editableRoleOptions"
                :key="String(item.value)"
                :label="item.label"
                :value="String(item.value)"
              />
            </el-select>
          </el-form-item>
          <el-form-item label="设定SKU数" required>
            <el-input-number
              v-model="nodeConfigDialog.suggestSaleSku"
              :min="0"
              :precision="0"
              :step="1"
              :controls="false"
              placeholder="请输入设定SKU数"
              style="width: 100%"
              :disabled="nodeConfigDialog.submitting"
            />
          </el-form-item>
          <el-form-item label="建议SKU数" required>
            <el-input-number
              v-model="nodeConfigDialog.sysSuggestSaleSku"
              :min="0"
              :precision="0"
              :step="1"
              :controls="false"
              placeholder="请输入建议SKU数"
              style="width: 100%"
              :disabled="nodeConfigDialog.submitting"
            />
          </el-form-item>
        </el-form>

        <div class="node-config-note">
          保存只更新设定品类、设定SKU数和建议SKU数配置，不修改当前节点名称和实际 SKU 统计。
          当前生效范围：{{ currentConfigScopeText }}。
        </div>
      </div>

      <template #footer>
        <div class="node-config-footer">
          <el-button @click="nodeConfigDialog.visible = false" :disabled="nodeConfigDialog.submitting">取消</el-button>
          <el-button type="primary" :loading="nodeConfigDialog.submitting" @click="handleSaveNodeConfig">保存</el-button>
        </div>
      </template>
    </el-dialog>
  </div>
</template>

<script setup name="CategoryTree" lang="ts">
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { findStore, getCategoryFilterOptions, queryCategoryClassTree, queryCategoryTree, updateCategoryNodeConfig } from '@/api/category/tree';
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
const treeRowsState = ref<LegacyTreeNodeVO[]>([]);
const renderedTreeRowsState = ref<LegacyTreeNodeVO[]>([]);
const selectedTreeNode = ref<Record<string, any> | null>(null);
const expandedNodeIdSet = ref<Set<string>>(new Set());

const queryCollapsed = ref(false);
const treeLoading = ref(false);
const storeLoading = ref(false);
const hasSearched = ref(false);
const guideDialogVisible = ref(false);
const updateTime = ref('');
const chartHeight = ref('560px');
const chartViewportHeight = computed(() => {
  const height = Number.parseInt(chartHeight.value, 10);
  return `${Math.min(760, Math.max(420, Number.isFinite(height) ? height : 560))}px`;
});

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

const guideRoleCards = [
  {
    title: '明星品类',
    className: 'is-star',
    feature: '市场地位领先，高增长，竞争激烈；',
    strategy: '保持优势，持续重点投入；'
  },
  {
    title: '幼童品类',
    className: 'is-nurture',
    feature: '增长快、投入大，存在不确定性，可能成为明星品类或滞涨；',
    strategy: '促进成长，策略性投入；'
  },
  {
    title: '结构品类',
    className: 'is-structure',
    feature: '结构或便利性补充，发展缓慢，业务趋稳或衰退；',
    strategy: '创新、优化、收缩或退出；'
  },
  {
    title: '金牛品类',
    className: 'is-cash',
    feature: '市场份额较高，增长放缓，影响大，竞争相对稳定；',
    strategy: '巩固优势，选择性投入；'
  }
];

const ROLE_COLOR_MAP: Record<string, string> = {
  明星品类: '#e53935',
  幼童品类: '#fb8c00',
  结构品类: '#43a047',
  金牛品类: '#1e88e5'
};

const DEFAULT_CLASS_ROLE = ['0', '1', '2', '3', '4', '5'];
const DEFAULT_SKU_ABNORMAL = ['0', '1', '2', '3'];
const DEFAULT_CONFIG_STORE_NO = '0000';
const MAX_RENDER_NODES = 800;
const LARGE_TREE_NODE_THRESHOLD = 600;
const MAX_CHILDREN_PER_NODE = 60;
const LABEL_DENSE_THRESHOLD = 220;
const TREE_ROLE_CACHE_KEY = 'category-tree-role-state-v1';

const queryForm = reactive({
  storeScopeMode: '0',
  storeNo: '',
  categoryLevel: 1,
  categoryIds: [] as string[],
  roleNos: [] as string[],
  skuAbnormalTypes: [] as string[]
});

const nodeConfigDialog = reactive({
  visible: false,
  submitting: false,
  classNo: '',
  className: '',
  roleNo: '',
  currentRoleName: '',
  suggestSaleSku: 0,
  sysSuggestSaleSku: 0
});

type RoleState = {
  roleNo: string;
  roleName: string;
};

const currentRoleStateMap = reactive<Record<string, RoleState>>({});
const presetRoleOverrideMap = reactive<Record<string, RoleState>>({});

const updateTimeText = computed(() => updateTime.value || '--');
const editableRoleOptions = computed(() => roleOptions.value.filter((item) => String(item.value) !== '0'));
const selectedNodeText = computed(() => {
  if (!selectedTreeNode.value) return '未选择';
  const classNo = normalizeText(selectedTreeNode.value.classNo || selectedTreeNode.value.categoryCode || selectedTreeNode.value.id);
  const className = normalizeText(selectedTreeNode.value.className || selectedTreeNode.value.categoryName || selectedTreeNode.value.name);
  return `${classNo ? `${classNo} ` : ''}${className || '--'}`;
});
const currentConfigStoreNo = computed(() =>
  queryForm.storeScopeMode === 'other' && queryForm.storeNo ? normalizeText(queryForm.storeNo) : DEFAULT_CONFIG_STORE_NO
);
const currentConfigScopeText = computed(() => {
  if (queryForm.storeScopeMode === 'other' && queryForm.storeNo) {
    const currentStoreNo = normalizeText(queryForm.storeNo);
    const matched = storeCandidates.value.find((item) => normalizeText(item.storeNo) === currentStoreNo);
    return matched?.storeName ? `${currentStoreNo} ${matched.storeName}` : currentStoreNo;
  }
  return `全部门店（默认模板 ${DEFAULT_CONFIG_STORE_NO}）`;
});

const normalizeText = (value?: string | number | null) => String(value ?? '').trim();

const buildRoleCacheScope = () =>
  queryForm.storeScopeMode === 'other' && queryForm.storeNo ? normalizeText(queryForm.storeNo) : DEFAULT_CONFIG_STORE_NO;

const buildRoleCacheKey = (classNo?: string | null) => {
  const normalizedClassNo = normalizeText(classNo);
  if (!normalizedClassNo) return '';
  return `${buildRoleCacheScope()}::${normalizedClassNo}`;
};

const persistRoleStateCache = () => {
  if (typeof window === 'undefined') return;
  window.sessionStorage.setItem(
    TREE_ROLE_CACHE_KEY,
    JSON.stringify({
      current: currentRoleStateMap,
      preset: presetRoleOverrideMap
    })
  );
};

const restoreRoleStateCache = () => {
  if (typeof window === 'undefined') return;
  try {
    const raw = window.sessionStorage.getItem(TREE_ROLE_CACHE_KEY);
    if (!raw) return;
    const parsed = JSON.parse(raw) as {
      current?: Record<string, RoleState>;
      preset?: Record<string, RoleState>;
    };
    Object.assign(currentRoleStateMap, parsed.current || {});
    Object.assign(presetRoleOverrideMap, parsed.preset || {});
  } catch {
    window.sessionStorage.removeItem(TREE_ROLE_CACHE_KEY);
  }
};

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

const resolveFilterValue = (value?: string | null) => {
  const normalized = normalizeText(value);
  if (!normalized || normalized === '0' || normalized.toLowerCase() === 'all') return '';
  return normalized;
};

const resolveSaleSku = (node: LegacyTreeNodeVO) => Number((node as any).saleSku ?? (node as any).skuCount ?? 0);

const resolveSuggestSaleSku = (node: LegacyTreeNodeVO) =>
  Number((node as any).suggestSaleSku ?? (node as any).sysSuggestSaleSku ?? 0);

const resolveSysSuggestSaleSku = (node: LegacyTreeNodeVO) => {
  const value = (node as any).sysSuggestSaleSku;
  return value === null || value === undefined || value === '' ? null : Number(value);
};

const resolveRoleLabelByNo = (roleNo?: string | null) => {
  const normalized = normalizeText(roleNo);
  if (normalized === '1') return '明星品类';
  if (normalized === '2') return '幼童品类';
  if (normalized === '4') return '金牛品类';
  if (normalized === '5') return '战略品类';
  return '结构品类';
};

const resolveRoleState = (roleNo?: string | null, roleName?: string | null): RoleState => {
  const normalizedRoleNo = normalizeText(roleNo);
  const normalizedRoleName = normalizeText(roleName);
  return {
    roleNo: normalizedRoleNo,
    roleName: normalizedRoleName || (normalizedRoleNo ? resolveRoleLabelByNo(normalizedRoleNo) : '')
  };
};

const buildTreeQuery = (): CategoryTreeQuery => ({
  deptId: 1,
  retailTypeId: '',
  businessCircleId: '',
  deptGroupId: '',
  storeNo: queryForm.storeScopeMode === 'other' && queryForm.storeNo ? resolveFilterValue(String(queryForm.storeNo)) : '',
  classLevel: Number(queryForm.categoryLevel || 1),
  classNo: resolveClassNo(),
  classRole: queryForm.roleNos.length ? queryForm.roleNos.map((item) => String(item)) : DEFAULT_CLASS_ROLE,
  skuAbnormal: queryForm.skuAbnormalTypes.length ? queryForm.skuAbnormalTypes.map((item) => String(item)) : DEFAULT_SKU_ABNORMAL
});

const resolveRoleName = (node: LegacyTreeNodeVO): string => {
  const currentRoleName = normalizeText((node as any).currentRoleName);
  if (currentRoleName) return currentRoleName;
  const roleType = normalizeText((node as any).roleType);
  if (ROLE_COLOR_MAP[roleType]) return roleType;
  return resolveRoleLabelByNo((node as any).roleNo);
};

const resolvePresetRoleName = (node: LegacyTreeNodeVO): string => {
  const presetRoleName = normalizeText((node as any).presetRoleName);
  if (presetRoleName) return presetRoleName;
  const presetRoleNo = normalizeText((node as any).presetRoleNo);
  if (presetRoleNo) return resolveRoleLabelByNo(presetRoleNo);
  return resolveRoleName(node);
};

const resetNodeConfigDialog = () => {
  nodeConfigDialog.visible = false;
  nodeConfigDialog.submitting = false;
  nodeConfigDialog.classNo = '';
  nodeConfigDialog.className = '';
  nodeConfigDialog.roleNo = '';
  nodeConfigDialog.currentRoleName = '';
  nodeConfigDialog.suggestSaleSku = 0;
  nodeConfigDialog.sysSuggestSaleSku = 0;
};

const openNodeConfigDialog = (node: Record<string, any>) => {
  const classNo = normalizeText(node.classNo || node.categoryCode || node.id);
  if (!classNo || classNo === '0' || classNo.endsWith('_more')) return;

  const currentRoleName = normalizeText(node.currentRoleName) || resolveRoleName(node as LegacyTreeNodeVO);
  const presetRoleNo = normalizeText(node.presetRoleNo || node.roleNo);
  const fallbackRoleNo = editableRoleOptions.value[0] ? String(editableRoleOptions.value[0].value) : '';

  nodeConfigDialog.classNo = classNo;
  nodeConfigDialog.className = normalizeText(node.className || node.categoryName || node.name);
  nodeConfigDialog.currentRoleName = currentRoleName || '未设置';
  nodeConfigDialog.suggestSaleSku = Number(node.suggestSaleSku ?? node.sysSuggestSaleSku ?? 0);
  nodeConfigDialog.sysSuggestSaleSku = Number(node.sysSuggestSaleSku ?? node.suggestSaleSku ?? 0);
  nodeConfigDialog.roleNo = presetRoleNo || fallbackRoleNo;
  nodeConfigDialog.visible = true;
};

const isConfigurableNode = (node: Record<string, any> | null | undefined) => {
  const classNo = normalizeText(node?.classNo || node?.categoryCode || node?.id);
  return Boolean(classNo && classNo !== '0' && !classNo.endsWith('_more'));
};

const resolveNodeId = (node: Record<string, any> | null | undefined) => normalizeText(node?.classNo || node?.categoryCode || node?.id);

const hasVisibleChildren = (node: Record<string, any> | null | undefined) => Array.isArray(node?.children) && node.children.length > 0;

const collectRootExpandedNodeIds = () => new Set<string>(['0']);

const handleSelectTreeNode = (node: Record<string, any>) => {
  if (!isConfigurableNode(node)) {
    selectedTreeNode.value = null;
    return;
  }
  selectedTreeNode.value = node;
};

const toggleTreeNodeExpanded = (node: Record<string, any>) => {
  if (!hasVisibleChildren(node)) return;
  const nodeId = resolveNodeId(node);
  if (!nodeId) return;

  const next = new Set(expandedNodeIdSet.value);
  if (next.has(nodeId)) {
    next.delete(nodeId);
  } else {
    next.add(nodeId);
  }
  expandedNodeIdSet.value = next;
  renderTree(renderedTreeRowsState.value, countNodes(renderedTreeRowsState.value), true);
};

const handleOpenSelectedNodeConfig = () => {
  if (!selectedTreeNode.value) {
    ElMessage.warning('请先在树图中选择一个品类节点');
    return;
  }
  openNodeConfigDialog(selectedTreeNode.value);
};

const INLINE_EDIT_ICON = '✎';

const escapeRichText = (value: string) => normalizeText(value).replace(/[{}]/g, '');

const buildNodeLabelConfig = (labelText: string, showInlineEdit: boolean, isRoot: boolean, color: string) => {
  const nodeColor = isRoot ? '#5f6368' : '#2f3b52';
  const safeLabel = escapeRichText(labelText);

  return {
    show: true,
    formatter: showInlineEdit ? `{nodeName|${safeLabel}}  {edit|${INLINE_EDIT_ICON}}` : `{nodeName|${safeLabel}}`,
    rich: {
      nodeName: {
        color: nodeColor,
        fontSize: 11,
        fontWeight: isRoot ? 600 : 400,
        lineHeight: 16
      },
      edit: {
        color: color || '#fb6a00',
        backgroundColor: '#fff7ed',
        borderColor: color || '#fb6a00',
        borderWidth: 1,
        borderRadius: 7,
        width: 14,
        height: 14,
        align: 'center',
        fontSize: 10,
        fontWeight: 700,
        lineHeight: 14
      }
    }
  };
};

const isInlineEditLabelClick = (params: any) => {
  const node = params?.data;
  if (!node?.showInlineEdit) return false;

  const target = params?.event?.target || params?.event?.topTarget;
  const targetType = normalizeText(target?.type);
  const targetText = normalizeText(target?.style?.text || target?.style?.__text || target?.textContent || target?.__text);

  if (targetText === INLINE_EDIT_ICON) return true;
  if (targetType !== 'text' && targetType !== 'tspan' && !targetText.includes(INLINE_EDIT_ICON)) return false;

  const event = params?.event?.event || params?.event || {};
  const offsetX = Number(params?.event?.offsetX ?? event.offsetX);
  const offsetY = Number(params?.event?.offsetY ?? event.offsetY);
  const rect = typeof target?.getBoundingRect === 'function' ? target.getBoundingRect() : null;

  if (!rect || !Number.isFinite(offsetX) || !Number.isFinite(offsetY)) {
    return false;
  }

  const [localX] =
    typeof target.transformCoordToLocal === 'function' ? target.transformCoordToLocal(offsetX, offsetY) : [offsetX, offsetY];
  const editHitWidth = 28;
  return localX >= rect.x + rect.width - editHitWidth && localX <= rect.x + rect.width + 6;
};

const resolveNodeChildren = (node: LegacyTreeNodeVO): LegacyTreeNodeVO[] => {
  if (Array.isArray((node as any).subClass)) return (node as any).subClass;
  if (Array.isArray((node as any).children)) return (node as any).children;
  return [];
};

const formatNodeLabel = (node: LegacyTreeNodeVO) => {
  const code = normalizeText((node as any).classNo);
  const name = normalizeText((node as any).className || (node as any).name);
  const sku = resolveSaleSku(node);
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

const countVisibleTreeNodes = (nodes: any[]): number => {
  let count = 0;
  const walk = (list: any[]) => {
    list.forEach((node) => {
      count += 1;
      if (!node?.collapsed && Array.isArray(node?.children) && node.children.length) {
        walk(node.children);
      }
    });
  };
  walk(nodes);
  return count;
};

const cloneTreeRows = (nodes: LegacyTreeNodeVO[]): LegacyTreeNodeVO[] =>
  nodes.map((node) => ({
    ...(node as any),
    subClass: resolveNodeChildren(node).length ? cloneTreeRows(resolveNodeChildren(node)) : []
  })) as LegacyTreeNodeVO[];

const buildRenderRows = (rows: LegacyTreeNodeVO[]) => {
  const totalNodes = countNodes(rows);
  const warnings: string[] = [];
  let renderRows = rows;
  if (totalNodes > LARGE_TREE_NODE_THRESHOLD) {
    renderRows = compactTreeByChildren(rows, MAX_CHILDREN_PER_NODE);
    warnings.push(`树节点较多（${totalNodes}），已启用前端降载渲染（默认折叠深层并聚合部分子节点）`);
  }
  const renderNodeCount = countNodes(renderRows);
  if (renderNodeCount > MAX_RENDER_NODES) {
    renderRows = trimTreeNodes(renderRows, MAX_RENDER_NODES);
    warnings.push(`渲染节点仍过多，已限制为前 ${MAX_RENDER_NODES} 个节点`);
  }
  return {
    totalNodes,
    renderRows,
    warnings
  };
};

const trimTreeNodes = (nodes: LegacyTreeNodeVO[], maxNodes: number): LegacyTreeNodeVO[] => {
  let remain = Math.max(1, maxNodes);
  const walk = (list: LegacyTreeNodeVO[]): LegacyTreeNodeVO[] => {
    const result: LegacyTreeNodeVO[] = [];
    for (const node of list) {
      if (remain <= 0) break;
      remain -= 1;
      const children = resolveNodeChildren(node);
      result.push({
        ...(node as any),
        subClass: children.length ? walk(children) : []
      } as LegacyTreeNodeVO);
      if (remain <= 0) break;
    }
    return result;
  };
  return walk(nodes);
};

const sumSku = (nodes: LegacyTreeNodeVO[]): number => {
  let total = 0;
  const walk = (list: LegacyTreeNodeVO[]) => {
    list.forEach((node) => {
      total += resolveSaleSku(node);
      const children = resolveNodeChildren(node);
      if (children.length) walk(children);
    });
  };
  walk(nodes);
  return total;
};

const sumSuggestSku = (nodes: LegacyTreeNodeVO[]): number => {
  let total = 0;
  const walk = (list: LegacyTreeNodeVO[]) => {
    list.forEach((node) => {
      total += resolveSuggestSaleSku(node);
      const children = resolveNodeChildren(node);
      if (children.length) walk(children);
    });
  };
  walk(nodes);
  return total;
};

const sumSysSuggestSku = (nodes: LegacyTreeNodeVO[]): number | null => {
  let total = 0;
  let hasValue = false;
  const walk = (list: LegacyTreeNodeVO[]) => {
    list.forEach((node) => {
      const value = resolveSysSuggestSaleSku(node);
      if (value !== null && Number.isFinite(value)) {
        total += value;
        hasValue = true;
      }
      const children = resolveNodeChildren(node);
      if (children.length) walk(children);
    });
  };
  walk(nodes);
  return hasValue ? total : null;
};

const compactTreeByChildren = (nodes: LegacyTreeNodeVO[], maxChildren: number): LegacyTreeNodeVO[] => {
  const walk = (list: LegacyTreeNodeVO[]): LegacyTreeNodeVO[] => {
    return list.map((node) => {
      const code = normalizeText((node as any).classNo);
      const children = resolveNodeChildren(node);
      if (!children.length) return node;
      let visibleChildren = children;
      if (children.length > maxChildren) {
        const kept = children.slice(0, maxChildren);
        const hidden = children.slice(maxChildren);
        const mergedNode = {
          classNo: `${code || 'node'}_more`,
          className: `其余${hidden.length}个子类`,
          saleSku: sumSku(hidden),
          suggestSaleSku: sumSuggestSku(hidden),
          sysSuggestSaleSku: sumSysSuggestSku(hidden),
          roleType: '结构品类',
          skuDiffer: sumSku(hidden) - sumSuggestSku(hidden),
          subClass: []
        } as unknown as LegacyTreeNodeVO;
        visibleChildren = [...kept, mergedNode];
      }
      return {
        ...(node as any),
        subClass: walk(visibleChildren)
      } as LegacyTreeNodeVO;
    });
  };
  return walk(nodes);
};

const buildTreeSeriesData = (nodes: LegacyTreeNodeVO[], isRoot = false): any[] => {
  return nodes
    .filter((item) => normalizeText((item as any).classNo))
    .map((item) => {
      const currentRoleName = resolveRoleName(item);
      const presetRoleName = resolvePresetRoleName(item);
      const color = ROLE_COLOR_MAP[currentRoleName] || '#90a4ae';
      const children = buildTreeSeriesData(resolveNodeChildren(item), false);
      const nodeLabel = isRoot ? '全部' : formatNodeLabel(item);
      const showInlineEdit = !isRoot && isConfigurableNode(item as Record<string, any>);
      const nodeId = normalizeText((item as any).classNo);
      const hasChildren = children.length > 0;
      return {
        id: nodeId,
        name: nodeLabel,
        nodeLabel,
        showInlineEdit,
        classNo: normalizeText((item as any).classNo),
        className: normalizeText((item as any).className || (item as any).name),
        classLevel: Number((item as any).classLevel ?? 0),
        categoryCode: normalizeText((item as any).classNo),
        categoryName: normalizeText((item as any).className || (item as any).name),
        roleNo: normalizeText((item as any).currentRoleNo || (item as any).roleNo),
        roleName: currentRoleName,
        currentRoleNo: normalizeText((item as any).currentRoleNo || (item as any).roleNo),
        currentRoleName,
        presetRoleNo: normalizeText((item as any).presetRoleNo || (item as any).roleNo),
        presetRoleName,
        skuCount: resolveSaleSku(item),
        suggestSaleSku: resolveSuggestSaleSku(item),
        sysSuggestSaleSku: resolveSysSuggestSaleSku(item),
        skuDiffer: Number((item as any).skuDiffer ?? resolveSaleSku(item) - resolveSuggestSaleSku(item)),
        symbol: isRoot ? 'emptyCircle' : 'circle',
        symbolSize: isRoot ? 6 : 5,
        itemStyle: isRoot ? { color: '#ffffff', borderColor: '#9aa0a6', borderWidth: 1.2 } : { color },
        label: buildNodeLabelConfig(nodeLabel, showInlineEdit, isRoot, color),
        collapsed: hasChildren ? !expandedNodeIdSet.value.has(nodeId) : false,
        children
      };
    });
};

const bindChartEvents = () => {
  if (!chartIns.value) return;
  chartIns.value.off('click');
  chartIns.value.on('click', (params: any) => {
    const node = params?.data;
    if (!node || typeof node !== 'object') return;
    if (isInlineEditLabelClick(params)) {
      openNodeConfigDialog(node);
      return;
    }
    handleSelectTreeNode(node);
    toggleTreeNodeExpanded(node);
  });
};

const recreateChart = () => {
  if (!chartRef.value) return;
  chartIns.value?.dispose();
  chartIns.value = echarts.init(chartRef.value);
  bindChartEvents();
};

const renderTree = (treeRows: LegacyTreeNodeVO[], rawNodeCount: number, forceRecreate = false) => {
  if (!chartRef.value) return;
  if (!chartIns.value) {
    recreateChart();
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

  const data = buildTreeSeriesData([rootNode], true);
  const renderNodeCount = countVisibleTreeNodes(data);
  const nextChartHeight = Math.min(1800, Math.max(420, renderNodeCount * 34 + 120));
  chartHeight.value = `${nextChartHeight}px`;
  const denseMode = renderNodeCount > LABEL_DENSE_THRESHOLD;
  const largeMode = rawNodeCount > LARGE_TREE_NODE_THRESHOLD;

  if (forceRecreate) {
    chartIns.value.clear();
  }
  chartIns.value.setOption({
    animation: !largeMode,
    animationDuration: largeMode ? 0 : 300,
    animationDurationUpdate: largeMode ? 0 : 250,
    tooltip: {
      trigger: 'item',
      triggerOn: 'mousemove',
      formatter: (params: any) => {
        const d = params?.data || {};
        const title = `${d.categoryCode ? `${d.categoryCode} ` : ''}${d.categoryName || d.name || '--'} (${d.skuCount ?? 0})`;
        const sysSuggestSaleSku = d.sysSuggestSaleSku ?? null;
        return [
          title,
          `设定SKU数：${d.suggestSaleSku ?? 0}`,
          `建议SKU数：${sysSuggestSaleSku === null ? '--' : sysSuggestSaleSku}`,
          `实际SKU数：${d.skuCount ?? 0}`,
          `当前品类：${d.currentRoleName || '--'}`,
          `设定品类：${d.presetRoleName || '--'}`
        ].join('<br/>');
      }
    },
    series: [
      {
        type: 'tree',
        data,
        top: 36,
        bottom: 36,
        left: '6%',
        right: '30%',
        layout: 'orthogonal',
        orient: 'LR',
        edgeShape: 'curve',
        edgeForkPosition: '50%',
        initialTreeDepth: -1,
        expandAndCollapse: false,
        roam: false,
        lineStyle: {
          color: '#e0e0e0',
          width: 1,
          curveness: 0.22
        },
        label: {
          position: 'right',
          align: 'left',
          verticalAlign: 'middle',
          distance: 5,
          fontSize: denseMode ? 10 : 11,
          color: '#2f3b52'
        },
        leaves: {
          label: {
            show: true,
            position: 'right',
            align: 'left',
            verticalAlign: 'middle',
            distance: 5,
            fontSize: denseMode ? 10 : 11,
            color: '#2f3b52'
          }
        },
        emphasis: {
          focus: 'descendant'
        }
      }
    ]
  }, {
    notMerge: true,
    lazyUpdate: false
  });

  bindChartEvents();
  nextTick(() => chartIns.value?.resize());
};

const renderTreeRows = (rows: LegacyTreeNodeVO[], forceRecreate = false) => {
  if (!rows.length) {
    chartHeight.value = '560px';
    chartIns.value?.clear();
    renderedTreeRowsState.value = [];
    return;
  }
  const { totalNodes, renderRows, warnings } = buildRenderRows(rows);
  renderedTreeRowsState.value = cloneTreeRows(renderRows);
  if (forceRecreate) {
    expandedNodeIdSet.value = collectRootExpandedNodeIds();
  }
  warnings.forEach((message) => ElMessage.warning(message));
  renderTree(renderedTreeRowsState.value, totalNodes, forceRecreate);
};

const normalizeTreeRoles = (nodes: LegacyTreeNodeVO[]): LegacyTreeNodeVO[] => {
  const walk = (list: LegacyTreeNodeVO[]): LegacyTreeNodeVO[] =>
    list.map((node) => {
      const classNo = normalizeText((node as any).classNo);
      const backendRole = resolveRoleState((node as any).roleNo, resolveRoleName(node));
      const cacheKey = buildRoleCacheKey(classNo);
      if (classNo && classNo !== '0' && !classNo.endsWith('_more') && cacheKey && !currentRoleStateMap[cacheKey]) {
        currentRoleStateMap[cacheKey] = backendRole;
      }
      const currentRole = cacheKey ? currentRoleStateMap[cacheKey] || backendRole : backendRole;
      const presetRole = cacheKey ? presetRoleOverrideMap[cacheKey] || backendRole : backendRole;
      const children = resolveNodeChildren(node);
      return {
        ...(node as any),
        currentRoleNo: currentRole.roleNo,
        currentRoleName: currentRole.roleName,
        presetRoleNo: presetRole.roleNo,
        presetRoleName: presetRole.roleName,
        subClass: children.length ? walk(children) : children
      } as LegacyTreeNodeVO;
    });

  const normalized = walk(nodes);
  persistRoleStateCache();
  return normalized;
};

const loadTreeData = async () => {
  treeLoading.value = true;
  selectedTreeNode.value = null;
  try {
    const res = await queryCategoryTree(buildTreeQuery());
    const rows = normalizeTreeRoles(parseTreePayload(res));
    updateTime.value = normalizeText(res?.updateTime || res?.data?.updateTime) || new Date().toLocaleString();
    if (!rows.length) {
      chartHeight.value = '560px';
      chartIns.value?.clear();
      renderedTreeRowsState.value = [];
      ElMessage.warning('未查询到品类树数据');
      return;
    }
    treeRowsState.value = cloneTreeRows(rows);
    renderTreeRows(treeRowsState.value, true);
  } finally {
    treeLoading.value = false;
  }
};

const patchPresetRole = (
  nodes: LegacyTreeNodeVO[],
  classNo: string,
  presetRole: RoleState,
  suggestSaleSku?: number,
  sysSuggestSaleSku?: number
): LegacyTreeNodeVO[] => {
  return nodes.map((node) => {
    const nodeClassNo = normalizeText((node as any).classNo);
    const children = resolveNodeChildren(node);
    const nextChildren = children.length ? patchPresetRole(children, classNo, presetRole, suggestSaleSku, sysSuggestSaleSku) : [];
    if (nodeClassNo !== classNo) {
      return {
        ...(node as any),
        subClass: nextChildren
      } as LegacyTreeNodeVO;
    }
    return {
      ...(node as any),
      presetRoleNo: presetRole.roleNo,
      presetRoleName: presetRole.roleName,
      suggestSaleSku: Number(suggestSaleSku ?? (node as any).suggestSaleSku ?? 0),
      sysSuggestSaleSku: Number(sysSuggestSaleSku ?? resolveSysSuggestSaleSku(node) ?? 0),
      skuDiffer: resolveSaleSku(node) - Number(suggestSaleSku ?? resolveSuggestSaleSku(node)),
      subClass: nextChildren
    } as LegacyTreeNodeVO;
  });
};

const handleSearch = async () => {
  if (queryForm.storeScopeMode === 'other' && !queryForm.storeNo) {
    ElMessage.warning('请选择门店');
    return;
  }
  hasSearched.value = true;
  await loadTreeData();
};

const handleReset = () => {
  queryForm.storeScopeMode = '0';
  queryForm.storeNo = '';
  queryForm.categoryLevel = 1;
  queryForm.categoryIds = [];
  queryForm.roleNos = [];
  queryForm.skuAbnormalTypes = [];
  hasSearched.value = false;
  chartHeight.value = '560px';
  chartIns.value?.clear();
  renderedTreeRowsState.value = [];
  selectedTreeNode.value = null;
  void loadClassTreeOptions(1);
};

const handleSaveNodeConfig = async () => {
  if (!nodeConfigDialog.roleNo) {
    ElMessage.warning('请选择设定品类');
    return;
  }
  const nextSuggestSaleSku = Number(nodeConfigDialog.suggestSaleSku);
  if (!Number.isFinite(nextSuggestSaleSku) || nextSuggestSaleSku < 0) {
    ElMessage.warning('请输入有效的设定SKU数');
    return;
  }
  const nextSysSuggestSaleSku = Number(nodeConfigDialog.sysSuggestSaleSku);
  if (!Number.isFinite(nextSysSuggestSaleSku) || nextSysSuggestSaleSku < 0) {
    ElMessage.warning('请输入有效的建议SKU数');
    return;
  }

  nodeConfigDialog.submitting = true;
  try {
    await updateCategoryNodeConfig({
      storeNo: currentConfigStoreNo.value,
      classNo: nodeConfigDialog.classNo,
      roleNo: nodeConfigDialog.roleNo,
      suggestSaleSku: nextSuggestSaleSku,
      sysSuggestSaleSku: nextSysSuggestSaleSku
    });
    const selectedRole = editableRoleOptions.value.find((item) => String(item.value) === nodeConfigDialog.roleNo);
    const cacheKey = buildRoleCacheKey(nodeConfigDialog.classNo);
    if (cacheKey) {
      presetRoleOverrideMap[cacheKey] = resolveRoleState(nodeConfigDialog.roleNo, selectedRole?.label);
      persistRoleStateCache();
    }
    treeRowsState.value = patchPresetRole(
      treeRowsState.value,
      nodeConfigDialog.classNo,
      resolveRoleState(nodeConfigDialog.roleNo, selectedRole?.label),
      nextSuggestSaleSku,
      nextSysSuggestSaleSku
    );
    renderedTreeRowsState.value = patchPresetRole(
      renderedTreeRowsState.value,
      nodeConfigDialog.classNo,
      resolveRoleState(nodeConfigDialog.roleNo, selectedRole?.label),
      nextSuggestSaleSku,
      nextSysSuggestSaleSku
    );
    renderTree(renderedTreeRowsState.value, countNodes(renderedTreeRowsState.value), true);
    ElMessage.success('设定品类已保存');
    selectedTreeNode.value = null;
    resetNodeConfigDialog();
  } finally {
    nodeConfigDialog.submitting = false;
  }
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
  restoreRoleStateCache();
  await Promise.all([initFilterOptions(), loadClassTreeOptions(queryForm.categoryLevel)]);
  hasSearched.value = true;
  await loadTreeData();
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

.category-tree-page :deep(.el-card__body) {
  padding: 10px 12px;
}

.category-tree-page :deep(.tree-card > .el-card__header) {
  padding: 10px 12px;
}

.query-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 6px;
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
  padding-top: 8px;
}

.query-form-wrap :deep(.el-form-item) {
  margin-bottom: 8px;
}

.tree-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16px;
}

.tree-title {
  font-size: 16px;
  font-weight: 600;
  color: #2f3b52;
}

.tree-subtitle {
  margin-top: 2px;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.tree-actions {
  display: flex;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;
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

.guide-btn {
  border-color: rgba(249, 115, 22, 0.36);
  background: #fff7ed;
  color: #ea580c;
  border-radius: 8px;
  padding: 8px 14px;
}

.guide-btn:hover,
.guide-btn:focus {
  border-color: #f97316;
  background: #ffedd5;
  color: #c2410c;
}

.tips-banner {
  margin-bottom: 8px;
  padding: 7px 10px;
  border: 1px solid rgba(249, 115, 22, 0.42);
  background: linear-gradient(180deg, rgba(255, 247, 237, 0.98), rgba(255, 237, 213, 0.86));
  color: #9a3412;
  border-radius: 8px;
  text-align: left;
  line-height: 1.35;
  font-size: 12px;
}

.legend-wrap {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 16px;
  margin-bottom: 8px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  color: #2f3b52;
  font-size: 12px;
}

.legend-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  display: inline-block;
}

.selected-node-bar {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 8px;
  padding: 7px 10px;
  border: 1px solid rgba(249, 115, 22, 0.18);
  border-radius: 10px;
  background: rgba(255, 247, 237, 0.9);
  color: #7c2d12;
  font-size: 12px;
}

.selected-node-label {
  color: #9a3412;
  font-weight: 600;
}

.selected-node-value {
  color: #431407;
  font-weight: 700;
}

.chart-wrap {
  border: 1px solid #edf0f3;
  border-radius: 10px;
  overflow-y: auto;
  overflow-x: hidden;
  overscroll-behavior: contain;
  scrollbar-gutter: stable;
}

.chart-inner {
  width: 100%;
  min-height: 420px;
  cursor: default;
}

:global(.category-guide-dialog.el-dialog) {
  border-radius: 10px;
  overflow: hidden;
}

:global(.category-guide-dialog .el-dialog__header) {
  margin: 0;
  padding: 34px 40px 10px;
}

:global(.category-guide-dialog .el-dialog__body) {
  padding: 0 40px 40px;
}

:global(.category-guide-dialog .el-dialog__headerbtn) {
  top: 22px;
  right: 24px;
  width: 44px;
  height: 44px;
}

.guide-dialog-title {
  color: #111827;
  font-size: 22px;
  font-weight: 700;
  line-height: 1.35;
}

.guide-content {
  max-height: min(72vh, 760px);
  overflow-y: auto;
  padding-right: 4px;
  color: #4b5563;
}

.guide-section {
  margin-top: 30px;
}

.guide-section h3 {
  margin: 0 0 14px;
  color: #111827;
  font-size: 17px;
  font-weight: 700;
  line-height: 1.45;
}

.guide-section p {
  margin: 0 0 16px;
  color: #4b5563;
  font-size: 16px;
  line-height: 1.8;
}

.guide-matrix-wrap {
  position: relative;
  margin-top: 36px;
  padding: 28px 32px 24px 58px;
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  background: #fbfcfe;
}

.guide-axis-y {
  position: absolute;
  left: 18px;
  top: 50%;
  width: 18px;
  color: #6b7280;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.1;
  text-align: center;
  transform: translateY(-50%);
  writing-mode: vertical-rl;
}

.guide-matrix {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  border: 1px solid #e5e7eb;
  background: #fff;
}

.guide-role-card {
  min-height: 150px;
  padding: 28px 34px;
  border-right: 1px solid #e5e7eb;
  border-bottom: 1px solid #e5e7eb;
  background: #fff;
}

.guide-role-card:nth-child(2n) {
  border-right: 0;
}

.guide-role-card:nth-last-child(-n + 2) {
  border-bottom: 0;
}

.guide-role-card.is-star {
  background: rgba(229, 57, 53, 0.08);
}

.guide-role-card.is-nurture {
  background: rgba(251, 140, 0, 0.1);
}

.guide-role-card.is-structure {
  background: rgba(67, 160, 71, 0.09);
}

.guide-role-card.is-cash {
  background: rgba(30, 136, 229, 0.08);
}

.guide-role-card h4 {
  margin: 0 0 14px;
  color: #111827;
  font-size: 18px;
  font-weight: 700;
  line-height: 1.4;
  text-align: center;
}

.guide-role-card p {
  margin: 8px 0 0;
  color: #4b5563;
  font-size: 15px;
  line-height: 1.65;
}

.guide-role-card strong {
  color: #374151;
  font-weight: 700;
}

.guide-axis-x {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
  margin-top: 16px;
  color: #6b7280;
  text-align: center;
}

.guide-axis-x span {
  font-size: 16px;
  font-weight: 700;
}

.guide-axis-x small {
  font-size: 13px;
  font-weight: 600;
}

.node-config-panel {
  display: flex;
  flex-direction: column;
  gap: 14px;
}

.node-config-meta {
  color: #2f3b52;
  font-size: 15px;
  line-height: 1.5;
}

.node-config-form {
  margin-top: 4px;
}

.node-config-current {
  color: #2f3b52;
  font-size: 16px;
  font-weight: 600;
}

.node-config-note {
  padding: 10px 12px;
  border-radius: 8px;
  background: #f7f8fa;
  color: var(--el-text-color-secondary);
  line-height: 1.6;
}

.node-config-footer {
  display: flex;
  justify-content: flex-end;
  gap: 12px;
}

@media (max-width: 1200px) {
  .tree-header {
    align-items: flex-start;
    flex-direction: column;
  }

  .tree-actions {
    flex-wrap: wrap;
  }

  .legend-wrap {
    justify-content: flex-start;
    flex-wrap: wrap;
    gap: 12px;
  }
}

@media (max-width: 768px) {
  :global(.category-guide-dialog .el-dialog__header) {
    padding: 24px 20px 8px;
  }

  :global(.category-guide-dialog .el-dialog__body) {
    padding: 0 20px 24px;
  }

  .guide-dialog-title {
    font-size: 20px;
  }

  .guide-section {
    margin-top: 22px;
  }

  .guide-section p {
    font-size: 15px;
  }

  .guide-matrix-wrap {
    padding: 22px 14px 18px 38px;
  }

  .guide-matrix {
    grid-template-columns: 1fr;
  }

  .guide-role-card,
  .guide-role-card:nth-child(2n),
  .guide-role-card:nth-last-child(-n + 2) {
    min-height: auto;
    padding: 22px 18px;
    border-right: 0;
    border-bottom: 1px solid #e5e7eb;
  }

  .guide-role-card:last-child {
    border-bottom: 0;
  }
}
</style>

<template>
  <div class="p-2 category-tree-page">
    <el-card shadow="hover" class="mb-[12px]">
      <div class="query-header">
        <div class="update-time">更新时间：{{ updateTimeText }}</div>
        <div class="query-actions">
          <el-button text @click="toggleQueryCollapse">{{ queryCollapsed ? '展开' : '收起' }}</el-button>
          <el-button @click="handleReset">重置</el-button>
          <el-button v-hasPermi="['category:tree:list']" type="success" icon="Search" @click="handleSearch">查询</el-button>
        </div>
      </div>

      <transition :enter-active-class="proxy?.animate.searchAnimate.enter" :leave-active-class="proxy?.animate.searchAnimate.leave">
        <div v-show="!queryCollapsed" class="query-form-wrap">
          <el-form :model="queryForm" :inline="true" label-width="80px">
            <el-form-item label="门店范围">
              <el-select v-model="queryForm.storeScope" placeholder="请选择门店范围" style="width: 200px">
                <el-option v-for="item in storeOptions" :key="String(item.value)" :label="item.label" :value="String(item.value)" />
              </el-select>
            </el-form-item>
            <el-form-item label="品类级别">
              <el-select v-model="queryForm.categoryLevel" placeholder="请选择品类级别" style="width: 160px">
                <el-option label="一级品类" :value="1" />
                <el-option label="二级品类" :value="2" />
                <el-option label="三级品类" :value="3" />
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
                style="width: 260px"
              >
                <el-option v-for="item in categoryOptions" :key="String(item.value)" :label="item.label" :value="item.value" />
              </el-select>
            </el-form-item>
            <el-form-item label="品类角色">
              <el-select
                v-model="queryForm.roleNames"
                multiple
                clearable
                collapse-tags
                collapse-tags-tooltip
                :max-collapse-tags="2"
                placeholder="全部"
                style="width: 260px"
              >
                <el-option v-for="item in roleOptions" :key="item.roleName" :label="item.roleName" :value="item.roleName" />
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

    <el-card shadow="hover">
      <template #header>
        <div class="tree-header">
          <div class="tree-title">品类树</div>
          <div class="tree-actions">
            <el-button @click="guideDialogVisible = true">品类定位设定指南</el-button>
            <el-button type="primary" plain @click="downloadTreeImage">下载树图</el-button>
          </div>
        </div>
      </template>

      <el-alert
        :closable="false"
        class="mb-[12px]"
        title="品类实际SKU数以所选门店范围下在向前30天内有（销售或有库存）且状态为上架的商品作为统计依据！品类角色和标准SKU数来源于企业设置！"
        type="info"
      />

      <div class="legend-wrap">
        <div
          v-for="item in legendItems"
          :key="item.roleName"
          class="legend-item"
          :class="{ disabled: !item.active }"
          @click="toggleLegend(item.roleName)"
        >
          <span class="legend-dot" :style="{ backgroundColor: item.active ? item.color : '#C0C4CC' }" />
          <span>{{ item.roleName }}</span>
        </div>
      </div>

      <div v-loading="treeLoading || childLoading" class="chart-wrap">
        <div ref="chartRef" class="chart-inner"></div>
      </div>
    </el-card>

    <el-dialog v-model="guideDialogVisible" title="品类定位设定指南" width="980px" append-to-body>
      <div class="guide-content">
        <div class="guide-section-title">1. 品类定位的定义:</div>
        <div class="guide-paragraph">
          品类定位即品类角色。是零售企业从自身发展规划和商品策略出发，根据每个品类在实际经营中的表现，结合市场发展趋势、顾客定位、竞争对手和供应商等因素考虑，为每个品类确定其在企业中所承担的角色和要发挥的作用。
        </div>
        <div class="guide-section-title">2. 如何设定品类定位:</div>
        <div class="guide-paragraph">
          不同业态或者性质的门店对于同一品类的角色定位也会有所不同，因此零售企业需要根据自身实际情况决定划分品类角色的门店组。此外，系统也支持对单门店进行品类角色划分。
          依据企业的自身的要求，划分品类角色的方式也有所不同，以行业内普适的一种划分方式为例进行介绍：以品类"综合贡献率"、"销售增长率"作为矩阵的横、纵轴，将企业同一级别的品类进行划分，从而定位品类的初始角色，企业可在此基础上基于自身考虑对品类角色进一步调整。
        </div>

        <div class="quadrant">
          <div class="axis-x">品类综合贡献率（销售额占比*权重+销售量占比*权重+毛利额占比*权重）</div>
          <div class="axis-y">品类销售增长率</div>
          <div class="quad q1">
            <h4>幼童品类</h4>
            <p>特点：增长快，投入大，存在不确定性，可能成为明星品类或滞涨；</p>
            <p>策略：促进成长，策略性投入；</p>
          </div>
          <div class="quad q2">
            <h4>明星品类</h4>
            <p>特点：市场地位领先，高增长竞争激烈；</p>
            <p>策略：保持优势，持续重点投入；</p>
          </div>
          <div class="quad q3">
            <h4>结构品类</h4>
            <p>特点：结构或便利性补充，发展缓慢，业务衰退；</p>
            <p>策略：创新、优化、收缩或退出；</p>
          </div>
          <div class="quad q4">
            <h4>金牛品类</h4>
            <p>特点：市场份额较高，增长放缓，影响大，竞争激烈；</p>
            <p>策略：巩固、选择性投入；</p>
          </div>
        </div>
      </div>
    </el-dialog>
  </div>
</template>

<script setup name="CategoryTree" lang="ts">
import * as echarts from 'echarts';
import { ElMessage } from 'element-plus';
import { listCategoryRoles, queryCategoryTree, queryCategoryTreeChildren } from '@/api/category/tree';
import {
  CategoryRoleVO,
  CategorySankeyVO,
  CategoryTreeChildrenQuery,
  CategoryTreeQuery,
  OptionVO,
  SankeyLinkVO,
  SankeyNodeVO
} from '@/api/category/tree/types';
import { useRequest } from '@/hooks/useRequest';

interface LegendItem {
  roleName: string;
  color: string;
  active: boolean;
}

interface DrillItem {
  id: string | number;
  level: number;
  parentId?: string | number;
}

const proxy = getCurrentInstance()?.proxy as any;
const chartRef = ref<HTMLDivElement>();
const chartIns = ref<echarts.ECharts>();

const ROLE_COLORS = ['#E63946', '#F9C74F', '#2A9D8F', '#1D3557', '#9C27B0', '#F4A261', '#43AA8B', '#577590'];

const queryCollapsed = ref(false);
const guideDialogVisible = ref(false);
const updateTime = ref<string>('');
const selectedNodeId = ref<string>('');
const disabledRoleSet = ref<Set<string>>(new Set());
const drillStack = ref<DrillItem[]>([]);
const storeOptions = ref<OptionVO[]>([{ label: '全店', value: 'all' }]);
const categoryOptions = ref<OptionVO[]>([]);
const skuAbnormalOptions = ref<OptionVO[]>([]);
const roleOptions = ref<CategoryRoleVO[]>([]);
const legendItems = ref<LegendItem[]>([]);
const latestNodes = ref<SankeyNodeVO[]>([]);
const latestLinks = ref<SankeyLinkVO[]>([]);
const refreshTimer = ref<number>();

const queryForm = reactive({
  storeScope: 'all',
  categoryLevel: 2 as 1 | 2 | 3,
  categoryIds: [] as Array<string | number>,
  roleNames: [] as string[],
  skuAbnormalTypes: [] as string[]
});

const updateTimeText = computed(() => updateTime.value || '--');

const roleColorMap = computed(() => {
  const map = new Map<string, string>();
  legendItems.value.forEach((item) => map.set(item.roleName, item.color));
  return map;
});

const treeRequest = useRequest(async (params: CategoryTreeQuery) => await queryCategoryTree(params));
const childRequest = useRequest(async (params: CategoryTreeChildrenQuery) => await queryCategoryTreeChildren(params));
const roleRequest = useRequest(async () => await listCategoryRoles());

const treeLoading = computed(() => treeRequest.loading.value);
const childLoading = computed(() => childRequest.loading.value);

const toNodeKey = (node: SankeyNodeVO) => String(node.id ?? node.categoryId ?? node.name);
const toRoleColor = (roleName?: string) => (roleName ? roleColorMap.value.get(roleName) || '#91A0B8' : '#91A0B8');

const buildLabel = (node: SankeyNodeVO) => {
  const code = node.categoryCode || '';
  const name = node.categoryName || node.rawName || node.name || '';
  const skuCount = Number(node.skuCount ?? node.value ?? 0);
  return `${code ? `${code} ` : ''}${name} (${skuCount})`;
};

const buildBaseQuery = (): CategoryTreeQuery => ({
  storeScope: queryForm.storeScope,
  categoryLevel: queryForm.categoryLevel,
  categoryIds: queryForm.categoryIds,
  roleNames: queryForm.roleNames,
  skuAbnormalTypes: queryForm.skuAbnormalTypes,
  disabledRoles: [...disabledRoleSet.value]
});

const normalizeSankey = (data: CategorySankeyVO) => {
  const rawNodes = data.nodes || data.nodeList || [];
  const rawLinks = data.links || data.linkList || [];
  const aliasMap = new Map<string, string>();

  const nodes = rawNodes.map((item) => {
    const id = toNodeKey(item);
    aliasMap.set(id, id);
    aliasMap.set(String(item.name), id);
    if (item.categoryCode) aliasMap.set(String(item.categoryCode), id);
    const color = toRoleColor(item.roleName);
    return {
      ...item,
      id,
      name: id,
      displayLabel: buildLabel(item),
      itemStyle: { color, opacity: 1 }
    };
  });

  const links = rawLinks.map((item) => {
    const source = aliasMap.get(String(item.source)) || String(item.source);
    const target = aliasMap.get(String(item.target)) || String(item.target);
    return {
      ...item,
      source,
      target,
      value: Number(item.value || 0),
      lineStyle: { opacity: 0.45 }
    };
  });

  return { nodes, links };
};

const applySelectionStyle = (nodes: SankeyNodeVO[], links: SankeyLinkVO[]) => {
  if (!selectedNodeId.value) return { nodes, links };

  const activeNodes = new Set<string>([selectedNodeId.value]);
  links.forEach((item) => {
    const s = String(item.source);
    const t = String(item.target);
    if (s === selectedNodeId.value || t === selectedNodeId.value) {
      activeNodes.add(s);
      activeNodes.add(t);
    }
  });

  const nextNodes = nodes.map((node: any) => ({
    ...node,
    itemStyle: {
      ...(node.itemStyle || {}),
      opacity: activeNodes.has(node.name) ? 1 : 0.25
    }
  }));

  const nextLinks = links.map((link: any) => {
    const active = String(link.source) === selectedNodeId.value || String(link.target) === selectedNodeId.value;
    return {
      ...link,
      lineStyle: {
        ...(link.lineStyle || {}),
        opacity: active ? 0.85 : 0.08
      }
    };
  });
  return { nodes: nextNodes, links: nextLinks };
};

const renderChart = (nodes: SankeyNodeVO[], links: SankeyLinkVO[]) => {
  if (!chartRef.value) return;
  if (!chartIns.value) {
    chartIns.value = echarts.init(chartRef.value);
    chartIns.value.on('click', handleChartClick);
  }

  const withSelection = applySelectionStyle(nodes, links);

  chartIns.value.setOption({
    tooltip: {
      trigger: 'item',
      formatter: (params: any) => {
        if (params.dataType === 'edge') {
          return `${params.data.source} → ${params.data.target}<br/>SKU链路值：${params.data.value}`;
        }
        const data = params.data;
        return [
          `品类：${data.categoryName || data.rawName || data.displayLabel || ''}`,
          `SKU数：${data.skuCount ?? data.value ?? 0}`,
          `品类角色：${data.roleName || '--'}`,
          `近30天销售：${data.sales30d ?? '--'}`
        ].join('<br/>');
      }
    },
    series: [
      {
        type: 'sankey',
        left: 12,
        right: 12,
        top: 12,
        bottom: 12,
        nodeAlign: 'justify',
        draggable: true,
        emphasis: {
          focus: 'adjacency'
        },
        label: {
          color: '#303133',
          fontSize: 12,
          formatter: (params: any) => params.data.displayLabel || params.data.name
        },
        lineStyle: {
          color: 'source',
          curveness: 0.5
        },
        data: withSelection.nodes,
        links: withSelection.links
      }
    ]
  });
};

const syncOptionsAndTime = (data: CategorySankeyVO) => {
  updateTime.value = data.updateTime || updateTime.value;
  if (Array.isArray(data.storeOptions) && data.storeOptions.length) {
    storeOptions.value = data.storeOptions;
    if (!storeOptions.value.some((item) => String(item.value) === String(queryForm.storeScope))) {
      queryForm.storeScope = String(storeOptions.value[0]?.value || 'all');
    }
  }
  if (Array.isArray(data.categoryOptions)) {
    categoryOptions.value = data.categoryOptions;
  }
  if (Array.isArray(data.skuAbnormalOptions)) {
    skuAbnormalOptions.value = data.skuAbnormalOptions;
  }
};

const applySankeyData = (data: CategorySankeyVO) => {
  syncOptionsAndTime(data);
  const { nodes, links } = normalizeSankey(data);
  latestNodes.value = nodes;
  latestLinks.value = links;
  if (!nodes.length) {
    chartIns.value?.clear();
    return false;
  }
  renderChart(nodes, links);
  return true;
};

const initRoleLegend = async () => {
  const res = await roleRequest.run(undefined as never);
  const list: CategoryRoleVO[] = res?.data || [];
  roleOptions.value = list;
  legendItems.value = list.map((item, index) => ({
    roleName: item.roleName,
    color: ROLE_COLORS[index % ROLE_COLORS.length],
    active: true
  }));
};

const refreshLegendActiveState = () => {
  legendItems.value = legendItems.value.map((item) => ({
    ...item,
    active: !disabledRoleSet.value.has(item.roleName)
  }));
};

const loadRootTree = async () => {
  selectedNodeId.value = '';
  const res = await treeRequest.run(buildBaseQuery());
  const data = res?.data || {};
  const ok = applySankeyData(data);
  drillStack.value = [{ id: 'root', level: Number(data.currentLevel || queryForm.categoryLevel) }];
  return ok;
};

const loadChildrenTree = async (node: SankeyNodeVO, appendStack = true) => {
  const params: CategoryTreeChildrenQuery = {
    categoryId: node.id,
    level: Number(node.level || 0),
    ...buildBaseQuery()
  };
  selectedNodeId.value = '';
  const res = await childRequest.run(params);
  const data = res?.data || {};
  const ok = applySankeyData(data);
  if (ok && appendStack) {
    drillStack.value.push({
      id: String(node.id),
      level: Number(node.level || 0),
      parentId: node.parentId
    });
  }
  return ok;
};

const loadCurrentByStack = async () => {
  if (drillStack.value.length <= 1) {
    await loadRootTree();
    return;
  }
  const currentId = String(drillStack.value[drillStack.value.length - 1].id);
  const targetNode = latestNodes.value.find((item) => String(item.id) === currentId);
  if (!targetNode) {
    await loadRootTree();
    return;
  }
  await loadChildrenTree(targetNode, false);
};

const handleChartClick = async (params: any) => {
  if (params?.dataType !== 'node') return;
  const nodeId = String(params.data.id || params.data.name);
  selectedNodeId.value = nodeId;
  renderChart(latestNodes.value, latestLinks.value);

  const clicked = latestNodes.value.find((item) => String(item.id) === nodeId);
  if (!clicked) return;

  const current = drillStack.value[drillStack.value.length - 1];
  const isBackAction = drillStack.value.length > 1 && String(current.id) === nodeId;
  if (isBackAction) {
    drillStack.value.pop();
    await loadCurrentByStack();
    return;
  }

  const ok = await loadChildrenTree(clicked, true);
  if (!ok) {
    drillStack.value = drillStack.value.slice(0, Math.max(1, drillStack.value.length - 1));
    ElMessage.warning('该品类没有下一级数据');
  }
};

const toggleLegend = async (roleName: string) => {
  if (disabledRoleSet.value.has(roleName)) {
    disabledRoleSet.value.delete(roleName);
  } else {
    disabledRoleSet.value.add(roleName);
  }
  refreshLegendActiveState();
  await loadRootTree();
};

const toggleQueryCollapse = () => {
  queryCollapsed.value = !queryCollapsed.value;
};

const handleSearch = async () => {
  await loadRootTree();
};

const handleReset = async () => {
  queryForm.storeScope = 'all';
  queryForm.categoryLevel = 2;
  queryForm.categoryIds = [];
  queryForm.roleNames = [];
  queryForm.skuAbnormalTypes = [];
  disabledRoleSet.value.clear();
  refreshLegendActiveState();
  await loadRootTree();
};

const downloadTreeImage = () => {
  if (!chartIns.value) return;
  const dataUrl = chartIns.value.getDataURL({
    type: 'png',
    pixelRatio: 2,
    backgroundColor: '#fff'
  });
  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `品类树_${Date.now()}.png`;
  link.click();
};

const startAutoRefresh = () => {
  stopAutoRefresh();
  refreshTimer.value = window.setInterval(() => {
    loadCurrentByStack();
  }, 60000);
};

const stopAutoRefresh = () => {
  if (refreshTimer.value) {
    window.clearInterval(refreshTimer.value);
  }
};

const resizeChart = () => chartIns.value?.resize();

onMounted(async () => {
  await initRoleLegend();
  await loadRootTree();
  startAutoRefresh();
  window.addEventListener('resize', resizeChart);
});

onBeforeUnmount(() => {
  stopAutoRefresh();
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
  font-size: 16px;
  font-weight: 600;
  color: var(--el-text-color-primary);
}

.tree-actions {
  display: flex;
  gap: 10px;
}

.legend-wrap {
  display: flex;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 12px;
}

.legend-item {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  color: var(--el-text-color-primary);
  user-select: none;
}

.legend-item.disabled {
  color: var(--el-text-color-placeholder);
}

.legend-dot {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  display: inline-block;
}

.chart-wrap {
  min-height: 560px;
  height: calc(100vh - 340px);
  border: 1px solid var(--el-border-color-lighter);
  border-radius: 4px;
}

.chart-inner {
  width: 100%;
  height: 100%;
}

.guide-content {
  line-height: 1.7;
  color: var(--el-text-color-primary);
}

.guide-section-title {
  font-weight: 600;
  margin-top: 6px;
}

.guide-paragraph {
  margin: 4px 0 10px;
}

.quadrant {
  position: relative;
  margin-top: 12px;
  border: 1px solid var(--el-border-color-light);
  display: grid;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 1fr 1fr;
  min-height: 360px;
}

.axis-x {
  position: absolute;
  bottom: -30px;
  left: 50%;
  transform: translateX(-50%);
  font-size: 12px;
  color: var(--el-text-color-secondary);
  white-space: nowrap;
}

.axis-y {
  position: absolute;
  left: -22px;
  top: 50%;
  transform: translateY(-50%) rotate(-90deg);
  transform-origin: left top;
  font-size: 12px;
  color: var(--el-text-color-secondary);
}

.quad {
  padding: 12px;
  border-right: 1px solid var(--el-border-color-light);
  border-bottom: 1px solid var(--el-border-color-light);
  font-size: 13px;
}

.quad h4 {
  margin: 0 0 4px;
  font-size: 14px;
}

.quad p {
  margin: 4px 0;
}

.q1 {
  background: #e8f4ff;
}

.q2 {
  background: #ffe8f0;
  border-right: none;
}

.q3 {
  background: #f2f4f7;
  border-bottom: none;
}

.q4 {
  background: #fff7dc;
  border-right: none;
  border-bottom: none;
}

@media (max-width: 1200px) {
  .chart-wrap {
    height: 560px;
  }
}
</style>

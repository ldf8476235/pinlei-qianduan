import { reactive } from 'vue';

export interface VueChartTooltipRow {
  name: string;
  value: string;
  color?: string;
}

export interface VueChartTooltipState {
  visible: boolean;
  x: number;
  y: number;
  title: string;
  rows: VueChartTooltipRow[];
}

export const createVueChartTooltip = () =>
  reactive<VueChartTooltipState>({
    visible: false,
    x: 0,
    y: 0,
    title: '',
    rows: []
  });

export const hideVueChartTooltip = (state: VueChartTooltipState) => {
  state.visible = false;
};

export const showVueChartTooltip = (
  state: VueChartTooltipState,
  event: MouseEvent,
  title: string,
  rows: VueChartTooltipRow[],
  options: { width?: number; height?: number; offsetX?: number; offsetY?: number } = {}
) => {
  const wrap = event.currentTarget as HTMLElement;
  const wrapRect = wrap.getBoundingClientRect();
  const tooltipWidth = options.width ?? 260;
  const tooltipHeight = options.height ?? 120;
  const offsetX = options.offsetX ?? 14;
  const offsetY = options.offsetY ?? 88;
  const nextX = event.clientX - wrapRect.left + offsetX;
  const nextY = event.clientY - wrapRect.top - offsetY;

  state.visible = true;
  state.x = Math.min(Math.max(12, nextX), Math.max(12, wrapRect.width - tooltipWidth - 12));
  state.y = Math.max(12, Math.min(nextY, Math.max(12, wrapRect.height - tooltipHeight - 12)));
  state.title = title;
  state.rows = rows;
};

export const getCategoryIndexByMouse = (
  event: MouseEvent,
  chartEl: HTMLElement,
  count: number,
  grid: { left: number; right: number }
) => {
  if (count <= 0) return -1;
  const rect = chartEl.getBoundingClientRect();
  const plotWidth = Math.max(1, rect.width - grid.left - grid.right);
  const ratio = Math.max(0, Math.min(1, (event.clientX - rect.left - grid.left) / plotWidth));
  return Math.round(ratio * Math.max(count - 1, 0));
};

export const getCategoryIndexByMouseY = (
  event: MouseEvent,
  chartEl: HTMLElement,
  count: number,
  grid: { top: number; bottom: number }
) => {
  if (count <= 0) return -1;
  const rect = chartEl.getBoundingClientRect();
  const plotHeight = Math.max(1, rect.height - grid.top - grid.bottom);
  const ratio = Math.max(0, Math.min(1, (event.clientY - rect.top - grid.top) / plotHeight));
  return Math.round(ratio * Math.max(count - 1, 0));
};

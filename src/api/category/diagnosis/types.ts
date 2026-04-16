export interface DiagnosisApiResponse<T> {
  success: boolean;
  code: string;
  message: string;
  data: T;
  requestId: string;
  timestamp: string;
}

export interface DiagnosisSessionCreateRequest {
  classLevel?: number;
  classNo?: string;
  className?: string;
  deptId?: string;
  retailTypeId?: string;
  businessCircleId?: string;
  deptGroupId?: string;
  storeNo?: string;
  periodStart?: string;
  periodEnd?: string;
  compareStart?: string;
  compareEnd?: string;
  extraFilterJson?: string;
  triggerIfMissing?: boolean;
  waitSeconds?: number;
}

export interface DiagnosisSessionCreateResponse {
  sessionId: string;
  queryHash: string;
  dataVersion?: string;
  cacheHit: boolean;
  ready: boolean;
  triggeredJobId?: number;
  status: string;
  orchestratorStatus: string;
  source: string;
}

export interface DiagnosisSessionStatusResponse {
  sessionId: string;
  queryHash: string;
  dataVersion?: string;
  jobId?: number;
  ready: boolean;
  status: string;
  progressPercent?: number;
  currentStage?: string;
  orchestratorStatus?: string;
  moduleProgressJson?: string;
}

export interface DiagnosisRecordOptionVO {
  label: string;
  value: string | number;
}

export interface DiagnosisRecordFilterOptions {
  storeScopeText?: string;
  levelOptions: DiagnosisRecordOptionVO[];
  categoryOptions: DiagnosisRecordOptionVO[];
  orgOptions: DiagnosisRecordOptionVO[];
  retailTypeOptions: DiagnosisRecordOptionVO[];
  circleOptions: DiagnosisRecordOptionVO[];
  deptGroupOptions: DiagnosisRecordOptionVO[];
}

export interface DiagnosisRecordQuery extends PageQuery {
  storeScope?: string;
  classLevel?: string | number;
  classNos?: Array<string | number>;
  periodStart?: string;
  periodEnd?: string;
  compareStart?: string;
  compareEnd?: string;
  deptId?: string;
  retailTypeId?: string;
  businessCircleId?: string;
  deptGroupId?: string;
  orderByColumn?: string;
  isAsc?: 'asc' | 'desc';
}

export interface DiagnosisRecordRow {
  recordId?: string;
  jobId?: number;
  requestHash?: string;
  dataVersion?: string;
  classLevel?: number;
  classNo: string;
  className: string;
  deptId?: string;
  deptName?: string;
  retailTypeId?: string;
  retailTypeName?: string;
  businessCircleId?: string;
  businessCircleName?: string;
  deptGroupId?: string;
  deptGroupName?: string;
  storeNo?: string;
  storeRangeName?: string;
  status: string;
  statusLabel?: string;
  ready?: boolean;
  canViewReport?: boolean;
  periodStart: string;
  periodEnd: string;
  compareStart?: string;
  compareEnd?: string;
  createByName?: string;
  createTime?: string;
  progressPercent?: number;
  currentStage?: string;
}

export interface DiagnosisRecordPageResponse {
  rows: DiagnosisRecordRow[];
  total: number;
  pageNum: number;
  pageSize: number;
}

export declare function resetFactoryCounter(): void;
export interface TenantFactoryInput {
    id?: string;
    name?: string;
    email?: string;
    passwordHash?: string;
    emailVerified?: boolean;
    tier?: 'FREE' | 'PRO' | 'ENTERPRISE';
    primaryColor?: string;
    secondaryColor?: string;
    backgroundColor?: string;
    textColor?: string;
    fontFamily?: string;
    cornerRadius?: number;
    logoUrl?: string | null;
}
export declare function buildTenant(overrides?: TenantFactoryInput): {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    emailVerified: boolean;
    emailVerifyToken: null;
    region: string;
    tier: "FREE" | "PRO" | "ENTERPRISE";
    stripeCustomerId: null;
    syncPausedGlobal: boolean;
    primaryColor: string;
    secondaryColor: string;
    backgroundColor: string;
    textColor: string;
    fontFamily: string;
    cornerRadius: number;
    logoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    deletedAt: null;
};
export interface DataSourceFactoryInput {
    id?: string;
    tenantId?: string;
    name?: string;
    connectorType?: 'REST_API' | 'POSTGRESQL' | 'CSV' | 'WEBHOOK';
    syncSchedule?: 'MANUAL' | 'EVERY_15_MIN' | 'HOURLY' | 'DAILY' | 'WEEKLY';
}
export declare function buildDataSource(overrides?: DataSourceFactoryInput): {
    id: string;
    tenantId: string;
    name: string;
    connectorType: "REST_API" | "POSTGRESQL" | "CSV" | "WEBHOOK";
    syncSchedule: "MANUAL" | "EVERY_15_MIN" | "HOURLY" | "DAILY" | "WEEKLY";
    syncPaused: boolean;
    consecutiveFails: number;
    lastSyncAt: null;
    nextSyncAt: null;
    createdAt: Date;
    updatedAt: Date;
};
export interface DashboardFactoryInput {
    id?: string;
    tenantId?: string;
    name?: string;
    status?: 'DRAFT' | 'PUBLISHED' | 'ARCHIVED';
}
export declare function buildDashboard(overrides?: DashboardFactoryInput): {
    id: string;
    tenantId: string;
    name: string;
    description: null;
    status: "DRAFT" | "PUBLISHED" | "ARCHIVED";
    gridColumns: number;
    createdAt: Date;
    updatedAt: Date;
};
export interface WidgetFactoryInput {
    id?: string;
    dashboardId?: string;
    tenantId?: string;
    dataSourceId?: string;
    type?: 'LINE' | 'BAR' | 'PIE_DONUT' | 'AREA' | 'KPI_CARD' | 'TABLE' | 'FUNNEL';
    title?: string;
}
export declare function buildWidget(overrides?: WidgetFactoryInput): {
    id: string;
    dashboardId: string;
    tenantId: string;
    dataSourceId: string;
    type: "LINE" | "BAR" | "PIE_DONUT" | "AREA" | "KPI_CARD" | "TABLE" | "FUNNEL";
    title: string;
    subtitle: null;
    gridColumnStart: number;
    gridColumnSpan: number;
    gridRowStart: number;
    gridRowSpan: number;
    dimensionField: string;
    metricFields: {
        field: string;
        aggregation: string;
    }[];
    dateRangePreset: string;
    dateRangeStart: null;
    dateRangeEnd: null;
    groupingPeriod: string;
    typeConfig: {};
    sortOrder: number;
    createdAt: Date;
    updatedAt: Date;
};
export interface DataPointFactoryInput {
    id?: string;
    tenantId?: string;
    dataSourceId?: string;
    dimensions?: Record<string, unknown>;
    metrics?: Record<string, unknown>;
    timestamp?: Date;
    sourceHash?: string;
}
export declare function buildDataPoint(overrides?: DataPointFactoryInput): {
    id: string;
    tenantId: string;
    dataSourceId: string;
    dimensions: Record<string, unknown>;
    metrics: Record<string, unknown>;
    timestamp: Date;
    sourceHash: string;
    createdAt: Date;
};

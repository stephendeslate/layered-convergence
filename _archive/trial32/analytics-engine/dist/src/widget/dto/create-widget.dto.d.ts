export declare enum WidgetType {
    LINE_CHART = "LINE_CHART",
    BAR_CHART = "BAR_CHART",
    PIE_CHART = "PIE_CHART",
    AREA_CHART = "AREA_CHART",
    KPI_CARD = "KPI_CARD",
    TABLE = "TABLE",
    FUNNEL = "FUNNEL"
}
export declare class CreateWidgetDto {
    dashboardId: string;
    type: WidgetType;
    config: Record<string, any>;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
}

import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type WidgetModel = runtime.Types.Result.DefaultSelection<Prisma.$WidgetPayload>;
export type AggregateWidget = {
    _count: WidgetCountAggregateOutputType | null;
    _avg: WidgetAvgAggregateOutputType | null;
    _sum: WidgetSumAggregateOutputType | null;
    _min: WidgetMinAggregateOutputType | null;
    _max: WidgetMaxAggregateOutputType | null;
};
export type WidgetAvgAggregateOutputType = {
    positionX: number | null;
    positionY: number | null;
    width: number | null;
    height: number | null;
};
export type WidgetSumAggregateOutputType = {
    positionX: number | null;
    positionY: number | null;
    width: number | null;
    height: number | null;
};
export type WidgetMinAggregateOutputType = {
    id: string | null;
    dashboardId: string | null;
    type: $Enums.WidgetType | null;
    positionX: number | null;
    positionY: number | null;
    width: number | null;
    height: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type WidgetMaxAggregateOutputType = {
    id: string | null;
    dashboardId: string | null;
    type: $Enums.WidgetType | null;
    positionX: number | null;
    positionY: number | null;
    width: number | null;
    height: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type WidgetCountAggregateOutputType = {
    id: number;
    dashboardId: number;
    type: number;
    config: number;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type WidgetAvgAggregateInputType = {
    positionX?: true;
    positionY?: true;
    width?: true;
    height?: true;
};
export type WidgetSumAggregateInputType = {
    positionX?: true;
    positionY?: true;
    width?: true;
    height?: true;
};
export type WidgetMinAggregateInputType = {
    id?: true;
    dashboardId?: true;
    type?: true;
    positionX?: true;
    positionY?: true;
    width?: true;
    height?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type WidgetMaxAggregateInputType = {
    id?: true;
    dashboardId?: true;
    type?: true;
    positionX?: true;
    positionY?: true;
    width?: true;
    height?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type WidgetCountAggregateInputType = {
    id?: true;
    dashboardId?: true;
    type?: true;
    config?: true;
    positionX?: true;
    positionY?: true;
    width?: true;
    height?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type WidgetAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WidgetWhereInput;
    orderBy?: Prisma.WidgetOrderByWithRelationInput | Prisma.WidgetOrderByWithRelationInput[];
    cursor?: Prisma.WidgetWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | WidgetCountAggregateInputType;
    _avg?: WidgetAvgAggregateInputType;
    _sum?: WidgetSumAggregateInputType;
    _min?: WidgetMinAggregateInputType;
    _max?: WidgetMaxAggregateInputType;
};
export type GetWidgetAggregateType<T extends WidgetAggregateArgs> = {
    [P in keyof T & keyof AggregateWidget]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateWidget[P]> : Prisma.GetScalarType<T[P], AggregateWidget[P]>;
};
export type WidgetGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WidgetWhereInput;
    orderBy?: Prisma.WidgetOrderByWithAggregationInput | Prisma.WidgetOrderByWithAggregationInput[];
    by: Prisma.WidgetScalarFieldEnum[] | Prisma.WidgetScalarFieldEnum;
    having?: Prisma.WidgetScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WidgetCountAggregateInputType | true;
    _avg?: WidgetAvgAggregateInputType;
    _sum?: WidgetSumAggregateInputType;
    _min?: WidgetMinAggregateInputType;
    _max?: WidgetMaxAggregateInputType;
};
export type WidgetGroupByOutputType = {
    id: string;
    dashboardId: string;
    type: $Enums.WidgetType;
    config: runtime.JsonValue;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    createdAt: Date;
    updatedAt: Date;
    _count: WidgetCountAggregateOutputType | null;
    _avg: WidgetAvgAggregateOutputType | null;
    _sum: WidgetSumAggregateOutputType | null;
    _min: WidgetMinAggregateOutputType | null;
    _max: WidgetMaxAggregateOutputType | null;
};
type GetWidgetGroupByPayload<T extends WidgetGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<WidgetGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof WidgetGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], WidgetGroupByOutputType[P]> : Prisma.GetScalarType<T[P], WidgetGroupByOutputType[P]>;
}>>;
export type WidgetWhereInput = {
    AND?: Prisma.WidgetWhereInput | Prisma.WidgetWhereInput[];
    OR?: Prisma.WidgetWhereInput[];
    NOT?: Prisma.WidgetWhereInput | Prisma.WidgetWhereInput[];
    id?: Prisma.UuidFilter<"Widget"> | string;
    dashboardId?: Prisma.UuidFilter<"Widget"> | string;
    type?: Prisma.EnumWidgetTypeFilter<"Widget"> | $Enums.WidgetType;
    config?: Prisma.JsonFilter<"Widget">;
    positionX?: Prisma.IntFilter<"Widget"> | number;
    positionY?: Prisma.IntFilter<"Widget"> | number;
    width?: Prisma.IntFilter<"Widget"> | number;
    height?: Prisma.IntFilter<"Widget"> | number;
    createdAt?: Prisma.DateTimeFilter<"Widget"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Widget"> | Date | string;
    dashboard?: Prisma.XOR<Prisma.DashboardScalarRelationFilter, Prisma.DashboardWhereInput>;
};
export type WidgetOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    dashboardId?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    config?: Prisma.SortOrder;
    positionX?: Prisma.SortOrder;
    positionY?: Prisma.SortOrder;
    width?: Prisma.SortOrder;
    height?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    dashboard?: Prisma.DashboardOrderByWithRelationInput;
};
export type WidgetWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.WidgetWhereInput | Prisma.WidgetWhereInput[];
    OR?: Prisma.WidgetWhereInput[];
    NOT?: Prisma.WidgetWhereInput | Prisma.WidgetWhereInput[];
    dashboardId?: Prisma.UuidFilter<"Widget"> | string;
    type?: Prisma.EnumWidgetTypeFilter<"Widget"> | $Enums.WidgetType;
    config?: Prisma.JsonFilter<"Widget">;
    positionX?: Prisma.IntFilter<"Widget"> | number;
    positionY?: Prisma.IntFilter<"Widget"> | number;
    width?: Prisma.IntFilter<"Widget"> | number;
    height?: Prisma.IntFilter<"Widget"> | number;
    createdAt?: Prisma.DateTimeFilter<"Widget"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Widget"> | Date | string;
    dashboard?: Prisma.XOR<Prisma.DashboardScalarRelationFilter, Prisma.DashboardWhereInput>;
}, "id">;
export type WidgetOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    dashboardId?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    config?: Prisma.SortOrder;
    positionX?: Prisma.SortOrder;
    positionY?: Prisma.SortOrder;
    width?: Prisma.SortOrder;
    height?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.WidgetCountOrderByAggregateInput;
    _avg?: Prisma.WidgetAvgOrderByAggregateInput;
    _max?: Prisma.WidgetMaxOrderByAggregateInput;
    _min?: Prisma.WidgetMinOrderByAggregateInput;
    _sum?: Prisma.WidgetSumOrderByAggregateInput;
};
export type WidgetScalarWhereWithAggregatesInput = {
    AND?: Prisma.WidgetScalarWhereWithAggregatesInput | Prisma.WidgetScalarWhereWithAggregatesInput[];
    OR?: Prisma.WidgetScalarWhereWithAggregatesInput[];
    NOT?: Prisma.WidgetScalarWhereWithAggregatesInput | Prisma.WidgetScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Widget"> | string;
    dashboardId?: Prisma.UuidWithAggregatesFilter<"Widget"> | string;
    type?: Prisma.EnumWidgetTypeWithAggregatesFilter<"Widget"> | $Enums.WidgetType;
    config?: Prisma.JsonWithAggregatesFilter<"Widget">;
    positionX?: Prisma.IntWithAggregatesFilter<"Widget"> | number;
    positionY?: Prisma.IntWithAggregatesFilter<"Widget"> | number;
    width?: Prisma.IntWithAggregatesFilter<"Widget"> | number;
    height?: Prisma.IntWithAggregatesFilter<"Widget"> | number;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Widget"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Widget"> | Date | string;
};
export type WidgetCreateInput = {
    id?: string;
    type: $Enums.WidgetType;
    config: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dashboard: Prisma.DashboardCreateNestedOneWithoutWidgetsInput;
};
export type WidgetUncheckedCreateInput = {
    id?: string;
    dashboardId: string;
    type: $Enums.WidgetType;
    config: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WidgetUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumWidgetTypeFieldUpdateOperationsInput | $Enums.WidgetType;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX?: Prisma.IntFieldUpdateOperationsInput | number;
    positionY?: Prisma.IntFieldUpdateOperationsInput | number;
    width?: Prisma.IntFieldUpdateOperationsInput | number;
    height?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dashboard?: Prisma.DashboardUpdateOneRequiredWithoutWidgetsNestedInput;
};
export type WidgetUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dashboardId?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumWidgetTypeFieldUpdateOperationsInput | $Enums.WidgetType;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX?: Prisma.IntFieldUpdateOperationsInput | number;
    positionY?: Prisma.IntFieldUpdateOperationsInput | number;
    width?: Prisma.IntFieldUpdateOperationsInput | number;
    height?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WidgetCreateManyInput = {
    id?: string;
    dashboardId: string;
    type: $Enums.WidgetType;
    config: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WidgetUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumWidgetTypeFieldUpdateOperationsInput | $Enums.WidgetType;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX?: Prisma.IntFieldUpdateOperationsInput | number;
    positionY?: Prisma.IntFieldUpdateOperationsInput | number;
    width?: Prisma.IntFieldUpdateOperationsInput | number;
    height?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WidgetUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dashboardId?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumWidgetTypeFieldUpdateOperationsInput | $Enums.WidgetType;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX?: Prisma.IntFieldUpdateOperationsInput | number;
    positionY?: Prisma.IntFieldUpdateOperationsInput | number;
    width?: Prisma.IntFieldUpdateOperationsInput | number;
    height?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WidgetListRelationFilter = {
    every?: Prisma.WidgetWhereInput;
    some?: Prisma.WidgetWhereInput;
    none?: Prisma.WidgetWhereInput;
};
export type WidgetOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type WidgetCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dashboardId?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    config?: Prisma.SortOrder;
    positionX?: Prisma.SortOrder;
    positionY?: Prisma.SortOrder;
    width?: Prisma.SortOrder;
    height?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WidgetAvgOrderByAggregateInput = {
    positionX?: Prisma.SortOrder;
    positionY?: Prisma.SortOrder;
    width?: Prisma.SortOrder;
    height?: Prisma.SortOrder;
};
export type WidgetMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dashboardId?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    positionX?: Prisma.SortOrder;
    positionY?: Prisma.SortOrder;
    width?: Prisma.SortOrder;
    height?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WidgetMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dashboardId?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    positionX?: Prisma.SortOrder;
    positionY?: Prisma.SortOrder;
    width?: Prisma.SortOrder;
    height?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WidgetSumOrderByAggregateInput = {
    positionX?: Prisma.SortOrder;
    positionY?: Prisma.SortOrder;
    width?: Prisma.SortOrder;
    height?: Prisma.SortOrder;
};
export type WidgetCreateNestedManyWithoutDashboardInput = {
    create?: Prisma.XOR<Prisma.WidgetCreateWithoutDashboardInput, Prisma.WidgetUncheckedCreateWithoutDashboardInput> | Prisma.WidgetCreateWithoutDashboardInput[] | Prisma.WidgetUncheckedCreateWithoutDashboardInput[];
    connectOrCreate?: Prisma.WidgetCreateOrConnectWithoutDashboardInput | Prisma.WidgetCreateOrConnectWithoutDashboardInput[];
    createMany?: Prisma.WidgetCreateManyDashboardInputEnvelope;
    connect?: Prisma.WidgetWhereUniqueInput | Prisma.WidgetWhereUniqueInput[];
};
export type WidgetUncheckedCreateNestedManyWithoutDashboardInput = {
    create?: Prisma.XOR<Prisma.WidgetCreateWithoutDashboardInput, Prisma.WidgetUncheckedCreateWithoutDashboardInput> | Prisma.WidgetCreateWithoutDashboardInput[] | Prisma.WidgetUncheckedCreateWithoutDashboardInput[];
    connectOrCreate?: Prisma.WidgetCreateOrConnectWithoutDashboardInput | Prisma.WidgetCreateOrConnectWithoutDashboardInput[];
    createMany?: Prisma.WidgetCreateManyDashboardInputEnvelope;
    connect?: Prisma.WidgetWhereUniqueInput | Prisma.WidgetWhereUniqueInput[];
};
export type WidgetUpdateManyWithoutDashboardNestedInput = {
    create?: Prisma.XOR<Prisma.WidgetCreateWithoutDashboardInput, Prisma.WidgetUncheckedCreateWithoutDashboardInput> | Prisma.WidgetCreateWithoutDashboardInput[] | Prisma.WidgetUncheckedCreateWithoutDashboardInput[];
    connectOrCreate?: Prisma.WidgetCreateOrConnectWithoutDashboardInput | Prisma.WidgetCreateOrConnectWithoutDashboardInput[];
    upsert?: Prisma.WidgetUpsertWithWhereUniqueWithoutDashboardInput | Prisma.WidgetUpsertWithWhereUniqueWithoutDashboardInput[];
    createMany?: Prisma.WidgetCreateManyDashboardInputEnvelope;
    set?: Prisma.WidgetWhereUniqueInput | Prisma.WidgetWhereUniqueInput[];
    disconnect?: Prisma.WidgetWhereUniqueInput | Prisma.WidgetWhereUniqueInput[];
    delete?: Prisma.WidgetWhereUniqueInput | Prisma.WidgetWhereUniqueInput[];
    connect?: Prisma.WidgetWhereUniqueInput | Prisma.WidgetWhereUniqueInput[];
    update?: Prisma.WidgetUpdateWithWhereUniqueWithoutDashboardInput | Prisma.WidgetUpdateWithWhereUniqueWithoutDashboardInput[];
    updateMany?: Prisma.WidgetUpdateManyWithWhereWithoutDashboardInput | Prisma.WidgetUpdateManyWithWhereWithoutDashboardInput[];
    deleteMany?: Prisma.WidgetScalarWhereInput | Prisma.WidgetScalarWhereInput[];
};
export type WidgetUncheckedUpdateManyWithoutDashboardNestedInput = {
    create?: Prisma.XOR<Prisma.WidgetCreateWithoutDashboardInput, Prisma.WidgetUncheckedCreateWithoutDashboardInput> | Prisma.WidgetCreateWithoutDashboardInput[] | Prisma.WidgetUncheckedCreateWithoutDashboardInput[];
    connectOrCreate?: Prisma.WidgetCreateOrConnectWithoutDashboardInput | Prisma.WidgetCreateOrConnectWithoutDashboardInput[];
    upsert?: Prisma.WidgetUpsertWithWhereUniqueWithoutDashboardInput | Prisma.WidgetUpsertWithWhereUniqueWithoutDashboardInput[];
    createMany?: Prisma.WidgetCreateManyDashboardInputEnvelope;
    set?: Prisma.WidgetWhereUniqueInput | Prisma.WidgetWhereUniqueInput[];
    disconnect?: Prisma.WidgetWhereUniqueInput | Prisma.WidgetWhereUniqueInput[];
    delete?: Prisma.WidgetWhereUniqueInput | Prisma.WidgetWhereUniqueInput[];
    connect?: Prisma.WidgetWhereUniqueInput | Prisma.WidgetWhereUniqueInput[];
    update?: Prisma.WidgetUpdateWithWhereUniqueWithoutDashboardInput | Prisma.WidgetUpdateWithWhereUniqueWithoutDashboardInput[];
    updateMany?: Prisma.WidgetUpdateManyWithWhereWithoutDashboardInput | Prisma.WidgetUpdateManyWithWhereWithoutDashboardInput[];
    deleteMany?: Prisma.WidgetScalarWhereInput | Prisma.WidgetScalarWhereInput[];
};
export type EnumWidgetTypeFieldUpdateOperationsInput = {
    set?: $Enums.WidgetType;
};
export type IntFieldUpdateOperationsInput = {
    set?: number;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type WidgetCreateWithoutDashboardInput = {
    id?: string;
    type: $Enums.WidgetType;
    config: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WidgetUncheckedCreateWithoutDashboardInput = {
    id?: string;
    type: $Enums.WidgetType;
    config: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WidgetCreateOrConnectWithoutDashboardInput = {
    where: Prisma.WidgetWhereUniqueInput;
    create: Prisma.XOR<Prisma.WidgetCreateWithoutDashboardInput, Prisma.WidgetUncheckedCreateWithoutDashboardInput>;
};
export type WidgetCreateManyDashboardInputEnvelope = {
    data: Prisma.WidgetCreateManyDashboardInput | Prisma.WidgetCreateManyDashboardInput[];
    skipDuplicates?: boolean;
};
export type WidgetUpsertWithWhereUniqueWithoutDashboardInput = {
    where: Prisma.WidgetWhereUniqueInput;
    update: Prisma.XOR<Prisma.WidgetUpdateWithoutDashboardInput, Prisma.WidgetUncheckedUpdateWithoutDashboardInput>;
    create: Prisma.XOR<Prisma.WidgetCreateWithoutDashboardInput, Prisma.WidgetUncheckedCreateWithoutDashboardInput>;
};
export type WidgetUpdateWithWhereUniqueWithoutDashboardInput = {
    where: Prisma.WidgetWhereUniqueInput;
    data: Prisma.XOR<Prisma.WidgetUpdateWithoutDashboardInput, Prisma.WidgetUncheckedUpdateWithoutDashboardInput>;
};
export type WidgetUpdateManyWithWhereWithoutDashboardInput = {
    where: Prisma.WidgetScalarWhereInput;
    data: Prisma.XOR<Prisma.WidgetUpdateManyMutationInput, Prisma.WidgetUncheckedUpdateManyWithoutDashboardInput>;
};
export type WidgetScalarWhereInput = {
    AND?: Prisma.WidgetScalarWhereInput | Prisma.WidgetScalarWhereInput[];
    OR?: Prisma.WidgetScalarWhereInput[];
    NOT?: Prisma.WidgetScalarWhereInput | Prisma.WidgetScalarWhereInput[];
    id?: Prisma.UuidFilter<"Widget"> | string;
    dashboardId?: Prisma.UuidFilter<"Widget"> | string;
    type?: Prisma.EnumWidgetTypeFilter<"Widget"> | $Enums.WidgetType;
    config?: Prisma.JsonFilter<"Widget">;
    positionX?: Prisma.IntFilter<"Widget"> | number;
    positionY?: Prisma.IntFilter<"Widget"> | number;
    width?: Prisma.IntFilter<"Widget"> | number;
    height?: Prisma.IntFilter<"Widget"> | number;
    createdAt?: Prisma.DateTimeFilter<"Widget"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Widget"> | Date | string;
};
export type WidgetCreateManyDashboardInput = {
    id?: string;
    type: $Enums.WidgetType;
    config: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX: number;
    positionY: number;
    width: number;
    height: number;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WidgetUpdateWithoutDashboardInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumWidgetTypeFieldUpdateOperationsInput | $Enums.WidgetType;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX?: Prisma.IntFieldUpdateOperationsInput | number;
    positionY?: Prisma.IntFieldUpdateOperationsInput | number;
    width?: Prisma.IntFieldUpdateOperationsInput | number;
    height?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WidgetUncheckedUpdateWithoutDashboardInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumWidgetTypeFieldUpdateOperationsInput | $Enums.WidgetType;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX?: Prisma.IntFieldUpdateOperationsInput | number;
    positionY?: Prisma.IntFieldUpdateOperationsInput | number;
    width?: Prisma.IntFieldUpdateOperationsInput | number;
    height?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WidgetUncheckedUpdateManyWithoutDashboardInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumWidgetTypeFieldUpdateOperationsInput | $Enums.WidgetType;
    config?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    positionX?: Prisma.IntFieldUpdateOperationsInput | number;
    positionY?: Prisma.IntFieldUpdateOperationsInput | number;
    width?: Prisma.IntFieldUpdateOperationsInput | number;
    height?: Prisma.IntFieldUpdateOperationsInput | number;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WidgetSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dashboardId?: boolean;
    type?: boolean;
    config?: boolean;
    positionX?: boolean;
    positionY?: boolean;
    width?: boolean;
    height?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["widget"]>;
export type WidgetSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dashboardId?: boolean;
    type?: boolean;
    config?: boolean;
    positionX?: boolean;
    positionY?: boolean;
    width?: boolean;
    height?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["widget"]>;
export type WidgetSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dashboardId?: boolean;
    type?: boolean;
    config?: boolean;
    positionX?: boolean;
    positionY?: boolean;
    width?: boolean;
    height?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["widget"]>;
export type WidgetSelectScalar = {
    id?: boolean;
    dashboardId?: boolean;
    type?: boolean;
    config?: boolean;
    positionX?: boolean;
    positionY?: boolean;
    width?: boolean;
    height?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type WidgetOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "dashboardId" | "type" | "config" | "positionX" | "positionY" | "width" | "height" | "createdAt" | "updatedAt", ExtArgs["result"]["widget"]>;
export type WidgetInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
};
export type WidgetIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
};
export type WidgetIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
};
export type $WidgetPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Widget";
    objects: {
        dashboard: Prisma.$DashboardPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        dashboardId: string;
        type: $Enums.WidgetType;
        config: runtime.JsonValue;
        positionX: number;
        positionY: number;
        width: number;
        height: number;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["widget"]>;
    composites: {};
};
export type WidgetGetPayload<S extends boolean | null | undefined | WidgetDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$WidgetPayload, S>;
export type WidgetCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<WidgetFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: WidgetCountAggregateInputType | true;
};
export interface WidgetDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Widget'];
        meta: {
            name: 'Widget';
        };
    };
    findUnique<T extends WidgetFindUniqueArgs>(args: Prisma.SelectSubset<T, WidgetFindUniqueArgs<ExtArgs>>): Prisma.Prisma__WidgetClient<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends WidgetFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, WidgetFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__WidgetClient<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends WidgetFindFirstArgs>(args?: Prisma.SelectSubset<T, WidgetFindFirstArgs<ExtArgs>>): Prisma.Prisma__WidgetClient<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends WidgetFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, WidgetFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__WidgetClient<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends WidgetFindManyArgs>(args?: Prisma.SelectSubset<T, WidgetFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends WidgetCreateArgs>(args: Prisma.SelectSubset<T, WidgetCreateArgs<ExtArgs>>): Prisma.Prisma__WidgetClient<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends WidgetCreateManyArgs>(args?: Prisma.SelectSubset<T, WidgetCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends WidgetCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, WidgetCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends WidgetDeleteArgs>(args: Prisma.SelectSubset<T, WidgetDeleteArgs<ExtArgs>>): Prisma.Prisma__WidgetClient<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends WidgetUpdateArgs>(args: Prisma.SelectSubset<T, WidgetUpdateArgs<ExtArgs>>): Prisma.Prisma__WidgetClient<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends WidgetDeleteManyArgs>(args?: Prisma.SelectSubset<T, WidgetDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends WidgetUpdateManyArgs>(args: Prisma.SelectSubset<T, WidgetUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends WidgetUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, WidgetUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends WidgetUpsertArgs>(args: Prisma.SelectSubset<T, WidgetUpsertArgs<ExtArgs>>): Prisma.Prisma__WidgetClient<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends WidgetCountArgs>(args?: Prisma.Subset<T, WidgetCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], WidgetCountAggregateOutputType> : number>;
    aggregate<T extends WidgetAggregateArgs>(args: Prisma.Subset<T, WidgetAggregateArgs>): Prisma.PrismaPromise<GetWidgetAggregateType<T>>;
    groupBy<T extends WidgetGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: WidgetGroupByArgs['orderBy'];
    } : {
        orderBy?: WidgetGroupByArgs['orderBy'];
    }, OrderFields extends Prisma.ExcludeUnderscoreKeys<Prisma.Keys<Prisma.MaybeTupleToUnion<T['orderBy']>>>, ByFields extends Prisma.MaybeTupleToUnion<T['by']>, ByValid extends Prisma.Has<ByFields, OrderFields>, HavingFields extends Prisma.GetHavingFields<T['having']>, HavingValid extends Prisma.Has<ByFields, HavingFields>, ByEmpty extends T['by'] extends never[] ? Prisma.True : Prisma.False, InputErrors extends ByEmpty extends Prisma.True ? `Error: "by" must not be empty.` : HavingValid extends Prisma.False ? {
        [P in HavingFields]: P extends ByFields ? never : P extends string ? `Error: Field "${P}" used in "having" needs to be provided in "by".` : [
            Error,
            'Field ',
            P,
            ` in "having" needs to be provided in "by"`
        ];
    }[HavingFields] : 'take' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "take", you also need to provide "orderBy"' : 'skip' extends Prisma.Keys<T> ? 'orderBy' extends Prisma.Keys<T> ? ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields] : 'Error: If you provide "skip", you also need to provide "orderBy"' : ByValid extends Prisma.True ? {} : {
        [P in OrderFields]: P extends ByFields ? never : `Error: Field "${P}" in "orderBy" needs to be provided in "by"`;
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, WidgetGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWidgetGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: WidgetFieldRefs;
}
export interface Prisma__WidgetClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    dashboard<T extends Prisma.DashboardDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DashboardDefaultArgs<ExtArgs>>): Prisma.Prisma__DashboardClient<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface WidgetFieldRefs {
    readonly id: Prisma.FieldRef<"Widget", 'String'>;
    readonly dashboardId: Prisma.FieldRef<"Widget", 'String'>;
    readonly type: Prisma.FieldRef<"Widget", 'WidgetType'>;
    readonly config: Prisma.FieldRef<"Widget", 'Json'>;
    readonly positionX: Prisma.FieldRef<"Widget", 'Int'>;
    readonly positionY: Prisma.FieldRef<"Widget", 'Int'>;
    readonly width: Prisma.FieldRef<"Widget", 'Int'>;
    readonly height: Prisma.FieldRef<"Widget", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"Widget", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Widget", 'DateTime'>;
}
export type WidgetFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelect<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    include?: Prisma.WidgetInclude<ExtArgs> | null;
    where: Prisma.WidgetWhereUniqueInput;
};
export type WidgetFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelect<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    include?: Prisma.WidgetInclude<ExtArgs> | null;
    where: Prisma.WidgetWhereUniqueInput;
};
export type WidgetFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelect<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    include?: Prisma.WidgetInclude<ExtArgs> | null;
    where?: Prisma.WidgetWhereInput;
    orderBy?: Prisma.WidgetOrderByWithRelationInput | Prisma.WidgetOrderByWithRelationInput[];
    cursor?: Prisma.WidgetWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WidgetScalarFieldEnum | Prisma.WidgetScalarFieldEnum[];
};
export type WidgetFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelect<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    include?: Prisma.WidgetInclude<ExtArgs> | null;
    where?: Prisma.WidgetWhereInput;
    orderBy?: Prisma.WidgetOrderByWithRelationInput | Prisma.WidgetOrderByWithRelationInput[];
    cursor?: Prisma.WidgetWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WidgetScalarFieldEnum | Prisma.WidgetScalarFieldEnum[];
};
export type WidgetFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelect<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    include?: Prisma.WidgetInclude<ExtArgs> | null;
    where?: Prisma.WidgetWhereInput;
    orderBy?: Prisma.WidgetOrderByWithRelationInput | Prisma.WidgetOrderByWithRelationInput[];
    cursor?: Prisma.WidgetWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WidgetScalarFieldEnum | Prisma.WidgetScalarFieldEnum[];
};
export type WidgetCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelect<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    include?: Prisma.WidgetInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WidgetCreateInput, Prisma.WidgetUncheckedCreateInput>;
};
export type WidgetCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.WidgetCreateManyInput | Prisma.WidgetCreateManyInput[];
    skipDuplicates?: boolean;
};
export type WidgetCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    data: Prisma.WidgetCreateManyInput | Prisma.WidgetCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.WidgetIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type WidgetUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelect<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    include?: Prisma.WidgetInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WidgetUpdateInput, Prisma.WidgetUncheckedUpdateInput>;
    where: Prisma.WidgetWhereUniqueInput;
};
export type WidgetUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.WidgetUpdateManyMutationInput, Prisma.WidgetUncheckedUpdateManyInput>;
    where?: Prisma.WidgetWhereInput;
    limit?: number;
};
export type WidgetUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WidgetUpdateManyMutationInput, Prisma.WidgetUncheckedUpdateManyInput>;
    where?: Prisma.WidgetWhereInput;
    limit?: number;
    include?: Prisma.WidgetIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type WidgetUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelect<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    include?: Prisma.WidgetInclude<ExtArgs> | null;
    where: Prisma.WidgetWhereUniqueInput;
    create: Prisma.XOR<Prisma.WidgetCreateInput, Prisma.WidgetUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.WidgetUpdateInput, Prisma.WidgetUncheckedUpdateInput>;
};
export type WidgetDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelect<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    include?: Prisma.WidgetInclude<ExtArgs> | null;
    where: Prisma.WidgetWhereUniqueInput;
};
export type WidgetDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WidgetWhereInput;
    limit?: number;
};
export type WidgetDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WidgetSelect<ExtArgs> | null;
    omit?: Prisma.WidgetOmit<ExtArgs> | null;
    include?: Prisma.WidgetInclude<ExtArgs> | null;
};
export {};

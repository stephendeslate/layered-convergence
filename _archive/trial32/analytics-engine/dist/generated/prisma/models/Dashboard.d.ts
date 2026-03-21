import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type DashboardModel = runtime.Types.Result.DefaultSelection<Prisma.$DashboardPayload>;
export type AggregateDashboard = {
    _count: DashboardCountAggregateOutputType | null;
    _min: DashboardMinAggregateOutputType | null;
    _max: DashboardMaxAggregateOutputType | null;
};
export type DashboardMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    name: string | null;
    isPublished: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type DashboardMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    name: string | null;
    isPublished: boolean | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type DashboardCountAggregateOutputType = {
    id: number;
    tenantId: number;
    name: number;
    layout: number;
    isPublished: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type DashboardMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    name?: true;
    isPublished?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type DashboardMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    name?: true;
    isPublished?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type DashboardCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    name?: true;
    layout?: true;
    isPublished?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type DashboardAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DashboardWhereInput;
    orderBy?: Prisma.DashboardOrderByWithRelationInput | Prisma.DashboardOrderByWithRelationInput[];
    cursor?: Prisma.DashboardWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | DashboardCountAggregateInputType;
    _min?: DashboardMinAggregateInputType;
    _max?: DashboardMaxAggregateInputType;
};
export type GetDashboardAggregateType<T extends DashboardAggregateArgs> = {
    [P in keyof T & keyof AggregateDashboard]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDashboard[P]> : Prisma.GetScalarType<T[P], AggregateDashboard[P]>;
};
export type DashboardGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DashboardWhereInput;
    orderBy?: Prisma.DashboardOrderByWithAggregationInput | Prisma.DashboardOrderByWithAggregationInput[];
    by: Prisma.DashboardScalarFieldEnum[] | Prisma.DashboardScalarFieldEnum;
    having?: Prisma.DashboardScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DashboardCountAggregateInputType | true;
    _min?: DashboardMinAggregateInputType;
    _max?: DashboardMaxAggregateInputType;
};
export type DashboardGroupByOutputType = {
    id: string;
    tenantId: string;
    name: string;
    layout: runtime.JsonValue;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
    _count: DashboardCountAggregateOutputType | null;
    _min: DashboardMinAggregateOutputType | null;
    _max: DashboardMaxAggregateOutputType | null;
};
type GetDashboardGroupByPayload<T extends DashboardGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DashboardGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DashboardGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DashboardGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DashboardGroupByOutputType[P]>;
}>>;
export type DashboardWhereInput = {
    AND?: Prisma.DashboardWhereInput | Prisma.DashboardWhereInput[];
    OR?: Prisma.DashboardWhereInput[];
    NOT?: Prisma.DashboardWhereInput | Prisma.DashboardWhereInput[];
    id?: Prisma.UuidFilter<"Dashboard"> | string;
    tenantId?: Prisma.UuidFilter<"Dashboard"> | string;
    name?: Prisma.StringFilter<"Dashboard"> | string;
    layout?: Prisma.JsonFilter<"Dashboard">;
    isPublished?: Prisma.BoolFilter<"Dashboard"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Dashboard"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Dashboard"> | Date | string;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
    widgets?: Prisma.WidgetListRelationFilter;
    embedConfig?: Prisma.XOR<Prisma.EmbedConfigNullableScalarRelationFilter, Prisma.EmbedConfigWhereInput> | null;
};
export type DashboardOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    layout?: Prisma.SortOrder;
    isPublished?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    tenant?: Prisma.TenantOrderByWithRelationInput;
    widgets?: Prisma.WidgetOrderByRelationAggregateInput;
    embedConfig?: Prisma.EmbedConfigOrderByWithRelationInput;
};
export type DashboardWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.DashboardWhereInput | Prisma.DashboardWhereInput[];
    OR?: Prisma.DashboardWhereInput[];
    NOT?: Prisma.DashboardWhereInput | Prisma.DashboardWhereInput[];
    tenantId?: Prisma.UuidFilter<"Dashboard"> | string;
    name?: Prisma.StringFilter<"Dashboard"> | string;
    layout?: Prisma.JsonFilter<"Dashboard">;
    isPublished?: Prisma.BoolFilter<"Dashboard"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Dashboard"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Dashboard"> | Date | string;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
    widgets?: Prisma.WidgetListRelationFilter;
    embedConfig?: Prisma.XOR<Prisma.EmbedConfigNullableScalarRelationFilter, Prisma.EmbedConfigWhereInput> | null;
}, "id">;
export type DashboardOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    layout?: Prisma.SortOrder;
    isPublished?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.DashboardCountOrderByAggregateInput;
    _max?: Prisma.DashboardMaxOrderByAggregateInput;
    _min?: Prisma.DashboardMinOrderByAggregateInput;
};
export type DashboardScalarWhereWithAggregatesInput = {
    AND?: Prisma.DashboardScalarWhereWithAggregatesInput | Prisma.DashboardScalarWhereWithAggregatesInput[];
    OR?: Prisma.DashboardScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DashboardScalarWhereWithAggregatesInput | Prisma.DashboardScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Dashboard"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"Dashboard"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Dashboard"> | string;
    layout?: Prisma.JsonWithAggregatesFilter<"Dashboard">;
    isPublished?: Prisma.BoolWithAggregatesFilter<"Dashboard"> | boolean;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Dashboard"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Dashboard"> | Date | string;
};
export type DashboardCreateInput = {
    id?: string;
    name: string;
    layout: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutDashboardsInput;
    widgets?: Prisma.WidgetCreateNestedManyWithoutDashboardInput;
    embedConfig?: Prisma.EmbedConfigCreateNestedOneWithoutDashboardInput;
};
export type DashboardUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    name: string;
    layout: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    widgets?: Prisma.WidgetUncheckedCreateNestedManyWithoutDashboardInput;
    embedConfig?: Prisma.EmbedConfigUncheckedCreateNestedOneWithoutDashboardInput;
};
export type DashboardUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    layout?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutDashboardsNestedInput;
    widgets?: Prisma.WidgetUpdateManyWithoutDashboardNestedInput;
    embedConfig?: Prisma.EmbedConfigUpdateOneWithoutDashboardNestedInput;
};
export type DashboardUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    layout?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    widgets?: Prisma.WidgetUncheckedUpdateManyWithoutDashboardNestedInput;
    embedConfig?: Prisma.EmbedConfigUncheckedUpdateOneWithoutDashboardNestedInput;
};
export type DashboardCreateManyInput = {
    id?: string;
    tenantId: string;
    name: string;
    layout: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type DashboardUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    layout?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DashboardUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    layout?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DashboardListRelationFilter = {
    every?: Prisma.DashboardWhereInput;
    some?: Prisma.DashboardWhereInput;
    none?: Prisma.DashboardWhereInput;
};
export type DashboardOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type DashboardCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    layout?: Prisma.SortOrder;
    isPublished?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DashboardMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    isPublished?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DashboardMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    isPublished?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DashboardScalarRelationFilter = {
    is?: Prisma.DashboardWhereInput;
    isNot?: Prisma.DashboardWhereInput;
};
export type DashboardCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.DashboardCreateWithoutTenantInput, Prisma.DashboardUncheckedCreateWithoutTenantInput> | Prisma.DashboardCreateWithoutTenantInput[] | Prisma.DashboardUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DashboardCreateOrConnectWithoutTenantInput | Prisma.DashboardCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.DashboardCreateManyTenantInputEnvelope;
    connect?: Prisma.DashboardWhereUniqueInput | Prisma.DashboardWhereUniqueInput[];
};
export type DashboardUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.DashboardCreateWithoutTenantInput, Prisma.DashboardUncheckedCreateWithoutTenantInput> | Prisma.DashboardCreateWithoutTenantInput[] | Prisma.DashboardUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DashboardCreateOrConnectWithoutTenantInput | Prisma.DashboardCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.DashboardCreateManyTenantInputEnvelope;
    connect?: Prisma.DashboardWhereUniqueInput | Prisma.DashboardWhereUniqueInput[];
};
export type DashboardUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.DashboardCreateWithoutTenantInput, Prisma.DashboardUncheckedCreateWithoutTenantInput> | Prisma.DashboardCreateWithoutTenantInput[] | Prisma.DashboardUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DashboardCreateOrConnectWithoutTenantInput | Prisma.DashboardCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.DashboardUpsertWithWhereUniqueWithoutTenantInput | Prisma.DashboardUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.DashboardCreateManyTenantInputEnvelope;
    set?: Prisma.DashboardWhereUniqueInput | Prisma.DashboardWhereUniqueInput[];
    disconnect?: Prisma.DashboardWhereUniqueInput | Prisma.DashboardWhereUniqueInput[];
    delete?: Prisma.DashboardWhereUniqueInput | Prisma.DashboardWhereUniqueInput[];
    connect?: Prisma.DashboardWhereUniqueInput | Prisma.DashboardWhereUniqueInput[];
    update?: Prisma.DashboardUpdateWithWhereUniqueWithoutTenantInput | Prisma.DashboardUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.DashboardUpdateManyWithWhereWithoutTenantInput | Prisma.DashboardUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.DashboardScalarWhereInput | Prisma.DashboardScalarWhereInput[];
};
export type DashboardUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.DashboardCreateWithoutTenantInput, Prisma.DashboardUncheckedCreateWithoutTenantInput> | Prisma.DashboardCreateWithoutTenantInput[] | Prisma.DashboardUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DashboardCreateOrConnectWithoutTenantInput | Prisma.DashboardCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.DashboardUpsertWithWhereUniqueWithoutTenantInput | Prisma.DashboardUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.DashboardCreateManyTenantInputEnvelope;
    set?: Prisma.DashboardWhereUniqueInput | Prisma.DashboardWhereUniqueInput[];
    disconnect?: Prisma.DashboardWhereUniqueInput | Prisma.DashboardWhereUniqueInput[];
    delete?: Prisma.DashboardWhereUniqueInput | Prisma.DashboardWhereUniqueInput[];
    connect?: Prisma.DashboardWhereUniqueInput | Prisma.DashboardWhereUniqueInput[];
    update?: Prisma.DashboardUpdateWithWhereUniqueWithoutTenantInput | Prisma.DashboardUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.DashboardUpdateManyWithWhereWithoutTenantInput | Prisma.DashboardUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.DashboardScalarWhereInput | Prisma.DashboardScalarWhereInput[];
};
export type BoolFieldUpdateOperationsInput = {
    set?: boolean;
};
export type DashboardCreateNestedOneWithoutWidgetsInput = {
    create?: Prisma.XOR<Prisma.DashboardCreateWithoutWidgetsInput, Prisma.DashboardUncheckedCreateWithoutWidgetsInput>;
    connectOrCreate?: Prisma.DashboardCreateOrConnectWithoutWidgetsInput;
    connect?: Prisma.DashboardWhereUniqueInput;
};
export type DashboardUpdateOneRequiredWithoutWidgetsNestedInput = {
    create?: Prisma.XOR<Prisma.DashboardCreateWithoutWidgetsInput, Prisma.DashboardUncheckedCreateWithoutWidgetsInput>;
    connectOrCreate?: Prisma.DashboardCreateOrConnectWithoutWidgetsInput;
    upsert?: Prisma.DashboardUpsertWithoutWidgetsInput;
    connect?: Prisma.DashboardWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DashboardUpdateToOneWithWhereWithoutWidgetsInput, Prisma.DashboardUpdateWithoutWidgetsInput>, Prisma.DashboardUncheckedUpdateWithoutWidgetsInput>;
};
export type DashboardCreateNestedOneWithoutEmbedConfigInput = {
    create?: Prisma.XOR<Prisma.DashboardCreateWithoutEmbedConfigInput, Prisma.DashboardUncheckedCreateWithoutEmbedConfigInput>;
    connectOrCreate?: Prisma.DashboardCreateOrConnectWithoutEmbedConfigInput;
    connect?: Prisma.DashboardWhereUniqueInput;
};
export type DashboardUpdateOneRequiredWithoutEmbedConfigNestedInput = {
    create?: Prisma.XOR<Prisma.DashboardCreateWithoutEmbedConfigInput, Prisma.DashboardUncheckedCreateWithoutEmbedConfigInput>;
    connectOrCreate?: Prisma.DashboardCreateOrConnectWithoutEmbedConfigInput;
    upsert?: Prisma.DashboardUpsertWithoutEmbedConfigInput;
    connect?: Prisma.DashboardWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DashboardUpdateToOneWithWhereWithoutEmbedConfigInput, Prisma.DashboardUpdateWithoutEmbedConfigInput>, Prisma.DashboardUncheckedUpdateWithoutEmbedConfigInput>;
};
export type DashboardCreateWithoutTenantInput = {
    id?: string;
    name: string;
    layout: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    widgets?: Prisma.WidgetCreateNestedManyWithoutDashboardInput;
    embedConfig?: Prisma.EmbedConfigCreateNestedOneWithoutDashboardInput;
};
export type DashboardUncheckedCreateWithoutTenantInput = {
    id?: string;
    name: string;
    layout: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    widgets?: Prisma.WidgetUncheckedCreateNestedManyWithoutDashboardInput;
    embedConfig?: Prisma.EmbedConfigUncheckedCreateNestedOneWithoutDashboardInput;
};
export type DashboardCreateOrConnectWithoutTenantInput = {
    where: Prisma.DashboardWhereUniqueInput;
    create: Prisma.XOR<Prisma.DashboardCreateWithoutTenantInput, Prisma.DashboardUncheckedCreateWithoutTenantInput>;
};
export type DashboardCreateManyTenantInputEnvelope = {
    data: Prisma.DashboardCreateManyTenantInput | Prisma.DashboardCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type DashboardUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.DashboardWhereUniqueInput;
    update: Prisma.XOR<Prisma.DashboardUpdateWithoutTenantInput, Prisma.DashboardUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.DashboardCreateWithoutTenantInput, Prisma.DashboardUncheckedCreateWithoutTenantInput>;
};
export type DashboardUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.DashboardWhereUniqueInput;
    data: Prisma.XOR<Prisma.DashboardUpdateWithoutTenantInput, Prisma.DashboardUncheckedUpdateWithoutTenantInput>;
};
export type DashboardUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.DashboardScalarWhereInput;
    data: Prisma.XOR<Prisma.DashboardUpdateManyMutationInput, Prisma.DashboardUncheckedUpdateManyWithoutTenantInput>;
};
export type DashboardScalarWhereInput = {
    AND?: Prisma.DashboardScalarWhereInput | Prisma.DashboardScalarWhereInput[];
    OR?: Prisma.DashboardScalarWhereInput[];
    NOT?: Prisma.DashboardScalarWhereInput | Prisma.DashboardScalarWhereInput[];
    id?: Prisma.UuidFilter<"Dashboard"> | string;
    tenantId?: Prisma.UuidFilter<"Dashboard"> | string;
    name?: Prisma.StringFilter<"Dashboard"> | string;
    layout?: Prisma.JsonFilter<"Dashboard">;
    isPublished?: Prisma.BoolFilter<"Dashboard"> | boolean;
    createdAt?: Prisma.DateTimeFilter<"Dashboard"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Dashboard"> | Date | string;
};
export type DashboardCreateWithoutWidgetsInput = {
    id?: string;
    name: string;
    layout: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutDashboardsInput;
    embedConfig?: Prisma.EmbedConfigCreateNestedOneWithoutDashboardInput;
};
export type DashboardUncheckedCreateWithoutWidgetsInput = {
    id?: string;
    tenantId: string;
    name: string;
    layout: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    embedConfig?: Prisma.EmbedConfigUncheckedCreateNestedOneWithoutDashboardInput;
};
export type DashboardCreateOrConnectWithoutWidgetsInput = {
    where: Prisma.DashboardWhereUniqueInput;
    create: Prisma.XOR<Prisma.DashboardCreateWithoutWidgetsInput, Prisma.DashboardUncheckedCreateWithoutWidgetsInput>;
};
export type DashboardUpsertWithoutWidgetsInput = {
    update: Prisma.XOR<Prisma.DashboardUpdateWithoutWidgetsInput, Prisma.DashboardUncheckedUpdateWithoutWidgetsInput>;
    create: Prisma.XOR<Prisma.DashboardCreateWithoutWidgetsInput, Prisma.DashboardUncheckedCreateWithoutWidgetsInput>;
    where?: Prisma.DashboardWhereInput;
};
export type DashboardUpdateToOneWithWhereWithoutWidgetsInput = {
    where?: Prisma.DashboardWhereInput;
    data: Prisma.XOR<Prisma.DashboardUpdateWithoutWidgetsInput, Prisma.DashboardUncheckedUpdateWithoutWidgetsInput>;
};
export type DashboardUpdateWithoutWidgetsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    layout?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutDashboardsNestedInput;
    embedConfig?: Prisma.EmbedConfigUpdateOneWithoutDashboardNestedInput;
};
export type DashboardUncheckedUpdateWithoutWidgetsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    layout?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    embedConfig?: Prisma.EmbedConfigUncheckedUpdateOneWithoutDashboardNestedInput;
};
export type DashboardCreateWithoutEmbedConfigInput = {
    id?: string;
    name: string;
    layout: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutDashboardsInput;
    widgets?: Prisma.WidgetCreateNestedManyWithoutDashboardInput;
};
export type DashboardUncheckedCreateWithoutEmbedConfigInput = {
    id?: string;
    tenantId: string;
    name: string;
    layout: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    widgets?: Prisma.WidgetUncheckedCreateNestedManyWithoutDashboardInput;
};
export type DashboardCreateOrConnectWithoutEmbedConfigInput = {
    where: Prisma.DashboardWhereUniqueInput;
    create: Prisma.XOR<Prisma.DashboardCreateWithoutEmbedConfigInput, Prisma.DashboardUncheckedCreateWithoutEmbedConfigInput>;
};
export type DashboardUpsertWithoutEmbedConfigInput = {
    update: Prisma.XOR<Prisma.DashboardUpdateWithoutEmbedConfigInput, Prisma.DashboardUncheckedUpdateWithoutEmbedConfigInput>;
    create: Prisma.XOR<Prisma.DashboardCreateWithoutEmbedConfigInput, Prisma.DashboardUncheckedCreateWithoutEmbedConfigInput>;
    where?: Prisma.DashboardWhereInput;
};
export type DashboardUpdateToOneWithWhereWithoutEmbedConfigInput = {
    where?: Prisma.DashboardWhereInput;
    data: Prisma.XOR<Prisma.DashboardUpdateWithoutEmbedConfigInput, Prisma.DashboardUncheckedUpdateWithoutEmbedConfigInput>;
};
export type DashboardUpdateWithoutEmbedConfigInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    layout?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutDashboardsNestedInput;
    widgets?: Prisma.WidgetUpdateManyWithoutDashboardNestedInput;
};
export type DashboardUncheckedUpdateWithoutEmbedConfigInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    layout?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    widgets?: Prisma.WidgetUncheckedUpdateManyWithoutDashboardNestedInput;
};
export type DashboardCreateManyTenantInput = {
    id?: string;
    name: string;
    layout: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: boolean;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type DashboardUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    layout?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    widgets?: Prisma.WidgetUpdateManyWithoutDashboardNestedInput;
    embedConfig?: Prisma.EmbedConfigUpdateOneWithoutDashboardNestedInput;
};
export type DashboardUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    layout?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    widgets?: Prisma.WidgetUncheckedUpdateManyWithoutDashboardNestedInput;
    embedConfig?: Prisma.EmbedConfigUncheckedUpdateOneWithoutDashboardNestedInput;
};
export type DashboardUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    layout?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    isPublished?: Prisma.BoolFieldUpdateOperationsInput | boolean;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DashboardCountOutputType = {
    widgets: number;
};
export type DashboardCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    widgets?: boolean | DashboardCountOutputTypeCountWidgetsArgs;
};
export type DashboardCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardCountOutputTypeSelect<ExtArgs> | null;
};
export type DashboardCountOutputTypeCountWidgetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WidgetWhereInput;
};
export type DashboardSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    name?: boolean;
    layout?: boolean;
    isPublished?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    widgets?: boolean | Prisma.Dashboard$widgetsArgs<ExtArgs>;
    embedConfig?: boolean | Prisma.Dashboard$embedConfigArgs<ExtArgs>;
    _count?: boolean | Prisma.DashboardCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dashboard"]>;
export type DashboardSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    name?: boolean;
    layout?: boolean;
    isPublished?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dashboard"]>;
export type DashboardSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    name?: boolean;
    layout?: boolean;
    isPublished?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dashboard"]>;
export type DashboardSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    name?: boolean;
    layout?: boolean;
    isPublished?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type DashboardOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "name" | "layout" | "isPublished" | "createdAt" | "updatedAt", ExtArgs["result"]["dashboard"]>;
export type DashboardInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    widgets?: boolean | Prisma.Dashboard$widgetsArgs<ExtArgs>;
    embedConfig?: boolean | Prisma.Dashboard$embedConfigArgs<ExtArgs>;
    _count?: boolean | Prisma.DashboardCountOutputTypeDefaultArgs<ExtArgs>;
};
export type DashboardIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
};
export type DashboardIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
};
export type $DashboardPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Dashboard";
    objects: {
        tenant: Prisma.$TenantPayload<ExtArgs>;
        widgets: Prisma.$WidgetPayload<ExtArgs>[];
        embedConfig: Prisma.$EmbedConfigPayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        name: string;
        layout: runtime.JsonValue;
        isPublished: boolean;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["dashboard"]>;
    composites: {};
};
export type DashboardGetPayload<S extends boolean | null | undefined | DashboardDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DashboardPayload, S>;
export type DashboardCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DashboardFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DashboardCountAggregateInputType | true;
};
export interface DashboardDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Dashboard'];
        meta: {
            name: 'Dashboard';
        };
    };
    findUnique<T extends DashboardFindUniqueArgs>(args: Prisma.SelectSubset<T, DashboardFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DashboardClient<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends DashboardFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DashboardFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DashboardClient<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends DashboardFindFirstArgs>(args?: Prisma.SelectSubset<T, DashboardFindFirstArgs<ExtArgs>>): Prisma.Prisma__DashboardClient<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends DashboardFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DashboardFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DashboardClient<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends DashboardFindManyArgs>(args?: Prisma.SelectSubset<T, DashboardFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends DashboardCreateArgs>(args: Prisma.SelectSubset<T, DashboardCreateArgs<ExtArgs>>): Prisma.Prisma__DashboardClient<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends DashboardCreateManyArgs>(args?: Prisma.SelectSubset<T, DashboardCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends DashboardCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DashboardCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends DashboardDeleteArgs>(args: Prisma.SelectSubset<T, DashboardDeleteArgs<ExtArgs>>): Prisma.Prisma__DashboardClient<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends DashboardUpdateArgs>(args: Prisma.SelectSubset<T, DashboardUpdateArgs<ExtArgs>>): Prisma.Prisma__DashboardClient<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends DashboardDeleteManyArgs>(args?: Prisma.SelectSubset<T, DashboardDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends DashboardUpdateManyArgs>(args: Prisma.SelectSubset<T, DashboardUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends DashboardUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DashboardUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends DashboardUpsertArgs>(args: Prisma.SelectSubset<T, DashboardUpsertArgs<ExtArgs>>): Prisma.Prisma__DashboardClient<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends DashboardCountArgs>(args?: Prisma.Subset<T, DashboardCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DashboardCountAggregateOutputType> : number>;
    aggregate<T extends DashboardAggregateArgs>(args: Prisma.Subset<T, DashboardAggregateArgs>): Prisma.PrismaPromise<GetDashboardAggregateType<T>>;
    groupBy<T extends DashboardGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DashboardGroupByArgs['orderBy'];
    } : {
        orderBy?: DashboardGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DashboardGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDashboardGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: DashboardFieldRefs;
}
export interface Prisma__DashboardClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    tenant<T extends Prisma.TenantDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TenantDefaultArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    widgets<T extends Prisma.Dashboard$widgetsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Dashboard$widgetsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WidgetPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    embedConfig<T extends Prisma.Dashboard$embedConfigArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Dashboard$embedConfigArgs<ExtArgs>>): Prisma.Prisma__EmbedConfigClient<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface DashboardFieldRefs {
    readonly id: Prisma.FieldRef<"Dashboard", 'String'>;
    readonly tenantId: Prisma.FieldRef<"Dashboard", 'String'>;
    readonly name: Prisma.FieldRef<"Dashboard", 'String'>;
    readonly layout: Prisma.FieldRef<"Dashboard", 'Json'>;
    readonly isPublished: Prisma.FieldRef<"Dashboard", 'Boolean'>;
    readonly createdAt: Prisma.FieldRef<"Dashboard", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Dashboard", 'DateTime'>;
}
export type DashboardFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    include?: Prisma.DashboardInclude<ExtArgs> | null;
    where: Prisma.DashboardWhereUniqueInput;
};
export type DashboardFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    include?: Prisma.DashboardInclude<ExtArgs> | null;
    where: Prisma.DashboardWhereUniqueInput;
};
export type DashboardFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    include?: Prisma.DashboardInclude<ExtArgs> | null;
    where?: Prisma.DashboardWhereInput;
    orderBy?: Prisma.DashboardOrderByWithRelationInput | Prisma.DashboardOrderByWithRelationInput[];
    cursor?: Prisma.DashboardWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DashboardScalarFieldEnum | Prisma.DashboardScalarFieldEnum[];
};
export type DashboardFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    include?: Prisma.DashboardInclude<ExtArgs> | null;
    where?: Prisma.DashboardWhereInput;
    orderBy?: Prisma.DashboardOrderByWithRelationInput | Prisma.DashboardOrderByWithRelationInput[];
    cursor?: Prisma.DashboardWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DashboardScalarFieldEnum | Prisma.DashboardScalarFieldEnum[];
};
export type DashboardFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    include?: Prisma.DashboardInclude<ExtArgs> | null;
    where?: Prisma.DashboardWhereInput;
    orderBy?: Prisma.DashboardOrderByWithRelationInput | Prisma.DashboardOrderByWithRelationInput[];
    cursor?: Prisma.DashboardWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DashboardScalarFieldEnum | Prisma.DashboardScalarFieldEnum[];
};
export type DashboardCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    include?: Prisma.DashboardInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DashboardCreateInput, Prisma.DashboardUncheckedCreateInput>;
};
export type DashboardCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.DashboardCreateManyInput | Prisma.DashboardCreateManyInput[];
    skipDuplicates?: boolean;
};
export type DashboardCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    data: Prisma.DashboardCreateManyInput | Prisma.DashboardCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.DashboardIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type DashboardUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    include?: Prisma.DashboardInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DashboardUpdateInput, Prisma.DashboardUncheckedUpdateInput>;
    where: Prisma.DashboardWhereUniqueInput;
};
export type DashboardUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.DashboardUpdateManyMutationInput, Prisma.DashboardUncheckedUpdateManyInput>;
    where?: Prisma.DashboardWhereInput;
    limit?: number;
};
export type DashboardUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DashboardUpdateManyMutationInput, Prisma.DashboardUncheckedUpdateManyInput>;
    where?: Prisma.DashboardWhereInput;
    limit?: number;
    include?: Prisma.DashboardIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type DashboardUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    include?: Prisma.DashboardInclude<ExtArgs> | null;
    where: Prisma.DashboardWhereUniqueInput;
    create: Prisma.XOR<Prisma.DashboardCreateInput, Prisma.DashboardUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.DashboardUpdateInput, Prisma.DashboardUncheckedUpdateInput>;
};
export type DashboardDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    include?: Prisma.DashboardInclude<ExtArgs> | null;
    where: Prisma.DashboardWhereUniqueInput;
};
export type DashboardDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DashboardWhereInput;
    limit?: number;
};
export type Dashboard$widgetsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type Dashboard$embedConfigArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelect<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    include?: Prisma.EmbedConfigInclude<ExtArgs> | null;
    where?: Prisma.EmbedConfigWhereInput;
};
export type DashboardDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    include?: Prisma.DashboardInclude<ExtArgs> | null;
};
export {};

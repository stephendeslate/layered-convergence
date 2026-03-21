import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type DataSourceModel = runtime.Types.Result.DefaultSelection<Prisma.$DataSourcePayload>;
export type AggregateDataSource = {
    _count: DataSourceCountAggregateOutputType | null;
    _min: DataSourceMinAggregateOutputType | null;
    _max: DataSourceMaxAggregateOutputType | null;
};
export type DataSourceMinAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    name: string | null;
    type: $Enums.DataSourceType | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type DataSourceMaxAggregateOutputType = {
    id: string | null;
    tenantId: string | null;
    name: string | null;
    type: $Enums.DataSourceType | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type DataSourceCountAggregateOutputType = {
    id: number;
    tenantId: number;
    name: number;
    type: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type DataSourceMinAggregateInputType = {
    id?: true;
    tenantId?: true;
    name?: true;
    type?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type DataSourceMaxAggregateInputType = {
    id?: true;
    tenantId?: true;
    name?: true;
    type?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type DataSourceCountAggregateInputType = {
    id?: true;
    tenantId?: true;
    name?: true;
    type?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type DataSourceAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataSourceWhereInput;
    orderBy?: Prisma.DataSourceOrderByWithRelationInput | Prisma.DataSourceOrderByWithRelationInput[];
    cursor?: Prisma.DataSourceWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | DataSourceCountAggregateInputType;
    _min?: DataSourceMinAggregateInputType;
    _max?: DataSourceMaxAggregateInputType;
};
export type GetDataSourceAggregateType<T extends DataSourceAggregateArgs> = {
    [P in keyof T & keyof AggregateDataSource]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDataSource[P]> : Prisma.GetScalarType<T[P], AggregateDataSource[P]>;
};
export type DataSourceGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataSourceWhereInput;
    orderBy?: Prisma.DataSourceOrderByWithAggregationInput | Prisma.DataSourceOrderByWithAggregationInput[];
    by: Prisma.DataSourceScalarFieldEnum[] | Prisma.DataSourceScalarFieldEnum;
    having?: Prisma.DataSourceScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DataSourceCountAggregateInputType | true;
    _min?: DataSourceMinAggregateInputType;
    _max?: DataSourceMaxAggregateInputType;
};
export type DataSourceGroupByOutputType = {
    id: string;
    tenantId: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt: Date;
    updatedAt: Date;
    _count: DataSourceCountAggregateOutputType | null;
    _min: DataSourceMinAggregateOutputType | null;
    _max: DataSourceMaxAggregateOutputType | null;
};
type GetDataSourceGroupByPayload<T extends DataSourceGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DataSourceGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DataSourceGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DataSourceGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DataSourceGroupByOutputType[P]>;
}>>;
export type DataSourceWhereInput = {
    AND?: Prisma.DataSourceWhereInput | Prisma.DataSourceWhereInput[];
    OR?: Prisma.DataSourceWhereInput[];
    NOT?: Prisma.DataSourceWhereInput | Prisma.DataSourceWhereInput[];
    id?: Prisma.UuidFilter<"DataSource"> | string;
    tenantId?: Prisma.UuidFilter<"DataSource"> | string;
    name?: Prisma.StringFilter<"DataSource"> | string;
    type?: Prisma.EnumDataSourceTypeFilter<"DataSource"> | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFilter<"DataSource"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"DataSource"> | Date | string;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
    config?: Prisma.XOR<Prisma.DataSourceConfigNullableScalarRelationFilter, Prisma.DataSourceConfigWhereInput> | null;
    syncRuns?: Prisma.SyncRunListRelationFilter;
    dataPoints?: Prisma.DataPointListRelationFilter;
    deadLetterEvents?: Prisma.DeadLetterEventListRelationFilter;
};
export type DataSourceOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    tenant?: Prisma.TenantOrderByWithRelationInput;
    config?: Prisma.DataSourceConfigOrderByWithRelationInput;
    syncRuns?: Prisma.SyncRunOrderByRelationAggregateInput;
    dataPoints?: Prisma.DataPointOrderByRelationAggregateInput;
    deadLetterEvents?: Prisma.DeadLetterEventOrderByRelationAggregateInput;
};
export type DataSourceWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.DataSourceWhereInput | Prisma.DataSourceWhereInput[];
    OR?: Prisma.DataSourceWhereInput[];
    NOT?: Prisma.DataSourceWhereInput | Prisma.DataSourceWhereInput[];
    tenantId?: Prisma.UuidFilter<"DataSource"> | string;
    name?: Prisma.StringFilter<"DataSource"> | string;
    type?: Prisma.EnumDataSourceTypeFilter<"DataSource"> | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFilter<"DataSource"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"DataSource"> | Date | string;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
    config?: Prisma.XOR<Prisma.DataSourceConfigNullableScalarRelationFilter, Prisma.DataSourceConfigWhereInput> | null;
    syncRuns?: Prisma.SyncRunListRelationFilter;
    dataPoints?: Prisma.DataPointListRelationFilter;
    deadLetterEvents?: Prisma.DeadLetterEventListRelationFilter;
}, "id">;
export type DataSourceOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.DataSourceCountOrderByAggregateInput;
    _max?: Prisma.DataSourceMaxOrderByAggregateInput;
    _min?: Prisma.DataSourceMinOrderByAggregateInput;
};
export type DataSourceScalarWhereWithAggregatesInput = {
    AND?: Prisma.DataSourceScalarWhereWithAggregatesInput | Prisma.DataSourceScalarWhereWithAggregatesInput[];
    OR?: Prisma.DataSourceScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DataSourceScalarWhereWithAggregatesInput | Prisma.DataSourceScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"DataSource"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"DataSource"> | string;
    name?: Prisma.StringWithAggregatesFilter<"DataSource"> | string;
    type?: Prisma.EnumDataSourceTypeWithAggregatesFilter<"DataSource"> | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"DataSource"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"DataSource"> | Date | string;
};
export type DataSourceCreateInput = {
    id?: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutDataSourcesInput;
    config?: Prisma.DataSourceConfigCreateNestedOneWithoutDataSourceInput;
    syncRuns?: Prisma.SyncRunCreateNestedManyWithoutDataSourceInput;
    dataPoints?: Prisma.DataPointCreateNestedManyWithoutDataSourceInput;
    deadLetterEvents?: Prisma.DeadLetterEventCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceUncheckedCreateInput = {
    id?: string;
    tenantId: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    config?: Prisma.DataSourceConfigUncheckedCreateNestedOneWithoutDataSourceInput;
    syncRuns?: Prisma.SyncRunUncheckedCreateNestedManyWithoutDataSourceInput;
    dataPoints?: Prisma.DataPointUncheckedCreateNestedManyWithoutDataSourceInput;
    deadLetterEvents?: Prisma.DeadLetterEventUncheckedCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutDataSourcesNestedInput;
    config?: Prisma.DataSourceConfigUpdateOneWithoutDataSourceNestedInput;
    syncRuns?: Prisma.SyncRunUpdateManyWithoutDataSourceNestedInput;
    dataPoints?: Prisma.DataPointUpdateManyWithoutDataSourceNestedInput;
    deadLetterEvents?: Prisma.DeadLetterEventUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    config?: Prisma.DataSourceConfigUncheckedUpdateOneWithoutDataSourceNestedInput;
    syncRuns?: Prisma.SyncRunUncheckedUpdateManyWithoutDataSourceNestedInput;
    dataPoints?: Prisma.DataPointUncheckedUpdateManyWithoutDataSourceNestedInput;
    deadLetterEvents?: Prisma.DeadLetterEventUncheckedUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceCreateManyInput = {
    id?: string;
    tenantId: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type DataSourceUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataSourceUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataSourceListRelationFilter = {
    every?: Prisma.DataSourceWhereInput;
    some?: Prisma.DataSourceWhereInput;
    none?: Prisma.DataSourceWhereInput;
};
export type DataSourceOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type DataSourceCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DataSourceMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DataSourceMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    type?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DataSourceScalarRelationFilter = {
    is?: Prisma.DataSourceWhereInput;
    isNot?: Prisma.DataSourceWhereInput;
};
export type DataSourceCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutTenantInput, Prisma.DataSourceUncheckedCreateWithoutTenantInput> | Prisma.DataSourceCreateWithoutTenantInput[] | Prisma.DataSourceUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutTenantInput | Prisma.DataSourceCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.DataSourceCreateManyTenantInputEnvelope;
    connect?: Prisma.DataSourceWhereUniqueInput | Prisma.DataSourceWhereUniqueInput[];
};
export type DataSourceUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutTenantInput, Prisma.DataSourceUncheckedCreateWithoutTenantInput> | Prisma.DataSourceCreateWithoutTenantInput[] | Prisma.DataSourceUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutTenantInput | Prisma.DataSourceCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.DataSourceCreateManyTenantInputEnvelope;
    connect?: Prisma.DataSourceWhereUniqueInput | Prisma.DataSourceWhereUniqueInput[];
};
export type DataSourceUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutTenantInput, Prisma.DataSourceUncheckedCreateWithoutTenantInput> | Prisma.DataSourceCreateWithoutTenantInput[] | Prisma.DataSourceUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutTenantInput | Prisma.DataSourceCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.DataSourceUpsertWithWhereUniqueWithoutTenantInput | Prisma.DataSourceUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.DataSourceCreateManyTenantInputEnvelope;
    set?: Prisma.DataSourceWhereUniqueInput | Prisma.DataSourceWhereUniqueInput[];
    disconnect?: Prisma.DataSourceWhereUniqueInput | Prisma.DataSourceWhereUniqueInput[];
    delete?: Prisma.DataSourceWhereUniqueInput | Prisma.DataSourceWhereUniqueInput[];
    connect?: Prisma.DataSourceWhereUniqueInput | Prisma.DataSourceWhereUniqueInput[];
    update?: Prisma.DataSourceUpdateWithWhereUniqueWithoutTenantInput | Prisma.DataSourceUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.DataSourceUpdateManyWithWhereWithoutTenantInput | Prisma.DataSourceUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.DataSourceScalarWhereInput | Prisma.DataSourceScalarWhereInput[];
};
export type DataSourceUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutTenantInput, Prisma.DataSourceUncheckedCreateWithoutTenantInput> | Prisma.DataSourceCreateWithoutTenantInput[] | Prisma.DataSourceUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutTenantInput | Prisma.DataSourceCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.DataSourceUpsertWithWhereUniqueWithoutTenantInput | Prisma.DataSourceUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.DataSourceCreateManyTenantInputEnvelope;
    set?: Prisma.DataSourceWhereUniqueInput | Prisma.DataSourceWhereUniqueInput[];
    disconnect?: Prisma.DataSourceWhereUniqueInput | Prisma.DataSourceWhereUniqueInput[];
    delete?: Prisma.DataSourceWhereUniqueInput | Prisma.DataSourceWhereUniqueInput[];
    connect?: Prisma.DataSourceWhereUniqueInput | Prisma.DataSourceWhereUniqueInput[];
    update?: Prisma.DataSourceUpdateWithWhereUniqueWithoutTenantInput | Prisma.DataSourceUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.DataSourceUpdateManyWithWhereWithoutTenantInput | Prisma.DataSourceUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.DataSourceScalarWhereInput | Prisma.DataSourceScalarWhereInput[];
};
export type EnumDataSourceTypeFieldUpdateOperationsInput = {
    set?: $Enums.DataSourceType;
};
export type DataSourceCreateNestedOneWithoutConfigInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutConfigInput, Prisma.DataSourceUncheckedCreateWithoutConfigInput>;
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutConfigInput;
    connect?: Prisma.DataSourceWhereUniqueInput;
};
export type DataSourceUpdateOneRequiredWithoutConfigNestedInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutConfigInput, Prisma.DataSourceUncheckedCreateWithoutConfigInput>;
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutConfigInput;
    upsert?: Prisma.DataSourceUpsertWithoutConfigInput;
    connect?: Prisma.DataSourceWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DataSourceUpdateToOneWithWhereWithoutConfigInput, Prisma.DataSourceUpdateWithoutConfigInput>, Prisma.DataSourceUncheckedUpdateWithoutConfigInput>;
};
export type DataSourceCreateNestedOneWithoutSyncRunsInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutSyncRunsInput, Prisma.DataSourceUncheckedCreateWithoutSyncRunsInput>;
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutSyncRunsInput;
    connect?: Prisma.DataSourceWhereUniqueInput;
};
export type DataSourceUpdateOneRequiredWithoutSyncRunsNestedInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutSyncRunsInput, Prisma.DataSourceUncheckedCreateWithoutSyncRunsInput>;
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutSyncRunsInput;
    upsert?: Prisma.DataSourceUpsertWithoutSyncRunsInput;
    connect?: Prisma.DataSourceWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DataSourceUpdateToOneWithWhereWithoutSyncRunsInput, Prisma.DataSourceUpdateWithoutSyncRunsInput>, Prisma.DataSourceUncheckedUpdateWithoutSyncRunsInput>;
};
export type DataSourceCreateNestedOneWithoutDataPointsInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutDataPointsInput, Prisma.DataSourceUncheckedCreateWithoutDataPointsInput>;
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutDataPointsInput;
    connect?: Prisma.DataSourceWhereUniqueInput;
};
export type DataSourceUpdateOneRequiredWithoutDataPointsNestedInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutDataPointsInput, Prisma.DataSourceUncheckedCreateWithoutDataPointsInput>;
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutDataPointsInput;
    upsert?: Prisma.DataSourceUpsertWithoutDataPointsInput;
    connect?: Prisma.DataSourceWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DataSourceUpdateToOneWithWhereWithoutDataPointsInput, Prisma.DataSourceUpdateWithoutDataPointsInput>, Prisma.DataSourceUncheckedUpdateWithoutDataPointsInput>;
};
export type DataSourceCreateNestedOneWithoutDeadLetterEventsInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutDeadLetterEventsInput, Prisma.DataSourceUncheckedCreateWithoutDeadLetterEventsInput>;
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutDeadLetterEventsInput;
    connect?: Prisma.DataSourceWhereUniqueInput;
};
export type DataSourceUpdateOneRequiredWithoutDeadLetterEventsNestedInput = {
    create?: Prisma.XOR<Prisma.DataSourceCreateWithoutDeadLetterEventsInput, Prisma.DataSourceUncheckedCreateWithoutDeadLetterEventsInput>;
    connectOrCreate?: Prisma.DataSourceCreateOrConnectWithoutDeadLetterEventsInput;
    upsert?: Prisma.DataSourceUpsertWithoutDeadLetterEventsInput;
    connect?: Prisma.DataSourceWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DataSourceUpdateToOneWithWhereWithoutDeadLetterEventsInput, Prisma.DataSourceUpdateWithoutDeadLetterEventsInput>, Prisma.DataSourceUncheckedUpdateWithoutDeadLetterEventsInput>;
};
export type DataSourceCreateWithoutTenantInput = {
    id?: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    config?: Prisma.DataSourceConfigCreateNestedOneWithoutDataSourceInput;
    syncRuns?: Prisma.SyncRunCreateNestedManyWithoutDataSourceInput;
    dataPoints?: Prisma.DataPointCreateNestedManyWithoutDataSourceInput;
    deadLetterEvents?: Prisma.DeadLetterEventCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceUncheckedCreateWithoutTenantInput = {
    id?: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    config?: Prisma.DataSourceConfigUncheckedCreateNestedOneWithoutDataSourceInput;
    syncRuns?: Prisma.SyncRunUncheckedCreateNestedManyWithoutDataSourceInput;
    dataPoints?: Prisma.DataPointUncheckedCreateNestedManyWithoutDataSourceInput;
    deadLetterEvents?: Prisma.DeadLetterEventUncheckedCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceCreateOrConnectWithoutTenantInput = {
    where: Prisma.DataSourceWhereUniqueInput;
    create: Prisma.XOR<Prisma.DataSourceCreateWithoutTenantInput, Prisma.DataSourceUncheckedCreateWithoutTenantInput>;
};
export type DataSourceCreateManyTenantInputEnvelope = {
    data: Prisma.DataSourceCreateManyTenantInput | Prisma.DataSourceCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type DataSourceUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.DataSourceWhereUniqueInput;
    update: Prisma.XOR<Prisma.DataSourceUpdateWithoutTenantInput, Prisma.DataSourceUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.DataSourceCreateWithoutTenantInput, Prisma.DataSourceUncheckedCreateWithoutTenantInput>;
};
export type DataSourceUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.DataSourceWhereUniqueInput;
    data: Prisma.XOR<Prisma.DataSourceUpdateWithoutTenantInput, Prisma.DataSourceUncheckedUpdateWithoutTenantInput>;
};
export type DataSourceUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.DataSourceScalarWhereInput;
    data: Prisma.XOR<Prisma.DataSourceUpdateManyMutationInput, Prisma.DataSourceUncheckedUpdateManyWithoutTenantInput>;
};
export type DataSourceScalarWhereInput = {
    AND?: Prisma.DataSourceScalarWhereInput | Prisma.DataSourceScalarWhereInput[];
    OR?: Prisma.DataSourceScalarWhereInput[];
    NOT?: Prisma.DataSourceScalarWhereInput | Prisma.DataSourceScalarWhereInput[];
    id?: Prisma.UuidFilter<"DataSource"> | string;
    tenantId?: Prisma.UuidFilter<"DataSource"> | string;
    name?: Prisma.StringFilter<"DataSource"> | string;
    type?: Prisma.EnumDataSourceTypeFilter<"DataSource"> | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFilter<"DataSource"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"DataSource"> | Date | string;
};
export type DataSourceCreateWithoutConfigInput = {
    id?: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutDataSourcesInput;
    syncRuns?: Prisma.SyncRunCreateNestedManyWithoutDataSourceInput;
    dataPoints?: Prisma.DataPointCreateNestedManyWithoutDataSourceInput;
    deadLetterEvents?: Prisma.DeadLetterEventCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceUncheckedCreateWithoutConfigInput = {
    id?: string;
    tenantId: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    syncRuns?: Prisma.SyncRunUncheckedCreateNestedManyWithoutDataSourceInput;
    dataPoints?: Prisma.DataPointUncheckedCreateNestedManyWithoutDataSourceInput;
    deadLetterEvents?: Prisma.DeadLetterEventUncheckedCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceCreateOrConnectWithoutConfigInput = {
    where: Prisma.DataSourceWhereUniqueInput;
    create: Prisma.XOR<Prisma.DataSourceCreateWithoutConfigInput, Prisma.DataSourceUncheckedCreateWithoutConfigInput>;
};
export type DataSourceUpsertWithoutConfigInput = {
    update: Prisma.XOR<Prisma.DataSourceUpdateWithoutConfigInput, Prisma.DataSourceUncheckedUpdateWithoutConfigInput>;
    create: Prisma.XOR<Prisma.DataSourceCreateWithoutConfigInput, Prisma.DataSourceUncheckedCreateWithoutConfigInput>;
    where?: Prisma.DataSourceWhereInput;
};
export type DataSourceUpdateToOneWithWhereWithoutConfigInput = {
    where?: Prisma.DataSourceWhereInput;
    data: Prisma.XOR<Prisma.DataSourceUpdateWithoutConfigInput, Prisma.DataSourceUncheckedUpdateWithoutConfigInput>;
};
export type DataSourceUpdateWithoutConfigInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutDataSourcesNestedInput;
    syncRuns?: Prisma.SyncRunUpdateManyWithoutDataSourceNestedInput;
    dataPoints?: Prisma.DataPointUpdateManyWithoutDataSourceNestedInput;
    deadLetterEvents?: Prisma.DeadLetterEventUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceUncheckedUpdateWithoutConfigInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    syncRuns?: Prisma.SyncRunUncheckedUpdateManyWithoutDataSourceNestedInput;
    dataPoints?: Prisma.DataPointUncheckedUpdateManyWithoutDataSourceNestedInput;
    deadLetterEvents?: Prisma.DeadLetterEventUncheckedUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceCreateWithoutSyncRunsInput = {
    id?: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutDataSourcesInput;
    config?: Prisma.DataSourceConfigCreateNestedOneWithoutDataSourceInput;
    dataPoints?: Prisma.DataPointCreateNestedManyWithoutDataSourceInput;
    deadLetterEvents?: Prisma.DeadLetterEventCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceUncheckedCreateWithoutSyncRunsInput = {
    id?: string;
    tenantId: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    config?: Prisma.DataSourceConfigUncheckedCreateNestedOneWithoutDataSourceInput;
    dataPoints?: Prisma.DataPointUncheckedCreateNestedManyWithoutDataSourceInput;
    deadLetterEvents?: Prisma.DeadLetterEventUncheckedCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceCreateOrConnectWithoutSyncRunsInput = {
    where: Prisma.DataSourceWhereUniqueInput;
    create: Prisma.XOR<Prisma.DataSourceCreateWithoutSyncRunsInput, Prisma.DataSourceUncheckedCreateWithoutSyncRunsInput>;
};
export type DataSourceUpsertWithoutSyncRunsInput = {
    update: Prisma.XOR<Prisma.DataSourceUpdateWithoutSyncRunsInput, Prisma.DataSourceUncheckedUpdateWithoutSyncRunsInput>;
    create: Prisma.XOR<Prisma.DataSourceCreateWithoutSyncRunsInput, Prisma.DataSourceUncheckedCreateWithoutSyncRunsInput>;
    where?: Prisma.DataSourceWhereInput;
};
export type DataSourceUpdateToOneWithWhereWithoutSyncRunsInput = {
    where?: Prisma.DataSourceWhereInput;
    data: Prisma.XOR<Prisma.DataSourceUpdateWithoutSyncRunsInput, Prisma.DataSourceUncheckedUpdateWithoutSyncRunsInput>;
};
export type DataSourceUpdateWithoutSyncRunsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutDataSourcesNestedInput;
    config?: Prisma.DataSourceConfigUpdateOneWithoutDataSourceNestedInput;
    dataPoints?: Prisma.DataPointUpdateManyWithoutDataSourceNestedInput;
    deadLetterEvents?: Prisma.DeadLetterEventUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceUncheckedUpdateWithoutSyncRunsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    config?: Prisma.DataSourceConfigUncheckedUpdateOneWithoutDataSourceNestedInput;
    dataPoints?: Prisma.DataPointUncheckedUpdateManyWithoutDataSourceNestedInput;
    deadLetterEvents?: Prisma.DeadLetterEventUncheckedUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceCreateWithoutDataPointsInput = {
    id?: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutDataSourcesInput;
    config?: Prisma.DataSourceConfigCreateNestedOneWithoutDataSourceInput;
    syncRuns?: Prisma.SyncRunCreateNestedManyWithoutDataSourceInput;
    deadLetterEvents?: Prisma.DeadLetterEventCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceUncheckedCreateWithoutDataPointsInput = {
    id?: string;
    tenantId: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    config?: Prisma.DataSourceConfigUncheckedCreateNestedOneWithoutDataSourceInput;
    syncRuns?: Prisma.SyncRunUncheckedCreateNestedManyWithoutDataSourceInput;
    deadLetterEvents?: Prisma.DeadLetterEventUncheckedCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceCreateOrConnectWithoutDataPointsInput = {
    where: Prisma.DataSourceWhereUniqueInput;
    create: Prisma.XOR<Prisma.DataSourceCreateWithoutDataPointsInput, Prisma.DataSourceUncheckedCreateWithoutDataPointsInput>;
};
export type DataSourceUpsertWithoutDataPointsInput = {
    update: Prisma.XOR<Prisma.DataSourceUpdateWithoutDataPointsInput, Prisma.DataSourceUncheckedUpdateWithoutDataPointsInput>;
    create: Prisma.XOR<Prisma.DataSourceCreateWithoutDataPointsInput, Prisma.DataSourceUncheckedCreateWithoutDataPointsInput>;
    where?: Prisma.DataSourceWhereInput;
};
export type DataSourceUpdateToOneWithWhereWithoutDataPointsInput = {
    where?: Prisma.DataSourceWhereInput;
    data: Prisma.XOR<Prisma.DataSourceUpdateWithoutDataPointsInput, Prisma.DataSourceUncheckedUpdateWithoutDataPointsInput>;
};
export type DataSourceUpdateWithoutDataPointsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutDataSourcesNestedInput;
    config?: Prisma.DataSourceConfigUpdateOneWithoutDataSourceNestedInput;
    syncRuns?: Prisma.SyncRunUpdateManyWithoutDataSourceNestedInput;
    deadLetterEvents?: Prisma.DeadLetterEventUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceUncheckedUpdateWithoutDataPointsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    config?: Prisma.DataSourceConfigUncheckedUpdateOneWithoutDataSourceNestedInput;
    syncRuns?: Prisma.SyncRunUncheckedUpdateManyWithoutDataSourceNestedInput;
    deadLetterEvents?: Prisma.DeadLetterEventUncheckedUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceCreateWithoutDeadLetterEventsInput = {
    id?: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutDataSourcesInput;
    config?: Prisma.DataSourceConfigCreateNestedOneWithoutDataSourceInput;
    syncRuns?: Prisma.SyncRunCreateNestedManyWithoutDataSourceInput;
    dataPoints?: Prisma.DataPointCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceUncheckedCreateWithoutDeadLetterEventsInput = {
    id?: string;
    tenantId: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    config?: Prisma.DataSourceConfigUncheckedCreateNestedOneWithoutDataSourceInput;
    syncRuns?: Prisma.SyncRunUncheckedCreateNestedManyWithoutDataSourceInput;
    dataPoints?: Prisma.DataPointUncheckedCreateNestedManyWithoutDataSourceInput;
};
export type DataSourceCreateOrConnectWithoutDeadLetterEventsInput = {
    where: Prisma.DataSourceWhereUniqueInput;
    create: Prisma.XOR<Prisma.DataSourceCreateWithoutDeadLetterEventsInput, Prisma.DataSourceUncheckedCreateWithoutDeadLetterEventsInput>;
};
export type DataSourceUpsertWithoutDeadLetterEventsInput = {
    update: Prisma.XOR<Prisma.DataSourceUpdateWithoutDeadLetterEventsInput, Prisma.DataSourceUncheckedUpdateWithoutDeadLetterEventsInput>;
    create: Prisma.XOR<Prisma.DataSourceCreateWithoutDeadLetterEventsInput, Prisma.DataSourceUncheckedCreateWithoutDeadLetterEventsInput>;
    where?: Prisma.DataSourceWhereInput;
};
export type DataSourceUpdateToOneWithWhereWithoutDeadLetterEventsInput = {
    where?: Prisma.DataSourceWhereInput;
    data: Prisma.XOR<Prisma.DataSourceUpdateWithoutDeadLetterEventsInput, Prisma.DataSourceUncheckedUpdateWithoutDeadLetterEventsInput>;
};
export type DataSourceUpdateWithoutDeadLetterEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutDataSourcesNestedInput;
    config?: Prisma.DataSourceConfigUpdateOneWithoutDataSourceNestedInput;
    syncRuns?: Prisma.SyncRunUpdateManyWithoutDataSourceNestedInput;
    dataPoints?: Prisma.DataPointUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceUncheckedUpdateWithoutDeadLetterEventsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    config?: Prisma.DataSourceConfigUncheckedUpdateOneWithoutDataSourceNestedInput;
    syncRuns?: Prisma.SyncRunUncheckedUpdateManyWithoutDataSourceNestedInput;
    dataPoints?: Prisma.DataPointUncheckedUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceCreateManyTenantInput = {
    id?: string;
    name: string;
    type: $Enums.DataSourceType;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type DataSourceUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    config?: Prisma.DataSourceConfigUpdateOneWithoutDataSourceNestedInput;
    syncRuns?: Prisma.SyncRunUpdateManyWithoutDataSourceNestedInput;
    dataPoints?: Prisma.DataPointUpdateManyWithoutDataSourceNestedInput;
    deadLetterEvents?: Prisma.DeadLetterEventUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    config?: Prisma.DataSourceConfigUncheckedUpdateOneWithoutDataSourceNestedInput;
    syncRuns?: Prisma.SyncRunUncheckedUpdateManyWithoutDataSourceNestedInput;
    dataPoints?: Prisma.DataPointUncheckedUpdateManyWithoutDataSourceNestedInput;
    deadLetterEvents?: Prisma.DeadLetterEventUncheckedUpdateManyWithoutDataSourceNestedInput;
};
export type DataSourceUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    type?: Prisma.EnumDataSourceTypeFieldUpdateOperationsInput | $Enums.DataSourceType;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataSourceCountOutputType = {
    syncRuns: number;
    dataPoints: number;
    deadLetterEvents: number;
};
export type DataSourceCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    syncRuns?: boolean | DataSourceCountOutputTypeCountSyncRunsArgs;
    dataPoints?: boolean | DataSourceCountOutputTypeCountDataPointsArgs;
    deadLetterEvents?: boolean | DataSourceCountOutputTypeCountDeadLetterEventsArgs;
};
export type DataSourceCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceCountOutputTypeSelect<ExtArgs> | null;
};
export type DataSourceCountOutputTypeCountSyncRunsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SyncRunWhereInput;
};
export type DataSourceCountOutputTypeCountDataPointsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataPointWhereInput;
};
export type DataSourceCountOutputTypeCountDeadLetterEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DeadLetterEventWhereInput;
};
export type DataSourceSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    name?: boolean;
    type?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    config?: boolean | Prisma.DataSource$configArgs<ExtArgs>;
    syncRuns?: boolean | Prisma.DataSource$syncRunsArgs<ExtArgs>;
    dataPoints?: boolean | Prisma.DataSource$dataPointsArgs<ExtArgs>;
    deadLetterEvents?: boolean | Prisma.DataSource$deadLetterEventsArgs<ExtArgs>;
    _count?: boolean | Prisma.DataSourceCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dataSource"]>;
export type DataSourceSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    name?: boolean;
    type?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dataSource"]>;
export type DataSourceSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    tenantId?: boolean;
    name?: boolean;
    type?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dataSource"]>;
export type DataSourceSelectScalar = {
    id?: boolean;
    tenantId?: boolean;
    name?: boolean;
    type?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type DataSourceOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "tenantId" | "name" | "type" | "createdAt" | "updatedAt", ExtArgs["result"]["dataSource"]>;
export type DataSourceInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
    config?: boolean | Prisma.DataSource$configArgs<ExtArgs>;
    syncRuns?: boolean | Prisma.DataSource$syncRunsArgs<ExtArgs>;
    dataPoints?: boolean | Prisma.DataSource$dataPointsArgs<ExtArgs>;
    deadLetterEvents?: boolean | Prisma.DataSource$deadLetterEventsArgs<ExtArgs>;
    _count?: boolean | Prisma.DataSourceCountOutputTypeDefaultArgs<ExtArgs>;
};
export type DataSourceIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
};
export type DataSourceIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
};
export type $DataSourcePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "DataSource";
    objects: {
        tenant: Prisma.$TenantPayload<ExtArgs>;
        config: Prisma.$DataSourceConfigPayload<ExtArgs> | null;
        syncRuns: Prisma.$SyncRunPayload<ExtArgs>[];
        dataPoints: Prisma.$DataPointPayload<ExtArgs>[];
        deadLetterEvents: Prisma.$DeadLetterEventPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        tenantId: string;
        name: string;
        type: $Enums.DataSourceType;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["dataSource"]>;
    composites: {};
};
export type DataSourceGetPayload<S extends boolean | null | undefined | DataSourceDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DataSourcePayload, S>;
export type DataSourceCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DataSourceFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DataSourceCountAggregateInputType | true;
};
export interface DataSourceDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['DataSource'];
        meta: {
            name: 'DataSource';
        };
    };
    findUnique<T extends DataSourceFindUniqueArgs>(args: Prisma.SelectSubset<T, DataSourceFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends DataSourceFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DataSourceFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends DataSourceFindFirstArgs>(args?: Prisma.SelectSubset<T, DataSourceFindFirstArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends DataSourceFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DataSourceFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends DataSourceFindManyArgs>(args?: Prisma.SelectSubset<T, DataSourceFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends DataSourceCreateArgs>(args: Prisma.SelectSubset<T, DataSourceCreateArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends DataSourceCreateManyArgs>(args?: Prisma.SelectSubset<T, DataSourceCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends DataSourceCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DataSourceCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends DataSourceDeleteArgs>(args: Prisma.SelectSubset<T, DataSourceDeleteArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends DataSourceUpdateArgs>(args: Prisma.SelectSubset<T, DataSourceUpdateArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends DataSourceDeleteManyArgs>(args?: Prisma.SelectSubset<T, DataSourceDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends DataSourceUpdateManyArgs>(args: Prisma.SelectSubset<T, DataSourceUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends DataSourceUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DataSourceUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends DataSourceUpsertArgs>(args: Prisma.SelectSubset<T, DataSourceUpsertArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends DataSourceCountArgs>(args?: Prisma.Subset<T, DataSourceCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DataSourceCountAggregateOutputType> : number>;
    aggregate<T extends DataSourceAggregateArgs>(args: Prisma.Subset<T, DataSourceAggregateArgs>): Prisma.PrismaPromise<GetDataSourceAggregateType<T>>;
    groupBy<T extends DataSourceGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DataSourceGroupByArgs['orderBy'];
    } : {
        orderBy?: DataSourceGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DataSourceGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDataSourceGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: DataSourceFieldRefs;
}
export interface Prisma__DataSourceClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    tenant<T extends Prisma.TenantDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TenantDefaultArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    config<T extends Prisma.DataSource$configArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DataSource$configArgs<ExtArgs>>): Prisma.Prisma__DataSourceConfigClient<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    syncRuns<T extends Prisma.DataSource$syncRunsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DataSource$syncRunsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    dataPoints<T extends Prisma.DataSource$dataPointsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DataSource$dataPointsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    deadLetterEvents<T extends Prisma.DataSource$deadLetterEventsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DataSource$deadLetterEventsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface DataSourceFieldRefs {
    readonly id: Prisma.FieldRef<"DataSource", 'String'>;
    readonly tenantId: Prisma.FieldRef<"DataSource", 'String'>;
    readonly name: Prisma.FieldRef<"DataSource", 'String'>;
    readonly type: Prisma.FieldRef<"DataSource", 'DataSourceType'>;
    readonly createdAt: Prisma.FieldRef<"DataSource", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"DataSource", 'DateTime'>;
}
export type DataSourceFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
    where: Prisma.DataSourceWhereUniqueInput;
};
export type DataSourceFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
    where: Prisma.DataSourceWhereUniqueInput;
};
export type DataSourceFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
    where?: Prisma.DataSourceWhereInput;
    orderBy?: Prisma.DataSourceOrderByWithRelationInput | Prisma.DataSourceOrderByWithRelationInput[];
    cursor?: Prisma.DataSourceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DataSourceScalarFieldEnum | Prisma.DataSourceScalarFieldEnum[];
};
export type DataSourceFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
    where?: Prisma.DataSourceWhereInput;
    orderBy?: Prisma.DataSourceOrderByWithRelationInput | Prisma.DataSourceOrderByWithRelationInput[];
    cursor?: Prisma.DataSourceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DataSourceScalarFieldEnum | Prisma.DataSourceScalarFieldEnum[];
};
export type DataSourceFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
    where?: Prisma.DataSourceWhereInput;
    orderBy?: Prisma.DataSourceOrderByWithRelationInput | Prisma.DataSourceOrderByWithRelationInput[];
    cursor?: Prisma.DataSourceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DataSourceScalarFieldEnum | Prisma.DataSourceScalarFieldEnum[];
};
export type DataSourceCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DataSourceCreateInput, Prisma.DataSourceUncheckedCreateInput>;
};
export type DataSourceCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.DataSourceCreateManyInput | Prisma.DataSourceCreateManyInput[];
    skipDuplicates?: boolean;
};
export type DataSourceCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    data: Prisma.DataSourceCreateManyInput | Prisma.DataSourceCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.DataSourceIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type DataSourceUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DataSourceUpdateInput, Prisma.DataSourceUncheckedUpdateInput>;
    where: Prisma.DataSourceWhereUniqueInput;
};
export type DataSourceUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.DataSourceUpdateManyMutationInput, Prisma.DataSourceUncheckedUpdateManyInput>;
    where?: Prisma.DataSourceWhereInput;
    limit?: number;
};
export type DataSourceUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DataSourceUpdateManyMutationInput, Prisma.DataSourceUncheckedUpdateManyInput>;
    where?: Prisma.DataSourceWhereInput;
    limit?: number;
    include?: Prisma.DataSourceIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type DataSourceUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
    where: Prisma.DataSourceWhereUniqueInput;
    create: Prisma.XOR<Prisma.DataSourceCreateInput, Prisma.DataSourceUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.DataSourceUpdateInput, Prisma.DataSourceUncheckedUpdateInput>;
};
export type DataSourceDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
    where: Prisma.DataSourceWhereUniqueInput;
};
export type DataSourceDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataSourceWhereInput;
    limit?: number;
};
export type DataSource$configArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    include?: Prisma.DataSourceConfigInclude<ExtArgs> | null;
    where?: Prisma.DataSourceConfigWhereInput;
};
export type DataSource$syncRunsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SyncRunSelect<ExtArgs> | null;
    omit?: Prisma.SyncRunOmit<ExtArgs> | null;
    include?: Prisma.SyncRunInclude<ExtArgs> | null;
    where?: Prisma.SyncRunWhereInput;
    orderBy?: Prisma.SyncRunOrderByWithRelationInput | Prisma.SyncRunOrderByWithRelationInput[];
    cursor?: Prisma.SyncRunWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.SyncRunScalarFieldEnum | Prisma.SyncRunScalarFieldEnum[];
};
export type DataSource$dataPointsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataPointSelect<ExtArgs> | null;
    omit?: Prisma.DataPointOmit<ExtArgs> | null;
    include?: Prisma.DataPointInclude<ExtArgs> | null;
    where?: Prisma.DataPointWhereInput;
    orderBy?: Prisma.DataPointOrderByWithRelationInput | Prisma.DataPointOrderByWithRelationInput[];
    cursor?: Prisma.DataPointWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DataPointScalarFieldEnum | Prisma.DataPointScalarFieldEnum[];
};
export type DataSource$deadLetterEventsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeadLetterEventSelect<ExtArgs> | null;
    omit?: Prisma.DeadLetterEventOmit<ExtArgs> | null;
    include?: Prisma.DeadLetterEventInclude<ExtArgs> | null;
    where?: Prisma.DeadLetterEventWhereInput;
    orderBy?: Prisma.DeadLetterEventOrderByWithRelationInput | Prisma.DeadLetterEventOrderByWithRelationInput[];
    cursor?: Prisma.DeadLetterEventWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DeadLetterEventScalarFieldEnum | Prisma.DeadLetterEventScalarFieldEnum[];
};
export type DataSourceDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
};
export {};

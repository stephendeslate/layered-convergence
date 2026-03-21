import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type DataPointModel = runtime.Types.Result.DefaultSelection<Prisma.$DataPointPayload>;
export type AggregateDataPoint = {
    _count: DataPointCountAggregateOutputType | null;
    _min: DataPointMinAggregateOutputType | null;
    _max: DataPointMaxAggregateOutputType | null;
};
export type DataPointMinAggregateOutputType = {
    id: string | null;
    dataSourceId: string | null;
    tenantId: string | null;
    timestamp: Date | null;
    createdAt: Date | null;
};
export type DataPointMaxAggregateOutputType = {
    id: string | null;
    dataSourceId: string | null;
    tenantId: string | null;
    timestamp: Date | null;
    createdAt: Date | null;
};
export type DataPointCountAggregateOutputType = {
    id: number;
    dataSourceId: number;
    tenantId: number;
    timestamp: number;
    dimensions: number;
    metrics: number;
    createdAt: number;
    _all: number;
};
export type DataPointMinAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    tenantId?: true;
    timestamp?: true;
    createdAt?: true;
};
export type DataPointMaxAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    tenantId?: true;
    timestamp?: true;
    createdAt?: true;
};
export type DataPointCountAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    tenantId?: true;
    timestamp?: true;
    dimensions?: true;
    metrics?: true;
    createdAt?: true;
    _all?: true;
};
export type DataPointAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataPointWhereInput;
    orderBy?: Prisma.DataPointOrderByWithRelationInput | Prisma.DataPointOrderByWithRelationInput[];
    cursor?: Prisma.DataPointWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | DataPointCountAggregateInputType;
    _min?: DataPointMinAggregateInputType;
    _max?: DataPointMaxAggregateInputType;
};
export type GetDataPointAggregateType<T extends DataPointAggregateArgs> = {
    [P in keyof T & keyof AggregateDataPoint]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDataPoint[P]> : Prisma.GetScalarType<T[P], AggregateDataPoint[P]>;
};
export type DataPointGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataPointWhereInput;
    orderBy?: Prisma.DataPointOrderByWithAggregationInput | Prisma.DataPointOrderByWithAggregationInput[];
    by: Prisma.DataPointScalarFieldEnum[] | Prisma.DataPointScalarFieldEnum;
    having?: Prisma.DataPointScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DataPointCountAggregateInputType | true;
    _min?: DataPointMinAggregateInputType;
    _max?: DataPointMaxAggregateInputType;
};
export type DataPointGroupByOutputType = {
    id: string;
    dataSourceId: string;
    tenantId: string;
    timestamp: Date;
    dimensions: runtime.JsonValue;
    metrics: runtime.JsonValue;
    createdAt: Date;
    _count: DataPointCountAggregateOutputType | null;
    _min: DataPointMinAggregateOutputType | null;
    _max: DataPointMaxAggregateOutputType | null;
};
type GetDataPointGroupByPayload<T extends DataPointGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DataPointGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DataPointGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DataPointGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DataPointGroupByOutputType[P]>;
}>>;
export type DataPointWhereInput = {
    AND?: Prisma.DataPointWhereInput | Prisma.DataPointWhereInput[];
    OR?: Prisma.DataPointWhereInput[];
    NOT?: Prisma.DataPointWhereInput | Prisma.DataPointWhereInput[];
    id?: Prisma.UuidFilter<"DataPoint"> | string;
    dataSourceId?: Prisma.UuidFilter<"DataPoint"> | string;
    tenantId?: Prisma.UuidFilter<"DataPoint"> | string;
    timestamp?: Prisma.DateTimeFilter<"DataPoint"> | Date | string;
    dimensions?: Prisma.JsonFilter<"DataPoint">;
    metrics?: Prisma.JsonFilter<"DataPoint">;
    createdAt?: Prisma.DateTimeFilter<"DataPoint"> | Date | string;
    dataSource?: Prisma.XOR<Prisma.DataSourceScalarRelationFilter, Prisma.DataSourceWhereInput>;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
};
export type DataPointOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    timestamp?: Prisma.SortOrder;
    dimensions?: Prisma.SortOrder;
    metrics?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    dataSource?: Prisma.DataSourceOrderByWithRelationInput;
    tenant?: Prisma.TenantOrderByWithRelationInput;
};
export type DataPointWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.DataPointWhereInput | Prisma.DataPointWhereInput[];
    OR?: Prisma.DataPointWhereInput[];
    NOT?: Prisma.DataPointWhereInput | Prisma.DataPointWhereInput[];
    dataSourceId?: Prisma.UuidFilter<"DataPoint"> | string;
    tenantId?: Prisma.UuidFilter<"DataPoint"> | string;
    timestamp?: Prisma.DateTimeFilter<"DataPoint"> | Date | string;
    dimensions?: Prisma.JsonFilter<"DataPoint">;
    metrics?: Prisma.JsonFilter<"DataPoint">;
    createdAt?: Prisma.DateTimeFilter<"DataPoint"> | Date | string;
    dataSource?: Prisma.XOR<Prisma.DataSourceScalarRelationFilter, Prisma.DataSourceWhereInput>;
    tenant?: Prisma.XOR<Prisma.TenantScalarRelationFilter, Prisma.TenantWhereInput>;
}, "id">;
export type DataPointOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    timestamp?: Prisma.SortOrder;
    dimensions?: Prisma.SortOrder;
    metrics?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.DataPointCountOrderByAggregateInput;
    _max?: Prisma.DataPointMaxOrderByAggregateInput;
    _min?: Prisma.DataPointMinOrderByAggregateInput;
};
export type DataPointScalarWhereWithAggregatesInput = {
    AND?: Prisma.DataPointScalarWhereWithAggregatesInput | Prisma.DataPointScalarWhereWithAggregatesInput[];
    OR?: Prisma.DataPointScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DataPointScalarWhereWithAggregatesInput | Prisma.DataPointScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"DataPoint"> | string;
    dataSourceId?: Prisma.UuidWithAggregatesFilter<"DataPoint"> | string;
    tenantId?: Prisma.UuidWithAggregatesFilter<"DataPoint"> | string;
    timestamp?: Prisma.DateTimeWithAggregatesFilter<"DataPoint"> | Date | string;
    dimensions?: Prisma.JsonWithAggregatesFilter<"DataPoint">;
    metrics?: Prisma.JsonWithAggregatesFilter<"DataPoint">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"DataPoint"> | Date | string;
};
export type DataPointCreateInput = {
    id?: string;
    timestamp: Date | string;
    dimensions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    dataSource: Prisma.DataSourceCreateNestedOneWithoutDataPointsInput;
    tenant: Prisma.TenantCreateNestedOneWithoutDataPointsInput;
};
export type DataPointUncheckedCreateInput = {
    id?: string;
    dataSourceId: string;
    tenantId: string;
    timestamp: Date | string;
    dimensions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type DataPointUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dimensions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dataSource?: Prisma.DataSourceUpdateOneRequiredWithoutDataPointsNestedInput;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutDataPointsNestedInput;
};
export type DataPointUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dimensions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataPointCreateManyInput = {
    id?: string;
    dataSourceId: string;
    tenantId: string;
    timestamp: Date | string;
    dimensions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type DataPointUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dimensions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataPointUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dimensions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataPointListRelationFilter = {
    every?: Prisma.DataPointWhereInput;
    some?: Prisma.DataPointWhereInput;
    none?: Prisma.DataPointWhereInput;
};
export type DataPointOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type DataPointCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    timestamp?: Prisma.SortOrder;
    dimensions?: Prisma.SortOrder;
    metrics?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DataPointMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    timestamp?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DataPointMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    tenantId?: Prisma.SortOrder;
    timestamp?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type DataPointCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.DataPointCreateWithoutTenantInput, Prisma.DataPointUncheckedCreateWithoutTenantInput> | Prisma.DataPointCreateWithoutTenantInput[] | Prisma.DataPointUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DataPointCreateOrConnectWithoutTenantInput | Prisma.DataPointCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.DataPointCreateManyTenantInputEnvelope;
    connect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
};
export type DataPointUncheckedCreateNestedManyWithoutTenantInput = {
    create?: Prisma.XOR<Prisma.DataPointCreateWithoutTenantInput, Prisma.DataPointUncheckedCreateWithoutTenantInput> | Prisma.DataPointCreateWithoutTenantInput[] | Prisma.DataPointUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DataPointCreateOrConnectWithoutTenantInput | Prisma.DataPointCreateOrConnectWithoutTenantInput[];
    createMany?: Prisma.DataPointCreateManyTenantInputEnvelope;
    connect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
};
export type DataPointUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.DataPointCreateWithoutTenantInput, Prisma.DataPointUncheckedCreateWithoutTenantInput> | Prisma.DataPointCreateWithoutTenantInput[] | Prisma.DataPointUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DataPointCreateOrConnectWithoutTenantInput | Prisma.DataPointCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.DataPointUpsertWithWhereUniqueWithoutTenantInput | Prisma.DataPointUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.DataPointCreateManyTenantInputEnvelope;
    set?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    disconnect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    delete?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    connect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    update?: Prisma.DataPointUpdateWithWhereUniqueWithoutTenantInput | Prisma.DataPointUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.DataPointUpdateManyWithWhereWithoutTenantInput | Prisma.DataPointUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.DataPointScalarWhereInput | Prisma.DataPointScalarWhereInput[];
};
export type DataPointUncheckedUpdateManyWithoutTenantNestedInput = {
    create?: Prisma.XOR<Prisma.DataPointCreateWithoutTenantInput, Prisma.DataPointUncheckedCreateWithoutTenantInput> | Prisma.DataPointCreateWithoutTenantInput[] | Prisma.DataPointUncheckedCreateWithoutTenantInput[];
    connectOrCreate?: Prisma.DataPointCreateOrConnectWithoutTenantInput | Prisma.DataPointCreateOrConnectWithoutTenantInput[];
    upsert?: Prisma.DataPointUpsertWithWhereUniqueWithoutTenantInput | Prisma.DataPointUpsertWithWhereUniqueWithoutTenantInput[];
    createMany?: Prisma.DataPointCreateManyTenantInputEnvelope;
    set?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    disconnect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    delete?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    connect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    update?: Prisma.DataPointUpdateWithWhereUniqueWithoutTenantInput | Prisma.DataPointUpdateWithWhereUniqueWithoutTenantInput[];
    updateMany?: Prisma.DataPointUpdateManyWithWhereWithoutTenantInput | Prisma.DataPointUpdateManyWithWhereWithoutTenantInput[];
    deleteMany?: Prisma.DataPointScalarWhereInput | Prisma.DataPointScalarWhereInput[];
};
export type DataPointCreateNestedManyWithoutDataSourceInput = {
    create?: Prisma.XOR<Prisma.DataPointCreateWithoutDataSourceInput, Prisma.DataPointUncheckedCreateWithoutDataSourceInput> | Prisma.DataPointCreateWithoutDataSourceInput[] | Prisma.DataPointUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.DataPointCreateOrConnectWithoutDataSourceInput | Prisma.DataPointCreateOrConnectWithoutDataSourceInput[];
    createMany?: Prisma.DataPointCreateManyDataSourceInputEnvelope;
    connect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
};
export type DataPointUncheckedCreateNestedManyWithoutDataSourceInput = {
    create?: Prisma.XOR<Prisma.DataPointCreateWithoutDataSourceInput, Prisma.DataPointUncheckedCreateWithoutDataSourceInput> | Prisma.DataPointCreateWithoutDataSourceInput[] | Prisma.DataPointUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.DataPointCreateOrConnectWithoutDataSourceInput | Prisma.DataPointCreateOrConnectWithoutDataSourceInput[];
    createMany?: Prisma.DataPointCreateManyDataSourceInputEnvelope;
    connect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
};
export type DataPointUpdateManyWithoutDataSourceNestedInput = {
    create?: Prisma.XOR<Prisma.DataPointCreateWithoutDataSourceInput, Prisma.DataPointUncheckedCreateWithoutDataSourceInput> | Prisma.DataPointCreateWithoutDataSourceInput[] | Prisma.DataPointUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.DataPointCreateOrConnectWithoutDataSourceInput | Prisma.DataPointCreateOrConnectWithoutDataSourceInput[];
    upsert?: Prisma.DataPointUpsertWithWhereUniqueWithoutDataSourceInput | Prisma.DataPointUpsertWithWhereUniqueWithoutDataSourceInput[];
    createMany?: Prisma.DataPointCreateManyDataSourceInputEnvelope;
    set?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    disconnect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    delete?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    connect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    update?: Prisma.DataPointUpdateWithWhereUniqueWithoutDataSourceInput | Prisma.DataPointUpdateWithWhereUniqueWithoutDataSourceInput[];
    updateMany?: Prisma.DataPointUpdateManyWithWhereWithoutDataSourceInput | Prisma.DataPointUpdateManyWithWhereWithoutDataSourceInput[];
    deleteMany?: Prisma.DataPointScalarWhereInput | Prisma.DataPointScalarWhereInput[];
};
export type DataPointUncheckedUpdateManyWithoutDataSourceNestedInput = {
    create?: Prisma.XOR<Prisma.DataPointCreateWithoutDataSourceInput, Prisma.DataPointUncheckedCreateWithoutDataSourceInput> | Prisma.DataPointCreateWithoutDataSourceInput[] | Prisma.DataPointUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.DataPointCreateOrConnectWithoutDataSourceInput | Prisma.DataPointCreateOrConnectWithoutDataSourceInput[];
    upsert?: Prisma.DataPointUpsertWithWhereUniqueWithoutDataSourceInput | Prisma.DataPointUpsertWithWhereUniqueWithoutDataSourceInput[];
    createMany?: Prisma.DataPointCreateManyDataSourceInputEnvelope;
    set?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    disconnect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    delete?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    connect?: Prisma.DataPointWhereUniqueInput | Prisma.DataPointWhereUniqueInput[];
    update?: Prisma.DataPointUpdateWithWhereUniqueWithoutDataSourceInput | Prisma.DataPointUpdateWithWhereUniqueWithoutDataSourceInput[];
    updateMany?: Prisma.DataPointUpdateManyWithWhereWithoutDataSourceInput | Prisma.DataPointUpdateManyWithWhereWithoutDataSourceInput[];
    deleteMany?: Prisma.DataPointScalarWhereInput | Prisma.DataPointScalarWhereInput[];
};
export type DataPointCreateWithoutTenantInput = {
    id?: string;
    timestamp: Date | string;
    dimensions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    dataSource: Prisma.DataSourceCreateNestedOneWithoutDataPointsInput;
};
export type DataPointUncheckedCreateWithoutTenantInput = {
    id?: string;
    dataSourceId: string;
    timestamp: Date | string;
    dimensions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type DataPointCreateOrConnectWithoutTenantInput = {
    where: Prisma.DataPointWhereUniqueInput;
    create: Prisma.XOR<Prisma.DataPointCreateWithoutTenantInput, Prisma.DataPointUncheckedCreateWithoutTenantInput>;
};
export type DataPointCreateManyTenantInputEnvelope = {
    data: Prisma.DataPointCreateManyTenantInput | Prisma.DataPointCreateManyTenantInput[];
    skipDuplicates?: boolean;
};
export type DataPointUpsertWithWhereUniqueWithoutTenantInput = {
    where: Prisma.DataPointWhereUniqueInput;
    update: Prisma.XOR<Prisma.DataPointUpdateWithoutTenantInput, Prisma.DataPointUncheckedUpdateWithoutTenantInput>;
    create: Prisma.XOR<Prisma.DataPointCreateWithoutTenantInput, Prisma.DataPointUncheckedCreateWithoutTenantInput>;
};
export type DataPointUpdateWithWhereUniqueWithoutTenantInput = {
    where: Prisma.DataPointWhereUniqueInput;
    data: Prisma.XOR<Prisma.DataPointUpdateWithoutTenantInput, Prisma.DataPointUncheckedUpdateWithoutTenantInput>;
};
export type DataPointUpdateManyWithWhereWithoutTenantInput = {
    where: Prisma.DataPointScalarWhereInput;
    data: Prisma.XOR<Prisma.DataPointUpdateManyMutationInput, Prisma.DataPointUncheckedUpdateManyWithoutTenantInput>;
};
export type DataPointScalarWhereInput = {
    AND?: Prisma.DataPointScalarWhereInput | Prisma.DataPointScalarWhereInput[];
    OR?: Prisma.DataPointScalarWhereInput[];
    NOT?: Prisma.DataPointScalarWhereInput | Prisma.DataPointScalarWhereInput[];
    id?: Prisma.UuidFilter<"DataPoint"> | string;
    dataSourceId?: Prisma.UuidFilter<"DataPoint"> | string;
    tenantId?: Prisma.UuidFilter<"DataPoint"> | string;
    timestamp?: Prisma.DateTimeFilter<"DataPoint"> | Date | string;
    dimensions?: Prisma.JsonFilter<"DataPoint">;
    metrics?: Prisma.JsonFilter<"DataPoint">;
    createdAt?: Prisma.DateTimeFilter<"DataPoint"> | Date | string;
};
export type DataPointCreateWithoutDataSourceInput = {
    id?: string;
    timestamp: Date | string;
    dimensions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    tenant: Prisma.TenantCreateNestedOneWithoutDataPointsInput;
};
export type DataPointUncheckedCreateWithoutDataSourceInput = {
    id?: string;
    tenantId: string;
    timestamp: Date | string;
    dimensions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type DataPointCreateOrConnectWithoutDataSourceInput = {
    where: Prisma.DataPointWhereUniqueInput;
    create: Prisma.XOR<Prisma.DataPointCreateWithoutDataSourceInput, Prisma.DataPointUncheckedCreateWithoutDataSourceInput>;
};
export type DataPointCreateManyDataSourceInputEnvelope = {
    data: Prisma.DataPointCreateManyDataSourceInput | Prisma.DataPointCreateManyDataSourceInput[];
    skipDuplicates?: boolean;
};
export type DataPointUpsertWithWhereUniqueWithoutDataSourceInput = {
    where: Prisma.DataPointWhereUniqueInput;
    update: Prisma.XOR<Prisma.DataPointUpdateWithoutDataSourceInput, Prisma.DataPointUncheckedUpdateWithoutDataSourceInput>;
    create: Prisma.XOR<Prisma.DataPointCreateWithoutDataSourceInput, Prisma.DataPointUncheckedCreateWithoutDataSourceInput>;
};
export type DataPointUpdateWithWhereUniqueWithoutDataSourceInput = {
    where: Prisma.DataPointWhereUniqueInput;
    data: Prisma.XOR<Prisma.DataPointUpdateWithoutDataSourceInput, Prisma.DataPointUncheckedUpdateWithoutDataSourceInput>;
};
export type DataPointUpdateManyWithWhereWithoutDataSourceInput = {
    where: Prisma.DataPointScalarWhereInput;
    data: Prisma.XOR<Prisma.DataPointUpdateManyMutationInput, Prisma.DataPointUncheckedUpdateManyWithoutDataSourceInput>;
};
export type DataPointCreateManyTenantInput = {
    id?: string;
    dataSourceId: string;
    timestamp: Date | string;
    dimensions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type DataPointUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dimensions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dataSource?: Prisma.DataSourceUpdateOneRequiredWithoutDataPointsNestedInput;
};
export type DataPointUncheckedUpdateWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dimensions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataPointUncheckedUpdateManyWithoutTenantInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dimensions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataPointCreateManyDataSourceInput = {
    id?: string;
    tenantId: string;
    timestamp: Date | string;
    dimensions: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
};
export type DataPointUpdateWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dimensions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    tenant?: Prisma.TenantUpdateOneRequiredWithoutDataPointsNestedInput;
};
export type DataPointUncheckedUpdateWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dimensions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataPointUncheckedUpdateManyWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    tenantId?: Prisma.StringFieldUpdateOperationsInput | string;
    timestamp?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dimensions?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    metrics?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataPointSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    tenantId?: boolean;
    timestamp?: boolean;
    dimensions?: boolean;
    metrics?: boolean;
    createdAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dataPoint"]>;
export type DataPointSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    tenantId?: boolean;
    timestamp?: boolean;
    dimensions?: boolean;
    metrics?: boolean;
    createdAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dataPoint"]>;
export type DataPointSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    tenantId?: boolean;
    timestamp?: boolean;
    dimensions?: boolean;
    metrics?: boolean;
    createdAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dataPoint"]>;
export type DataPointSelectScalar = {
    id?: boolean;
    dataSourceId?: boolean;
    tenantId?: boolean;
    timestamp?: boolean;
    dimensions?: boolean;
    metrics?: boolean;
    createdAt?: boolean;
};
export type DataPointOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "dataSourceId" | "tenantId" | "timestamp" | "dimensions" | "metrics" | "createdAt", ExtArgs["result"]["dataPoint"]>;
export type DataPointInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
};
export type DataPointIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
};
export type DataPointIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
    tenant?: boolean | Prisma.TenantDefaultArgs<ExtArgs>;
};
export type $DataPointPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "DataPoint";
    objects: {
        dataSource: Prisma.$DataSourcePayload<ExtArgs>;
        tenant: Prisma.$TenantPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        dataSourceId: string;
        tenantId: string;
        timestamp: Date;
        dimensions: runtime.JsonValue;
        metrics: runtime.JsonValue;
        createdAt: Date;
    }, ExtArgs["result"]["dataPoint"]>;
    composites: {};
};
export type DataPointGetPayload<S extends boolean | null | undefined | DataPointDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DataPointPayload, S>;
export type DataPointCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DataPointFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DataPointCountAggregateInputType | true;
};
export interface DataPointDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['DataPoint'];
        meta: {
            name: 'DataPoint';
        };
    };
    findUnique<T extends DataPointFindUniqueArgs>(args: Prisma.SelectSubset<T, DataPointFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DataPointClient<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends DataPointFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DataPointFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DataPointClient<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends DataPointFindFirstArgs>(args?: Prisma.SelectSubset<T, DataPointFindFirstArgs<ExtArgs>>): Prisma.Prisma__DataPointClient<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends DataPointFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DataPointFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DataPointClient<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends DataPointFindManyArgs>(args?: Prisma.SelectSubset<T, DataPointFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends DataPointCreateArgs>(args: Prisma.SelectSubset<T, DataPointCreateArgs<ExtArgs>>): Prisma.Prisma__DataPointClient<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends DataPointCreateManyArgs>(args?: Prisma.SelectSubset<T, DataPointCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends DataPointCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DataPointCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends DataPointDeleteArgs>(args: Prisma.SelectSubset<T, DataPointDeleteArgs<ExtArgs>>): Prisma.Prisma__DataPointClient<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends DataPointUpdateArgs>(args: Prisma.SelectSubset<T, DataPointUpdateArgs<ExtArgs>>): Prisma.Prisma__DataPointClient<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends DataPointDeleteManyArgs>(args?: Prisma.SelectSubset<T, DataPointDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends DataPointUpdateManyArgs>(args: Prisma.SelectSubset<T, DataPointUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends DataPointUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DataPointUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends DataPointUpsertArgs>(args: Prisma.SelectSubset<T, DataPointUpsertArgs<ExtArgs>>): Prisma.Prisma__DataPointClient<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends DataPointCountArgs>(args?: Prisma.Subset<T, DataPointCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DataPointCountAggregateOutputType> : number>;
    aggregate<T extends DataPointAggregateArgs>(args: Prisma.Subset<T, DataPointAggregateArgs>): Prisma.PrismaPromise<GetDataPointAggregateType<T>>;
    groupBy<T extends DataPointGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DataPointGroupByArgs['orderBy'];
    } : {
        orderBy?: DataPointGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DataPointGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDataPointGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: DataPointFieldRefs;
}
export interface Prisma__DataPointClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    dataSource<T extends Prisma.DataSourceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DataSourceDefaultArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    tenant<T extends Prisma.TenantDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TenantDefaultArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface DataPointFieldRefs {
    readonly id: Prisma.FieldRef<"DataPoint", 'String'>;
    readonly dataSourceId: Prisma.FieldRef<"DataPoint", 'String'>;
    readonly tenantId: Prisma.FieldRef<"DataPoint", 'String'>;
    readonly timestamp: Prisma.FieldRef<"DataPoint", 'DateTime'>;
    readonly dimensions: Prisma.FieldRef<"DataPoint", 'Json'>;
    readonly metrics: Prisma.FieldRef<"DataPoint", 'Json'>;
    readonly createdAt: Prisma.FieldRef<"DataPoint", 'DateTime'>;
}
export type DataPointFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataPointSelect<ExtArgs> | null;
    omit?: Prisma.DataPointOmit<ExtArgs> | null;
    include?: Prisma.DataPointInclude<ExtArgs> | null;
    where: Prisma.DataPointWhereUniqueInput;
};
export type DataPointFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataPointSelect<ExtArgs> | null;
    omit?: Prisma.DataPointOmit<ExtArgs> | null;
    include?: Prisma.DataPointInclude<ExtArgs> | null;
    where: Prisma.DataPointWhereUniqueInput;
};
export type DataPointFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type DataPointFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type DataPointFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type DataPointCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataPointSelect<ExtArgs> | null;
    omit?: Prisma.DataPointOmit<ExtArgs> | null;
    include?: Prisma.DataPointInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DataPointCreateInput, Prisma.DataPointUncheckedCreateInput>;
};
export type DataPointCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.DataPointCreateManyInput | Prisma.DataPointCreateManyInput[];
    skipDuplicates?: boolean;
};
export type DataPointCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataPointSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DataPointOmit<ExtArgs> | null;
    data: Prisma.DataPointCreateManyInput | Prisma.DataPointCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.DataPointIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type DataPointUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataPointSelect<ExtArgs> | null;
    omit?: Prisma.DataPointOmit<ExtArgs> | null;
    include?: Prisma.DataPointInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DataPointUpdateInput, Prisma.DataPointUncheckedUpdateInput>;
    where: Prisma.DataPointWhereUniqueInput;
};
export type DataPointUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.DataPointUpdateManyMutationInput, Prisma.DataPointUncheckedUpdateManyInput>;
    where?: Prisma.DataPointWhereInput;
    limit?: number;
};
export type DataPointUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataPointSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DataPointOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DataPointUpdateManyMutationInput, Prisma.DataPointUncheckedUpdateManyInput>;
    where?: Prisma.DataPointWhereInput;
    limit?: number;
    include?: Prisma.DataPointIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type DataPointUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataPointSelect<ExtArgs> | null;
    omit?: Prisma.DataPointOmit<ExtArgs> | null;
    include?: Prisma.DataPointInclude<ExtArgs> | null;
    where: Prisma.DataPointWhereUniqueInput;
    create: Prisma.XOR<Prisma.DataPointCreateInput, Prisma.DataPointUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.DataPointUpdateInput, Prisma.DataPointUncheckedUpdateInput>;
};
export type DataPointDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataPointSelect<ExtArgs> | null;
    omit?: Prisma.DataPointOmit<ExtArgs> | null;
    include?: Prisma.DataPointInclude<ExtArgs> | null;
    where: Prisma.DataPointWhereUniqueInput;
};
export type DataPointDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataPointWhereInput;
    limit?: number;
};
export type DataPointDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataPointSelect<ExtArgs> | null;
    omit?: Prisma.DataPointOmit<ExtArgs> | null;
    include?: Prisma.DataPointInclude<ExtArgs> | null;
};
export {};

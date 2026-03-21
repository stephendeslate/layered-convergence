import type * as runtime from "@prisma/client/runtime/client";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type SyncRunModel = runtime.Types.Result.DefaultSelection<Prisma.$SyncRunPayload>;
export type AggregateSyncRun = {
    _count: SyncRunCountAggregateOutputType | null;
    _avg: SyncRunAvgAggregateOutputType | null;
    _sum: SyncRunSumAggregateOutputType | null;
    _min: SyncRunMinAggregateOutputType | null;
    _max: SyncRunMaxAggregateOutputType | null;
};
export type SyncRunAvgAggregateOutputType = {
    rowsIngested: number | null;
};
export type SyncRunSumAggregateOutputType = {
    rowsIngested: number | null;
};
export type SyncRunMinAggregateOutputType = {
    id: string | null;
    dataSourceId: string | null;
    status: $Enums.SyncRunStatus | null;
    rowsIngested: number | null;
    errorLog: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
};
export type SyncRunMaxAggregateOutputType = {
    id: string | null;
    dataSourceId: string | null;
    status: $Enums.SyncRunStatus | null;
    rowsIngested: number | null;
    errorLog: string | null;
    startedAt: Date | null;
    completedAt: Date | null;
};
export type SyncRunCountAggregateOutputType = {
    id: number;
    dataSourceId: number;
    status: number;
    rowsIngested: number;
    errorLog: number;
    startedAt: number;
    completedAt: number;
    _all: number;
};
export type SyncRunAvgAggregateInputType = {
    rowsIngested?: true;
};
export type SyncRunSumAggregateInputType = {
    rowsIngested?: true;
};
export type SyncRunMinAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    status?: true;
    rowsIngested?: true;
    errorLog?: true;
    startedAt?: true;
    completedAt?: true;
};
export type SyncRunMaxAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    status?: true;
    rowsIngested?: true;
    errorLog?: true;
    startedAt?: true;
    completedAt?: true;
};
export type SyncRunCountAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    status?: true;
    rowsIngested?: true;
    errorLog?: true;
    startedAt?: true;
    completedAt?: true;
    _all?: true;
};
export type SyncRunAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SyncRunWhereInput;
    orderBy?: Prisma.SyncRunOrderByWithRelationInput | Prisma.SyncRunOrderByWithRelationInput[];
    cursor?: Prisma.SyncRunWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | SyncRunCountAggregateInputType;
    _avg?: SyncRunAvgAggregateInputType;
    _sum?: SyncRunSumAggregateInputType;
    _min?: SyncRunMinAggregateInputType;
    _max?: SyncRunMaxAggregateInputType;
};
export type GetSyncRunAggregateType<T extends SyncRunAggregateArgs> = {
    [P in keyof T & keyof AggregateSyncRun]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateSyncRun[P]> : Prisma.GetScalarType<T[P], AggregateSyncRun[P]>;
};
export type SyncRunGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SyncRunWhereInput;
    orderBy?: Prisma.SyncRunOrderByWithAggregationInput | Prisma.SyncRunOrderByWithAggregationInput[];
    by: Prisma.SyncRunScalarFieldEnum[] | Prisma.SyncRunScalarFieldEnum;
    having?: Prisma.SyncRunScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: SyncRunCountAggregateInputType | true;
    _avg?: SyncRunAvgAggregateInputType;
    _sum?: SyncRunSumAggregateInputType;
    _min?: SyncRunMinAggregateInputType;
    _max?: SyncRunMaxAggregateInputType;
};
export type SyncRunGroupByOutputType = {
    id: string;
    dataSourceId: string;
    status: $Enums.SyncRunStatus;
    rowsIngested: number;
    errorLog: string | null;
    startedAt: Date;
    completedAt: Date | null;
    _count: SyncRunCountAggregateOutputType | null;
    _avg: SyncRunAvgAggregateOutputType | null;
    _sum: SyncRunSumAggregateOutputType | null;
    _min: SyncRunMinAggregateOutputType | null;
    _max: SyncRunMaxAggregateOutputType | null;
};
type GetSyncRunGroupByPayload<T extends SyncRunGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<SyncRunGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof SyncRunGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], SyncRunGroupByOutputType[P]> : Prisma.GetScalarType<T[P], SyncRunGroupByOutputType[P]>;
}>>;
export type SyncRunWhereInput = {
    AND?: Prisma.SyncRunWhereInput | Prisma.SyncRunWhereInput[];
    OR?: Prisma.SyncRunWhereInput[];
    NOT?: Prisma.SyncRunWhereInput | Prisma.SyncRunWhereInput[];
    id?: Prisma.UuidFilter<"SyncRun"> | string;
    dataSourceId?: Prisma.UuidFilter<"SyncRun"> | string;
    status?: Prisma.EnumSyncRunStatusFilter<"SyncRun"> | $Enums.SyncRunStatus;
    rowsIngested?: Prisma.IntFilter<"SyncRun"> | number;
    errorLog?: Prisma.StringNullableFilter<"SyncRun"> | string | null;
    startedAt?: Prisma.DateTimeFilter<"SyncRun"> | Date | string;
    completedAt?: Prisma.DateTimeNullableFilter<"SyncRun"> | Date | string | null;
    dataSource?: Prisma.XOR<Prisma.DataSourceScalarRelationFilter, Prisma.DataSourceWhereInput>;
};
export type SyncRunOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    rowsIngested?: Prisma.SortOrder;
    errorLog?: Prisma.SortOrderInput | Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    dataSource?: Prisma.DataSourceOrderByWithRelationInput;
};
export type SyncRunWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.SyncRunWhereInput | Prisma.SyncRunWhereInput[];
    OR?: Prisma.SyncRunWhereInput[];
    NOT?: Prisma.SyncRunWhereInput | Prisma.SyncRunWhereInput[];
    dataSourceId?: Prisma.UuidFilter<"SyncRun"> | string;
    status?: Prisma.EnumSyncRunStatusFilter<"SyncRun"> | $Enums.SyncRunStatus;
    rowsIngested?: Prisma.IntFilter<"SyncRun"> | number;
    errorLog?: Prisma.StringNullableFilter<"SyncRun"> | string | null;
    startedAt?: Prisma.DateTimeFilter<"SyncRun"> | Date | string;
    completedAt?: Prisma.DateTimeNullableFilter<"SyncRun"> | Date | string | null;
    dataSource?: Prisma.XOR<Prisma.DataSourceScalarRelationFilter, Prisma.DataSourceWhereInput>;
}, "id">;
export type SyncRunOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    rowsIngested?: Prisma.SortOrder;
    errorLog?: Prisma.SortOrderInput | Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.SyncRunCountOrderByAggregateInput;
    _avg?: Prisma.SyncRunAvgOrderByAggregateInput;
    _max?: Prisma.SyncRunMaxOrderByAggregateInput;
    _min?: Prisma.SyncRunMinOrderByAggregateInput;
    _sum?: Prisma.SyncRunSumOrderByAggregateInput;
};
export type SyncRunScalarWhereWithAggregatesInput = {
    AND?: Prisma.SyncRunScalarWhereWithAggregatesInput | Prisma.SyncRunScalarWhereWithAggregatesInput[];
    OR?: Prisma.SyncRunScalarWhereWithAggregatesInput[];
    NOT?: Prisma.SyncRunScalarWhereWithAggregatesInput | Prisma.SyncRunScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"SyncRun"> | string;
    dataSourceId?: Prisma.UuidWithAggregatesFilter<"SyncRun"> | string;
    status?: Prisma.EnumSyncRunStatusWithAggregatesFilter<"SyncRun"> | $Enums.SyncRunStatus;
    rowsIngested?: Prisma.IntWithAggregatesFilter<"SyncRun"> | number;
    errorLog?: Prisma.StringNullableWithAggregatesFilter<"SyncRun"> | string | null;
    startedAt?: Prisma.DateTimeWithAggregatesFilter<"SyncRun"> | Date | string;
    completedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"SyncRun"> | Date | string | null;
};
export type SyncRunCreateInput = {
    id?: string;
    status: $Enums.SyncRunStatus;
    rowsIngested?: number;
    errorLog?: string | null;
    startedAt?: Date | string;
    completedAt?: Date | string | null;
    dataSource: Prisma.DataSourceCreateNestedOneWithoutSyncRunsInput;
};
export type SyncRunUncheckedCreateInput = {
    id?: string;
    dataSourceId: string;
    status: $Enums.SyncRunStatus;
    rowsIngested?: number;
    errorLog?: string | null;
    startedAt?: Date | string;
    completedAt?: Date | string | null;
};
export type SyncRunUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSyncRunStatusFieldUpdateOperationsInput | $Enums.SyncRunStatus;
    rowsIngested?: Prisma.IntFieldUpdateOperationsInput | number;
    errorLog?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataSource?: Prisma.DataSourceUpdateOneRequiredWithoutSyncRunsNestedInput;
};
export type SyncRunUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSyncRunStatusFieldUpdateOperationsInput | $Enums.SyncRunStatus;
    rowsIngested?: Prisma.IntFieldUpdateOperationsInput | number;
    errorLog?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SyncRunCreateManyInput = {
    id?: string;
    dataSourceId: string;
    status: $Enums.SyncRunStatus;
    rowsIngested?: number;
    errorLog?: string | null;
    startedAt?: Date | string;
    completedAt?: Date | string | null;
};
export type SyncRunUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSyncRunStatusFieldUpdateOperationsInput | $Enums.SyncRunStatus;
    rowsIngested?: Prisma.IntFieldUpdateOperationsInput | number;
    errorLog?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SyncRunUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSyncRunStatusFieldUpdateOperationsInput | $Enums.SyncRunStatus;
    rowsIngested?: Prisma.IntFieldUpdateOperationsInput | number;
    errorLog?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SyncRunListRelationFilter = {
    every?: Prisma.SyncRunWhereInput;
    some?: Prisma.SyncRunWhereInput;
    none?: Prisma.SyncRunWhereInput;
};
export type SyncRunOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type SyncRunCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    rowsIngested?: Prisma.SortOrder;
    errorLog?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrder;
};
export type SyncRunAvgOrderByAggregateInput = {
    rowsIngested?: Prisma.SortOrder;
};
export type SyncRunMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    rowsIngested?: Prisma.SortOrder;
    errorLog?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrder;
};
export type SyncRunMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    rowsIngested?: Prisma.SortOrder;
    errorLog?: Prisma.SortOrder;
    startedAt?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrder;
};
export type SyncRunSumOrderByAggregateInput = {
    rowsIngested?: Prisma.SortOrder;
};
export type SyncRunCreateNestedManyWithoutDataSourceInput = {
    create?: Prisma.XOR<Prisma.SyncRunCreateWithoutDataSourceInput, Prisma.SyncRunUncheckedCreateWithoutDataSourceInput> | Prisma.SyncRunCreateWithoutDataSourceInput[] | Prisma.SyncRunUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.SyncRunCreateOrConnectWithoutDataSourceInput | Prisma.SyncRunCreateOrConnectWithoutDataSourceInput[];
    createMany?: Prisma.SyncRunCreateManyDataSourceInputEnvelope;
    connect?: Prisma.SyncRunWhereUniqueInput | Prisma.SyncRunWhereUniqueInput[];
};
export type SyncRunUncheckedCreateNestedManyWithoutDataSourceInput = {
    create?: Prisma.XOR<Prisma.SyncRunCreateWithoutDataSourceInput, Prisma.SyncRunUncheckedCreateWithoutDataSourceInput> | Prisma.SyncRunCreateWithoutDataSourceInput[] | Prisma.SyncRunUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.SyncRunCreateOrConnectWithoutDataSourceInput | Prisma.SyncRunCreateOrConnectWithoutDataSourceInput[];
    createMany?: Prisma.SyncRunCreateManyDataSourceInputEnvelope;
    connect?: Prisma.SyncRunWhereUniqueInput | Prisma.SyncRunWhereUniqueInput[];
};
export type SyncRunUpdateManyWithoutDataSourceNestedInput = {
    create?: Prisma.XOR<Prisma.SyncRunCreateWithoutDataSourceInput, Prisma.SyncRunUncheckedCreateWithoutDataSourceInput> | Prisma.SyncRunCreateWithoutDataSourceInput[] | Prisma.SyncRunUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.SyncRunCreateOrConnectWithoutDataSourceInput | Prisma.SyncRunCreateOrConnectWithoutDataSourceInput[];
    upsert?: Prisma.SyncRunUpsertWithWhereUniqueWithoutDataSourceInput | Prisma.SyncRunUpsertWithWhereUniqueWithoutDataSourceInput[];
    createMany?: Prisma.SyncRunCreateManyDataSourceInputEnvelope;
    set?: Prisma.SyncRunWhereUniqueInput | Prisma.SyncRunWhereUniqueInput[];
    disconnect?: Prisma.SyncRunWhereUniqueInput | Prisma.SyncRunWhereUniqueInput[];
    delete?: Prisma.SyncRunWhereUniqueInput | Prisma.SyncRunWhereUniqueInput[];
    connect?: Prisma.SyncRunWhereUniqueInput | Prisma.SyncRunWhereUniqueInput[];
    update?: Prisma.SyncRunUpdateWithWhereUniqueWithoutDataSourceInput | Prisma.SyncRunUpdateWithWhereUniqueWithoutDataSourceInput[];
    updateMany?: Prisma.SyncRunUpdateManyWithWhereWithoutDataSourceInput | Prisma.SyncRunUpdateManyWithWhereWithoutDataSourceInput[];
    deleteMany?: Prisma.SyncRunScalarWhereInput | Prisma.SyncRunScalarWhereInput[];
};
export type SyncRunUncheckedUpdateManyWithoutDataSourceNestedInput = {
    create?: Prisma.XOR<Prisma.SyncRunCreateWithoutDataSourceInput, Prisma.SyncRunUncheckedCreateWithoutDataSourceInput> | Prisma.SyncRunCreateWithoutDataSourceInput[] | Prisma.SyncRunUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.SyncRunCreateOrConnectWithoutDataSourceInput | Prisma.SyncRunCreateOrConnectWithoutDataSourceInput[];
    upsert?: Prisma.SyncRunUpsertWithWhereUniqueWithoutDataSourceInput | Prisma.SyncRunUpsertWithWhereUniqueWithoutDataSourceInput[];
    createMany?: Prisma.SyncRunCreateManyDataSourceInputEnvelope;
    set?: Prisma.SyncRunWhereUniqueInput | Prisma.SyncRunWhereUniqueInput[];
    disconnect?: Prisma.SyncRunWhereUniqueInput | Prisma.SyncRunWhereUniqueInput[];
    delete?: Prisma.SyncRunWhereUniqueInput | Prisma.SyncRunWhereUniqueInput[];
    connect?: Prisma.SyncRunWhereUniqueInput | Prisma.SyncRunWhereUniqueInput[];
    update?: Prisma.SyncRunUpdateWithWhereUniqueWithoutDataSourceInput | Prisma.SyncRunUpdateWithWhereUniqueWithoutDataSourceInput[];
    updateMany?: Prisma.SyncRunUpdateManyWithWhereWithoutDataSourceInput | Prisma.SyncRunUpdateManyWithWhereWithoutDataSourceInput[];
    deleteMany?: Prisma.SyncRunScalarWhereInput | Prisma.SyncRunScalarWhereInput[];
};
export type EnumSyncRunStatusFieldUpdateOperationsInput = {
    set?: $Enums.SyncRunStatus;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type SyncRunCreateWithoutDataSourceInput = {
    id?: string;
    status: $Enums.SyncRunStatus;
    rowsIngested?: number;
    errorLog?: string | null;
    startedAt?: Date | string;
    completedAt?: Date | string | null;
};
export type SyncRunUncheckedCreateWithoutDataSourceInput = {
    id?: string;
    status: $Enums.SyncRunStatus;
    rowsIngested?: number;
    errorLog?: string | null;
    startedAt?: Date | string;
    completedAt?: Date | string | null;
};
export type SyncRunCreateOrConnectWithoutDataSourceInput = {
    where: Prisma.SyncRunWhereUniqueInput;
    create: Prisma.XOR<Prisma.SyncRunCreateWithoutDataSourceInput, Prisma.SyncRunUncheckedCreateWithoutDataSourceInput>;
};
export type SyncRunCreateManyDataSourceInputEnvelope = {
    data: Prisma.SyncRunCreateManyDataSourceInput | Prisma.SyncRunCreateManyDataSourceInput[];
    skipDuplicates?: boolean;
};
export type SyncRunUpsertWithWhereUniqueWithoutDataSourceInput = {
    where: Prisma.SyncRunWhereUniqueInput;
    update: Prisma.XOR<Prisma.SyncRunUpdateWithoutDataSourceInput, Prisma.SyncRunUncheckedUpdateWithoutDataSourceInput>;
    create: Prisma.XOR<Prisma.SyncRunCreateWithoutDataSourceInput, Prisma.SyncRunUncheckedCreateWithoutDataSourceInput>;
};
export type SyncRunUpdateWithWhereUniqueWithoutDataSourceInput = {
    where: Prisma.SyncRunWhereUniqueInput;
    data: Prisma.XOR<Prisma.SyncRunUpdateWithoutDataSourceInput, Prisma.SyncRunUncheckedUpdateWithoutDataSourceInput>;
};
export type SyncRunUpdateManyWithWhereWithoutDataSourceInput = {
    where: Prisma.SyncRunScalarWhereInput;
    data: Prisma.XOR<Prisma.SyncRunUpdateManyMutationInput, Prisma.SyncRunUncheckedUpdateManyWithoutDataSourceInput>;
};
export type SyncRunScalarWhereInput = {
    AND?: Prisma.SyncRunScalarWhereInput | Prisma.SyncRunScalarWhereInput[];
    OR?: Prisma.SyncRunScalarWhereInput[];
    NOT?: Prisma.SyncRunScalarWhereInput | Prisma.SyncRunScalarWhereInput[];
    id?: Prisma.UuidFilter<"SyncRun"> | string;
    dataSourceId?: Prisma.UuidFilter<"SyncRun"> | string;
    status?: Prisma.EnumSyncRunStatusFilter<"SyncRun"> | $Enums.SyncRunStatus;
    rowsIngested?: Prisma.IntFilter<"SyncRun"> | number;
    errorLog?: Prisma.StringNullableFilter<"SyncRun"> | string | null;
    startedAt?: Prisma.DateTimeFilter<"SyncRun"> | Date | string;
    completedAt?: Prisma.DateTimeNullableFilter<"SyncRun"> | Date | string | null;
};
export type SyncRunCreateManyDataSourceInput = {
    id?: string;
    status: $Enums.SyncRunStatus;
    rowsIngested?: number;
    errorLog?: string | null;
    startedAt?: Date | string;
    completedAt?: Date | string | null;
};
export type SyncRunUpdateWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSyncRunStatusFieldUpdateOperationsInput | $Enums.SyncRunStatus;
    rowsIngested?: Prisma.IntFieldUpdateOperationsInput | number;
    errorLog?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SyncRunUncheckedUpdateWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSyncRunStatusFieldUpdateOperationsInput | $Enums.SyncRunStatus;
    rowsIngested?: Prisma.IntFieldUpdateOperationsInput | number;
    errorLog?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SyncRunUncheckedUpdateManyWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    status?: Prisma.EnumSyncRunStatusFieldUpdateOperationsInput | $Enums.SyncRunStatus;
    rowsIngested?: Prisma.IntFieldUpdateOperationsInput | number;
    errorLog?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    startedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type SyncRunSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    status?: boolean;
    rowsIngested?: boolean;
    errorLog?: boolean;
    startedAt?: boolean;
    completedAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["syncRun"]>;
export type SyncRunSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    status?: boolean;
    rowsIngested?: boolean;
    errorLog?: boolean;
    startedAt?: boolean;
    completedAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["syncRun"]>;
export type SyncRunSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    status?: boolean;
    rowsIngested?: boolean;
    errorLog?: boolean;
    startedAt?: boolean;
    completedAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["syncRun"]>;
export type SyncRunSelectScalar = {
    id?: boolean;
    dataSourceId?: boolean;
    status?: boolean;
    rowsIngested?: boolean;
    errorLog?: boolean;
    startedAt?: boolean;
    completedAt?: boolean;
};
export type SyncRunOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "dataSourceId" | "status" | "rowsIngested" | "errorLog" | "startedAt" | "completedAt", ExtArgs["result"]["syncRun"]>;
export type SyncRunInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
};
export type SyncRunIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
};
export type SyncRunIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
};
export type $SyncRunPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "SyncRun";
    objects: {
        dataSource: Prisma.$DataSourcePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        dataSourceId: string;
        status: $Enums.SyncRunStatus;
        rowsIngested: number;
        errorLog: string | null;
        startedAt: Date;
        completedAt: Date | null;
    }, ExtArgs["result"]["syncRun"]>;
    composites: {};
};
export type SyncRunGetPayload<S extends boolean | null | undefined | SyncRunDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$SyncRunPayload, S>;
export type SyncRunCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<SyncRunFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: SyncRunCountAggregateInputType | true;
};
export interface SyncRunDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['SyncRun'];
        meta: {
            name: 'SyncRun';
        };
    };
    findUnique<T extends SyncRunFindUniqueArgs>(args: Prisma.SelectSubset<T, SyncRunFindUniqueArgs<ExtArgs>>): Prisma.Prisma__SyncRunClient<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends SyncRunFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, SyncRunFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__SyncRunClient<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends SyncRunFindFirstArgs>(args?: Prisma.SelectSubset<T, SyncRunFindFirstArgs<ExtArgs>>): Prisma.Prisma__SyncRunClient<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends SyncRunFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, SyncRunFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__SyncRunClient<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends SyncRunFindManyArgs>(args?: Prisma.SelectSubset<T, SyncRunFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends SyncRunCreateArgs>(args: Prisma.SelectSubset<T, SyncRunCreateArgs<ExtArgs>>): Prisma.Prisma__SyncRunClient<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends SyncRunCreateManyArgs>(args?: Prisma.SelectSubset<T, SyncRunCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends SyncRunCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, SyncRunCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends SyncRunDeleteArgs>(args: Prisma.SelectSubset<T, SyncRunDeleteArgs<ExtArgs>>): Prisma.Prisma__SyncRunClient<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends SyncRunUpdateArgs>(args: Prisma.SelectSubset<T, SyncRunUpdateArgs<ExtArgs>>): Prisma.Prisma__SyncRunClient<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends SyncRunDeleteManyArgs>(args?: Prisma.SelectSubset<T, SyncRunDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends SyncRunUpdateManyArgs>(args: Prisma.SelectSubset<T, SyncRunUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends SyncRunUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, SyncRunUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends SyncRunUpsertArgs>(args: Prisma.SelectSubset<T, SyncRunUpsertArgs<ExtArgs>>): Prisma.Prisma__SyncRunClient<runtime.Types.Result.GetResult<Prisma.$SyncRunPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends SyncRunCountArgs>(args?: Prisma.Subset<T, SyncRunCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], SyncRunCountAggregateOutputType> : number>;
    aggregate<T extends SyncRunAggregateArgs>(args: Prisma.Subset<T, SyncRunAggregateArgs>): Prisma.PrismaPromise<GetSyncRunAggregateType<T>>;
    groupBy<T extends SyncRunGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: SyncRunGroupByArgs['orderBy'];
    } : {
        orderBy?: SyncRunGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, SyncRunGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetSyncRunGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: SyncRunFieldRefs;
}
export interface Prisma__SyncRunClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    dataSource<T extends Prisma.DataSourceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DataSourceDefaultArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface SyncRunFieldRefs {
    readonly id: Prisma.FieldRef<"SyncRun", 'String'>;
    readonly dataSourceId: Prisma.FieldRef<"SyncRun", 'String'>;
    readonly status: Prisma.FieldRef<"SyncRun", 'SyncRunStatus'>;
    readonly rowsIngested: Prisma.FieldRef<"SyncRun", 'Int'>;
    readonly errorLog: Prisma.FieldRef<"SyncRun", 'String'>;
    readonly startedAt: Prisma.FieldRef<"SyncRun", 'DateTime'>;
    readonly completedAt: Prisma.FieldRef<"SyncRun", 'DateTime'>;
}
export type SyncRunFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SyncRunSelect<ExtArgs> | null;
    omit?: Prisma.SyncRunOmit<ExtArgs> | null;
    include?: Prisma.SyncRunInclude<ExtArgs> | null;
    where: Prisma.SyncRunWhereUniqueInput;
};
export type SyncRunFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SyncRunSelect<ExtArgs> | null;
    omit?: Prisma.SyncRunOmit<ExtArgs> | null;
    include?: Prisma.SyncRunInclude<ExtArgs> | null;
    where: Prisma.SyncRunWhereUniqueInput;
};
export type SyncRunFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type SyncRunFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type SyncRunFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type SyncRunCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SyncRunSelect<ExtArgs> | null;
    omit?: Prisma.SyncRunOmit<ExtArgs> | null;
    include?: Prisma.SyncRunInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SyncRunCreateInput, Prisma.SyncRunUncheckedCreateInput>;
};
export type SyncRunCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.SyncRunCreateManyInput | Prisma.SyncRunCreateManyInput[];
    skipDuplicates?: boolean;
};
export type SyncRunCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SyncRunSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SyncRunOmit<ExtArgs> | null;
    data: Prisma.SyncRunCreateManyInput | Prisma.SyncRunCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.SyncRunIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type SyncRunUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SyncRunSelect<ExtArgs> | null;
    omit?: Prisma.SyncRunOmit<ExtArgs> | null;
    include?: Prisma.SyncRunInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SyncRunUpdateInput, Prisma.SyncRunUncheckedUpdateInput>;
    where: Prisma.SyncRunWhereUniqueInput;
};
export type SyncRunUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.SyncRunUpdateManyMutationInput, Prisma.SyncRunUncheckedUpdateManyInput>;
    where?: Prisma.SyncRunWhereInput;
    limit?: number;
};
export type SyncRunUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SyncRunSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.SyncRunOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.SyncRunUpdateManyMutationInput, Prisma.SyncRunUncheckedUpdateManyInput>;
    where?: Prisma.SyncRunWhereInput;
    limit?: number;
    include?: Prisma.SyncRunIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type SyncRunUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SyncRunSelect<ExtArgs> | null;
    omit?: Prisma.SyncRunOmit<ExtArgs> | null;
    include?: Prisma.SyncRunInclude<ExtArgs> | null;
    where: Prisma.SyncRunWhereUniqueInput;
    create: Prisma.XOR<Prisma.SyncRunCreateInput, Prisma.SyncRunUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.SyncRunUpdateInput, Prisma.SyncRunUncheckedUpdateInput>;
};
export type SyncRunDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SyncRunSelect<ExtArgs> | null;
    omit?: Prisma.SyncRunOmit<ExtArgs> | null;
    include?: Prisma.SyncRunInclude<ExtArgs> | null;
    where: Prisma.SyncRunWhereUniqueInput;
};
export type SyncRunDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.SyncRunWhereInput;
    limit?: number;
};
export type SyncRunDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.SyncRunSelect<ExtArgs> | null;
    omit?: Prisma.SyncRunOmit<ExtArgs> | null;
    include?: Prisma.SyncRunInclude<ExtArgs> | null;
};
export {};

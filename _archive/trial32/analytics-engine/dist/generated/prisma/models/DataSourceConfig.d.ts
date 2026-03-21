import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type DataSourceConfigModel = runtime.Types.Result.DefaultSelection<Prisma.$DataSourceConfigPayload>;
export type AggregateDataSourceConfig = {
    _count: DataSourceConfigCountAggregateOutputType | null;
    _min: DataSourceConfigMinAggregateOutputType | null;
    _max: DataSourceConfigMaxAggregateOutputType | null;
};
export type DataSourceConfigMinAggregateOutputType = {
    id: string | null;
    dataSourceId: string | null;
    syncSchedule: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type DataSourceConfigMaxAggregateOutputType = {
    id: string | null;
    dataSourceId: string | null;
    syncSchedule: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type DataSourceConfigCountAggregateOutputType = {
    id: number;
    dataSourceId: number;
    connectionConfig: number;
    fieldMapping: number;
    transformSteps: number;
    syncSchedule: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type DataSourceConfigMinAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    syncSchedule?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type DataSourceConfigMaxAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    syncSchedule?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type DataSourceConfigCountAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    connectionConfig?: true;
    fieldMapping?: true;
    transformSteps?: true;
    syncSchedule?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type DataSourceConfigAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataSourceConfigWhereInput;
    orderBy?: Prisma.DataSourceConfigOrderByWithRelationInput | Prisma.DataSourceConfigOrderByWithRelationInput[];
    cursor?: Prisma.DataSourceConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | DataSourceConfigCountAggregateInputType;
    _min?: DataSourceConfigMinAggregateInputType;
    _max?: DataSourceConfigMaxAggregateInputType;
};
export type GetDataSourceConfigAggregateType<T extends DataSourceConfigAggregateArgs> = {
    [P in keyof T & keyof AggregateDataSourceConfig]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDataSourceConfig[P]> : Prisma.GetScalarType<T[P], AggregateDataSourceConfig[P]>;
};
export type DataSourceConfigGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataSourceConfigWhereInput;
    orderBy?: Prisma.DataSourceConfigOrderByWithAggregationInput | Prisma.DataSourceConfigOrderByWithAggregationInput[];
    by: Prisma.DataSourceConfigScalarFieldEnum[] | Prisma.DataSourceConfigScalarFieldEnum;
    having?: Prisma.DataSourceConfigScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DataSourceConfigCountAggregateInputType | true;
    _min?: DataSourceConfigMinAggregateInputType;
    _max?: DataSourceConfigMaxAggregateInputType;
};
export type DataSourceConfigGroupByOutputType = {
    id: string;
    dataSourceId: string;
    connectionConfig: runtime.JsonValue;
    fieldMapping: runtime.JsonValue;
    transformSteps: runtime.JsonValue;
    syncSchedule: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: DataSourceConfigCountAggregateOutputType | null;
    _min: DataSourceConfigMinAggregateOutputType | null;
    _max: DataSourceConfigMaxAggregateOutputType | null;
};
type GetDataSourceConfigGroupByPayload<T extends DataSourceConfigGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DataSourceConfigGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DataSourceConfigGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DataSourceConfigGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DataSourceConfigGroupByOutputType[P]>;
}>>;
export type DataSourceConfigWhereInput = {
    AND?: Prisma.DataSourceConfigWhereInput | Prisma.DataSourceConfigWhereInput[];
    OR?: Prisma.DataSourceConfigWhereInput[];
    NOT?: Prisma.DataSourceConfigWhereInput | Prisma.DataSourceConfigWhereInput[];
    id?: Prisma.UuidFilter<"DataSourceConfig"> | string;
    dataSourceId?: Prisma.UuidFilter<"DataSourceConfig"> | string;
    connectionConfig?: Prisma.JsonFilter<"DataSourceConfig">;
    fieldMapping?: Prisma.JsonFilter<"DataSourceConfig">;
    transformSteps?: Prisma.JsonFilter<"DataSourceConfig">;
    syncSchedule?: Prisma.StringNullableFilter<"DataSourceConfig"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"DataSourceConfig"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"DataSourceConfig"> | Date | string;
    dataSource?: Prisma.XOR<Prisma.DataSourceScalarRelationFilter, Prisma.DataSourceWhereInput>;
};
export type DataSourceConfigOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    connectionConfig?: Prisma.SortOrder;
    fieldMapping?: Prisma.SortOrder;
    transformSteps?: Prisma.SortOrder;
    syncSchedule?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    dataSource?: Prisma.DataSourceOrderByWithRelationInput;
};
export type DataSourceConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    dataSourceId?: string;
    AND?: Prisma.DataSourceConfigWhereInput | Prisma.DataSourceConfigWhereInput[];
    OR?: Prisma.DataSourceConfigWhereInput[];
    NOT?: Prisma.DataSourceConfigWhereInput | Prisma.DataSourceConfigWhereInput[];
    connectionConfig?: Prisma.JsonFilter<"DataSourceConfig">;
    fieldMapping?: Prisma.JsonFilter<"DataSourceConfig">;
    transformSteps?: Prisma.JsonFilter<"DataSourceConfig">;
    syncSchedule?: Prisma.StringNullableFilter<"DataSourceConfig"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"DataSourceConfig"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"DataSourceConfig"> | Date | string;
    dataSource?: Prisma.XOR<Prisma.DataSourceScalarRelationFilter, Prisma.DataSourceWhereInput>;
}, "id" | "dataSourceId">;
export type DataSourceConfigOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    connectionConfig?: Prisma.SortOrder;
    fieldMapping?: Prisma.SortOrder;
    transformSteps?: Prisma.SortOrder;
    syncSchedule?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.DataSourceConfigCountOrderByAggregateInput;
    _max?: Prisma.DataSourceConfigMaxOrderByAggregateInput;
    _min?: Prisma.DataSourceConfigMinOrderByAggregateInput;
};
export type DataSourceConfigScalarWhereWithAggregatesInput = {
    AND?: Prisma.DataSourceConfigScalarWhereWithAggregatesInput | Prisma.DataSourceConfigScalarWhereWithAggregatesInput[];
    OR?: Prisma.DataSourceConfigScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DataSourceConfigScalarWhereWithAggregatesInput | Prisma.DataSourceConfigScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"DataSourceConfig"> | string;
    dataSourceId?: Prisma.UuidWithAggregatesFilter<"DataSourceConfig"> | string;
    connectionConfig?: Prisma.JsonWithAggregatesFilter<"DataSourceConfig">;
    fieldMapping?: Prisma.JsonWithAggregatesFilter<"DataSourceConfig">;
    transformSteps?: Prisma.JsonWithAggregatesFilter<"DataSourceConfig">;
    syncSchedule?: Prisma.StringNullableWithAggregatesFilter<"DataSourceConfig"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"DataSourceConfig"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"DataSourceConfig"> | Date | string;
};
export type DataSourceConfigCreateInput = {
    id?: string;
    connectionConfig: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    transformSteps: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    syncSchedule?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dataSource: Prisma.DataSourceCreateNestedOneWithoutConfigInput;
};
export type DataSourceConfigUncheckedCreateInput = {
    id?: string;
    dataSourceId: string;
    connectionConfig: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    transformSteps: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    syncSchedule?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type DataSourceConfigUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionConfig?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    transformSteps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    syncSchedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dataSource?: Prisma.DataSourceUpdateOneRequiredWithoutConfigNestedInput;
};
export type DataSourceConfigUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionConfig?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    transformSteps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    syncSchedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataSourceConfigCreateManyInput = {
    id?: string;
    dataSourceId: string;
    connectionConfig: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    transformSteps: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    syncSchedule?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type DataSourceConfigUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionConfig?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    transformSteps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    syncSchedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataSourceConfigUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionConfig?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    transformSteps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    syncSchedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataSourceConfigNullableScalarRelationFilter = {
    is?: Prisma.DataSourceConfigWhereInput | null;
    isNot?: Prisma.DataSourceConfigWhereInput | null;
};
export type DataSourceConfigCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    connectionConfig?: Prisma.SortOrder;
    fieldMapping?: Prisma.SortOrder;
    transformSteps?: Prisma.SortOrder;
    syncSchedule?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DataSourceConfigMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    syncSchedule?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DataSourceConfigMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    syncSchedule?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type DataSourceConfigCreateNestedOneWithoutDataSourceInput = {
    create?: Prisma.XOR<Prisma.DataSourceConfigCreateWithoutDataSourceInput, Prisma.DataSourceConfigUncheckedCreateWithoutDataSourceInput>;
    connectOrCreate?: Prisma.DataSourceConfigCreateOrConnectWithoutDataSourceInput;
    connect?: Prisma.DataSourceConfigWhereUniqueInput;
};
export type DataSourceConfigUncheckedCreateNestedOneWithoutDataSourceInput = {
    create?: Prisma.XOR<Prisma.DataSourceConfigCreateWithoutDataSourceInput, Prisma.DataSourceConfigUncheckedCreateWithoutDataSourceInput>;
    connectOrCreate?: Prisma.DataSourceConfigCreateOrConnectWithoutDataSourceInput;
    connect?: Prisma.DataSourceConfigWhereUniqueInput;
};
export type DataSourceConfigUpdateOneWithoutDataSourceNestedInput = {
    create?: Prisma.XOR<Prisma.DataSourceConfigCreateWithoutDataSourceInput, Prisma.DataSourceConfigUncheckedCreateWithoutDataSourceInput>;
    connectOrCreate?: Prisma.DataSourceConfigCreateOrConnectWithoutDataSourceInput;
    upsert?: Prisma.DataSourceConfigUpsertWithoutDataSourceInput;
    disconnect?: Prisma.DataSourceConfigWhereInput | boolean;
    delete?: Prisma.DataSourceConfigWhereInput | boolean;
    connect?: Prisma.DataSourceConfigWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DataSourceConfigUpdateToOneWithWhereWithoutDataSourceInput, Prisma.DataSourceConfigUpdateWithoutDataSourceInput>, Prisma.DataSourceConfigUncheckedUpdateWithoutDataSourceInput>;
};
export type DataSourceConfigUncheckedUpdateOneWithoutDataSourceNestedInput = {
    create?: Prisma.XOR<Prisma.DataSourceConfigCreateWithoutDataSourceInput, Prisma.DataSourceConfigUncheckedCreateWithoutDataSourceInput>;
    connectOrCreate?: Prisma.DataSourceConfigCreateOrConnectWithoutDataSourceInput;
    upsert?: Prisma.DataSourceConfigUpsertWithoutDataSourceInput;
    disconnect?: Prisma.DataSourceConfigWhereInput | boolean;
    delete?: Prisma.DataSourceConfigWhereInput | boolean;
    connect?: Prisma.DataSourceConfigWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.DataSourceConfigUpdateToOneWithWhereWithoutDataSourceInput, Prisma.DataSourceConfigUpdateWithoutDataSourceInput>, Prisma.DataSourceConfigUncheckedUpdateWithoutDataSourceInput>;
};
export type DataSourceConfigCreateWithoutDataSourceInput = {
    id?: string;
    connectionConfig: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    transformSteps: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    syncSchedule?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type DataSourceConfigUncheckedCreateWithoutDataSourceInput = {
    id?: string;
    connectionConfig: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fieldMapping: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    transformSteps: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    syncSchedule?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type DataSourceConfigCreateOrConnectWithoutDataSourceInput = {
    where: Prisma.DataSourceConfigWhereUniqueInput;
    create: Prisma.XOR<Prisma.DataSourceConfigCreateWithoutDataSourceInput, Prisma.DataSourceConfigUncheckedCreateWithoutDataSourceInput>;
};
export type DataSourceConfigUpsertWithoutDataSourceInput = {
    update: Prisma.XOR<Prisma.DataSourceConfigUpdateWithoutDataSourceInput, Prisma.DataSourceConfigUncheckedUpdateWithoutDataSourceInput>;
    create: Prisma.XOR<Prisma.DataSourceConfigCreateWithoutDataSourceInput, Prisma.DataSourceConfigUncheckedCreateWithoutDataSourceInput>;
    where?: Prisma.DataSourceConfigWhereInput;
};
export type DataSourceConfigUpdateToOneWithWhereWithoutDataSourceInput = {
    where?: Prisma.DataSourceConfigWhereInput;
    data: Prisma.XOR<Prisma.DataSourceConfigUpdateWithoutDataSourceInput, Prisma.DataSourceConfigUncheckedUpdateWithoutDataSourceInput>;
};
export type DataSourceConfigUpdateWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionConfig?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    transformSteps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    syncSchedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataSourceConfigUncheckedUpdateWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    connectionConfig?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    fieldMapping?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    transformSteps?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    syncSchedule?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type DataSourceConfigSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    connectionConfig?: boolean;
    fieldMapping?: boolean;
    transformSteps?: boolean;
    syncSchedule?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dataSourceConfig"]>;
export type DataSourceConfigSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    connectionConfig?: boolean;
    fieldMapping?: boolean;
    transformSteps?: boolean;
    syncSchedule?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dataSourceConfig"]>;
export type DataSourceConfigSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    connectionConfig?: boolean;
    fieldMapping?: boolean;
    transformSteps?: boolean;
    syncSchedule?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["dataSourceConfig"]>;
export type DataSourceConfigSelectScalar = {
    id?: boolean;
    dataSourceId?: boolean;
    connectionConfig?: boolean;
    fieldMapping?: boolean;
    transformSteps?: boolean;
    syncSchedule?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type DataSourceConfigOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "dataSourceId" | "connectionConfig" | "fieldMapping" | "transformSteps" | "syncSchedule" | "createdAt" | "updatedAt", ExtArgs["result"]["dataSourceConfig"]>;
export type DataSourceConfigInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
};
export type DataSourceConfigIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
};
export type DataSourceConfigIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
};
export type $DataSourceConfigPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "DataSourceConfig";
    objects: {
        dataSource: Prisma.$DataSourcePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        dataSourceId: string;
        connectionConfig: runtime.JsonValue;
        fieldMapping: runtime.JsonValue;
        transformSteps: runtime.JsonValue;
        syncSchedule: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["dataSourceConfig"]>;
    composites: {};
};
export type DataSourceConfigGetPayload<S extends boolean | null | undefined | DataSourceConfigDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload, S>;
export type DataSourceConfigCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DataSourceConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DataSourceConfigCountAggregateInputType | true;
};
export interface DataSourceConfigDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['DataSourceConfig'];
        meta: {
            name: 'DataSourceConfig';
        };
    };
    findUnique<T extends DataSourceConfigFindUniqueArgs>(args: Prisma.SelectSubset<T, DataSourceConfigFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DataSourceConfigClient<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends DataSourceConfigFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DataSourceConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DataSourceConfigClient<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends DataSourceConfigFindFirstArgs>(args?: Prisma.SelectSubset<T, DataSourceConfigFindFirstArgs<ExtArgs>>): Prisma.Prisma__DataSourceConfigClient<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends DataSourceConfigFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DataSourceConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DataSourceConfigClient<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends DataSourceConfigFindManyArgs>(args?: Prisma.SelectSubset<T, DataSourceConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends DataSourceConfigCreateArgs>(args: Prisma.SelectSubset<T, DataSourceConfigCreateArgs<ExtArgs>>): Prisma.Prisma__DataSourceConfigClient<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends DataSourceConfigCreateManyArgs>(args?: Prisma.SelectSubset<T, DataSourceConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends DataSourceConfigCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DataSourceConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends DataSourceConfigDeleteArgs>(args: Prisma.SelectSubset<T, DataSourceConfigDeleteArgs<ExtArgs>>): Prisma.Prisma__DataSourceConfigClient<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends DataSourceConfigUpdateArgs>(args: Prisma.SelectSubset<T, DataSourceConfigUpdateArgs<ExtArgs>>): Prisma.Prisma__DataSourceConfigClient<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends DataSourceConfigDeleteManyArgs>(args?: Prisma.SelectSubset<T, DataSourceConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends DataSourceConfigUpdateManyArgs>(args: Prisma.SelectSubset<T, DataSourceConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends DataSourceConfigUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DataSourceConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends DataSourceConfigUpsertArgs>(args: Prisma.SelectSubset<T, DataSourceConfigUpsertArgs<ExtArgs>>): Prisma.Prisma__DataSourceConfigClient<runtime.Types.Result.GetResult<Prisma.$DataSourceConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends DataSourceConfigCountArgs>(args?: Prisma.Subset<T, DataSourceConfigCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DataSourceConfigCountAggregateOutputType> : number>;
    aggregate<T extends DataSourceConfigAggregateArgs>(args: Prisma.Subset<T, DataSourceConfigAggregateArgs>): Prisma.PrismaPromise<GetDataSourceConfigAggregateType<T>>;
    groupBy<T extends DataSourceConfigGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DataSourceConfigGroupByArgs['orderBy'];
    } : {
        orderBy?: DataSourceConfigGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DataSourceConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDataSourceConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: DataSourceConfigFieldRefs;
}
export interface Prisma__DataSourceConfigClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    dataSource<T extends Prisma.DataSourceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DataSourceDefaultArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface DataSourceConfigFieldRefs {
    readonly id: Prisma.FieldRef<"DataSourceConfig", 'String'>;
    readonly dataSourceId: Prisma.FieldRef<"DataSourceConfig", 'String'>;
    readonly connectionConfig: Prisma.FieldRef<"DataSourceConfig", 'Json'>;
    readonly fieldMapping: Prisma.FieldRef<"DataSourceConfig", 'Json'>;
    readonly transformSteps: Prisma.FieldRef<"DataSourceConfig", 'Json'>;
    readonly syncSchedule: Prisma.FieldRef<"DataSourceConfig", 'String'>;
    readonly createdAt: Prisma.FieldRef<"DataSourceConfig", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"DataSourceConfig", 'DateTime'>;
}
export type DataSourceConfigFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    include?: Prisma.DataSourceConfigInclude<ExtArgs> | null;
    where: Prisma.DataSourceConfigWhereUniqueInput;
};
export type DataSourceConfigFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    include?: Prisma.DataSourceConfigInclude<ExtArgs> | null;
    where: Prisma.DataSourceConfigWhereUniqueInput;
};
export type DataSourceConfigFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    include?: Prisma.DataSourceConfigInclude<ExtArgs> | null;
    where?: Prisma.DataSourceConfigWhereInput;
    orderBy?: Prisma.DataSourceConfigOrderByWithRelationInput | Prisma.DataSourceConfigOrderByWithRelationInput[];
    cursor?: Prisma.DataSourceConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DataSourceConfigScalarFieldEnum | Prisma.DataSourceConfigScalarFieldEnum[];
};
export type DataSourceConfigFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    include?: Prisma.DataSourceConfigInclude<ExtArgs> | null;
    where?: Prisma.DataSourceConfigWhereInput;
    orderBy?: Prisma.DataSourceConfigOrderByWithRelationInput | Prisma.DataSourceConfigOrderByWithRelationInput[];
    cursor?: Prisma.DataSourceConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DataSourceConfigScalarFieldEnum | Prisma.DataSourceConfigScalarFieldEnum[];
};
export type DataSourceConfigFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    include?: Prisma.DataSourceConfigInclude<ExtArgs> | null;
    where?: Prisma.DataSourceConfigWhereInput;
    orderBy?: Prisma.DataSourceConfigOrderByWithRelationInput | Prisma.DataSourceConfigOrderByWithRelationInput[];
    cursor?: Prisma.DataSourceConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DataSourceConfigScalarFieldEnum | Prisma.DataSourceConfigScalarFieldEnum[];
};
export type DataSourceConfigCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    include?: Prisma.DataSourceConfigInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DataSourceConfigCreateInput, Prisma.DataSourceConfigUncheckedCreateInput>;
};
export type DataSourceConfigCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.DataSourceConfigCreateManyInput | Prisma.DataSourceConfigCreateManyInput[];
    skipDuplicates?: boolean;
};
export type DataSourceConfigCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    data: Prisma.DataSourceConfigCreateManyInput | Prisma.DataSourceConfigCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.DataSourceConfigIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type DataSourceConfigUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    include?: Prisma.DataSourceConfigInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DataSourceConfigUpdateInput, Prisma.DataSourceConfigUncheckedUpdateInput>;
    where: Prisma.DataSourceConfigWhereUniqueInput;
};
export type DataSourceConfigUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.DataSourceConfigUpdateManyMutationInput, Prisma.DataSourceConfigUncheckedUpdateManyInput>;
    where?: Prisma.DataSourceConfigWhereInput;
    limit?: number;
};
export type DataSourceConfigUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DataSourceConfigUpdateManyMutationInput, Prisma.DataSourceConfigUncheckedUpdateManyInput>;
    where?: Prisma.DataSourceConfigWhereInput;
    limit?: number;
    include?: Prisma.DataSourceConfigIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type DataSourceConfigUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    include?: Prisma.DataSourceConfigInclude<ExtArgs> | null;
    where: Prisma.DataSourceConfigWhereUniqueInput;
    create: Prisma.XOR<Prisma.DataSourceConfigCreateInput, Prisma.DataSourceConfigUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.DataSourceConfigUpdateInput, Prisma.DataSourceConfigUncheckedUpdateInput>;
};
export type DataSourceConfigDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    include?: Prisma.DataSourceConfigInclude<ExtArgs> | null;
    where: Prisma.DataSourceConfigWhereUniqueInput;
};
export type DataSourceConfigDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataSourceConfigWhereInput;
    limit?: number;
};
export type DataSourceConfigDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceConfigSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceConfigOmit<ExtArgs> | null;
    include?: Prisma.DataSourceConfigInclude<ExtArgs> | null;
};
export {};

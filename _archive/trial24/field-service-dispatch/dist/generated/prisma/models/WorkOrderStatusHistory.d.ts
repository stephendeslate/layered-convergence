import type * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type WorkOrderStatusHistoryModel = runtime.Types.Result.DefaultSelection<Prisma.$WorkOrderStatusHistoryPayload>;
export type AggregateWorkOrderStatusHistory = {
    _count: WorkOrderStatusHistoryCountAggregateOutputType | null;
    _min: WorkOrderStatusHistoryMinAggregateOutputType | null;
    _max: WorkOrderStatusHistoryMaxAggregateOutputType | null;
};
export type WorkOrderStatusHistoryMinAggregateOutputType = {
    id: string | null;
    workOrderId: string | null;
    fromStatus: $Enums.WorkOrderStatus | null;
    toStatus: $Enums.WorkOrderStatus | null;
    note: string | null;
    createdAt: Date | null;
};
export type WorkOrderStatusHistoryMaxAggregateOutputType = {
    id: string | null;
    workOrderId: string | null;
    fromStatus: $Enums.WorkOrderStatus | null;
    toStatus: $Enums.WorkOrderStatus | null;
    note: string | null;
    createdAt: Date | null;
};
export type WorkOrderStatusHistoryCountAggregateOutputType = {
    id: number;
    workOrderId: number;
    fromStatus: number;
    toStatus: number;
    note: number;
    createdAt: number;
    _all: number;
};
export type WorkOrderStatusHistoryMinAggregateInputType = {
    id?: true;
    workOrderId?: true;
    fromStatus?: true;
    toStatus?: true;
    note?: true;
    createdAt?: true;
};
export type WorkOrderStatusHistoryMaxAggregateInputType = {
    id?: true;
    workOrderId?: true;
    fromStatus?: true;
    toStatus?: true;
    note?: true;
    createdAt?: true;
};
export type WorkOrderStatusHistoryCountAggregateInputType = {
    id?: true;
    workOrderId?: true;
    fromStatus?: true;
    toStatus?: true;
    note?: true;
    createdAt?: true;
    _all?: true;
};
export type WorkOrderStatusHistoryAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkOrderStatusHistoryWhereInput;
    orderBy?: Prisma.WorkOrderStatusHistoryOrderByWithRelationInput | Prisma.WorkOrderStatusHistoryOrderByWithRelationInput[];
    cursor?: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | WorkOrderStatusHistoryCountAggregateInputType;
    _min?: WorkOrderStatusHistoryMinAggregateInputType;
    _max?: WorkOrderStatusHistoryMaxAggregateInputType;
};
export type GetWorkOrderStatusHistoryAggregateType<T extends WorkOrderStatusHistoryAggregateArgs> = {
    [P in keyof T & keyof AggregateWorkOrderStatusHistory]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateWorkOrderStatusHistory[P]> : Prisma.GetScalarType<T[P], AggregateWorkOrderStatusHistory[P]>;
};
export type WorkOrderStatusHistoryGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkOrderStatusHistoryWhereInput;
    orderBy?: Prisma.WorkOrderStatusHistoryOrderByWithAggregationInput | Prisma.WorkOrderStatusHistoryOrderByWithAggregationInput[];
    by: Prisma.WorkOrderStatusHistoryScalarFieldEnum[] | Prisma.WorkOrderStatusHistoryScalarFieldEnum;
    having?: Prisma.WorkOrderStatusHistoryScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WorkOrderStatusHistoryCountAggregateInputType | true;
    _min?: WorkOrderStatusHistoryMinAggregateInputType;
    _max?: WorkOrderStatusHistoryMaxAggregateInputType;
};
export type WorkOrderStatusHistoryGroupByOutputType = {
    id: string;
    workOrderId: string;
    fromStatus: $Enums.WorkOrderStatus;
    toStatus: $Enums.WorkOrderStatus;
    note: string | null;
    createdAt: Date;
    _count: WorkOrderStatusHistoryCountAggregateOutputType | null;
    _min: WorkOrderStatusHistoryMinAggregateOutputType | null;
    _max: WorkOrderStatusHistoryMaxAggregateOutputType | null;
};
type GetWorkOrderStatusHistoryGroupByPayload<T extends WorkOrderStatusHistoryGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<WorkOrderStatusHistoryGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof WorkOrderStatusHistoryGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], WorkOrderStatusHistoryGroupByOutputType[P]> : Prisma.GetScalarType<T[P], WorkOrderStatusHistoryGroupByOutputType[P]>;
}>>;
export type WorkOrderStatusHistoryWhereInput = {
    AND?: Prisma.WorkOrderStatusHistoryWhereInput | Prisma.WorkOrderStatusHistoryWhereInput[];
    OR?: Prisma.WorkOrderStatusHistoryWhereInput[];
    NOT?: Prisma.WorkOrderStatusHistoryWhereInput | Prisma.WorkOrderStatusHistoryWhereInput[];
    id?: Prisma.UuidFilter<"WorkOrderStatusHistory"> | string;
    workOrderId?: Prisma.UuidFilter<"WorkOrderStatusHistory"> | string;
    fromStatus?: Prisma.EnumWorkOrderStatusFilter<"WorkOrderStatusHistory"> | $Enums.WorkOrderStatus;
    toStatus?: Prisma.EnumWorkOrderStatusFilter<"WorkOrderStatusHistory"> | $Enums.WorkOrderStatus;
    note?: Prisma.StringNullableFilter<"WorkOrderStatusHistory"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"WorkOrderStatusHistory"> | Date | string;
    workOrder?: Prisma.XOR<Prisma.WorkOrderScalarRelationFilter, Prisma.WorkOrderWhereInput>;
};
export type WorkOrderStatusHistoryOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    workOrderId?: Prisma.SortOrder;
    fromStatus?: Prisma.SortOrder;
    toStatus?: Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    workOrder?: Prisma.WorkOrderOrderByWithRelationInput;
};
export type WorkOrderStatusHistoryWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.WorkOrderStatusHistoryWhereInput | Prisma.WorkOrderStatusHistoryWhereInput[];
    OR?: Prisma.WorkOrderStatusHistoryWhereInput[];
    NOT?: Prisma.WorkOrderStatusHistoryWhereInput | Prisma.WorkOrderStatusHistoryWhereInput[];
    workOrderId?: Prisma.UuidFilter<"WorkOrderStatusHistory"> | string;
    fromStatus?: Prisma.EnumWorkOrderStatusFilter<"WorkOrderStatusHistory"> | $Enums.WorkOrderStatus;
    toStatus?: Prisma.EnumWorkOrderStatusFilter<"WorkOrderStatusHistory"> | $Enums.WorkOrderStatus;
    note?: Prisma.StringNullableFilter<"WorkOrderStatusHistory"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"WorkOrderStatusHistory"> | Date | string;
    workOrder?: Prisma.XOR<Prisma.WorkOrderScalarRelationFilter, Prisma.WorkOrderWhereInput>;
}, "id">;
export type WorkOrderStatusHistoryOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    workOrderId?: Prisma.SortOrder;
    fromStatus?: Prisma.SortOrder;
    toStatus?: Prisma.SortOrder;
    note?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    _count?: Prisma.WorkOrderStatusHistoryCountOrderByAggregateInput;
    _max?: Prisma.WorkOrderStatusHistoryMaxOrderByAggregateInput;
    _min?: Prisma.WorkOrderStatusHistoryMinOrderByAggregateInput;
};
export type WorkOrderStatusHistoryScalarWhereWithAggregatesInput = {
    AND?: Prisma.WorkOrderStatusHistoryScalarWhereWithAggregatesInput | Prisma.WorkOrderStatusHistoryScalarWhereWithAggregatesInput[];
    OR?: Prisma.WorkOrderStatusHistoryScalarWhereWithAggregatesInput[];
    NOT?: Prisma.WorkOrderStatusHistoryScalarWhereWithAggregatesInput | Prisma.WorkOrderStatusHistoryScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"WorkOrderStatusHistory"> | string;
    workOrderId?: Prisma.UuidWithAggregatesFilter<"WorkOrderStatusHistory"> | string;
    fromStatus?: Prisma.EnumWorkOrderStatusWithAggregatesFilter<"WorkOrderStatusHistory"> | $Enums.WorkOrderStatus;
    toStatus?: Prisma.EnumWorkOrderStatusWithAggregatesFilter<"WorkOrderStatusHistory"> | $Enums.WorkOrderStatus;
    note?: Prisma.StringNullableWithAggregatesFilter<"WorkOrderStatusHistory"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"WorkOrderStatusHistory"> | Date | string;
};
export type WorkOrderStatusHistoryCreateInput = {
    id?: string;
    fromStatus: $Enums.WorkOrderStatus;
    toStatus: $Enums.WorkOrderStatus;
    note?: string | null;
    createdAt?: Date | string;
    workOrder: Prisma.WorkOrderCreateNestedOneWithoutStatusHistoryInput;
};
export type WorkOrderStatusHistoryUncheckedCreateInput = {
    id?: string;
    workOrderId: string;
    fromStatus: $Enums.WorkOrderStatus;
    toStatus: $Enums.WorkOrderStatus;
    note?: string | null;
    createdAt?: Date | string;
};
export type WorkOrderStatusHistoryUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    fromStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    toStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    workOrder?: Prisma.WorkOrderUpdateOneRequiredWithoutStatusHistoryNestedInput;
};
export type WorkOrderStatusHistoryUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    workOrderId?: Prisma.StringFieldUpdateOperationsInput | string;
    fromStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    toStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkOrderStatusHistoryCreateManyInput = {
    id?: string;
    workOrderId: string;
    fromStatus: $Enums.WorkOrderStatus;
    toStatus: $Enums.WorkOrderStatus;
    note?: string | null;
    createdAt?: Date | string;
};
export type WorkOrderStatusHistoryUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    fromStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    toStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkOrderStatusHistoryUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    workOrderId?: Prisma.StringFieldUpdateOperationsInput | string;
    fromStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    toStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkOrderStatusHistoryListRelationFilter = {
    every?: Prisma.WorkOrderStatusHistoryWhereInput;
    some?: Prisma.WorkOrderStatusHistoryWhereInput;
    none?: Prisma.WorkOrderStatusHistoryWhereInput;
};
export type WorkOrderStatusHistoryOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type WorkOrderStatusHistoryCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    workOrderId?: Prisma.SortOrder;
    fromStatus?: Prisma.SortOrder;
    toStatus?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type WorkOrderStatusHistoryMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    workOrderId?: Prisma.SortOrder;
    fromStatus?: Prisma.SortOrder;
    toStatus?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type WorkOrderStatusHistoryMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    workOrderId?: Prisma.SortOrder;
    fromStatus?: Prisma.SortOrder;
    toStatus?: Prisma.SortOrder;
    note?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
};
export type WorkOrderStatusHistoryCreateNestedManyWithoutWorkOrderInput = {
    create?: Prisma.XOR<Prisma.WorkOrderStatusHistoryCreateWithoutWorkOrderInput, Prisma.WorkOrderStatusHistoryUncheckedCreateWithoutWorkOrderInput> | Prisma.WorkOrderStatusHistoryCreateWithoutWorkOrderInput[] | Prisma.WorkOrderStatusHistoryUncheckedCreateWithoutWorkOrderInput[];
    connectOrCreate?: Prisma.WorkOrderStatusHistoryCreateOrConnectWithoutWorkOrderInput | Prisma.WorkOrderStatusHistoryCreateOrConnectWithoutWorkOrderInput[];
    createMany?: Prisma.WorkOrderStatusHistoryCreateManyWorkOrderInputEnvelope;
    connect?: Prisma.WorkOrderStatusHistoryWhereUniqueInput | Prisma.WorkOrderStatusHistoryWhereUniqueInput[];
};
export type WorkOrderStatusHistoryUncheckedCreateNestedManyWithoutWorkOrderInput = {
    create?: Prisma.XOR<Prisma.WorkOrderStatusHistoryCreateWithoutWorkOrderInput, Prisma.WorkOrderStatusHistoryUncheckedCreateWithoutWorkOrderInput> | Prisma.WorkOrderStatusHistoryCreateWithoutWorkOrderInput[] | Prisma.WorkOrderStatusHistoryUncheckedCreateWithoutWorkOrderInput[];
    connectOrCreate?: Prisma.WorkOrderStatusHistoryCreateOrConnectWithoutWorkOrderInput | Prisma.WorkOrderStatusHistoryCreateOrConnectWithoutWorkOrderInput[];
    createMany?: Prisma.WorkOrderStatusHistoryCreateManyWorkOrderInputEnvelope;
    connect?: Prisma.WorkOrderStatusHistoryWhereUniqueInput | Prisma.WorkOrderStatusHistoryWhereUniqueInput[];
};
export type WorkOrderStatusHistoryUpdateManyWithoutWorkOrderNestedInput = {
    create?: Prisma.XOR<Prisma.WorkOrderStatusHistoryCreateWithoutWorkOrderInput, Prisma.WorkOrderStatusHistoryUncheckedCreateWithoutWorkOrderInput> | Prisma.WorkOrderStatusHistoryCreateWithoutWorkOrderInput[] | Prisma.WorkOrderStatusHistoryUncheckedCreateWithoutWorkOrderInput[];
    connectOrCreate?: Prisma.WorkOrderStatusHistoryCreateOrConnectWithoutWorkOrderInput | Prisma.WorkOrderStatusHistoryCreateOrConnectWithoutWorkOrderInput[];
    upsert?: Prisma.WorkOrderStatusHistoryUpsertWithWhereUniqueWithoutWorkOrderInput | Prisma.WorkOrderStatusHistoryUpsertWithWhereUniqueWithoutWorkOrderInput[];
    createMany?: Prisma.WorkOrderStatusHistoryCreateManyWorkOrderInputEnvelope;
    set?: Prisma.WorkOrderStatusHistoryWhereUniqueInput | Prisma.WorkOrderStatusHistoryWhereUniqueInput[];
    disconnect?: Prisma.WorkOrderStatusHistoryWhereUniqueInput | Prisma.WorkOrderStatusHistoryWhereUniqueInput[];
    delete?: Prisma.WorkOrderStatusHistoryWhereUniqueInput | Prisma.WorkOrderStatusHistoryWhereUniqueInput[];
    connect?: Prisma.WorkOrderStatusHistoryWhereUniqueInput | Prisma.WorkOrderStatusHistoryWhereUniqueInput[];
    update?: Prisma.WorkOrderStatusHistoryUpdateWithWhereUniqueWithoutWorkOrderInput | Prisma.WorkOrderStatusHistoryUpdateWithWhereUniqueWithoutWorkOrderInput[];
    updateMany?: Prisma.WorkOrderStatusHistoryUpdateManyWithWhereWithoutWorkOrderInput | Prisma.WorkOrderStatusHistoryUpdateManyWithWhereWithoutWorkOrderInput[];
    deleteMany?: Prisma.WorkOrderStatusHistoryScalarWhereInput | Prisma.WorkOrderStatusHistoryScalarWhereInput[];
};
export type WorkOrderStatusHistoryUncheckedUpdateManyWithoutWorkOrderNestedInput = {
    create?: Prisma.XOR<Prisma.WorkOrderStatusHistoryCreateWithoutWorkOrderInput, Prisma.WorkOrderStatusHistoryUncheckedCreateWithoutWorkOrderInput> | Prisma.WorkOrderStatusHistoryCreateWithoutWorkOrderInput[] | Prisma.WorkOrderStatusHistoryUncheckedCreateWithoutWorkOrderInput[];
    connectOrCreate?: Prisma.WorkOrderStatusHistoryCreateOrConnectWithoutWorkOrderInput | Prisma.WorkOrderStatusHistoryCreateOrConnectWithoutWorkOrderInput[];
    upsert?: Prisma.WorkOrderStatusHistoryUpsertWithWhereUniqueWithoutWorkOrderInput | Prisma.WorkOrderStatusHistoryUpsertWithWhereUniqueWithoutWorkOrderInput[];
    createMany?: Prisma.WorkOrderStatusHistoryCreateManyWorkOrderInputEnvelope;
    set?: Prisma.WorkOrderStatusHistoryWhereUniqueInput | Prisma.WorkOrderStatusHistoryWhereUniqueInput[];
    disconnect?: Prisma.WorkOrderStatusHistoryWhereUniqueInput | Prisma.WorkOrderStatusHistoryWhereUniqueInput[];
    delete?: Prisma.WorkOrderStatusHistoryWhereUniqueInput | Prisma.WorkOrderStatusHistoryWhereUniqueInput[];
    connect?: Prisma.WorkOrderStatusHistoryWhereUniqueInput | Prisma.WorkOrderStatusHistoryWhereUniqueInput[];
    update?: Prisma.WorkOrderStatusHistoryUpdateWithWhereUniqueWithoutWorkOrderInput | Prisma.WorkOrderStatusHistoryUpdateWithWhereUniqueWithoutWorkOrderInput[];
    updateMany?: Prisma.WorkOrderStatusHistoryUpdateManyWithWhereWithoutWorkOrderInput | Prisma.WorkOrderStatusHistoryUpdateManyWithWhereWithoutWorkOrderInput[];
    deleteMany?: Prisma.WorkOrderStatusHistoryScalarWhereInput | Prisma.WorkOrderStatusHistoryScalarWhereInput[];
};
export type WorkOrderStatusHistoryCreateWithoutWorkOrderInput = {
    id?: string;
    fromStatus: $Enums.WorkOrderStatus;
    toStatus: $Enums.WorkOrderStatus;
    note?: string | null;
    createdAt?: Date | string;
};
export type WorkOrderStatusHistoryUncheckedCreateWithoutWorkOrderInput = {
    id?: string;
    fromStatus: $Enums.WorkOrderStatus;
    toStatus: $Enums.WorkOrderStatus;
    note?: string | null;
    createdAt?: Date | string;
};
export type WorkOrderStatusHistoryCreateOrConnectWithoutWorkOrderInput = {
    where: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
    create: Prisma.XOR<Prisma.WorkOrderStatusHistoryCreateWithoutWorkOrderInput, Prisma.WorkOrderStatusHistoryUncheckedCreateWithoutWorkOrderInput>;
};
export type WorkOrderStatusHistoryCreateManyWorkOrderInputEnvelope = {
    data: Prisma.WorkOrderStatusHistoryCreateManyWorkOrderInput | Prisma.WorkOrderStatusHistoryCreateManyWorkOrderInput[];
    skipDuplicates?: boolean;
};
export type WorkOrderStatusHistoryUpsertWithWhereUniqueWithoutWorkOrderInput = {
    where: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
    update: Prisma.XOR<Prisma.WorkOrderStatusHistoryUpdateWithoutWorkOrderInput, Prisma.WorkOrderStatusHistoryUncheckedUpdateWithoutWorkOrderInput>;
    create: Prisma.XOR<Prisma.WorkOrderStatusHistoryCreateWithoutWorkOrderInput, Prisma.WorkOrderStatusHistoryUncheckedCreateWithoutWorkOrderInput>;
};
export type WorkOrderStatusHistoryUpdateWithWhereUniqueWithoutWorkOrderInput = {
    where: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
    data: Prisma.XOR<Prisma.WorkOrderStatusHistoryUpdateWithoutWorkOrderInput, Prisma.WorkOrderStatusHistoryUncheckedUpdateWithoutWorkOrderInput>;
};
export type WorkOrderStatusHistoryUpdateManyWithWhereWithoutWorkOrderInput = {
    where: Prisma.WorkOrderStatusHistoryScalarWhereInput;
    data: Prisma.XOR<Prisma.WorkOrderStatusHistoryUpdateManyMutationInput, Prisma.WorkOrderStatusHistoryUncheckedUpdateManyWithoutWorkOrderInput>;
};
export type WorkOrderStatusHistoryScalarWhereInput = {
    AND?: Prisma.WorkOrderStatusHistoryScalarWhereInput | Prisma.WorkOrderStatusHistoryScalarWhereInput[];
    OR?: Prisma.WorkOrderStatusHistoryScalarWhereInput[];
    NOT?: Prisma.WorkOrderStatusHistoryScalarWhereInput | Prisma.WorkOrderStatusHistoryScalarWhereInput[];
    id?: Prisma.UuidFilter<"WorkOrderStatusHistory"> | string;
    workOrderId?: Prisma.UuidFilter<"WorkOrderStatusHistory"> | string;
    fromStatus?: Prisma.EnumWorkOrderStatusFilter<"WorkOrderStatusHistory"> | $Enums.WorkOrderStatus;
    toStatus?: Prisma.EnumWorkOrderStatusFilter<"WorkOrderStatusHistory"> | $Enums.WorkOrderStatus;
    note?: Prisma.StringNullableFilter<"WorkOrderStatusHistory"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"WorkOrderStatusHistory"> | Date | string;
};
export type WorkOrderStatusHistoryCreateManyWorkOrderInput = {
    id?: string;
    fromStatus: $Enums.WorkOrderStatus;
    toStatus: $Enums.WorkOrderStatus;
    note?: string | null;
    createdAt?: Date | string;
};
export type WorkOrderStatusHistoryUpdateWithoutWorkOrderInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    fromStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    toStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkOrderStatusHistoryUncheckedUpdateWithoutWorkOrderInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    fromStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    toStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkOrderStatusHistoryUncheckedUpdateManyWithoutWorkOrderInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    fromStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    toStatus?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    note?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkOrderStatusHistorySelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    workOrderId?: boolean;
    fromStatus?: boolean;
    toStatus?: boolean;
    note?: boolean;
    createdAt?: boolean;
    workOrder?: boolean | Prisma.WorkOrderDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["workOrderStatusHistory"]>;
export type WorkOrderStatusHistorySelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    workOrderId?: boolean;
    fromStatus?: boolean;
    toStatus?: boolean;
    note?: boolean;
    createdAt?: boolean;
    workOrder?: boolean | Prisma.WorkOrderDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["workOrderStatusHistory"]>;
export type WorkOrderStatusHistorySelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    workOrderId?: boolean;
    fromStatus?: boolean;
    toStatus?: boolean;
    note?: boolean;
    createdAt?: boolean;
    workOrder?: boolean | Prisma.WorkOrderDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["workOrderStatusHistory"]>;
export type WorkOrderStatusHistorySelectScalar = {
    id?: boolean;
    workOrderId?: boolean;
    fromStatus?: boolean;
    toStatus?: boolean;
    note?: boolean;
    createdAt?: boolean;
};
export type WorkOrderStatusHistoryOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "workOrderId" | "fromStatus" | "toStatus" | "note" | "createdAt", ExtArgs["result"]["workOrderStatusHistory"]>;
export type WorkOrderStatusHistoryInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    workOrder?: boolean | Prisma.WorkOrderDefaultArgs<ExtArgs>;
};
export type WorkOrderStatusHistoryIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    workOrder?: boolean | Prisma.WorkOrderDefaultArgs<ExtArgs>;
};
export type WorkOrderStatusHistoryIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    workOrder?: boolean | Prisma.WorkOrderDefaultArgs<ExtArgs>;
};
export type $WorkOrderStatusHistoryPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "WorkOrderStatusHistory";
    objects: {
        workOrder: Prisma.$WorkOrderPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        workOrderId: string;
        fromStatus: $Enums.WorkOrderStatus;
        toStatus: $Enums.WorkOrderStatus;
        note: string | null;
        createdAt: Date;
    }, ExtArgs["result"]["workOrderStatusHistory"]>;
    composites: {};
};
export type WorkOrderStatusHistoryGetPayload<S extends boolean | null | undefined | WorkOrderStatusHistoryDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload, S>;
export type WorkOrderStatusHistoryCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<WorkOrderStatusHistoryFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: WorkOrderStatusHistoryCountAggregateInputType | true;
};
export interface WorkOrderStatusHistoryDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['WorkOrderStatusHistory'];
        meta: {
            name: 'WorkOrderStatusHistory';
        };
    };
    findUnique<T extends WorkOrderStatusHistoryFindUniqueArgs>(args: Prisma.SelectSubset<T, WorkOrderStatusHistoryFindUniqueArgs<ExtArgs>>): Prisma.Prisma__WorkOrderStatusHistoryClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends WorkOrderStatusHistoryFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, WorkOrderStatusHistoryFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__WorkOrderStatusHistoryClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends WorkOrderStatusHistoryFindFirstArgs>(args?: Prisma.SelectSubset<T, WorkOrderStatusHistoryFindFirstArgs<ExtArgs>>): Prisma.Prisma__WorkOrderStatusHistoryClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends WorkOrderStatusHistoryFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, WorkOrderStatusHistoryFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__WorkOrderStatusHistoryClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends WorkOrderStatusHistoryFindManyArgs>(args?: Prisma.SelectSubset<T, WorkOrderStatusHistoryFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends WorkOrderStatusHistoryCreateArgs>(args: Prisma.SelectSubset<T, WorkOrderStatusHistoryCreateArgs<ExtArgs>>): Prisma.Prisma__WorkOrderStatusHistoryClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends WorkOrderStatusHistoryCreateManyArgs>(args?: Prisma.SelectSubset<T, WorkOrderStatusHistoryCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends WorkOrderStatusHistoryCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, WorkOrderStatusHistoryCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends WorkOrderStatusHistoryDeleteArgs>(args: Prisma.SelectSubset<T, WorkOrderStatusHistoryDeleteArgs<ExtArgs>>): Prisma.Prisma__WorkOrderStatusHistoryClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends WorkOrderStatusHistoryUpdateArgs>(args: Prisma.SelectSubset<T, WorkOrderStatusHistoryUpdateArgs<ExtArgs>>): Prisma.Prisma__WorkOrderStatusHistoryClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends WorkOrderStatusHistoryDeleteManyArgs>(args?: Prisma.SelectSubset<T, WorkOrderStatusHistoryDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends WorkOrderStatusHistoryUpdateManyArgs>(args: Prisma.SelectSubset<T, WorkOrderStatusHistoryUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends WorkOrderStatusHistoryUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, WorkOrderStatusHistoryUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends WorkOrderStatusHistoryUpsertArgs>(args: Prisma.SelectSubset<T, WorkOrderStatusHistoryUpsertArgs<ExtArgs>>): Prisma.Prisma__WorkOrderStatusHistoryClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends WorkOrderStatusHistoryCountArgs>(args?: Prisma.Subset<T, WorkOrderStatusHistoryCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], WorkOrderStatusHistoryCountAggregateOutputType> : number>;
    aggregate<T extends WorkOrderStatusHistoryAggregateArgs>(args: Prisma.Subset<T, WorkOrderStatusHistoryAggregateArgs>): Prisma.PrismaPromise<GetWorkOrderStatusHistoryAggregateType<T>>;
    groupBy<T extends WorkOrderStatusHistoryGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: WorkOrderStatusHistoryGroupByArgs['orderBy'];
    } : {
        orderBy?: WorkOrderStatusHistoryGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, WorkOrderStatusHistoryGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkOrderStatusHistoryGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: WorkOrderStatusHistoryFieldRefs;
}
export interface Prisma__WorkOrderStatusHistoryClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    workOrder<T extends Prisma.WorkOrderDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.WorkOrderDefaultArgs<ExtArgs>>): Prisma.Prisma__WorkOrderClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface WorkOrderStatusHistoryFieldRefs {
    readonly id: Prisma.FieldRef<"WorkOrderStatusHistory", 'String'>;
    readonly workOrderId: Prisma.FieldRef<"WorkOrderStatusHistory", 'String'>;
    readonly fromStatus: Prisma.FieldRef<"WorkOrderStatusHistory", 'WorkOrderStatus'>;
    readonly toStatus: Prisma.FieldRef<"WorkOrderStatusHistory", 'WorkOrderStatus'>;
    readonly note: Prisma.FieldRef<"WorkOrderStatusHistory", 'String'>;
    readonly createdAt: Prisma.FieldRef<"WorkOrderStatusHistory", 'DateTime'>;
}
export type WorkOrderStatusHistoryFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderStatusHistoryInclude<ExtArgs> | null;
    where: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
};
export type WorkOrderStatusHistoryFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderStatusHistoryInclude<ExtArgs> | null;
    where: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
};
export type WorkOrderStatusHistoryFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderStatusHistoryInclude<ExtArgs> | null;
    where?: Prisma.WorkOrderStatusHistoryWhereInput;
    orderBy?: Prisma.WorkOrderStatusHistoryOrderByWithRelationInput | Prisma.WorkOrderStatusHistoryOrderByWithRelationInput[];
    cursor?: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WorkOrderStatusHistoryScalarFieldEnum | Prisma.WorkOrderStatusHistoryScalarFieldEnum[];
};
export type WorkOrderStatusHistoryFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderStatusHistoryInclude<ExtArgs> | null;
    where?: Prisma.WorkOrderStatusHistoryWhereInput;
    orderBy?: Prisma.WorkOrderStatusHistoryOrderByWithRelationInput | Prisma.WorkOrderStatusHistoryOrderByWithRelationInput[];
    cursor?: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WorkOrderStatusHistoryScalarFieldEnum | Prisma.WorkOrderStatusHistoryScalarFieldEnum[];
};
export type WorkOrderStatusHistoryFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderStatusHistoryInclude<ExtArgs> | null;
    where?: Prisma.WorkOrderStatusHistoryWhereInput;
    orderBy?: Prisma.WorkOrderStatusHistoryOrderByWithRelationInput | Prisma.WorkOrderStatusHistoryOrderByWithRelationInput[];
    cursor?: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WorkOrderStatusHistoryScalarFieldEnum | Prisma.WorkOrderStatusHistoryScalarFieldEnum[];
};
export type WorkOrderStatusHistoryCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderStatusHistoryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkOrderStatusHistoryCreateInput, Prisma.WorkOrderStatusHistoryUncheckedCreateInput>;
};
export type WorkOrderStatusHistoryCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.WorkOrderStatusHistoryCreateManyInput | Prisma.WorkOrderStatusHistoryCreateManyInput[];
    skipDuplicates?: boolean;
};
export type WorkOrderStatusHistoryCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    data: Prisma.WorkOrderStatusHistoryCreateManyInput | Prisma.WorkOrderStatusHistoryCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.WorkOrderStatusHistoryIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type WorkOrderStatusHistoryUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderStatusHistoryInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkOrderStatusHistoryUpdateInput, Prisma.WorkOrderStatusHistoryUncheckedUpdateInput>;
    where: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
};
export type WorkOrderStatusHistoryUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.WorkOrderStatusHistoryUpdateManyMutationInput, Prisma.WorkOrderStatusHistoryUncheckedUpdateManyInput>;
    where?: Prisma.WorkOrderStatusHistoryWhereInput;
    limit?: number;
};
export type WorkOrderStatusHistoryUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkOrderStatusHistoryUpdateManyMutationInput, Prisma.WorkOrderStatusHistoryUncheckedUpdateManyInput>;
    where?: Prisma.WorkOrderStatusHistoryWhereInput;
    limit?: number;
    include?: Prisma.WorkOrderStatusHistoryIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type WorkOrderStatusHistoryUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderStatusHistoryInclude<ExtArgs> | null;
    where: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
    create: Prisma.XOR<Prisma.WorkOrderStatusHistoryCreateInput, Prisma.WorkOrderStatusHistoryUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.WorkOrderStatusHistoryUpdateInput, Prisma.WorkOrderStatusHistoryUncheckedUpdateInput>;
};
export type WorkOrderStatusHistoryDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderStatusHistoryInclude<ExtArgs> | null;
    where: Prisma.WorkOrderStatusHistoryWhereUniqueInput;
};
export type WorkOrderStatusHistoryDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkOrderStatusHistoryWhereInput;
    limit?: number;
};
export type WorkOrderStatusHistoryDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderStatusHistorySelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderStatusHistoryOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderStatusHistoryInclude<ExtArgs> | null;
};
export {};

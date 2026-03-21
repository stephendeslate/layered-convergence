import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type DeadLetterEventModel = runtime.Types.Result.DefaultSelection<Prisma.$DeadLetterEventPayload>;
export type AggregateDeadLetterEvent = {
    _count: DeadLetterEventCountAggregateOutputType | null;
    _min: DeadLetterEventMinAggregateOutputType | null;
    _max: DeadLetterEventMaxAggregateOutputType | null;
};
export type DeadLetterEventMinAggregateOutputType = {
    id: string | null;
    dataSourceId: string | null;
    errorReason: string | null;
    createdAt: Date | null;
    retriedAt: Date | null;
};
export type DeadLetterEventMaxAggregateOutputType = {
    id: string | null;
    dataSourceId: string | null;
    errorReason: string | null;
    createdAt: Date | null;
    retriedAt: Date | null;
};
export type DeadLetterEventCountAggregateOutputType = {
    id: number;
    dataSourceId: number;
    payload: number;
    errorReason: number;
    createdAt: number;
    retriedAt: number;
    _all: number;
};
export type DeadLetterEventMinAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    errorReason?: true;
    createdAt?: true;
    retriedAt?: true;
};
export type DeadLetterEventMaxAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    errorReason?: true;
    createdAt?: true;
    retriedAt?: true;
};
export type DeadLetterEventCountAggregateInputType = {
    id?: true;
    dataSourceId?: true;
    payload?: true;
    errorReason?: true;
    createdAt?: true;
    retriedAt?: true;
    _all?: true;
};
export type DeadLetterEventAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DeadLetterEventWhereInput;
    orderBy?: Prisma.DeadLetterEventOrderByWithRelationInput | Prisma.DeadLetterEventOrderByWithRelationInput[];
    cursor?: Prisma.DeadLetterEventWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | DeadLetterEventCountAggregateInputType;
    _min?: DeadLetterEventMinAggregateInputType;
    _max?: DeadLetterEventMaxAggregateInputType;
};
export type GetDeadLetterEventAggregateType<T extends DeadLetterEventAggregateArgs> = {
    [P in keyof T & keyof AggregateDeadLetterEvent]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateDeadLetterEvent[P]> : Prisma.GetScalarType<T[P], AggregateDeadLetterEvent[P]>;
};
export type DeadLetterEventGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DeadLetterEventWhereInput;
    orderBy?: Prisma.DeadLetterEventOrderByWithAggregationInput | Prisma.DeadLetterEventOrderByWithAggregationInput[];
    by: Prisma.DeadLetterEventScalarFieldEnum[] | Prisma.DeadLetterEventScalarFieldEnum;
    having?: Prisma.DeadLetterEventScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: DeadLetterEventCountAggregateInputType | true;
    _min?: DeadLetterEventMinAggregateInputType;
    _max?: DeadLetterEventMaxAggregateInputType;
};
export type DeadLetterEventGroupByOutputType = {
    id: string;
    dataSourceId: string;
    payload: runtime.JsonValue;
    errorReason: string;
    createdAt: Date;
    retriedAt: Date | null;
    _count: DeadLetterEventCountAggregateOutputType | null;
    _min: DeadLetterEventMinAggregateOutputType | null;
    _max: DeadLetterEventMaxAggregateOutputType | null;
};
type GetDeadLetterEventGroupByPayload<T extends DeadLetterEventGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<DeadLetterEventGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof DeadLetterEventGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], DeadLetterEventGroupByOutputType[P]> : Prisma.GetScalarType<T[P], DeadLetterEventGroupByOutputType[P]>;
}>>;
export type DeadLetterEventWhereInput = {
    AND?: Prisma.DeadLetterEventWhereInput | Prisma.DeadLetterEventWhereInput[];
    OR?: Prisma.DeadLetterEventWhereInput[];
    NOT?: Prisma.DeadLetterEventWhereInput | Prisma.DeadLetterEventWhereInput[];
    id?: Prisma.UuidFilter<"DeadLetterEvent"> | string;
    dataSourceId?: Prisma.UuidFilter<"DeadLetterEvent"> | string;
    payload?: Prisma.JsonFilter<"DeadLetterEvent">;
    errorReason?: Prisma.StringFilter<"DeadLetterEvent"> | string;
    createdAt?: Prisma.DateTimeFilter<"DeadLetterEvent"> | Date | string;
    retriedAt?: Prisma.DateTimeNullableFilter<"DeadLetterEvent"> | Date | string | null;
    dataSource?: Prisma.XOR<Prisma.DataSourceScalarRelationFilter, Prisma.DataSourceWhereInput>;
};
export type DeadLetterEventOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    payload?: Prisma.SortOrder;
    errorReason?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    retriedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    dataSource?: Prisma.DataSourceOrderByWithRelationInput;
};
export type DeadLetterEventWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.DeadLetterEventWhereInput | Prisma.DeadLetterEventWhereInput[];
    OR?: Prisma.DeadLetterEventWhereInput[];
    NOT?: Prisma.DeadLetterEventWhereInput | Prisma.DeadLetterEventWhereInput[];
    dataSourceId?: Prisma.UuidFilter<"DeadLetterEvent"> | string;
    payload?: Prisma.JsonFilter<"DeadLetterEvent">;
    errorReason?: Prisma.StringFilter<"DeadLetterEvent"> | string;
    createdAt?: Prisma.DateTimeFilter<"DeadLetterEvent"> | Date | string;
    retriedAt?: Prisma.DateTimeNullableFilter<"DeadLetterEvent"> | Date | string | null;
    dataSource?: Prisma.XOR<Prisma.DataSourceScalarRelationFilter, Prisma.DataSourceWhereInput>;
}, "id">;
export type DeadLetterEventOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    payload?: Prisma.SortOrder;
    errorReason?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    retriedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    _count?: Prisma.DeadLetterEventCountOrderByAggregateInput;
    _max?: Prisma.DeadLetterEventMaxOrderByAggregateInput;
    _min?: Prisma.DeadLetterEventMinOrderByAggregateInput;
};
export type DeadLetterEventScalarWhereWithAggregatesInput = {
    AND?: Prisma.DeadLetterEventScalarWhereWithAggregatesInput | Prisma.DeadLetterEventScalarWhereWithAggregatesInput[];
    OR?: Prisma.DeadLetterEventScalarWhereWithAggregatesInput[];
    NOT?: Prisma.DeadLetterEventScalarWhereWithAggregatesInput | Prisma.DeadLetterEventScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"DeadLetterEvent"> | string;
    dataSourceId?: Prisma.UuidWithAggregatesFilter<"DeadLetterEvent"> | string;
    payload?: Prisma.JsonWithAggregatesFilter<"DeadLetterEvent">;
    errorReason?: Prisma.StringWithAggregatesFilter<"DeadLetterEvent"> | string;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"DeadLetterEvent"> | Date | string;
    retriedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"DeadLetterEvent"> | Date | string | null;
};
export type DeadLetterEventCreateInput = {
    id?: string;
    payload: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason: string;
    createdAt?: Date | string;
    retriedAt?: Date | string | null;
    dataSource: Prisma.DataSourceCreateNestedOneWithoutDeadLetterEventsInput;
};
export type DeadLetterEventUncheckedCreateInput = {
    id?: string;
    dataSourceId: string;
    payload: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason: string;
    createdAt?: Date | string;
    retriedAt?: Date | string | null;
};
export type DeadLetterEventUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    retriedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    dataSource?: Prisma.DataSourceUpdateOneRequiredWithoutDeadLetterEventsNestedInput;
};
export type DeadLetterEventUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    retriedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type DeadLetterEventCreateManyInput = {
    id?: string;
    dataSourceId: string;
    payload: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason: string;
    createdAt?: Date | string;
    retriedAt?: Date | string | null;
};
export type DeadLetterEventUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    retriedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type DeadLetterEventUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dataSourceId?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    retriedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type DeadLetterEventListRelationFilter = {
    every?: Prisma.DeadLetterEventWhereInput;
    some?: Prisma.DeadLetterEventWhereInput;
    none?: Prisma.DeadLetterEventWhereInput;
};
export type DeadLetterEventOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type DeadLetterEventCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    payload?: Prisma.SortOrder;
    errorReason?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    retriedAt?: Prisma.SortOrder;
};
export type DeadLetterEventMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    errorReason?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    retriedAt?: Prisma.SortOrder;
};
export type DeadLetterEventMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dataSourceId?: Prisma.SortOrder;
    errorReason?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    retriedAt?: Prisma.SortOrder;
};
export type DeadLetterEventCreateNestedManyWithoutDataSourceInput = {
    create?: Prisma.XOR<Prisma.DeadLetterEventCreateWithoutDataSourceInput, Prisma.DeadLetterEventUncheckedCreateWithoutDataSourceInput> | Prisma.DeadLetterEventCreateWithoutDataSourceInput[] | Prisma.DeadLetterEventUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.DeadLetterEventCreateOrConnectWithoutDataSourceInput | Prisma.DeadLetterEventCreateOrConnectWithoutDataSourceInput[];
    createMany?: Prisma.DeadLetterEventCreateManyDataSourceInputEnvelope;
    connect?: Prisma.DeadLetterEventWhereUniqueInput | Prisma.DeadLetterEventWhereUniqueInput[];
};
export type DeadLetterEventUncheckedCreateNestedManyWithoutDataSourceInput = {
    create?: Prisma.XOR<Prisma.DeadLetterEventCreateWithoutDataSourceInput, Prisma.DeadLetterEventUncheckedCreateWithoutDataSourceInput> | Prisma.DeadLetterEventCreateWithoutDataSourceInput[] | Prisma.DeadLetterEventUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.DeadLetterEventCreateOrConnectWithoutDataSourceInput | Prisma.DeadLetterEventCreateOrConnectWithoutDataSourceInput[];
    createMany?: Prisma.DeadLetterEventCreateManyDataSourceInputEnvelope;
    connect?: Prisma.DeadLetterEventWhereUniqueInput | Prisma.DeadLetterEventWhereUniqueInput[];
};
export type DeadLetterEventUpdateManyWithoutDataSourceNestedInput = {
    create?: Prisma.XOR<Prisma.DeadLetterEventCreateWithoutDataSourceInput, Prisma.DeadLetterEventUncheckedCreateWithoutDataSourceInput> | Prisma.DeadLetterEventCreateWithoutDataSourceInput[] | Prisma.DeadLetterEventUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.DeadLetterEventCreateOrConnectWithoutDataSourceInput | Prisma.DeadLetterEventCreateOrConnectWithoutDataSourceInput[];
    upsert?: Prisma.DeadLetterEventUpsertWithWhereUniqueWithoutDataSourceInput | Prisma.DeadLetterEventUpsertWithWhereUniqueWithoutDataSourceInput[];
    createMany?: Prisma.DeadLetterEventCreateManyDataSourceInputEnvelope;
    set?: Prisma.DeadLetterEventWhereUniqueInput | Prisma.DeadLetterEventWhereUniqueInput[];
    disconnect?: Prisma.DeadLetterEventWhereUniqueInput | Prisma.DeadLetterEventWhereUniqueInput[];
    delete?: Prisma.DeadLetterEventWhereUniqueInput | Prisma.DeadLetterEventWhereUniqueInput[];
    connect?: Prisma.DeadLetterEventWhereUniqueInput | Prisma.DeadLetterEventWhereUniqueInput[];
    update?: Prisma.DeadLetterEventUpdateWithWhereUniqueWithoutDataSourceInput | Prisma.DeadLetterEventUpdateWithWhereUniqueWithoutDataSourceInput[];
    updateMany?: Prisma.DeadLetterEventUpdateManyWithWhereWithoutDataSourceInput | Prisma.DeadLetterEventUpdateManyWithWhereWithoutDataSourceInput[];
    deleteMany?: Prisma.DeadLetterEventScalarWhereInput | Prisma.DeadLetterEventScalarWhereInput[];
};
export type DeadLetterEventUncheckedUpdateManyWithoutDataSourceNestedInput = {
    create?: Prisma.XOR<Prisma.DeadLetterEventCreateWithoutDataSourceInput, Prisma.DeadLetterEventUncheckedCreateWithoutDataSourceInput> | Prisma.DeadLetterEventCreateWithoutDataSourceInput[] | Prisma.DeadLetterEventUncheckedCreateWithoutDataSourceInput[];
    connectOrCreate?: Prisma.DeadLetterEventCreateOrConnectWithoutDataSourceInput | Prisma.DeadLetterEventCreateOrConnectWithoutDataSourceInput[];
    upsert?: Prisma.DeadLetterEventUpsertWithWhereUniqueWithoutDataSourceInput | Prisma.DeadLetterEventUpsertWithWhereUniqueWithoutDataSourceInput[];
    createMany?: Prisma.DeadLetterEventCreateManyDataSourceInputEnvelope;
    set?: Prisma.DeadLetterEventWhereUniqueInput | Prisma.DeadLetterEventWhereUniqueInput[];
    disconnect?: Prisma.DeadLetterEventWhereUniqueInput | Prisma.DeadLetterEventWhereUniqueInput[];
    delete?: Prisma.DeadLetterEventWhereUniqueInput | Prisma.DeadLetterEventWhereUniqueInput[];
    connect?: Prisma.DeadLetterEventWhereUniqueInput | Prisma.DeadLetterEventWhereUniqueInput[];
    update?: Prisma.DeadLetterEventUpdateWithWhereUniqueWithoutDataSourceInput | Prisma.DeadLetterEventUpdateWithWhereUniqueWithoutDataSourceInput[];
    updateMany?: Prisma.DeadLetterEventUpdateManyWithWhereWithoutDataSourceInput | Prisma.DeadLetterEventUpdateManyWithWhereWithoutDataSourceInput[];
    deleteMany?: Prisma.DeadLetterEventScalarWhereInput | Prisma.DeadLetterEventScalarWhereInput[];
};
export type DeadLetterEventCreateWithoutDataSourceInput = {
    id?: string;
    payload: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason: string;
    createdAt?: Date | string;
    retriedAt?: Date | string | null;
};
export type DeadLetterEventUncheckedCreateWithoutDataSourceInput = {
    id?: string;
    payload: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason: string;
    createdAt?: Date | string;
    retriedAt?: Date | string | null;
};
export type DeadLetterEventCreateOrConnectWithoutDataSourceInput = {
    where: Prisma.DeadLetterEventWhereUniqueInput;
    create: Prisma.XOR<Prisma.DeadLetterEventCreateWithoutDataSourceInput, Prisma.DeadLetterEventUncheckedCreateWithoutDataSourceInput>;
};
export type DeadLetterEventCreateManyDataSourceInputEnvelope = {
    data: Prisma.DeadLetterEventCreateManyDataSourceInput | Prisma.DeadLetterEventCreateManyDataSourceInput[];
    skipDuplicates?: boolean;
};
export type DeadLetterEventUpsertWithWhereUniqueWithoutDataSourceInput = {
    where: Prisma.DeadLetterEventWhereUniqueInput;
    update: Prisma.XOR<Prisma.DeadLetterEventUpdateWithoutDataSourceInput, Prisma.DeadLetterEventUncheckedUpdateWithoutDataSourceInput>;
    create: Prisma.XOR<Prisma.DeadLetterEventCreateWithoutDataSourceInput, Prisma.DeadLetterEventUncheckedCreateWithoutDataSourceInput>;
};
export type DeadLetterEventUpdateWithWhereUniqueWithoutDataSourceInput = {
    where: Prisma.DeadLetterEventWhereUniqueInput;
    data: Prisma.XOR<Prisma.DeadLetterEventUpdateWithoutDataSourceInput, Prisma.DeadLetterEventUncheckedUpdateWithoutDataSourceInput>;
};
export type DeadLetterEventUpdateManyWithWhereWithoutDataSourceInput = {
    where: Prisma.DeadLetterEventScalarWhereInput;
    data: Prisma.XOR<Prisma.DeadLetterEventUpdateManyMutationInput, Prisma.DeadLetterEventUncheckedUpdateManyWithoutDataSourceInput>;
};
export type DeadLetterEventScalarWhereInput = {
    AND?: Prisma.DeadLetterEventScalarWhereInput | Prisma.DeadLetterEventScalarWhereInput[];
    OR?: Prisma.DeadLetterEventScalarWhereInput[];
    NOT?: Prisma.DeadLetterEventScalarWhereInput | Prisma.DeadLetterEventScalarWhereInput[];
    id?: Prisma.UuidFilter<"DeadLetterEvent"> | string;
    dataSourceId?: Prisma.UuidFilter<"DeadLetterEvent"> | string;
    payload?: Prisma.JsonFilter<"DeadLetterEvent">;
    errorReason?: Prisma.StringFilter<"DeadLetterEvent"> | string;
    createdAt?: Prisma.DateTimeFilter<"DeadLetterEvent"> | Date | string;
    retriedAt?: Prisma.DateTimeNullableFilter<"DeadLetterEvent"> | Date | string | null;
};
export type DeadLetterEventCreateManyDataSourceInput = {
    id?: string;
    payload: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason: string;
    createdAt?: Date | string;
    retriedAt?: Date | string | null;
};
export type DeadLetterEventUpdateWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    retriedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type DeadLetterEventUncheckedUpdateWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    retriedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type DeadLetterEventUncheckedUpdateManyWithoutDataSourceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    payload?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    errorReason?: Prisma.StringFieldUpdateOperationsInput | string;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    retriedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
};
export type DeadLetterEventSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    payload?: boolean;
    errorReason?: boolean;
    createdAt?: boolean;
    retriedAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["deadLetterEvent"]>;
export type DeadLetterEventSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    payload?: boolean;
    errorReason?: boolean;
    createdAt?: boolean;
    retriedAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["deadLetterEvent"]>;
export type DeadLetterEventSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dataSourceId?: boolean;
    payload?: boolean;
    errorReason?: boolean;
    createdAt?: boolean;
    retriedAt?: boolean;
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["deadLetterEvent"]>;
export type DeadLetterEventSelectScalar = {
    id?: boolean;
    dataSourceId?: boolean;
    payload?: boolean;
    errorReason?: boolean;
    createdAt?: boolean;
    retriedAt?: boolean;
};
export type DeadLetterEventOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "dataSourceId" | "payload" | "errorReason" | "createdAt" | "retriedAt", ExtArgs["result"]["deadLetterEvent"]>;
export type DeadLetterEventInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
};
export type DeadLetterEventIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
};
export type DeadLetterEventIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dataSource?: boolean | Prisma.DataSourceDefaultArgs<ExtArgs>;
};
export type $DeadLetterEventPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "DeadLetterEvent";
    objects: {
        dataSource: Prisma.$DataSourcePayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        dataSourceId: string;
        payload: runtime.JsonValue;
        errorReason: string;
        createdAt: Date;
        retriedAt: Date | null;
    }, ExtArgs["result"]["deadLetterEvent"]>;
    composites: {};
};
export type DeadLetterEventGetPayload<S extends boolean | null | undefined | DeadLetterEventDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload, S>;
export type DeadLetterEventCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<DeadLetterEventFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: DeadLetterEventCountAggregateInputType | true;
};
export interface DeadLetterEventDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['DeadLetterEvent'];
        meta: {
            name: 'DeadLetterEvent';
        };
    };
    findUnique<T extends DeadLetterEventFindUniqueArgs>(args: Prisma.SelectSubset<T, DeadLetterEventFindUniqueArgs<ExtArgs>>): Prisma.Prisma__DeadLetterEventClient<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends DeadLetterEventFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, DeadLetterEventFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__DeadLetterEventClient<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends DeadLetterEventFindFirstArgs>(args?: Prisma.SelectSubset<T, DeadLetterEventFindFirstArgs<ExtArgs>>): Prisma.Prisma__DeadLetterEventClient<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends DeadLetterEventFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, DeadLetterEventFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__DeadLetterEventClient<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends DeadLetterEventFindManyArgs>(args?: Prisma.SelectSubset<T, DeadLetterEventFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends DeadLetterEventCreateArgs>(args: Prisma.SelectSubset<T, DeadLetterEventCreateArgs<ExtArgs>>): Prisma.Prisma__DeadLetterEventClient<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends DeadLetterEventCreateManyArgs>(args?: Prisma.SelectSubset<T, DeadLetterEventCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends DeadLetterEventCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, DeadLetterEventCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends DeadLetterEventDeleteArgs>(args: Prisma.SelectSubset<T, DeadLetterEventDeleteArgs<ExtArgs>>): Prisma.Prisma__DeadLetterEventClient<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends DeadLetterEventUpdateArgs>(args: Prisma.SelectSubset<T, DeadLetterEventUpdateArgs<ExtArgs>>): Prisma.Prisma__DeadLetterEventClient<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends DeadLetterEventDeleteManyArgs>(args?: Prisma.SelectSubset<T, DeadLetterEventDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends DeadLetterEventUpdateManyArgs>(args: Prisma.SelectSubset<T, DeadLetterEventUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends DeadLetterEventUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, DeadLetterEventUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends DeadLetterEventUpsertArgs>(args: Prisma.SelectSubset<T, DeadLetterEventUpsertArgs<ExtArgs>>): Prisma.Prisma__DeadLetterEventClient<runtime.Types.Result.GetResult<Prisma.$DeadLetterEventPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends DeadLetterEventCountArgs>(args?: Prisma.Subset<T, DeadLetterEventCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], DeadLetterEventCountAggregateOutputType> : number>;
    aggregate<T extends DeadLetterEventAggregateArgs>(args: Prisma.Subset<T, DeadLetterEventAggregateArgs>): Prisma.PrismaPromise<GetDeadLetterEventAggregateType<T>>;
    groupBy<T extends DeadLetterEventGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: DeadLetterEventGroupByArgs['orderBy'];
    } : {
        orderBy?: DeadLetterEventGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, DeadLetterEventGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetDeadLetterEventGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: DeadLetterEventFieldRefs;
}
export interface Prisma__DeadLetterEventClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    dataSource<T extends Prisma.DataSourceDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DataSourceDefaultArgs<ExtArgs>>): Prisma.Prisma__DataSourceClient<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface DeadLetterEventFieldRefs {
    readonly id: Prisma.FieldRef<"DeadLetterEvent", 'String'>;
    readonly dataSourceId: Prisma.FieldRef<"DeadLetterEvent", 'String'>;
    readonly payload: Prisma.FieldRef<"DeadLetterEvent", 'Json'>;
    readonly errorReason: Prisma.FieldRef<"DeadLetterEvent", 'String'>;
    readonly createdAt: Prisma.FieldRef<"DeadLetterEvent", 'DateTime'>;
    readonly retriedAt: Prisma.FieldRef<"DeadLetterEvent", 'DateTime'>;
}
export type DeadLetterEventFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeadLetterEventSelect<ExtArgs> | null;
    omit?: Prisma.DeadLetterEventOmit<ExtArgs> | null;
    include?: Prisma.DeadLetterEventInclude<ExtArgs> | null;
    where: Prisma.DeadLetterEventWhereUniqueInput;
};
export type DeadLetterEventFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeadLetterEventSelect<ExtArgs> | null;
    omit?: Prisma.DeadLetterEventOmit<ExtArgs> | null;
    include?: Prisma.DeadLetterEventInclude<ExtArgs> | null;
    where: Prisma.DeadLetterEventWhereUniqueInput;
};
export type DeadLetterEventFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type DeadLetterEventFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type DeadLetterEventFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type DeadLetterEventCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeadLetterEventSelect<ExtArgs> | null;
    omit?: Prisma.DeadLetterEventOmit<ExtArgs> | null;
    include?: Prisma.DeadLetterEventInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DeadLetterEventCreateInput, Prisma.DeadLetterEventUncheckedCreateInput>;
};
export type DeadLetterEventCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.DeadLetterEventCreateManyInput | Prisma.DeadLetterEventCreateManyInput[];
    skipDuplicates?: boolean;
};
export type DeadLetterEventCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeadLetterEventSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DeadLetterEventOmit<ExtArgs> | null;
    data: Prisma.DeadLetterEventCreateManyInput | Prisma.DeadLetterEventCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.DeadLetterEventIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type DeadLetterEventUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeadLetterEventSelect<ExtArgs> | null;
    omit?: Prisma.DeadLetterEventOmit<ExtArgs> | null;
    include?: Prisma.DeadLetterEventInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DeadLetterEventUpdateInput, Prisma.DeadLetterEventUncheckedUpdateInput>;
    where: Prisma.DeadLetterEventWhereUniqueInput;
};
export type DeadLetterEventUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.DeadLetterEventUpdateManyMutationInput, Prisma.DeadLetterEventUncheckedUpdateManyInput>;
    where?: Prisma.DeadLetterEventWhereInput;
    limit?: number;
};
export type DeadLetterEventUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeadLetterEventSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.DeadLetterEventOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.DeadLetterEventUpdateManyMutationInput, Prisma.DeadLetterEventUncheckedUpdateManyInput>;
    where?: Prisma.DeadLetterEventWhereInput;
    limit?: number;
    include?: Prisma.DeadLetterEventIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type DeadLetterEventUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeadLetterEventSelect<ExtArgs> | null;
    omit?: Prisma.DeadLetterEventOmit<ExtArgs> | null;
    include?: Prisma.DeadLetterEventInclude<ExtArgs> | null;
    where: Prisma.DeadLetterEventWhereUniqueInput;
    create: Prisma.XOR<Prisma.DeadLetterEventCreateInput, Prisma.DeadLetterEventUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.DeadLetterEventUpdateInput, Prisma.DeadLetterEventUncheckedUpdateInput>;
};
export type DeadLetterEventDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeadLetterEventSelect<ExtArgs> | null;
    omit?: Prisma.DeadLetterEventOmit<ExtArgs> | null;
    include?: Prisma.DeadLetterEventInclude<ExtArgs> | null;
    where: Prisma.DeadLetterEventWhereUniqueInput;
};
export type DeadLetterEventDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DeadLetterEventWhereInput;
    limit?: number;
};
export type DeadLetterEventDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DeadLetterEventSelect<ExtArgs> | null;
    omit?: Prisma.DeadLetterEventOmit<ExtArgs> | null;
    include?: Prisma.DeadLetterEventInclude<ExtArgs> | null;
};
export {};

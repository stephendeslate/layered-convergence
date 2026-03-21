import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type EmbedConfigModel = runtime.Types.Result.DefaultSelection<Prisma.$EmbedConfigPayload>;
export type AggregateEmbedConfig = {
    _count: EmbedConfigCountAggregateOutputType | null;
    _min: EmbedConfigMinAggregateOutputType | null;
    _max: EmbedConfigMaxAggregateOutputType | null;
};
export type EmbedConfigMinAggregateOutputType = {
    id: string | null;
    dashboardId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type EmbedConfigMaxAggregateOutputType = {
    id: string | null;
    dashboardId: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type EmbedConfigCountAggregateOutputType = {
    id: number;
    dashboardId: number;
    allowedOrigins: number;
    themeOverrides: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type EmbedConfigMinAggregateInputType = {
    id?: true;
    dashboardId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type EmbedConfigMaxAggregateInputType = {
    id?: true;
    dashboardId?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type EmbedConfigCountAggregateInputType = {
    id?: true;
    dashboardId?: true;
    allowedOrigins?: true;
    themeOverrides?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type EmbedConfigAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EmbedConfigWhereInput;
    orderBy?: Prisma.EmbedConfigOrderByWithRelationInput | Prisma.EmbedConfigOrderByWithRelationInput[];
    cursor?: Prisma.EmbedConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | EmbedConfigCountAggregateInputType;
    _min?: EmbedConfigMinAggregateInputType;
    _max?: EmbedConfigMaxAggregateInputType;
};
export type GetEmbedConfigAggregateType<T extends EmbedConfigAggregateArgs> = {
    [P in keyof T & keyof AggregateEmbedConfig]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateEmbedConfig[P]> : Prisma.GetScalarType<T[P], AggregateEmbedConfig[P]>;
};
export type EmbedConfigGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EmbedConfigWhereInput;
    orderBy?: Prisma.EmbedConfigOrderByWithAggregationInput | Prisma.EmbedConfigOrderByWithAggregationInput[];
    by: Prisma.EmbedConfigScalarFieldEnum[] | Prisma.EmbedConfigScalarFieldEnum;
    having?: Prisma.EmbedConfigScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: EmbedConfigCountAggregateInputType | true;
    _min?: EmbedConfigMinAggregateInputType;
    _max?: EmbedConfigMaxAggregateInputType;
};
export type EmbedConfigGroupByOutputType = {
    id: string;
    dashboardId: string;
    allowedOrigins: string[];
    themeOverrides: runtime.JsonValue | null;
    createdAt: Date;
    updatedAt: Date;
    _count: EmbedConfigCountAggregateOutputType | null;
    _min: EmbedConfigMinAggregateOutputType | null;
    _max: EmbedConfigMaxAggregateOutputType | null;
};
type GetEmbedConfigGroupByPayload<T extends EmbedConfigGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<EmbedConfigGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof EmbedConfigGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], EmbedConfigGroupByOutputType[P]> : Prisma.GetScalarType<T[P], EmbedConfigGroupByOutputType[P]>;
}>>;
export type EmbedConfigWhereInput = {
    AND?: Prisma.EmbedConfigWhereInput | Prisma.EmbedConfigWhereInput[];
    OR?: Prisma.EmbedConfigWhereInput[];
    NOT?: Prisma.EmbedConfigWhereInput | Prisma.EmbedConfigWhereInput[];
    id?: Prisma.UuidFilter<"EmbedConfig"> | string;
    dashboardId?: Prisma.UuidFilter<"EmbedConfig"> | string;
    allowedOrigins?: Prisma.StringNullableListFilter<"EmbedConfig">;
    themeOverrides?: Prisma.JsonNullableFilter<"EmbedConfig">;
    createdAt?: Prisma.DateTimeFilter<"EmbedConfig"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"EmbedConfig"> | Date | string;
    dashboard?: Prisma.XOR<Prisma.DashboardScalarRelationFilter, Prisma.DashboardWhereInput>;
};
export type EmbedConfigOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    dashboardId?: Prisma.SortOrder;
    allowedOrigins?: Prisma.SortOrder;
    themeOverrides?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    dashboard?: Prisma.DashboardOrderByWithRelationInput;
};
export type EmbedConfigWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    dashboardId?: string;
    AND?: Prisma.EmbedConfigWhereInput | Prisma.EmbedConfigWhereInput[];
    OR?: Prisma.EmbedConfigWhereInput[];
    NOT?: Prisma.EmbedConfigWhereInput | Prisma.EmbedConfigWhereInput[];
    allowedOrigins?: Prisma.StringNullableListFilter<"EmbedConfig">;
    themeOverrides?: Prisma.JsonNullableFilter<"EmbedConfig">;
    createdAt?: Prisma.DateTimeFilter<"EmbedConfig"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"EmbedConfig"> | Date | string;
    dashboard?: Prisma.XOR<Prisma.DashboardScalarRelationFilter, Prisma.DashboardWhereInput>;
}, "id" | "dashboardId">;
export type EmbedConfigOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    dashboardId?: Prisma.SortOrder;
    allowedOrigins?: Prisma.SortOrder;
    themeOverrides?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.EmbedConfigCountOrderByAggregateInput;
    _max?: Prisma.EmbedConfigMaxOrderByAggregateInput;
    _min?: Prisma.EmbedConfigMinOrderByAggregateInput;
};
export type EmbedConfigScalarWhereWithAggregatesInput = {
    AND?: Prisma.EmbedConfigScalarWhereWithAggregatesInput | Prisma.EmbedConfigScalarWhereWithAggregatesInput[];
    OR?: Prisma.EmbedConfigScalarWhereWithAggregatesInput[];
    NOT?: Prisma.EmbedConfigScalarWhereWithAggregatesInput | Prisma.EmbedConfigScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"EmbedConfig"> | string;
    dashboardId?: Prisma.UuidWithAggregatesFilter<"EmbedConfig"> | string;
    allowedOrigins?: Prisma.StringNullableListFilter<"EmbedConfig">;
    themeOverrides?: Prisma.JsonNullableWithAggregatesFilter<"EmbedConfig">;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"EmbedConfig"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"EmbedConfig"> | Date | string;
};
export type EmbedConfigCreateInput = {
    id?: string;
    allowedOrigins?: Prisma.EmbedConfigCreateallowedOriginsInput | string[];
    themeOverrides?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dashboard: Prisma.DashboardCreateNestedOneWithoutEmbedConfigInput;
};
export type EmbedConfigUncheckedCreateInput = {
    id?: string;
    dashboardId: string;
    allowedOrigins?: Prisma.EmbedConfigCreateallowedOriginsInput | string[];
    themeOverrides?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type EmbedConfigUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    allowedOrigins?: Prisma.EmbedConfigUpdateallowedOriginsInput | string[];
    themeOverrides?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dashboard?: Prisma.DashboardUpdateOneRequiredWithoutEmbedConfigNestedInput;
};
export type EmbedConfigUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dashboardId?: Prisma.StringFieldUpdateOperationsInput | string;
    allowedOrigins?: Prisma.EmbedConfigUpdateallowedOriginsInput | string[];
    themeOverrides?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EmbedConfigCreateManyInput = {
    id?: string;
    dashboardId: string;
    allowedOrigins?: Prisma.EmbedConfigCreateallowedOriginsInput | string[];
    themeOverrides?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type EmbedConfigUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    allowedOrigins?: Prisma.EmbedConfigUpdateallowedOriginsInput | string[];
    themeOverrides?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EmbedConfigUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    dashboardId?: Prisma.StringFieldUpdateOperationsInput | string;
    allowedOrigins?: Prisma.EmbedConfigUpdateallowedOriginsInput | string[];
    themeOverrides?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EmbedConfigNullableScalarRelationFilter = {
    is?: Prisma.EmbedConfigWhereInput | null;
    isNot?: Prisma.EmbedConfigWhereInput | null;
};
export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type EmbedConfigCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dashboardId?: Prisma.SortOrder;
    allowedOrigins?: Prisma.SortOrder;
    themeOverrides?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type EmbedConfigMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dashboardId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type EmbedConfigMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    dashboardId?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type EmbedConfigCreateNestedOneWithoutDashboardInput = {
    create?: Prisma.XOR<Prisma.EmbedConfigCreateWithoutDashboardInput, Prisma.EmbedConfigUncheckedCreateWithoutDashboardInput>;
    connectOrCreate?: Prisma.EmbedConfigCreateOrConnectWithoutDashboardInput;
    connect?: Prisma.EmbedConfigWhereUniqueInput;
};
export type EmbedConfigUncheckedCreateNestedOneWithoutDashboardInput = {
    create?: Prisma.XOR<Prisma.EmbedConfigCreateWithoutDashboardInput, Prisma.EmbedConfigUncheckedCreateWithoutDashboardInput>;
    connectOrCreate?: Prisma.EmbedConfigCreateOrConnectWithoutDashboardInput;
    connect?: Prisma.EmbedConfigWhereUniqueInput;
};
export type EmbedConfigUpdateOneWithoutDashboardNestedInput = {
    create?: Prisma.XOR<Prisma.EmbedConfigCreateWithoutDashboardInput, Prisma.EmbedConfigUncheckedCreateWithoutDashboardInput>;
    connectOrCreate?: Prisma.EmbedConfigCreateOrConnectWithoutDashboardInput;
    upsert?: Prisma.EmbedConfigUpsertWithoutDashboardInput;
    disconnect?: Prisma.EmbedConfigWhereInput | boolean;
    delete?: Prisma.EmbedConfigWhereInput | boolean;
    connect?: Prisma.EmbedConfigWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EmbedConfigUpdateToOneWithWhereWithoutDashboardInput, Prisma.EmbedConfigUpdateWithoutDashboardInput>, Prisma.EmbedConfigUncheckedUpdateWithoutDashboardInput>;
};
export type EmbedConfigUncheckedUpdateOneWithoutDashboardNestedInput = {
    create?: Prisma.XOR<Prisma.EmbedConfigCreateWithoutDashboardInput, Prisma.EmbedConfigUncheckedCreateWithoutDashboardInput>;
    connectOrCreate?: Prisma.EmbedConfigCreateOrConnectWithoutDashboardInput;
    upsert?: Prisma.EmbedConfigUpsertWithoutDashboardInput;
    disconnect?: Prisma.EmbedConfigWhereInput | boolean;
    delete?: Prisma.EmbedConfigWhereInput | boolean;
    connect?: Prisma.EmbedConfigWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.EmbedConfigUpdateToOneWithWhereWithoutDashboardInput, Prisma.EmbedConfigUpdateWithoutDashboardInput>, Prisma.EmbedConfigUncheckedUpdateWithoutDashboardInput>;
};
export type EmbedConfigCreateallowedOriginsInput = {
    set: string[];
};
export type EmbedConfigUpdateallowedOriginsInput = {
    set?: string[];
    push?: string | string[];
};
export type EmbedConfigCreateWithoutDashboardInput = {
    id?: string;
    allowedOrigins?: Prisma.EmbedConfigCreateallowedOriginsInput | string[];
    themeOverrides?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type EmbedConfigUncheckedCreateWithoutDashboardInput = {
    id?: string;
    allowedOrigins?: Prisma.EmbedConfigCreateallowedOriginsInput | string[];
    themeOverrides?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type EmbedConfigCreateOrConnectWithoutDashboardInput = {
    where: Prisma.EmbedConfigWhereUniqueInput;
    create: Prisma.XOR<Prisma.EmbedConfigCreateWithoutDashboardInput, Prisma.EmbedConfigUncheckedCreateWithoutDashboardInput>;
};
export type EmbedConfigUpsertWithoutDashboardInput = {
    update: Prisma.XOR<Prisma.EmbedConfigUpdateWithoutDashboardInput, Prisma.EmbedConfigUncheckedUpdateWithoutDashboardInput>;
    create: Prisma.XOR<Prisma.EmbedConfigCreateWithoutDashboardInput, Prisma.EmbedConfigUncheckedCreateWithoutDashboardInput>;
    where?: Prisma.EmbedConfigWhereInput;
};
export type EmbedConfigUpdateToOneWithWhereWithoutDashboardInput = {
    where?: Prisma.EmbedConfigWhereInput;
    data: Prisma.XOR<Prisma.EmbedConfigUpdateWithoutDashboardInput, Prisma.EmbedConfigUncheckedUpdateWithoutDashboardInput>;
};
export type EmbedConfigUpdateWithoutDashboardInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    allowedOrigins?: Prisma.EmbedConfigUpdateallowedOriginsInput | string[];
    themeOverrides?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EmbedConfigUncheckedUpdateWithoutDashboardInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    allowedOrigins?: Prisma.EmbedConfigUpdateallowedOriginsInput | string[];
    themeOverrides?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type EmbedConfigSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dashboardId?: boolean;
    allowedOrigins?: boolean;
    themeOverrides?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["embedConfig"]>;
export type EmbedConfigSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dashboardId?: boolean;
    allowedOrigins?: boolean;
    themeOverrides?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["embedConfig"]>;
export type EmbedConfigSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    dashboardId?: boolean;
    allowedOrigins?: boolean;
    themeOverrides?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["embedConfig"]>;
export type EmbedConfigSelectScalar = {
    id?: boolean;
    dashboardId?: boolean;
    allowedOrigins?: boolean;
    themeOverrides?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type EmbedConfigOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "dashboardId" | "allowedOrigins" | "themeOverrides" | "createdAt" | "updatedAt", ExtArgs["result"]["embedConfig"]>;
export type EmbedConfigInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
};
export type EmbedConfigIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
};
export type EmbedConfigIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dashboard?: boolean | Prisma.DashboardDefaultArgs<ExtArgs>;
};
export type $EmbedConfigPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "EmbedConfig";
    objects: {
        dashboard: Prisma.$DashboardPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        dashboardId: string;
        allowedOrigins: string[];
        themeOverrides: runtime.JsonValue | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["embedConfig"]>;
    composites: {};
};
export type EmbedConfigGetPayload<S extends boolean | null | undefined | EmbedConfigDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload, S>;
export type EmbedConfigCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<EmbedConfigFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: EmbedConfigCountAggregateInputType | true;
};
export interface EmbedConfigDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['EmbedConfig'];
        meta: {
            name: 'EmbedConfig';
        };
    };
    findUnique<T extends EmbedConfigFindUniqueArgs>(args: Prisma.SelectSubset<T, EmbedConfigFindUniqueArgs<ExtArgs>>): Prisma.Prisma__EmbedConfigClient<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends EmbedConfigFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, EmbedConfigFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__EmbedConfigClient<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends EmbedConfigFindFirstArgs>(args?: Prisma.SelectSubset<T, EmbedConfigFindFirstArgs<ExtArgs>>): Prisma.Prisma__EmbedConfigClient<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends EmbedConfigFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, EmbedConfigFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__EmbedConfigClient<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends EmbedConfigFindManyArgs>(args?: Prisma.SelectSubset<T, EmbedConfigFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends EmbedConfigCreateArgs>(args: Prisma.SelectSubset<T, EmbedConfigCreateArgs<ExtArgs>>): Prisma.Prisma__EmbedConfigClient<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends EmbedConfigCreateManyArgs>(args?: Prisma.SelectSubset<T, EmbedConfigCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends EmbedConfigCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, EmbedConfigCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends EmbedConfigDeleteArgs>(args: Prisma.SelectSubset<T, EmbedConfigDeleteArgs<ExtArgs>>): Prisma.Prisma__EmbedConfigClient<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends EmbedConfigUpdateArgs>(args: Prisma.SelectSubset<T, EmbedConfigUpdateArgs<ExtArgs>>): Prisma.Prisma__EmbedConfigClient<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends EmbedConfigDeleteManyArgs>(args?: Prisma.SelectSubset<T, EmbedConfigDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends EmbedConfigUpdateManyArgs>(args: Prisma.SelectSubset<T, EmbedConfigUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends EmbedConfigUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, EmbedConfigUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends EmbedConfigUpsertArgs>(args: Prisma.SelectSubset<T, EmbedConfigUpsertArgs<ExtArgs>>): Prisma.Prisma__EmbedConfigClient<runtime.Types.Result.GetResult<Prisma.$EmbedConfigPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends EmbedConfigCountArgs>(args?: Prisma.Subset<T, EmbedConfigCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], EmbedConfigCountAggregateOutputType> : number>;
    aggregate<T extends EmbedConfigAggregateArgs>(args: Prisma.Subset<T, EmbedConfigAggregateArgs>): Prisma.PrismaPromise<GetEmbedConfigAggregateType<T>>;
    groupBy<T extends EmbedConfigGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: EmbedConfigGroupByArgs['orderBy'];
    } : {
        orderBy?: EmbedConfigGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, EmbedConfigGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetEmbedConfigGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: EmbedConfigFieldRefs;
}
export interface Prisma__EmbedConfigClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    dashboard<T extends Prisma.DashboardDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.DashboardDefaultArgs<ExtArgs>>): Prisma.Prisma__DashboardClient<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface EmbedConfigFieldRefs {
    readonly id: Prisma.FieldRef<"EmbedConfig", 'String'>;
    readonly dashboardId: Prisma.FieldRef<"EmbedConfig", 'String'>;
    readonly allowedOrigins: Prisma.FieldRef<"EmbedConfig", 'String[]'>;
    readonly themeOverrides: Prisma.FieldRef<"EmbedConfig", 'Json'>;
    readonly createdAt: Prisma.FieldRef<"EmbedConfig", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"EmbedConfig", 'DateTime'>;
}
export type EmbedConfigFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelect<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    include?: Prisma.EmbedConfigInclude<ExtArgs> | null;
    where: Prisma.EmbedConfigWhereUniqueInput;
};
export type EmbedConfigFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelect<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    include?: Prisma.EmbedConfigInclude<ExtArgs> | null;
    where: Prisma.EmbedConfigWhereUniqueInput;
};
export type EmbedConfigFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelect<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    include?: Prisma.EmbedConfigInclude<ExtArgs> | null;
    where?: Prisma.EmbedConfigWhereInput;
    orderBy?: Prisma.EmbedConfigOrderByWithRelationInput | Prisma.EmbedConfigOrderByWithRelationInput[];
    cursor?: Prisma.EmbedConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EmbedConfigScalarFieldEnum | Prisma.EmbedConfigScalarFieldEnum[];
};
export type EmbedConfigFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelect<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    include?: Prisma.EmbedConfigInclude<ExtArgs> | null;
    where?: Prisma.EmbedConfigWhereInput;
    orderBy?: Prisma.EmbedConfigOrderByWithRelationInput | Prisma.EmbedConfigOrderByWithRelationInput[];
    cursor?: Prisma.EmbedConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EmbedConfigScalarFieldEnum | Prisma.EmbedConfigScalarFieldEnum[];
};
export type EmbedConfigFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelect<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    include?: Prisma.EmbedConfigInclude<ExtArgs> | null;
    where?: Prisma.EmbedConfigWhereInput;
    orderBy?: Prisma.EmbedConfigOrderByWithRelationInput | Prisma.EmbedConfigOrderByWithRelationInput[];
    cursor?: Prisma.EmbedConfigWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.EmbedConfigScalarFieldEnum | Prisma.EmbedConfigScalarFieldEnum[];
};
export type EmbedConfigCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelect<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    include?: Prisma.EmbedConfigInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EmbedConfigCreateInput, Prisma.EmbedConfigUncheckedCreateInput>;
};
export type EmbedConfigCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.EmbedConfigCreateManyInput | Prisma.EmbedConfigCreateManyInput[];
    skipDuplicates?: boolean;
};
export type EmbedConfigCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    data: Prisma.EmbedConfigCreateManyInput | Prisma.EmbedConfigCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.EmbedConfigIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type EmbedConfigUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelect<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    include?: Prisma.EmbedConfigInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EmbedConfigUpdateInput, Prisma.EmbedConfigUncheckedUpdateInput>;
    where: Prisma.EmbedConfigWhereUniqueInput;
};
export type EmbedConfigUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.EmbedConfigUpdateManyMutationInput, Prisma.EmbedConfigUncheckedUpdateManyInput>;
    where?: Prisma.EmbedConfigWhereInput;
    limit?: number;
};
export type EmbedConfigUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.EmbedConfigUpdateManyMutationInput, Prisma.EmbedConfigUncheckedUpdateManyInput>;
    where?: Prisma.EmbedConfigWhereInput;
    limit?: number;
    include?: Prisma.EmbedConfigIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type EmbedConfigUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelect<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    include?: Prisma.EmbedConfigInclude<ExtArgs> | null;
    where: Prisma.EmbedConfigWhereUniqueInput;
    create: Prisma.XOR<Prisma.EmbedConfigCreateInput, Prisma.EmbedConfigUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.EmbedConfigUpdateInput, Prisma.EmbedConfigUncheckedUpdateInput>;
};
export type EmbedConfigDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelect<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    include?: Prisma.EmbedConfigInclude<ExtArgs> | null;
    where: Prisma.EmbedConfigWhereUniqueInput;
};
export type EmbedConfigDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.EmbedConfigWhereInput;
    limit?: number;
};
export type EmbedConfigDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.EmbedConfigSelect<ExtArgs> | null;
    omit?: Prisma.EmbedConfigOmit<ExtArgs> | null;
    include?: Prisma.EmbedConfigInclude<ExtArgs> | null;
};
export {};

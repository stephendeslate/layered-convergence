import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type QueryCacheModel = runtime.Types.Result.DefaultSelection<Prisma.$QueryCachePayload>;
export type AggregateQueryCache = {
    _count: QueryCacheCountAggregateOutputType | null;
    _min: QueryCacheMinAggregateOutputType | null;
    _max: QueryCacheMaxAggregateOutputType | null;
};
export type QueryCacheMinAggregateOutputType = {
    id: string | null;
    queryHash: string | null;
    expiresAt: Date | null;
};
export type QueryCacheMaxAggregateOutputType = {
    id: string | null;
    queryHash: string | null;
    expiresAt: Date | null;
};
export type QueryCacheCountAggregateOutputType = {
    id: number;
    queryHash: number;
    result: number;
    expiresAt: number;
    _all: number;
};
export type QueryCacheMinAggregateInputType = {
    id?: true;
    queryHash?: true;
    expiresAt?: true;
};
export type QueryCacheMaxAggregateInputType = {
    id?: true;
    queryHash?: true;
    expiresAt?: true;
};
export type QueryCacheCountAggregateInputType = {
    id?: true;
    queryHash?: true;
    result?: true;
    expiresAt?: true;
    _all?: true;
};
export type QueryCacheAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.QueryCacheWhereInput;
    orderBy?: Prisma.QueryCacheOrderByWithRelationInput | Prisma.QueryCacheOrderByWithRelationInput[];
    cursor?: Prisma.QueryCacheWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | QueryCacheCountAggregateInputType;
    _min?: QueryCacheMinAggregateInputType;
    _max?: QueryCacheMaxAggregateInputType;
};
export type GetQueryCacheAggregateType<T extends QueryCacheAggregateArgs> = {
    [P in keyof T & keyof AggregateQueryCache]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateQueryCache[P]> : Prisma.GetScalarType<T[P], AggregateQueryCache[P]>;
};
export type QueryCacheGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.QueryCacheWhereInput;
    orderBy?: Prisma.QueryCacheOrderByWithAggregationInput | Prisma.QueryCacheOrderByWithAggregationInput[];
    by: Prisma.QueryCacheScalarFieldEnum[] | Prisma.QueryCacheScalarFieldEnum;
    having?: Prisma.QueryCacheScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: QueryCacheCountAggregateInputType | true;
    _min?: QueryCacheMinAggregateInputType;
    _max?: QueryCacheMaxAggregateInputType;
};
export type QueryCacheGroupByOutputType = {
    id: string;
    queryHash: string;
    result: runtime.JsonValue;
    expiresAt: Date;
    _count: QueryCacheCountAggregateOutputType | null;
    _min: QueryCacheMinAggregateOutputType | null;
    _max: QueryCacheMaxAggregateOutputType | null;
};
type GetQueryCacheGroupByPayload<T extends QueryCacheGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<QueryCacheGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof QueryCacheGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], QueryCacheGroupByOutputType[P]> : Prisma.GetScalarType<T[P], QueryCacheGroupByOutputType[P]>;
}>>;
export type QueryCacheWhereInput = {
    AND?: Prisma.QueryCacheWhereInput | Prisma.QueryCacheWhereInput[];
    OR?: Prisma.QueryCacheWhereInput[];
    NOT?: Prisma.QueryCacheWhereInput | Prisma.QueryCacheWhereInput[];
    id?: Prisma.UuidFilter<"QueryCache"> | string;
    queryHash?: Prisma.StringFilter<"QueryCache"> | string;
    result?: Prisma.JsonFilter<"QueryCache">;
    expiresAt?: Prisma.DateTimeFilter<"QueryCache"> | Date | string;
};
export type QueryCacheOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    queryHash?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
};
export type QueryCacheWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    queryHash?: string;
    AND?: Prisma.QueryCacheWhereInput | Prisma.QueryCacheWhereInput[];
    OR?: Prisma.QueryCacheWhereInput[];
    NOT?: Prisma.QueryCacheWhereInput | Prisma.QueryCacheWhereInput[];
    result?: Prisma.JsonFilter<"QueryCache">;
    expiresAt?: Prisma.DateTimeFilter<"QueryCache"> | Date | string;
}, "id" | "queryHash">;
export type QueryCacheOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    queryHash?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
    _count?: Prisma.QueryCacheCountOrderByAggregateInput;
    _max?: Prisma.QueryCacheMaxOrderByAggregateInput;
    _min?: Prisma.QueryCacheMinOrderByAggregateInput;
};
export type QueryCacheScalarWhereWithAggregatesInput = {
    AND?: Prisma.QueryCacheScalarWhereWithAggregatesInput | Prisma.QueryCacheScalarWhereWithAggregatesInput[];
    OR?: Prisma.QueryCacheScalarWhereWithAggregatesInput[];
    NOT?: Prisma.QueryCacheScalarWhereWithAggregatesInput | Prisma.QueryCacheScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"QueryCache"> | string;
    queryHash?: Prisma.StringWithAggregatesFilter<"QueryCache"> | string;
    result?: Prisma.JsonWithAggregatesFilter<"QueryCache">;
    expiresAt?: Prisma.DateTimeWithAggregatesFilter<"QueryCache"> | Date | string;
};
export type QueryCacheCreateInput = {
    id?: string;
    queryHash: string;
    result: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    expiresAt: Date | string;
};
export type QueryCacheUncheckedCreateInput = {
    id?: string;
    queryHash: string;
    result: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    expiresAt: Date | string;
};
export type QueryCacheUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    queryHash?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type QueryCacheUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    queryHash?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type QueryCacheCreateManyInput = {
    id?: string;
    queryHash: string;
    result: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    expiresAt: Date | string;
};
export type QueryCacheUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    queryHash?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type QueryCacheUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    queryHash?: Prisma.StringFieldUpdateOperationsInput | string;
    result?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    expiresAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type QueryCacheCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    queryHash?: Prisma.SortOrder;
    result?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
};
export type QueryCacheMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    queryHash?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
};
export type QueryCacheMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    queryHash?: Prisma.SortOrder;
    expiresAt?: Prisma.SortOrder;
};
export type QueryCacheSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    queryHash?: boolean;
    result?: boolean;
    expiresAt?: boolean;
}, ExtArgs["result"]["queryCache"]>;
export type QueryCacheSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    queryHash?: boolean;
    result?: boolean;
    expiresAt?: boolean;
}, ExtArgs["result"]["queryCache"]>;
export type QueryCacheSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    queryHash?: boolean;
    result?: boolean;
    expiresAt?: boolean;
}, ExtArgs["result"]["queryCache"]>;
export type QueryCacheSelectScalar = {
    id?: boolean;
    queryHash?: boolean;
    result?: boolean;
    expiresAt?: boolean;
};
export type QueryCacheOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "queryHash" | "result" | "expiresAt", ExtArgs["result"]["queryCache"]>;
export type $QueryCachePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "QueryCache";
    objects: {};
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        queryHash: string;
        result: runtime.JsonValue;
        expiresAt: Date;
    }, ExtArgs["result"]["queryCache"]>;
    composites: {};
};
export type QueryCacheGetPayload<S extends boolean | null | undefined | QueryCacheDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$QueryCachePayload, S>;
export type QueryCacheCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<QueryCacheFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: QueryCacheCountAggregateInputType | true;
};
export interface QueryCacheDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['QueryCache'];
        meta: {
            name: 'QueryCache';
        };
    };
    findUnique<T extends QueryCacheFindUniqueArgs>(args: Prisma.SelectSubset<T, QueryCacheFindUniqueArgs<ExtArgs>>): Prisma.Prisma__QueryCacheClient<runtime.Types.Result.GetResult<Prisma.$QueryCachePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends QueryCacheFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, QueryCacheFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__QueryCacheClient<runtime.Types.Result.GetResult<Prisma.$QueryCachePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends QueryCacheFindFirstArgs>(args?: Prisma.SelectSubset<T, QueryCacheFindFirstArgs<ExtArgs>>): Prisma.Prisma__QueryCacheClient<runtime.Types.Result.GetResult<Prisma.$QueryCachePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends QueryCacheFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, QueryCacheFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__QueryCacheClient<runtime.Types.Result.GetResult<Prisma.$QueryCachePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends QueryCacheFindManyArgs>(args?: Prisma.SelectSubset<T, QueryCacheFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QueryCachePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends QueryCacheCreateArgs>(args: Prisma.SelectSubset<T, QueryCacheCreateArgs<ExtArgs>>): Prisma.Prisma__QueryCacheClient<runtime.Types.Result.GetResult<Prisma.$QueryCachePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends QueryCacheCreateManyArgs>(args?: Prisma.SelectSubset<T, QueryCacheCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends QueryCacheCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, QueryCacheCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QueryCachePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends QueryCacheDeleteArgs>(args: Prisma.SelectSubset<T, QueryCacheDeleteArgs<ExtArgs>>): Prisma.Prisma__QueryCacheClient<runtime.Types.Result.GetResult<Prisma.$QueryCachePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends QueryCacheUpdateArgs>(args: Prisma.SelectSubset<T, QueryCacheUpdateArgs<ExtArgs>>): Prisma.Prisma__QueryCacheClient<runtime.Types.Result.GetResult<Prisma.$QueryCachePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends QueryCacheDeleteManyArgs>(args?: Prisma.SelectSubset<T, QueryCacheDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends QueryCacheUpdateManyArgs>(args: Prisma.SelectSubset<T, QueryCacheUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends QueryCacheUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, QueryCacheUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$QueryCachePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends QueryCacheUpsertArgs>(args: Prisma.SelectSubset<T, QueryCacheUpsertArgs<ExtArgs>>): Prisma.Prisma__QueryCacheClient<runtime.Types.Result.GetResult<Prisma.$QueryCachePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends QueryCacheCountArgs>(args?: Prisma.Subset<T, QueryCacheCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], QueryCacheCountAggregateOutputType> : number>;
    aggregate<T extends QueryCacheAggregateArgs>(args: Prisma.Subset<T, QueryCacheAggregateArgs>): Prisma.PrismaPromise<GetQueryCacheAggregateType<T>>;
    groupBy<T extends QueryCacheGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: QueryCacheGroupByArgs['orderBy'];
    } : {
        orderBy?: QueryCacheGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, QueryCacheGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetQueryCacheGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: QueryCacheFieldRefs;
}
export interface Prisma__QueryCacheClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface QueryCacheFieldRefs {
    readonly id: Prisma.FieldRef<"QueryCache", 'String'>;
    readonly queryHash: Prisma.FieldRef<"QueryCache", 'String'>;
    readonly result: Prisma.FieldRef<"QueryCache", 'Json'>;
    readonly expiresAt: Prisma.FieldRef<"QueryCache", 'DateTime'>;
}
export type QueryCacheFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelect<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
    where: Prisma.QueryCacheWhereUniqueInput;
};
export type QueryCacheFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelect<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
    where: Prisma.QueryCacheWhereUniqueInput;
};
export type QueryCacheFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelect<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
    where?: Prisma.QueryCacheWhereInput;
    orderBy?: Prisma.QueryCacheOrderByWithRelationInput | Prisma.QueryCacheOrderByWithRelationInput[];
    cursor?: Prisma.QueryCacheWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.QueryCacheScalarFieldEnum | Prisma.QueryCacheScalarFieldEnum[];
};
export type QueryCacheFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelect<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
    where?: Prisma.QueryCacheWhereInput;
    orderBy?: Prisma.QueryCacheOrderByWithRelationInput | Prisma.QueryCacheOrderByWithRelationInput[];
    cursor?: Prisma.QueryCacheWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.QueryCacheScalarFieldEnum | Prisma.QueryCacheScalarFieldEnum[];
};
export type QueryCacheFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelect<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
    where?: Prisma.QueryCacheWhereInput;
    orderBy?: Prisma.QueryCacheOrderByWithRelationInput | Prisma.QueryCacheOrderByWithRelationInput[];
    cursor?: Prisma.QueryCacheWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.QueryCacheScalarFieldEnum | Prisma.QueryCacheScalarFieldEnum[];
};
export type QueryCacheCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelect<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.QueryCacheCreateInput, Prisma.QueryCacheUncheckedCreateInput>;
};
export type QueryCacheCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.QueryCacheCreateManyInput | Prisma.QueryCacheCreateManyInput[];
    skipDuplicates?: boolean;
};
export type QueryCacheCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
    data: Prisma.QueryCacheCreateManyInput | Prisma.QueryCacheCreateManyInput[];
    skipDuplicates?: boolean;
};
export type QueryCacheUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelect<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.QueryCacheUpdateInput, Prisma.QueryCacheUncheckedUpdateInput>;
    where: Prisma.QueryCacheWhereUniqueInput;
};
export type QueryCacheUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.QueryCacheUpdateManyMutationInput, Prisma.QueryCacheUncheckedUpdateManyInput>;
    where?: Prisma.QueryCacheWhereInput;
    limit?: number;
};
export type QueryCacheUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.QueryCacheUpdateManyMutationInput, Prisma.QueryCacheUncheckedUpdateManyInput>;
    where?: Prisma.QueryCacheWhereInput;
    limit?: number;
};
export type QueryCacheUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelect<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
    where: Prisma.QueryCacheWhereUniqueInput;
    create: Prisma.XOR<Prisma.QueryCacheCreateInput, Prisma.QueryCacheUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.QueryCacheUpdateInput, Prisma.QueryCacheUncheckedUpdateInput>;
};
export type QueryCacheDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelect<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
    where: Prisma.QueryCacheWhereUniqueInput;
};
export type QueryCacheDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.QueryCacheWhereInput;
    limit?: number;
};
export type QueryCacheDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.QueryCacheSelect<ExtArgs> | null;
    omit?: Prisma.QueryCacheOmit<ExtArgs> | null;
};
export {};

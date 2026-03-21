import type * as runtime from "@prisma/client/runtime/library";
import type * as Prisma from "../internal/prismaNamespace.js";
export type RouteModel = runtime.Types.Result.DefaultSelection<Prisma.$RoutePayload>;
export type AggregateRoute = {
    _count: RouteCountAggregateOutputType | null;
    _avg: RouteAvgAggregateOutputType | null;
    _sum: RouteSumAggregateOutputType | null;
    _min: RouteMinAggregateOutputType | null;
    _max: RouteMaxAggregateOutputType | null;
};
export type RouteAvgAggregateOutputType = {
    estimatedDuration: number | null;
};
export type RouteSumAggregateOutputType = {
    estimatedDuration: number | null;
};
export type RouteMinAggregateOutputType = {
    id: string | null;
    technicianId: string | null;
    date: Date | null;
    estimatedDuration: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type RouteMaxAggregateOutputType = {
    id: string | null;
    technicianId: string | null;
    date: Date | null;
    estimatedDuration: number | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type RouteCountAggregateOutputType = {
    id: number;
    technicianId: number;
    date: number;
    waypoints: number;
    optimizedOrder: number;
    estimatedDuration: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type RouteAvgAggregateInputType = {
    estimatedDuration?: true;
};
export type RouteSumAggregateInputType = {
    estimatedDuration?: true;
};
export type RouteMinAggregateInputType = {
    id?: true;
    technicianId?: true;
    date?: true;
    estimatedDuration?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type RouteMaxAggregateInputType = {
    id?: true;
    technicianId?: true;
    date?: true;
    estimatedDuration?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type RouteCountAggregateInputType = {
    id?: true;
    technicianId?: true;
    date?: true;
    waypoints?: true;
    optimizedOrder?: true;
    estimatedDuration?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type RouteAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RouteWhereInput;
    orderBy?: Prisma.RouteOrderByWithRelationInput | Prisma.RouteOrderByWithRelationInput[];
    cursor?: Prisma.RouteWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | RouteCountAggregateInputType;
    _avg?: RouteAvgAggregateInputType;
    _sum?: RouteSumAggregateInputType;
    _min?: RouteMinAggregateInputType;
    _max?: RouteMaxAggregateInputType;
};
export type GetRouteAggregateType<T extends RouteAggregateArgs> = {
    [P in keyof T & keyof AggregateRoute]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateRoute[P]> : Prisma.GetScalarType<T[P], AggregateRoute[P]>;
};
export type RouteGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RouteWhereInput;
    orderBy?: Prisma.RouteOrderByWithAggregationInput | Prisma.RouteOrderByWithAggregationInput[];
    by: Prisma.RouteScalarFieldEnum[] | Prisma.RouteScalarFieldEnum;
    having?: Prisma.RouteScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: RouteCountAggregateInputType | true;
    _avg?: RouteAvgAggregateInputType;
    _sum?: RouteSumAggregateInputType;
    _min?: RouteMinAggregateInputType;
    _max?: RouteMaxAggregateInputType;
};
export type RouteGroupByOutputType = {
    id: string;
    technicianId: string;
    date: Date;
    waypoints: runtime.JsonValue;
    optimizedOrder: runtime.JsonValue | null;
    estimatedDuration: number | null;
    createdAt: Date;
    updatedAt: Date;
    _count: RouteCountAggregateOutputType | null;
    _avg: RouteAvgAggregateOutputType | null;
    _sum: RouteSumAggregateOutputType | null;
    _min: RouteMinAggregateOutputType | null;
    _max: RouteMaxAggregateOutputType | null;
};
type GetRouteGroupByPayload<T extends RouteGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<RouteGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof RouteGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], RouteGroupByOutputType[P]> : Prisma.GetScalarType<T[P], RouteGroupByOutputType[P]>;
}>>;
export type RouteWhereInput = {
    AND?: Prisma.RouteWhereInput | Prisma.RouteWhereInput[];
    OR?: Prisma.RouteWhereInput[];
    NOT?: Prisma.RouteWhereInput | Prisma.RouteWhereInput[];
    id?: Prisma.UuidFilter<"Route"> | string;
    technicianId?: Prisma.UuidFilter<"Route"> | string;
    date?: Prisma.DateTimeFilter<"Route"> | Date | string;
    waypoints?: Prisma.JsonFilter<"Route">;
    optimizedOrder?: Prisma.JsonNullableFilter<"Route">;
    estimatedDuration?: Prisma.IntNullableFilter<"Route"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"Route"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Route"> | Date | string;
    technician?: Prisma.XOR<Prisma.TechnicianScalarRelationFilter, Prisma.TechnicianWhereInput>;
};
export type RouteOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    technicianId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    waypoints?: Prisma.SortOrder;
    optimizedOrder?: Prisma.SortOrderInput | Prisma.SortOrder;
    estimatedDuration?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    technician?: Prisma.TechnicianOrderByWithRelationInput;
};
export type RouteWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.RouteWhereInput | Prisma.RouteWhereInput[];
    OR?: Prisma.RouteWhereInput[];
    NOT?: Prisma.RouteWhereInput | Prisma.RouteWhereInput[];
    technicianId?: Prisma.UuidFilter<"Route"> | string;
    date?: Prisma.DateTimeFilter<"Route"> | Date | string;
    waypoints?: Prisma.JsonFilter<"Route">;
    optimizedOrder?: Prisma.JsonNullableFilter<"Route">;
    estimatedDuration?: Prisma.IntNullableFilter<"Route"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"Route"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Route"> | Date | string;
    technician?: Prisma.XOR<Prisma.TechnicianScalarRelationFilter, Prisma.TechnicianWhereInput>;
}, "id">;
export type RouteOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    technicianId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    waypoints?: Prisma.SortOrder;
    optimizedOrder?: Prisma.SortOrderInput | Prisma.SortOrder;
    estimatedDuration?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.RouteCountOrderByAggregateInput;
    _avg?: Prisma.RouteAvgOrderByAggregateInput;
    _max?: Prisma.RouteMaxOrderByAggregateInput;
    _min?: Prisma.RouteMinOrderByAggregateInput;
    _sum?: Prisma.RouteSumOrderByAggregateInput;
};
export type RouteScalarWhereWithAggregatesInput = {
    AND?: Prisma.RouteScalarWhereWithAggregatesInput | Prisma.RouteScalarWhereWithAggregatesInput[];
    OR?: Prisma.RouteScalarWhereWithAggregatesInput[];
    NOT?: Prisma.RouteScalarWhereWithAggregatesInput | Prisma.RouteScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Route"> | string;
    technicianId?: Prisma.UuidWithAggregatesFilter<"Route"> | string;
    date?: Prisma.DateTimeWithAggregatesFilter<"Route"> | Date | string;
    waypoints?: Prisma.JsonWithAggregatesFilter<"Route">;
    optimizedOrder?: Prisma.JsonNullableWithAggregatesFilter<"Route">;
    estimatedDuration?: Prisma.IntNullableWithAggregatesFilter<"Route"> | number | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Route"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Route"> | Date | string;
};
export type RouteCreateInput = {
    id?: string;
    date: Date | string;
    waypoints: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    technician: Prisma.TechnicianCreateNestedOneWithoutRoutesInput;
};
export type RouteUncheckedCreateInput = {
    id?: string;
    technicianId: string;
    date: Date | string;
    waypoints: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type RouteUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    waypoints?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    technician?: Prisma.TechnicianUpdateOneRequiredWithoutRoutesNestedInput;
};
export type RouteUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    technicianId?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    waypoints?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RouteCreateManyInput = {
    id?: string;
    technicianId: string;
    date: Date | string;
    waypoints: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type RouteUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    waypoints?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RouteUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    technicianId?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    waypoints?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RouteListRelationFilter = {
    every?: Prisma.RouteWhereInput;
    some?: Prisma.RouteWhereInput;
    none?: Prisma.RouteWhereInput;
};
export type RouteOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type RouteCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    technicianId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    waypoints?: Prisma.SortOrder;
    optimizedOrder?: Prisma.SortOrder;
    estimatedDuration?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type RouteAvgOrderByAggregateInput = {
    estimatedDuration?: Prisma.SortOrder;
};
export type RouteMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    technicianId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    estimatedDuration?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type RouteMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    technicianId?: Prisma.SortOrder;
    date?: Prisma.SortOrder;
    estimatedDuration?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type RouteSumOrderByAggregateInput = {
    estimatedDuration?: Prisma.SortOrder;
};
export type RouteCreateNestedManyWithoutTechnicianInput = {
    create?: Prisma.XOR<Prisma.RouteCreateWithoutTechnicianInput, Prisma.RouteUncheckedCreateWithoutTechnicianInput> | Prisma.RouteCreateWithoutTechnicianInput[] | Prisma.RouteUncheckedCreateWithoutTechnicianInput[];
    connectOrCreate?: Prisma.RouteCreateOrConnectWithoutTechnicianInput | Prisma.RouteCreateOrConnectWithoutTechnicianInput[];
    createMany?: Prisma.RouteCreateManyTechnicianInputEnvelope;
    connect?: Prisma.RouteWhereUniqueInput | Prisma.RouteWhereUniqueInput[];
};
export type RouteUncheckedCreateNestedManyWithoutTechnicianInput = {
    create?: Prisma.XOR<Prisma.RouteCreateWithoutTechnicianInput, Prisma.RouteUncheckedCreateWithoutTechnicianInput> | Prisma.RouteCreateWithoutTechnicianInput[] | Prisma.RouteUncheckedCreateWithoutTechnicianInput[];
    connectOrCreate?: Prisma.RouteCreateOrConnectWithoutTechnicianInput | Prisma.RouteCreateOrConnectWithoutTechnicianInput[];
    createMany?: Prisma.RouteCreateManyTechnicianInputEnvelope;
    connect?: Prisma.RouteWhereUniqueInput | Prisma.RouteWhereUniqueInput[];
};
export type RouteUpdateManyWithoutTechnicianNestedInput = {
    create?: Prisma.XOR<Prisma.RouteCreateWithoutTechnicianInput, Prisma.RouteUncheckedCreateWithoutTechnicianInput> | Prisma.RouteCreateWithoutTechnicianInput[] | Prisma.RouteUncheckedCreateWithoutTechnicianInput[];
    connectOrCreate?: Prisma.RouteCreateOrConnectWithoutTechnicianInput | Prisma.RouteCreateOrConnectWithoutTechnicianInput[];
    upsert?: Prisma.RouteUpsertWithWhereUniqueWithoutTechnicianInput | Prisma.RouteUpsertWithWhereUniqueWithoutTechnicianInput[];
    createMany?: Prisma.RouteCreateManyTechnicianInputEnvelope;
    set?: Prisma.RouteWhereUniqueInput | Prisma.RouteWhereUniqueInput[];
    disconnect?: Prisma.RouteWhereUniqueInput | Prisma.RouteWhereUniqueInput[];
    delete?: Prisma.RouteWhereUniqueInput | Prisma.RouteWhereUniqueInput[];
    connect?: Prisma.RouteWhereUniqueInput | Prisma.RouteWhereUniqueInput[];
    update?: Prisma.RouteUpdateWithWhereUniqueWithoutTechnicianInput | Prisma.RouteUpdateWithWhereUniqueWithoutTechnicianInput[];
    updateMany?: Prisma.RouteUpdateManyWithWhereWithoutTechnicianInput | Prisma.RouteUpdateManyWithWhereWithoutTechnicianInput[];
    deleteMany?: Prisma.RouteScalarWhereInput | Prisma.RouteScalarWhereInput[];
};
export type RouteUncheckedUpdateManyWithoutTechnicianNestedInput = {
    create?: Prisma.XOR<Prisma.RouteCreateWithoutTechnicianInput, Prisma.RouteUncheckedCreateWithoutTechnicianInput> | Prisma.RouteCreateWithoutTechnicianInput[] | Prisma.RouteUncheckedCreateWithoutTechnicianInput[];
    connectOrCreate?: Prisma.RouteCreateOrConnectWithoutTechnicianInput | Prisma.RouteCreateOrConnectWithoutTechnicianInput[];
    upsert?: Prisma.RouteUpsertWithWhereUniqueWithoutTechnicianInput | Prisma.RouteUpsertWithWhereUniqueWithoutTechnicianInput[];
    createMany?: Prisma.RouteCreateManyTechnicianInputEnvelope;
    set?: Prisma.RouteWhereUniqueInput | Prisma.RouteWhereUniqueInput[];
    disconnect?: Prisma.RouteWhereUniqueInput | Prisma.RouteWhereUniqueInput[];
    delete?: Prisma.RouteWhereUniqueInput | Prisma.RouteWhereUniqueInput[];
    connect?: Prisma.RouteWhereUniqueInput | Prisma.RouteWhereUniqueInput[];
    update?: Prisma.RouteUpdateWithWhereUniqueWithoutTechnicianInput | Prisma.RouteUpdateWithWhereUniqueWithoutTechnicianInput[];
    updateMany?: Prisma.RouteUpdateManyWithWhereWithoutTechnicianInput | Prisma.RouteUpdateManyWithWhereWithoutTechnicianInput[];
    deleteMany?: Prisma.RouteScalarWhereInput | Prisma.RouteScalarWhereInput[];
};
export type NullableIntFieldUpdateOperationsInput = {
    set?: number | null;
    increment?: number;
    decrement?: number;
    multiply?: number;
    divide?: number;
};
export type RouteCreateWithoutTechnicianInput = {
    id?: string;
    date: Date | string;
    waypoints: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type RouteUncheckedCreateWithoutTechnicianInput = {
    id?: string;
    date: Date | string;
    waypoints: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type RouteCreateOrConnectWithoutTechnicianInput = {
    where: Prisma.RouteWhereUniqueInput;
    create: Prisma.XOR<Prisma.RouteCreateWithoutTechnicianInput, Prisma.RouteUncheckedCreateWithoutTechnicianInput>;
};
export type RouteCreateManyTechnicianInputEnvelope = {
    data: Prisma.RouteCreateManyTechnicianInput | Prisma.RouteCreateManyTechnicianInput[];
    skipDuplicates?: boolean;
};
export type RouteUpsertWithWhereUniqueWithoutTechnicianInput = {
    where: Prisma.RouteWhereUniqueInput;
    update: Prisma.XOR<Prisma.RouteUpdateWithoutTechnicianInput, Prisma.RouteUncheckedUpdateWithoutTechnicianInput>;
    create: Prisma.XOR<Prisma.RouteCreateWithoutTechnicianInput, Prisma.RouteUncheckedCreateWithoutTechnicianInput>;
};
export type RouteUpdateWithWhereUniqueWithoutTechnicianInput = {
    where: Prisma.RouteWhereUniqueInput;
    data: Prisma.XOR<Prisma.RouteUpdateWithoutTechnicianInput, Prisma.RouteUncheckedUpdateWithoutTechnicianInput>;
};
export type RouteUpdateManyWithWhereWithoutTechnicianInput = {
    where: Prisma.RouteScalarWhereInput;
    data: Prisma.XOR<Prisma.RouteUpdateManyMutationInput, Prisma.RouteUncheckedUpdateManyWithoutTechnicianInput>;
};
export type RouteScalarWhereInput = {
    AND?: Prisma.RouteScalarWhereInput | Prisma.RouteScalarWhereInput[];
    OR?: Prisma.RouteScalarWhereInput[];
    NOT?: Prisma.RouteScalarWhereInput | Prisma.RouteScalarWhereInput[];
    id?: Prisma.UuidFilter<"Route"> | string;
    technicianId?: Prisma.UuidFilter<"Route"> | string;
    date?: Prisma.DateTimeFilter<"Route"> | Date | string;
    waypoints?: Prisma.JsonFilter<"Route">;
    optimizedOrder?: Prisma.JsonNullableFilter<"Route">;
    estimatedDuration?: Prisma.IntNullableFilter<"Route"> | number | null;
    createdAt?: Prisma.DateTimeFilter<"Route"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Route"> | Date | string;
};
export type RouteCreateManyTechnicianInput = {
    id?: string;
    date: Date | string;
    waypoints: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: number | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type RouteUpdateWithoutTechnicianInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    waypoints?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RouteUncheckedUpdateWithoutTechnicianInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    waypoints?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RouteUncheckedUpdateManyWithoutTechnicianInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    date?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    waypoints?: Prisma.JsonNullValueInput | runtime.InputJsonValue;
    optimizedOrder?: Prisma.NullableJsonNullValueInput | runtime.InputJsonValue;
    estimatedDuration?: Prisma.NullableIntFieldUpdateOperationsInput | number | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type RouteSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    technicianId?: boolean;
    date?: boolean;
    waypoints?: boolean;
    optimizedOrder?: boolean;
    estimatedDuration?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    technician?: boolean | Prisma.TechnicianDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["route"]>;
export type RouteSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    technicianId?: boolean;
    date?: boolean;
    waypoints?: boolean;
    optimizedOrder?: boolean;
    estimatedDuration?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    technician?: boolean | Prisma.TechnicianDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["route"]>;
export type RouteSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    technicianId?: boolean;
    date?: boolean;
    waypoints?: boolean;
    optimizedOrder?: boolean;
    estimatedDuration?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    technician?: boolean | Prisma.TechnicianDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["route"]>;
export type RouteSelectScalar = {
    id?: boolean;
    technicianId?: boolean;
    date?: boolean;
    waypoints?: boolean;
    optimizedOrder?: boolean;
    estimatedDuration?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type RouteOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "technicianId" | "date" | "waypoints" | "optimizedOrder" | "estimatedDuration" | "createdAt" | "updatedAt", ExtArgs["result"]["route"]>;
export type RouteInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    technician?: boolean | Prisma.TechnicianDefaultArgs<ExtArgs>;
};
export type RouteIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    technician?: boolean | Prisma.TechnicianDefaultArgs<ExtArgs>;
};
export type RouteIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    technician?: boolean | Prisma.TechnicianDefaultArgs<ExtArgs>;
};
export type $RoutePayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Route";
    objects: {
        technician: Prisma.$TechnicianPayload<ExtArgs>;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        technicianId: string;
        date: Date;
        waypoints: runtime.JsonValue;
        optimizedOrder: runtime.JsonValue | null;
        estimatedDuration: number | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["route"]>;
    composites: {};
};
export type RouteGetPayload<S extends boolean | null | undefined | RouteDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$RoutePayload, S>;
export type RouteCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<RouteFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: RouteCountAggregateInputType | true;
};
export interface RouteDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Route'];
        meta: {
            name: 'Route';
        };
    };
    findUnique<T extends RouteFindUniqueArgs>(args: Prisma.SelectSubset<T, RouteFindUniqueArgs<ExtArgs>>): Prisma.Prisma__RouteClient<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends RouteFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, RouteFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__RouteClient<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends RouteFindFirstArgs>(args?: Prisma.SelectSubset<T, RouteFindFirstArgs<ExtArgs>>): Prisma.Prisma__RouteClient<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends RouteFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, RouteFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__RouteClient<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends RouteFindManyArgs>(args?: Prisma.SelectSubset<T, RouteFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends RouteCreateArgs>(args: Prisma.SelectSubset<T, RouteCreateArgs<ExtArgs>>): Prisma.Prisma__RouteClient<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends RouteCreateManyArgs>(args?: Prisma.SelectSubset<T, RouteCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends RouteCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, RouteCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends RouteDeleteArgs>(args: Prisma.SelectSubset<T, RouteDeleteArgs<ExtArgs>>): Prisma.Prisma__RouteClient<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends RouteUpdateArgs>(args: Prisma.SelectSubset<T, RouteUpdateArgs<ExtArgs>>): Prisma.Prisma__RouteClient<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends RouteDeleteManyArgs>(args?: Prisma.SelectSubset<T, RouteDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends RouteUpdateManyArgs>(args: Prisma.SelectSubset<T, RouteUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends RouteUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, RouteUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends RouteUpsertArgs>(args: Prisma.SelectSubset<T, RouteUpsertArgs<ExtArgs>>): Prisma.Prisma__RouteClient<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends RouteCountArgs>(args?: Prisma.Subset<T, RouteCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], RouteCountAggregateOutputType> : number>;
    aggregate<T extends RouteAggregateArgs>(args: Prisma.Subset<T, RouteAggregateArgs>): Prisma.PrismaPromise<GetRouteAggregateType<T>>;
    groupBy<T extends RouteGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: RouteGroupByArgs['orderBy'];
    } : {
        orderBy?: RouteGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, RouteGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetRouteGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: RouteFieldRefs;
}
export interface Prisma__RouteClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    technician<T extends Prisma.TechnicianDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.TechnicianDefaultArgs<ExtArgs>>): Prisma.Prisma__TechnicianClient<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface RouteFieldRefs {
    readonly id: Prisma.FieldRef<"Route", 'String'>;
    readonly technicianId: Prisma.FieldRef<"Route", 'String'>;
    readonly date: Prisma.FieldRef<"Route", 'DateTime'>;
    readonly waypoints: Prisma.FieldRef<"Route", 'Json'>;
    readonly optimizedOrder: Prisma.FieldRef<"Route", 'Json'>;
    readonly estimatedDuration: Prisma.FieldRef<"Route", 'Int'>;
    readonly createdAt: Prisma.FieldRef<"Route", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Route", 'DateTime'>;
}
export type RouteFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelect<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    include?: Prisma.RouteInclude<ExtArgs> | null;
    where: Prisma.RouteWhereUniqueInput;
};
export type RouteFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelect<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    include?: Prisma.RouteInclude<ExtArgs> | null;
    where: Prisma.RouteWhereUniqueInput;
};
export type RouteFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelect<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    include?: Prisma.RouteInclude<ExtArgs> | null;
    where?: Prisma.RouteWhereInput;
    orderBy?: Prisma.RouteOrderByWithRelationInput | Prisma.RouteOrderByWithRelationInput[];
    cursor?: Prisma.RouteWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RouteScalarFieldEnum | Prisma.RouteScalarFieldEnum[];
};
export type RouteFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelect<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    include?: Prisma.RouteInclude<ExtArgs> | null;
    where?: Prisma.RouteWhereInput;
    orderBy?: Prisma.RouteOrderByWithRelationInput | Prisma.RouteOrderByWithRelationInput[];
    cursor?: Prisma.RouteWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RouteScalarFieldEnum | Prisma.RouteScalarFieldEnum[];
};
export type RouteFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelect<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    include?: Prisma.RouteInclude<ExtArgs> | null;
    where?: Prisma.RouteWhereInput;
    orderBy?: Prisma.RouteOrderByWithRelationInput | Prisma.RouteOrderByWithRelationInput[];
    cursor?: Prisma.RouteWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.RouteScalarFieldEnum | Prisma.RouteScalarFieldEnum[];
};
export type RouteCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelect<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    include?: Prisma.RouteInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RouteCreateInput, Prisma.RouteUncheckedCreateInput>;
};
export type RouteCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.RouteCreateManyInput | Prisma.RouteCreateManyInput[];
    skipDuplicates?: boolean;
};
export type RouteCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    data: Prisma.RouteCreateManyInput | Prisma.RouteCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.RouteIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type RouteUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelect<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    include?: Prisma.RouteInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RouteUpdateInput, Prisma.RouteUncheckedUpdateInput>;
    where: Prisma.RouteWhereUniqueInput;
};
export type RouteUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.RouteUpdateManyMutationInput, Prisma.RouteUncheckedUpdateManyInput>;
    where?: Prisma.RouteWhereInput;
    limit?: number;
};
export type RouteUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.RouteUpdateManyMutationInput, Prisma.RouteUncheckedUpdateManyInput>;
    where?: Prisma.RouteWhereInput;
    limit?: number;
    include?: Prisma.RouteIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type RouteUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelect<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    include?: Prisma.RouteInclude<ExtArgs> | null;
    where: Prisma.RouteWhereUniqueInput;
    create: Prisma.XOR<Prisma.RouteCreateInput, Prisma.RouteUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.RouteUpdateInput, Prisma.RouteUncheckedUpdateInput>;
};
export type RouteDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelect<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    include?: Prisma.RouteInclude<ExtArgs> | null;
    where: Prisma.RouteWhereUniqueInput;
};
export type RouteDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RouteWhereInput;
    limit?: number;
};
export type RouteDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.RouteSelect<ExtArgs> | null;
    omit?: Prisma.RouteOmit<ExtArgs> | null;
    include?: Prisma.RouteInclude<ExtArgs> | null;
};
export {};

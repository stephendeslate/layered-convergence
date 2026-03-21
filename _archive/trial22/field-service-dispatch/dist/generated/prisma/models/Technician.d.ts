import type * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TechnicianModel = runtime.Types.Result.DefaultSelection<Prisma.$TechnicianPayload>;
export type AggregateTechnician = {
    _count: TechnicianCountAggregateOutputType | null;
    _avg: TechnicianAvgAggregateOutputType | null;
    _sum: TechnicianSumAggregateOutputType | null;
    _min: TechnicianMinAggregateOutputType | null;
    _max: TechnicianMaxAggregateOutputType | null;
};
export type TechnicianAvgAggregateOutputType = {
    currentLat: runtime.Decimal | null;
    currentLng: runtime.Decimal | null;
};
export type TechnicianSumAggregateOutputType = {
    currentLat: runtime.Decimal | null;
    currentLng: runtime.Decimal | null;
};
export type TechnicianMinAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    currentLat: runtime.Decimal | null;
    currentLng: runtime.Decimal | null;
    status: $Enums.TechnicianStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TechnicianMaxAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    name: string | null;
    email: string | null;
    phone: string | null;
    currentLat: runtime.Decimal | null;
    currentLng: runtime.Decimal | null;
    status: $Enums.TechnicianStatus | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TechnicianCountAggregateOutputType = {
    id: number;
    companyId: number;
    name: number;
    email: number;
    skills: number;
    phone: number;
    currentLat: number;
    currentLng: number;
    status: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TechnicianAvgAggregateInputType = {
    currentLat?: true;
    currentLng?: true;
};
export type TechnicianSumAggregateInputType = {
    currentLat?: true;
    currentLng?: true;
};
export type TechnicianMinAggregateInputType = {
    id?: true;
    companyId?: true;
    name?: true;
    email?: true;
    phone?: true;
    currentLat?: true;
    currentLng?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TechnicianMaxAggregateInputType = {
    id?: true;
    companyId?: true;
    name?: true;
    email?: true;
    phone?: true;
    currentLat?: true;
    currentLng?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TechnicianCountAggregateInputType = {
    id?: true;
    companyId?: true;
    name?: true;
    email?: true;
    skills?: true;
    phone?: true;
    currentLat?: true;
    currentLng?: true;
    status?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TechnicianAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TechnicianWhereInput;
    orderBy?: Prisma.TechnicianOrderByWithRelationInput | Prisma.TechnicianOrderByWithRelationInput[];
    cursor?: Prisma.TechnicianWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TechnicianCountAggregateInputType;
    _avg?: TechnicianAvgAggregateInputType;
    _sum?: TechnicianSumAggregateInputType;
    _min?: TechnicianMinAggregateInputType;
    _max?: TechnicianMaxAggregateInputType;
};
export type GetTechnicianAggregateType<T extends TechnicianAggregateArgs> = {
    [P in keyof T & keyof AggregateTechnician]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTechnician[P]> : Prisma.GetScalarType<T[P], AggregateTechnician[P]>;
};
export type TechnicianGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TechnicianWhereInput;
    orderBy?: Prisma.TechnicianOrderByWithAggregationInput | Prisma.TechnicianOrderByWithAggregationInput[];
    by: Prisma.TechnicianScalarFieldEnum[] | Prisma.TechnicianScalarFieldEnum;
    having?: Prisma.TechnicianScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TechnicianCountAggregateInputType | true;
    _avg?: TechnicianAvgAggregateInputType;
    _sum?: TechnicianSumAggregateInputType;
    _min?: TechnicianMinAggregateInputType;
    _max?: TechnicianMaxAggregateInputType;
};
export type TechnicianGroupByOutputType = {
    id: string;
    companyId: string;
    name: string;
    email: string;
    skills: string[];
    phone: string | null;
    currentLat: runtime.Decimal | null;
    currentLng: runtime.Decimal | null;
    status: $Enums.TechnicianStatus;
    createdAt: Date;
    updatedAt: Date;
    _count: TechnicianCountAggregateOutputType | null;
    _avg: TechnicianAvgAggregateOutputType | null;
    _sum: TechnicianSumAggregateOutputType | null;
    _min: TechnicianMinAggregateOutputType | null;
    _max: TechnicianMaxAggregateOutputType | null;
};
type GetTechnicianGroupByPayload<T extends TechnicianGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TechnicianGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TechnicianGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TechnicianGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TechnicianGroupByOutputType[P]>;
}>>;
export type TechnicianWhereInput = {
    AND?: Prisma.TechnicianWhereInput | Prisma.TechnicianWhereInput[];
    OR?: Prisma.TechnicianWhereInput[];
    NOT?: Prisma.TechnicianWhereInput | Prisma.TechnicianWhereInput[];
    id?: Prisma.UuidFilter<"Technician"> | string;
    companyId?: Prisma.UuidFilter<"Technician"> | string;
    name?: Prisma.StringFilter<"Technician"> | string;
    email?: Prisma.StringFilter<"Technician"> | string;
    skills?: Prisma.StringNullableListFilter<"Technician">;
    phone?: Prisma.StringNullableFilter<"Technician"> | string | null;
    currentLat?: Prisma.DecimalNullableFilter<"Technician"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.DecimalNullableFilter<"Technician"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFilter<"Technician"> | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFilter<"Technician"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Technician"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    workOrders?: Prisma.WorkOrderListRelationFilter;
    routes?: Prisma.RouteListRelationFilter;
};
export type TechnicianOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    skills?: Prisma.SortOrder;
    phone?: Prisma.SortOrderInput | Prisma.SortOrder;
    currentLat?: Prisma.SortOrderInput | Prisma.SortOrder;
    currentLng?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    company?: Prisma.CompanyOrderByWithRelationInput;
    workOrders?: Prisma.WorkOrderOrderByRelationAggregateInput;
    routes?: Prisma.RouteOrderByRelationAggregateInput;
};
export type TechnicianWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    email?: string;
    AND?: Prisma.TechnicianWhereInput | Prisma.TechnicianWhereInput[];
    OR?: Prisma.TechnicianWhereInput[];
    NOT?: Prisma.TechnicianWhereInput | Prisma.TechnicianWhereInput[];
    companyId?: Prisma.UuidFilter<"Technician"> | string;
    name?: Prisma.StringFilter<"Technician"> | string;
    skills?: Prisma.StringNullableListFilter<"Technician">;
    phone?: Prisma.StringNullableFilter<"Technician"> | string | null;
    currentLat?: Prisma.DecimalNullableFilter<"Technician"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.DecimalNullableFilter<"Technician"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFilter<"Technician"> | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFilter<"Technician"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Technician"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    workOrders?: Prisma.WorkOrderListRelationFilter;
    routes?: Prisma.RouteListRelationFilter;
}, "id" | "email">;
export type TechnicianOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    skills?: Prisma.SortOrder;
    phone?: Prisma.SortOrderInput | Prisma.SortOrder;
    currentLat?: Prisma.SortOrderInput | Prisma.SortOrder;
    currentLng?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TechnicianCountOrderByAggregateInput;
    _avg?: Prisma.TechnicianAvgOrderByAggregateInput;
    _max?: Prisma.TechnicianMaxOrderByAggregateInput;
    _min?: Prisma.TechnicianMinOrderByAggregateInput;
    _sum?: Prisma.TechnicianSumOrderByAggregateInput;
};
export type TechnicianScalarWhereWithAggregatesInput = {
    AND?: Prisma.TechnicianScalarWhereWithAggregatesInput | Prisma.TechnicianScalarWhereWithAggregatesInput[];
    OR?: Prisma.TechnicianScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TechnicianScalarWhereWithAggregatesInput | Prisma.TechnicianScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Technician"> | string;
    companyId?: Prisma.UuidWithAggregatesFilter<"Technician"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Technician"> | string;
    email?: Prisma.StringWithAggregatesFilter<"Technician"> | string;
    skills?: Prisma.StringNullableListFilter<"Technician">;
    phone?: Prisma.StringNullableWithAggregatesFilter<"Technician"> | string | null;
    currentLat?: Prisma.DecimalNullableWithAggregatesFilter<"Technician"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.DecimalNullableWithAggregatesFilter<"Technician"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusWithAggregatesFilter<"Technician"> | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Technician"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Technician"> | Date | string;
};
export type TechnicianCreateInput = {
    id?: string;
    name: string;
    email: string;
    skills?: Prisma.TechnicianCreateskillsInput | string[];
    phone?: string | null;
    currentLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.TechnicianStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutTechniciansInput;
    workOrders?: Prisma.WorkOrderCreateNestedManyWithoutTechnicianInput;
    routes?: Prisma.RouteCreateNestedManyWithoutTechnicianInput;
};
export type TechnicianUncheckedCreateInput = {
    id?: string;
    companyId: string;
    name: string;
    email: string;
    skills?: Prisma.TechnicianCreateskillsInput | string[];
    phone?: string | null;
    currentLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.TechnicianStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    workOrders?: Prisma.WorkOrderUncheckedCreateNestedManyWithoutTechnicianInput;
    routes?: Prisma.RouteUncheckedCreateNestedManyWithoutTechnicianInput;
};
export type TechnicianUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    skills?: Prisma.TechnicianUpdateskillsInput | string[];
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFieldUpdateOperationsInput | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutTechniciansNestedInput;
    workOrders?: Prisma.WorkOrderUpdateManyWithoutTechnicianNestedInput;
    routes?: Prisma.RouteUpdateManyWithoutTechnicianNestedInput;
};
export type TechnicianUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    skills?: Prisma.TechnicianUpdateskillsInput | string[];
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFieldUpdateOperationsInput | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    workOrders?: Prisma.WorkOrderUncheckedUpdateManyWithoutTechnicianNestedInput;
    routes?: Prisma.RouteUncheckedUpdateManyWithoutTechnicianNestedInput;
};
export type TechnicianCreateManyInput = {
    id?: string;
    companyId: string;
    name: string;
    email: string;
    skills?: Prisma.TechnicianCreateskillsInput | string[];
    phone?: string | null;
    currentLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.TechnicianStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TechnicianUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    skills?: Prisma.TechnicianUpdateskillsInput | string[];
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFieldUpdateOperationsInput | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TechnicianUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    skills?: Prisma.TechnicianUpdateskillsInput | string[];
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFieldUpdateOperationsInput | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TechnicianListRelationFilter = {
    every?: Prisma.TechnicianWhereInput;
    some?: Prisma.TechnicianWhereInput;
    none?: Prisma.TechnicianWhereInput;
};
export type TechnicianOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type StringNullableListFilter<$PrismaModel = never> = {
    equals?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel> | null;
    has?: string | Prisma.StringFieldRefInput<$PrismaModel> | null;
    hasEvery?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    hasSome?: string[] | Prisma.ListStringFieldRefInput<$PrismaModel>;
    isEmpty?: boolean;
};
export type TechnicianCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    skills?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    currentLat?: Prisma.SortOrder;
    currentLng?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TechnicianAvgOrderByAggregateInput = {
    currentLat?: Prisma.SortOrder;
    currentLng?: Prisma.SortOrder;
};
export type TechnicianMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    currentLat?: Prisma.SortOrder;
    currentLng?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TechnicianMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    email?: Prisma.SortOrder;
    phone?: Prisma.SortOrder;
    currentLat?: Prisma.SortOrder;
    currentLng?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TechnicianSumOrderByAggregateInput = {
    currentLat?: Prisma.SortOrder;
    currentLng?: Prisma.SortOrder;
};
export type TechnicianNullableScalarRelationFilter = {
    is?: Prisma.TechnicianWhereInput | null;
    isNot?: Prisma.TechnicianWhereInput | null;
};
export type TechnicianScalarRelationFilter = {
    is?: Prisma.TechnicianWhereInput;
    isNot?: Prisma.TechnicianWhereInput;
};
export type TechnicianCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.TechnicianCreateWithoutCompanyInput, Prisma.TechnicianUncheckedCreateWithoutCompanyInput> | Prisma.TechnicianCreateWithoutCompanyInput[] | Prisma.TechnicianUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TechnicianCreateOrConnectWithoutCompanyInput | Prisma.TechnicianCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.TechnicianCreateManyCompanyInputEnvelope;
    connect?: Prisma.TechnicianWhereUniqueInput | Prisma.TechnicianWhereUniqueInput[];
};
export type TechnicianUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.TechnicianCreateWithoutCompanyInput, Prisma.TechnicianUncheckedCreateWithoutCompanyInput> | Prisma.TechnicianCreateWithoutCompanyInput[] | Prisma.TechnicianUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TechnicianCreateOrConnectWithoutCompanyInput | Prisma.TechnicianCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.TechnicianCreateManyCompanyInputEnvelope;
    connect?: Prisma.TechnicianWhereUniqueInput | Prisma.TechnicianWhereUniqueInput[];
};
export type TechnicianUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.TechnicianCreateWithoutCompanyInput, Prisma.TechnicianUncheckedCreateWithoutCompanyInput> | Prisma.TechnicianCreateWithoutCompanyInput[] | Prisma.TechnicianUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TechnicianCreateOrConnectWithoutCompanyInput | Prisma.TechnicianCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.TechnicianUpsertWithWhereUniqueWithoutCompanyInput | Prisma.TechnicianUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.TechnicianCreateManyCompanyInputEnvelope;
    set?: Prisma.TechnicianWhereUniqueInput | Prisma.TechnicianWhereUniqueInput[];
    disconnect?: Prisma.TechnicianWhereUniqueInput | Prisma.TechnicianWhereUniqueInput[];
    delete?: Prisma.TechnicianWhereUniqueInput | Prisma.TechnicianWhereUniqueInput[];
    connect?: Prisma.TechnicianWhereUniqueInput | Prisma.TechnicianWhereUniqueInput[];
    update?: Prisma.TechnicianUpdateWithWhereUniqueWithoutCompanyInput | Prisma.TechnicianUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.TechnicianUpdateManyWithWhereWithoutCompanyInput | Prisma.TechnicianUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.TechnicianScalarWhereInput | Prisma.TechnicianScalarWhereInput[];
};
export type TechnicianUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.TechnicianCreateWithoutCompanyInput, Prisma.TechnicianUncheckedCreateWithoutCompanyInput> | Prisma.TechnicianCreateWithoutCompanyInput[] | Prisma.TechnicianUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.TechnicianCreateOrConnectWithoutCompanyInput | Prisma.TechnicianCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.TechnicianUpsertWithWhereUniqueWithoutCompanyInput | Prisma.TechnicianUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.TechnicianCreateManyCompanyInputEnvelope;
    set?: Prisma.TechnicianWhereUniqueInput | Prisma.TechnicianWhereUniqueInput[];
    disconnect?: Prisma.TechnicianWhereUniqueInput | Prisma.TechnicianWhereUniqueInput[];
    delete?: Prisma.TechnicianWhereUniqueInput | Prisma.TechnicianWhereUniqueInput[];
    connect?: Prisma.TechnicianWhereUniqueInput | Prisma.TechnicianWhereUniqueInput[];
    update?: Prisma.TechnicianUpdateWithWhereUniqueWithoutCompanyInput | Prisma.TechnicianUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.TechnicianUpdateManyWithWhereWithoutCompanyInput | Prisma.TechnicianUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.TechnicianScalarWhereInput | Prisma.TechnicianScalarWhereInput[];
};
export type TechnicianCreateskillsInput = {
    set: string[];
};
export type TechnicianUpdateskillsInput = {
    set?: string[];
    push?: string | string[];
};
export type NullableDecimalFieldUpdateOperationsInput = {
    set?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    increment?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    decrement?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    multiply?: runtime.Decimal | runtime.DecimalJsLike | number | string;
    divide?: runtime.Decimal | runtime.DecimalJsLike | number | string;
};
export type EnumTechnicianStatusFieldUpdateOperationsInput = {
    set?: $Enums.TechnicianStatus;
};
export type TechnicianCreateNestedOneWithoutWorkOrdersInput = {
    create?: Prisma.XOR<Prisma.TechnicianCreateWithoutWorkOrdersInput, Prisma.TechnicianUncheckedCreateWithoutWorkOrdersInput>;
    connectOrCreate?: Prisma.TechnicianCreateOrConnectWithoutWorkOrdersInput;
    connect?: Prisma.TechnicianWhereUniqueInput;
};
export type TechnicianUpdateOneWithoutWorkOrdersNestedInput = {
    create?: Prisma.XOR<Prisma.TechnicianCreateWithoutWorkOrdersInput, Prisma.TechnicianUncheckedCreateWithoutWorkOrdersInput>;
    connectOrCreate?: Prisma.TechnicianCreateOrConnectWithoutWorkOrdersInput;
    upsert?: Prisma.TechnicianUpsertWithoutWorkOrdersInput;
    disconnect?: Prisma.TechnicianWhereInput | boolean;
    delete?: Prisma.TechnicianWhereInput | boolean;
    connect?: Prisma.TechnicianWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TechnicianUpdateToOneWithWhereWithoutWorkOrdersInput, Prisma.TechnicianUpdateWithoutWorkOrdersInput>, Prisma.TechnicianUncheckedUpdateWithoutWorkOrdersInput>;
};
export type TechnicianCreateNestedOneWithoutRoutesInput = {
    create?: Prisma.XOR<Prisma.TechnicianCreateWithoutRoutesInput, Prisma.TechnicianUncheckedCreateWithoutRoutesInput>;
    connectOrCreate?: Prisma.TechnicianCreateOrConnectWithoutRoutesInput;
    connect?: Prisma.TechnicianWhereUniqueInput;
};
export type TechnicianUpdateOneRequiredWithoutRoutesNestedInput = {
    create?: Prisma.XOR<Prisma.TechnicianCreateWithoutRoutesInput, Prisma.TechnicianUncheckedCreateWithoutRoutesInput>;
    connectOrCreate?: Prisma.TechnicianCreateOrConnectWithoutRoutesInput;
    upsert?: Prisma.TechnicianUpsertWithoutRoutesInput;
    connect?: Prisma.TechnicianWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TechnicianUpdateToOneWithWhereWithoutRoutesInput, Prisma.TechnicianUpdateWithoutRoutesInput>, Prisma.TechnicianUncheckedUpdateWithoutRoutesInput>;
};
export type TechnicianCreateWithoutCompanyInput = {
    id?: string;
    name: string;
    email: string;
    skills?: Prisma.TechnicianCreateskillsInput | string[];
    phone?: string | null;
    currentLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.TechnicianStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    workOrders?: Prisma.WorkOrderCreateNestedManyWithoutTechnicianInput;
    routes?: Prisma.RouteCreateNestedManyWithoutTechnicianInput;
};
export type TechnicianUncheckedCreateWithoutCompanyInput = {
    id?: string;
    name: string;
    email: string;
    skills?: Prisma.TechnicianCreateskillsInput | string[];
    phone?: string | null;
    currentLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.TechnicianStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    workOrders?: Prisma.WorkOrderUncheckedCreateNestedManyWithoutTechnicianInput;
    routes?: Prisma.RouteUncheckedCreateNestedManyWithoutTechnicianInput;
};
export type TechnicianCreateOrConnectWithoutCompanyInput = {
    where: Prisma.TechnicianWhereUniqueInput;
    create: Prisma.XOR<Prisma.TechnicianCreateWithoutCompanyInput, Prisma.TechnicianUncheckedCreateWithoutCompanyInput>;
};
export type TechnicianCreateManyCompanyInputEnvelope = {
    data: Prisma.TechnicianCreateManyCompanyInput | Prisma.TechnicianCreateManyCompanyInput[];
    skipDuplicates?: boolean;
};
export type TechnicianUpsertWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.TechnicianWhereUniqueInput;
    update: Prisma.XOR<Prisma.TechnicianUpdateWithoutCompanyInput, Prisma.TechnicianUncheckedUpdateWithoutCompanyInput>;
    create: Prisma.XOR<Prisma.TechnicianCreateWithoutCompanyInput, Prisma.TechnicianUncheckedCreateWithoutCompanyInput>;
};
export type TechnicianUpdateWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.TechnicianWhereUniqueInput;
    data: Prisma.XOR<Prisma.TechnicianUpdateWithoutCompanyInput, Prisma.TechnicianUncheckedUpdateWithoutCompanyInput>;
};
export type TechnicianUpdateManyWithWhereWithoutCompanyInput = {
    where: Prisma.TechnicianScalarWhereInput;
    data: Prisma.XOR<Prisma.TechnicianUpdateManyMutationInput, Prisma.TechnicianUncheckedUpdateManyWithoutCompanyInput>;
};
export type TechnicianScalarWhereInput = {
    AND?: Prisma.TechnicianScalarWhereInput | Prisma.TechnicianScalarWhereInput[];
    OR?: Prisma.TechnicianScalarWhereInput[];
    NOT?: Prisma.TechnicianScalarWhereInput | Prisma.TechnicianScalarWhereInput[];
    id?: Prisma.UuidFilter<"Technician"> | string;
    companyId?: Prisma.UuidFilter<"Technician"> | string;
    name?: Prisma.StringFilter<"Technician"> | string;
    email?: Prisma.StringFilter<"Technician"> | string;
    skills?: Prisma.StringNullableListFilter<"Technician">;
    phone?: Prisma.StringNullableFilter<"Technician"> | string | null;
    currentLat?: Prisma.DecimalNullableFilter<"Technician"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.DecimalNullableFilter<"Technician"> | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFilter<"Technician"> | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFilter<"Technician"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Technician"> | Date | string;
};
export type TechnicianCreateWithoutWorkOrdersInput = {
    id?: string;
    name: string;
    email: string;
    skills?: Prisma.TechnicianCreateskillsInput | string[];
    phone?: string | null;
    currentLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.TechnicianStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutTechniciansInput;
    routes?: Prisma.RouteCreateNestedManyWithoutTechnicianInput;
};
export type TechnicianUncheckedCreateWithoutWorkOrdersInput = {
    id?: string;
    companyId: string;
    name: string;
    email: string;
    skills?: Prisma.TechnicianCreateskillsInput | string[];
    phone?: string | null;
    currentLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.TechnicianStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    routes?: Prisma.RouteUncheckedCreateNestedManyWithoutTechnicianInput;
};
export type TechnicianCreateOrConnectWithoutWorkOrdersInput = {
    where: Prisma.TechnicianWhereUniqueInput;
    create: Prisma.XOR<Prisma.TechnicianCreateWithoutWorkOrdersInput, Prisma.TechnicianUncheckedCreateWithoutWorkOrdersInput>;
};
export type TechnicianUpsertWithoutWorkOrdersInput = {
    update: Prisma.XOR<Prisma.TechnicianUpdateWithoutWorkOrdersInput, Prisma.TechnicianUncheckedUpdateWithoutWorkOrdersInput>;
    create: Prisma.XOR<Prisma.TechnicianCreateWithoutWorkOrdersInput, Prisma.TechnicianUncheckedCreateWithoutWorkOrdersInput>;
    where?: Prisma.TechnicianWhereInput;
};
export type TechnicianUpdateToOneWithWhereWithoutWorkOrdersInput = {
    where?: Prisma.TechnicianWhereInput;
    data: Prisma.XOR<Prisma.TechnicianUpdateWithoutWorkOrdersInput, Prisma.TechnicianUncheckedUpdateWithoutWorkOrdersInput>;
};
export type TechnicianUpdateWithoutWorkOrdersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    skills?: Prisma.TechnicianUpdateskillsInput | string[];
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFieldUpdateOperationsInput | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutTechniciansNestedInput;
    routes?: Prisma.RouteUpdateManyWithoutTechnicianNestedInput;
};
export type TechnicianUncheckedUpdateWithoutWorkOrdersInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    skills?: Prisma.TechnicianUpdateskillsInput | string[];
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFieldUpdateOperationsInput | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    routes?: Prisma.RouteUncheckedUpdateManyWithoutTechnicianNestedInput;
};
export type TechnicianCreateWithoutRoutesInput = {
    id?: string;
    name: string;
    email: string;
    skills?: Prisma.TechnicianCreateskillsInput | string[];
    phone?: string | null;
    currentLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.TechnicianStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutTechniciansInput;
    workOrders?: Prisma.WorkOrderCreateNestedManyWithoutTechnicianInput;
};
export type TechnicianUncheckedCreateWithoutRoutesInput = {
    id?: string;
    companyId: string;
    name: string;
    email: string;
    skills?: Prisma.TechnicianCreateskillsInput | string[];
    phone?: string | null;
    currentLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.TechnicianStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    workOrders?: Prisma.WorkOrderUncheckedCreateNestedManyWithoutTechnicianInput;
};
export type TechnicianCreateOrConnectWithoutRoutesInput = {
    where: Prisma.TechnicianWhereUniqueInput;
    create: Prisma.XOR<Prisma.TechnicianCreateWithoutRoutesInput, Prisma.TechnicianUncheckedCreateWithoutRoutesInput>;
};
export type TechnicianUpsertWithoutRoutesInput = {
    update: Prisma.XOR<Prisma.TechnicianUpdateWithoutRoutesInput, Prisma.TechnicianUncheckedUpdateWithoutRoutesInput>;
    create: Prisma.XOR<Prisma.TechnicianCreateWithoutRoutesInput, Prisma.TechnicianUncheckedCreateWithoutRoutesInput>;
    where?: Prisma.TechnicianWhereInput;
};
export type TechnicianUpdateToOneWithWhereWithoutRoutesInput = {
    where?: Prisma.TechnicianWhereInput;
    data: Prisma.XOR<Prisma.TechnicianUpdateWithoutRoutesInput, Prisma.TechnicianUncheckedUpdateWithoutRoutesInput>;
};
export type TechnicianUpdateWithoutRoutesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    skills?: Prisma.TechnicianUpdateskillsInput | string[];
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFieldUpdateOperationsInput | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutTechniciansNestedInput;
    workOrders?: Prisma.WorkOrderUpdateManyWithoutTechnicianNestedInput;
};
export type TechnicianUncheckedUpdateWithoutRoutesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    skills?: Prisma.TechnicianUpdateskillsInput | string[];
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFieldUpdateOperationsInput | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    workOrders?: Prisma.WorkOrderUncheckedUpdateManyWithoutTechnicianNestedInput;
};
export type TechnicianCreateManyCompanyInput = {
    id?: string;
    name: string;
    email: string;
    skills?: Prisma.TechnicianCreateskillsInput | string[];
    phone?: string | null;
    currentLat?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: $Enums.TechnicianStatus;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TechnicianUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    skills?: Prisma.TechnicianUpdateskillsInput | string[];
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFieldUpdateOperationsInput | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    workOrders?: Prisma.WorkOrderUpdateManyWithoutTechnicianNestedInput;
    routes?: Prisma.RouteUpdateManyWithoutTechnicianNestedInput;
};
export type TechnicianUncheckedUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    skills?: Prisma.TechnicianUpdateskillsInput | string[];
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFieldUpdateOperationsInput | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    workOrders?: Prisma.WorkOrderUncheckedUpdateManyWithoutTechnicianNestedInput;
    routes?: Prisma.RouteUncheckedUpdateManyWithoutTechnicianNestedInput;
};
export type TechnicianUncheckedUpdateManyWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    email?: Prisma.StringFieldUpdateOperationsInput | string;
    skills?: Prisma.TechnicianUpdateskillsInput | string[];
    phone?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    currentLat?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    currentLng?: Prisma.NullableDecimalFieldUpdateOperationsInput | runtime.Decimal | runtime.DecimalJsLike | number | string | null;
    status?: Prisma.EnumTechnicianStatusFieldUpdateOperationsInput | $Enums.TechnicianStatus;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TechnicianCountOutputType = {
    workOrders: number;
    routes: number;
};
export type TechnicianCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    workOrders?: boolean | TechnicianCountOutputTypeCountWorkOrdersArgs;
    routes?: boolean | TechnicianCountOutputTypeCountRoutesArgs;
};
export type TechnicianCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianCountOutputTypeSelect<ExtArgs> | null;
};
export type TechnicianCountOutputTypeCountWorkOrdersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkOrderWhereInput;
};
export type TechnicianCountOutputTypeCountRoutesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.RouteWhereInput;
};
export type TechnicianSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    email?: boolean;
    skills?: boolean;
    phone?: boolean;
    currentLat?: boolean;
    currentLng?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    workOrders?: boolean | Prisma.Technician$workOrdersArgs<ExtArgs>;
    routes?: boolean | Prisma.Technician$routesArgs<ExtArgs>;
    _count?: boolean | Prisma.TechnicianCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["technician"]>;
export type TechnicianSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    email?: boolean;
    skills?: boolean;
    phone?: boolean;
    currentLat?: boolean;
    currentLng?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["technician"]>;
export type TechnicianSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    email?: boolean;
    skills?: boolean;
    phone?: boolean;
    currentLat?: boolean;
    currentLng?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["technician"]>;
export type TechnicianSelectScalar = {
    id?: boolean;
    companyId?: boolean;
    name?: boolean;
    email?: boolean;
    skills?: boolean;
    phone?: boolean;
    currentLat?: boolean;
    currentLng?: boolean;
    status?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TechnicianOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "companyId" | "name" | "email" | "skills" | "phone" | "currentLat" | "currentLng" | "status" | "createdAt" | "updatedAt", ExtArgs["result"]["technician"]>;
export type TechnicianInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    workOrders?: boolean | Prisma.Technician$workOrdersArgs<ExtArgs>;
    routes?: boolean | Prisma.Technician$routesArgs<ExtArgs>;
    _count?: boolean | Prisma.TechnicianCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TechnicianIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type TechnicianIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
};
export type $TechnicianPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Technician";
    objects: {
        company: Prisma.$CompanyPayload<ExtArgs>;
        workOrders: Prisma.$WorkOrderPayload<ExtArgs>[];
        routes: Prisma.$RoutePayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        companyId: string;
        name: string;
        email: string;
        skills: string[];
        phone: string | null;
        currentLat: runtime.Decimal | null;
        currentLng: runtime.Decimal | null;
        status: $Enums.TechnicianStatus;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["technician"]>;
    composites: {};
};
export type TechnicianGetPayload<S extends boolean | null | undefined | TechnicianDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TechnicianPayload, S>;
export type TechnicianCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TechnicianFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TechnicianCountAggregateInputType | true;
};
export interface TechnicianDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Technician'];
        meta: {
            name: 'Technician';
        };
    };
    findUnique<T extends TechnicianFindUniqueArgs>(args: Prisma.SelectSubset<T, TechnicianFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TechnicianClient<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TechnicianFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TechnicianFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TechnicianClient<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TechnicianFindFirstArgs>(args?: Prisma.SelectSubset<T, TechnicianFindFirstArgs<ExtArgs>>): Prisma.Prisma__TechnicianClient<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TechnicianFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TechnicianFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TechnicianClient<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TechnicianFindManyArgs>(args?: Prisma.SelectSubset<T, TechnicianFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TechnicianCreateArgs>(args: Prisma.SelectSubset<T, TechnicianCreateArgs<ExtArgs>>): Prisma.Prisma__TechnicianClient<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TechnicianCreateManyArgs>(args?: Prisma.SelectSubset<T, TechnicianCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TechnicianCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TechnicianCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TechnicianDeleteArgs>(args: Prisma.SelectSubset<T, TechnicianDeleteArgs<ExtArgs>>): Prisma.Prisma__TechnicianClient<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TechnicianUpdateArgs>(args: Prisma.SelectSubset<T, TechnicianUpdateArgs<ExtArgs>>): Prisma.Prisma__TechnicianClient<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TechnicianDeleteManyArgs>(args?: Prisma.SelectSubset<T, TechnicianDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TechnicianUpdateManyArgs>(args: Prisma.SelectSubset<T, TechnicianUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TechnicianUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TechnicianUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TechnicianUpsertArgs>(args: Prisma.SelectSubset<T, TechnicianUpsertArgs<ExtArgs>>): Prisma.Prisma__TechnicianClient<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TechnicianCountArgs>(args?: Prisma.Subset<T, TechnicianCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TechnicianCountAggregateOutputType> : number>;
    aggregate<T extends TechnicianAggregateArgs>(args: Prisma.Subset<T, TechnicianAggregateArgs>): Prisma.PrismaPromise<GetTechnicianAggregateType<T>>;
    groupBy<T extends TechnicianGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TechnicianGroupByArgs['orderBy'];
    } : {
        orderBy?: TechnicianGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TechnicianGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTechnicianGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TechnicianFieldRefs;
}
export interface Prisma__TechnicianClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    company<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    workOrders<T extends Prisma.Technician$workOrdersArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Technician$workOrdersArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    routes<T extends Prisma.Technician$routesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Technician$routesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$RoutePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TechnicianFieldRefs {
    readonly id: Prisma.FieldRef<"Technician", 'String'>;
    readonly companyId: Prisma.FieldRef<"Technician", 'String'>;
    readonly name: Prisma.FieldRef<"Technician", 'String'>;
    readonly email: Prisma.FieldRef<"Technician", 'String'>;
    readonly skills: Prisma.FieldRef<"Technician", 'String[]'>;
    readonly phone: Prisma.FieldRef<"Technician", 'String'>;
    readonly currentLat: Prisma.FieldRef<"Technician", 'Decimal'>;
    readonly currentLng: Prisma.FieldRef<"Technician", 'Decimal'>;
    readonly status: Prisma.FieldRef<"Technician", 'TechnicianStatus'>;
    readonly createdAt: Prisma.FieldRef<"Technician", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Technician", 'DateTime'>;
}
export type TechnicianFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelect<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    include?: Prisma.TechnicianInclude<ExtArgs> | null;
    where: Prisma.TechnicianWhereUniqueInput;
};
export type TechnicianFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelect<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    include?: Prisma.TechnicianInclude<ExtArgs> | null;
    where: Prisma.TechnicianWhereUniqueInput;
};
export type TechnicianFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelect<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    include?: Prisma.TechnicianInclude<ExtArgs> | null;
    where?: Prisma.TechnicianWhereInput;
    orderBy?: Prisma.TechnicianOrderByWithRelationInput | Prisma.TechnicianOrderByWithRelationInput[];
    cursor?: Prisma.TechnicianWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TechnicianScalarFieldEnum | Prisma.TechnicianScalarFieldEnum[];
};
export type TechnicianFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelect<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    include?: Prisma.TechnicianInclude<ExtArgs> | null;
    where?: Prisma.TechnicianWhereInput;
    orderBy?: Prisma.TechnicianOrderByWithRelationInput | Prisma.TechnicianOrderByWithRelationInput[];
    cursor?: Prisma.TechnicianWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TechnicianScalarFieldEnum | Prisma.TechnicianScalarFieldEnum[];
};
export type TechnicianFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelect<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    include?: Prisma.TechnicianInclude<ExtArgs> | null;
    where?: Prisma.TechnicianWhereInput;
    orderBy?: Prisma.TechnicianOrderByWithRelationInput | Prisma.TechnicianOrderByWithRelationInput[];
    cursor?: Prisma.TechnicianWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TechnicianScalarFieldEnum | Prisma.TechnicianScalarFieldEnum[];
};
export type TechnicianCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelect<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    include?: Prisma.TechnicianInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TechnicianCreateInput, Prisma.TechnicianUncheckedCreateInput>;
};
export type TechnicianCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TechnicianCreateManyInput | Prisma.TechnicianCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TechnicianCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    data: Prisma.TechnicianCreateManyInput | Prisma.TechnicianCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.TechnicianIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type TechnicianUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelect<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    include?: Prisma.TechnicianInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TechnicianUpdateInput, Prisma.TechnicianUncheckedUpdateInput>;
    where: Prisma.TechnicianWhereUniqueInput;
};
export type TechnicianUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TechnicianUpdateManyMutationInput, Prisma.TechnicianUncheckedUpdateManyInput>;
    where?: Prisma.TechnicianWhereInput;
    limit?: number;
};
export type TechnicianUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TechnicianUpdateManyMutationInput, Prisma.TechnicianUncheckedUpdateManyInput>;
    where?: Prisma.TechnicianWhereInput;
    limit?: number;
    include?: Prisma.TechnicianIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type TechnicianUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelect<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    include?: Prisma.TechnicianInclude<ExtArgs> | null;
    where: Prisma.TechnicianWhereUniqueInput;
    create: Prisma.XOR<Prisma.TechnicianCreateInput, Prisma.TechnicianUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TechnicianUpdateInput, Prisma.TechnicianUncheckedUpdateInput>;
};
export type TechnicianDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelect<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    include?: Prisma.TechnicianInclude<ExtArgs> | null;
    where: Prisma.TechnicianWhereUniqueInput;
};
export type TechnicianDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TechnicianWhereInput;
    limit?: number;
};
export type Technician$workOrdersArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderSelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderInclude<ExtArgs> | null;
    where?: Prisma.WorkOrderWhereInput;
    orderBy?: Prisma.WorkOrderOrderByWithRelationInput | Prisma.WorkOrderOrderByWithRelationInput[];
    cursor?: Prisma.WorkOrderWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.WorkOrderScalarFieldEnum | Prisma.WorkOrderScalarFieldEnum[];
};
export type Technician$routesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TechnicianDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelect<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    include?: Prisma.TechnicianInclude<ExtArgs> | null;
};
export {};

import type * as runtime from "@prisma/client/runtime/library";
import type * as $Enums from "../enums.js";
import type * as Prisma from "../internal/prismaNamespace.js";
export type WorkOrderModel = runtime.Types.Result.DefaultSelection<Prisma.$WorkOrderPayload>;
export type AggregateWorkOrder = {
    _count: WorkOrderCountAggregateOutputType | null;
    _min: WorkOrderMinAggregateOutputType | null;
    _max: WorkOrderMaxAggregateOutputType | null;
};
export type WorkOrderMinAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    customerId: string | null;
    technicianId: string | null;
    priority: $Enums.WorkOrderPriority | null;
    scheduledAt: Date | null;
    status: $Enums.WorkOrderStatus | null;
    description: string | null;
    notes: string | null;
    completedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type WorkOrderMaxAggregateOutputType = {
    id: string | null;
    companyId: string | null;
    customerId: string | null;
    technicianId: string | null;
    priority: $Enums.WorkOrderPriority | null;
    scheduledAt: Date | null;
    status: $Enums.WorkOrderStatus | null;
    description: string | null;
    notes: string | null;
    completedAt: Date | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type WorkOrderCountAggregateOutputType = {
    id: number;
    companyId: number;
    customerId: number;
    technicianId: number;
    priority: number;
    scheduledAt: number;
    status: number;
    description: number;
    notes: number;
    completedAt: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type WorkOrderMinAggregateInputType = {
    id?: true;
    companyId?: true;
    customerId?: true;
    technicianId?: true;
    priority?: true;
    scheduledAt?: true;
    status?: true;
    description?: true;
    notes?: true;
    completedAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type WorkOrderMaxAggregateInputType = {
    id?: true;
    companyId?: true;
    customerId?: true;
    technicianId?: true;
    priority?: true;
    scheduledAt?: true;
    status?: true;
    description?: true;
    notes?: true;
    completedAt?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type WorkOrderCountAggregateInputType = {
    id?: true;
    companyId?: true;
    customerId?: true;
    technicianId?: true;
    priority?: true;
    scheduledAt?: true;
    status?: true;
    description?: true;
    notes?: true;
    completedAt?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type WorkOrderAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkOrderWhereInput;
    orderBy?: Prisma.WorkOrderOrderByWithRelationInput | Prisma.WorkOrderOrderByWithRelationInput[];
    cursor?: Prisma.WorkOrderWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | WorkOrderCountAggregateInputType;
    _min?: WorkOrderMinAggregateInputType;
    _max?: WorkOrderMaxAggregateInputType;
};
export type GetWorkOrderAggregateType<T extends WorkOrderAggregateArgs> = {
    [P in keyof T & keyof AggregateWorkOrder]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateWorkOrder[P]> : Prisma.GetScalarType<T[P], AggregateWorkOrder[P]>;
};
export type WorkOrderGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkOrderWhereInput;
    orderBy?: Prisma.WorkOrderOrderByWithAggregationInput | Prisma.WorkOrderOrderByWithAggregationInput[];
    by: Prisma.WorkOrderScalarFieldEnum[] | Prisma.WorkOrderScalarFieldEnum;
    having?: Prisma.WorkOrderScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: WorkOrderCountAggregateInputType | true;
    _min?: WorkOrderMinAggregateInputType;
    _max?: WorkOrderMaxAggregateInputType;
};
export type WorkOrderGroupByOutputType = {
    id: string;
    companyId: string;
    customerId: string;
    technicianId: string | null;
    priority: $Enums.WorkOrderPriority;
    scheduledAt: Date | null;
    status: $Enums.WorkOrderStatus;
    description: string;
    notes: string | null;
    completedAt: Date | null;
    createdAt: Date;
    updatedAt: Date;
    _count: WorkOrderCountAggregateOutputType | null;
    _min: WorkOrderMinAggregateOutputType | null;
    _max: WorkOrderMaxAggregateOutputType | null;
};
type GetWorkOrderGroupByPayload<T extends WorkOrderGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<WorkOrderGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof WorkOrderGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], WorkOrderGroupByOutputType[P]> : Prisma.GetScalarType<T[P], WorkOrderGroupByOutputType[P]>;
}>>;
export type WorkOrderWhereInput = {
    AND?: Prisma.WorkOrderWhereInput | Prisma.WorkOrderWhereInput[];
    OR?: Prisma.WorkOrderWhereInput[];
    NOT?: Prisma.WorkOrderWhereInput | Prisma.WorkOrderWhereInput[];
    id?: Prisma.UuidFilter<"WorkOrder"> | string;
    companyId?: Prisma.UuidFilter<"WorkOrder"> | string;
    customerId?: Prisma.UuidFilter<"WorkOrder"> | string;
    technicianId?: Prisma.UuidNullableFilter<"WorkOrder"> | string | null;
    priority?: Prisma.EnumWorkOrderPriorityFilter<"WorkOrder"> | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.DateTimeNullableFilter<"WorkOrder"> | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFilter<"WorkOrder"> | $Enums.WorkOrderStatus;
    description?: Prisma.StringFilter<"WorkOrder"> | string;
    notes?: Prisma.StringNullableFilter<"WorkOrder"> | string | null;
    completedAt?: Prisma.DateTimeNullableFilter<"WorkOrder"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"WorkOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"WorkOrder"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    customer?: Prisma.XOR<Prisma.CustomerScalarRelationFilter, Prisma.CustomerWhereInput>;
    technician?: Prisma.XOR<Prisma.TechnicianNullableScalarRelationFilter, Prisma.TechnicianWhereInput> | null;
    statusHistory?: Prisma.WorkOrderStatusHistoryListRelationFilter;
    invoice?: Prisma.XOR<Prisma.InvoiceNullableScalarRelationFilter, Prisma.InvoiceWhereInput> | null;
};
export type WorkOrderOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    technicianId?: Prisma.SortOrderInput | Prisma.SortOrder;
    priority?: Prisma.SortOrder;
    scheduledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    completedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    company?: Prisma.CompanyOrderByWithRelationInput;
    customer?: Prisma.CustomerOrderByWithRelationInput;
    technician?: Prisma.TechnicianOrderByWithRelationInput;
    statusHistory?: Prisma.WorkOrderStatusHistoryOrderByRelationAggregateInput;
    invoice?: Prisma.InvoiceOrderByWithRelationInput;
};
export type WorkOrderWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    AND?: Prisma.WorkOrderWhereInput | Prisma.WorkOrderWhereInput[];
    OR?: Prisma.WorkOrderWhereInput[];
    NOT?: Prisma.WorkOrderWhereInput | Prisma.WorkOrderWhereInput[];
    companyId?: Prisma.UuidFilter<"WorkOrder"> | string;
    customerId?: Prisma.UuidFilter<"WorkOrder"> | string;
    technicianId?: Prisma.UuidNullableFilter<"WorkOrder"> | string | null;
    priority?: Prisma.EnumWorkOrderPriorityFilter<"WorkOrder"> | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.DateTimeNullableFilter<"WorkOrder"> | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFilter<"WorkOrder"> | $Enums.WorkOrderStatus;
    description?: Prisma.StringFilter<"WorkOrder"> | string;
    notes?: Prisma.StringNullableFilter<"WorkOrder"> | string | null;
    completedAt?: Prisma.DateTimeNullableFilter<"WorkOrder"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"WorkOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"WorkOrder"> | Date | string;
    company?: Prisma.XOR<Prisma.CompanyScalarRelationFilter, Prisma.CompanyWhereInput>;
    customer?: Prisma.XOR<Prisma.CustomerScalarRelationFilter, Prisma.CustomerWhereInput>;
    technician?: Prisma.XOR<Prisma.TechnicianNullableScalarRelationFilter, Prisma.TechnicianWhereInput> | null;
    statusHistory?: Prisma.WorkOrderStatusHistoryListRelationFilter;
    invoice?: Prisma.XOR<Prisma.InvoiceNullableScalarRelationFilter, Prisma.InvoiceWhereInput> | null;
}, "id">;
export type WorkOrderOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    technicianId?: Prisma.SortOrderInput | Prisma.SortOrder;
    priority?: Prisma.SortOrder;
    scheduledAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    status?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    notes?: Prisma.SortOrderInput | Prisma.SortOrder;
    completedAt?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.WorkOrderCountOrderByAggregateInput;
    _max?: Prisma.WorkOrderMaxOrderByAggregateInput;
    _min?: Prisma.WorkOrderMinOrderByAggregateInput;
};
export type WorkOrderScalarWhereWithAggregatesInput = {
    AND?: Prisma.WorkOrderScalarWhereWithAggregatesInput | Prisma.WorkOrderScalarWhereWithAggregatesInput[];
    OR?: Prisma.WorkOrderScalarWhereWithAggregatesInput[];
    NOT?: Prisma.WorkOrderScalarWhereWithAggregatesInput | Prisma.WorkOrderScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"WorkOrder"> | string;
    companyId?: Prisma.UuidWithAggregatesFilter<"WorkOrder"> | string;
    customerId?: Prisma.UuidWithAggregatesFilter<"WorkOrder"> | string;
    technicianId?: Prisma.UuidNullableWithAggregatesFilter<"WorkOrder"> | string | null;
    priority?: Prisma.EnumWorkOrderPriorityWithAggregatesFilter<"WorkOrder"> | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.DateTimeNullableWithAggregatesFilter<"WorkOrder"> | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusWithAggregatesFilter<"WorkOrder"> | $Enums.WorkOrderStatus;
    description?: Prisma.StringWithAggregatesFilter<"WorkOrder"> | string;
    notes?: Prisma.StringNullableWithAggregatesFilter<"WorkOrder"> | string | null;
    completedAt?: Prisma.DateTimeNullableWithAggregatesFilter<"WorkOrder"> | Date | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"WorkOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"WorkOrder"> | Date | string;
};
export type WorkOrderCreateInput = {
    id?: string;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutWorkOrdersInput;
    customer: Prisma.CustomerCreateNestedOneWithoutWorkOrdersInput;
    technician?: Prisma.TechnicianCreateNestedOneWithoutWorkOrdersInput;
    statusHistory?: Prisma.WorkOrderStatusHistoryCreateNestedManyWithoutWorkOrderInput;
    invoice?: Prisma.InvoiceCreateNestedOneWithoutWorkOrderInput;
};
export type WorkOrderUncheckedCreateInput = {
    id?: string;
    companyId: string;
    customerId: string;
    technicianId?: string | null;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    statusHistory?: Prisma.WorkOrderStatusHistoryUncheckedCreateNestedManyWithoutWorkOrderInput;
    invoice?: Prisma.InvoiceUncheckedCreateNestedOneWithoutWorkOrderInput;
};
export type WorkOrderUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutWorkOrdersNestedInput;
    customer?: Prisma.CustomerUpdateOneRequiredWithoutWorkOrdersNestedInput;
    technician?: Prisma.TechnicianUpdateOneWithoutWorkOrdersNestedInput;
    statusHistory?: Prisma.WorkOrderStatusHistoryUpdateManyWithoutWorkOrderNestedInput;
    invoice?: Prisma.InvoiceUpdateOneWithoutWorkOrderNestedInput;
};
export type WorkOrderUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    technicianId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    statusHistory?: Prisma.WorkOrderStatusHistoryUncheckedUpdateManyWithoutWorkOrderNestedInput;
    invoice?: Prisma.InvoiceUncheckedUpdateOneWithoutWorkOrderNestedInput;
};
export type WorkOrderCreateManyInput = {
    id?: string;
    companyId: string;
    customerId: string;
    technicianId?: string | null;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WorkOrderUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkOrderUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    technicianId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkOrderListRelationFilter = {
    every?: Prisma.WorkOrderWhereInput;
    some?: Prisma.WorkOrderWhereInput;
    none?: Prisma.WorkOrderWhereInput;
};
export type WorkOrderOrderByRelationAggregateInput = {
    _count?: Prisma.SortOrder;
};
export type WorkOrderCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    technicianId?: Prisma.SortOrder;
    priority?: Prisma.SortOrder;
    scheduledAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WorkOrderMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    technicianId?: Prisma.SortOrder;
    priority?: Prisma.SortOrder;
    scheduledAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WorkOrderMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    companyId?: Prisma.SortOrder;
    customerId?: Prisma.SortOrder;
    technicianId?: Prisma.SortOrder;
    priority?: Prisma.SortOrder;
    scheduledAt?: Prisma.SortOrder;
    status?: Prisma.SortOrder;
    description?: Prisma.SortOrder;
    notes?: Prisma.SortOrder;
    completedAt?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type WorkOrderScalarRelationFilter = {
    is?: Prisma.WorkOrderWhereInput;
    isNot?: Prisma.WorkOrderWhereInput;
};
export type WorkOrderCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutCompanyInput, Prisma.WorkOrderUncheckedCreateWithoutCompanyInput> | Prisma.WorkOrderCreateWithoutCompanyInput[] | Prisma.WorkOrderUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutCompanyInput | Prisma.WorkOrderCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.WorkOrderCreateManyCompanyInputEnvelope;
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
};
export type WorkOrderUncheckedCreateNestedManyWithoutCompanyInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutCompanyInput, Prisma.WorkOrderUncheckedCreateWithoutCompanyInput> | Prisma.WorkOrderCreateWithoutCompanyInput[] | Prisma.WorkOrderUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutCompanyInput | Prisma.WorkOrderCreateOrConnectWithoutCompanyInput[];
    createMany?: Prisma.WorkOrderCreateManyCompanyInputEnvelope;
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
};
export type WorkOrderUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutCompanyInput, Prisma.WorkOrderUncheckedCreateWithoutCompanyInput> | Prisma.WorkOrderCreateWithoutCompanyInput[] | Prisma.WorkOrderUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutCompanyInput | Prisma.WorkOrderCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.WorkOrderUpsertWithWhereUniqueWithoutCompanyInput | Prisma.WorkOrderUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.WorkOrderCreateManyCompanyInputEnvelope;
    set?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    disconnect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    delete?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    update?: Prisma.WorkOrderUpdateWithWhereUniqueWithoutCompanyInput | Prisma.WorkOrderUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.WorkOrderUpdateManyWithWhereWithoutCompanyInput | Prisma.WorkOrderUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.WorkOrderScalarWhereInput | Prisma.WorkOrderScalarWhereInput[];
};
export type WorkOrderUncheckedUpdateManyWithoutCompanyNestedInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutCompanyInput, Prisma.WorkOrderUncheckedCreateWithoutCompanyInput> | Prisma.WorkOrderCreateWithoutCompanyInput[] | Prisma.WorkOrderUncheckedCreateWithoutCompanyInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutCompanyInput | Prisma.WorkOrderCreateOrConnectWithoutCompanyInput[];
    upsert?: Prisma.WorkOrderUpsertWithWhereUniqueWithoutCompanyInput | Prisma.WorkOrderUpsertWithWhereUniqueWithoutCompanyInput[];
    createMany?: Prisma.WorkOrderCreateManyCompanyInputEnvelope;
    set?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    disconnect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    delete?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    update?: Prisma.WorkOrderUpdateWithWhereUniqueWithoutCompanyInput | Prisma.WorkOrderUpdateWithWhereUniqueWithoutCompanyInput[];
    updateMany?: Prisma.WorkOrderUpdateManyWithWhereWithoutCompanyInput | Prisma.WorkOrderUpdateManyWithWhereWithoutCompanyInput[];
    deleteMany?: Prisma.WorkOrderScalarWhereInput | Prisma.WorkOrderScalarWhereInput[];
};
export type WorkOrderCreateNestedManyWithoutTechnicianInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutTechnicianInput, Prisma.WorkOrderUncheckedCreateWithoutTechnicianInput> | Prisma.WorkOrderCreateWithoutTechnicianInput[] | Prisma.WorkOrderUncheckedCreateWithoutTechnicianInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutTechnicianInput | Prisma.WorkOrderCreateOrConnectWithoutTechnicianInput[];
    createMany?: Prisma.WorkOrderCreateManyTechnicianInputEnvelope;
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
};
export type WorkOrderUncheckedCreateNestedManyWithoutTechnicianInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutTechnicianInput, Prisma.WorkOrderUncheckedCreateWithoutTechnicianInput> | Prisma.WorkOrderCreateWithoutTechnicianInput[] | Prisma.WorkOrderUncheckedCreateWithoutTechnicianInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutTechnicianInput | Prisma.WorkOrderCreateOrConnectWithoutTechnicianInput[];
    createMany?: Prisma.WorkOrderCreateManyTechnicianInputEnvelope;
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
};
export type WorkOrderUpdateManyWithoutTechnicianNestedInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutTechnicianInput, Prisma.WorkOrderUncheckedCreateWithoutTechnicianInput> | Prisma.WorkOrderCreateWithoutTechnicianInput[] | Prisma.WorkOrderUncheckedCreateWithoutTechnicianInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutTechnicianInput | Prisma.WorkOrderCreateOrConnectWithoutTechnicianInput[];
    upsert?: Prisma.WorkOrderUpsertWithWhereUniqueWithoutTechnicianInput | Prisma.WorkOrderUpsertWithWhereUniqueWithoutTechnicianInput[];
    createMany?: Prisma.WorkOrderCreateManyTechnicianInputEnvelope;
    set?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    disconnect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    delete?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    update?: Prisma.WorkOrderUpdateWithWhereUniqueWithoutTechnicianInput | Prisma.WorkOrderUpdateWithWhereUniqueWithoutTechnicianInput[];
    updateMany?: Prisma.WorkOrderUpdateManyWithWhereWithoutTechnicianInput | Prisma.WorkOrderUpdateManyWithWhereWithoutTechnicianInput[];
    deleteMany?: Prisma.WorkOrderScalarWhereInput | Prisma.WorkOrderScalarWhereInput[];
};
export type WorkOrderUncheckedUpdateManyWithoutTechnicianNestedInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutTechnicianInput, Prisma.WorkOrderUncheckedCreateWithoutTechnicianInput> | Prisma.WorkOrderCreateWithoutTechnicianInput[] | Prisma.WorkOrderUncheckedCreateWithoutTechnicianInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutTechnicianInput | Prisma.WorkOrderCreateOrConnectWithoutTechnicianInput[];
    upsert?: Prisma.WorkOrderUpsertWithWhereUniqueWithoutTechnicianInput | Prisma.WorkOrderUpsertWithWhereUniqueWithoutTechnicianInput[];
    createMany?: Prisma.WorkOrderCreateManyTechnicianInputEnvelope;
    set?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    disconnect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    delete?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    update?: Prisma.WorkOrderUpdateWithWhereUniqueWithoutTechnicianInput | Prisma.WorkOrderUpdateWithWhereUniqueWithoutTechnicianInput[];
    updateMany?: Prisma.WorkOrderUpdateManyWithWhereWithoutTechnicianInput | Prisma.WorkOrderUpdateManyWithWhereWithoutTechnicianInput[];
    deleteMany?: Prisma.WorkOrderScalarWhereInput | Prisma.WorkOrderScalarWhereInput[];
};
export type WorkOrderCreateNestedManyWithoutCustomerInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutCustomerInput, Prisma.WorkOrderUncheckedCreateWithoutCustomerInput> | Prisma.WorkOrderCreateWithoutCustomerInput[] | Prisma.WorkOrderUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutCustomerInput | Prisma.WorkOrderCreateOrConnectWithoutCustomerInput[];
    createMany?: Prisma.WorkOrderCreateManyCustomerInputEnvelope;
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
};
export type WorkOrderUncheckedCreateNestedManyWithoutCustomerInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutCustomerInput, Prisma.WorkOrderUncheckedCreateWithoutCustomerInput> | Prisma.WorkOrderCreateWithoutCustomerInput[] | Prisma.WorkOrderUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutCustomerInput | Prisma.WorkOrderCreateOrConnectWithoutCustomerInput[];
    createMany?: Prisma.WorkOrderCreateManyCustomerInputEnvelope;
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
};
export type WorkOrderUpdateManyWithoutCustomerNestedInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutCustomerInput, Prisma.WorkOrderUncheckedCreateWithoutCustomerInput> | Prisma.WorkOrderCreateWithoutCustomerInput[] | Prisma.WorkOrderUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutCustomerInput | Prisma.WorkOrderCreateOrConnectWithoutCustomerInput[];
    upsert?: Prisma.WorkOrderUpsertWithWhereUniqueWithoutCustomerInput | Prisma.WorkOrderUpsertWithWhereUniqueWithoutCustomerInput[];
    createMany?: Prisma.WorkOrderCreateManyCustomerInputEnvelope;
    set?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    disconnect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    delete?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    update?: Prisma.WorkOrderUpdateWithWhereUniqueWithoutCustomerInput | Prisma.WorkOrderUpdateWithWhereUniqueWithoutCustomerInput[];
    updateMany?: Prisma.WorkOrderUpdateManyWithWhereWithoutCustomerInput | Prisma.WorkOrderUpdateManyWithWhereWithoutCustomerInput[];
    deleteMany?: Prisma.WorkOrderScalarWhereInput | Prisma.WorkOrderScalarWhereInput[];
};
export type WorkOrderUncheckedUpdateManyWithoutCustomerNestedInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutCustomerInput, Prisma.WorkOrderUncheckedCreateWithoutCustomerInput> | Prisma.WorkOrderCreateWithoutCustomerInput[] | Prisma.WorkOrderUncheckedCreateWithoutCustomerInput[];
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutCustomerInput | Prisma.WorkOrderCreateOrConnectWithoutCustomerInput[];
    upsert?: Prisma.WorkOrderUpsertWithWhereUniqueWithoutCustomerInput | Prisma.WorkOrderUpsertWithWhereUniqueWithoutCustomerInput[];
    createMany?: Prisma.WorkOrderCreateManyCustomerInputEnvelope;
    set?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    disconnect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    delete?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    connect?: Prisma.WorkOrderWhereUniqueInput | Prisma.WorkOrderWhereUniqueInput[];
    update?: Prisma.WorkOrderUpdateWithWhereUniqueWithoutCustomerInput | Prisma.WorkOrderUpdateWithWhereUniqueWithoutCustomerInput[];
    updateMany?: Prisma.WorkOrderUpdateManyWithWhereWithoutCustomerInput | Prisma.WorkOrderUpdateManyWithWhereWithoutCustomerInput[];
    deleteMany?: Prisma.WorkOrderScalarWhereInput | Prisma.WorkOrderScalarWhereInput[];
};
export type EnumWorkOrderPriorityFieldUpdateOperationsInput = {
    set?: $Enums.WorkOrderPriority;
};
export type NullableDateTimeFieldUpdateOperationsInput = {
    set?: Date | string | null;
};
export type EnumWorkOrderStatusFieldUpdateOperationsInput = {
    set?: $Enums.WorkOrderStatus;
};
export type WorkOrderCreateNestedOneWithoutStatusHistoryInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutStatusHistoryInput, Prisma.WorkOrderUncheckedCreateWithoutStatusHistoryInput>;
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutStatusHistoryInput;
    connect?: Prisma.WorkOrderWhereUniqueInput;
};
export type WorkOrderUpdateOneRequiredWithoutStatusHistoryNestedInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutStatusHistoryInput, Prisma.WorkOrderUncheckedCreateWithoutStatusHistoryInput>;
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutStatusHistoryInput;
    upsert?: Prisma.WorkOrderUpsertWithoutStatusHistoryInput;
    connect?: Prisma.WorkOrderWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.WorkOrderUpdateToOneWithWhereWithoutStatusHistoryInput, Prisma.WorkOrderUpdateWithoutStatusHistoryInput>, Prisma.WorkOrderUncheckedUpdateWithoutStatusHistoryInput>;
};
export type WorkOrderCreateNestedOneWithoutInvoiceInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutInvoiceInput, Prisma.WorkOrderUncheckedCreateWithoutInvoiceInput>;
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutInvoiceInput;
    connect?: Prisma.WorkOrderWhereUniqueInput;
};
export type WorkOrderUpdateOneRequiredWithoutInvoiceNestedInput = {
    create?: Prisma.XOR<Prisma.WorkOrderCreateWithoutInvoiceInput, Prisma.WorkOrderUncheckedCreateWithoutInvoiceInput>;
    connectOrCreate?: Prisma.WorkOrderCreateOrConnectWithoutInvoiceInput;
    upsert?: Prisma.WorkOrderUpsertWithoutInvoiceInput;
    connect?: Prisma.WorkOrderWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.WorkOrderUpdateToOneWithWhereWithoutInvoiceInput, Prisma.WorkOrderUpdateWithoutInvoiceInput>, Prisma.WorkOrderUncheckedUpdateWithoutInvoiceInput>;
};
export type WorkOrderCreateWithoutCompanyInput = {
    id?: string;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    customer: Prisma.CustomerCreateNestedOneWithoutWorkOrdersInput;
    technician?: Prisma.TechnicianCreateNestedOneWithoutWorkOrdersInput;
    statusHistory?: Prisma.WorkOrderStatusHistoryCreateNestedManyWithoutWorkOrderInput;
    invoice?: Prisma.InvoiceCreateNestedOneWithoutWorkOrderInput;
};
export type WorkOrderUncheckedCreateWithoutCompanyInput = {
    id?: string;
    customerId: string;
    technicianId?: string | null;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    statusHistory?: Prisma.WorkOrderStatusHistoryUncheckedCreateNestedManyWithoutWorkOrderInput;
    invoice?: Prisma.InvoiceUncheckedCreateNestedOneWithoutWorkOrderInput;
};
export type WorkOrderCreateOrConnectWithoutCompanyInput = {
    where: Prisma.WorkOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.WorkOrderCreateWithoutCompanyInput, Prisma.WorkOrderUncheckedCreateWithoutCompanyInput>;
};
export type WorkOrderCreateManyCompanyInputEnvelope = {
    data: Prisma.WorkOrderCreateManyCompanyInput | Prisma.WorkOrderCreateManyCompanyInput[];
    skipDuplicates?: boolean;
};
export type WorkOrderUpsertWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.WorkOrderWhereUniqueInput;
    update: Prisma.XOR<Prisma.WorkOrderUpdateWithoutCompanyInput, Prisma.WorkOrderUncheckedUpdateWithoutCompanyInput>;
    create: Prisma.XOR<Prisma.WorkOrderCreateWithoutCompanyInput, Prisma.WorkOrderUncheckedCreateWithoutCompanyInput>;
};
export type WorkOrderUpdateWithWhereUniqueWithoutCompanyInput = {
    where: Prisma.WorkOrderWhereUniqueInput;
    data: Prisma.XOR<Prisma.WorkOrderUpdateWithoutCompanyInput, Prisma.WorkOrderUncheckedUpdateWithoutCompanyInput>;
};
export type WorkOrderUpdateManyWithWhereWithoutCompanyInput = {
    where: Prisma.WorkOrderScalarWhereInput;
    data: Prisma.XOR<Prisma.WorkOrderUpdateManyMutationInput, Prisma.WorkOrderUncheckedUpdateManyWithoutCompanyInput>;
};
export type WorkOrderScalarWhereInput = {
    AND?: Prisma.WorkOrderScalarWhereInput | Prisma.WorkOrderScalarWhereInput[];
    OR?: Prisma.WorkOrderScalarWhereInput[];
    NOT?: Prisma.WorkOrderScalarWhereInput | Prisma.WorkOrderScalarWhereInput[];
    id?: Prisma.UuidFilter<"WorkOrder"> | string;
    companyId?: Prisma.UuidFilter<"WorkOrder"> | string;
    customerId?: Prisma.UuidFilter<"WorkOrder"> | string;
    technicianId?: Prisma.UuidNullableFilter<"WorkOrder"> | string | null;
    priority?: Prisma.EnumWorkOrderPriorityFilter<"WorkOrder"> | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.DateTimeNullableFilter<"WorkOrder"> | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFilter<"WorkOrder"> | $Enums.WorkOrderStatus;
    description?: Prisma.StringFilter<"WorkOrder"> | string;
    notes?: Prisma.StringNullableFilter<"WorkOrder"> | string | null;
    completedAt?: Prisma.DateTimeNullableFilter<"WorkOrder"> | Date | string | null;
    createdAt?: Prisma.DateTimeFilter<"WorkOrder"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"WorkOrder"> | Date | string;
};
export type WorkOrderCreateWithoutTechnicianInput = {
    id?: string;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutWorkOrdersInput;
    customer: Prisma.CustomerCreateNestedOneWithoutWorkOrdersInput;
    statusHistory?: Prisma.WorkOrderStatusHistoryCreateNestedManyWithoutWorkOrderInput;
    invoice?: Prisma.InvoiceCreateNestedOneWithoutWorkOrderInput;
};
export type WorkOrderUncheckedCreateWithoutTechnicianInput = {
    id?: string;
    companyId: string;
    customerId: string;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    statusHistory?: Prisma.WorkOrderStatusHistoryUncheckedCreateNestedManyWithoutWorkOrderInput;
    invoice?: Prisma.InvoiceUncheckedCreateNestedOneWithoutWorkOrderInput;
};
export type WorkOrderCreateOrConnectWithoutTechnicianInput = {
    where: Prisma.WorkOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.WorkOrderCreateWithoutTechnicianInput, Prisma.WorkOrderUncheckedCreateWithoutTechnicianInput>;
};
export type WorkOrderCreateManyTechnicianInputEnvelope = {
    data: Prisma.WorkOrderCreateManyTechnicianInput | Prisma.WorkOrderCreateManyTechnicianInput[];
    skipDuplicates?: boolean;
};
export type WorkOrderUpsertWithWhereUniqueWithoutTechnicianInput = {
    where: Prisma.WorkOrderWhereUniqueInput;
    update: Prisma.XOR<Prisma.WorkOrderUpdateWithoutTechnicianInput, Prisma.WorkOrderUncheckedUpdateWithoutTechnicianInput>;
    create: Prisma.XOR<Prisma.WorkOrderCreateWithoutTechnicianInput, Prisma.WorkOrderUncheckedCreateWithoutTechnicianInput>;
};
export type WorkOrderUpdateWithWhereUniqueWithoutTechnicianInput = {
    where: Prisma.WorkOrderWhereUniqueInput;
    data: Prisma.XOR<Prisma.WorkOrderUpdateWithoutTechnicianInput, Prisma.WorkOrderUncheckedUpdateWithoutTechnicianInput>;
};
export type WorkOrderUpdateManyWithWhereWithoutTechnicianInput = {
    where: Prisma.WorkOrderScalarWhereInput;
    data: Prisma.XOR<Prisma.WorkOrderUpdateManyMutationInput, Prisma.WorkOrderUncheckedUpdateManyWithoutTechnicianInput>;
};
export type WorkOrderCreateWithoutCustomerInput = {
    id?: string;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutWorkOrdersInput;
    technician?: Prisma.TechnicianCreateNestedOneWithoutWorkOrdersInput;
    statusHistory?: Prisma.WorkOrderStatusHistoryCreateNestedManyWithoutWorkOrderInput;
    invoice?: Prisma.InvoiceCreateNestedOneWithoutWorkOrderInput;
};
export type WorkOrderUncheckedCreateWithoutCustomerInput = {
    id?: string;
    companyId: string;
    technicianId?: string | null;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    statusHistory?: Prisma.WorkOrderStatusHistoryUncheckedCreateNestedManyWithoutWorkOrderInput;
    invoice?: Prisma.InvoiceUncheckedCreateNestedOneWithoutWorkOrderInput;
};
export type WorkOrderCreateOrConnectWithoutCustomerInput = {
    where: Prisma.WorkOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.WorkOrderCreateWithoutCustomerInput, Prisma.WorkOrderUncheckedCreateWithoutCustomerInput>;
};
export type WorkOrderCreateManyCustomerInputEnvelope = {
    data: Prisma.WorkOrderCreateManyCustomerInput | Prisma.WorkOrderCreateManyCustomerInput[];
    skipDuplicates?: boolean;
};
export type WorkOrderUpsertWithWhereUniqueWithoutCustomerInput = {
    where: Prisma.WorkOrderWhereUniqueInput;
    update: Prisma.XOR<Prisma.WorkOrderUpdateWithoutCustomerInput, Prisma.WorkOrderUncheckedUpdateWithoutCustomerInput>;
    create: Prisma.XOR<Prisma.WorkOrderCreateWithoutCustomerInput, Prisma.WorkOrderUncheckedCreateWithoutCustomerInput>;
};
export type WorkOrderUpdateWithWhereUniqueWithoutCustomerInput = {
    where: Prisma.WorkOrderWhereUniqueInput;
    data: Prisma.XOR<Prisma.WorkOrderUpdateWithoutCustomerInput, Prisma.WorkOrderUncheckedUpdateWithoutCustomerInput>;
};
export type WorkOrderUpdateManyWithWhereWithoutCustomerInput = {
    where: Prisma.WorkOrderScalarWhereInput;
    data: Prisma.XOR<Prisma.WorkOrderUpdateManyMutationInput, Prisma.WorkOrderUncheckedUpdateManyWithoutCustomerInput>;
};
export type WorkOrderCreateWithoutStatusHistoryInput = {
    id?: string;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutWorkOrdersInput;
    customer: Prisma.CustomerCreateNestedOneWithoutWorkOrdersInput;
    technician?: Prisma.TechnicianCreateNestedOneWithoutWorkOrdersInput;
    invoice?: Prisma.InvoiceCreateNestedOneWithoutWorkOrderInput;
};
export type WorkOrderUncheckedCreateWithoutStatusHistoryInput = {
    id?: string;
    companyId: string;
    customerId: string;
    technicianId?: string | null;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    invoice?: Prisma.InvoiceUncheckedCreateNestedOneWithoutWorkOrderInput;
};
export type WorkOrderCreateOrConnectWithoutStatusHistoryInput = {
    where: Prisma.WorkOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.WorkOrderCreateWithoutStatusHistoryInput, Prisma.WorkOrderUncheckedCreateWithoutStatusHistoryInput>;
};
export type WorkOrderUpsertWithoutStatusHistoryInput = {
    update: Prisma.XOR<Prisma.WorkOrderUpdateWithoutStatusHistoryInput, Prisma.WorkOrderUncheckedUpdateWithoutStatusHistoryInput>;
    create: Prisma.XOR<Prisma.WorkOrderCreateWithoutStatusHistoryInput, Prisma.WorkOrderUncheckedCreateWithoutStatusHistoryInput>;
    where?: Prisma.WorkOrderWhereInput;
};
export type WorkOrderUpdateToOneWithWhereWithoutStatusHistoryInput = {
    where?: Prisma.WorkOrderWhereInput;
    data: Prisma.XOR<Prisma.WorkOrderUpdateWithoutStatusHistoryInput, Prisma.WorkOrderUncheckedUpdateWithoutStatusHistoryInput>;
};
export type WorkOrderUpdateWithoutStatusHistoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutWorkOrdersNestedInput;
    customer?: Prisma.CustomerUpdateOneRequiredWithoutWorkOrdersNestedInput;
    technician?: Prisma.TechnicianUpdateOneWithoutWorkOrdersNestedInput;
    invoice?: Prisma.InvoiceUpdateOneWithoutWorkOrderNestedInput;
};
export type WorkOrderUncheckedUpdateWithoutStatusHistoryInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    technicianId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    invoice?: Prisma.InvoiceUncheckedUpdateOneWithoutWorkOrderNestedInput;
};
export type WorkOrderCreateWithoutInvoiceInput = {
    id?: string;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    company: Prisma.CompanyCreateNestedOneWithoutWorkOrdersInput;
    customer: Prisma.CustomerCreateNestedOneWithoutWorkOrdersInput;
    technician?: Prisma.TechnicianCreateNestedOneWithoutWorkOrdersInput;
    statusHistory?: Prisma.WorkOrderStatusHistoryCreateNestedManyWithoutWorkOrderInput;
};
export type WorkOrderUncheckedCreateWithoutInvoiceInput = {
    id?: string;
    companyId: string;
    customerId: string;
    technicianId?: string | null;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    statusHistory?: Prisma.WorkOrderStatusHistoryUncheckedCreateNestedManyWithoutWorkOrderInput;
};
export type WorkOrderCreateOrConnectWithoutInvoiceInput = {
    where: Prisma.WorkOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.WorkOrderCreateWithoutInvoiceInput, Prisma.WorkOrderUncheckedCreateWithoutInvoiceInput>;
};
export type WorkOrderUpsertWithoutInvoiceInput = {
    update: Prisma.XOR<Prisma.WorkOrderUpdateWithoutInvoiceInput, Prisma.WorkOrderUncheckedUpdateWithoutInvoiceInput>;
    create: Prisma.XOR<Prisma.WorkOrderCreateWithoutInvoiceInput, Prisma.WorkOrderUncheckedCreateWithoutInvoiceInput>;
    where?: Prisma.WorkOrderWhereInput;
};
export type WorkOrderUpdateToOneWithWhereWithoutInvoiceInput = {
    where?: Prisma.WorkOrderWhereInput;
    data: Prisma.XOR<Prisma.WorkOrderUpdateWithoutInvoiceInput, Prisma.WorkOrderUncheckedUpdateWithoutInvoiceInput>;
};
export type WorkOrderUpdateWithoutInvoiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutWorkOrdersNestedInput;
    customer?: Prisma.CustomerUpdateOneRequiredWithoutWorkOrdersNestedInput;
    technician?: Prisma.TechnicianUpdateOneWithoutWorkOrdersNestedInput;
    statusHistory?: Prisma.WorkOrderStatusHistoryUpdateManyWithoutWorkOrderNestedInput;
};
export type WorkOrderUncheckedUpdateWithoutInvoiceInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    technicianId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    statusHistory?: Prisma.WorkOrderStatusHistoryUncheckedUpdateManyWithoutWorkOrderNestedInput;
};
export type WorkOrderCreateManyCompanyInput = {
    id?: string;
    customerId: string;
    technicianId?: string | null;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WorkOrderUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    customer?: Prisma.CustomerUpdateOneRequiredWithoutWorkOrdersNestedInput;
    technician?: Prisma.TechnicianUpdateOneWithoutWorkOrdersNestedInput;
    statusHistory?: Prisma.WorkOrderStatusHistoryUpdateManyWithoutWorkOrderNestedInput;
    invoice?: Prisma.InvoiceUpdateOneWithoutWorkOrderNestedInput;
};
export type WorkOrderUncheckedUpdateWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    technicianId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    statusHistory?: Prisma.WorkOrderStatusHistoryUncheckedUpdateManyWithoutWorkOrderNestedInput;
    invoice?: Prisma.InvoiceUncheckedUpdateOneWithoutWorkOrderNestedInput;
};
export type WorkOrderUncheckedUpdateManyWithoutCompanyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    technicianId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkOrderCreateManyTechnicianInput = {
    id?: string;
    companyId: string;
    customerId: string;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WorkOrderUpdateWithoutTechnicianInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutWorkOrdersNestedInput;
    customer?: Prisma.CustomerUpdateOneRequiredWithoutWorkOrdersNestedInput;
    statusHistory?: Prisma.WorkOrderStatusHistoryUpdateManyWithoutWorkOrderNestedInput;
    invoice?: Prisma.InvoiceUpdateOneWithoutWorkOrderNestedInput;
};
export type WorkOrderUncheckedUpdateWithoutTechnicianInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    statusHistory?: Prisma.WorkOrderStatusHistoryUncheckedUpdateManyWithoutWorkOrderNestedInput;
    invoice?: Prisma.InvoiceUncheckedUpdateOneWithoutWorkOrderNestedInput;
};
export type WorkOrderUncheckedUpdateManyWithoutTechnicianInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    customerId?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkOrderCreateManyCustomerInput = {
    id?: string;
    companyId: string;
    technicianId?: string | null;
    priority?: $Enums.WorkOrderPriority;
    scheduledAt?: Date | string | null;
    status?: $Enums.WorkOrderStatus;
    description: string;
    notes?: string | null;
    completedAt?: Date | string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type WorkOrderUpdateWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    company?: Prisma.CompanyUpdateOneRequiredWithoutWorkOrdersNestedInput;
    technician?: Prisma.TechnicianUpdateOneWithoutWorkOrdersNestedInput;
    statusHistory?: Prisma.WorkOrderStatusHistoryUpdateManyWithoutWorkOrderNestedInput;
    invoice?: Prisma.InvoiceUpdateOneWithoutWorkOrderNestedInput;
};
export type WorkOrderUncheckedUpdateWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    technicianId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    statusHistory?: Prisma.WorkOrderStatusHistoryUncheckedUpdateManyWithoutWorkOrderNestedInput;
    invoice?: Prisma.InvoiceUncheckedUpdateOneWithoutWorkOrderNestedInput;
};
export type WorkOrderUncheckedUpdateManyWithoutCustomerInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    companyId?: Prisma.StringFieldUpdateOperationsInput | string;
    technicianId?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    priority?: Prisma.EnumWorkOrderPriorityFieldUpdateOperationsInput | $Enums.WorkOrderPriority;
    scheduledAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    status?: Prisma.EnumWorkOrderStatusFieldUpdateOperationsInput | $Enums.WorkOrderStatus;
    description?: Prisma.StringFieldUpdateOperationsInput | string;
    notes?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    completedAt?: Prisma.NullableDateTimeFieldUpdateOperationsInput | Date | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type WorkOrderCountOutputType = {
    statusHistory: number;
};
export type WorkOrderCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    statusHistory?: boolean | WorkOrderCountOutputTypeCountStatusHistoryArgs;
};
export type WorkOrderCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderCountOutputTypeSelect<ExtArgs> | null;
};
export type WorkOrderCountOutputTypeCountStatusHistoryArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkOrderStatusHistoryWhereInput;
};
export type WorkOrderSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    customerId?: boolean;
    technicianId?: boolean;
    priority?: boolean;
    scheduledAt?: boolean;
    status?: boolean;
    description?: boolean;
    notes?: boolean;
    completedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.CustomerDefaultArgs<ExtArgs>;
    technician?: boolean | Prisma.WorkOrder$technicianArgs<ExtArgs>;
    statusHistory?: boolean | Prisma.WorkOrder$statusHistoryArgs<ExtArgs>;
    invoice?: boolean | Prisma.WorkOrder$invoiceArgs<ExtArgs>;
    _count?: boolean | Prisma.WorkOrderCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["workOrder"]>;
export type WorkOrderSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    customerId?: boolean;
    technicianId?: boolean;
    priority?: boolean;
    scheduledAt?: boolean;
    status?: boolean;
    description?: boolean;
    notes?: boolean;
    completedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.CustomerDefaultArgs<ExtArgs>;
    technician?: boolean | Prisma.WorkOrder$technicianArgs<ExtArgs>;
}, ExtArgs["result"]["workOrder"]>;
export type WorkOrderSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    companyId?: boolean;
    customerId?: boolean;
    technicianId?: boolean;
    priority?: boolean;
    scheduledAt?: boolean;
    status?: boolean;
    description?: boolean;
    notes?: boolean;
    completedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.CustomerDefaultArgs<ExtArgs>;
    technician?: boolean | Prisma.WorkOrder$technicianArgs<ExtArgs>;
}, ExtArgs["result"]["workOrder"]>;
export type WorkOrderSelectScalar = {
    id?: boolean;
    companyId?: boolean;
    customerId?: boolean;
    technicianId?: boolean;
    priority?: boolean;
    scheduledAt?: boolean;
    status?: boolean;
    description?: boolean;
    notes?: boolean;
    completedAt?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type WorkOrderOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "companyId" | "customerId" | "technicianId" | "priority" | "scheduledAt" | "status" | "description" | "notes" | "completedAt" | "createdAt" | "updatedAt", ExtArgs["result"]["workOrder"]>;
export type WorkOrderInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.CustomerDefaultArgs<ExtArgs>;
    technician?: boolean | Prisma.WorkOrder$technicianArgs<ExtArgs>;
    statusHistory?: boolean | Prisma.WorkOrder$statusHistoryArgs<ExtArgs>;
    invoice?: boolean | Prisma.WorkOrder$invoiceArgs<ExtArgs>;
    _count?: boolean | Prisma.WorkOrderCountOutputTypeDefaultArgs<ExtArgs>;
};
export type WorkOrderIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.CustomerDefaultArgs<ExtArgs>;
    technician?: boolean | Prisma.WorkOrder$technicianArgs<ExtArgs>;
};
export type WorkOrderIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    company?: boolean | Prisma.CompanyDefaultArgs<ExtArgs>;
    customer?: boolean | Prisma.CustomerDefaultArgs<ExtArgs>;
    technician?: boolean | Prisma.WorkOrder$technicianArgs<ExtArgs>;
};
export type $WorkOrderPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "WorkOrder";
    objects: {
        company: Prisma.$CompanyPayload<ExtArgs>;
        customer: Prisma.$CustomerPayload<ExtArgs>;
        technician: Prisma.$TechnicianPayload<ExtArgs> | null;
        statusHistory: Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>[];
        invoice: Prisma.$InvoicePayload<ExtArgs> | null;
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        companyId: string;
        customerId: string;
        technicianId: string | null;
        priority: $Enums.WorkOrderPriority;
        scheduledAt: Date | null;
        status: $Enums.WorkOrderStatus;
        description: string;
        notes: string | null;
        completedAt: Date | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["workOrder"]>;
    composites: {};
};
export type WorkOrderGetPayload<S extends boolean | null | undefined | WorkOrderDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload, S>;
export type WorkOrderCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<WorkOrderFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: WorkOrderCountAggregateInputType | true;
};
export interface WorkOrderDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['WorkOrder'];
        meta: {
            name: 'WorkOrder';
        };
    };
    findUnique<T extends WorkOrderFindUniqueArgs>(args: Prisma.SelectSubset<T, WorkOrderFindUniqueArgs<ExtArgs>>): Prisma.Prisma__WorkOrderClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends WorkOrderFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, WorkOrderFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__WorkOrderClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends WorkOrderFindFirstArgs>(args?: Prisma.SelectSubset<T, WorkOrderFindFirstArgs<ExtArgs>>): Prisma.Prisma__WorkOrderClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends WorkOrderFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, WorkOrderFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__WorkOrderClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends WorkOrderFindManyArgs>(args?: Prisma.SelectSubset<T, WorkOrderFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends WorkOrderCreateArgs>(args: Prisma.SelectSubset<T, WorkOrderCreateArgs<ExtArgs>>): Prisma.Prisma__WorkOrderClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends WorkOrderCreateManyArgs>(args?: Prisma.SelectSubset<T, WorkOrderCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends WorkOrderCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, WorkOrderCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends WorkOrderDeleteArgs>(args: Prisma.SelectSubset<T, WorkOrderDeleteArgs<ExtArgs>>): Prisma.Prisma__WorkOrderClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends WorkOrderUpdateArgs>(args: Prisma.SelectSubset<T, WorkOrderUpdateArgs<ExtArgs>>): Prisma.Prisma__WorkOrderClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends WorkOrderDeleteManyArgs>(args?: Prisma.SelectSubset<T, WorkOrderDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends WorkOrderUpdateManyArgs>(args: Prisma.SelectSubset<T, WorkOrderUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends WorkOrderUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, WorkOrderUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends WorkOrderUpsertArgs>(args: Prisma.SelectSubset<T, WorkOrderUpsertArgs<ExtArgs>>): Prisma.Prisma__WorkOrderClient<runtime.Types.Result.GetResult<Prisma.$WorkOrderPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends WorkOrderCountArgs>(args?: Prisma.Subset<T, WorkOrderCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], WorkOrderCountAggregateOutputType> : number>;
    aggregate<T extends WorkOrderAggregateArgs>(args: Prisma.Subset<T, WorkOrderAggregateArgs>): Prisma.PrismaPromise<GetWorkOrderAggregateType<T>>;
    groupBy<T extends WorkOrderGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: WorkOrderGroupByArgs['orderBy'];
    } : {
        orderBy?: WorkOrderGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, WorkOrderGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetWorkOrderGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: WorkOrderFieldRefs;
}
export interface Prisma__WorkOrderClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    company<T extends Prisma.CompanyDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CompanyDefaultArgs<ExtArgs>>): Prisma.Prisma__CompanyClient<runtime.Types.Result.GetResult<Prisma.$CompanyPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    customer<T extends Prisma.CustomerDefaultArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.CustomerDefaultArgs<ExtArgs>>): Prisma.Prisma__CustomerClient<runtime.Types.Result.GetResult<Prisma.$CustomerPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | Null, Null, ExtArgs, GlobalOmitOptions>;
    technician<T extends Prisma.WorkOrder$technicianArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.WorkOrder$technicianArgs<ExtArgs>>): Prisma.Prisma__TechnicianClient<runtime.Types.Result.GetResult<Prisma.$TechnicianPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    statusHistory<T extends Prisma.WorkOrder$statusHistoryArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.WorkOrder$statusHistoryArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$WorkOrderStatusHistoryPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    invoice<T extends Prisma.WorkOrder$invoiceArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.WorkOrder$invoiceArgs<ExtArgs>>): Prisma.Prisma__InvoiceClient<runtime.Types.Result.GetResult<Prisma.$InvoicePayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface WorkOrderFieldRefs {
    readonly id: Prisma.FieldRef<"WorkOrder", 'String'>;
    readonly companyId: Prisma.FieldRef<"WorkOrder", 'String'>;
    readonly customerId: Prisma.FieldRef<"WorkOrder", 'String'>;
    readonly technicianId: Prisma.FieldRef<"WorkOrder", 'String'>;
    readonly priority: Prisma.FieldRef<"WorkOrder", 'WorkOrderPriority'>;
    readonly scheduledAt: Prisma.FieldRef<"WorkOrder", 'DateTime'>;
    readonly status: Prisma.FieldRef<"WorkOrder", 'WorkOrderStatus'>;
    readonly description: Prisma.FieldRef<"WorkOrder", 'String'>;
    readonly notes: Prisma.FieldRef<"WorkOrder", 'String'>;
    readonly completedAt: Prisma.FieldRef<"WorkOrder", 'DateTime'>;
    readonly createdAt: Prisma.FieldRef<"WorkOrder", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"WorkOrder", 'DateTime'>;
}
export type WorkOrderFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderSelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderInclude<ExtArgs> | null;
    where: Prisma.WorkOrderWhereUniqueInput;
};
export type WorkOrderFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderSelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderInclude<ExtArgs> | null;
    where: Prisma.WorkOrderWhereUniqueInput;
};
export type WorkOrderFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type WorkOrderFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type WorkOrderFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type WorkOrderCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderSelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkOrderCreateInput, Prisma.WorkOrderUncheckedCreateInput>;
};
export type WorkOrderCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.WorkOrderCreateManyInput | Prisma.WorkOrderCreateManyInput[];
    skipDuplicates?: boolean;
};
export type WorkOrderCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WorkOrderOmit<ExtArgs> | null;
    data: Prisma.WorkOrderCreateManyInput | Prisma.WorkOrderCreateManyInput[];
    skipDuplicates?: boolean;
    include?: Prisma.WorkOrderIncludeCreateManyAndReturn<ExtArgs> | null;
};
export type WorkOrderUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderSelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkOrderUpdateInput, Prisma.WorkOrderUncheckedUpdateInput>;
    where: Prisma.WorkOrderWhereUniqueInput;
};
export type WorkOrderUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.WorkOrderUpdateManyMutationInput, Prisma.WorkOrderUncheckedUpdateManyInput>;
    where?: Prisma.WorkOrderWhereInput;
    limit?: number;
};
export type WorkOrderUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.WorkOrderOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.WorkOrderUpdateManyMutationInput, Prisma.WorkOrderUncheckedUpdateManyInput>;
    where?: Prisma.WorkOrderWhereInput;
    limit?: number;
    include?: Prisma.WorkOrderIncludeUpdateManyAndReturn<ExtArgs> | null;
};
export type WorkOrderUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderSelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderInclude<ExtArgs> | null;
    where: Prisma.WorkOrderWhereUniqueInput;
    create: Prisma.XOR<Prisma.WorkOrderCreateInput, Prisma.WorkOrderUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.WorkOrderUpdateInput, Prisma.WorkOrderUncheckedUpdateInput>;
};
export type WorkOrderDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderSelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderInclude<ExtArgs> | null;
    where: Prisma.WorkOrderWhereUniqueInput;
};
export type WorkOrderDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.WorkOrderWhereInput;
    limit?: number;
};
export type WorkOrder$technicianArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TechnicianSelect<ExtArgs> | null;
    omit?: Prisma.TechnicianOmit<ExtArgs> | null;
    include?: Prisma.TechnicianInclude<ExtArgs> | null;
    where?: Prisma.TechnicianWhereInput;
};
export type WorkOrder$statusHistoryArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type WorkOrder$invoiceArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.InvoiceSelect<ExtArgs> | null;
    omit?: Prisma.InvoiceOmit<ExtArgs> | null;
    include?: Prisma.InvoiceInclude<ExtArgs> | null;
    where?: Prisma.InvoiceWhereInput;
};
export type WorkOrderDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.WorkOrderSelect<ExtArgs> | null;
    omit?: Prisma.WorkOrderOmit<ExtArgs> | null;
    include?: Prisma.WorkOrderInclude<ExtArgs> | null;
};
export {};

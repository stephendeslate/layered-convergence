import type * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../internal/prismaNamespace.js";
export type TenantModel = runtime.Types.Result.DefaultSelection<Prisma.$TenantPayload>;
export type AggregateTenant = {
    _count: TenantCountAggregateOutputType | null;
    _min: TenantMinAggregateOutputType | null;
    _max: TenantMaxAggregateOutputType | null;
};
export type TenantMinAggregateOutputType = {
    id: string | null;
    name: string | null;
    apiKey: string | null;
    primaryColor: string | null;
    fontFamily: string | null;
    logoUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TenantMaxAggregateOutputType = {
    id: string | null;
    name: string | null;
    apiKey: string | null;
    primaryColor: string | null;
    fontFamily: string | null;
    logoUrl: string | null;
    createdAt: Date | null;
    updatedAt: Date | null;
};
export type TenantCountAggregateOutputType = {
    id: number;
    name: number;
    apiKey: number;
    primaryColor: number;
    fontFamily: number;
    logoUrl: number;
    createdAt: number;
    updatedAt: number;
    _all: number;
};
export type TenantMinAggregateInputType = {
    id?: true;
    name?: true;
    apiKey?: true;
    primaryColor?: true;
    fontFamily?: true;
    logoUrl?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TenantMaxAggregateInputType = {
    id?: true;
    name?: true;
    apiKey?: true;
    primaryColor?: true;
    fontFamily?: true;
    logoUrl?: true;
    createdAt?: true;
    updatedAt?: true;
};
export type TenantCountAggregateInputType = {
    id?: true;
    name?: true;
    apiKey?: true;
    primaryColor?: true;
    fontFamily?: true;
    logoUrl?: true;
    createdAt?: true;
    updatedAt?: true;
    _all?: true;
};
export type TenantAggregateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TenantWhereInput;
    orderBy?: Prisma.TenantOrderByWithRelationInput | Prisma.TenantOrderByWithRelationInput[];
    cursor?: Prisma.TenantWhereUniqueInput;
    take?: number;
    skip?: number;
    _count?: true | TenantCountAggregateInputType;
    _min?: TenantMinAggregateInputType;
    _max?: TenantMaxAggregateInputType;
};
export type GetTenantAggregateType<T extends TenantAggregateArgs> = {
    [P in keyof T & keyof AggregateTenant]: P extends '_count' | 'count' ? T[P] extends true ? number : Prisma.GetScalarType<T[P], AggregateTenant[P]> : Prisma.GetScalarType<T[P], AggregateTenant[P]>;
};
export type TenantGroupByArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TenantWhereInput;
    orderBy?: Prisma.TenantOrderByWithAggregationInput | Prisma.TenantOrderByWithAggregationInput[];
    by: Prisma.TenantScalarFieldEnum[] | Prisma.TenantScalarFieldEnum;
    having?: Prisma.TenantScalarWhereWithAggregatesInput;
    take?: number;
    skip?: number;
    _count?: TenantCountAggregateInputType | true;
    _min?: TenantMinAggregateInputType;
    _max?: TenantMaxAggregateInputType;
};
export type TenantGroupByOutputType = {
    id: string;
    name: string;
    apiKey: string;
    primaryColor: string | null;
    fontFamily: string | null;
    logoUrl: string | null;
    createdAt: Date;
    updatedAt: Date;
    _count: TenantCountAggregateOutputType | null;
    _min: TenantMinAggregateOutputType | null;
    _max: TenantMaxAggregateOutputType | null;
};
type GetTenantGroupByPayload<T extends TenantGroupByArgs> = Prisma.PrismaPromise<Array<Prisma.PickEnumerable<TenantGroupByOutputType, T['by']> & {
    [P in ((keyof T) & (keyof TenantGroupByOutputType))]: P extends '_count' ? T[P] extends boolean ? number : Prisma.GetScalarType<T[P], TenantGroupByOutputType[P]> : Prisma.GetScalarType<T[P], TenantGroupByOutputType[P]>;
}>>;
export type TenantWhereInput = {
    AND?: Prisma.TenantWhereInput | Prisma.TenantWhereInput[];
    OR?: Prisma.TenantWhereInput[];
    NOT?: Prisma.TenantWhereInput | Prisma.TenantWhereInput[];
    id?: Prisma.UuidFilter<"Tenant"> | string;
    name?: Prisma.StringFilter<"Tenant"> | string;
    apiKey?: Prisma.StringFilter<"Tenant"> | string;
    primaryColor?: Prisma.StringNullableFilter<"Tenant"> | string | null;
    fontFamily?: Prisma.StringNullableFilter<"Tenant"> | string | null;
    logoUrl?: Prisma.StringNullableFilter<"Tenant"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Tenant"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Tenant"> | Date | string;
    dashboards?: Prisma.DashboardListRelationFilter;
    dataSources?: Prisma.DataSourceListRelationFilter;
    dataPoints?: Prisma.DataPointListRelationFilter;
};
export type TenantOrderByWithRelationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    apiKey?: Prisma.SortOrder;
    primaryColor?: Prisma.SortOrderInput | Prisma.SortOrder;
    fontFamily?: Prisma.SortOrderInput | Prisma.SortOrder;
    logoUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    dashboards?: Prisma.DashboardOrderByRelationAggregateInput;
    dataSources?: Prisma.DataSourceOrderByRelationAggregateInput;
    dataPoints?: Prisma.DataPointOrderByRelationAggregateInput;
};
export type TenantWhereUniqueInput = Prisma.AtLeast<{
    id?: string;
    apiKey?: string;
    AND?: Prisma.TenantWhereInput | Prisma.TenantWhereInput[];
    OR?: Prisma.TenantWhereInput[];
    NOT?: Prisma.TenantWhereInput | Prisma.TenantWhereInput[];
    name?: Prisma.StringFilter<"Tenant"> | string;
    primaryColor?: Prisma.StringNullableFilter<"Tenant"> | string | null;
    fontFamily?: Prisma.StringNullableFilter<"Tenant"> | string | null;
    logoUrl?: Prisma.StringNullableFilter<"Tenant"> | string | null;
    createdAt?: Prisma.DateTimeFilter<"Tenant"> | Date | string;
    updatedAt?: Prisma.DateTimeFilter<"Tenant"> | Date | string;
    dashboards?: Prisma.DashboardListRelationFilter;
    dataSources?: Prisma.DataSourceListRelationFilter;
    dataPoints?: Prisma.DataPointListRelationFilter;
}, "id" | "apiKey">;
export type TenantOrderByWithAggregationInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    apiKey?: Prisma.SortOrder;
    primaryColor?: Prisma.SortOrderInput | Prisma.SortOrder;
    fontFamily?: Prisma.SortOrderInput | Prisma.SortOrder;
    logoUrl?: Prisma.SortOrderInput | Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
    _count?: Prisma.TenantCountOrderByAggregateInput;
    _max?: Prisma.TenantMaxOrderByAggregateInput;
    _min?: Prisma.TenantMinOrderByAggregateInput;
};
export type TenantScalarWhereWithAggregatesInput = {
    AND?: Prisma.TenantScalarWhereWithAggregatesInput | Prisma.TenantScalarWhereWithAggregatesInput[];
    OR?: Prisma.TenantScalarWhereWithAggregatesInput[];
    NOT?: Prisma.TenantScalarWhereWithAggregatesInput | Prisma.TenantScalarWhereWithAggregatesInput[];
    id?: Prisma.UuidWithAggregatesFilter<"Tenant"> | string;
    name?: Prisma.StringWithAggregatesFilter<"Tenant"> | string;
    apiKey?: Prisma.StringWithAggregatesFilter<"Tenant"> | string;
    primaryColor?: Prisma.StringNullableWithAggregatesFilter<"Tenant"> | string | null;
    fontFamily?: Prisma.StringNullableWithAggregatesFilter<"Tenant"> | string | null;
    logoUrl?: Prisma.StringNullableWithAggregatesFilter<"Tenant"> | string | null;
    createdAt?: Prisma.DateTimeWithAggregatesFilter<"Tenant"> | Date | string;
    updatedAt?: Prisma.DateTimeWithAggregatesFilter<"Tenant"> | Date | string;
};
export type TenantCreateInput = {
    id?: string;
    name: string;
    apiKey: string;
    primaryColor?: string | null;
    fontFamily?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dashboards?: Prisma.DashboardCreateNestedManyWithoutTenantInput;
    dataSources?: Prisma.DataSourceCreateNestedManyWithoutTenantInput;
    dataPoints?: Prisma.DataPointCreateNestedManyWithoutTenantInput;
};
export type TenantUncheckedCreateInput = {
    id?: string;
    name: string;
    apiKey: string;
    primaryColor?: string | null;
    fontFamily?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dashboards?: Prisma.DashboardUncheckedCreateNestedManyWithoutTenantInput;
    dataSources?: Prisma.DataSourceUncheckedCreateNestedManyWithoutTenantInput;
    dataPoints?: Prisma.DataPointUncheckedCreateNestedManyWithoutTenantInput;
};
export type TenantUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    apiKey?: Prisma.StringFieldUpdateOperationsInput | string;
    primaryColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fontFamily?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dashboards?: Prisma.DashboardUpdateManyWithoutTenantNestedInput;
    dataSources?: Prisma.DataSourceUpdateManyWithoutTenantNestedInput;
    dataPoints?: Prisma.DataPointUpdateManyWithoutTenantNestedInput;
};
export type TenantUncheckedUpdateInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    apiKey?: Prisma.StringFieldUpdateOperationsInput | string;
    primaryColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fontFamily?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dashboards?: Prisma.DashboardUncheckedUpdateManyWithoutTenantNestedInput;
    dataSources?: Prisma.DataSourceUncheckedUpdateManyWithoutTenantNestedInput;
    dataPoints?: Prisma.DataPointUncheckedUpdateManyWithoutTenantNestedInput;
};
export type TenantCreateManyInput = {
    id?: string;
    name: string;
    apiKey: string;
    primaryColor?: string | null;
    fontFamily?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
};
export type TenantUpdateManyMutationInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    apiKey?: Prisma.StringFieldUpdateOperationsInput | string;
    primaryColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fontFamily?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TenantUncheckedUpdateManyInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    apiKey?: Prisma.StringFieldUpdateOperationsInput | string;
    primaryColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fontFamily?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
};
export type TenantCountOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    apiKey?: Prisma.SortOrder;
    primaryColor?: Prisma.SortOrder;
    fontFamily?: Prisma.SortOrder;
    logoUrl?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TenantMaxOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    apiKey?: Prisma.SortOrder;
    primaryColor?: Prisma.SortOrder;
    fontFamily?: Prisma.SortOrder;
    logoUrl?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TenantMinOrderByAggregateInput = {
    id?: Prisma.SortOrder;
    name?: Prisma.SortOrder;
    apiKey?: Prisma.SortOrder;
    primaryColor?: Prisma.SortOrder;
    fontFamily?: Prisma.SortOrder;
    logoUrl?: Prisma.SortOrder;
    createdAt?: Prisma.SortOrder;
    updatedAt?: Prisma.SortOrder;
};
export type TenantScalarRelationFilter = {
    is?: Prisma.TenantWhereInput;
    isNot?: Prisma.TenantWhereInput;
};
export type StringFieldUpdateOperationsInput = {
    set?: string;
};
export type NullableStringFieldUpdateOperationsInput = {
    set?: string | null;
};
export type DateTimeFieldUpdateOperationsInput = {
    set?: Date | string;
};
export type TenantCreateNestedOneWithoutDashboardsInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutDashboardsInput, Prisma.TenantUncheckedCreateWithoutDashboardsInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutDashboardsInput;
    connect?: Prisma.TenantWhereUniqueInput;
};
export type TenantUpdateOneRequiredWithoutDashboardsNestedInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutDashboardsInput, Prisma.TenantUncheckedCreateWithoutDashboardsInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutDashboardsInput;
    upsert?: Prisma.TenantUpsertWithoutDashboardsInput;
    connect?: Prisma.TenantWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TenantUpdateToOneWithWhereWithoutDashboardsInput, Prisma.TenantUpdateWithoutDashboardsInput>, Prisma.TenantUncheckedUpdateWithoutDashboardsInput>;
};
export type TenantCreateNestedOneWithoutDataSourcesInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutDataSourcesInput, Prisma.TenantUncheckedCreateWithoutDataSourcesInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutDataSourcesInput;
    connect?: Prisma.TenantWhereUniqueInput;
};
export type TenantUpdateOneRequiredWithoutDataSourcesNestedInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutDataSourcesInput, Prisma.TenantUncheckedCreateWithoutDataSourcesInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutDataSourcesInput;
    upsert?: Prisma.TenantUpsertWithoutDataSourcesInput;
    connect?: Prisma.TenantWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TenantUpdateToOneWithWhereWithoutDataSourcesInput, Prisma.TenantUpdateWithoutDataSourcesInput>, Prisma.TenantUncheckedUpdateWithoutDataSourcesInput>;
};
export type TenantCreateNestedOneWithoutDataPointsInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutDataPointsInput, Prisma.TenantUncheckedCreateWithoutDataPointsInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutDataPointsInput;
    connect?: Prisma.TenantWhereUniqueInput;
};
export type TenantUpdateOneRequiredWithoutDataPointsNestedInput = {
    create?: Prisma.XOR<Prisma.TenantCreateWithoutDataPointsInput, Prisma.TenantUncheckedCreateWithoutDataPointsInput>;
    connectOrCreate?: Prisma.TenantCreateOrConnectWithoutDataPointsInput;
    upsert?: Prisma.TenantUpsertWithoutDataPointsInput;
    connect?: Prisma.TenantWhereUniqueInput;
    update?: Prisma.XOR<Prisma.XOR<Prisma.TenantUpdateToOneWithWhereWithoutDataPointsInput, Prisma.TenantUpdateWithoutDataPointsInput>, Prisma.TenantUncheckedUpdateWithoutDataPointsInput>;
};
export type TenantCreateWithoutDashboardsInput = {
    id?: string;
    name: string;
    apiKey: string;
    primaryColor?: string | null;
    fontFamily?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dataSources?: Prisma.DataSourceCreateNestedManyWithoutTenantInput;
    dataPoints?: Prisma.DataPointCreateNestedManyWithoutTenantInput;
};
export type TenantUncheckedCreateWithoutDashboardsInput = {
    id?: string;
    name: string;
    apiKey: string;
    primaryColor?: string | null;
    fontFamily?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dataSources?: Prisma.DataSourceUncheckedCreateNestedManyWithoutTenantInput;
    dataPoints?: Prisma.DataPointUncheckedCreateNestedManyWithoutTenantInput;
};
export type TenantCreateOrConnectWithoutDashboardsInput = {
    where: Prisma.TenantWhereUniqueInput;
    create: Prisma.XOR<Prisma.TenantCreateWithoutDashboardsInput, Prisma.TenantUncheckedCreateWithoutDashboardsInput>;
};
export type TenantUpsertWithoutDashboardsInput = {
    update: Prisma.XOR<Prisma.TenantUpdateWithoutDashboardsInput, Prisma.TenantUncheckedUpdateWithoutDashboardsInput>;
    create: Prisma.XOR<Prisma.TenantCreateWithoutDashboardsInput, Prisma.TenantUncheckedCreateWithoutDashboardsInput>;
    where?: Prisma.TenantWhereInput;
};
export type TenantUpdateToOneWithWhereWithoutDashboardsInput = {
    where?: Prisma.TenantWhereInput;
    data: Prisma.XOR<Prisma.TenantUpdateWithoutDashboardsInput, Prisma.TenantUncheckedUpdateWithoutDashboardsInput>;
};
export type TenantUpdateWithoutDashboardsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    apiKey?: Prisma.StringFieldUpdateOperationsInput | string;
    primaryColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fontFamily?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dataSources?: Prisma.DataSourceUpdateManyWithoutTenantNestedInput;
    dataPoints?: Prisma.DataPointUpdateManyWithoutTenantNestedInput;
};
export type TenantUncheckedUpdateWithoutDashboardsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    apiKey?: Prisma.StringFieldUpdateOperationsInput | string;
    primaryColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fontFamily?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dataSources?: Prisma.DataSourceUncheckedUpdateManyWithoutTenantNestedInput;
    dataPoints?: Prisma.DataPointUncheckedUpdateManyWithoutTenantNestedInput;
};
export type TenantCreateWithoutDataSourcesInput = {
    id?: string;
    name: string;
    apiKey: string;
    primaryColor?: string | null;
    fontFamily?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dashboards?: Prisma.DashboardCreateNestedManyWithoutTenantInput;
    dataPoints?: Prisma.DataPointCreateNestedManyWithoutTenantInput;
};
export type TenantUncheckedCreateWithoutDataSourcesInput = {
    id?: string;
    name: string;
    apiKey: string;
    primaryColor?: string | null;
    fontFamily?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dashboards?: Prisma.DashboardUncheckedCreateNestedManyWithoutTenantInput;
    dataPoints?: Prisma.DataPointUncheckedCreateNestedManyWithoutTenantInput;
};
export type TenantCreateOrConnectWithoutDataSourcesInput = {
    where: Prisma.TenantWhereUniqueInput;
    create: Prisma.XOR<Prisma.TenantCreateWithoutDataSourcesInput, Prisma.TenantUncheckedCreateWithoutDataSourcesInput>;
};
export type TenantUpsertWithoutDataSourcesInput = {
    update: Prisma.XOR<Prisma.TenantUpdateWithoutDataSourcesInput, Prisma.TenantUncheckedUpdateWithoutDataSourcesInput>;
    create: Prisma.XOR<Prisma.TenantCreateWithoutDataSourcesInput, Prisma.TenantUncheckedCreateWithoutDataSourcesInput>;
    where?: Prisma.TenantWhereInput;
};
export type TenantUpdateToOneWithWhereWithoutDataSourcesInput = {
    where?: Prisma.TenantWhereInput;
    data: Prisma.XOR<Prisma.TenantUpdateWithoutDataSourcesInput, Prisma.TenantUncheckedUpdateWithoutDataSourcesInput>;
};
export type TenantUpdateWithoutDataSourcesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    apiKey?: Prisma.StringFieldUpdateOperationsInput | string;
    primaryColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fontFamily?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dashboards?: Prisma.DashboardUpdateManyWithoutTenantNestedInput;
    dataPoints?: Prisma.DataPointUpdateManyWithoutTenantNestedInput;
};
export type TenantUncheckedUpdateWithoutDataSourcesInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    apiKey?: Prisma.StringFieldUpdateOperationsInput | string;
    primaryColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fontFamily?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dashboards?: Prisma.DashboardUncheckedUpdateManyWithoutTenantNestedInput;
    dataPoints?: Prisma.DataPointUncheckedUpdateManyWithoutTenantNestedInput;
};
export type TenantCreateWithoutDataPointsInput = {
    id?: string;
    name: string;
    apiKey: string;
    primaryColor?: string | null;
    fontFamily?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dashboards?: Prisma.DashboardCreateNestedManyWithoutTenantInput;
    dataSources?: Prisma.DataSourceCreateNestedManyWithoutTenantInput;
};
export type TenantUncheckedCreateWithoutDataPointsInput = {
    id?: string;
    name: string;
    apiKey: string;
    primaryColor?: string | null;
    fontFamily?: string | null;
    logoUrl?: string | null;
    createdAt?: Date | string;
    updatedAt?: Date | string;
    dashboards?: Prisma.DashboardUncheckedCreateNestedManyWithoutTenantInput;
    dataSources?: Prisma.DataSourceUncheckedCreateNestedManyWithoutTenantInput;
};
export type TenantCreateOrConnectWithoutDataPointsInput = {
    where: Prisma.TenantWhereUniqueInput;
    create: Prisma.XOR<Prisma.TenantCreateWithoutDataPointsInput, Prisma.TenantUncheckedCreateWithoutDataPointsInput>;
};
export type TenantUpsertWithoutDataPointsInput = {
    update: Prisma.XOR<Prisma.TenantUpdateWithoutDataPointsInput, Prisma.TenantUncheckedUpdateWithoutDataPointsInput>;
    create: Prisma.XOR<Prisma.TenantCreateWithoutDataPointsInput, Prisma.TenantUncheckedCreateWithoutDataPointsInput>;
    where?: Prisma.TenantWhereInput;
};
export type TenantUpdateToOneWithWhereWithoutDataPointsInput = {
    where?: Prisma.TenantWhereInput;
    data: Prisma.XOR<Prisma.TenantUpdateWithoutDataPointsInput, Prisma.TenantUncheckedUpdateWithoutDataPointsInput>;
};
export type TenantUpdateWithoutDataPointsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    apiKey?: Prisma.StringFieldUpdateOperationsInput | string;
    primaryColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fontFamily?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dashboards?: Prisma.DashboardUpdateManyWithoutTenantNestedInput;
    dataSources?: Prisma.DataSourceUpdateManyWithoutTenantNestedInput;
};
export type TenantUncheckedUpdateWithoutDataPointsInput = {
    id?: Prisma.StringFieldUpdateOperationsInput | string;
    name?: Prisma.StringFieldUpdateOperationsInput | string;
    apiKey?: Prisma.StringFieldUpdateOperationsInput | string;
    primaryColor?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    fontFamily?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    logoUrl?: Prisma.NullableStringFieldUpdateOperationsInput | string | null;
    createdAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    updatedAt?: Prisma.DateTimeFieldUpdateOperationsInput | Date | string;
    dashboards?: Prisma.DashboardUncheckedUpdateManyWithoutTenantNestedInput;
    dataSources?: Prisma.DataSourceUncheckedUpdateManyWithoutTenantNestedInput;
};
export type TenantCountOutputType = {
    dashboards: number;
    dataSources: number;
    dataPoints: number;
};
export type TenantCountOutputTypeSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dashboards?: boolean | TenantCountOutputTypeCountDashboardsArgs;
    dataSources?: boolean | TenantCountOutputTypeCountDataSourcesArgs;
    dataPoints?: boolean | TenantCountOutputTypeCountDataPointsArgs;
};
export type TenantCountOutputTypeDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantCountOutputTypeSelect<ExtArgs> | null;
};
export type TenantCountOutputTypeCountDashboardsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DashboardWhereInput;
};
export type TenantCountOutputTypeCountDataSourcesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataSourceWhereInput;
};
export type TenantCountOutputTypeCountDataPointsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.DataPointWhereInput;
};
export type TenantSelect<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    apiKey?: boolean;
    primaryColor?: boolean;
    fontFamily?: boolean;
    logoUrl?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
    dashboards?: boolean | Prisma.Tenant$dashboardsArgs<ExtArgs>;
    dataSources?: boolean | Prisma.Tenant$dataSourcesArgs<ExtArgs>;
    dataPoints?: boolean | Prisma.Tenant$dataPointsArgs<ExtArgs>;
    _count?: boolean | Prisma.TenantCountOutputTypeDefaultArgs<ExtArgs>;
}, ExtArgs["result"]["tenant"]>;
export type TenantSelectCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    apiKey?: boolean;
    primaryColor?: boolean;
    fontFamily?: boolean;
    logoUrl?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["tenant"]>;
export type TenantSelectUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetSelect<{
    id?: boolean;
    name?: boolean;
    apiKey?: boolean;
    primaryColor?: boolean;
    fontFamily?: boolean;
    logoUrl?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
}, ExtArgs["result"]["tenant"]>;
export type TenantSelectScalar = {
    id?: boolean;
    name?: boolean;
    apiKey?: boolean;
    primaryColor?: boolean;
    fontFamily?: boolean;
    logoUrl?: boolean;
    createdAt?: boolean;
    updatedAt?: boolean;
};
export type TenantOmit<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = runtime.Types.Extensions.GetOmit<"id" | "name" | "apiKey" | "primaryColor" | "fontFamily" | "logoUrl" | "createdAt" | "updatedAt", ExtArgs["result"]["tenant"]>;
export type TenantInclude<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    dashboards?: boolean | Prisma.Tenant$dashboardsArgs<ExtArgs>;
    dataSources?: boolean | Prisma.Tenant$dataSourcesArgs<ExtArgs>;
    dataPoints?: boolean | Prisma.Tenant$dataPointsArgs<ExtArgs>;
    _count?: boolean | Prisma.TenantCountOutputTypeDefaultArgs<ExtArgs>;
};
export type TenantIncludeCreateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type TenantIncludeUpdateManyAndReturn<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {};
export type $TenantPayload<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    name: "Tenant";
    objects: {
        dashboards: Prisma.$DashboardPayload<ExtArgs>[];
        dataSources: Prisma.$DataSourcePayload<ExtArgs>[];
        dataPoints: Prisma.$DataPointPayload<ExtArgs>[];
    };
    scalars: runtime.Types.Extensions.GetPayloadResult<{
        id: string;
        name: string;
        apiKey: string;
        primaryColor: string | null;
        fontFamily: string | null;
        logoUrl: string | null;
        createdAt: Date;
        updatedAt: Date;
    }, ExtArgs["result"]["tenant"]>;
    composites: {};
};
export type TenantGetPayload<S extends boolean | null | undefined | TenantDefaultArgs> = runtime.Types.Result.GetResult<Prisma.$TenantPayload, S>;
export type TenantCountArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = Omit<TenantFindManyArgs, 'select' | 'include' | 'distinct' | 'omit'> & {
    select?: TenantCountAggregateInputType | true;
};
export interface TenantDelegate<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> {
    [K: symbol]: {
        types: Prisma.TypeMap<ExtArgs>['model']['Tenant'];
        meta: {
            name: 'Tenant';
        };
    };
    findUnique<T extends TenantFindUniqueArgs>(args: Prisma.SelectSubset<T, TenantFindUniqueArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUnique", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findUniqueOrThrow<T extends TenantFindUniqueOrThrowArgs>(args: Prisma.SelectSubset<T, TenantFindUniqueOrThrowArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findUniqueOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findFirst<T extends TenantFindFirstArgs>(args?: Prisma.SelectSubset<T, TenantFindFirstArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirst", GlobalOmitOptions> | null, null, ExtArgs, GlobalOmitOptions>;
    findFirstOrThrow<T extends TenantFindFirstOrThrowArgs>(args?: Prisma.SelectSubset<T, TenantFindFirstOrThrowArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findFirstOrThrow", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    findMany<T extends TenantFindManyArgs>(args?: Prisma.SelectSubset<T, TenantFindManyArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "findMany", GlobalOmitOptions>>;
    create<T extends TenantCreateArgs>(args: Prisma.SelectSubset<T, TenantCreateArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "create", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    createMany<T extends TenantCreateManyArgs>(args?: Prisma.SelectSubset<T, TenantCreateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    createManyAndReturn<T extends TenantCreateManyAndReturnArgs>(args?: Prisma.SelectSubset<T, TenantCreateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "createManyAndReturn", GlobalOmitOptions>>;
    delete<T extends TenantDeleteArgs>(args: Prisma.SelectSubset<T, TenantDeleteArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "delete", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    update<T extends TenantUpdateArgs>(args: Prisma.SelectSubset<T, TenantUpdateArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "update", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    deleteMany<T extends TenantDeleteManyArgs>(args?: Prisma.SelectSubset<T, TenantDeleteManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateMany<T extends TenantUpdateManyArgs>(args: Prisma.SelectSubset<T, TenantUpdateManyArgs<ExtArgs>>): Prisma.PrismaPromise<Prisma.BatchPayload>;
    updateManyAndReturn<T extends TenantUpdateManyAndReturnArgs>(args: Prisma.SelectSubset<T, TenantUpdateManyAndReturnArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "updateManyAndReturn", GlobalOmitOptions>>;
    upsert<T extends TenantUpsertArgs>(args: Prisma.SelectSubset<T, TenantUpsertArgs<ExtArgs>>): Prisma.Prisma__TenantClient<runtime.Types.Result.GetResult<Prisma.$TenantPayload<ExtArgs>, T, "upsert", GlobalOmitOptions>, never, ExtArgs, GlobalOmitOptions>;
    count<T extends TenantCountArgs>(args?: Prisma.Subset<T, TenantCountArgs>): Prisma.PrismaPromise<T extends runtime.Types.Utils.Record<'select', any> ? T['select'] extends true ? number : Prisma.GetScalarType<T['select'], TenantCountAggregateOutputType> : number>;
    aggregate<T extends TenantAggregateArgs>(args: Prisma.Subset<T, TenantAggregateArgs>): Prisma.PrismaPromise<GetTenantAggregateType<T>>;
    groupBy<T extends TenantGroupByArgs, HasSelectOrTake extends Prisma.Or<Prisma.Extends<'skip', Prisma.Keys<T>>, Prisma.Extends<'take', Prisma.Keys<T>>>, OrderByArg extends Prisma.True extends HasSelectOrTake ? {
        orderBy: TenantGroupByArgs['orderBy'];
    } : {
        orderBy?: TenantGroupByArgs['orderBy'];
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
    }[OrderFields]>(args: Prisma.SubsetIntersection<T, TenantGroupByArgs, OrderByArg> & InputErrors): {} extends InputErrors ? GetTenantGroupByPayload<T> : Prisma.PrismaPromise<InputErrors>;
    readonly fields: TenantFieldRefs;
}
export interface Prisma__TenantClient<T, Null = never, ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> extends Prisma.PrismaPromise<T> {
    readonly [Symbol.toStringTag]: "PrismaPromise";
    dashboards<T extends Prisma.Tenant$dashboardsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Tenant$dashboardsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DashboardPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    dataSources<T extends Prisma.Tenant$dataSourcesArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Tenant$dataSourcesArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataSourcePayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    dataPoints<T extends Prisma.Tenant$dataPointsArgs<ExtArgs> = {}>(args?: Prisma.Subset<T, Prisma.Tenant$dataPointsArgs<ExtArgs>>): Prisma.PrismaPromise<runtime.Types.Result.GetResult<Prisma.$DataPointPayload<ExtArgs>, T, "findMany", GlobalOmitOptions> | Null>;
    then<TResult1 = T, TResult2 = never>(onfulfilled?: ((value: T) => TResult1 | PromiseLike<TResult1>) | undefined | null, onrejected?: ((reason: any) => TResult2 | PromiseLike<TResult2>) | undefined | null): runtime.Types.Utils.JsPromise<TResult1 | TResult2>;
    catch<TResult = never>(onrejected?: ((reason: any) => TResult | PromiseLike<TResult>) | undefined | null): runtime.Types.Utils.JsPromise<T | TResult>;
    finally(onfinally?: (() => void) | undefined | null): runtime.Types.Utils.JsPromise<T>;
}
export interface TenantFieldRefs {
    readonly id: Prisma.FieldRef<"Tenant", 'String'>;
    readonly name: Prisma.FieldRef<"Tenant", 'String'>;
    readonly apiKey: Prisma.FieldRef<"Tenant", 'String'>;
    readonly primaryColor: Prisma.FieldRef<"Tenant", 'String'>;
    readonly fontFamily: Prisma.FieldRef<"Tenant", 'String'>;
    readonly logoUrl: Prisma.FieldRef<"Tenant", 'String'>;
    readonly createdAt: Prisma.FieldRef<"Tenant", 'DateTime'>;
    readonly updatedAt: Prisma.FieldRef<"Tenant", 'DateTime'>;
}
export type TenantFindUniqueArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where: Prisma.TenantWhereUniqueInput;
};
export type TenantFindUniqueOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where: Prisma.TenantWhereUniqueInput;
};
export type TenantFindFirstArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where?: Prisma.TenantWhereInput;
    orderBy?: Prisma.TenantOrderByWithRelationInput | Prisma.TenantOrderByWithRelationInput[];
    cursor?: Prisma.TenantWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TenantScalarFieldEnum | Prisma.TenantScalarFieldEnum[];
};
export type TenantFindFirstOrThrowArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where?: Prisma.TenantWhereInput;
    orderBy?: Prisma.TenantOrderByWithRelationInput | Prisma.TenantOrderByWithRelationInput[];
    cursor?: Prisma.TenantWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TenantScalarFieldEnum | Prisma.TenantScalarFieldEnum[];
};
export type TenantFindManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where?: Prisma.TenantWhereInput;
    orderBy?: Prisma.TenantOrderByWithRelationInput | Prisma.TenantOrderByWithRelationInput[];
    cursor?: Prisma.TenantWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.TenantScalarFieldEnum | Prisma.TenantScalarFieldEnum[];
};
export type TenantCreateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TenantCreateInput, Prisma.TenantUncheckedCreateInput>;
};
export type TenantCreateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.TenantCreateManyInput | Prisma.TenantCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TenantCreateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelectCreateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    data: Prisma.TenantCreateManyInput | Prisma.TenantCreateManyInput[];
    skipDuplicates?: boolean;
};
export type TenantUpdateArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TenantUpdateInput, Prisma.TenantUncheckedUpdateInput>;
    where: Prisma.TenantWhereUniqueInput;
};
export type TenantUpdateManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    data: Prisma.XOR<Prisma.TenantUpdateManyMutationInput, Prisma.TenantUncheckedUpdateManyInput>;
    where?: Prisma.TenantWhereInput;
    limit?: number;
};
export type TenantUpdateManyAndReturnArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelectUpdateManyAndReturn<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    data: Prisma.XOR<Prisma.TenantUpdateManyMutationInput, Prisma.TenantUncheckedUpdateManyInput>;
    where?: Prisma.TenantWhereInput;
    limit?: number;
};
export type TenantUpsertArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where: Prisma.TenantWhereUniqueInput;
    create: Prisma.XOR<Prisma.TenantCreateInput, Prisma.TenantUncheckedCreateInput>;
    update: Prisma.XOR<Prisma.TenantUpdateInput, Prisma.TenantUncheckedUpdateInput>;
};
export type TenantDeleteArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
    where: Prisma.TenantWhereUniqueInput;
};
export type TenantDeleteManyArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    where?: Prisma.TenantWhereInput;
    limit?: number;
};
export type Tenant$dashboardsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DashboardSelect<ExtArgs> | null;
    omit?: Prisma.DashboardOmit<ExtArgs> | null;
    include?: Prisma.DashboardInclude<ExtArgs> | null;
    where?: Prisma.DashboardWhereInput;
    orderBy?: Prisma.DashboardOrderByWithRelationInput | Prisma.DashboardOrderByWithRelationInput[];
    cursor?: Prisma.DashboardWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DashboardScalarFieldEnum | Prisma.DashboardScalarFieldEnum[];
};
export type Tenant$dataSourcesArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.DataSourceSelect<ExtArgs> | null;
    omit?: Prisma.DataSourceOmit<ExtArgs> | null;
    include?: Prisma.DataSourceInclude<ExtArgs> | null;
    where?: Prisma.DataSourceWhereInput;
    orderBy?: Prisma.DataSourceOrderByWithRelationInput | Prisma.DataSourceOrderByWithRelationInput[];
    cursor?: Prisma.DataSourceWhereUniqueInput;
    take?: number;
    skip?: number;
    distinct?: Prisma.DataSourceScalarFieldEnum | Prisma.DataSourceScalarFieldEnum[];
};
export type Tenant$dataPointsArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
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
export type TenantDefaultArgs<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs> = {
    select?: Prisma.TenantSelect<ExtArgs> | null;
    omit?: Prisma.TenantOmit<ExtArgs> | null;
    include?: Prisma.TenantInclude<ExtArgs> | null;
};
export {};

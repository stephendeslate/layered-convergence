import * as runtime from "@prisma/client/runtime/client";
import type * as Prisma from "../models.js";
import { type PrismaClient } from "./class.js";
export type * from '../models.js';
export type DMMF = typeof runtime.DMMF;
export type PrismaPromise<T> = runtime.Types.Public.PrismaPromise<T>;
export declare const PrismaClientKnownRequestError: typeof runtime.PrismaClientKnownRequestError;
export type PrismaClientKnownRequestError = runtime.PrismaClientKnownRequestError;
export declare const PrismaClientUnknownRequestError: typeof runtime.PrismaClientUnknownRequestError;
export type PrismaClientUnknownRequestError = runtime.PrismaClientUnknownRequestError;
export declare const PrismaClientRustPanicError: typeof runtime.PrismaClientRustPanicError;
export type PrismaClientRustPanicError = runtime.PrismaClientRustPanicError;
export declare const PrismaClientInitializationError: typeof runtime.PrismaClientInitializationError;
export type PrismaClientInitializationError = runtime.PrismaClientInitializationError;
export declare const PrismaClientValidationError: typeof runtime.PrismaClientValidationError;
export type PrismaClientValidationError = runtime.PrismaClientValidationError;
export declare const sql: typeof runtime.sqltag;
export declare const empty: runtime.Sql;
export declare const join: typeof runtime.join;
export declare const raw: typeof runtime.raw;
export declare const Sql: typeof runtime.Sql;
export type Sql = runtime.Sql;
export declare const Decimal: typeof runtime.Decimal;
export type Decimal = runtime.Decimal;
export type DecimalJsLike = runtime.DecimalJsLike;
export type Extension = runtime.Types.Extensions.UserArgs;
export declare const getExtensionContext: typeof runtime.Extensions.getExtensionContext;
export type Args<T, F extends runtime.Operation> = runtime.Types.Public.Args<T, F>;
export type Payload<T, F extends runtime.Operation = never> = runtime.Types.Public.Payload<T, F>;
export type Result<T, A, F extends runtime.Operation> = runtime.Types.Public.Result<T, A, F>;
export type Exact<A, W> = runtime.Types.Public.Exact<A, W>;
export type PrismaVersion = {
    client: string;
    engine: string;
};
export declare const prismaVersion: PrismaVersion;
export type Bytes = runtime.Bytes;
export type JsonObject = runtime.JsonObject;
export type JsonArray = runtime.JsonArray;
export type JsonValue = runtime.JsonValue;
export type InputJsonObject = runtime.InputJsonObject;
export type InputJsonArray = runtime.InputJsonArray;
export type InputJsonValue = runtime.InputJsonValue;
export declare const NullTypes: {
    DbNull: (new (secret: never) => typeof runtime.DbNull);
    JsonNull: (new (secret: never) => typeof runtime.JsonNull);
    AnyNull: (new (secret: never) => typeof runtime.AnyNull);
};
export declare const DbNull: runtime.DbNullClass;
export declare const JsonNull: runtime.JsonNullClass;
export declare const AnyNull: runtime.AnyNullClass;
type SelectAndInclude = {
    select: any;
    include: any;
};
type SelectAndOmit = {
    select: any;
    omit: any;
};
type Prisma__Pick<T, K extends keyof T> = {
    [P in K]: T[P];
};
export type Enumerable<T> = T | Array<T>;
export type Subset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
};
export type SelectSubset<T, U> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & (T extends SelectAndInclude ? 'Please either choose `select` or `include`.' : T extends SelectAndOmit ? 'Please either choose `select` or `omit`.' : {});
export type SubsetIntersection<T, U, K> = {
    [key in keyof T]: key extends keyof U ? T[key] : never;
} & K;
type Without<T, U> = {
    [P in Exclude<keyof T, keyof U>]?: never;
};
export type XOR<T, U> = T extends object ? U extends object ? (Without<T, U> & U) | (Without<U, T> & T) : U : T;
type IsObject<T extends any> = T extends Array<any> ? False : T extends Date ? False : T extends Uint8Array ? False : T extends BigInt ? False : T extends object ? True : False;
export type UnEnumerate<T extends unknown> = T extends Array<infer U> ? U : T;
type __Either<O extends object, K extends Key> = Omit<O, K> & {
    [P in K]: Prisma__Pick<O, P & keyof O>;
}[K];
type EitherStrict<O extends object, K extends Key> = Strict<__Either<O, K>>;
type EitherLoose<O extends object, K extends Key> = ComputeRaw<__Either<O, K>>;
type _Either<O extends object, K extends Key, strict extends Boolean> = {
    1: EitherStrict<O, K>;
    0: EitherLoose<O, K>;
}[strict];
export type Either<O extends object, K extends Key, strict extends Boolean = 1> = O extends unknown ? _Either<O, K, strict> : never;
export type Union = any;
export type PatchUndefined<O extends object, O1 extends object> = {
    [K in keyof O]: O[K] extends undefined ? At<O1, K> : O[K];
} & {};
export type IntersectOf<U extends Union> = (U extends unknown ? (k: U) => void : never) extends (k: infer I) => void ? I : never;
export type Overwrite<O extends object, O1 extends object> = {
    [K in keyof O]: K extends keyof O1 ? O1[K] : O[K];
} & {};
type _Merge<U extends object> = IntersectOf<Overwrite<U, {
    [K in keyof U]-?: At<U, K>;
}>>;
type Key = string | number | symbol;
type AtStrict<O extends object, K extends Key> = O[K & keyof O];
type AtLoose<O extends object, K extends Key> = O extends unknown ? AtStrict<O, K> : never;
export type At<O extends object, K extends Key, strict extends Boolean = 1> = {
    1: AtStrict<O, K>;
    0: AtLoose<O, K>;
}[strict];
export type ComputeRaw<A extends any> = A extends Function ? A : {
    [K in keyof A]: A[K];
} & {};
export type OptionalFlat<O> = {
    [K in keyof O]?: O[K];
} & {};
type _Record<K extends keyof any, T> = {
    [P in K]: T;
};
type NoExpand<T> = T extends unknown ? T : never;
export type AtLeast<O extends object, K extends string> = NoExpand<O extends unknown ? (K extends keyof O ? {
    [P in K]: O[P];
} & O : O) | {
    [P in keyof O as P extends K ? P : never]-?: O[P];
} & O : never>;
type _Strict<U, _U = U> = U extends unknown ? U & OptionalFlat<_Record<Exclude<Keys<_U>, keyof U>, never>> : never;
export type Strict<U extends object> = ComputeRaw<_Strict<U>>;
export type Merge<U extends object> = ComputeRaw<_Merge<Strict<U>>>;
export type Boolean = True | False;
export type True = 1;
export type False = 0;
export type Not<B extends Boolean> = {
    0: 1;
    1: 0;
}[B];
export type Extends<A1 extends any, A2 extends any> = [A1] extends [never] ? 0 : A1 extends A2 ? 1 : 0;
export type Has<U extends Union, U1 extends Union> = Not<Extends<Exclude<U1, U>, U1>>;
export type Or<B1 extends Boolean, B2 extends Boolean> = {
    0: {
        0: 0;
        1: 1;
    };
    1: {
        0: 1;
        1: 1;
    };
}[B1][B2];
export type Keys<U extends Union> = U extends unknown ? keyof U : never;
export type GetScalarType<T, O> = O extends object ? {
    [P in keyof T]: P extends keyof O ? O[P] : never;
} : never;
type FieldPaths<T, U = Omit<T, '_avg' | '_sum' | '_count' | '_min' | '_max'>> = IsObject<T> extends True ? U : T;
export type GetHavingFields<T> = {
    [K in keyof T]: Or<Or<Extends<'OR', K>, Extends<'AND', K>>, Extends<'NOT', K>> extends True ? T[K] extends infer TK ? GetHavingFields<UnEnumerate<TK> extends object ? Merge<UnEnumerate<TK>> : never> : never : {} extends FieldPaths<T[K]> ? never : K;
}[keyof T];
type _TupleToUnion<T> = T extends (infer E)[] ? E : never;
type TupleToUnion<K extends readonly any[]> = _TupleToUnion<K>;
export type MaybeTupleToUnion<T> = T extends any[] ? TupleToUnion<T> : T;
export type PickEnumerable<T, K extends Enumerable<keyof T> | keyof T> = Prisma__Pick<T, MaybeTupleToUnion<K>>;
export type ExcludeUnderscoreKeys<T extends string> = T extends `_${string}` ? never : T;
export type FieldRef<Model, FieldType> = runtime.FieldRef<Model, FieldType>;
type FieldRefInputType<Model, FieldType> = Model extends never ? never : FieldRef<Model, FieldType>;
export declare const ModelName: {
    readonly Tenant: "Tenant";
    readonly Dashboard: "Dashboard";
    readonly Widget: "Widget";
    readonly DataSource: "DataSource";
    readonly DataSourceConfig: "DataSourceConfig";
    readonly SyncRun: "SyncRun";
    readonly DataPoint: "DataPoint";
    readonly EmbedConfig: "EmbedConfig";
    readonly QueryCache: "QueryCache";
    readonly DeadLetterEvent: "DeadLetterEvent";
};
export type ModelName = (typeof ModelName)[keyof typeof ModelName];
export interface TypeMapCb<GlobalOmitOptions = {}> extends runtime.Types.Utils.Fn<{
    extArgs: runtime.Types.Extensions.InternalArgs;
}, runtime.Types.Utils.Record<string, any>> {
    returns: TypeMap<this['params']['extArgs'], GlobalOmitOptions>;
}
export type TypeMap<ExtArgs extends runtime.Types.Extensions.InternalArgs = runtime.Types.Extensions.DefaultArgs, GlobalOmitOptions = {}> = {
    globalOmitOptions: {
        omit: GlobalOmitOptions;
    };
    meta: {
        modelProps: "tenant" | "dashboard" | "widget" | "dataSource" | "dataSourceConfig" | "syncRun" | "dataPoint" | "embedConfig" | "queryCache" | "deadLetterEvent";
        txIsolationLevel: TransactionIsolationLevel;
    };
    model: {
        Tenant: {
            payload: Prisma.$TenantPayload<ExtArgs>;
            fields: Prisma.TenantFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.TenantFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.TenantFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                findFirst: {
                    args: Prisma.TenantFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.TenantFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                findMany: {
                    args: Prisma.TenantFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>[];
                };
                create: {
                    args: Prisma.TenantCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                createMany: {
                    args: Prisma.TenantCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.TenantCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>[];
                };
                delete: {
                    args: Prisma.TenantDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                update: {
                    args: Prisma.TenantUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                deleteMany: {
                    args: Prisma.TenantDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.TenantUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.TenantUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>[];
                };
                upsert: {
                    args: Prisma.TenantUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$TenantPayload>;
                };
                aggregate: {
                    args: Prisma.TenantAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateTenant>;
                };
                groupBy: {
                    args: Prisma.TenantGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TenantGroupByOutputType>[];
                };
                count: {
                    args: Prisma.TenantCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.TenantCountAggregateOutputType> | number;
                };
            };
        };
        Dashboard: {
            payload: Prisma.$DashboardPayload<ExtArgs>;
            fields: Prisma.DashboardFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DashboardFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DashboardPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DashboardFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DashboardPayload>;
                };
                findFirst: {
                    args: Prisma.DashboardFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DashboardPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DashboardFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DashboardPayload>;
                };
                findMany: {
                    args: Prisma.DashboardFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DashboardPayload>[];
                };
                create: {
                    args: Prisma.DashboardCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DashboardPayload>;
                };
                createMany: {
                    args: Prisma.DashboardCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DashboardCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DashboardPayload>[];
                };
                delete: {
                    args: Prisma.DashboardDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DashboardPayload>;
                };
                update: {
                    args: Prisma.DashboardUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DashboardPayload>;
                };
                deleteMany: {
                    args: Prisma.DashboardDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DashboardUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DashboardUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DashboardPayload>[];
                };
                upsert: {
                    args: Prisma.DashboardUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DashboardPayload>;
                };
                aggregate: {
                    args: Prisma.DashboardAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDashboard>;
                };
                groupBy: {
                    args: Prisma.DashboardGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DashboardGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DashboardCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DashboardCountAggregateOutputType> | number;
                };
            };
        };
        Widget: {
            payload: Prisma.$WidgetPayload<ExtArgs>;
            fields: Prisma.WidgetFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.WidgetFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WidgetPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.WidgetFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WidgetPayload>;
                };
                findFirst: {
                    args: Prisma.WidgetFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WidgetPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.WidgetFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WidgetPayload>;
                };
                findMany: {
                    args: Prisma.WidgetFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WidgetPayload>[];
                };
                create: {
                    args: Prisma.WidgetCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WidgetPayload>;
                };
                createMany: {
                    args: Prisma.WidgetCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.WidgetCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WidgetPayload>[];
                };
                delete: {
                    args: Prisma.WidgetDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WidgetPayload>;
                };
                update: {
                    args: Prisma.WidgetUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WidgetPayload>;
                };
                deleteMany: {
                    args: Prisma.WidgetDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.WidgetUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.WidgetUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WidgetPayload>[];
                };
                upsert: {
                    args: Prisma.WidgetUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$WidgetPayload>;
                };
                aggregate: {
                    args: Prisma.WidgetAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateWidget>;
                };
                groupBy: {
                    args: Prisma.WidgetGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WidgetGroupByOutputType>[];
                };
                count: {
                    args: Prisma.WidgetCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.WidgetCountAggregateOutputType> | number;
                };
            };
        };
        DataSource: {
            payload: Prisma.$DataSourcePayload<ExtArgs>;
            fields: Prisma.DataSourceFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DataSourceFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DataSourceFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                findFirst: {
                    args: Prisma.DataSourceFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DataSourceFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                findMany: {
                    args: Prisma.DataSourceFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>[];
                };
                create: {
                    args: Prisma.DataSourceCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                createMany: {
                    args: Prisma.DataSourceCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DataSourceCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>[];
                };
                delete: {
                    args: Prisma.DataSourceDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                update: {
                    args: Prisma.DataSourceUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                deleteMany: {
                    args: Prisma.DataSourceDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DataSourceUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DataSourceUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>[];
                };
                upsert: {
                    args: Prisma.DataSourceUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourcePayload>;
                };
                aggregate: {
                    args: Prisma.DataSourceAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDataSource>;
                };
                groupBy: {
                    args: Prisma.DataSourceGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DataSourceGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DataSourceCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DataSourceCountAggregateOutputType> | number;
                };
            };
        };
        DataSourceConfig: {
            payload: Prisma.$DataSourceConfigPayload<ExtArgs>;
            fields: Prisma.DataSourceConfigFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DataSourceConfigFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourceConfigPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DataSourceConfigFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourceConfigPayload>;
                };
                findFirst: {
                    args: Prisma.DataSourceConfigFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourceConfigPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DataSourceConfigFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourceConfigPayload>;
                };
                findMany: {
                    args: Prisma.DataSourceConfigFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourceConfigPayload>[];
                };
                create: {
                    args: Prisma.DataSourceConfigCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourceConfigPayload>;
                };
                createMany: {
                    args: Prisma.DataSourceConfigCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DataSourceConfigCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourceConfigPayload>[];
                };
                delete: {
                    args: Prisma.DataSourceConfigDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourceConfigPayload>;
                };
                update: {
                    args: Prisma.DataSourceConfigUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourceConfigPayload>;
                };
                deleteMany: {
                    args: Prisma.DataSourceConfigDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DataSourceConfigUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DataSourceConfigUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourceConfigPayload>[];
                };
                upsert: {
                    args: Prisma.DataSourceConfigUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataSourceConfigPayload>;
                };
                aggregate: {
                    args: Prisma.DataSourceConfigAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDataSourceConfig>;
                };
                groupBy: {
                    args: Prisma.DataSourceConfigGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DataSourceConfigGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DataSourceConfigCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DataSourceConfigCountAggregateOutputType> | number;
                };
            };
        };
        SyncRun: {
            payload: Prisma.$SyncRunPayload<ExtArgs>;
            fields: Prisma.SyncRunFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.SyncRunFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SyncRunPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.SyncRunFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SyncRunPayload>;
                };
                findFirst: {
                    args: Prisma.SyncRunFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SyncRunPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.SyncRunFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SyncRunPayload>;
                };
                findMany: {
                    args: Prisma.SyncRunFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SyncRunPayload>[];
                };
                create: {
                    args: Prisma.SyncRunCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SyncRunPayload>;
                };
                createMany: {
                    args: Prisma.SyncRunCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.SyncRunCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SyncRunPayload>[];
                };
                delete: {
                    args: Prisma.SyncRunDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SyncRunPayload>;
                };
                update: {
                    args: Prisma.SyncRunUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SyncRunPayload>;
                };
                deleteMany: {
                    args: Prisma.SyncRunDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.SyncRunUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.SyncRunUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SyncRunPayload>[];
                };
                upsert: {
                    args: Prisma.SyncRunUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$SyncRunPayload>;
                };
                aggregate: {
                    args: Prisma.SyncRunAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateSyncRun>;
                };
                groupBy: {
                    args: Prisma.SyncRunGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SyncRunGroupByOutputType>[];
                };
                count: {
                    args: Prisma.SyncRunCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.SyncRunCountAggregateOutputType> | number;
                };
            };
        };
        DataPoint: {
            payload: Prisma.$DataPointPayload<ExtArgs>;
            fields: Prisma.DataPointFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DataPointFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataPointPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DataPointFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataPointPayload>;
                };
                findFirst: {
                    args: Prisma.DataPointFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataPointPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DataPointFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataPointPayload>;
                };
                findMany: {
                    args: Prisma.DataPointFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataPointPayload>[];
                };
                create: {
                    args: Prisma.DataPointCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataPointPayload>;
                };
                createMany: {
                    args: Prisma.DataPointCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DataPointCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataPointPayload>[];
                };
                delete: {
                    args: Prisma.DataPointDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataPointPayload>;
                };
                update: {
                    args: Prisma.DataPointUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataPointPayload>;
                };
                deleteMany: {
                    args: Prisma.DataPointDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DataPointUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DataPointUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataPointPayload>[];
                };
                upsert: {
                    args: Prisma.DataPointUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DataPointPayload>;
                };
                aggregate: {
                    args: Prisma.DataPointAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDataPoint>;
                };
                groupBy: {
                    args: Prisma.DataPointGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DataPointGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DataPointCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DataPointCountAggregateOutputType> | number;
                };
            };
        };
        EmbedConfig: {
            payload: Prisma.$EmbedConfigPayload<ExtArgs>;
            fields: Prisma.EmbedConfigFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.EmbedConfigFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedConfigPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.EmbedConfigFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedConfigPayload>;
                };
                findFirst: {
                    args: Prisma.EmbedConfigFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedConfigPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.EmbedConfigFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedConfigPayload>;
                };
                findMany: {
                    args: Prisma.EmbedConfigFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedConfigPayload>[];
                };
                create: {
                    args: Prisma.EmbedConfigCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedConfigPayload>;
                };
                createMany: {
                    args: Prisma.EmbedConfigCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.EmbedConfigCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedConfigPayload>[];
                };
                delete: {
                    args: Prisma.EmbedConfigDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedConfigPayload>;
                };
                update: {
                    args: Prisma.EmbedConfigUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedConfigPayload>;
                };
                deleteMany: {
                    args: Prisma.EmbedConfigDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.EmbedConfigUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.EmbedConfigUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedConfigPayload>[];
                };
                upsert: {
                    args: Prisma.EmbedConfigUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$EmbedConfigPayload>;
                };
                aggregate: {
                    args: Prisma.EmbedConfigAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateEmbedConfig>;
                };
                groupBy: {
                    args: Prisma.EmbedConfigGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EmbedConfigGroupByOutputType>[];
                };
                count: {
                    args: Prisma.EmbedConfigCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.EmbedConfigCountAggregateOutputType> | number;
                };
            };
        };
        QueryCache: {
            payload: Prisma.$QueryCachePayload<ExtArgs>;
            fields: Prisma.QueryCacheFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.QueryCacheFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QueryCachePayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.QueryCacheFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QueryCachePayload>;
                };
                findFirst: {
                    args: Prisma.QueryCacheFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QueryCachePayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.QueryCacheFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QueryCachePayload>;
                };
                findMany: {
                    args: Prisma.QueryCacheFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QueryCachePayload>[];
                };
                create: {
                    args: Prisma.QueryCacheCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QueryCachePayload>;
                };
                createMany: {
                    args: Prisma.QueryCacheCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.QueryCacheCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QueryCachePayload>[];
                };
                delete: {
                    args: Prisma.QueryCacheDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QueryCachePayload>;
                };
                update: {
                    args: Prisma.QueryCacheUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QueryCachePayload>;
                };
                deleteMany: {
                    args: Prisma.QueryCacheDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.QueryCacheUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.QueryCacheUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QueryCachePayload>[];
                };
                upsert: {
                    args: Prisma.QueryCacheUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$QueryCachePayload>;
                };
                aggregate: {
                    args: Prisma.QueryCacheAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateQueryCache>;
                };
                groupBy: {
                    args: Prisma.QueryCacheGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.QueryCacheGroupByOutputType>[];
                };
                count: {
                    args: Prisma.QueryCacheCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.QueryCacheCountAggregateOutputType> | number;
                };
            };
        };
        DeadLetterEvent: {
            payload: Prisma.$DeadLetterEventPayload<ExtArgs>;
            fields: Prisma.DeadLetterEventFieldRefs;
            operations: {
                findUnique: {
                    args: Prisma.DeadLetterEventFindUniqueArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DeadLetterEventPayload> | null;
                };
                findUniqueOrThrow: {
                    args: Prisma.DeadLetterEventFindUniqueOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DeadLetterEventPayload>;
                };
                findFirst: {
                    args: Prisma.DeadLetterEventFindFirstArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DeadLetterEventPayload> | null;
                };
                findFirstOrThrow: {
                    args: Prisma.DeadLetterEventFindFirstOrThrowArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DeadLetterEventPayload>;
                };
                findMany: {
                    args: Prisma.DeadLetterEventFindManyArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DeadLetterEventPayload>[];
                };
                create: {
                    args: Prisma.DeadLetterEventCreateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DeadLetterEventPayload>;
                };
                createMany: {
                    args: Prisma.DeadLetterEventCreateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                createManyAndReturn: {
                    args: Prisma.DeadLetterEventCreateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DeadLetterEventPayload>[];
                };
                delete: {
                    args: Prisma.DeadLetterEventDeleteArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DeadLetterEventPayload>;
                };
                update: {
                    args: Prisma.DeadLetterEventUpdateArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DeadLetterEventPayload>;
                };
                deleteMany: {
                    args: Prisma.DeadLetterEventDeleteManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateMany: {
                    args: Prisma.DeadLetterEventUpdateManyArgs<ExtArgs>;
                    result: BatchPayload;
                };
                updateManyAndReturn: {
                    args: Prisma.DeadLetterEventUpdateManyAndReturnArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DeadLetterEventPayload>[];
                };
                upsert: {
                    args: Prisma.DeadLetterEventUpsertArgs<ExtArgs>;
                    result: runtime.Types.Utils.PayloadToResult<Prisma.$DeadLetterEventPayload>;
                };
                aggregate: {
                    args: Prisma.DeadLetterEventAggregateArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.AggregateDeadLetterEvent>;
                };
                groupBy: {
                    args: Prisma.DeadLetterEventGroupByArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DeadLetterEventGroupByOutputType>[];
                };
                count: {
                    args: Prisma.DeadLetterEventCountArgs<ExtArgs>;
                    result: runtime.Types.Utils.Optional<Prisma.DeadLetterEventCountAggregateOutputType> | number;
                };
            };
        };
    };
} & {
    other: {
        payload: any;
        operations: {
            $executeRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $executeRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
            $queryRaw: {
                args: [query: TemplateStringsArray | Sql, ...values: any[]];
                result: any;
            };
            $queryRawUnsafe: {
                args: [query: string, ...values: any[]];
                result: any;
            };
        };
    };
};
export declare const TransactionIsolationLevel: {
    readonly ReadUncommitted: "ReadUncommitted";
    readonly ReadCommitted: "ReadCommitted";
    readonly RepeatableRead: "RepeatableRead";
    readonly Serializable: "Serializable";
};
export type TransactionIsolationLevel = (typeof TransactionIsolationLevel)[keyof typeof TransactionIsolationLevel];
export declare const TenantScalarFieldEnum: {
    readonly id: "id";
    readonly name: "name";
    readonly apiKey: "apiKey";
    readonly primaryColor: "primaryColor";
    readonly fontFamily: "fontFamily";
    readonly logoUrl: "logoUrl";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type TenantScalarFieldEnum = (typeof TenantScalarFieldEnum)[keyof typeof TenantScalarFieldEnum];
export declare const DashboardScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly name: "name";
    readonly layout: "layout";
    readonly isPublished: "isPublished";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type DashboardScalarFieldEnum = (typeof DashboardScalarFieldEnum)[keyof typeof DashboardScalarFieldEnum];
export declare const WidgetScalarFieldEnum: {
    readonly id: "id";
    readonly dashboardId: "dashboardId";
    readonly type: "type";
    readonly config: "config";
    readonly positionX: "positionX";
    readonly positionY: "positionY";
    readonly width: "width";
    readonly height: "height";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type WidgetScalarFieldEnum = (typeof WidgetScalarFieldEnum)[keyof typeof WidgetScalarFieldEnum];
export declare const DataSourceScalarFieldEnum: {
    readonly id: "id";
    readonly tenantId: "tenantId";
    readonly name: "name";
    readonly type: "type";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type DataSourceScalarFieldEnum = (typeof DataSourceScalarFieldEnum)[keyof typeof DataSourceScalarFieldEnum];
export declare const DataSourceConfigScalarFieldEnum: {
    readonly id: "id";
    readonly dataSourceId: "dataSourceId";
    readonly connectionConfig: "connectionConfig";
    readonly fieldMapping: "fieldMapping";
    readonly transformSteps: "transformSteps";
    readonly syncSchedule: "syncSchedule";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type DataSourceConfigScalarFieldEnum = (typeof DataSourceConfigScalarFieldEnum)[keyof typeof DataSourceConfigScalarFieldEnum];
export declare const SyncRunScalarFieldEnum: {
    readonly id: "id";
    readonly dataSourceId: "dataSourceId";
    readonly status: "status";
    readonly rowsIngested: "rowsIngested";
    readonly errorLog: "errorLog";
    readonly startedAt: "startedAt";
    readonly completedAt: "completedAt";
};
export type SyncRunScalarFieldEnum = (typeof SyncRunScalarFieldEnum)[keyof typeof SyncRunScalarFieldEnum];
export declare const DataPointScalarFieldEnum: {
    readonly id: "id";
    readonly dataSourceId: "dataSourceId";
    readonly tenantId: "tenantId";
    readonly timestamp: "timestamp";
    readonly dimensions: "dimensions";
    readonly metrics: "metrics";
    readonly createdAt: "createdAt";
};
export type DataPointScalarFieldEnum = (typeof DataPointScalarFieldEnum)[keyof typeof DataPointScalarFieldEnum];
export declare const EmbedConfigScalarFieldEnum: {
    readonly id: "id";
    readonly dashboardId: "dashboardId";
    readonly allowedOrigins: "allowedOrigins";
    readonly themeOverrides: "themeOverrides";
    readonly createdAt: "createdAt";
    readonly updatedAt: "updatedAt";
};
export type EmbedConfigScalarFieldEnum = (typeof EmbedConfigScalarFieldEnum)[keyof typeof EmbedConfigScalarFieldEnum];
export declare const QueryCacheScalarFieldEnum: {
    readonly id: "id";
    readonly queryHash: "queryHash";
    readonly result: "result";
    readonly expiresAt: "expiresAt";
};
export type QueryCacheScalarFieldEnum = (typeof QueryCacheScalarFieldEnum)[keyof typeof QueryCacheScalarFieldEnum];
export declare const DeadLetterEventScalarFieldEnum: {
    readonly id: "id";
    readonly dataSourceId: "dataSourceId";
    readonly payload: "payload";
    readonly errorReason: "errorReason";
    readonly createdAt: "createdAt";
    readonly retriedAt: "retriedAt";
};
export type DeadLetterEventScalarFieldEnum = (typeof DeadLetterEventScalarFieldEnum)[keyof typeof DeadLetterEventScalarFieldEnum];
export declare const SortOrder: {
    readonly asc: "asc";
    readonly desc: "desc";
};
export type SortOrder = (typeof SortOrder)[keyof typeof SortOrder];
export declare const JsonNullValueInput: {
    readonly JsonNull: runtime.JsonNullClass;
};
export type JsonNullValueInput = (typeof JsonNullValueInput)[keyof typeof JsonNullValueInput];
export declare const NullableJsonNullValueInput: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
};
export type NullableJsonNullValueInput = (typeof NullableJsonNullValueInput)[keyof typeof NullableJsonNullValueInput];
export declare const QueryMode: {
    readonly default: "default";
    readonly insensitive: "insensitive";
};
export type QueryMode = (typeof QueryMode)[keyof typeof QueryMode];
export declare const NullsOrder: {
    readonly first: "first";
    readonly last: "last";
};
export type NullsOrder = (typeof NullsOrder)[keyof typeof NullsOrder];
export declare const JsonNullValueFilter: {
    readonly DbNull: runtime.DbNullClass;
    readonly JsonNull: runtime.JsonNullClass;
    readonly AnyNull: runtime.AnyNullClass;
};
export type JsonNullValueFilter = (typeof JsonNullValueFilter)[keyof typeof JsonNullValueFilter];
export type StringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String'>;
export type ListStringFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'String[]'>;
export type DateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime'>;
export type ListDateTimeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DateTime[]'>;
export type JsonFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Json'>;
export type EnumQueryModeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'QueryMode'>;
export type BooleanFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Boolean'>;
export type EnumWidgetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WidgetType'>;
export type ListEnumWidgetTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'WidgetType[]'>;
export type IntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int'>;
export type ListIntFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Int[]'>;
export type EnumDataSourceTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DataSourceType'>;
export type ListEnumDataSourceTypeFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'DataSourceType[]'>;
export type EnumSyncRunStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SyncRunStatus'>;
export type ListEnumSyncRunStatusFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'SyncRunStatus[]'>;
export type FloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float'>;
export type ListFloatFieldRefInput<$PrismaModel> = FieldRefInputType<$PrismaModel, 'Float[]'>;
export type BatchPayload = {
    count: number;
};
export declare const defineExtension: runtime.Types.Extensions.ExtendsHook<"define", TypeMapCb, runtime.Types.Extensions.DefaultArgs>;
export type DefaultPrismaClient = PrismaClient;
export type ErrorFormat = 'pretty' | 'colorless' | 'minimal';
export type PrismaClientOptions = ({
    adapter: runtime.SqlDriverAdapterFactory;
    accelerateUrl?: never;
} | {
    accelerateUrl: string;
    adapter?: never;
}) & {
    errorFormat?: ErrorFormat;
    log?: (LogLevel | LogDefinition)[];
    transactionOptions?: {
        maxWait?: number;
        timeout?: number;
        isolationLevel?: TransactionIsolationLevel;
    };
    omit?: GlobalOmitConfig;
    comments?: runtime.SqlCommenterPlugin[];
};
export type GlobalOmitConfig = {
    tenant?: Prisma.TenantOmit;
    dashboard?: Prisma.DashboardOmit;
    widget?: Prisma.WidgetOmit;
    dataSource?: Prisma.DataSourceOmit;
    dataSourceConfig?: Prisma.DataSourceConfigOmit;
    syncRun?: Prisma.SyncRunOmit;
    dataPoint?: Prisma.DataPointOmit;
    embedConfig?: Prisma.EmbedConfigOmit;
    queryCache?: Prisma.QueryCacheOmit;
    deadLetterEvent?: Prisma.DeadLetterEventOmit;
};
export type LogLevel = 'info' | 'query' | 'warn' | 'error';
export type LogDefinition = {
    level: LogLevel;
    emit: 'stdout' | 'event';
};
export type CheckIsLogLevel<T> = T extends LogLevel ? T : never;
export type GetLogType<T> = CheckIsLogLevel<T extends LogDefinition ? T['level'] : T>;
export type GetEvents<T extends any[]> = T extends Array<LogLevel | LogDefinition> ? GetLogType<T[number]> : never;
export type QueryEvent = {
    timestamp: Date;
    query: string;
    params: string;
    duration: number;
    target: string;
};
export type LogEvent = {
    timestamp: Date;
    message: string;
    target: string;
};
export type PrismaAction = 'findUnique' | 'findUniqueOrThrow' | 'findMany' | 'findFirst' | 'findFirstOrThrow' | 'create' | 'createMany' | 'createManyAndReturn' | 'update' | 'updateMany' | 'updateManyAndReturn' | 'upsert' | 'delete' | 'deleteMany' | 'executeRaw' | 'queryRaw' | 'aggregate' | 'count' | 'runCommandRaw' | 'findRaw' | 'groupBy';
export type TransactionClient = Omit<DefaultPrismaClient, runtime.ITXClientDenyList>;

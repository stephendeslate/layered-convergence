export interface Tenant {
    id: string;
    name: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum UserRole {
    ADMIN = "ADMIN",
    MANAGER = "MANAGER",
    SELLER = "SELLER",
    BUYER = "BUYER"
}
export interface User {
    id: string;
    email: string;
    name: string;
    role: UserRole;
    balance: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum ListingStatus {
    ACTIVE = "ACTIVE",
    SOLD = "SOLD",
    CANCELLED = "CANCELLED",
    SUSPENDED = "SUSPENDED"
}
export interface Listing {
    id: string;
    title: string;
    slug: string;
    description: string;
    price: string;
    status: ListingStatus;
    sellerId: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare enum TransactionStatus {
    PENDING = "PENDING",
    COMPLETED = "COMPLETED",
    DISPUTED = "DISPUTED",
    REFUNDED = "REFUNDED",
    FAILED = "FAILED"
}
export interface Transaction {
    id: string;
    amount: string;
    status: TransactionStatus;
    buyerId: string;
    sellerId: string;
    listingId: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface EscrowAccount {
    id: string;
    amount: string;
    transactionId: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface Dispute {
    id: string;
    reason: string;
    transactionId: string;
    tenantId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface PaginatedResult<T> {
    data: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
export declare const ALLOWED_REGISTRATION_ROLES: string[];
export declare const DEFAULT_PAGE_SIZE = 20;
export declare const MAX_PAGE_SIZE = 100;
export declare const BCRYPT_SALT_ROUNDS = 12;
export declare const TRANSACTION_STATUS_TRANSITIONS: Record<string, string[]>;
export declare function paginate<T>(data: T[], total: number, page: number, pageSize: number): PaginatedResult<T>;
export declare function isAllowedRegistrationRole(role: string): boolean;
export declare function formatCurrency(amount: string | number): string;
export declare function sanitizeInput(input: string): string;
export declare function maskSensitive(value: string, visibleChars?: number): string;
export declare function slugify(input: string): string;
export declare function truncateText(text: string, maxLength: number, suffix?: string): string;
export declare function formatBytes(bytes: number, decimals?: number): string;
export declare function generateId(): string;
//# sourceMappingURL=index.d.ts.map
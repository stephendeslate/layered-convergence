"use strict";
// TRACED: EM-ARCH-001 — Shared package in Turborepo monorepo
// TRACED: EM-ARCH-005 — Shared package types and utilities
Object.defineProperty(exports, "__esModule", { value: true });
exports.TRANSACTION_STATUS_TRANSITIONS = exports.BCRYPT_SALT_ROUNDS = exports.MAX_PAGE_SIZE = exports.DEFAULT_PAGE_SIZE = exports.ALLOWED_REGISTRATION_ROLES = exports.TransactionStatus = exports.ListingStatus = exports.UserRole = void 0;
exports.paginate = paginate;
exports.isAllowedRegistrationRole = isAllowedRegistrationRole;
exports.formatCurrency = formatCurrency;
exports.sanitizeInput = sanitizeInput;
exports.maskSensitive = maskSensitive;
exports.slugify = slugify;
exports.truncateText = truncateText;
exports.formatBytes = formatBytes;
exports.generateId = generateId;
var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["MANAGER"] = "MANAGER";
    UserRole["SELLER"] = "SELLER";
    UserRole["BUYER"] = "BUYER";
})(UserRole || (exports.UserRole = UserRole = {}));
var ListingStatus;
(function (ListingStatus) {
    ListingStatus["ACTIVE"] = "ACTIVE";
    ListingStatus["SOLD"] = "SOLD";
    ListingStatus["CANCELLED"] = "CANCELLED";
    ListingStatus["SUSPENDED"] = "SUSPENDED";
})(ListingStatus || (exports.ListingStatus = ListingStatus = {}));
var TransactionStatus;
(function (TransactionStatus) {
    TransactionStatus["PENDING"] = "PENDING";
    TransactionStatus["COMPLETED"] = "COMPLETED";
    TransactionStatus["DISPUTED"] = "DISPUTED";
    TransactionStatus["REFUNDED"] = "REFUNDED";
    TransactionStatus["FAILED"] = "FAILED";
})(TransactionStatus || (exports.TransactionStatus = TransactionStatus = {}));
// ─── Constants ───
exports.ALLOWED_REGISTRATION_ROLES = ['MANAGER', 'SELLER', 'BUYER'];
exports.DEFAULT_PAGE_SIZE = 20;
exports.MAX_PAGE_SIZE = 100;
exports.BCRYPT_SALT_ROUNDS = 12;
exports.TRANSACTION_STATUS_TRANSITIONS = {
    [TransactionStatus.PENDING]: [
        TransactionStatus.COMPLETED,
        TransactionStatus.DISPUTED,
        TransactionStatus.FAILED,
    ],
    [TransactionStatus.DISPUTED]: [
        TransactionStatus.COMPLETED,
        TransactionStatus.REFUNDED,
    ],
    [TransactionStatus.COMPLETED]: [],
    [TransactionStatus.REFUNDED]: [],
    [TransactionStatus.FAILED]: [],
};
// ─── Utilities ───
// TRACED: EM-API-002 — Pagination with DEFAULT_PAGE_SIZE and MAX_PAGE_SIZE
function paginate(data, total, page, pageSize) {
    return {
        data,
        total,
        page,
        pageSize,
        totalPages: Math.ceil(total / pageSize),
    };
}
// TRACED: EM-AUTH-003 — Registration restricted to allowed roles
function isAllowedRegistrationRole(role) {
    return exports.ALLOWED_REGISTRATION_ROLES.includes(role);
}
function formatCurrency(amount) {
    const num = typeof amount === 'string' ? parseFloat(amount) : amount;
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: 'USD',
    }).format(num);
}
// TRACED: EM-SEC-006 — XSS prevention (sanitizeInput)
function sanitizeInput(input) {
    return input.replace(/<[^>]*>/g, '').trim();
}
// TRACED: EM-SEC-006 — Sensitive data masking for audit logging
function maskSensitive(value, visibleChars = 4) {
    if (value.length <= visibleChars) {
        return '*'.repeat(value.length);
    }
    const masked = '*'.repeat(value.length - visibleChars);
    return masked + value.slice(-visibleChars);
}
// TRACED: EM-API-009 — URL-safe slug generation for listings
function slugify(input) {
    return input
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/[\s]+/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-|-$/g, '');
}
// TRACED: EM-FE-009 — Text truncation with configurable suffix
function truncateText(text, maxLength, suffix = '...') {
    if (text.length <= maxLength) {
        return text;
    }
    const truncatedLength = maxLength - suffix.length;
    if (truncatedLength <= 0) {
        return suffix.slice(0, maxLength);
    }
    return text.slice(0, truncatedLength) + suffix;
}
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0)
        return '0 Bytes';
    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}
function generateId() {
    return crypto.randomUUID();
}
//# sourceMappingURL=index.js.map
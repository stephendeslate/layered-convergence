// ─── Platform Configuration Defaults ────────────────────────────────────────

export const PLATFORM_FEE_PERCENT_DEFAULT = 10;
export const MIN_PLATFORM_FEE_CENTS = 50; // $0.50 minimum fee
export const AUTO_RELEASE_HOURS_DEFAULT = 72;
export const DISPUTE_WINDOW_HOURS = 72;
export const HOLD_EXPIRY_DAYS = 7;

// ─── Transaction Limits ─────────────────────────────────────────────────────

export const MIN_TRANSACTION_AMOUNT_CENTS = 500; // $5.00
export const MAX_TRANSACTION_AMOUNT_CENTS = 1000000; // $10,000.00

// ─── File Upload Limits ─────────────────────────────────────────────────────

export const MAX_EVIDENCE_FILE_SIZE_BYTES = 10485760; // 10MB

// ─── Demo Banner ────────────────────────────────────────────────────────────

export const DEMO_BANNER_TEXT =
  'Demo Mode \u2014 No real funds are processed';

// ─── Pagination Defaults ────────────────────────────────────────────────────

export const DEFAULT_PAGE_SIZE = 20;
export const MAX_PAGE_SIZE = 100;

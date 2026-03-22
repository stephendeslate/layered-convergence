// TRACED:EM-SHARED-03 shared API response type
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  correlationId?: string;
}

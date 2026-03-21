import type {
  AuthTokens,
  LoginCredentials,
  RegisterPayload,
  DataSource,
  DataSourceCreatePayload,
  DataPoint,
  DataPointQuery,
  Pipeline,
  PipelineStatusEvent,
  Dashboard,
  DashboardCreatePayload,
  Widget,
  WidgetCreatePayload,
  EmbedConfig,
  EmbedCreatePayload,
  ApiListResponse,
  User,
} from "./types";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3000";

interface RequestOptions {
  token?: string;
  tenantId?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl;
  }

  private buildHeaders(options: RequestOptions): HeadersInit {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };

    if (options.token) {
      headers["Authorization"] = `Bearer ${options.token}`;
    }

    if (options.tenantId) {
      headers["x-tenant-id"] = options.tenantId;
    }

    return headers;
  }

  private async request<T>(
    method: string,
    path: string,
    options: RequestOptions,
    body?: unknown
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`;
    const headers = this.buildHeaders(options);

    const fetchOptions: globalThis.RequestInit = {
      method,
      headers,
      cache: "no-store" as const,
    };

    if (body !== undefined) {
      fetchOptions.body = JSON.stringify(body);
    }

    const response = await fetch(url, fetchOptions);

    if (!response.ok) {
      const errorBody = await response.text();
      throw new ApiRequestError(
        response.status,
        `API request failed: ${response.status} ${response.statusText}`,
        errorBody
      );
    }

    const text = await response.text();
    if (!text) {
      return undefined as T;
    }

    return JSON.parse(text) as T;
  }

  // Auth
  async login(credentials: LoginCredentials): Promise<AuthTokens> {
    return this.request<AuthTokens>("POST", "/auth/login", {}, credentials);
  }

  async register(payload: RegisterPayload): Promise<AuthTokens> {
    return this.request<AuthTokens>("POST", "/auth/register", {}, payload);
  }

  // Data Sources
  async getDataSources(options: RequestOptions): Promise<ApiListResponse<DataSource>> {
    return this.request<ApiListResponse<DataSource>>("GET", "/data-sources", options);
  }

  async getDataSource(id: string, options: RequestOptions): Promise<DataSource> {
    return this.request<DataSource>("GET", `/data-sources/${encodeURIComponent(id)}`, options);
  }

  async createDataSource(
    payload: DataSourceCreatePayload,
    options: RequestOptions
  ): Promise<DataSource> {
    return this.request<DataSource>("POST", "/data-sources", options, payload);
  }

  // Data Points
  async getDataPoints(
    query: DataPointQuery,
    options: RequestOptions
  ): Promise<ApiListResponse<DataPoint>> {
    const params = new URLSearchParams();
    if (query.dataSourceId) params.set("dataSourceId", query.dataSourceId);
    if (query.key) params.set("key", query.key);
    if (query.startDate) params.set("startDate", query.startDate);
    if (query.endDate) params.set("endDate", query.endDate);

    const queryString = params.toString();
    const path = queryString ? `/data-points?${queryString}` : "/data-points";
    return this.request<ApiListResponse<DataPoint>>("GET", path, options);
  }

  async createDataPoint(
    payload: Omit<DataPoint, "id">,
    options: RequestOptions
  ): Promise<DataPoint> {
    return this.request<DataPoint>("POST", "/data-points", options, payload);
  }

  // Pipelines
  async getPipelines(options: RequestOptions): Promise<ApiListResponse<Pipeline>> {
    return this.request<ApiListResponse<Pipeline>>("GET", "/pipelines", options);
  }

  async triggerPipeline(id: string, options: RequestOptions): Promise<Pipeline> {
    return this.request<Pipeline>(
      "POST",
      `/pipelines/${encodeURIComponent(id)}/trigger`,
      options
    );
  }

  getPipelineStatusUrl(id: string): string {
    return `${this.baseUrl}/pipelines/${encodeURIComponent(id)}/status`;
  }

  // Dashboards
  async getDashboards(options: RequestOptions): Promise<ApiListResponse<Dashboard>> {
    return this.request<ApiListResponse<Dashboard>>("GET", "/dashboards", options);
  }

  async getDashboard(id: string, options: RequestOptions): Promise<Dashboard> {
    return this.request<Dashboard>(
      "GET",
      `/dashboards/${encodeURIComponent(id)}`,
      options
    );
  }

  async createDashboard(
    payload: DashboardCreatePayload,
    options: RequestOptions
  ): Promise<Dashboard> {
    return this.request<Dashboard>("POST", "/dashboards", options, payload);
  }

  // Widgets
  async getWidgets(options: RequestOptions): Promise<ApiListResponse<Widget>> {
    return this.request<ApiListResponse<Widget>>("GET", "/widgets", options);
  }

  async createWidget(
    payload: WidgetCreatePayload,
    options: RequestOptions
  ): Promise<Widget> {
    return this.request<Widget>("POST", "/widgets", options, payload);
  }

  // Embeds
  async getEmbeds(options: RequestOptions): Promise<ApiListResponse<EmbedConfig>> {
    return this.request<ApiListResponse<EmbedConfig>>("GET", "/embeds", options);
  }

  async createEmbed(
    payload: EmbedCreatePayload,
    options: RequestOptions
  ): Promise<EmbedConfig> {
    return this.request<EmbedConfig>("POST", "/embeds", options, payload);
  }
}

export class ApiRequestError extends Error {
  public statusCode: number;
  public responseBody: string;

  constructor(statusCode: number, message: string, responseBody: string) {
    super(message);
    this.name = "ApiRequestError";
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

export const apiClient = new ApiClient(API_BASE_URL);

// Server-side helpers that read cookies/headers for auth context
export async function getServerRequestOptions(): Promise<RequestOptions> {
  const { cookies } = await import("next/headers");
  const cookieStore = await cookies();
  const token = cookieStore.get("auth-token")?.value;
  const tenantId = cookieStore.get("tenant-id")?.value;

  return {
    token: token ?? undefined,
    tenantId: tenantId ?? undefined,
  };
}

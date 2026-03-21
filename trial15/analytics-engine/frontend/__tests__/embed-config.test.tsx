import { render, screen, waitFor } from "@testing-library/react";
import { axe, toHaveNoViolations } from "jest-axe";
import type { EmbedConfig, Dashboard } from "@/lib/types";

expect.extend(toHaveNoViolations);

jest.mock("@/lib/api", () => ({
  apiClient: {
    getEmbeds: jest.fn(),
    getDashboards: jest.fn(),
    createEmbed: jest.fn(),
  },
}));

import EmbedsPage from "@/app/embeds/page";
import { apiClient } from "@/lib/api";

const mockGetEmbeds = apiClient.getEmbeds as jest.MockedFunction<typeof apiClient.getEmbeds>;
const mockGetDashboards = apiClient.getDashboards as jest.MockedFunction<typeof apiClient.getDashboards>;

const mockDashboards: Dashboard[] = [
  {
    id: "dash-1",
    name: "Sales Dashboard",
    description: "Overview of sales metrics",
    widgets: [],
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-12-01T00:00:00Z",
  },
];

const mockEmbeds: EmbedConfig[] = [
  {
    id: "emb-1",
    dashboardId: "dash-1",
    token: "abc123def456ghi789jkl012mno345pqr",
    allowedOrigins: ["https://example.com", "https://app.example.com"],
    expiresAt: "2026-01-01T00:00:00Z",
    isActive: true,
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-12-01T00:00:00Z",
  },
];

describe("EmbedsPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetEmbeds.mockResolvedValue({
      data: mockEmbeds,
      total: 1,
      page: 1,
      limit: 20,
    });
    mockGetDashboards.mockResolvedValue({
      data: mockDashboards,
      total: 1,
      page: 1,
      limit: 20,
    });
  });

  it("renders embed configurations after loading", async () => {
    render(<EmbedsPage />);

    await waitFor(() => {
      expect(screen.getByText("Embed Configurations")).toBeInTheDocument();
    });

    expect(screen.getByText("Sales Dashboard")).toBeInTheDocument();
  });

  it("shows embed token (truncated)", async () => {
    render(<EmbedsPage />);

    await waitFor(() => {
      expect(screen.getByText("abc123def456...")).toBeInTheDocument();
    });
  });

  it("shows active status badge", async () => {
    render(<EmbedsPage />);

    await waitFor(() => {
      expect(screen.getByText("Active")).toBeInTheDocument();
    });
  });

  it("shows allowed origins", async () => {
    render(<EmbedsPage />);

    await waitFor(() => {
      expect(screen.getByText("https://example.com")).toBeInTheDocument();
      expect(screen.getByText("https://app.example.com")).toBeInTheDocument();
    });
  });

  it("shows empty state when no embeds exist", async () => {
    mockGetEmbeds.mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      limit: 20,
    });

    render(<EmbedsPage />);

    await waitFor(() => {
      expect(screen.getByText("No embed configurations")).toBeInTheDocument();
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<EmbedsPage />);

    await waitFor(() => {
      expect(screen.getByText("Embed Configurations")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { axe, toHaveNoViolations } from "jest-axe";
import type { Pipeline } from "@/lib/types";

expect.extend(toHaveNoViolations);

jest.mock("@/lib/api", () => ({
  apiClient: {
    getPipelines: jest.fn(),
    triggerPipeline: jest.fn(),
    getPipelineStatusUrl: jest.fn((id: string) => `http://localhost:3000/pipelines/${id}/status`),
  },
}));

jest.mock("@/hooks/use-sse", () => ({
  useSSE: jest.fn(() => ({
    data: null,
    error: null,
    isConnected: false,
    reconnect: jest.fn(),
  })),
}));

import PipelinesPage from "@/app/pipelines/page";
import { apiClient } from "@/lib/api";
import { useSSE } from "@/hooks/use-sse";

const mockGetPipelines = apiClient.getPipelines as jest.MockedFunction<typeof apiClient.getPipelines>;
const mockTriggerPipeline = apiClient.triggerPipeline as jest.MockedFunction<typeof apiClient.triggerPipeline>;
const mockUseSSE = useSSE as jest.MockedFunction<typeof useSSE>;

const pipelines: Pipeline[] = [
  {
    id: "pl-1",
    name: "Daily ETL",
    description: "Daily data extraction pipeline",
    dataSourceId: "ds-1",
    schedule: "0 0 * * *",
    status: "completed",
    lastRunAt: "2025-12-01T00:00:00Z",
    createdAt: "2025-01-01T00:00:00Z",
    updatedAt: "2025-12-01T00:00:00Z",
  },
  {
    id: "pl-2",
    name: "Hourly Sync",
    description: "Sync data every hour",
    dataSourceId: "ds-2",
    schedule: null,
    status: "idle",
    lastRunAt: null,
    createdAt: "2025-06-01T00:00:00Z",
    updatedAt: "2025-06-01T00:00:00Z",
  },
];

describe("PipelinesPage", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockGetPipelines.mockResolvedValue({
      data: pipelines,
      total: 2,
      page: 1,
      limit: 20,
    });
    mockUseSSE.mockReturnValue({
      data: null,
      error: null,
      isConnected: false,
      reconnect: jest.fn(),
    });
  });

  it("renders pipeline list after loading", async () => {
    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("Daily ETL")).toBeInTheDocument();
    });

    expect(screen.getByText("Hourly Sync")).toBeInTheDocument();
  });

  it("shows pipeline status badges", async () => {
    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("completed")).toBeInTheDocument();
    });

    expect(screen.getByText("idle")).toBeInTheDocument();
  });

  it("shows schedule or 'Manual' label", async () => {
    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("0 0 * * *")).toBeInTheDocument();
    });

    expect(screen.getByText("Manual")).toBeInTheDocument();
  });

  it("triggers a pipeline when Run button is clicked", async () => {
    const user = userEvent.setup();
    const updatedPipeline: Pipeline = { ...pipelines[1], status: "running" };
    mockTriggerPipeline.mockResolvedValueOnce(updatedPipeline);

    render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("Hourly Sync")).toBeInTheDocument();
    });

    const runButtons = screen.getAllByRole("button", { name: /run/i });
    await user.click(runButtons[1]);

    await waitFor(() => {
      expect(mockTriggerPipeline).toHaveBeenCalledWith("pl-2", expect.objectContaining({}));
    });
  });

  it("disables Run button for running pipelines", async () => {
    mockGetPipelines.mockResolvedValue({
      data: [{ ...pipelines[0], status: "running" }],
      total: 1,
      page: 1,
      limit: 20,
    });

    render(<PipelinesPage />);

    await waitFor(() => {
      const runButton = screen.getByRole("button", { name: /run/i });
      expect(runButton).toBeDisabled();
    });
  });

  it("has no accessibility violations", async () => {
    const { container } = render(<PipelinesPage />);

    await waitFor(() => {
      expect(screen.getByText("Daily ETL")).toBeInTheDocument();
    });

    const results = await axe(container);
    expect(results).toHaveNoViolations();
  });
});

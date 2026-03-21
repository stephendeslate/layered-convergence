import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import axe from "axe-core";
import { formatDistance, formatDuration, formatDate } from "@/lib/utils";


describe("Route View utilities", () => {
  describe("formatDistance", () => {
    it("formats distances under 1000m in meters", () => {
      expect(formatDistance(500)).toBe("500 m");
      expect(formatDistance(0)).toBe("0 m");
      expect(formatDistance(999)).toBe("999 m");
    });

    it("formats distances over 1000m in kilometers", () => {
      expect(formatDistance(1000)).toBe("1.0 km");
      expect(formatDistance(1500)).toBe("1.5 km");
      expect(formatDistance(25600)).toBe("25.6 km");
    });
  });

  describe("formatDuration", () => {
    it("formats durations under 60 minutes", () => {
      expect(formatDuration(30)).toBe("30 min");
      expect(formatDuration(1)).toBe("1 min");
    });

    it("formats durations of exactly 60 minutes", () => {
      expect(formatDuration(60)).toBe("1h");
    });

    it("formats durations over 60 minutes with remainder", () => {
      expect(formatDuration(90)).toBe("1h 30m");
      expect(formatDuration(150)).toBe("2h 30m");
    });

    it("formats even hours without remainder", () => {
      expect(formatDuration(120)).toBe("2h");
      expect(formatDuration(180)).toBe("3h");
    });
  });

  describe("formatDate", () => {
    it("formats ISO date strings", () => {
      const result = formatDate("2024-06-15T09:00:00Z");
      expect(result).toContain("2024");
      expect(result).toContain("Jun");
      expect(result).toContain("15");
    });
  });
});

describe("Route view rendering", () => {
  it("renders route card structure with accessible content", async () => {
    const { container } = render(
      <div role="region" aria-label="Route planning">
        <h1>Routes</h1>
        <div data-testid="route-card">
          <div>
            <h2>John Doe</h2>
            <span>{formatDate("2024-06-15T09:00:00Z")}</span>
            <span>{formatDistance(15200)}</span>
            <span>{formatDuration(90)}</span>
          </div>
          <ol aria-label="Route stops">
            <li>
              <span>1</span>
              <span>Fix HVAC Unit</span>
              <span>123 Main St</span>
            </li>
            <li>
              <span>2</span>
              <span>Plumbing Repair</span>
              <span>456 Oak Ave</span>
            </li>
          </ol>
        </div>
      </div>
    );

    expect(screen.getByText("Routes")).toBeInTheDocument();
    expect(screen.getByText("John Doe")).toBeInTheDocument();
    expect(screen.getByText("15.2 km")).toBeInTheDocument();
    expect(screen.getByText("1h 30m")).toBeInTheDocument();
    expect(screen.getByText("Fix HVAC Unit")).toBeInTheDocument();
    expect(screen.getByText("Plumbing Repair")).toBeInTheDocument();

    const results = await axe.run(container);
    expect(results).toHaveNoViolations();
  });

  it("renders empty state", async () => {
    const { container } = render(
      <div role="region" aria-label="Route planning">
        <h1>Routes</h1>
        <p>No routes planned.</p>
      </div>
    );

    expect(screen.getByText("No routes planned.")).toBeInTheDocument();

    const results = await axe.run(container);
    expect(results).toHaveNoViolations();
  });
});

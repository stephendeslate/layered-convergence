import "@testing-library/jest-dom/vitest";
import { expect } from "vitest";
import type { AxeResults } from "axe-core";

interface AxeMatchers {
  toHaveNoViolations(): void;
}

declare module "vitest" {
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface Assertion extends AxeMatchers {}
  // eslint-disable-next-line @typescript-eslint/no-empty-object-type
  interface AsymmetricMatchersContaining extends AxeMatchers {}
}

expect.extend({
  toHaveNoViolations(received: AxeResults) {
    const violations = received.violations;
    const pass = violations.length === 0;
    return {
      pass,
      message: () =>
        pass
          ? "Expected accessibility violations but found none"
          : `Found ${violations.length} accessibility violation(s):\n${violations
              .map(
                (v) =>
                  `  - ${v.id}: ${v.description} (${v.nodes.length} node(s))`
              )
              .join("\n")}`,
    };
  },
});

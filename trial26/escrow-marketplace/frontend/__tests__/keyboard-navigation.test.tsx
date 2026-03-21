// [TRACED:EM-036] Keyboard navigation tests
/**
 * [TRACED:AX-002] Keyboard navigation tests
 * Tests that interactive elements are keyboard-accessible.
 */
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

describe("Keyboard Navigation", () => {
  it("Button is focusable via Tab", async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);
    await user.tab();
    expect(screen.getByRole("button", { name: "Click me" })).toHaveFocus();
  });

  it("Button is activatable via Enter", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.tab();
    await user.keyboard("{Enter}");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Button is activatable via Space", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Click me</Button>);
    await user.tab();
    await user.keyboard(" ");
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("Input is focusable via Tab", async () => {
    const user = userEvent.setup();
    render(<Input aria-label="Test input" />);
    await user.tab();
    expect(screen.getByLabelText("Test input")).toHaveFocus();
  });

  it("Multiple interactive elements follow tab order", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Input aria-label="First input" />
        <Button>Submit</Button>
        <Input aria-label="Second input" />
      </div>
    );
    await user.tab();
    expect(screen.getByLabelText("First input")).toHaveFocus();
    await user.tab();
    expect(screen.getByRole("button", { name: "Submit" })).toHaveFocus();
    await user.tab();
    expect(screen.getByLabelText("Second input")).toHaveFocus();
  });

  it("Disabled button is not focusable", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Input aria-label="Before" />
        <Button disabled>Disabled</Button>
        <Input aria-label="After" />
      </div>
    );
    await user.tab();
    expect(screen.getByLabelText("Before")).toHaveFocus();
    await user.tab();
    // Should skip the disabled button
    expect(screen.getByLabelText("After")).toHaveFocus();
  });
});

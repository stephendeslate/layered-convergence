// [TRACED:AE-041] Keyboard navigation tests with real userEvent
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";

describe("Keyboard Navigation Tests", () => {
  it("should focus button via Tab key", async () => {
    const user = userEvent.setup();
    render(<Button>Click me</Button>);

    await user.tab();

    expect(screen.getByRole("button", { name: "Click me" })).toHaveFocus();
  });

  it("should activate button via Enter key", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should activate button via Space key", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Submit</Button>);

    await user.tab();
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should navigate between form fields with Tab", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Input data-testid="input-1" />
        <Input data-testid="input-2" />
        <Button>Submit</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByTestId("input-1")).toHaveFocus();

    await user.tab();
    expect(screen.getByTestId("input-2")).toHaveFocus();

    await user.tab();
    expect(screen.getByRole("button", { name: "Submit" })).toHaveFocus();
  });
});

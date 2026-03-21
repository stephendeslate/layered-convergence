// [TRACED:FD-041] Keyboard navigation tests with @testing-library/user-event
import React from "react";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Label } from "../components/ui/label";

describe("Keyboard Navigation Tests", () => {
  it("should navigate through elements with Tab", async () => {
    const user = userEvent.setup();
    render(
      <div>
        <Button>First</Button>
        <Button>Second</Button>
        <Button>Third</Button>
      </div>,
    );

    await user.tab();
    expect(screen.getByText("First")).toHaveFocus();

    await user.tab();
    expect(screen.getByText("Second")).toHaveFocus();

    await user.tab();
    expect(screen.getByText("Third")).toHaveFocus();
  });

  it("should activate button with Enter key", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press Enter</Button>);

    await user.tab();
    await user.keyboard("{Enter}");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should activate button with Space key", async () => {
    const user = userEvent.setup();
    const onClick = jest.fn();
    render(<Button onClick={onClick}>Press Space</Button>);

    await user.tab();
    await user.keyboard(" ");

    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it("should navigate through form fields sequentially", async () => {
    const user = userEvent.setup();
    render(
      <form>
        <Label htmlFor="field-name">Name</Label>
        <Input id="field-name" type="text" />
        <Label htmlFor="field-email">Email</Label>
        <Input id="field-email" type="email" />
        <Button type="submit">Submit</Button>
      </form>,
    );

    await user.tab();
    expect(screen.getByLabelText("Name")).toHaveFocus();

    await user.tab();
    expect(screen.getByLabelText("Email")).toHaveFocus();

    await user.tab();
    expect(screen.getByText("Submit")).toHaveFocus();
  });
});

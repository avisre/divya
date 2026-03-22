import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { Button } from "../../components/ui/Button";

describe("Button", () => {
  it("defaults native buttons to type=button", () => {
    render(<Button>Open prayer</Button>);

    expect(screen.getByRole("button", { name: "Open prayer" })).toHaveAttribute("type", "button");
  });

  it("preserves an explicit submit type", () => {
    render(<Button type="submit">Save</Button>);

    expect(screen.getByRole("button", { name: "Save" })).toHaveAttribute("type", "submit");
  });
});

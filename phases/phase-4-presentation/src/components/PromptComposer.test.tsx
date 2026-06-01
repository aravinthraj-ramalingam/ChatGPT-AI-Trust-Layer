import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { PromptComposer } from "./PromptComposer.js";

describe("PromptComposer", () => {
  it("submits trimmed prompt", async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn();

    render(<PromptComposer onSubmit={onSubmit} />);

    const input = screen.getByPlaceholderText(/ask anything/i);
    await user.type(input, "  Should we expand to EU?  ");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(onSubmit).toHaveBeenCalledWith("Should we expand to EU?");
  });
});

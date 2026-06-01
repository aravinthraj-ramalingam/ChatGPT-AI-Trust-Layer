import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { JudgmentChip } from "./JudgmentChip.js";

describe("JudgmentChip", () => {
  it("shows assumption, risk, and verify counts", () => {
    render(
      <JudgmentChip
        counts={{ assumptions: 2, risks: 1, verifications: 3 }}
        expanded={false}
        onToggle={() => {}}
      />
    );

    expect(screen.getByText("2")).toBeInTheDocument();
    expect(screen.getByText(/assumptions/i)).toBeInTheDocument();
    expect(screen.getByText(/risks/i)).toBeInTheDocument();
    expect(screen.getByText(/verify/i)).toBeInTheDocument();
    expect(screen.queryByText(/judgment/i)).not.toBeInTheDocument();
  });

  it("toggles on click", async () => {
    const user = userEvent.setup();
    const onToggle = vi.fn();

    render(
      <JudgmentChip
        counts={{ assumptions: 1, risks: 0, verifications: 1 }}
        expanded={false}
        onToggle={onToggle}
      />
    );

    await user.click(
      screen.getByRole("button", { name: /1 assumption · 0 risks · 1 verify/i })
    );
    expect(onToggle).toHaveBeenCalled();
  });
});

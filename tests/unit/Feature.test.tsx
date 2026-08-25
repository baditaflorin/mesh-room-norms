import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { createMockRoom } from "@baditaflorin/mesh-common/testing";
import { Feature } from "../../src/Feature";
import { config } from "../../src/config";

describe("Feature (component)", () => {
  it("renders a usable shared agreement launch when connected", () => {
    const room = createMockRoom();
    render(<Feature room={room} config={config} />);
    expect(screen.getByRole("heading", { name: "Make the room feel right." })).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Start with one useful agreement" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "Launch actions" })).toBeInTheDocument();
  });

  it("shows a connecting state when room is null", () => {
    render(<Feature room={null} config={config} />);
    expect(screen.getByText(/joining the room now/i)).toBeInTheDocument();
    expect(screen.getByText(/agreement board stays visible/i)).toBeInTheDocument();
  });
});

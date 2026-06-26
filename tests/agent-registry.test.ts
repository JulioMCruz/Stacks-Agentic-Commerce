import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

// `simnet` is a global injected by the clarinet vitest environment.
// State is reset (snapshot/restored) before each test, so every test sets up its own data.
const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const wallet1 = accounts.get("wallet_1")!;
const wallet2 = accounts.get("wallet_2")!;

const endpoints = Cl.list([
  Cl.tuple({
    name: Cl.stringAscii("web"),
    url: Cl.stringAscii("https://agent.example"),
  }),
]);

function registerAlice(sender = wallet1) {
  return simnet.callPublicFn(
    "agent-registry",
    "register-agent",
    [
      Cl.stringAscii("Alice Agent"),
      Cl.stringAscii("An autonomous trading agent"),
      Cl.principal(wallet1),
      endpoints,
    ],
    sender
  );
}

const aliceTuple = (overrides: Record<string, any> = {}) =>
  Cl.tuple({
    name: Cl.stringAscii("Alice Agent"),
    description: Cl.stringAscii("An autonomous trading agent"),
    creator: Cl.principal(wallet1),
    wallet: Cl.principal(wallet1),
    active: Cl.bool(true),
    endpoints,
    ...overrides,
  });

describe("agent-registry", () => {
  it("registers a new agent, returns id u1, and bumps the counter", () => {
    const { result } = registerAlice();
    expect(result).toBeOk(Cl.uint(1));

    expect(
      simnet.callReadOnlyFn("agent-registry", "get-agent-count", [], deployer)
        .result
    ).toBeOk(Cl.uint(1));
  });

  it("stores and reads the agent back via get-agent", () => {
    registerAlice();
    const { result } = simnet.callReadOnlyFn(
      "agent-registry",
      "get-agent",
      [Cl.uint(1)],
      deployer
    );
    expect(result).toBeOk(aliceTuple());
  });

  it("rejects an empty name (ERR_INVALID_NAME u103)", () => {
    const { result } = simnet.callPublicFn(
      "agent-registry",
      "register-agent",
      [Cl.stringAscii(""), Cl.stringAscii("desc"), Cl.principal(wallet1), endpoints],
      wallet1
    );
    expect(result).toBeErr(Cl.uint(103));
  });

  it("returns ERR_AGENT_NOT_FOUND (u102) for a missing agent", () => {
    const { result } = simnet.callReadOnlyFn(
      "agent-registry",
      "get-agent",
      [Cl.uint(999)],
      deployer
    );
    expect(result).toBeErr(Cl.uint(102));
  });

  it("only lets the creator update the agent (stranger -> u101)", () => {
    registerAlice();

    const stranger = simnet.callPublicFn(
      "agent-registry",
      "update-agent",
      [Cl.uint(1), Cl.some(Cl.stringAscii("Hacked")), Cl.none(), Cl.none()],
      wallet2
    );
    expect(stranger.result).toBeErr(Cl.uint(101));

    const updated = simnet.callPublicFn(
      "agent-registry",
      "update-agent",
      [Cl.uint(1), Cl.some(Cl.stringAscii("Alice v2")), Cl.none(), Cl.none()],
      wallet1
    );
    expect(updated.result).toBeOk(Cl.bool(true));

    expect(
      simnet.callReadOnlyFn("agent-registry", "get-agent", [Cl.uint(1)], deployer)
        .result
    ).toBeOk(aliceTuple({ name: Cl.stringAscii("Alice v2") }));
  });

  it("lets the creator deactivate the agent", () => {
    registerAlice();

    const { result } = simnet.callPublicFn(
      "agent-registry",
      "deactivate-agent",
      [Cl.uint(1)],
      wallet1
    );
    expect(result).toBeOk(Cl.bool(true));

    expect(
      simnet.callReadOnlyFn("agent-registry", "get-agent", [Cl.uint(1)], deployer)
        .result
    ).toBeOk(aliceTuple({ active: Cl.bool(false) }));
  });
});

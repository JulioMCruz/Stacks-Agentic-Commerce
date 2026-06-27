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

  describe("ownership & access control", () => {
    it("rejects set-owner from a non-owner (ERR_NOT_OWNER u100) and leaves the owner unchanged", () => {
      expect(
        simnet.callPublicFn("agent-registry", "set-owner", [Cl.principal(wallet1)], wallet1)
          .result
      ).toBeErr(Cl.uint(100));

      expect(
        simnet.callReadOnlyFn("agent-registry", "get-owner", [], deployer).result
      ).toBeOk(Cl.principal(deployer));
    });

    it("lets the owner transfer ownership and get-owner reflects the new owner", () => {
      expect(
        simnet.callPublicFn("agent-registry", "set-owner", [Cl.principal(wallet1)], deployer)
          .result
      ).toBeOk(Cl.bool(true));

      expect(
        simnet.callReadOnlyFn("agent-registry", "get-owner", [], deployer).result
      ).toBeOk(Cl.principal(wallet1));
    });

    it("only the owner can add a protocol-caller and is-protocol-caller reflects it", () => {
      // non-owner is rejected
      expect(
        simnet.callPublicFn(
          "agent-registry",
          "add-protocol-caller",
          [Cl.principal(wallet2)],
          wallet1
        ).result
      ).toBeErr(Cl.uint(100));

      // not whitelisted yet
      expect(
        simnet.callReadOnlyFn(
          "agent-registry",
          "is-protocol-caller",
          [Cl.principal(wallet2)],
          deployer
        ).result
      ).toBeBool(false);

      // owner whitelists
      expect(
        simnet.callPublicFn(
          "agent-registry",
          "add-protocol-caller",
          [Cl.principal(wallet2)],
          deployer
        ).result
      ).toBeOk(Cl.bool(true));

      expect(
        simnet.callReadOnlyFn(
          "agent-registry",
          "is-protocol-caller",
          [Cl.principal(wallet2)],
          deployer
        ).result
      ).toBeBool(true);
    });

    it("only the owner can remove a protocol-caller and is-protocol-caller flips back to false", () => {
      simnet.callPublicFn(
        "agent-registry",
        "add-protocol-caller",
        [Cl.principal(wallet2)],
        deployer
      );

      // non-owner cannot remove
      expect(
        simnet.callPublicFn(
          "agent-registry",
          "remove-protocol-caller",
          [Cl.principal(wallet2)],
          wallet1
        ).result
      ).toBeErr(Cl.uint(100));
      expect(
        simnet.callReadOnlyFn(
          "agent-registry",
          "is-protocol-caller",
          [Cl.principal(wallet2)],
          deployer
        ).result
      ).toBeBool(true);

      // owner removes
      expect(
        simnet.callPublicFn(
          "agent-registry",
          "remove-protocol-caller",
          [Cl.principal(wallet2)],
          deployer
        ).result
      ).toBeOk(Cl.bool(true));
      expect(
        simnet.callReadOnlyFn(
          "agent-registry",
          "is-protocol-caller",
          [Cl.principal(wallet2)],
          deployer
        ).result
      ).toBeBool(false);
    });

    it("only the owner can upgrade-implementation and get-current-implementation updates", () => {
      const newImpl = `${deployer}.agent-registry-impl`;

      // non-owner is rejected
      expect(
        simnet.callPublicFn(
          "agent-registry",
          "upgrade-implementation",
          [Cl.principal(newImpl)],
          wallet1
        ).result
      ).toBeErr(Cl.uint(100));

      // owner upgrades
      expect(
        simnet.callPublicFn(
          "agent-registry",
          "upgrade-implementation",
          [Cl.principal(newImpl)],
          deployer
        ).result
      ).toBeOk(Cl.bool(true));

      expect(
        simnet.callReadOnlyFn(
          "agent-registry",
          "get-current-implementation",
          [],
          deployer
        ).result
      ).toBeOk(Cl.principal(newImpl));
    });
  });

  describe("registration & update edge cases", () => {
    it("rejects an empty description (ERR_INVALID_DESCRIPTION u104)", () => {
      expect(
        simnet.callPublicFn(
          "agent-registry",
          "register-agent",
          [
            Cl.stringAscii("Bob Agent"),
            Cl.stringAscii(""),
            Cl.principal(wallet1),
            endpoints,
          ],
          wallet1
        ).result
      ).toBeErr(Cl.uint(104));
    });

    it("update-agent on a non-existent id returns ERR_AGENT_NOT_FOUND (u102)", () => {
      expect(
        simnet.callPublicFn(
          "agent-registry",
          "update-agent",
          [Cl.uint(999), Cl.some(Cl.stringAscii("Ghost")), Cl.none(), Cl.none()],
          wallet1
        ).result
      ).toBeErr(Cl.uint(102));
    });
  });
});

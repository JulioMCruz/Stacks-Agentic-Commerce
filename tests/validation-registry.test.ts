import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!; // contract owner
const verifier = accounts.get("wallet_1")!; // will be whitelisted as protocol caller
const agent = accounts.get("wallet_2")!;

const V = "validation-registry";
const proofHash = Cl.bufferFromHex("ab".repeat(32)); // 32-byte buff
const capabilities = Cl.list([
  Cl.stringAscii("trading"),
  Cl.stringAscii("analysis"),
]);

function whitelistVerifier() {
  return simnet.callPublicFn(V, "add-protocol-caller", [Cl.principal(verifier)], deployer);
}

describe("validation-registry", () => {
  it("only a protocol-caller can verify an agent", () => {
    // before whitelist
    expect(
      simnet.callPublicFn(V, "verify-agent", [Cl.principal(agent), proofHash, capabilities], verifier)
        .result
    ).toBeErr(Cl.uint(101)); // ERR_NOT_AUTHORIZED

    expect(whitelistVerifier().result).toBeOk(Cl.bool(true));

    expect(
      simnet.callPublicFn(V, "verify-agent", [Cl.principal(agent), proofHash, capabilities], verifier)
        .result
    ).toBeOk(Cl.bool(true));

    expect(
      simnet.callReadOnlyFn(V, "is-verified", [Cl.principal(agent)], deployer).result
    ).toBeBool(true);
  });

  it("cannot verify the same agent twice (ERR_ALREADY_VERIFIED u104)", () => {
    whitelistVerifier();
    simnet.callPublicFn(V, "verify-agent", [Cl.principal(agent), proofHash, capabilities], verifier);
    expect(
      simnet.callPublicFn(V, "verify-agent", [Cl.principal(agent), proofHash, capabilities], verifier)
        .result
    ).toBeErr(Cl.uint(104));
  });

  it("a protocol-caller can revoke verification", () => {
    whitelistVerifier();
    simnet.callPublicFn(V, "verify-agent", [Cl.principal(agent), proofHash, capabilities], verifier);

    expect(
      simnet.callPublicFn(V, "revoke-verification", [Cl.principal(agent)], verifier).result
    ).toBeOk(Cl.bool(true));
    expect(
      simnet.callReadOnlyFn(V, "is-verified", [Cl.principal(agent)], deployer).result
    ).toBeBool(false);
  });

  it("can append a capability to a verified agent", () => {
    whitelistVerifier();
    simnet.callPublicFn(V, "verify-agent", [Cl.principal(agent), proofHash, capabilities], verifier);

    expect(
      simnet.callPublicFn(
        V,
        "add-capability",
        [Cl.principal(agent), Cl.stringAscii("governance")],
        verifier
      ).result
    ).toBeOk(Cl.bool(true));
  });

  it("is-verified is false for an unknown agent", () => {
    expect(
      simnet.callReadOnlyFn(V, "is-verified", [Cl.principal(agent)], deployer).result
    ).toBeBool(false);
  });
});

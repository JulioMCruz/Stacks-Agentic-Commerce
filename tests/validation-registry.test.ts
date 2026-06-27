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

  describe("verification types", () => {
    it("the owner can add a verification-type and read it back via get-verification-type", () => {
      expect(
        simnet.callPublicFn(
          V,
          "add-verification-type",
          [Cl.stringAscii("kyc"), Cl.stringAscii("Know your customer"), Cl.uint(1000)],
          deployer
        ).result
      ).toBeOk(Cl.bool(true));

      expect(
        simnet.callReadOnlyFn(
          V,
          "get-verification-type",
          [Cl.stringAscii("kyc")],
          deployer
        ).result
      ).toBeOk(
        Cl.tuple({
          description: Cl.stringAscii("Know your customer"),
          "required-stake": Cl.uint(1000),
          active: Cl.bool(true),
        })
      );
    });

    it("a non-owner cannot add a verification-type (ERR_NOT_OWNER u100)", () => {
      expect(
        simnet.callPublicFn(
          V,
          "add-verification-type",
          [Cl.stringAscii("kyc"), Cl.stringAscii("Know your customer"), Cl.uint(1000)],
          agent
        ).result
      ).toBeErr(Cl.uint(100));
    });
  });

  describe("capability management", () => {
    it("a non-protocol-caller cannot add a capability (ERR_NOT_AUTHORIZED u101)", () => {
      whitelistVerifier();
      simnet.callPublicFn(V, "verify-agent", [Cl.principal(agent), proofHash, capabilities], verifier);

      // `agent` is not a protocol-caller
      expect(
        simnet.callPublicFn(
          V,
          "add-capability",
          [Cl.principal(agent), Cl.stringAscii("governance")],
          agent
        ).result
      ).toBeErr(Cl.uint(101));
    });

    it("remove-capability clears the capability list", () => {
      whitelistVerifier();
      simnet.callPublicFn(V, "verify-agent", [Cl.principal(agent), proofHash, capabilities], verifier);

      expect(
        simnet.callPublicFn(
          V,
          "remove-capability",
          [Cl.principal(agent), Cl.stringAscii("trading")],
          verifier
        ).result
      ).toBeOk(Cl.bool(true));

      const verification: any = simnet.callReadOnlyFn(
        V,
        "get-verification",
        [Cl.principal(agent)],
        deployer
      ).result;
      // (ok tuple) -> value.value.capabilities is an empty list
      expect(verification.value.value.capabilities.value.length).toBe(0);
    });
  });

  describe("verification lifecycle", () => {
    it("revoke sets is-verified to false while keeping the record", () => {
      whitelistVerifier();
      simnet.callPublicFn(V, "verify-agent", [Cl.principal(agent), proofHash, capabilities], verifier);
      expect(
        simnet.callReadOnlyFn(V, "is-verified", [Cl.principal(agent)], deployer).result
      ).toBeBool(true);

      expect(
        simnet.callPublicFn(V, "revoke-verification", [Cl.principal(agent)], verifier).result
      ).toBeOk(Cl.bool(true));
      expect(
        simnet.callReadOnlyFn(V, "is-verified", [Cl.principal(agent)], deployer).result
      ).toBeBool(false);
    });

    it("verifying an unknown agent works once, then re-verifying returns ERR_ALREADY_VERIFIED (u104)", () => {
      whitelistVerifier();
      expect(
        simnet.callPublicFn(V, "verify-agent", [Cl.principal(agent), proofHash, capabilities], verifier)
          .result
      ).toBeOk(Cl.bool(true));
      expect(
        simnet.callPublicFn(V, "verify-agent", [Cl.principal(agent), proofHash, capabilities], verifier)
          .result
      ).toBeErr(Cl.uint(104));
    });
  });
});

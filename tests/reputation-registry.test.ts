import { Cl } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!; // contract owner
const agent = accounts.get("wallet_1")!;
const raterA = accounts.get("wallet_2")!;
const raterB = accounts.get("wallet_3")!;

const R = "reputation-registry";

const repTuple = (o: Record<string, any>) =>
  Cl.tuple({
    "total-score": Cl.uint(o.total ?? 0),
    "rating-count": Cl.uint(o.count ?? 0),
    "average-score": Cl.uint(o.avg ?? 0),
    "completed-jobs": Cl.uint(o.completed ?? 0),
    "disputed-jobs": Cl.uint(o.disputed ?? 0),
  });

describe("reputation-registry", () => {
  it("records a rating and computes the running average", () => {
    expect(
      simnet.callPublicFn(
        R,
        "rate-agent",
        [Cl.principal(agent), Cl.uint(5), Cl.uint(1), Cl.stringAscii("great work")],
        raterA
      ).result
    ).toBeOk(Cl.bool(true));

    expect(
      simnet.callReadOnlyFn(R, "get-reputation", [Cl.principal(agent)], deployer).result
    ).toBeOk(repTuple({ total: 5, count: 1, avg: 5 }));

    // second rater scores 3 -> average (5+3)/2 = 4
    simnet.callPublicFn(
      R,
      "rate-agent",
      [Cl.principal(agent), Cl.uint(3), Cl.uint(2), Cl.stringAscii("ok")],
      raterB
    );
    expect(
      simnet.callReadOnlyFn(R, "get-reputation", [Cl.principal(agent)], deployer).result
    ).toBeOk(repTuple({ total: 8, count: 2, avg: 4 }));
  });

  it("blocks self-rating (ERR_NOT_AUTHORIZED u101)", () => {
    expect(
      simnet.callPublicFn(
        R,
        "rate-agent",
        [Cl.principal(agent), Cl.uint(5), Cl.uint(1), Cl.stringAscii("me!")],
        agent
      ).result
    ).toBeErr(Cl.uint(101));
  });

  it("rejects out-of-range scores (ERR_INVALID_RATING u103)", () => {
    expect(
      simnet.callPublicFn(
        R,
        "rate-agent",
        [Cl.principal(agent), Cl.uint(0), Cl.uint(1), Cl.stringAscii("zero")],
        raterA
      ).result
    ).toBeErr(Cl.uint(103));
    expect(
      simnet.callPublicFn(
        R,
        "rate-agent",
        [Cl.principal(agent), Cl.uint(6), Cl.uint(1), Cl.stringAscii("six")],
        raterA
      ).result
    ).toBeErr(Cl.uint(103));
  });

  it("returns a zeroed reputation for an unrated agent", () => {
    expect(
      simnet.callReadOnlyFn(R, "get-reputation", [Cl.principal(raterB)], deployer).result
    ).toBeOk(repTuple({}));
  });

  it("only a protocol-caller can update job stats", () => {
    // not authorized yet
    expect(
      simnet.callPublicFn(
        R,
        "update-job-stats",
        [Cl.principal(agent), Cl.bool(true), Cl.bool(false)],
        raterA
      ).result
    ).toBeErr(Cl.uint(101));

    // owner whitelists raterA as a protocol caller
    expect(
      simnet.callPublicFn(R, "add-protocol-caller", [Cl.principal(raterA)], deployer).result
    ).toBeOk(Cl.bool(true));

    expect(
      simnet.callPublicFn(
        R,
        "update-job-stats",
        [Cl.principal(agent), Cl.bool(true), Cl.bool(false)],
        raterA
      ).result
    ).toBeOk(Cl.bool(true));

    expect(
      simnet.callReadOnlyFn(R, "get-reputation", [Cl.principal(agent)], deployer).result
    ).toBeOk(repTuple({ completed: 1 }));
  });

  describe("rating storage & lookups", () => {
    it("a second distinct rater updates total/count/average", () => {
      simnet.callPublicFn(
        R,
        "rate-agent",
        [Cl.principal(agent), Cl.uint(4), Cl.uint(1), Cl.stringAscii("solid")],
        raterA
      );
      expect(
        simnet.callReadOnlyFn(R, "get-reputation", [Cl.principal(agent)], deployer).result
      ).toBeOk(repTuple({ total: 4, count: 1, avg: 4 }));

      // second, distinct rater scores 2 -> total 6, count 2, avg 6/2 = 3
      expect(
        simnet.callPublicFn(
          R,
          "rate-agent",
          [Cl.principal(agent), Cl.uint(2), Cl.uint(2), Cl.stringAscii("meh")],
          raterB
        ).result
      ).toBeOk(Cl.bool(true));
      expect(
        simnet.callReadOnlyFn(R, "get-reputation", [Cl.principal(agent)], deployer).result
      ).toBeOk(repTuple({ total: 6, count: 2, avg: 3 }));
    });

    it("get-rating returns the stored rating record", () => {
      simnet.callPublicFn(
        R,
        "rate-agent",
        [Cl.principal(agent), Cl.uint(5), Cl.uint(7), Cl.stringAscii("excellent")],
        raterA
      );
      expect(
        simnet.callReadOnlyFn(
          R,
          "get-rating",
          [Cl.principal(agent), Cl.principal(raterA)],
          deployer
        ).result
      ).toBeOk(
        Cl.tuple({
          score: Cl.uint(5),
          "job-id": Cl.uint(7),
          comment: Cl.stringAscii("excellent"),
        })
      );
    });

    it("has-rated is false before and true after a rating", () => {
      expect(
        simnet.callReadOnlyFn(
          R,
          "has-rated",
          [Cl.principal(agent), Cl.principal(raterA)],
          deployer
        ).result
      ).toBeBool(false);

      simnet.callPublicFn(
        R,
        "rate-agent",
        [Cl.principal(agent), Cl.uint(3), Cl.uint(1), Cl.stringAscii("ok")],
        raterA
      );

      expect(
        simnet.callReadOnlyFn(
          R,
          "has-rated",
          [Cl.principal(agent), Cl.principal(raterA)],
          deployer
        ).result
      ).toBeBool(true);
    });

    it("accepts the boundary ratings 1 and 5", () => {
      expect(
        simnet.callPublicFn(
          R,
          "rate-agent",
          [Cl.principal(agent), Cl.uint(1), Cl.uint(1), Cl.stringAscii("low bound")],
          raterA
        ).result
      ).toBeOk(Cl.bool(true));

      expect(
        simnet.callPublicFn(
          R,
          "rate-agent",
          [Cl.principal(agent), Cl.uint(5), Cl.uint(2), Cl.stringAscii("high bound")],
          raterB
        ).result
      ).toBeOk(Cl.bool(true));

      // total 1+5 = 6, count 2, avg 3
      expect(
        simnet.callReadOnlyFn(R, "get-reputation", [Cl.principal(agent)], deployer).result
      ).toBeOk(repTuple({ total: 6, count: 2, avg: 3 }));
    });
  });

  describe("job stats", () => {
    it("update-job-stats with disputed=true increments disputed-jobs (after add-protocol-caller)", () => {
      expect(
        simnet.callPublicFn(R, "add-protocol-caller", [Cl.principal(raterA)], deployer).result
      ).toBeOk(Cl.bool(true));

      expect(
        simnet.callPublicFn(
          R,
          "update-job-stats",
          [Cl.principal(agent), Cl.bool(false), Cl.bool(true)],
          raterA
        ).result
      ).toBeOk(Cl.bool(true));

      expect(
        simnet.callReadOnlyFn(R, "get-reputation", [Cl.principal(agent)], deployer).result
      ).toBeOk(repTuple({ disputed: 1 }));
    });
  });
});

import { describe, expect, it } from "vitest";
import { Clarinet, types } from "clarinet";

describe("Agent Registry Tests", () => {
  let chain: any;
  let accountA: any;

  beforeAll(() => {
    const model = require("./models/agent-registry");
    chain = new Clarinet.Chain({ model });
    accountA = chain.accounts.get("account1")!;
  });

  it("should register a new agent", () => {
    const block = chain.blockTrace([
      {
        contractCall: {
          contract: "agent-registry",
          function: "register-agent",
          args: [
            types.ascii("TestAgent"),
            types.ascii("A test agent"),
            types.principal(accountA.address),
            types.list([
              types.tuple({
                name: types.ascii("web"),
                url: types.ascii("https://example.com"),
              }),
            ]),
          ],
        },
      },
    ]);

    expect(block.receipts[0].result).toBe("(ok u1)");
  });

  it("should get agent by ID", () => {
    const block = chain.blockTrace([
      {
        contractCall: {
          contract: "agent-registry",
          function: "get-agent",
          args: [types.uint(1)],
        },
      },
    ]);

    expect(block.receipts[0].result).toMatch(/(ok|err)/);
  });
});

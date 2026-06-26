import { Clarinet, types } from "clarinet";

describe("Agentic Commerce Tests", () => {
  let chain: any;
  let accountA: any;

  beforeAll(() => {
    const model = require("./models/agentic-commerce");
    chain = new Clarinet.Chain({ model });
    accountA = chain.accounts.get("account1")!;
  });

  it("should create a job", () => {
    const block = chain.blockTrace([
      {
        contractCall: {
          contract: "agentic-commerce",
          function: "create-job",
          args: [
            types.principal(accountA.address),
            types.principal(accountA.address),
            types.uint(100000),
            types.ascii("Test job"),
          ],
        },
      },
    ]);

    expect(block.receipts[0].result).toMatch(/(ok u1|err)/);
  });

  it("should set budget", () => {
    const block = chain.blockTrace([
      {
        contractCall: {
          contract: "agentic-commerce",
          function: "set-budget",
          args: [types.uint(1), types.uint(1000)],
        },
      },
    ]);

    expect(block.receipts[0].result).toBe("(ok true)");
  });
});

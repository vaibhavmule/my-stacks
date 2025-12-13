import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const address1 = accounts.get("wallet_1")!;

describe("counter tests", () => {
  it("increments the counter", () => {
    let result = simnet.callPublicFn(
      "counter",
      "increment",
      [],
      address1
    );

    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    const count = simnet.getDataVar("counter", "count");
    expect(count).toBeUint(1);
  });

  it("decrements the counter", () => {
    // First increment to 1
    simnet.callPublicFn("counter", "increment", [], address1);
    
    // Then decrement
    let result = simnet.callPublicFn(
      "counter",
      "decrement",
      [],
      address1
    );

    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    const count = simnet.getDataVar("counter", "count");
    expect(count).toBeUint(0);
  });

  it("cannot decrement below zero", () => {
    let result = simnet.callPublicFn(
      "counter",
      "decrement",
      [],
      address1
    );

    expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
  });

  it("gets count as ASCII string using Clarity 4 to-ascii", () => {
    // Increment a few times
    simnet.callPublicFn("counter", "increment", [], address1);
    simnet.callPublicFn("counter", "increment", [], address1);
    
    let result = simnet.callReadOnlyFn(
      "counter",
      "get-count-as-string",
      [],
      address1
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("gets current block time using Clarity 4 stacks-block-time", () => {
    let result = simnet.callReadOnlyFn(
      "counter",
      "get-current-time",
      [],
      address1
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});

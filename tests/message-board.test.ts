import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;

describe("message board tests", () => {
  let content = "Hello Stacks Devs!"

  it("allows user to add a new message", () => {
    let confirmation = simnet.callPublicFn(
      "message-board",
      "add-message",
      [Cl.stringUtf8(content)],
      address1
    )

    expect(confirmation.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Check that message was stored
    const message = simnet.callReadOnlyFn(
      "message-board",
      "get-message",
      [Cl.uint(1)],
      address1
    );
    
    expect(message.result).toHaveClarityType(ClarityType.OptionalSome);
  });

  it("gets current block time using Clarity 4 stacks-block-time", () => {
    let result = simnet.callReadOnlyFn(
      "message-board",
      "get-current-block-time",
      [],
      address1
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });

  it("converts message count to ASCII string using Clarity 4 to-ascii", () => {
    // Add a message first
    simnet.callPublicFn(
      "message-board",
      "add-message",
      [Cl.stringUtf8(content)],
      address1
    );
    
    let result = simnet.callReadOnlyFn(
      "message-board",
      "get-message-count-as-string",
      [],
      address1
    );
    
    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
  });
});

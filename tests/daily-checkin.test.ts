import { Cl, ClarityType } from "@stacks/transactions";
import { describe, expect, it } from "vitest";

const accounts = simnet.getAccounts();
const deployer = accounts.get("deployer")!;
const address1 = accounts.get("wallet_1")!;
const address2 = accounts.get("wallet_2")!;

describe("daily checkin tests", () => {
  it("allows user to check in", () => {
    let result = simnet.callPublicFn(
      "daily-checkin",
      "check-in",
      [],
      address1
    );

    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    // Check streak is 1
    const streak = simnet.callReadOnlyFn(
      "daily-checkin",
      "get-user-streak",
      [Cl.standardPrincipal(address1)],
      address1
    );
    
    expect(streak.result).toBeOk(Cl.uint(1));
  });

  it("prevents multiple check-ins on the same day", () => {
    // First check-in
    simnet.callPublicFn("daily-checkin", "check-in", [], address1);
    
    // Try to check in again (should fail)
    let result = simnet.callPublicFn(
      "daily-checkin",
      "check-in",
      [],
      address1
    );

    expect(result.result).toHaveClarityType(ClarityType.ResponseErr);
  });

  it("tracks user streak across days", () => {
    // Check in day 1
    simnet.callPublicFn("daily-checkin", "check-in", [], address1);
    
    // Move to next day
    simnet.mineEmptyBurnBlocks(1);
    
    // Check in day 2 (streak should be 2)
    let result = simnet.callPublicFn(
      "daily-checkin",
      "check-in",
      [],
      address1
    );

    expect(result.result).toHaveClarityType(ClarityType.ResponseOk);
    
    const streak = simnet.callReadOnlyFn(
      "daily-checkin",
      "get-user-streak",
      [Cl.standardPrincipal(address1)],
      address1
    );
    
    expect(streak.result).toBeOk(Cl.uint(2));
  });

  it("resets streak if user misses a day", () => {
    // Check in day 1
    simnet.callPublicFn("daily-checkin", "check-in", [], address1);
    
    // Move forward 2 days (missed a day)
    simnet.mineEmptyBurnBlocks(2);
    
    // Check in (streak should reset to 1)
    simnet.callPublicFn("daily-checkin", "check-in", [], address1);
    
    const streak = simnet.callReadOnlyFn(
      "daily-checkin",
      "get-user-streak",
      [Cl.standardPrincipal(address1)],
      address1
    );
    
    expect(streak.result).toBeOk(Cl.uint(1));
  });

  it("tracks total check-ins per user", () => {
    // Check in multiple times across days
    simnet.callPublicFn("daily-checkin", "check-in", [], address2);
    simnet.mineEmptyBurnBlocks(1);
    simnet.callPublicFn("daily-checkin", "check-in", [], address2);
    simnet.mineEmptyBurnBlocks(1);
    simnet.callPublicFn("daily-checkin", "check-in", [], address2);
    
    const total = simnet.callReadOnlyFn(
      "daily-checkin",
      "get-user-total-checkins",
      [Cl.standardPrincipal(address2)],
      address2
    );
    
    expect(total.result).toBeOk(Cl.uint(3));
  });

  it("checks if user has checked in today", () => {
    simnet.callPublicFn("daily-checkin", "check-in", [], address1);
    
    const checkedIn = simnet.callReadOnlyFn(
      "daily-checkin",
      "has-checked-in-today",
      [Cl.standardPrincipal(address1)],
      address1
    );
    
    expect(checkedIn.result).toBeOk(Cl.bool(true));
  });

  it("gets total check-ins across all users", () => {
    simnet.callPublicFn("daily-checkin", "check-in", [], address1);
    simnet.mineEmptyBurnBlocks(1);
    simnet.callPublicFn("daily-checkin", "check-in", [], address2);
    
    const total = simnet.callReadOnlyFn(
      "daily-checkin",
      "get-total-checkins",
      [],
      address1
    );
    
    expect(total.result).toBeOk(Cl.uint(2));
  });
});

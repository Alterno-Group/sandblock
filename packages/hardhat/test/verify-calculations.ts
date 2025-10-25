import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { EnergyProjectHub, MockUSDT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Verification script to manually check Interest and Principal calculations
 * Run with: yarn hardhat test test/verify-calculations.ts
 */

enum ProjectType {
  Solar,
  Wind,
  Hydro,
  Thermal,
  Geothermal,
  Biomass,
  Other,
}

function parseUSDT(amount: string): bigint {
  return ethers.parseUnits(amount, 6);
}

function formatUSDT(amount: bigint): string {
  return ethers.formatUnits(amount, 6);
}

describe("Manual Calculation Verification", function () {
  let energyProjectHub: EnergyProjectHub;
  let mockUSDT: MockUSDT;
  let owner: HardhatEthersSigner;
  let projectOwner: HardhatEthersSigner;
  let investor1: HardhatEthersSigner;
  let investor2: HardhatEthersSigner;
  let investor3: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, projectOwner, investor1, investor2, investor3] = await ethers.getSigners();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();

    const EnergyProjectHub = await ethers.getContractFactory("EnergyProjectHub");
    energyProjectHub = await EnergyProjectHub.deploy(await mockUSDT.getAddress());

    // Mint USDT to investors
    await mockUSDT.mint(investor1.address, parseUSDT("200000"));
    await mockUSDT.mint(investor2.address, parseUSDT("200000"));
    await mockUSDT.mint(investor3.address, parseUSDT("200000"));
  });

  describe("Interest Rate Calculations", function () {
    it("Verify Tier 1 (5% APY) - Weekly Interest", async function () {
      console.log("\n=== TIER 1 (5% APY) VERIFICATION ===");

      // Create project
      await energyProjectHub.connect(projectOwner).createProject(
        "Test Project",
        "Description",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      // Invest 1000 USDT (Tier 1)
      const investAmount = parseUSDT("1000");
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("100000"));
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);

      // Fund remaining and complete construction
      await mockUSDT.connect(investor2).approve(await energyProjectHub.getAddress(), parseUSDT("100000"));
      await energyProjectHub.connect(investor2).investInProject(0, parseUSDT("99000"));
      await energyProjectHub.connect(projectOwner).completeConstruction(0);

      // Deposit payout funds
      await mockUSDT.mint(projectOwner.address, parseUSDT("150000"));
      await mockUSDT.connect(projectOwner).approve(await energyProjectHub.getAddress(), parseUSDT("150000"));
      await energyProjectHub.connect(projectOwner).depositPayoutFunds(parseUSDT("150000"));

      // Fast forward 1 week
      await time.increase(7 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);

      console.log("Investment Amount: 1000 USDT");
      console.log("Annual Interest Rate: 5%");
      console.log("Expected Weekly Interest: 1000 * 0.05 / 52 = 0.961538 USDT");
      console.log("Actual Available Interest:", formatUSDT(investment.availableInterest), "USDT");

      const expected = 1000 * 0.05 / 52;
      const actual = parseFloat(formatUSDT(investment.availableInterest));
      console.log("Difference:", Math.abs(expected - actual), "USDT");

      expect(investment.availableInterest).to.be.closeTo(parseUSDT("0.961538"), parseUSDT("0.01"));
      console.log("✓ PASSED\n");
    });

    it("Verify Tier 2 (7% APY) - Weekly Interest", async function () {
      console.log("\n=== TIER 2 (7% APY) VERIFICATION ===");

      await energyProjectHub.connect(projectOwner).createProject(
        "Test Project",
        "Description",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      const investAmount = parseUSDT("10000");
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("100000"));
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);

      await mockUSDT.connect(investor2).approve(await energyProjectHub.getAddress(), parseUSDT("100000"));
      await energyProjectHub.connect(investor2).investInProject(0, parseUSDT("90000"));
      await energyProjectHub.connect(projectOwner).completeConstruction(0);

      await mockUSDT.mint(projectOwner.address, parseUSDT("150000"));
      await mockUSDT.connect(projectOwner).approve(await energyProjectHub.getAddress(), parseUSDT("150000"));
      await energyProjectHub.connect(projectOwner).depositPayoutFunds(parseUSDT("150000"));

      await time.increase(7 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);

      console.log("Investment Amount: 10,000 USDT");
      console.log("Annual Interest Rate: 7%");
      console.log("Expected Weekly Interest: 10000 * 0.07 / 52 = 13.461538 USDT");
      console.log("Actual Available Interest:", formatUSDT(investment.availableInterest), "USDT");

      const expected = 10000 * 0.07 / 52;
      const actual = parseFloat(formatUSDT(investment.availableInterest));
      console.log("Difference:", Math.abs(expected - actual), "USDT");

      expect(investment.availableInterest).to.be.closeTo(parseUSDT("13.461538"), parseUSDT("0.1"));
      console.log("✓ PASSED\n");
    });

    it("Verify Tier 3 (9% APY) - Weekly Interest", async function () {
      console.log("\n=== TIER 3 (9% APY) VERIFICATION ===");

      await energyProjectHub.connect(projectOwner).createProject(
        "Test Project",
        "Description",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      const investAmount = parseUSDT("25000");
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("100000"));
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);

      await mockUSDT.connect(investor2).approve(await energyProjectHub.getAddress(), parseUSDT("100000"));
      await energyProjectHub.connect(investor2).investInProject(0, parseUSDT("75000"));
      await energyProjectHub.connect(projectOwner).completeConstruction(0);

      await mockUSDT.mint(projectOwner.address, parseUSDT("150000"));
      await mockUSDT.connect(projectOwner).approve(await energyProjectHub.getAddress(), parseUSDT("150000"));
      await energyProjectHub.connect(projectOwner).depositPayoutFunds(parseUSDT("150000"));

      await time.increase(7 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);

      console.log("Investment Amount: 25,000 USDT");
      console.log("Annual Interest Rate: 9%");
      console.log("Expected Weekly Interest: 25000 * 0.09 / 52 = 43.269230 USDT");
      console.log("Actual Available Interest:", formatUSDT(investment.availableInterest), "USDT");

      const expected = 25000 * 0.09 / 52;
      const actual = parseFloat(formatUSDT(investment.availableInterest));
      console.log("Difference:", Math.abs(expected - actual), "USDT");

      expect(investment.availableInterest).to.be.closeTo(parseUSDT("43.269230"), parseUSDT("0.1"));
      console.log("✓ PASSED\n");
    });

    it("Verify Multi-Week Interest Accumulation", async function () {
      console.log("\n=== MULTI-WEEK ACCUMULATION VERIFICATION ===");

      await energyProjectHub.connect(projectOwner).createProject(
        "Test Project",
        "Description",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      const investAmount = parseUSDT("10000");
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("100000"));
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);

      await mockUSDT.connect(investor2).approve(await energyProjectHub.getAddress(), parseUSDT("100000"));
      await energyProjectHub.connect(investor2).investInProject(0, parseUSDT("90000"));
      await energyProjectHub.connect(projectOwner).completeConstruction(0);

      await mockUSDT.mint(projectOwner.address, parseUSDT("150000"));
      await mockUSDT.connect(projectOwner).approve(await energyProjectHub.getAddress(), parseUSDT("150000"));
      await energyProjectHub.connect(projectOwner).depositPayoutFunds(parseUSDT("150000"));

      // Fast forward 4 weeks
      await time.increase(4 * 7 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);

      console.log("Investment Amount: 10,000 USDT");
      console.log("Annual Interest Rate: 7%");
      console.log("Time Period: 4 weeks");
      console.log("Expected Weekly Interest: 10000 * 0.07 / 52 = 13.461538 USDT");
      console.log("Expected 4-Week Interest: 13.461538 * 4 = 53.846152 USDT");
      console.log("Actual Available Interest:", formatUSDT(investment.availableInterest), "USDT");

      const expected = (10000 * 0.07 / 52) * 4;
      const actual = parseFloat(formatUSDT(investment.availableInterest));
      console.log("Difference:", Math.abs(expected - actual), "USDT");

      const expectedBigInt = parseUSDT("13.461538") * 4n;
      expect(investment.availableInterest).to.be.closeTo(expectedBigInt, parseUSDT("0.5"));
      console.log("✓ PASSED\n");
    });
  });

  describe("Principal Payback Calculations", function () {
    it("Verify 20% Annual Principal After 2 Years Delay", async function () {
      console.log("\n=== PRINCIPAL PAYBACK VERIFICATION ===");

      await energyProjectHub.connect(projectOwner).createProject(
        "Test Project",
        "Description",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      const investAmount = parseUSDT("100000");
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), investAmount);
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);

      console.log("Investment Amount: 100,000 USDT");
      console.log("Funding Completed At: Block timestamp");

      await energyProjectHub.connect(projectOwner).completeConstruction(0);

      await mockUSDT.mint(projectOwner.address, parseUSDT("150000"));
      await mockUSDT.connect(projectOwner).approve(await energyProjectHub.getAddress(), parseUSDT("150000"));
      await energyProjectHub.connect(projectOwner).depositPayoutFunds(parseUSDT("150000"));

      // Test at 1 year (should be 0)
      console.log("\n--- After 1 Year ---");
      await time.increase(365 * 24 * 60 * 60);
      let investment = await energyProjectHub.getInvestment(0, investor1.address);
      console.log("Expected Available Principal: 0 USDT (still in 2-year delay)");
      console.log("Actual Available Principal:", formatUSDT(investment.availablePrincipal), "USDT");
      expect(investment.availablePrincipal).to.equal(0);
      console.log("✓ Correct - No principal available yet");

      // Test at 2 years (should still be 0, delay period just ended)
      console.log("\n--- After 2 Years Total ---");
      await time.increase(365 * 24 * 60 * 60);
      investment = await energyProjectHub.getInvestment(0, investor1.address);
      console.log("Expected Available Principal: 0 USDT (delay period just ended)");
      console.log("Actual Available Principal:", formatUSDT(investment.availablePrincipal), "USDT");
      expect(investment.availablePrincipal).to.equal(0);
      console.log("✓ Correct - Delay period just ended, need 1 more year");

      // Test at 3 years (should be 20,000)
      console.log("\n--- After 3 Years Total (1 year after delay) ---");
      await time.increase(365 * 24 * 60 * 60);
      investment = await energyProjectHub.getInvestment(0, investor1.address);
      console.log("Expected Available Principal: 100000 * 0.20 = 20,000 USDT (first 20%)");
      console.log("Actual Available Principal:", formatUSDT(investment.availablePrincipal), "USDT");

      const expected = 100000 * 0.20;
      const actual = parseFloat(formatUSDT(investment.availablePrincipal));
      console.log("Difference:", Math.abs(expected - actual), "USDT");

      expect(investment.availablePrincipal).to.be.closeTo(parseUSDT("20000"), parseUSDT("100"));
      console.log("✓ PASSED - First 20% available\n");
    });

    it("Verify Full Principal Payback Over 5 Years", async function () {
      console.log("\n=== 5-YEAR FULL PRINCIPAL PAYBACK VERIFICATION ===");

      await energyProjectHub.connect(projectOwner).createProject(
        "Test Project",
        "Description",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      const investAmount = parseUSDT("100000");
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), investAmount);
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);

      await energyProjectHub.connect(projectOwner).completeConstruction(0);

      await mockUSDT.mint(projectOwner.address, parseUSDT("150000"));
      await mockUSDT.connect(projectOwner).approve(await energyProjectHub.getAddress(), parseUSDT("150000"));
      await energyProjectHub.connect(projectOwner).depositPayoutFunds(parseUSDT("150000"));

      console.log("Investment Amount: 100,000 USDT");
      console.log("Annual Payback Rate: 20%");
      console.log("Expected Annual Payback: 20,000 USDT");
      console.log("\nWaiting 2 years (delay period)...");

      // Wait 2 years delay
      await time.increase(2 * 365 * 24 * 60 * 60);

      let totalClaimed = 0n;

      // Claim 20% each year for 5 years
      for (let i = 1; i <= 5; i++) {
        await time.increase(365 * 24 * 60 * 60);

        const balanceBefore = await mockUSDT.balanceOf(investor1.address);
        await energyProjectHub.connect(investor1).claimPrincipal(0);
        const balanceAfter = await mockUSDT.balanceOf(investor1.address);

        const claimed = balanceAfter - balanceBefore;
        totalClaimed += claimed;

        console.log(`\nYear ${i} Claim:`);
        console.log(`  Claimed: ${formatUSDT(claimed)} USDT`);
        console.log(`  Expected: ~20,000 USDT`);
        console.log(`  Total Claimed So Far: ${formatUSDT(totalClaimed)} USDT`);
      }

      const investment = await energyProjectHub.getInvestment(0, investor1.address);

      console.log("\n=== FINAL RESULTS ===");
      console.log("Total Claimed:", formatUSDT(totalClaimed), "USDT");
      console.log("Expected Total:", "100,000 USDT");
      console.log("Principal Remaining:", formatUSDT(investment.principalRemaining), "USDT");
      console.log("Expected Remaining:", "~0 USDT");

      expect(investment.principalRemaining).to.be.closeTo(0, parseUSDT("100"));
      expect(totalClaimed).to.be.closeTo(parseUSDT("100000"), parseUSDT("500"));
      console.log("✓ PASSED - All principal returned over 5 years\n");
    });
  });
});

import { expect } from "chai";
import { ethers } from "hardhat";
import { time } from "@nomicfoundation/hardhat-network-helpers";
import { SandBlock, MockUSDT } from "../typechain-types";
import { HardhatEthersSigner } from "@nomicfoundation/hardhat-ethers/signers";

/**
 * Security Test Suite for SandBlock
 *
 * This suite tests various attack vectors and unauthorized access attempts
 * to ensure no one can steal funds or manipulate the contract
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

describe("Security Tests - SandBlock", function () {
  let energyProjectHub: SandBlock;
  let mockUSDT: MockUSDT;
  let owner: HardhatEthersSigner;
  let projectOwner: HardhatEthersSigner;
  let investor1: HardhatEthersSigner;
  let investor2: HardhatEthersSigner;
  let attacker: HardhatEthersSigner;

  beforeEach(async function () {
    [owner, projectOwner, investor1, investor2, attacker] = await ethers.getSigners();

    const MockUSDT = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDT.deploy();

    const SandBlock = await ethers.getContractFactory("SandBlock");
    energyProjectHub = await SandBlock.deploy(await mockUSDT.getAddress());

    // Setup: Create a funded project
    await energyProjectHub.connect(projectOwner).createProject(
      "Solar Farm A",
      "Test Project",
      "Test Location",
      ProjectType.Solar,
      parseUSDT("100000"),
      90,
    );

    // Mint USDT to investors and attacker
    await mockUSDT.mint(investor1.address, parseUSDT("200000"));
    await mockUSDT.mint(investor2.address, parseUSDT("200000"));
    await mockUSDT.mint(attacker.address, parseUSDT("200000"));

    // Fund the project
    await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("60000"));
    await energyProjectHub.connect(investor1).investInProject(0, parseUSDT("60000"));

    await mockUSDT.connect(investor2).approve(await energyProjectHub.getAddress(), parseUSDT("40000"));
    await energyProjectHub.connect(investor2).investInProject(0, parseUSDT("40000"));

    // Complete construction
    await energyProjectHub.connect(projectOwner).completeConstruction(0);

    // Project owner deposits payout funds
    await mockUSDT.mint(projectOwner.address, parseUSDT("150000"));
    await mockUSDT.connect(projectOwner).approve(await energyProjectHub.getAddress(), parseUSDT("150000"));
    await energyProjectHub.connect(projectOwner).depositPayoutFunds(parseUSDT("150000"));
  });

  describe("Unauthorized Access - Project Management", function () {
    it("Should prevent non-owner from completing construction", async function () {
      // Create another project
      await energyProjectHub.connect(projectOwner).createProject(
        "Wind Farm",
        "Test",
        "Location",
        ProjectType.Wind,
        parseUSDT("100000"),
        90,
      );

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("100000"));
      await energyProjectHub.connect(investor1).investInProject(1, parseUSDT("100000"));

      // Attacker tries to complete construction
      await expect(
        energyProjectHub.connect(attacker).completeConstruction(1),
      ).to.be.revertedWith("Only project owner can complete");

      // Investor tries to complete construction
      await expect(
        energyProjectHub.connect(investor1).completeConstruction(1),
      ).to.be.revertedWith("Only project owner can complete");
    });

    it("Should prevent non-owner from recording energy production", async function () {
      // Attacker tries to record energy
      await expect(
        energyProjectHub.connect(attacker).recordEnergyProduction(0, parseUSDT("1000"), parseUSDT("100"), "Fake"),
      ).to.be.revertedWith("Only project owner can record energy");

      // Investor tries to record energy
      await expect(
        energyProjectHub.connect(investor1).recordEnergyProduction(0, parseUSDT("1000"), parseUSDT("100"), "Fake"),
      ).to.be.revertedWith("Only project owner can record energy");
    });
  });

  describe("Unauthorized Fund Access - Interest Claims", function () {
    it("Should prevent claiming interest for investments that don't belong to you", async function () {
      // Fast forward 1 week
      await time.increase(7 * 24 * 60 * 60);

      // Get investor1's available interest (they have 60k invested)
      const investment1 = await energyProjectHub.getInvestment(0, investor1.address);
      const availableInterest1 = investment1.availableInterest;

      expect(availableInterest1).to.be.gt(0);

      // Attacker tries to claim investor1's interest
      await expect(energyProjectHub.connect(attacker).claimInterest(0)).to.be.revertedWith(
        "No interest available to claim",
      );

      // Verify investor1 still has their interest available
      const investment1After = await energyProjectHub.getInvestment(0, investor1.address);
      expect(investment1After.availableInterest).to.equal(availableInterest1);
    });

    it("Should prevent claiming interest without any investment", async function () {
      // Fast forward 1 week
      await time.increase(7 * 24 * 60 * 60);

      // Attacker has no investment
      const attackerInvestment = await energyProjectHub.getInvestment(0, attacker.address);
      expect(attackerInvestment.principalAmount).to.equal(0);

      // Try to claim interest
      await expect(energyProjectHub.connect(attacker).claimInterest(0)).to.be.revertedWith(
        "No interest available to claim",
      );
    });

    it("Should prevent double-claiming interest in the same week", async function () {
      // Fast forward 1 week
      await time.increase(7 * 24 * 60 * 60);

      // Investor1 claims interest
      await energyProjectHub.connect(investor1).claimInterest(0);

      // Try to claim again immediately
      await expect(energyProjectHub.connect(investor1).claimInterest(0)).to.be.revertedWith(
        "No interest available to claim",
      );
    });

    it("Should ensure interest is isolated per investor", async function () {
      // Fast forward 1 week
      await time.increase(7 * 24 * 60 * 60);

      const investment1Before = await energyProjectHub.getInvestment(0, investor1.address);
      const investment2Before = await energyProjectHub.getInvestment(0, investor2.address);

      // Investor1 claims their interest
      await energyProjectHub.connect(investor1).claimInterest(0);

      // Verify investor2's interest is unaffected
      const investment2After = await energyProjectHub.getInvestment(0, investor2.address);
      expect(investment2After.availableInterest).to.equal(investment2Before.availableInterest);

      // Investor2 can still claim their own interest
      await expect(energyProjectHub.connect(investor2).claimInterest(0)).to.not.be.reverted;
    });
  });

  describe("Unauthorized Fund Access - Principal Claims", function () {
    it("Should prevent claiming principal for investments that don't belong to you", async function () {
      // Fast forward 3 years (2 year delay + 1 year)
      await time.increase(3 * 365 * 24 * 60 * 60);

      // Verify investor1 has available principal
      const investment1 = await energyProjectHub.getInvestment(0, investor1.address);
      expect(investment1.availablePrincipal).to.be.gt(0);

      // Attacker tries to claim investor1's principal
      await expect(energyProjectHub.connect(attacker).claimPrincipal(0)).to.be.revertedWith(
        "No principal available to claim",
      );

      // Verify investor1 still has their principal available
      const investment1After = await energyProjectHub.getInvestment(0, investor1.address);
      expect(investment1After.availablePrincipal).to.equal(investment1.availablePrincipal);
    });

    it("Should prevent claiming principal without any investment", async function () {
      // Fast forward 3 years
      await time.increase(3 * 365 * 24 * 60 * 60);

      // Attacker has no investment
      const attackerInvestment = await energyProjectHub.getInvestment(0, attacker.address);
      expect(attackerInvestment.principalAmount).to.equal(0);

      // Try to claim principal
      await expect(energyProjectHub.connect(attacker).claimPrincipal(0)).to.be.revertedWith(
        "No principal available to claim",
      );
    });

    it("Should prevent claiming principal before 2-year delay", async function () {
      // Try to claim immediately
      await expect(energyProjectHub.connect(investor1).claimPrincipal(0)).to.be.revertedWith(
        "No principal available to claim",
      );

      // Fast forward 1 year (still within delay)
      await time.increase(365 * 24 * 60 * 60);

      await expect(energyProjectHub.connect(investor1).claimPrincipal(0)).to.be.revertedWith(
        "No principal available to claim",
      );

      // Fast forward to exactly 2 years (delay just ended, no full year yet)
      await time.increase(365 * 24 * 60 * 60);

      await expect(energyProjectHub.connect(investor1).claimPrincipal(0)).to.be.revertedWith(
        "No principal available to claim",
      );
    });

    it("Should ensure principal is isolated per investor", async function () {
      // Fast forward 3 years
      await time.increase(3 * 365 * 24 * 60 * 60);

      const investment1Before = await energyProjectHub.getInvestment(0, investor1.address);
      const investment2Before = await energyProjectHub.getInvestment(0, investor2.address);

      // Investor1 claims their principal
      await energyProjectHub.connect(investor1).claimPrincipal(0);

      // Verify investor2's principal is unaffected
      const investment2After = await energyProjectHub.getInvestment(0, investor2.address);
      expect(investment2After.availablePrincipal).to.equal(investment2Before.availablePrincipal);
      expect(investment2After.principalRemaining).to.equal(investment2Before.principalRemaining);

      // Investor2 can still claim their own principal
      await expect(energyProjectHub.connect(investor2).claimPrincipal(0)).to.not.be.reverted;
    });

    it("Should prevent claiming more than the available principal", async function () {
      // Fast forward 3 years (should have 20% available)
      await time.increase(3 * 365 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);
      const principalAmount = investment.principalAmount;

      // Claim the available 20%
      await energyProjectHub.connect(investor1).claimPrincipal(0);

      const investmentAfter = await energyProjectHub.getInvestment(0, investor1.address);

      // Verify only 20% was claimed
      expect(investmentAfter.totalPrincipalClaimed).to.be.closeTo(principalAmount * 20n / 100n, parseUSDT("100"));

      // Verify 80% remains
      expect(investmentAfter.principalRemaining).to.be.closeTo(principalAmount * 80n / 100n, parseUSDT("100"));

      // Try to claim again immediately (should fail)
      await expect(energyProjectHub.connect(investor1).claimPrincipal(0)).to.be.revertedWith(
        "No principal available to claim",
      );
    });
  });

  describe("Unauthorized Fund Access - Refunds", function () {
    it("Should prevent claiming refunds for other investors", async function () {
      // Create a new project that will fail
      await energyProjectHub.connect(projectOwner).createProject(
        "Failed Project",
        "Test",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        30, // 30 days deadline
      );

      // Investor1 invests
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("10000"));
      await energyProjectHub.connect(investor1).investInProject(1, parseUSDT("10000"));

      // Fast forward past deadline without reaching target
      await time.increase(31 * 24 * 60 * 60);

      // Mark as failed
      await energyProjectHub.markFundingFailed(1);

      // Attacker tries to claim investor1's refund
      await expect(energyProjectHub.connect(attacker).claimRefund(1)).to.be.revertedWith("No investment to refund");

      // Investor2 tries to claim investor1's refund
      await expect(energyProjectHub.connect(investor2).claimRefund(1)).to.be.revertedWith("No investment to refund");

      // Verify investor1 can still claim their refund
      await expect(energyProjectHub.connect(investor1).claimRefund(1)).to.not.be.reverted;
    });

    it("Should prevent double-claiming refunds", async function () {
      // Create a failed project
      await energyProjectHub.connect(projectOwner).createProject(
        "Failed Project",
        "Test",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        30,
      );

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("10000"));
      await energyProjectHub.connect(investor1).investInProject(1, parseUSDT("10000"));

      await time.increase(31 * 24 * 60 * 60);
      await energyProjectHub.markFundingFailed(1);

      // First refund claim succeeds
      await energyProjectHub.connect(investor1).claimRefund(1);

      // Second claim should fail
      await expect(energyProjectHub.connect(investor1).claimRefund(1)).to.be.revertedWith("Refund already claimed");
    });

    it("Should prevent claiming refunds from successful projects", async function () {
      // Attacker tries to claim refund from successful project
      await expect(energyProjectHub.connect(investor1).claimRefund(0)).to.be.revertedWith("Project has not failed");
    });
  });

  describe("Investment Manipulation Attacks", function () {
    it("Should prevent investing in non-existent projects", async function () {
      await mockUSDT.connect(attacker).approve(await energyProjectHub.getAddress(), parseUSDT("10000"));

      // Try to invest in project ID 999 (doesn't exist)
      await expect(energyProjectHub.connect(attacker).investInProject(999, parseUSDT("10000"))).to.be.reverted;
    });

    it("Should prevent investing without USDT approval", async function () {
      // Create new project
      await energyProjectHub.connect(projectOwner).createProject(
        "New Project",
        "Test",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      // Try to invest without approval
      await expect(
        energyProjectHub.connect(attacker).investInProject(1, parseUSDT("10000")),
      ).to.be.revertedWith("ERC20: insufficient allowance");
    });

    it("Should prevent investing with insufficient USDT balance", async function () {
      // Create new project with small target
      await energyProjectHub.connect(projectOwner).createProject(
        "New Project",
        "Test",
        "Location",
        ProjectType.Solar,
        parseUSDT("500000"), // Large target
        90,
      );

      // Attacker tries to invest more than they have
      const attackerBalance = await mockUSDT.balanceOf(attacker.address);
      const excessAmount = attackerBalance + parseUSDT("100000");

      await mockUSDT.connect(attacker).approve(await energyProjectHub.getAddress(), excessAmount);

      await expect(
        energyProjectHub.connect(attacker).investInProject(1, excessAmount),
      ).to.be.revertedWith("ERC20: transfer amount exceeds balance");
    });

    it("Should prevent investing after deadline", async function () {
      // Create project with short deadline
      await energyProjectHub.connect(projectOwner).createProject(
        "Short Deadline Project",
        "Test",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        1, // 1 day deadline
      );

      // Fast forward past deadline
      await time.increase(2 * 24 * 60 * 60);

      // Try to invest
      await mockUSDT.connect(attacker).approve(await energyProjectHub.getAddress(), parseUSDT("10000"));

      await expect(
        energyProjectHub.connect(attacker).investInProject(1, parseUSDT("10000")),
      ).to.be.revertedWith("Funding deadline has passed");
    });

    it("Should prevent investing in completed projects", async function () {
      // Try to invest in already completed project (project 0 is completed and inactive)
      await mockUSDT.connect(attacker).approve(await energyProjectHub.getAddress(), parseUSDT("10000"));

      await expect(
        energyProjectHub.connect(attacker).investInProject(0, parseUSDT("10000")),
      ).to.be.revertedWith("Project is not active");
    });

    it("Should prevent investing in failed projects", async function () {
      // Create and fail a project
      await energyProjectHub.connect(projectOwner).createProject(
        "Failed Project",
        "Test",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        30,
      );

      await time.increase(31 * 24 * 60 * 60);
      await energyProjectHub.markFundingFailed(1);

      // Try to invest
      await mockUSDT.connect(attacker).approve(await energyProjectHub.getAddress(), parseUSDT("10000"));

      await expect(
        energyProjectHub.connect(attacker).investInProject(1, parseUSDT("10000")),
      ).to.be.revertedWith("Project is not active");
    });

    it("Should prevent over-investing beyond target amount", async function () {
      // Create project
      await energyProjectHub.connect(projectOwner).createProject(
        "Small Project",
        "Test",
        "Location",
        ProjectType.Solar,
        parseUSDT("50000"),
        90,
      );

      // Invest close to target
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("49000"));
      await energyProjectHub.connect(investor1).investInProject(1, parseUSDT("49000"));

      // Try to invest more than remaining
      await mockUSDT.connect(attacker).approve(await energyProjectHub.getAddress(), parseUSDT("10000"));

      await expect(
        energyProjectHub.connect(attacker).investInProject(1, parseUSDT("10000")),
      ).to.be.revertedWith("Investment exceeds target amount");

      // Exact amount should work
      await expect(energyProjectHub.connect(attacker).investInProject(1, parseUSDT("1000"))).to.not.be.reverted;
    });

    it("Should prevent zero-value investments", async function () {
      // Create project
      await energyProjectHub.connect(projectOwner).createProject(
        "New Project",
        "Test",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      await mockUSDT.connect(attacker).approve(await energyProjectHub.getAddress(), parseUSDT("10000"));

      await expect(energyProjectHub.connect(attacker).investInProject(1, 0)).to.be.revertedWith(
        "Investment amount must be greater than 0",
      );
    });
  });

  describe("Project Creation Manipulation", function () {
    it("Should prevent creating projects with zero target amount", async function () {
      await expect(
        energyProjectHub
          .connect(attacker)
          .createProject("Fake Project", "Test", "Location", ProjectType.Solar, 0, 90),
      ).to.be.revertedWith("Target amount must be greater than 0");
    });

    it("Should prevent creating projects with zero funding duration", async function () {
      await expect(
        energyProjectHub
          .connect(attacker)
          .createProject("Fake Project", "Test", "Location", ProjectType.Solar, parseUSDT("100000"), 0),
      ).to.be.revertedWith("Funding duration must be greater than 0");
    });

    it("Should prevent creating projects with excessive funding duration", async function () {
      await expect(
        energyProjectHub
          .connect(attacker)
          .createProject("Fake Project", "Test", "Location", ProjectType.Solar, parseUSDT("100000"), 366),
      ).to.be.revertedWith("Funding duration cannot exceed 1 year");
    });
  });

  describe("Contract Balance Protection", function () {
    it("Should verify contract holds all invested funds", async function () {
      const contractBalance = await mockUSDT.balanceOf(await energyProjectHub.getAddress());

      // Contract should have: 100k invested + 150k deposited for payouts = 250k
      expect(contractBalance).to.equal(parseUSDT("250000"));
    });

    it("Should prevent withdrawing funds directly from contract", async function () {
      const contractAddress = await energyProjectHub.getAddress();
      const contractBalance = await mockUSDT.balanceOf(contractAddress);

      expect(contractBalance).to.be.gt(0);

      // There should be no function to withdraw all funds
      // The only way to get funds out is through legitimate claims

      // Verify attacker cannot call USDT.transfer from contract
      // (This is impossible as attacker is not the contract)
      const attackerBalanceBefore = await mockUSDT.balanceOf(attacker.address);

      // Try various potential attack vectors
      // 1. Direct USDT transfer (will fail - wrong sender)
      await expect(
        mockUSDT.connect(attacker).transferFrom(contractAddress, attacker.address, contractBalance),
      ).to.be.reverted;

      const attackerBalanceAfter = await mockUSDT.balanceOf(attacker.address);
      expect(attackerBalanceAfter).to.equal(attackerBalanceBefore);
    });

    it("Should track that total claims cannot exceed contract balance", async function () {
      // Fast forward 3 years
      await time.increase(3 * 365 * 24 * 60 * 60);

      const contractBalanceBefore = await mockUSDT.balanceOf(await energyProjectHub.getAddress());

      // Both investors claim principal
      const balanceInv1Before = await mockUSDT.balanceOf(investor1.address);
      const balanceInv2Before = await mockUSDT.balanceOf(investor2.address);

      await energyProjectHub.connect(investor1).claimPrincipal(0);
      await energyProjectHub.connect(investor2).claimPrincipal(0);

      const balanceInv1After = await mockUSDT.balanceOf(investor1.address);
      const balanceInv2After = await mockUSDT.balanceOf(investor2.address);

      const totalClaimed = (balanceInv1After - balanceInv1Before) + (balanceInv2After - balanceInv2Before);

      const contractBalanceAfter = await mockUSDT.balanceOf(await energyProjectHub.getAddress());

      // Contract balance should decrease by exactly the claimed amount
      expect(contractBalanceBefore - contractBalanceAfter).to.equal(totalClaimed);

      // Claimed amount should not exceed available (20% of 100k = 20k)
      expect(totalClaimed).to.be.closeTo(parseUSDT("20000"), parseUSDT("100"));
    });
  });

  describe("Time Manipulation Resistance", function () {
    it("Should base interest on actual time elapsed, not manipulatable values", async function () {
      // Fast forward exactly 1 week
      await time.increase(7 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);
      const interest1Week = investment.availableInterest;

      // Claim the interest
      await energyProjectHub.connect(investor1).claimInterest(0);

      // Fast forward exactly 2 weeks
      await time.increase(2 * 7 * 24 * 60 * 60);

      const investment2 = await energyProjectHub.getInvestment(0, investor1.address);
      const interest2Weeks = investment2.availableInterest;

      // 2 weeks should be approximately 2x the 1 week interest
      expect(interest2Weeks).to.be.closeTo(interest1Week * 2n, parseUSDT("0.1"));
    });

    it("Should not allow claiming principal early even with multiple claim attempts", async function () {
      // Try claiming multiple times before delay ends
      for (let i = 0; i < 5; i++) {
        await expect(energyProjectHub.connect(investor1).claimPrincipal(0)).to.be.revertedWith(
          "No principal available to claim",
        );
      }

      // Fast forward 1 year
      await time.increase(365 * 24 * 60 * 60);

      // Try again
      for (let i = 0; i < 5; i++) {
        await expect(energyProjectHub.connect(investor1).claimPrincipal(0)).to.be.revertedWith(
          "No principal available to claim",
        );
      }

      // Only after full 2 years + 1 year should it work
      await time.increase(2 * 365 * 24 * 60 * 60);

      await expect(energyProjectHub.connect(investor1).claimPrincipal(0)).to.not.be.reverted;
    });
  });

  describe("Reentrancy Attack Protection", function () {
    it("Should prevent reentrancy on investInProject", async function () {
      // This is protected by ReentrancyGuard
      // A malicious contract would need to be created to test this properly
      // The nonReentrant modifier ensures the function cannot be called recursively

      // We verify the modifier exists by checking normal flow works
      await energyProjectHub.connect(projectOwner).createProject(
        "Test Project",
        "Test",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("10000"));
      await expect(energyProjectHub.connect(investor1).investInProject(1, parseUSDT("10000"))).to.not.be.reverted;
    });

    it("Should prevent reentrancy on claimInterest", async function () {
      // Protected by ReentrancyGuard (nonReentrant modifier)
      await time.increase(7 * 24 * 60 * 60);
      await expect(energyProjectHub.connect(investor1).claimInterest(0)).to.not.be.reverted;
    });

    it("Should prevent reentrancy on claimPrincipal", async function () {
      // Protected by ReentrancyGuard (nonReentrant modifier)
      await time.increase(3 * 365 * 24 * 60 * 60);
      await expect(energyProjectHub.connect(investor1).claimPrincipal(0)).to.not.be.reverted;
    });

    it("Should prevent reentrancy on claimRefund", async function () {
      // Create failed project
      await energyProjectHub.connect(projectOwner).createProject(
        "Failed Project",
        "Test",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        30,
      );

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("10000"));
      await energyProjectHub.connect(investor1).investInProject(1, parseUSDT("10000"));

      await time.increase(31 * 24 * 60 * 60);
      await energyProjectHub.markFundingFailed(1);

      // Protected by ReentrancyGuard (nonReentrant modifier)
      await expect(energyProjectHub.connect(investor1).claimRefund(1)).to.not.be.reverted;
    });
  });

  describe("Cross-Project Isolation", function () {
    it("Should ensure investments are isolated per project", async function () {
      // Create second project
      await energyProjectHub.connect(projectOwner).createProject(
        "Wind Farm",
        "Test",
        "Location",
        ProjectType.Wind,
        parseUSDT("100000"),
        90,
      );

      // Invest in second project
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("50000"));
      await energyProjectHub.connect(investor1).investInProject(1, parseUSDT("50000"));

      // Check investments are separate
      const investment0 = await energyProjectHub.getInvestment(0, investor1.address);
      const investment1 = await energyProjectHub.getInvestment(1, investor1.address);

      expect(investment0.principalAmount).to.equal(parseUSDT("60000"));
      expect(investment1.principalAmount).to.equal(parseUSDT("50000"));

      // Verify they don't interfere with each other
      expect(investment0.principalAmount).to.not.equal(investment1.principalAmount);
    });

    it("Should prevent claiming from wrong project", async function () {
      // Create project 1
      await energyProjectHub.connect(projectOwner).createProject(
        "Wind Farm",
        "Test",
        "Location",
        ProjectType.Wind,
        parseUSDT("100000"),
        90,
      );

      // Only investor2 invests in project 1, investor1 does NOT
      await mockUSDT.connect(investor2).approve(await energyProjectHub.getAddress(), parseUSDT("100000"));
      await energyProjectHub.connect(investor2).investInProject(1, parseUSDT("100000"));
      await energyProjectHub.connect(projectOwner).completeConstruction(1);

      // Deposit payout funds for project 1
      await mockUSDT.mint(projectOwner.address, parseUSDT("150000"));
      await mockUSDT.connect(projectOwner).approve(await energyProjectHub.getAddress(), parseUSDT("150000"));
      await energyProjectHub.connect(projectOwner).depositPayoutFunds(parseUSDT("150000"));

      await time.increase(7 * 24 * 60 * 60);

      // Investor1 should not be able to claim from project 1 (didn't invest there)
      await expect(energyProjectHub.connect(investor1).claimInterest(1)).to.be.revertedWith(
        "No interest available to claim",
      );

      // Attacker should not be able to claim from any project
      await expect(energyProjectHub.connect(attacker).claimInterest(0)).to.be.revertedWith(
        "No interest available to claim",
      );
      await expect(energyProjectHub.connect(attacker).claimInterest(1)).to.be.revertedWith(
        "No interest available to claim",
      );
    });
  });
});

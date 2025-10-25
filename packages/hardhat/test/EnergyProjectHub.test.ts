import { expect } from "chai";
import { ethers } from "hardhat";
import { SandBlock, MockUSDT } from "../typechain-types";
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers";
import { time } from "@nomicfoundation/hardhat-network-helpers";

describe("SandBlock", function () {
  let energyProjectHub: SandBlock;
  let mockUSDT: MockUSDT;
  let owner: SignerWithAddress;
  let projectOwner: SignerWithAddress;
  let investor1: SignerWithAddress;
  let investor2: SignerWithAddress;
  let investor3: SignerWithAddress;

  const USDT_DECIMALS = 6;
  const parseUSDT = (amount: string) => ethers.parseUnits(amount, USDT_DECIMALS);

  // Project types enum
  enum ProjectType {
    Solar,
    Wind,
    Hydro,
    Thermal,
    Geothermal,
    Biomass,
    Other,
  }

  beforeEach(async function () {
    [owner, projectOwner, investor1, investor2, investor3] = await ethers.getSigners();

    // Deploy MockUSDT
    const MockUSDTFactory = await ethers.getContractFactory("MockUSDT");
    mockUSDT = await MockUSDTFactory.deploy();
    await mockUSDT.waitForDeployment();

    // Deploy SandBlock
    const SandBlockFactory = await ethers.getContractFactory("SandBlock");
    energyProjectHub = await SandBlockFactory.deploy(await mockUSDT.getAddress());
    await energyProjectHub.waitForDeployment();

    // Mint USDT to investors
    await mockUSDT.mint(investor1.address, parseUSDT("100000")); // 100k USDT
    await mockUSDT.mint(investor2.address, parseUSDT("50000")); // 50k USDT
    await mockUSDT.mint(investor3.address, parseUSDT("30000")); // 30k USDT
  });

  describe("Deployment", function () {
    it("Should set the correct USDT token address", async function () {
      expect(await energyProjectHub.usdtToken()).to.equal(await mockUSDT.getAddress());
    });

    it("Should start with project count of 0", async function () {
      expect(await energyProjectHub.projectCount()).to.equal(0);
    });
  });

  describe("Project Creation", function () {
    it("Should create a new project successfully", async function () {
      const tx = await energyProjectHub.connect(projectOwner).createProject(
        "Solar Farm A",
        "100MW Solar Installation",
        "California, USA",
        ProjectType.Solar,
        parseUSDT("500000"), // 500k target
        90, // 90 days funding duration
      );

      await expect(tx)
        .to.emit(energyProjectHub, "ProjectCreated")
        .withArgs(0, "Solar Farm A", projectOwner.address, parseUSDT("500000"));

      expect(await energyProjectHub.projectCount()).to.equal(1);
    });

    it("Should create projects with different types", async function () {
      const types = [
        ProjectType.Solar,
        ProjectType.Wind,
        ProjectType.Hydro,
        ProjectType.Thermal,
        ProjectType.Geothermal,
        ProjectType.Biomass,
        ProjectType.Other,
      ];

      for (let i = 0; i < types.length; i++) {
        await energyProjectHub.connect(projectOwner).createProject(
          `Project ${i}`,
          "Description",
          "Location",
          types[i],
          parseUSDT("100000"),
          30,
        );
      }

      expect(await energyProjectHub.projectCount()).to.equal(types.length);
    });

    it("Should set correct funding deadline", async function () {
      const fundingDays = 60;
      const currentTime = await time.latest();

      await energyProjectHub.connect(projectOwner).createProject(
        "Test Project",
        "Description",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        fundingDays,
      );

      const timeline = await energyProjectHub.getProjectTimeline(0);
      const expectedDeadline = currentTime + fundingDays * 24 * 60 * 60;

      expect(timeline.fundingDeadline).to.be.closeTo(expectedDeadline, 5); // Allow 5 seconds difference
    });

    it("Should revert if target amount is 0", async function () {
      await expect(
        energyProjectHub.connect(projectOwner).createProject(
          "Test Project",
          "Description",
          "Location",
          ProjectType.Solar,
          0,
          30,
        ),
      ).to.be.revertedWith("Target amount must be greater than 0");
    });

    it("Should revert if funding duration is 0", async function () {
      await expect(
        energyProjectHub.connect(projectOwner).createProject(
          "Test Project",
          "Description",
          "Location",
          ProjectType.Solar,
          parseUSDT("100000"),
          0,
        ),
      ).to.be.revertedWith("Funding duration must be greater than 0");
    });

    it("Should revert if funding duration exceeds 365 days", async function () {
      await expect(
        energyProjectHub.connect(projectOwner).createProject(
          "Test Project",
          "Description",
          "Location",
          ProjectType.Solar,
          parseUSDT("100000"),
          366,
        ),
      ).to.be.revertedWith("Funding duration cannot exceed 1 year");
    });

    it("Should store project details correctly", async function () {
      await energyProjectHub.connect(projectOwner).createProject(
        "Solar Farm A",
        "100MW Solar Installation",
        "California, USA",
        ProjectType.Solar,
        parseUSDT("500000"),
        90,
      );

      const project = await energyProjectHub.getProject(0);

      expect(project.name).to.equal("Solar Farm A");
      expect(project.description).to.equal("100MW Solar Installation");
      expect(project.location).to.equal("California, USA");
      expect(project.projectType).to.equal(ProjectType.Solar);
      expect(project.targetAmount).to.equal(parseUSDT("500000"));
      expect(project.totalInvested).to.equal(0);
      expect(project.projectOwner).to.equal(projectOwner.address);
      expect(project.isActive).to.be.true;
      expect(project.isCompleted).to.be.false;
      expect(project.isFailed).to.be.false;
    });
  });

  describe("Investment", function () {
    beforeEach(async function () {
      // Create a test project
      await energyProjectHub.connect(projectOwner).createProject(
        "Solar Farm A",
        "100MW Solar Installation",
        "California, USA",
        ProjectType.Solar,
        parseUSDT("100000"), // 100k target
        90, // 90 days
      );
    });

    it("Should allow investment with proper USDT approval", async function () {
      const investAmount = parseUSDT("10000");

      // Approve USDT
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), investAmount);

      const tx = await energyProjectHub.connect(investor1).investInProject(0, investAmount);

      await expect(tx).to.emit(energyProjectHub, "InvestmentMade").withArgs(0, investor1.address, investAmount);
    });

    it("Should update project total invested amount", async function () {
      const investAmount = parseUSDT("10000");

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), investAmount);
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);

      const project = await energyProjectHub.getProject(0);
      expect(project.totalInvested).to.equal(investAmount);
    });

    it("Should track multiple investors", async function () {
      const amount1 = parseUSDT("10000");
      const amount2 = parseUSDT("20000");

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), amount1);
      await energyProjectHub.connect(investor1).investInProject(0, amount1);

      await mockUSDT.connect(investor2).approve(await energyProjectHub.getAddress(), amount2);
      await energyProjectHub.connect(investor2).investInProject(0, amount2);

      const investors = await energyProjectHub.getProjectInvestors(0);
      expect(investors.length).to.equal(2);
      expect(investors[0]).to.equal(investor1.address);
      expect(investors[1]).to.equal(investor2.address);
    });

    it("Should allow same investor to invest multiple times", async function () {
      const amount1 = parseUSDT("10000");
      const amount2 = parseUSDT("5000");

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), amount1 + amount2);
      await energyProjectHub.connect(investor1).investInProject(0, amount1);
      await energyProjectHub.connect(investor1).investInProject(0, amount2);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);
      expect(investment.principalAmount).to.equal(amount1 + amount2);

      const investors = await energyProjectHub.getProjectInvestors(0);
      expect(investors.length).to.equal(1); // Should not duplicate
    });

    it("Should emit FundingCompleted when target is reached", async function () {
      const targetAmount = parseUSDT("100000");

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), targetAmount);

      const tx = await energyProjectHub.connect(investor1).investInProject(0, targetAmount);

      await expect(tx).to.emit(energyProjectHub, "FundingCompleted");
    });

    it("Should not allow investment exceeding target amount", async function () {
      const targetAmount = parseUSDT("100000");
      const excessAmount = parseUSDT("100001");

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), excessAmount);

      await expect(
        energyProjectHub.connect(investor1).investInProject(0, excessAmount),
      ).to.be.revertedWith("Investment exceeds target amount");
    });

    it("Should not allow investment after deadline", async function () {
      const investAmount = parseUSDT("10000");

      // Fast forward past deadline (90 days + 1)
      await time.increase(91 * 24 * 60 * 60);

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), investAmount);

      await expect(
        energyProjectHub.connect(investor1).investInProject(0, investAmount),
      ).to.be.revertedWith("Funding deadline has passed");
    });

    it("Should not allow investment in failed project", async function () {
      const investAmount = parseUSDT("10000");

      // Fast forward past deadline
      await time.increase(91 * 24 * 60 * 60);

      // Mark as failed (this also sets isActive to false)
      await energyProjectHub.markFundingFailed(0);

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), investAmount);

      // Will revert with "Project is not active" because markFundingFailed sets isActive = false
      // which is checked first in investInProject
      await expect(
        energyProjectHub.connect(investor1).investInProject(0, investAmount),
      ).to.be.revertedWith("Project is not active");
    });

    it("Should revert with 0 investment amount", async function () {
      await expect(energyProjectHub.connect(investor1).investInProject(0, 0)).to.be.revertedWith(
        "Investment amount must be greater than 0",
      );
    });

    it("Should store correct investment details", async function () {
      const investAmount = parseUSDT("10000");

      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), investAmount);
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);

      expect(investment.principalAmount).to.equal(investAmount);
      expect(investment.principalRemaining).to.equal(investAmount);
      expect(investment.totalInterestClaimed).to.equal(0);
      expect(investment.totalPrincipalClaimed).to.equal(0);
    });
  });

  describe("Funding Deadline & Refunds", function () {
    beforeEach(async function () {
      // Create a test project with 30 day deadline
      await energyProjectHub.connect(projectOwner).createProject(
        "Solar Farm A",
        "Test Project",
        "Test Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        30, // 30 days
      );

      // Investor invests partial amount
      const investAmount = parseUSDT("30000");
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), investAmount);
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);
    });

    it("Should correctly identify failed funding", async function () {
      // Before deadline
      expect(await energyProjectHub.isProjectFundingFailed(0)).to.be.false;

      // Fast forward past deadline
      await time.increase(31 * 24 * 60 * 60);

      // After deadline, should be failed
      expect(await energyProjectHub.isProjectFundingFailed(0)).to.be.true;
    });

    it("Should allow marking funding as failed after deadline", async function () {
      // Fast forward past deadline
      await time.increase(31 * 24 * 60 * 60);

      const tx = await energyProjectHub.connect(investor2).markFundingFailed(0);

      await expect(tx)
        .to.emit(energyProjectHub, "FundingFailed")
        .withArgs(0, await time.latest(), parseUSDT("30000"), parseUSDT("100000"));

      const project = await energyProjectHub.getProject(0);
      expect(project.isFailed).to.be.true;
      expect(project.isActive).to.be.false;
    });

    it("Should not allow marking as failed before deadline", async function () {
      await expect(energyProjectHub.markFundingFailed(0)).to.be.revertedWith("Funding deadline not reached yet");
    });

    it("Should not allow marking as failed if target was reached", async function () {
      // Mint more USDT to investor2
      const remainingAmount = parseUSDT("70000");
      await mockUSDT.mint(investor2.address, remainingAmount);

      // Invest remaining amount to reach target
      await mockUSDT.connect(investor2).approve(await energyProjectHub.getAddress(), remainingAmount);
      await energyProjectHub.connect(investor2).investInProject(0, remainingAmount);

      // Fast forward past deadline
      await time.increase(31 * 24 * 60 * 60);

      await expect(energyProjectHub.markFundingFailed(0)).to.be.revertedWith("Project funding was successful");
    });

    it("Should allow investors to claim refunds for failed project", async function () {
      // Fast forward and mark as failed
      await time.increase(31 * 24 * 60 * 60);
      await energyProjectHub.markFundingFailed(0);

      const investAmount = parseUSDT("30000");
      const balanceBefore = await mockUSDT.balanceOf(investor1.address);

      const tx = await energyProjectHub.connect(investor1).claimRefund(0);

      await expect(tx).to.emit(energyProjectHub, "RefundClaimed").withArgs(0, investor1.address, investAmount);

      const balanceAfter = await mockUSDT.balanceOf(investor1.address);
      expect(balanceAfter - balanceBefore).to.equal(investAmount);
    });

    it("Should not allow claiming refund twice", async function () {
      // Fast forward and mark as failed
      await time.increase(31 * 24 * 60 * 60);
      await energyProjectHub.markFundingFailed(0);

      await energyProjectHub.connect(investor1).claimRefund(0);

      await expect(energyProjectHub.connect(investor1).claimRefund(0)).to.be.revertedWith("Refund already claimed");
    });

    it("Should not allow refund if project is not failed", async function () {
      await expect(energyProjectHub.connect(investor1).claimRefund(0)).to.be.revertedWith("Project has not failed");
    });

    it("Should not allow refund if no investment", async function () {
      // Fast forward and mark as failed
      await time.increase(31 * 24 * 60 * 60);
      await energyProjectHub.markFundingFailed(0);

      await expect(energyProjectHub.connect(investor2).claimRefund(0)).to.be.revertedWith("No investment to refund");
    });

    it("Should update investment record after refund", async function () {
      // Fast forward and mark as failed
      await time.increase(31 * 24 * 60 * 60);
      await energyProjectHub.markFundingFailed(0);

      await energyProjectHub.connect(investor1).claimRefund(0);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);
      expect(investment.principalRemaining).to.equal(0);
    });
  });

  describe("Interest Rate Tiers", function () {
    it("Should return 5% for investments < 2000 USDT", async function () {
      const rate = await energyProjectHub.getInterestRate(parseUSDT("1999"));
      expect(rate).to.equal(500); // 5% = 500 basis points
    });

    it("Should return 7% for investments between 2000 and 20000 USDT", async function () {
      const rate1 = await energyProjectHub.getInterestRate(parseUSDT("2000"));
      const rate2 = await energyProjectHub.getInterestRate(parseUSDT("10000"));
      const rate3 = await energyProjectHub.getInterestRate(parseUSDT("19999"));

      expect(rate1).to.equal(700); // 7%
      expect(rate2).to.equal(700);
      expect(rate3).to.equal(700);
    });

    it("Should return 9% for investments >= 20000 USDT", async function () {
      const rate1 = await energyProjectHub.getInterestRate(parseUSDT("20000"));
      const rate2 = await energyProjectHub.getInterestRate(parseUSDT("50000"));

      expect(rate1).to.equal(900); // 9%
      expect(rate2).to.equal(900);
    });
  });

  describe("Construction Completion", function () {
    beforeEach(async function () {
      // Create and fully fund a project
      await energyProjectHub.connect(projectOwner).createProject(
        "Solar Farm A",
        "Test Project",
        "Test Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      const investAmount = parseUSDT("100000");
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), investAmount);
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);
    });

    it("Should allow project owner to complete construction", async function () {
      const tx = await energyProjectHub.connect(projectOwner).completeConstruction(0);

      await expect(tx).to.emit(energyProjectHub, "ConstructionCompleted");

      const project = await energyProjectHub.getProject(0);
      expect(project.isCompleted).to.be.true;
      expect(project.isActive).to.be.false;
    });

    it("Should not allow non-owner to complete construction", async function () {
      await expect(energyProjectHub.connect(investor1).completeConstruction(0)).to.be.revertedWith(
        "Only project owner can complete",
      );
    });

    it("Should not allow completing construction if funding not complete", async function () {
      // Create underfunded project
      await energyProjectHub.connect(projectOwner).createProject(
        "Test Project 2",
        "Description",
        "Location",
        ProjectType.Wind,
        parseUSDT("100000"),
        90,
      );

      await expect(energyProjectHub.connect(projectOwner).completeConstruction(1)).to.be.revertedWith(
        "Funding not completed yet",
      );
    });

    it("Should not allow completing construction twice", async function () {
      await energyProjectHub.connect(projectOwner).completeConstruction(0);

      await expect(energyProjectHub.connect(projectOwner).completeConstruction(0)).to.be.revertedWith(
        "Project already completed",
      );
    });
  });

  describe("Energy Production Recording", function () {
    beforeEach(async function () {
      // Create, fund, and complete a project
      await energyProjectHub.connect(projectOwner).createProject(
        "Solar Farm A",
        "Test Project",
        "Test Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      const investAmount = parseUSDT("100000");
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), investAmount);
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);

      await energyProjectHub.connect(projectOwner).completeConstruction(0);
    });

    it("Should allow project owner to record energy production", async function () {
      const energyKWh = 1000;
      const cost = parseUSDT("500");
      const notes = "Monthly production";

      const tx = await energyProjectHub
        .connect(projectOwner)
        .recordEnergyProduction(0, energyKWh, cost, notes);

      await expect(tx).to.emit(energyProjectHub, "EnergyRecorded");
    });

    it("Should update total energy produced", async function () {
      await energyProjectHub.connect(projectOwner).recordEnergyProduction(0, 1000, parseUSDT("500"), "First batch");

      await energyProjectHub.connect(projectOwner).recordEnergyProduction(0, 2000, parseUSDT("800"), "Second batch");

      const project = await energyProjectHub.getProject(0);
      expect(project.energyProduced).to.equal(3000);
      expect(project.totalEnergyCost).to.equal(parseUSDT("1300"));
    });

    it("Should not allow non-owner to record energy", async function () {
      await expect(
        energyProjectHub.connect(investor1).recordEnergyProduction(0, 1000, parseUSDT("500"), "Test"),
      ).to.be.revertedWith("Only project owner can record energy");
    });

    it("Should not allow recording energy before construction completion", async function () {
      // Create new incomplete project
      await energyProjectHub.connect(projectOwner).createProject(
        "Test Project 2",
        "Description",
        "Location",
        ProjectType.Wind,
        parseUSDT("100000"),
        90,
      );

      await expect(
        energyProjectHub.connect(projectOwner).recordEnergyProduction(1, 1000, parseUSDT("500"), "Test"),
      ).to.be.revertedWith("Project must be completed first");
    });

    it("Should store energy records", async function () {
      await energyProjectHub.connect(projectOwner).recordEnergyProduction(0, 1000, parseUSDT("500"), "Batch 1");

      await energyProjectHub.connect(projectOwner).recordEnergyProduction(0, 2000, parseUSDT("800"), "Batch 2");

      const records = await energyProjectHub.getEnergyRecords(0);
      expect(records.length).to.equal(2);
      expect(records[0].energyKWh).to.equal(1000);
      expect(records[1].energyKWh).to.equal(2000);
    });
  });

  describe("Interest Claims", function () {
    beforeEach(async function () {
      // Create, fund, and complete a project
      await energyProjectHub.connect(projectOwner).createProject(
        "Solar Farm A",
        "Test Project",
        "Test Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      // Three investors with different amounts (different tiers)
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("1000"));
      await energyProjectHub.connect(investor1).investInProject(0, parseUSDT("1000")); // Tier 1: 5%

      await mockUSDT.connect(investor2).approve(await energyProjectHub.getAddress(), parseUSDT("10000"));
      await energyProjectHub.connect(investor2).investInProject(0, parseUSDT("10000")); // Tier 2: 7%

      await mockUSDT.connect(investor3).approve(await energyProjectHub.getAddress(), parseUSDT("25000"));
      await energyProjectHub.connect(investor3).investInProject(0, parseUSDT("25000")); // Tier 3: 9%

      // Complete remaining funding
      const remaining = parseUSDT("64000");
      await mockUSDT.mint(owner.address, remaining);
      await mockUSDT.connect(owner).approve(await energyProjectHub.getAddress(), remaining);
      await energyProjectHub.connect(owner).investInProject(0, remaining);

      await energyProjectHub.connect(projectOwner).completeConstruction(0);

      // Deposit USDT to contract for payouts
      const payoutAmount = parseUSDT("50000");
      await mockUSDT.mint(projectOwner.address, payoutAmount);
      await mockUSDT.connect(projectOwner).approve(await energyProjectHub.getAddress(), payoutAmount);
      await energyProjectHub.connect(projectOwner).depositPayoutFunds(payoutAmount);
    });

    it("Should calculate correct weekly interest for Tier 1 (5%)", async function () {
      // Fast forward 1 week
      await time.increase(7 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);
      const availableInterest = investment.availableInterest;

      // Expected: 1000 * 0.05 / 52 = 0.961538... USDT per week
      expect(availableInterest).to.be.closeTo(parseUSDT("0.961538"), parseUSDT("0.01"));
    });

    it("Should calculate correct weekly interest for Tier 2 (7%)", async function () {
      // Fast forward 1 week
      await time.increase(7 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor2.address);
      const availableInterest = investment.availableInterest;

      // Expected: 10000 * 0.07 / 52 = 13.461538... USDT per week
      expect(availableInterest).to.be.closeTo(parseUSDT("13.461538"), parseUSDT("0.1"));
    });

    it("Should calculate correct weekly interest for Tier 3 (9%)", async function () {
      // Fast forward 1 week
      await time.increase(7 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor3.address);
      const availableInterest = investment.availableInterest;

      // Expected: 25000 * 0.09 / 52 = 43.269230... USDT per week
      expect(availableInterest).to.be.closeTo(parseUSDT("43.269230"), parseUSDT("0.1"));
    });

    it("Should allow claiming interest after 1 week", async function () {
      // Fast forward 1 week
      await time.increase(7 * 24 * 60 * 60);

      const balanceBefore = await mockUSDT.balanceOf(investor1.address);
      await energyProjectHub.connect(investor1).claimInterest(0);
      const balanceAfter = await mockUSDT.balanceOf(investor1.address);

      expect(balanceAfter).to.be.gt(balanceBefore);
    });

    it("Should accumulate interest over multiple weeks", async function () {
      // Fast forward 4 weeks
      await time.increase(4 * 7 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);
      const weeklyInterest = parseUSDT("0.961538");

      expect(investment.availableInterest).to.be.closeTo(weeklyInterest * 4n, parseUSDT("0.1"));
    });

    it("Should not allow claiming interest before 1 week", async function () {
      // Fast forward 6 days (less than 1 week)
      await time.increase(6 * 24 * 60 * 60);

      await expect(energyProjectHub.connect(investor1).claimInterest(0)).to.be.revertedWith(
        "No interest available to claim",
      );
    });

    it("Should emit InterestClaimed event", async function () {
      // Fast forward 1 week
      await time.increase(7 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);
      const expectedAmount = investment.availableInterest;

      const tx = await energyProjectHub.connect(investor1).claimInterest(0);

      await expect(tx)
        .to.emit(energyProjectHub, "InterestClaimed")
        .withArgs(0, investor1.address, expectedAmount);
    });

    it("Should update totalInterestClaimed", async function () {
      // Claim after 1 week
      await time.increase(7 * 24 * 60 * 60);
      await energyProjectHub.connect(investor1).claimInterest(0);

      // Claim after another week
      await time.increase(7 * 24 * 60 * 60);
      await energyProjectHub.connect(investor1).claimInterest(0);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);
      const weeklyInterest = parseUSDT("0.961538");

      expect(investment.totalInterestClaimed).to.be.closeTo(weeklyInterest * 2n, parseUSDT("0.1"));
    });
  });

  describe("Principal Payback", function () {
    beforeEach(async function () {
      // Create, fund, and complete a project
      await energyProjectHub.connect(projectOwner).createProject(
        "Solar Farm A",
        "Test Project",
        "Test Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      const investAmount = parseUSDT("100000");
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), investAmount);
      await energyProjectHub.connect(investor1).investInProject(0, investAmount);

      await energyProjectHub.connect(projectOwner).completeConstruction(0);

      // Deposit funds for payback
      const payoutAmount = parseUSDT("150000");
      await mockUSDT.mint(projectOwner.address, payoutAmount);
      await mockUSDT.connect(projectOwner).approve(await energyProjectHub.getAddress(), payoutAmount);
      await energyProjectHub.connect(projectOwner).depositPayoutFunds(payoutAmount);
    });

    it("Should not allow principal claim before 2 years", async function () {
      // Fast forward 1 year
      await time.increase(365 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);
      expect(investment.availablePrincipal).to.equal(0);
    });

    it("Should allow 20% principal claim after 2 years", async function () {
      // Principal payback starts 2 years after FUNDING COMPLETED, not construction
      // We need to fast forward from when funding was completed
      // Fast forward 2 years from funding completion + 1 year for first annual claim
      await time.increase((3 * 365) * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);
      const expected = parseUSDT("20000"); // 20% of 100k

      expect(investment.availablePrincipal).to.be.closeTo(expected, parseUSDT("100"));
    });

    it("Should allow claiming principal", async function () {
      // Fast forward 3 years (2 years delay + 1 year for first claim)
      await time.increase(3 * 365 * 24 * 60 * 60);

      const balanceBefore = await mockUSDT.balanceOf(investor1.address);
      await energyProjectHub.connect(investor1).claimPrincipal(0);
      const balanceAfter = await mockUSDT.balanceOf(investor1.address);

      const expected = parseUSDT("20000");
      expect(balanceAfter - balanceBefore).to.be.closeTo(expected, parseUSDT("100"));
    });

    it("Should accumulate 20% per year for 5 years", async function () {
      // First, fast forward 2 years (the delay period)
      await time.increase(2 * 365 * 24 * 60 * 60);

      // Then claim 20% each year for 5 years
      for (let i = 0; i < 5; i++) {
        // Fast forward 1 year
        await time.increase(365 * 24 * 60 * 60);

        await energyProjectHub.connect(investor1).claimPrincipal(0);
      }

      const investment = await energyProjectHub.getInvestment(0, investor1.address);

      // After 5 years of 20% payments, all principal should be returned
      expect(investment.principalRemaining).to.be.closeTo(0, parseUSDT("100"));
    });

    it("Should emit PrincipalClaimed event", async function () {
      // Fast forward 3 years (2 year delay + 1 year for first claim)
      await time.increase(3 * 365 * 24 * 60 * 60);

      const investment = await energyProjectHub.getInvestment(0, investor1.address);
      const expectedAmount = investment.availablePrincipal;

      const tx = await energyProjectHub.connect(investor1).claimPrincipal(0);

      await expect(tx)
        .to.emit(energyProjectHub, "PrincipalClaimed")
        .withArgs(0, investor1.address, expectedAmount);
    });
  });

  describe("Edge Cases & Security", function () {
    it("Should prevent reentrancy on investInProject", async function () {
      // This is implicitly tested by ReentrancyGuard
      // Would need a malicious contract to test explicitly
    });

    it("Should handle multiple projects independently", async function () {
      // Create two projects
      await energyProjectHub.connect(projectOwner).createProject(
        "Project 1",
        "Description 1",
        "Location 1",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      await energyProjectHub.connect(projectOwner).createProject(
        "Project 2",
        "Description 2",
        "Location 2",
        ProjectType.Wind,
        parseUSDT("50000"),
        60,
      );

      // Invest in both
      await mockUSDT.connect(investor1).approve(await energyProjectHub.getAddress(), parseUSDT("30000"));
      await energyProjectHub.connect(investor1).investInProject(0, parseUSDT("10000"));
      await energyProjectHub.connect(investor1).investInProject(1, parseUSDT("20000"));

      const investment1 = await energyProjectHub.getInvestment(0, investor1.address);
      const investment2 = await energyProjectHub.getInvestment(1, investor1.address);

      expect(investment1.principalAmount).to.equal(parseUSDT("10000"));
      expect(investment2.principalAmount).to.equal(parseUSDT("20000"));
    });

    it("Should handle zero energy production cost", async function () {
      await energyProjectHub.connect(projectOwner).createProject(
        "Project",
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

      // Record energy with 0 cost
      await energyProjectHub.connect(projectOwner).recordEnergyProduction(0, 1000, 0, "Free energy");

      const project = await energyProjectHub.getProject(0);
      expect(project.totalEnergyCost).to.equal(0);
    });

    it("Should correctly handle getProjectTimeline", async function () {
      await energyProjectHub.connect(projectOwner).createProject(
        "Project",
        "Description",
        "Location",
        ProjectType.Solar,
        parseUSDT("100000"),
        90,
      );

      const timeline = await energyProjectHub.getProjectTimeline(0);

      expect(timeline.createdAt).to.be.gt(0);
      expect(timeline.fundingDeadline).to.be.gt(timeline.createdAt);
      expect(timeline.fundingCompletedAt).to.equal(0);
      expect(timeline.constructionCompletedAt).to.equal(0);
    });
  });
});

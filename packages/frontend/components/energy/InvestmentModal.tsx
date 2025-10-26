"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { parseUnits } from "viem";
import { useAccount, usePublicClient } from "wagmi";
import { OnRampModal } from "~~/components/OnRamp/OnRampModal";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useDeployedContractInfo } from "~~/hooks/scaffold-eth";

interface InvestmentModalProps {
  projectId: number | null;
  isOpen: boolean;
  onClose: () => void;
}

export const InvestmentModal = ({ projectId, isOpen, onClose }: InvestmentModalProps) => {
  const [investAmount, setInvestAmount] = useState("");
  const [mounted, setMounted] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [showOnRamp, setShowOnRamp] = useState(false);
  const [needsApproval, setNeedsApproval] = useState(false);
  const { address } = useAccount();
  const publicClient = usePublicClient();

  const { data: hubContractInfo } = useDeployedContractInfo("SandBlock");
  const hubAddress = hubContractInfo?.address;

  const { data: usdtContractInfo } = useDeployedContractInfo("MockUSDT");
  const usdtAddress = usdtContractInfo?.address;

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
      setErrorMessage(""); // Clear error when modal opens
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const { data: projectData } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "getProject",
    args: [projectId !== null ? BigInt(projectId) : undefined],
    enabled: projectId !== null,
  });

  const { data: usdtBalance } = useScaffoldContractRead({
    contractName: "MockUSDT",
    functionName: "balanceOf",
    args: [address],
    enabled: !!address,
  });

  const { data: allowance } = useScaffoldContractRead({
    contractName: "MockUSDT",
    functionName: "allowance",
    args: [address, hubAddress],
    enabled: !!address && !!hubAddress,
  });

  const { writeAsync: approveUSDT, isMining: isApproving } = useScaffoldContractWrite({
    contractName: "MockUSDT",
    functionName: "approve",
    args: [undefined, undefined],
  });

  const { writeAsync: invest, isMining: isInvesting } = useScaffoldContractWrite({
    contractName: "SandBlock",
    functionName: "investInProject",
    args: [undefined, undefined],
  });

  const { writeAsync: getFaucet, isMining: isGettingFaucet } = useScaffoldContractWrite({
    contractName: "MockUSDT",
    functionName: "faucet",
  });

  // Check if approval is needed when amount changes
  useEffect(() => {
    if (investAmount && hubAddress) {
      try {
        const amountInUSDT = parseUnits(investAmount, 6);
        const currentAllowance = allowance || 0n;
        setNeedsApproval(currentAllowance < amountInUSDT);
      } catch {
        setNeedsApproval(false);
      }
    } else {
      setNeedsApproval(false);
    }
  }, [investAmount, allowance, hubAddress]);

  const formatUSDT = (amount: bigint) => {
    return (Number(amount) / 1e6).toFixed(2);
  };

  const getInterestRate = (amount: number) => {
    if (amount < 2000) return 5;
    if (amount < 20000) return 7;
    return 9;
  };

  const handleInvest = async () => {
    if (!investAmount || !projectData || projectId === null || !hubAddress) return;

    setErrorMessage(""); // Clear any previous errors

    try {
      const amountInUSDT = parseUnits(investAmount, 6);

      // Check current allowance
      const currentAllowance = allowance || 0n;

      // Step 1: Approve USDT spending if needed
      if (currentAllowance < amountInUSDT) {
        console.log("Approving USDT spending...", {
          spender: hubAddress,
          amount: amountInUSDT.toString(),
          currentAllowance: currentAllowance.toString(),
        });

        await approveUSDT({
          args: [hubAddress, amountInUSDT],
        });

        console.log("Approval transaction confirmed, waiting for state update...");

        // Wait for the blockchain state to update
        // Poll the allowance using direct contract read until it's updated (max 10 seconds)
        let attempts = 0;
        const maxAttempts = 20; // 20 attempts * 500ms = 10 seconds max
        let updatedAllowance = currentAllowance;

        while (updatedAllowance < amountInUSDT && attempts < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, 500));

          // Read allowance directly from blockchain
          if (publicClient && usdtAddress && usdtContractInfo) {
            try {
              const newAllowance = (await publicClient.readContract({
                address: usdtAddress,
                abi: usdtContractInfo.abi,
                functionName: "allowance",
                args: [address as `0x${string}`, hubAddress as `0x${string}`],
              })) as bigint;

              updatedAllowance = newAllowance;
              console.log(`Checking allowance (attempt ${attempts + 1}/${maxAttempts}):`, updatedAllowance.toString());
            } catch (error) {
              console.error("Error reading allowance:", error);
            }
          }

          attempts++;
        }

        if (updatedAllowance < amountInUSDT) {
          throw new Error(
            "Approval transaction confirmed but allowance not updated. Please try investing again in a few seconds.",
          );
        }

        console.log("Approval confirmed! New allowance:", updatedAllowance.toString());
      }

      // Step 2: Invest in project
      console.log("Investing in project...", {
        projectId,
        amount: amountInUSDT.toString(),
      });

      await invest({
        args: [BigInt(projectId), amountInUSDT],
      });

      console.log("Investment successful!");
      setInvestAmount("");
      onClose();
    } catch (error: any) {
      console.error("Investment failed:", error);

      // Extract error message from the error object
      let errorMsg = "Investment failed. Please try again.";

      if (error?.message) {
        // Check for common revert reasons
        if (
          error.message.includes("insufficient allowance") ||
          error.message.includes("ERC20: insufficient allowance")
        ) {
          errorMsg = "Token approval failed or is insufficient. Please try again and approve the transaction.";
        } else if (error.message.includes("Investment exceeds target amount")) {
          errorMsg = "Investment amount exceeds the remaining target amount for this project.";
        } else if (error.message.includes("Project is not active")) {
          errorMsg = "This project is not currently accepting investments.";
        } else if (error.message.includes("Project construction is completed")) {
          errorMsg = "This project has already completed construction.";
        } else if (error.message.includes("Project funding has failed")) {
          errorMsg = "This project's funding has failed.";
        } else if (error.message.includes("Funding deadline has passed")) {
          errorMsg = "The funding deadline for this project has passed.";
        } else if (error.message.includes("Investment amount must be greater than zero")) {
          errorMsg = "Investment amount must be greater than zero.";
        } else if (error.message.includes("User rejected") || error.message.includes("User denied")) {
          errorMsg = "Transaction was cancelled.";
        } else if (error.message.includes("insufficient funds")) {
          errorMsg = "Insufficient USDT balance in your wallet.";
        } else {
          // Try to extract any revert reason from the error message
          const revertMatch = error.message.match(/reverted with the following reason:\s*(.+?)(?:\n|$)/);
          if (revertMatch && revertMatch[1]) {
            errorMsg = revertMatch[1].trim();
          }
        }
      }

      setErrorMessage(errorMsg);
    }
  };

  const handleGetFaucet = async () => {
    try {
      await getFaucet();
    } catch (error) {
      console.error("Faucet failed:", error);
    }
  };

  if (!isOpen || projectId === null || !projectData || !mounted) return null;

  const [name, , , , targetAmount, totalInvested, , , , isActive, isCompleted, isFailed] = projectData;
  const remainingAmount = targetAmount - totalInvested;
  const numInvestAmount = parseFloat(investAmount || "0");
  const interestRate = getInterestRate(numInvestAmount);

  // Check if project can accept investments
  const canInvest = isActive && !isCompleted && !isFailed && remainingAmount > 0n;

  // Determine why investment is disabled
  let disabledReason = "";
  if (!isActive) {
    disabledReason = "This project is not active.";
  } else if (isCompleted) {
    disabledReason = "This project has completed construction.";
  } else if (isFailed) {
    disabledReason = "This project's funding has failed.";
  } else if (remainingAmount <= 0n) {
    disabledReason = "This project has reached its funding goal.";
  }

  const modalContent = (
    <div className="fixed top-0 left-0 right-0 bottom-0 z-[99999] flex items-end sm:items-center justify-center p-0 sm:p-4">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl mx-auto bg-card border-t sm:border border-card-border rounded-t-2xl sm:rounded-lg shadow-lg max-h-[90vh] sm:max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between p-4 sm:p-6 pb-3 sm:pb-4 border-b border-border sticky top-0 bg-card z-10">
          <div className="min-w-0 flex-1 pr-2">
            <h2 className="text-lg sm:text-xl font-semibold text-foreground truncate">Invest in {name}</h2>
            <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1">Choose your investment amount</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 flex-shrink-0"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-6 space-y-3 sm:space-y-4">
          {/* Warning if project can't accept investments */}
          {!canInvest && disabledReason && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 sm:p-4">
              <div className="flex items-start gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-yellow-500 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                  />
                </svg>
                <div className="flex-1">
                  <p className="text-sm font-medium text-yellow-500">{disabledReason}</p>
                </div>
              </div>
            </div>
          )}

          {/* Project Funding Status */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-3 sm:p-4">
            <h4 className="text-xs sm:text-sm font-semibold text-foreground mb-3">Funding Progress</h4>
            <div className="grid grid-cols-3 gap-2 sm:gap-4">
              <div className="text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Goal</p>
                <p className="text-sm sm:text-lg font-bold text-foreground font-mono">${formatUSDT(targetAmount)}</p>
              </div>
              <div className="text-center border-l border-r border-border">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Raised</p>
                <p className="text-sm sm:text-lg font-bold text-primary font-mono">${formatUSDT(totalInvested)}</p>
              </div>
              <div className="text-center">
                <p className="text-[10px] sm:text-xs text-muted-foreground mb-1">Remaining</p>
                <p className="text-sm sm:text-lg font-bold text-orange-500 font-mono">${formatUSDT(remainingAmount)}</p>
              </div>
            </div>
            {/* Progress Bar */}
            <div className="mt-3 sm:mt-4">
              <div className="h-1.5 sm:h-2 w-full bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-primary to-primary/80 transition-all duration-300"
                  style={{ width: `${Math.min((Number(totalInvested) / Number(targetAmount)) * 100, 100)}%` }}
                />
              </div>
              <p className="text-[10px] sm:text-xs text-muted-foreground text-center mt-1.5">
                {((Number(totalInvested) / Number(targetAmount)) * 100).toFixed(6)}% funded
              </p>
            </div>
          </div>

          {/* USDT Balance */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
                  />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Your USDT Balance</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground font-mono">
                ${formatUSDT(usdtBalance || 0n)}
              </span>
            </div>
            {address && (
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-2 font-mono truncate">
                Wallet: {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={handleGetFaucet}
                disabled={isGettingFaucet}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3"
              >
                {isGettingFaucet ? "Getting..." : "💧 Faucet"}
              </button>
              <button
                onClick={() => setShowOnRamp(true)}
                className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-8 px-3"
              >
                💳 Buy USDT
              </button>
            </div>
          </div>

          {/* Investment Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground">Investment Amount (USDT)</label>
              <button
                onClick={() => setInvestAmount(formatUSDT(remainingAmount))}
                className="text-xs text-primary hover:underline font-medium"
                type="button"
              >
                Max: ${formatUSDT(remainingAmount)}
              </button>
            </div>
            <input
              type="number"
              placeholder="Enter amount"
              className="flex h-10 sm:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={investAmount}
              onChange={e => setInvestAmount(e.target.value)}
              min="0"
              step="0.01"
              max={formatUSDT(remainingAmount)}
            />

            {/* Amount Validation Warning */}
            {investAmount && numInvestAmount > Number(formatUSDT(remainingAmount)) && (
              <div className="mt-3 p-3 sm:p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-orange-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-orange-500">Amount Exceeds Remaining Target</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Your investment amount (${numInvestAmount.toFixed(2)}) exceeds the remaining funding needed ($
                      {formatUSDT(remainingAmount)}). Maximum allowed: ${formatUSDT(remainingAmount)}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Approval Info */}
            {needsApproval && investAmount && numInvestAmount > 0 && numInvestAmount <= Number(formatUSDT(remainingAmount)) && (
              <div className="mt-3 p-3 sm:p-4 bg-blue-500/10 border border-blue-500/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-blue-500 flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-blue-500">Token Approval Required</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      You&apos;ll need to approve the SandBlock contract to spend your USDT tokens. This is a
                      one-time transaction that will be followed by the investment transaction.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* Error Message */}
            {errorMessage && (
              <div className="mt-3 p-3 sm:p-4 bg-destructive/10 border border-destructive/20 rounded-lg">
                <div className="flex items-start gap-2">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  <div className="flex-1">
                    <p className="text-sm font-medium text-destructive">{errorMessage}</p>
                  </div>
                  <button
                    onClick={() => setErrorMessage("")}
                    className="text-destructive hover:text-destructive/80 flex-shrink-0"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Interest Rate Info */}
          {numInvestAmount > 0 && (
            <div className="bg-muted rounded-lg p-3 sm:p-4 space-y-2 sm:space-y-3">
              <h4 className="text-sm sm:text-base font-semibold text-foreground">Your Investment Details:</h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3 text-xs sm:text-sm">
                <div className="flex justify-between sm:block">
                  <span className="text-muted-foreground">Interest Rate (APY):</span>
                  <span className="sm:ml-2 font-bold text-primary">{interestRate}%</span>
                </div>
                <div className="flex justify-between sm:block">
                  <span className="text-muted-foreground">Weekly Interest:</span>
                  <span className="sm:ml-2 font-bold text-foreground">
                    ${((numInvestAmount * interestRate) / 100 / 52).toFixed(6)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-2 sm:pt-3 text-xs text-muted-foreground space-y-1.5 sm:space-y-2">
                <p className="font-medium text-foreground text-xs sm:text-sm">Interest Tiers:</p>
                <ul className="space-y-0.5 sm:space-y-1 ml-2">
                  <li>
                    &lt; $2,000: <span className="font-semibold">5% APY</span>
                  </li>
                  <li>
                    $2,000 - $20,000: <span className="font-semibold">7% APY</span>
                  </li>
                  <li>
                    &gt; $20,000: <span className="font-semibold">9% APY</span>
                  </li>
                </ul>
                <p className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-border text-xs">
                  <span className="font-medium text-foreground">Payback:</span> 20% of principal per year starting 2
                  years after funding completion
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center gap-2 sm:gap-3 p-4 sm:p-6 pt-0 sticky bottom-0 bg-card">
          <button
            onClick={onClose}
            className="inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-9 sm:h-10 px-3 sm:px-4 py-2 flex-1"
          >
            Cancel
          </button>
          <button
            onClick={handleInvest}
            disabled={
              !canInvest ||
              !investAmount ||
              isInvesting ||
              isApproving ||
              numInvestAmount <= 0 ||
              numInvestAmount > Number(formatUSDT(remainingAmount))
            }
            className="inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 sm:h-10 px-3 sm:px-4 py-2 flex-1"
          >
            {!canInvest
              ? "Cannot Invest"
              : numInvestAmount > Number(formatUSDT(remainingAmount))
              ? "Amount Too High"
              : isApproving
              ? "Approving USDT..."
              : isInvesting
              ? "Investing..."
              : needsApproval
              ? "Approve & Invest"
              : "Invest"}
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {createPortal(modalContent, document.body)}
      <OnRampModal
        isOpen={showOnRamp}
        onClose={() => setShowOnRamp(false)}
        targetAmount={investAmount ? parseUnits(investAmount, 6) : undefined}
      />
    </>
  );
};

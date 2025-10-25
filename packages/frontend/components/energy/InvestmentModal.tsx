"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { parseUnits } from "viem";
import { useAccount } from "wagmi";
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
  const { address } = useAccount();

  const { data: hubContractInfo } = useDeployedContractInfo("EnergyProjectHub");
  const hubAddress = hubContractInfo?.address;

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const { data: projectData } = useScaffoldContractRead({
    contractName: "EnergyProjectHub",
    functionName: "getProject",
    args: projectId !== null ? [BigInt(projectId)] : undefined,
  });

  const { data: usdtBalance } = useScaffoldContractRead({
    contractName: "MockUSDT",
    functionName: "balanceOf",
    args: address ? [address] : undefined,
  });

  const { data: allowance } = useScaffoldContractRead({
    contractName: "MockUSDT",
    functionName: "allowance",
    args: address && hubAddress ? [address, hubAddress] : undefined,
  });

  const { writeAsync: approveUSDT, isMining: isApproving } = useScaffoldContractWrite({
    contractName: "MockUSDT",
    functionName: "approve",
    args: [hubAddress || "0x0000000000000000000000000000000000000000", 0n],
  });

  const { writeAsync: invest, isMining: isInvesting } = useScaffoldContractWrite({
    contractName: "EnergyProjectHub",
    functionName: "investInProject",
    args: [0n, 0n],
  });

  const { writeAsync: getFaucet, isMining: isGettingFaucet } = useScaffoldContractWrite({
    contractName: "MockUSDT",
    functionName: "faucet",
  });

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

    try {
      const amountInUSDT = parseUnits(investAmount, 6);

      // First approve USDT spending if needed
      const currentAllowance = allowance || 0n;
      if (currentAllowance < amountInUSDT) {
        await approveUSDT({
          args: [hubAddress, amountInUSDT],
        });
      }

      // Then invest
      await invest({
        args: [BigInt(projectId), amountInUSDT],
      });

      setInvestAmount("");
      onClose();
    } catch (error) {
      console.error("Investment failed:", error);
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

  const [name, , , , targetAmount, totalInvested] = projectData;
  const remainingAmount = targetAmount - totalInvested;
  const numInvestAmount = parseFloat(investAmount || "0");
  const interestRate = getInterestRate(numInvestAmount);

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
                {((Number(totalInvested) / Number(targetAmount)) * 100).toFixed(1)}% funded
              </p>
            </div>
          </div>

          {/* USDT Balance */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 sm:p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 sm:h-5 sm:w-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                </svg>
                <span className="text-xs sm:text-sm font-medium text-muted-foreground">Your USDT Balance</span>
              </div>
              <span className="text-lg sm:text-xl font-bold text-foreground font-mono">${formatUSDT(usdtBalance || 0n)}</span>
            </div>
            {address && (
              <div className="text-[10px] sm:text-xs text-muted-foreground mb-2 font-mono truncate">
                Wallet: {address.slice(0, 6)}...{address.slice(-4)}
              </div>
            )}
            <button
              onClick={handleGetFaucet}
              disabled={isGettingFaucet}
              className="inline-flex items-center justify-center rounded-md text-xs font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-8 px-3 w-full"
            >
              {isGettingFaucet ? "Getting..." : "Get 10,000 USDT from Faucet (Testing)"}
            </button>
          </div>

          {/* Investment Amount Input */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs sm:text-sm font-medium text-foreground">Investment Amount (USDT)</label>
              <span className="text-xs text-muted-foreground">Max: ${formatUSDT(remainingAmount)}</span>
            </div>
            <input
              type="number"
              placeholder="Enter amount"
              className="flex h-10 sm:h-11 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={investAmount}
              onChange={(e) => setInvestAmount(e.target.value)}
              min="0"
              step="0.01"
            />
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
                    ${((numInvestAmount * interestRate) / 100 / 52).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="border-t border-border pt-2 sm:pt-3 text-xs text-muted-foreground space-y-1.5 sm:space-y-2">
                <p className="font-medium text-foreground text-xs sm:text-sm">Interest Tiers:</p>
                <ul className="space-y-0.5 sm:space-y-1 ml-2">
                  <li>&lt; $2,000: <span className="font-semibold">5% APY</span></li>
                  <li>$2,000 - $20,000: <span className="font-semibold">7% APY</span></li>
                  <li>&gt; $20,000: <span className="font-semibold">9% APY</span></li>
                </ul>
                <p className="mt-1.5 sm:mt-2 pt-1.5 sm:pt-2 border-t border-border text-xs">
                  <span className="font-medium text-foreground">Payback:</span> 20% of principal per year starting 2 years after funding completion
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
            disabled={!investAmount || isInvesting || isApproving || numInvestAmount <= 0}
            className="inline-flex items-center justify-center rounded-md text-xs sm:text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 sm:h-10 px-3 sm:px-4 py-2 flex-1"
          >
            {isApproving ? "Approving..." : isInvesting ? "Investing..." : "Invest"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

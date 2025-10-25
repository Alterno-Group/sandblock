"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAccount } from "wagmi";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface ProjectFinanceModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectId: number;
  projectName: string;
  totalFunding: bigint; // Total USDT raised from investors
  mode: "off-ramp" | "on-ramp"; // Which direction
}

/**
 * Project Finance Modal
 *
 * OFF-RAMP MODE (Construction Phase):
 * - Project owner converts raised USDT → Fiat
 * - Used to pay contractors, suppliers, equipment
 * - Withdraws to business bank account
 *
 * ON-RAMP MODE (Revenue Phase):
 * - Project owner converts energy sales revenue (fiat) → USDT
 * - Deposits back to contract to pay investors
 * - Completes the investment cycle
 */
export const ProjectFinanceModal = ({
  isOpen,
  onClose,
  projectId,
  projectName,
  totalFunding,
  mode,
}: ProjectFinanceModalProps) => {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);
  const [amount, setAmount] = useState("");

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const formatUSDT = (amount: bigint) => {
    return (Number(amount) / 1e6).toFixed(2);
  };

  // Off-Ramp: Convert USDT → Fiat for construction
  const handleOffRamp = () => {
    if (!address || !amount) return;

    // Integration options for off-ramp (crypto → fiat):
    // 1. Circle USDC/USDT → Bank Account
    // 2. Coinbase Commerce → Business Account
    // 3. Stripe Crypto Offramp
    // 4. Binance P2P / OTC

    const params = new URLSearchParams({
      mode: "sell", // Selling crypto
      amount: amount,
      crypto: "USDT",
      fiat: "USD",
      projectId: projectId.toString(),
      projectName: projectName,
      walletAddress: address,
      // For business withdrawals
      purpose: "project_construction",
      category: "business_expense",
    });

    // Example: Using Circle for business off-ramp
    // Circle provides direct crypto → bank account
    window.open(`https://app.circle.com/withdraw?${params.toString()}`, "CircleOfframp", "width=600,height=700");
  };

  // On-Ramp: Convert Fiat → USDT for investor payments
  const handleOnRamp = () => {
    if (!address || !amount) return;

    // Integration options for on-ramp (fiat → crypto):
    // 1. Circle: Bank Account → USDC/USDT
    // 2. Coinbase Commerce: Receive payments
    // 3. Binance Pay: Business deposits

    const params = new URLSearchParams({
      mode: "deposit", // Depositing to crypto
      amount: amount,
      crypto: "USDT",
      fiat: "USD",
      projectId: projectId.toString(),
      projectName: projectName,
      destinationAddress: address, // Contract or project wallet
      purpose: "energy_revenue",
      category: "business_income",
    });

    // Example: Using Circle for business on-ramp
    window.open(`https://app.circle.com/deposit?${params.toString()}`, "CircleOnramp", "width=600,height=700");
  };

  if (!isOpen || !mounted) return null;

  const isOffRamp = mode === "off-ramp";

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="relative w-full max-w-lg bg-card rounded-lg shadow-lg border border-card-border m-4"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="text-2xl font-bold text-foreground">
              {isOffRamp ? "💸 Withdraw Funds" : "💰 Deposit Revenue"}
            </h2>
            <p className="text-sm text-muted-foreground mt-1">{projectName}</p>
          </div>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent transition-colors" aria-label="Close">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Explanation */}
          <div className={`${isOffRamp ? "bg-orange-500/10" : "bg-green-500/10"} rounded-lg p-4`}>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              {isOffRamp ? "🏗️ Construction Funding" : "⚡ Energy Revenue"}
            </h3>
            <p className="text-sm text-muted-foreground">
              {isOffRamp ? (
                <>
                  Convert raised USDT to fiat currency (USD) to pay for project construction costs like contractors,
                  equipment, and materials. Funds will be withdrawn to your business bank account.
                </>
              ) : (
                <>
                  Convert energy sales revenue (fiat currency) back to USDT to pay investor returns. Deposit the USDT to
                  the project contract for interest and principal payments.
                </>
              )}
            </p>
          </div>

          {/* Available Amount */}
          <div className="bg-muted rounded-lg p-4">
            <div className="text-sm text-muted-foreground mb-1">
              {isOffRamp ? "Available to Withdraw" : "Revenue to Deposit"}
            </div>
            <div className="text-3xl font-bold text-foreground">${formatUSDT(totalFunding)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              {isOffRamp ? "USDT in contract" : "USD from energy sales"}
            </div>
          </div>

          {/* Amount Input */}
          <div>
            <label className="block text-sm font-medium text-foreground mb-2">
              {isOffRamp ? "Amount to Withdraw (USD)" : "Amount to Deposit (USD)"}
            </label>
            <input
              type="number"
              placeholder="0.00"
              className="flex h-12 w-full rounded-md border border-input bg-background px-4 py-2 text-lg ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={amount}
              onChange={e => setAmount(e.target.value)}
              min="0"
              step="0.01"
              max={formatUSDT(totalFunding)}
            />
            <div className="flex justify-between mt-2">
              <button
                onClick={() => setAmount((Number(formatUSDT(totalFunding)) * 0.5).toFixed(2))}
                className="text-xs text-primary hover:underline"
              >
                50%
              </button>
              <button
                onClick={() => setAmount(formatUSDT(totalFunding))}
                className="text-xs text-primary hover:underline"
              >
                Max
              </button>
            </div>
          </div>

          {/* Payment Provider Options */}
          <div className="space-y-3">
            <p className="text-sm font-medium text-foreground">Select Payment Provider:</p>

            {/* Circle */}
            <button
              onClick={isOffRamp ? handleOffRamp : handleOnRamp}
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">⭕</div>
                <div className="text-left">
                  <div className="font-semibold">Circle</div>
                  <div className="text-xs text-muted-foreground">
                    {isOffRamp ? "Crypto → Bank Account" : "Bank Account → Crypto"}
                  </div>
                  <div className="text-xs text-muted-foreground">Best for business • Fast • Low fees</div>
                </div>
              </div>
              <div className="text-primary">→</div>
            </button>

            {/* Coinbase */}
            <button
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">🔵</div>
                <div className="text-left">
                  <div className="font-semibold">Coinbase Commerce</div>
                  <div className="text-xs text-muted-foreground">Business payments platform</div>
                </div>
              </div>
              <div className="text-primary">→</div>
            </button>

            {/* Binance Pay */}
            <button
              disabled={!amount || parseFloat(amount) <= 0}
              className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center text-2xl">🟡</div>
                <div className="text-left">
                  <div className="font-semibold">Binance Pay</div>
                  <div className="text-xs text-muted-foreground">Global coverage • OTC available</div>
                </div>
              </div>
              <div className="text-primary">→</div>
            </button>
          </div>

          {/* Info Box */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm">
            <p className="font-semibold mb-2">ℹ️ How it works:</p>
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              {isOffRamp ? (
                <>
                  <li>Select amount to withdraw from project funds</li>
                  <li>Complete business verification (KYC/AML)</li>
                  <li>USDT is converted to USD</li>
                  <li>Funds arrive in your business bank account (1-3 days)</li>
                  <li>Use funds to pay construction costs</li>
                </>
              ) : (
                <>
                  <li>Collect energy sales revenue in bank account</li>
                  <li>Select amount to convert to USDT</li>
                  <li>USD is converted to USDT</li>
                  <li>USDT is sent to project contract</li>
                  <li>Investors can claim their returns</li>
                </>
              )}
            </ol>
          </div>

          {/* Warning */}
          <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4 text-sm">
            <p className="font-semibold mb-1">⚠️ Important:</p>
            <p className="text-muted-foreground">
              {isOffRamp
                ? "Only withdraw what you need for verified project expenses. Keep sufficient USDT for emergencies and investor protection."
                : "Ensure you deposit sufficient USDT to cover all investor returns including interest and principal payments."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Cancel
          </button>
          <button
            onClick={isOffRamp ? handleOffRamp : handleOnRamp}
            disabled={!amount || parseFloat(amount) <= 0}
            className={`flex-1 inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
              isOffRamp ? "bg-orange-500 text-white hover:bg-orange-600" : "bg-green-500 text-white hover:bg-green-600"
            }`}
          >
            {isOffRamp ? "💸 Withdraw to Bank" : "💰 Deposit to Contract"}
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

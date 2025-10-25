"use client";

import { useState } from "react";
import { formatDistanceToNow } from "date-fns";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

interface FinancialTransparencyProps {
  projectId: number;
  projectName: string;
}

/**
 * Financial Transparency Component
 * Shows all off-ramp and on-ramp transactions for investor transparency
 *
 * Investors can see:
 * - Every USDT withdrawal for construction (off-ramp)
 * - What it was used for
 * - Exchange rates
 * - Bank account destinations
 * - Every USDT deposit from energy revenue (on-ramp)
 * - Energy invoice references
 * - Complete audit trail
 */
export const FinancialTransparency = ({ projectId, projectName }: FinancialTransparencyProps) => {
  const [activeTab, setActiveTab] = useState<"summary" | "offramp" | "onramp">("summary");

  // Get financial summary
  const { data: summary } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "getFinancialSummary",
    args: [BigInt(projectId)],
  });

  // Get all off-ramp transactions
  const { data: offRampTxs } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "getOffRampTransactions",
    args: [BigInt(projectId)],
  });

  // Get all on-ramp transactions
  const { data: onRampTxs } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "getOnRampTransactions",
    args: [BigInt(projectId)],
  });

  const formatUSDT = (amount: bigint) => {
    return (Number(amount) / 1e6).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatFiat = (amountCents: bigint) => {
    return (Number(amountCents) / 100).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const formatExchangeRate = (rate: bigint) => {
    return (Number(rate) / 100).toFixed(4);
  };

  const formatDate = (timestamp: bigint) => {
    return formatDistanceToNow(new Date(Number(timestamp) * 1000), { addSuffix: true });
  };

  if (!summary) {
    return (
      <div className="bg-card rounded-lg border border-card-border p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const [totalInvested, totalOffRamped, totalOnRamped, offRampCount, onRampCount, netBalance] = summary;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20 p-6">
        <h2 className="text-2xl font-bold mb-2">💎 Financial Transparency</h2>
        <p className="text-sm text-muted-foreground">
          Complete audit trail of all fund movements for <span className="font-semibold">{projectName}</span>
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-border">
        <button
          onClick={() => setActiveTab("summary")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "summary"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          📊 Summary
        </button>
        <button
          onClick={() => setActiveTab("offramp")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "offramp"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          💸 Withdrawals ({Number(offRampCount)})
        </button>
        <button
          onClick={() => setActiveTab("onramp")}
          className={`px-4 py-2 font-medium border-b-2 transition-colors ${
            activeTab === "onramp"
              ? "border-primary text-primary"
              : "border-transparent text-muted-foreground hover:text-foreground"
          }`}
        >
          💰 Revenue ({Number(onRampCount)})
        </button>
      </div>

      {/* Summary Tab */}
      {activeTab === "summary" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {/* Total Invested */}
            <div className="bg-green-500/10 border border-green-500/20 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Invested</div>
              <div className="text-2xl font-bold text-green-600">${formatUSDT(totalInvested)}</div>
              <div className="text-xs text-muted-foreground mt-1">
                From {Number(offRampCount) + Number(onRampCount)} investors
              </div>
            </div>

            {/* Total Withdrawn */}
            <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">Total Withdrawn</div>
              <div className="text-2xl font-bold text-orange-600">${formatUSDT(totalOffRamped)}</div>
              <div className="text-xs text-muted-foreground mt-1">{Number(offRampCount)} withdrawals</div>
            </div>

            {/* Total Revenue Deposited */}
            <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4">
              <div className="text-xs text-muted-foreground mb-1">Revenue Deposited</div>
              <div className="text-2xl font-bold text-blue-600">${formatUSDT(totalOnRamped)}</div>
              <div className="text-xs text-muted-foreground mt-1">{Number(onRampCount)} deposits</div>
            </div>
          </div>

          {/* Net Balance */}
          <div className="bg-muted rounded-lg p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Current Contract Balance</div>
                <div className="text-3xl font-bold">
                  ${formatUSDT(netBalance >= 0 ? BigInt(netBalance) : BigInt(-netBalance))}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Formula: Invested - Withdrawn + Revenue = Balance
                </div>
              </div>
              <div className="text-4xl">{netBalance >= 0 ? "✅" : "⚠️"}</div>
            </div>
          </div>

          {/* Explanation */}
          <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-4 text-sm">
            <p className="font-semibold mb-2">💡 How Transparency Works:</p>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground">
              <li>Every withdrawal for construction is recorded on-chain</li>
              <li>Purpose, amount, and exchange rate are public</li>
              <li>Energy revenue deposits are tracked with invoice numbers</li>
              <li>You can verify all transactions on the blockchain</li>
              <li>No hidden fees or unaccounted funds</li>
            </ul>
          </div>
        </div>
      )}

      {/* Off-Ramp Tab (Withdrawals) */}
      {activeTab === "offramp" && (
        <div className="space-y-4">
          {offRampTxs && offRampTxs.length > 0 ? (
            offRampTxs.map((tx, index) => (
              <div
                key={index}
                className="bg-card border border-card-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">💸</span>
                      <span className="font-semibold text-lg">Withdrawal #{index + 1}</span>
                      {tx.isCompleted ? (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-600 text-xs rounded-full">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(tx.timestamp)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-orange-600">${formatUSDT(tx.usdtAmount)}</div>
                    <div className="text-xs text-muted-foreground">USDT</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Fiat Received</div>
                    <div className="font-mono">${formatFiat(tx.fiatAmount)} USD</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Exchange Rate</div>
                    <div className="font-mono">{formatExchangeRate(tx.exchangeRate)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Provider</div>
                    <div className="font-semibold">{tx.provider}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Bank Account</div>
                    <div className="font-mono">****{tx.bankAccount}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-muted-foreground text-xs mb-1">Purpose</div>
                  <div className="font-medium">{tx.purpose}</div>
                </div>

                {tx.txHash && (
                  <div className="mt-2">
                    <div className="text-muted-foreground text-xs mb-1">Transaction Reference</div>
                    <div className="font-mono text-xs bg-muted p-2 rounded break-all">{tx.txHash}</div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground">No withdrawals yet</p>
            </div>
          )}
        </div>
      )}

      {/* On-Ramp Tab (Revenue) */}
      {activeTab === "onramp" && (
        <div className="space-y-4">
          {onRampTxs && onRampTxs.length > 0 ? (
            onRampTxs.map((tx, index) => (
              <div
                key={index}
                className="bg-card border border-card-border rounded-lg p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg">💰</span>
                      <span className="font-semibold text-lg">Revenue Deposit #{index + 1}</span>
                      {tx.isCompleted ? (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-600 text-xs rounded-full">
                          Completed
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 bg-yellow-500/20 text-yellow-600 text-xs rounded-full">
                          Pending
                        </span>
                      )}
                    </div>
                    <div className="text-xs text-muted-foreground">{formatDate(tx.timestamp)}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-2xl font-bold text-green-600">${formatUSDT(tx.usdtAmount)}</div>
                    <div className="text-xs text-muted-foreground">USDT</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-muted-foreground mb-1">Fiat Converted</div>
                    <div className="font-mono">${formatFiat(tx.fiatAmount)} USD</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Exchange Rate</div>
                    <div className="font-mono">{formatExchangeRate(tx.exchangeRate)}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Provider</div>
                    <div className="font-semibold">{tx.provider}</div>
                  </div>
                  <div>
                    <div className="text-muted-foreground mb-1">Invoice #</div>
                    <div className="font-mono">{tx.invoiceNumber}</div>
                  </div>
                </div>

                <div className="mt-4 pt-4 border-t border-border">
                  <div className="text-muted-foreground text-xs mb-1">Revenue Source</div>
                  <div className="font-medium">{tx.source}</div>
                </div>

                {tx.txHash && (
                  <div className="mt-2">
                    <div className="text-muted-foreground text-xs mb-1">Transaction Reference</div>
                    <div className="font-mono text-xs bg-muted p-2 rounded break-all">{tx.txHash}</div>
                  </div>
                )}
              </div>
            ))
          ) : (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-muted-foreground">No revenue deposits yet</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

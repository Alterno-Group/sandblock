"use client";

import { useState } from "react";
import { useAccount } from "wagmi";
import { Address } from "~~/components/scaffold-eth";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const InvestorDashboard = () => {
  const { address } = useAccount();
  const [selectedProject, setSelectedProject] = useState<number>(0);

  const { data: projectCount } = useScaffoldContractRead({
    contractName: "EnergyProjectHub",
    functionName: "projectCount",
  });

  const formatUSDT = (amount: bigint) => {
    return (Number(amount) / 1e6).toFixed(2);
  };

  const projectIds = projectCount ? Array.from({ length: Number(projectCount) }, (_, i) => i) : [];

  return (
    <>
      <h1 className="text-3xl font-bold mb-6 text-foreground">My Investments</h1>

      <div className="space-y-6">
        {projectIds.map((id) => (
          <InvestmentCard key={id} projectId={id} investorAddress={address} />
        ))}

        {projectIds.length === 0 && (
          <div className="text-center py-12 bg-card rounded-lg border border-card-border">
            <p className="text-lg text-muted-foreground">No investments yet</p>
          </div>
        )}
      </div>
    </>
  );
};

const InvestmentCard = ({
  projectId,
  investorAddress,
}: {
  projectId: number;
  investorAddress: string | undefined;
}) => {
  const { data: projectData } = useScaffoldContractRead({
    contractName: "EnergyProjectHub",
    functionName: "getProject",
    args: [BigInt(projectId)],
  });

  const { data: investmentData } = useScaffoldContractRead({
    contractName: "EnergyProjectHub",
    functionName: "getInvestment",
    args: [BigInt(projectId), investorAddress],
  });

  const { writeAsync: claimInterest, isMining: isClaimingInterest } = useScaffoldContractWrite({
    contractName: "EnergyProjectHub",
    functionName: "claimInterest",
    args: [BigInt(projectId)],
  });

  const { writeAsync: claimPrincipal, isMining: isClaimingPrincipal } = useScaffoldContractWrite({
    contractName: "EnergyProjectHub",
    functionName: "claimPrincipal",
    args: [BigInt(projectId)],
  });

  if (!projectData || !investmentData) return null;

  const [name, , , , , , , , , isCompleted] = projectData;
  const [
    principalAmount,
    principalRemaining,
    interestRate,
    availableInterest,
    availablePrincipal,
    totalInterestClaimed,
    totalPrincipalClaimed,
  ] = investmentData;

  // Skip if no investment in this project
  if (principalAmount === 0n) return null;

  const formatUSDT = (amount: bigint) => {
    return (Number(amount) / 1e6).toFixed(2);
  };

  const handleClaimInterest = async () => {
    try {
      await claimInterest();
    } catch (error) {
      console.error("Failed to claim interest:", error);
    }
  };

  const handleClaimPrincipal = async () => {
    try {
      await claimPrincipal();
    } catch (error) {
      console.error("Failed to claim principal:", error);
    }
  };

  return (
    <div className="bg-card border border-card-border rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <h2 className="text-2xl font-bold text-foreground">{name}</h2>
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${isCompleted ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {isCompleted ? "Producing" : "In Progress"}
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          {/* Principal Investment */}
          <div className="bg-muted rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Original Investment</div>
            <div className="text-2xl font-bold text-foreground">${formatUSDT(principalAmount)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Interest Rate: {Number(interestRate) / 100}% APY
            </div>
          </div>

          {/* Principal Remaining */}
          <div className="bg-muted rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Principal Remaining</div>
            <div className="text-2xl font-bold text-foreground">${formatUSDT(principalRemaining)}</div>
            <div className="text-xs text-muted-foreground mt-1">
              Returned: ${formatUSDT(totalPrincipalClaimed)}
            </div>
          </div>

          {/* Total Interest Earned */}
          <div className="bg-muted rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Interest Earned</div>
            <div className="text-2xl font-bold text-primary">
              ${formatUSDT(totalInterestClaimed)}
            </div>
            <div className="text-xs text-muted-foreground mt-1">Total claimed so far</div>
          </div>
        </div>

        {/* Claimable Amounts */}
        {isCompleted && (
          <div className="mt-6 space-y-3">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Available to Claim</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Claim Interest */}
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Weekly Interest</p>
                    <p className="text-2xl font-bold text-primary">
                      ${formatUSDT(availableInterest)}
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    onClick={handleClaimInterest}
                    disabled={availableInterest === 0n || isClaimingInterest}
                  >
                    {isClaimingInterest ? "Claiming..." : "Claim"}
                  </button>
                </div>
              </div>

              {/* Claim Principal */}
              <div className="bg-primary/10 border border-primary/20 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <p className="text-sm text-muted-foreground">Principal Payback</p>
                    <p className="text-2xl font-bold text-primary">
                      ${formatUSDT(availablePrincipal)}
                    </p>
                  </div>
                  <button
                    className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
                    onClick={handleClaimPrincipal}
                    disabled={availablePrincipal === 0n || isClaimingPrincipal}
                  >
                    {isClaimingPrincipal ? "Claiming..." : "Claim"}
                  </button>
                </div>
              </div>
            </div>

            {availableInterest === 0n && availablePrincipal === 0n && (
              <div className="bg-accent/50 border border-accent rounded-lg p-4">
                <span className="text-sm text-accent-foreground">
                  No funds available to claim yet. Interest is paid weekly, principal starts 2 years
                  after funding completion.
                </span>
              </div>
            )}
          </div>
        )}

        {!isCompleted && (
          <div className="bg-muted border border-border rounded-lg p-4 mt-4">
            <span className="text-sm text-foreground">Project construction is not completed yet. Returns will be available after completion.</span>
          </div>
        )}
      </div>
    </div>
  );
};

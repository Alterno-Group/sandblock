"use client";

import type { NextPage } from "next";
import { useState } from "react";
import { ProjectList } from "~~/components/energy/ProjectList";
import { FaucetButton, USDTFaucetButton } from "~~/components/scaffold-eth";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

// Tooltip component
const Tooltip = ({ children, text }: { children: React.ReactNode; text: string }) => {
  const [show, setShow] = useState(false);

  return (
    <div className="relative inline-block">
      <div
        onMouseEnter={() => setShow(true)}
        onMouseLeave={() => setShow(false)}
        className="cursor-help"
      >
        {children}
      </div>
      {show && (
        <div className="absolute z-50 px-3 py-2 text-sm font-medium text-white bg-gray-900 rounded-lg shadow-lg -top-12 left-1/2 transform -translate-x-1/2 whitespace-nowrap">
          {text}
          <div className="absolute w-2 h-2 bg-gray-900 transform rotate-45 -bottom-1 left-1/2 -translate-x-1/2"></div>
        </div>
      )}
    </div>
  );
};

// Individual project stats fetcher
const useProjectStats = (projectId: number, enabled: boolean) => {
  const { data: projectData } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "getProject",
    args: [BigInt(projectId)],
    enabled: enabled,
  });

  if (!projectData) return null;

  const [, , , , targetAmount, totalInvested, , , , isActive, isCompleted, isFailed] = projectData;
  const remainingAmount = targetAmount - totalInvested;
  const isFundingComplete = remainingAmount <= 0n;

  return {
    targetAmount: Number(targetAmount) / 1e6,
    totalInvested: Number(totalInvested) / 1e6,
    isActive: isActive && !isCompleted && !isFailed && !isFundingComplete,
  };
};

const Home: NextPage = () => {
  const [activeFilter, setActiveFilter] = useState("All");
  const filters = ["All", "Solar", "Thermal", "Wind", "Hydro"];

  // Get project count
  const { data: projectCount } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "projectCount",
  });

  const totalProjects = projectCount ? Number(projectCount) : 0;
  const projectIds = totalProjects > 0 ? Array.from({ length: totalProjects }, (_, i) => i) : [];

  // Fetch stats for projects that exist (only first 10 for performance)
  // Always call hooks, but use enabled flag to control when they run
  const project0 = useProjectStats(0, totalProjects > 0);
  const project1 = useProjectStats(1, totalProjects > 1);
  const project2 = useProjectStats(2, totalProjects > 2);
  const project3 = useProjectStats(3, totalProjects > 3);
  const project4 = useProjectStats(4, totalProjects > 4);
  const project5 = useProjectStats(5, totalProjects > 5);
  const project6 = useProjectStats(6, totalProjects > 6);
  const project7 = useProjectStats(7, totalProjects > 7);
  const project8 = useProjectStats(8, totalProjects > 8);
  const project9 = useProjectStats(9, totalProjects > 9);

  // Aggregate statistics
  const allProjectStats = [project0, project1, project2, project3, project4, project5, project6, project7, project8, project9].filter(p => p !== null);

  const totalRaised = allProjectStats.reduce((sum, p) => sum + (p?.totalInvested || 0), 0);
  const totalGoal = allProjectStats.reduce((sum, p) => sum + (p?.targetAmount || 0), 0);
  const activeProjects = allProjectStats.filter(p => p?.isActive).length;

  return (
    <div className="container mx-auto px-3 sm:px-4 md:px-6 py-4 sm:py-6 md:py-8">
        <div className="mb-6 sm:mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3 sm:gap-4">
            <div className="min-w-0">
              <h2 className="text-2xl sm:text-3xl font-bold mb-1 sm:mb-2 text-foreground">Tokenized Energy Projects</h2>
              <p className="text-sm sm:text-base text-muted-foreground">
                Invest in renewable energy projects with stablecoins
              </p>
            </div>
            <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
              <FaucetButton />
              <USDTFaucetButton />
            </div>
          </div>

          {/* Statistics Grid */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
            {/* Total Projects */}
            <div className="bg-card rounded-lg p-4 sm:p-6 border border-card-border transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-muted-foreground text-xs sm:text-sm font-medium">Total Projects</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">{totalProjects}</div>
              <div className="text-muted-foreground text-xs sm:text-sm">Across all types</div>
            </div>

            {/* Active Projects */}
            <div className="bg-card rounded-lg p-4 sm:p-6 border border-card-border transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-muted-foreground text-xs sm:text-sm font-medium">Active Projects</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <div className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">{activeProjects}</div>
              <div className="text-muted-foreground text-xs sm:text-sm">Currently accepting</div>
            </div>

            {/* Total Raised */}
            <div className="bg-card rounded-lg p-4 sm:p-6 border border-card-border transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-muted-foreground text-xs sm:text-sm font-medium">Total Raised</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                  />
                </svg>
              </div>
              <Tooltip text={`$${totalRaised.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                <div className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">
                  ${totalRaised >= 1000000
                    ? `${(totalRaised / 1000000).toFixed(1)}M`
                    : totalRaised >= 1000
                    ? `${(totalRaised / 1000).toFixed(1)}K`
                    : totalRaised.toFixed(2)}
                </div>
              </Tooltip>
              <div className="text-muted-foreground text-xs sm:text-sm">All projects</div>
            </div>

            {/* Total Goal */}
            <div className="bg-card rounded-lg p-4 sm:p-6 border border-card-border transition-all">
              <div className="flex items-center justify-between mb-3 sm:mb-4">
                <span className="text-muted-foreground text-xs sm:text-sm font-medium">Total Goal</span>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 sm:h-5 sm:w-5 text-muted-foreground"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </div>
              <Tooltip text={`$${totalGoal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}>
                <div className="text-2xl sm:text-3xl font-bold mb-1 text-foreground">
                  ${totalGoal >= 1000000
                    ? `${(totalGoal / 1000000).toFixed(1)}M`
                    : totalGoal >= 1000
                    ? `${(totalGoal / 1000).toFixed(1)}K`
                    : totalGoal.toFixed(2)}
                </div>
              </Tooltip>
              <div className="text-muted-foreground text-xs sm:text-sm">Funding targets</div>
            </div>
          </div>

          {/* Investment Introduction */}
          <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-4 sm:p-6 mb-6 sm:mb-8">
            <h3 className="text-lg sm:text-xl font-semibold text-foreground mb-3 sm:mb-4">How It Works</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {/* Interest Rates */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground">Tiered Interest Rates</h4>
                </div>
                <div className="text-xs sm:text-sm text-muted-foreground space-y-1">
                  <p className="flex justify-between"><span>&lt; $2,000:</span> <span className="font-semibold text-foreground">5% APY</span></p>
                  <p className="flex justify-between"><span>$2K - $20K:</span> <span className="font-semibold text-foreground">7% APY</span></p>
                  <p className="flex justify-between"><span>&gt; $20,000:</span> <span className="font-semibold text-foreground">9% APY</span></p>
                </div>
              </div>

              {/* Rate Returns */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground">Weekly Interest Payments</h4>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Earn interest <span className="font-semibold text-foreground">every week</span> after the project construction is completed. Interest is calculated based on your investment tier and can be claimed at any time.
                </p>
              </div>

              {/* Principal Payback */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <div className="h-8 w-8 rounded-md bg-primary/10 flex items-center justify-center">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                  </div>
                  <h4 className="font-semibold text-sm sm:text-base text-foreground">Principal Payback</h4>
                </div>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  Starting <span className="font-semibold text-foreground">2 years</span> after funding completion, receive <span className="font-semibold text-foreground">20% of your principal annually</span> until fully repaid over 5 years.
                </p>
              </div>
            </div>
          </div>

          {/* Filter Tabs */}
          <div className="w-full overflow-x-auto mb-6 sm:mb-8 -mx-3 px-3 sm:mx-0 sm:px-0">
            <div className="inline-flex h-11 sm:h-12 items-center justify-center rounded-lg bg-muted p-1.5 text-muted-foreground min-w-min">
              {filters.map(filter => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`inline-flex items-center justify-center whitespace-nowrap rounded-md px-4 sm:px-6 py-2 sm:py-2.5 text-sm sm:text-base font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ${
                    activeFilter === filter
                      ? "bg-background text-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Projects Grid */}
          <div className="w-full">
            <ProjectList filter={activeFilter} />
          </div>
        </div>
    </div>
  );
};

export default Home;

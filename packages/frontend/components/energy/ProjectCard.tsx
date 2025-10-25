"use client";

interface ProjectCardProps {
  projectId: number;
  name: string;
  description: string;
  location: string;
  projectType: string;
  targetAmount: bigint;
  totalInvested: bigint;
  energyProduced: bigint;
  projectOwner: string;
  isActive: boolean;
  isCompleted: boolean;
  isFailed: boolean;
  fundingDeadline: bigint;
  onInvest: (projectId: number) => void;
}

export const ProjectCard = ({
  projectId,
  name,
  description,
  location,
  projectType,
  targetAmount,
  totalInvested,
  energyProduced,
  projectOwner,
  isActive,
  isCompleted,
  isFailed,
  fundingDeadline,
  onInvest,
}: ProjectCardProps) => {
  const fundingPercentage = targetAmount > 0n ? Number((totalInvested * 100n) / targetAmount) : 0;

  const formatDeadline = (timestamp: bigint) => {
    if (timestamp === 0n) return "No deadline";
    const date = new Date(Number(timestamp) * 1000);
    const now = new Date();
    const diffTime = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return "Expired";
    if (diffDays === 0) return "Today";
    if (diffDays === 1) return "1 day left";
    if (diffDays <= 30) return `${diffDays} days left`;

    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
  };

  const formatUSDT = (amount: bigint) => {
    // USDT has 6 decimals
    const value = Number(amount) / 1e6;
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(0)}K`;
    }
    return value.toLocaleString();
  };

  const getProjectTypeColor = (type: string) => {
    const colors: { [key: string]: string } = {
      Solar: "bg-amber-500/10 text-amber-500 border-amber-500/20",
      Wind: "bg-sky-500/10 text-sky-500 border-sky-500/20",
      Hydro: "bg-blue-500/10 text-blue-500 border-blue-500/20",
      Thermal: "bg-orange-500/10 text-orange-500 border-orange-500/20",
      Geothermal: "bg-red-500/10 text-red-500 border-red-500/20",
      Biomass: "bg-green-500/10 text-green-500 border-green-500/20",
      Other: "bg-purple-500/10 text-purple-500 border-purple-500/20",
    };
    return colors[type] || colors.Other;
  };

  const getStatusColor = () => {
    if (isFailed) return "bg-destructive/10 text-destructive border-destructive/20";
    if (isCompleted) return "bg-muted text-muted-foreground border-muted";
    if (isActive) return "bg-primary/10 text-primary border-primary/20";
    return "bg-muted text-muted-foreground border-muted";
  };

  const getStatusText = () => {
    if (isFailed) return "Failed";
    if (isCompleted) return "Completed";
    if (isActive) return "Active";
    return "Inactive";
  };

  return (
    <div className="rounded-2xl border bg-[#1a1d29] border-gray-800 shadow-lg overflow-hidden hover:shadow-xl transition-shadow cursor-pointer flex flex-col h-full">
      {/* Header */}
      <div className="flex flex-col space-y-1 p-4 sm:p-5 pb-3">
        <div className="flex items-start justify-between gap-3 mb-1">
          <h3 className="font-semibold text-xl sm:text-2xl text-white line-clamp-2 flex-1">{name}</h3>
          <div className="flex gap-2 flex-shrink-0">
            <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${getProjectTypeColor(projectType)}`}>
              {projectType}
            </span>
            <span className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${getStatusColor()}`}>
              {getStatusText()}
            </span>
          </div>
        </div>
        <div className="flex items-center gap-1.5 text-sm text-gray-400">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 flex-shrink-0"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
            />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
          </svg>
          <span className="truncate">{location}</span>
        </div>
      </div>

      {/* Content */}
      <div className="px-4 sm:px-5 pb-3 sm:pb-4 flex-1">
        <p className="text-sm text-gray-400 line-clamp-2 mb-3">{description}</p>

        {/* Funding Progress */}
        <div className="space-y-2 mb-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Funding Progress</span>
            <span className="font-bold font-mono text-white text-base">{fundingPercentage.toFixed(1)}%</span>
          </div>
          <div className="relative h-2 w-full overflow-hidden rounded-full bg-gray-800">
            <div
              className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all rounded-full"
              style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="font-mono font-bold text-white text-lg">${formatUSDT(totalInvested)}</span>
            <span className="text-gray-400">of ${formatUSDT(targetAmount)}</span>
          </div>
        </div>

        {/* Token Symbol */}
        <div className="flex items-center gap-2 text-sm">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4 text-gray-400"
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
          <span className="font-mono text-gray-400 text-xs">SFC</span>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center px-4 sm:px-5 pb-4 sm:pb-5">
        <button
          onClick={(e) => {
            e.stopPropagation();
            onInvest(projectId);
          }}
          disabled={!isActive || isCompleted || isFailed}
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 sm:h-10 px-3 sm:px-4 py-2 w-full"
        >
          {isFailed ? "Funding Failed" : isCompleted ? "Completed" : !isActive ? "Inactive" : "Invest Now"}
        </button>
      </div>
    </div>
  );
};

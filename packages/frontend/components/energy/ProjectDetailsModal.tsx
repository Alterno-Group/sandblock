"use client";

import { createPortal } from "react-dom";
import { useEffect } from "react";

interface ProjectDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
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
  contractAddress: string;
  createdAt: bigint;
  onInvest: (projectId: number) => void;
}

export const ProjectDetailsModal = ({
  isOpen,
  onClose,
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
  contractAddress,
  createdAt,
  onInvest,
}: ProjectDetailsModalProps) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      return () => document.removeEventListener("keydown", handleEscape);
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const fundingPercentage = targetAmount > 0n ? Number((totalInvested * 100n) / targetAmount) : 0;
  const remaining = targetAmount > totalInvested ? targetAmount - totalInvested : 0n;
  const isFundingComplete = remaining <= 0n;

  const formatUSDT = (amount: bigint) => {
    const value = Number(amount) / 1e6;
    return value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const formatDate = (timestamp: bigint) => {
    if (timestamp === 0n) return "N/A";
    const date = new Date(Number(timestamp) * 1000);
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
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

  const modalContent = (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border bg-[#1a1d29] border-gray-800 shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 rounded-lg p-2 text-gray-400 hover:text-white hover:bg-gray-800 transition-colors"
          aria-label="Close modal"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        {/* Content */}
        <div className="p-6 sm:p-8">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-start gap-3 mb-3">
              <h2 className="font-bold text-2xl sm:text-3xl text-white flex-1">{name}</h2>
              <div className="flex gap-2 flex-shrink-0">
                <span
                  className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${getProjectTypeColor(projectType)}`}
                >
                  {projectType}
                </span>
                <span
                  className={`inline-flex items-center rounded-md border px-2.5 py-1 text-xs font-semibold ${getStatusColor()}`}
                >
                  {getStatusText()}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2 text-gray-400 mb-4">
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
              <span>{location}</span>
            </div>

            <p className="text-gray-300 leading-relaxed">{description}</p>
          </div>

          {/* Funding Progress */}
          <div className="mb-6 p-5 rounded-xl bg-gray-900/50 border border-gray-800">
            <h3 className="text-sm font-semibold text-gray-400 mb-4">Funding Progress</h3>

            {/* Three column stats */}
            <div className="grid grid-cols-3 gap-4 mb-4">
              <div>
                <div className="text-xs text-gray-500 mb-1">Goal</div>
                <div className="text-lg font-bold text-white">${formatUSDT(targetAmount)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Raised</div>
                <div className="text-lg font-bold text-primary">${formatUSDT(totalInvested)}</div>
              </div>
              <div>
                <div className="text-xs text-gray-500 mb-1">Remaining</div>
                <div className="text-lg font-bold text-green-500">${formatUSDT(remaining)}</div>
              </div>
            </div>

            {/* Progress bar */}
            <div className="space-y-2">
              <div className="relative h-3 w-full overflow-hidden rounded-full bg-gray-800">
                <div
                  className="h-full bg-gradient-to-r from-green-500 to-green-400 transition-all rounded-full"
                  style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
                />
              </div>
              <div className="text-center text-sm font-bold text-white">{fundingPercentage.toFixed(1)}%</div>
            </div>
          </div>

          {/* Additional Information */}
          <div className="space-y-4 mb-6">
            {/* Contract Address */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900/30 border border-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1">Contract Address</div>
                <div className="text-sm font-mono text-gray-300 break-all">{contractAddress}</div>
              </div>
            </div>

            {/* Created Date */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900/30 border border-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                />
              </svg>
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Created</div>
                <div className="text-sm text-gray-300">{formatDate(createdAt)}</div>
              </div>
            </div>

            {/* Energy Produced */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900/30 border border-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"
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
              <div className="flex-1">
                <div className="text-xs text-gray-500 mb-1">Energy Produced</div>
                <div className="text-sm text-gray-300">{energyProduced.toString()} kWh</div>
              </div>
            </div>

            {/* Project Owner */}
            <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900/30 border border-gray-800">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                />
              </svg>
              <div className="flex-1 min-w-0">
                <div className="text-xs text-gray-500 mb-1">Project Owner</div>
                <div className="text-sm font-mono text-gray-300 break-all">{projectOwner}</div>
              </div>
            </div>

            {/* Funding Deadline */}
            {fundingDeadline > 0n && (
              <div className="flex items-start gap-3 p-4 rounded-lg bg-gray-900/30 border border-gray-800">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400 flex-shrink-0 mt-0.5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <div className="flex-1">
                  <div className="text-xs text-gray-500 mb-1">Funding Deadline</div>
                  <div className="text-sm text-gray-300">{formatDate(fundingDeadline)}</div>
                </div>
              </div>
            )}
          </div>

          {/* Invest Button */}
          <button
            onClick={() => {
              onInvest(projectId);
              onClose();
            }}
            disabled={!isActive || isCompleted || isFailed || isFundingComplete}
            className="w-full inline-flex items-center justify-center rounded-lg text-base font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-12 px-6 py-3"
          >
            {isFailed ? "Funding Failed" : isCompleted ? "Project Completed" : !isActive ? "Project Inactive" : isFundingComplete ? "Fully Funded" : "Invest in This Project"}
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
};

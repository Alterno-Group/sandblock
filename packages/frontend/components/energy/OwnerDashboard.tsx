"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";
import { useTargetNetwork } from "~~/hooks/scaffold-eth/useTargetNetwork";

export const OwnerDashboard = () => {
  const { address, isConnected } = useAccount();
  const router = useRouter();
  const { targetNetwork } = useTargetNetwork();
  const [newProjectName, setNewProjectName] = useState("");
  const [newProjectDescription, setNewProjectDescription] = useState("");
  const [newProjectLocation, setNewProjectLocation] = useState("");
  const [newProjectType, setNewProjectType] = useState(0); // 0 = Solar
  const [newProjectTarget, setNewProjectTarget] = useState("");
  const [fundingDuration, setFundingDuration] = useState("90"); // Default 90 days
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newAdminAddress, setNewAdminAddress] = useState("");
  const [removeAdminAddress, setRemoveAdminAddress] = useState("");
  const [showAdminSection, setShowAdminSection] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("All");
  const [filterStatus, setFilterStatus] = useState("All");
  const [sortBy, setSortBy] = useState("newest");

  const projectTypes = ["Solar", "Wind", "Hydro", "Thermal", "Geothermal", "Biomass", "Other"];
  const statusFilters = ["All", "Active", "Completed", "Failed", "Fully Funded"];
  const sortOptions = [
    { value: "newest", label: "Newest First" },
    { value: "oldest", label: "Oldest First" },
  ];

  const { data: projectCount } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "projectCount",
  });

  const { data: contractOwner } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "owner",
  });

  const { data: isCurrentUserAdmin } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "isAdmin",
    args: [address as `0x${string}`],
    enabled: !!address,
  });

  const { writeAsync: createProject, isMining: isCreating } = useScaffoldContractWrite({
    contractName: "SandBlock",
    functionName: "createProject",
    args: ["", "", "", 0, 0n, 0],
  });

  const { writeAsync: addAdmin, isMining: isAddingAdmin } = useScaffoldContractWrite({
    contractName: "SandBlock",
    functionName: "addAdmin",
    args: ["0x0000000000000000000000000000000000000000"],
  });

  const { writeAsync: removeAdmin, isMining: isRemovingAdmin } = useScaffoldContractWrite({
    contractName: "SandBlock",
    functionName: "removeAdmin",
    args: ["0x0000000000000000000000000000000000000000"],
  });

  const handleCreateProject = async () => {
    if (!newProjectName || !newProjectTarget || !fundingDuration) return;

    try {
      const targetAmountUSDT = parseUnits(newProjectTarget, 6);
      const durationDays = Number(fundingDuration);

      await createProject({
        args: [
          newProjectName,
          newProjectDescription,
          newProjectLocation,
          newProjectType,
          targetAmountUSDT,
          durationDays,
        ],
      });

      // Reset form
      setNewProjectName("");
      setNewProjectDescription("");
      setNewProjectLocation("");
      setNewProjectType(0);
      setNewProjectTarget("");
      setFundingDuration("90");
      setShowCreateForm(false);

      // Project list will automatically refresh due to useScaffoldContractRead watching for changes
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const handleAddAdmin = async () => {
    if (!newAdminAddress) return;

    try {
      await addAdmin({
        args: [newAdminAddress as `0x${string}`],
      });
      setNewAdminAddress("");
    } catch (error) {
      console.error("Failed to add admin:", error);
    }
  };

  const handleRemoveAdmin = async () => {
    if (!removeAdminAddress) return;

    try {
      await removeAdmin({
        args: [removeAdminAddress as `0x${string}`],
      });
      setRemoveAdminAddress("");
    } catch (error) {
      console.error("Failed to remove admin:", error);
    }
  };

  // Wait a bit for wallet to connect, then redirect if not connected
  useEffect(() => {
    // Give wallet 1 second to auto-connect
    const timer = setTimeout(() => {
      setIsLoading(false);
      if (!isConnected) {
        router.push("/");
      }
    }, 1000);

    // If wallet connects quickly, stop loading immediately
    if (isConnected) {
      setIsLoading(false);
      clearTimeout(timer);
    }

    return () => clearTimeout(timer);
  }, [isConnected, router]);

  const isContractOwner = address && contractOwner && address.toLowerCase() === contractOwner.toLowerCase();
  const isAuthorized = isContractOwner || isCurrentUserAdmin;

  const projectIds = useMemo(() => {
    if (!projectCount) return [];
    const ids = Array.from({ length: Number(projectCount) }, (_, i) => i);
    // Sort by creation order - newest projects have higher IDs
    return sortBy === "newest" ? ids.reverse() : ids;
  }, [projectCount, sortBy]);

  // Debug logging
  // console.log("OwnerDashboard Debug:", {
  //   address,
  //   contractOwner,
  //   isContractOwner,
  //   isCurrentUserAdmin,
  //   isAuthorized,
  //   isConnected,
  //   isLoading,
  // });

  // Show loading while checking wallet connection and authorization
  if (isLoading || (isConnected && contractOwner === undefined) || (isConnected && address && isCurrentUserAdmin === undefined)) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-4 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  // Redirect if not authorized (not owner and not admin)
  if (!isAuthorized) {
    router.push("/");
    return null;
  }

  // Show nothing while redirecting
  if (!isConnected) {
    return null;
  }

  // Check if on local hardhat network
  const isLocalNetwork = targetNetwork.id === 31337;

  return (
    <>
      {/* Debug Info - Only show on local hardhat network */}
      {isLocalNetwork && (
        <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-3 mb-4 text-xs">
          <div className="font-mono">
            <div>Your Address: {address || "Not connected"}</div>
            <div>Contract Owner: {contractOwner || "Loading..."}</div>
            <div>Is Owner: {isContractOwner ? "✅ Yes" : "❌ No"}</div>
            <div>Is Admin: {isCurrentUserAdmin ? "✅ Yes" : "❌ No"}</div>
          </div>
        </div>
      )}

      {/* Header with Filters and Action Buttons */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-4">
          <h1 className="text-3xl font-bold text-foreground">Projects</h1>
          <div className="flex gap-2">
            {isContractOwner && (
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
                onClick={() => setShowAdminSection(!showAdminSection)}
              >
                {showAdminSection ? "Hide Admin Panel" : "Manage Admins"}
              </button>
            )}
            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
              onClick={() => setShowCreateForm(!showCreateForm)}
            >
              {showCreateForm ? "Cancel" : "Create New Project"}
            </button>
          </div>
        </div>

        {/* Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
          {/* Type Filter */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Project Type</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
            >
              <option value="All">All Types</option>
              {projectTypes.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Status</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
            >
              {statusFilters.map((status) => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="text-sm font-medium text-foreground mb-1.5 block">Sort By</label>
            <select
              className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
            >
              {sortOptions.map((option) => (
                <option key={option.value} value={option.value}>{option.label}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Admin Management Section - Only visible to contract owner */}
      {isContractOwner && showAdminSection && (
        <div className="bg-card border border-card-border rounded-lg shadow-lg mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Admin Management</h2>
            <p className="text-sm text-muted-foreground mb-6">
              Admins can create and edit projects. Only the contract owner can add or remove admins.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Add Admin */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Add Admin</h3>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Admin Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newAdminAddress}
                    onChange={(e) => setNewAdminAddress(e.target.value)}
                  />
                </div>
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                  onClick={handleAddAdmin}
                  disabled={isAddingAdmin || !newAdminAddress}
                >
                  {isAddingAdmin ? "Adding..." : "Add Admin"}
                </button>
              </div>

              {/* Remove Admin */}
              <div className="space-y-3">
                <h3 className="text-lg font-semibold text-foreground">Remove Admin</h3>
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Admin Address
                  </label>
                  <input
                    type="text"
                    placeholder="0x..."
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={removeAdminAddress}
                    onChange={(e) => setRemoveAdminAddress(e.target.value)}
                  />
                </div>
                <button
                  className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-destructive text-destructive-foreground hover:bg-destructive/90 h-10 px-4 py-2 w-full"
                  onClick={handleRemoveAdmin}
                  disabled={isRemovingAdmin || !removeAdminAddress}
                >
                  {isRemovingAdmin ? "Removing..." : "Remove Admin"}
                </button>
              </div>
            </div>

            {/* Current User Status */}
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium text-foreground">Your Status:</span>
                <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold bg-primary/10 text-primary border-primary/20">
                  Contract Owner
                </span>
                {isCurrentUserAdmin && (
                  <span className="inline-flex items-center rounded-md border px-2 py-1 text-xs font-semibold bg-secondary/10 text-secondary-foreground border-secondary/20">
                    Admin
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Create Project Form */}
      {showCreateForm && (
        <div className="bg-card border border-card-border rounded-lg shadow-lg mb-8">
          <div className="p-6">
            <h2 className="text-2xl font-bold text-foreground mb-4">Create New Energy Project</h2>

            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Project Name
                </label>
                <input
                  type="text"
                  placeholder="e.g., Solar Farm Project A"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newProjectName}
                  onChange={(e) => setNewProjectName(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Description
                </label>
                <textarea
                  placeholder="Describe your energy project"
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  rows={3}
                  value={newProjectDescription}
                  onChange={(e) => setNewProjectDescription(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Location
                </label>
                <input
                  type="text"
                  placeholder="e.g., California, USA"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newProjectLocation}
                  onChange={(e) => setNewProjectLocation(e.target.value)}
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Project Type
                </label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={newProjectType}
                  onChange={(e) => setNewProjectType(Number(e.target.value))}
                >
                  {projectTypes.map((type, index) => (
                    <option key={index} value={index}>
                      {type}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Target Funding Amount (USDT)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 100000"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={newProjectTarget}
                    onChange={(e) => setNewProjectTarget(e.target.value)}
                    min="0"
                    step="1000"
                  />
                </div>

                <div>
                  <label className="text-sm font-medium text-foreground mb-1.5 block">
                    Funding Duration (Days)
                  </label>
                  <input
                    type="number"
                    placeholder="e.g., 90"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                    value={fundingDuration}
                    onChange={(e) => setFundingDuration(e.target.value)}
                    min="1"
                    max="365"
                  />
                  <p className="text-xs text-muted-foreground mt-1.5">Max 365 days (1 year)</p>
                </div>
              </div>

              <div className="bg-accent/50 border border-accent rounded-lg p-4">
                <span className="text-sm text-accent-foreground">
                  If funding target is not reached within {fundingDuration} days, all investments will be automatically refundable.
                </span>
              </div>

              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 w-full"
                onClick={handleCreateProject}
                disabled={isCreating || !newProjectName || !newProjectTarget || !fundingDuration}
              >
                {isCreating ? "Creating..." : "Create Project"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects - Show all for owner/admin, or only owned for regular users */}
      <div className="space-y-6">
        {projectIds.map((id) => (
          <OwnerProjectCard
            key={id}
            projectId={id}
            ownerAddress={address}
            isContractOwner={isContractOwner}
            isAdmin={isCurrentUserAdmin}
            filterType={filterType}
            filterStatus={filterStatus}
          />
        ))}
      </div>
    </>
  );
};

const OwnerProjectCard = ({
  projectId,
  ownerAddress,
  isContractOwner,
  isAdmin,
  filterType,
  filterStatus,
}: {
  projectId: number;
  ownerAddress: string | undefined;
  isContractOwner: boolean | "" | undefined;
  isAdmin: boolean | undefined;
  filterType: string;
  filterStatus: string;
}) => {
  const [energyAmount, setEnergyAmount] = useState("");
  const [energyCost, setEnergyCost] = useState("");
  const [energyNotes, setEnergyNotes] = useState("");

  const { data: projectData } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "getProject",
    args: [BigInt(projectId)],
  });

  const { data: timelineData } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "getProjectTimeline",
    args: [BigInt(projectId)],
  });

  const { data: investors } = useScaffoldContractRead({
    contractName: "SandBlock",
    functionName: "getProjectInvestors",
    args: [BigInt(projectId)],
  });

  const { writeAsync: recordEnergy, isMining: isRecording } = useScaffoldContractWrite({
    contractName: "SandBlock",
    functionName: "recordEnergyProduction",
    args: [BigInt(projectId), 0n, 0n, ""],
  });

  const { writeAsync: completeConstruction, isMining: isCompleting } = useScaffoldContractWrite({
    contractName: "SandBlock",
    functionName: "completeConstruction",
    args: [BigInt(projectId)],
  });

  if (!projectData || !timelineData) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [
    name,
    description,
    location,
    projectType,
    targetAmount,
    totalInvested,
    energyProduced,
    totalEnergyCost,
    projectOwner,
    isActive,
    isCompleted,
    isFailed,
  ] = projectData;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_createdAt, _fundingDeadline, fundingCompletedAt, _constructionCompletedAt] = timelineData;

  // Show all projects for contract owner and admins, otherwise only show owned projects
  const canManageAllProjects = isContractOwner || isAdmin;
  const isOwnedByCurrentUser = projectOwner.toLowerCase() === ownerAddress?.toLowerCase();

  if (!canManageAllProjects && !isOwnedByCurrentUser) return null;

  // Apply filters
  const projectTypeNames = ["Solar", "Wind", "Hydro", "Thermal", "Geothermal", "Biomass", "Other"];
  const projectTypeName = projectTypeNames[Number(projectType)] || "Unknown";
  const remainingAmount = targetAmount - totalInvested;
  const isFundingComplete = remainingAmount <= 0n;

  // Filter by type
  if (filterType !== "All" && projectTypeName !== filterType) return null;

  // Filter by status
  if (filterStatus !== "All") {
    if (filterStatus === "Active" && !isActive) return null;
    if (filterStatus === "Completed" && !isCompleted) return null;
    if (filterStatus === "Failed" && !isFailed) return null;
    if (filterStatus === "Fully Funded" && !isFundingComplete) return null;
  }

  const formatUSDT = (amount: bigint) => {
    return (Number(amount) / 1e6).toFixed(2);
  };

  const handleRecordEnergy = async () => {
    if (!energyAmount) return;

    try {
      const costUSDT = energyCost ? parseUnits(energyCost, 6) : 0n;

      await recordEnergy({
        args: [BigInt(projectId), BigInt(energyAmount), costUSDT, energyNotes],
      });

      setEnergyAmount("");
      setEnergyCost("");
      setEnergyNotes("");
    } catch (error) {
      console.error("Failed to record energy:", error);
    }
  };

  const handleCompleteConstruction = async () => {
    try {
      await completeConstruction();
    } catch (error) {
      console.error("Failed to complete construction:", error);
    }
  };

  const fundingPercentage = targetAmount > 0n
    ? Number((totalInvested * 100n) / targetAmount)
    : 0;

  return (
    <div className="bg-card border border-card-border rounded-lg shadow-lg">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h2 className="text-2xl font-bold text-foreground">{name}</h2>
              {!isOwnedByCurrentUser && canManageAllProjects && (
                <span className="inline-flex items-center rounded-md border px-2 py-0.5 text-xs font-semibold bg-blue-500/10 text-blue-500 border-blue-500/20">
                  Managed by Admin
                </span>
              )}
            </div>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium">Location:</span> {location}
            </p>
            {!isOwnedByCurrentUser && canManageAllProjects && (
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                <span className="font-medium">Owner:</span> {projectOwner.slice(0, 6)}...{projectOwner.slice(-4)}
              </p>
            )}
          </div>
          <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ${isCompleted ? "bg-primary/10 text-primary" : isActive ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
            {isCompleted ? "Completed" : isActive ? "Active" : "Paused"}
          </span>
        </div>

        {/* Funding Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-sm mb-2">
            <span className="text-foreground">Funding Progress</span>
            <span className="font-bold text-foreground">{fundingPercentage.toFixed(1)}%</span>
          </div>
          <div className="w-full bg-muted rounded-full h-2 overflow-hidden">
            <div
              className="bg-primary h-full transition-all duration-300"
              style={{ width: `${Math.min(fundingPercentage, 100)}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>${formatUSDT(totalInvested)} USDT</span>
            <span>${formatUSDT(targetAmount)} USDT</span>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="bg-muted rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Investors</div>
            <div className="text-2xl font-bold text-foreground">{investors?.length || 0}</div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Energy Produced</div>
            <div className="text-2xl font-bold text-foreground">{energyProduced.toString()}</div>
            <div className="text-xs text-muted-foreground mt-1">kWh</div>
          </div>
          <div className="bg-muted rounded-lg p-4">
            <div className="text-xs text-muted-foreground mb-1">Total Cost</div>
            <div className="text-2xl font-bold text-foreground">${formatUSDT(totalEnergyCost)}</div>
          </div>
        </div>

        {/* Complete Construction Button */}
        {fundingCompletedAt > 0n && !isCompleted && (
          <div className="bg-primary/10 border border-primary/20 rounded-lg p-4 mt-6">
            <div className="flex justify-between items-center flex-wrap gap-4">
              <span className="text-sm text-foreground">Funding completed! You can now mark construction as complete.</span>
              <button
                className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-3"
                onClick={handleCompleteConstruction}
                disabled={isCompleting}
              >
                {isCompleting ? "Completing..." : "Complete Construction"}
              </button>
            </div>
          </div>
        )}

        {/* Energy Recording Form */}
        {isCompleted && (
          <div className="mt-6">
            <div className="relative mb-4">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t border-border" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Record Energy Production</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Energy (kWh)
                </label>
                <input
                  type="number"
                  placeholder="e.g., 1000"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={energyAmount}
                  onChange={(e) => setEnergyAmount(e.target.value)}
                  min="0"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Cost (USDT) - Optional
                </label>
                <input
                  type="number"
                  placeholder="e.g., 100"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={energyCost}
                  onChange={(e) => setEnergyCost(e.target.value)}
                  min="0"
                  step="0.01"
                />
              </div>

              <div>
                <label className="text-sm font-medium text-foreground mb-1.5 block">
                  Notes - Optional
                </label>
                <input
                  type="text"
                  placeholder="e.g., Monthly production"
                  className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  value={energyNotes}
                  onChange={(e) => setEnergyNotes(e.target.value)}
                />
              </div>
            </div>

            <button
              className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 mt-4"
              onClick={handleRecordEnergy}
              disabled={isRecording || !energyAmount}
            >
              {isRecording ? "Recording..." : "Record Energy Production"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

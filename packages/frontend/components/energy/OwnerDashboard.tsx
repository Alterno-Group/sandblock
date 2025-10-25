"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAccount } from "wagmi";
import { parseUnits } from "viem";
import { useScaffoldContractRead, useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

export const OwnerDashboard = () => {
  const { address } = useAccount();
  const router = useRouter();
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

  const projectTypes = ["Solar", "Wind", "Hydro", "Thermal", "Geothermal", "Biomass", "Other"];

  const { data: projectCount } = useScaffoldContractRead({
    contractName: "EnergyProjectHub",
    functionName: "projectCount",
  });

  const { writeAsync: createProject, isMining: isCreating } = useScaffoldContractWrite({
    contractName: "EnergyProjectHub",
    functionName: "createProject",
    args: ["", "", "", 0, 0n, 0],
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

      // Redirect to homepage to see the new project
      setTimeout(() => {
        router.push("/");
      }, 1000);
    } catch (error) {
      console.error("Failed to create project:", error);
    }
  };

  const projectIds = projectCount ? Array.from({ length: Number(projectCount) }, (_, i) => i) : [];

  return (
    <>
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold text-foreground">My Projects</h1>
        <button
          className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
          onClick={() => setShowCreateForm(!showCreateForm)}
        >
          {showCreateForm ? "Cancel" : "Create New Project"}
        </button>
      </div>

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

      {/* Owned Projects */}
      <div className="space-y-6">
        {projectIds.map((id) => (
          <OwnerProjectCard key={id} projectId={id} ownerAddress={address} />
        ))}
      </div>
    </>
  );
};

const OwnerProjectCard = ({
  projectId,
  ownerAddress,
}: {
  projectId: number;
  ownerAddress: string | undefined;
}) => {
  const [energyAmount, setEnergyAmount] = useState("");
  const [energyCost, setEnergyCost] = useState("");
  const [energyNotes, setEnergyNotes] = useState("");

  const { data: projectData } = useScaffoldContractRead({
    contractName: "EnergyProjectHub",
    functionName: "getProject",
    args: [BigInt(projectId)],
  });

  const { data: timelineData } = useScaffoldContractRead({
    contractName: "EnergyProjectHub",
    functionName: "getProjectTimeline",
    args: [BigInt(projectId)],
  });

  const { data: investors } = useScaffoldContractRead({
    contractName: "EnergyProjectHub",
    functionName: "getProjectInvestors",
    args: [BigInt(projectId)],
  });

  const { writeAsync: recordEnergy, isMining: isRecording } = useScaffoldContractWrite({
    contractName: "EnergyProjectHub",
    functionName: "recordEnergyProduction",
    args: [BigInt(projectId), 0n, 0n, ""],
  });

  const { writeAsync: completeConstruction, isMining: isCompleting } = useScaffoldContractWrite({
    contractName: "EnergyProjectHub",
    functionName: "completeConstruction",
    args: [BigInt(projectId)],
  });

  if (!projectData || !timelineData) return null;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [
    name,
    description,
    location,
    _projectType,
    targetAmount,
    totalInvested,
    energyProduced,
    totalEnergyCost,
    projectOwner,
    isActive,
    isCompleted,
    _isFailed,
  ] = projectData;

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const [_createdAt, _fundingDeadline, fundingCompletedAt, _constructionCompletedAt] = timelineData;

  // Skip if not owned by current user
  if (projectOwner.toLowerCase() !== ownerAddress?.toLowerCase()) return null;

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
          <div>
            <h2 className="text-2xl font-bold text-foreground">{name}</h2>
            <p className="text-sm text-muted-foreground mt-1">{description}</p>
            <p className="text-sm text-muted-foreground mt-1">
              <span className="font-medium">Location:</span> {location}
            </p>
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

"use client";

import { useState, useMemo } from "react";
import { ProjectCard } from "./ProjectCard";
import { InvestmentModal } from "./InvestmentModal";
import { useScaffoldContractRead } from "~~/hooks/scaffold-eth";

interface ProjectListProps {
  filter?: string;
}

const PROJECTS_PER_PAGE = 6;

export const ProjectList = ({ filter = "All" }: ProjectListProps) => {
  const [selectedProject, setSelectedProject] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);

  const { data: projectCount } = useScaffoldContractRead({
    contractName: "EnergyProjectHub",
    functionName: "projectCount",
  });

  const handleInvest = (projectId: number) => {
    setSelectedProject(projectId);
  };

  const handleCloseModal = () => {
    setSelectedProject(null);
  };

  const allProjectIds = projectCount ? Array.from({ length: Number(projectCount) }, (_, i) => i) : [];

  // Calculate pagination
  const totalPages = Math.ceil(allProjectIds.length / PROJECTS_PER_PAGE);
  const startIndex = (currentPage - 1) * PROJECTS_PER_PAGE;
  const endIndex = startIndex + PROJECTS_PER_PAGE;
  const currentProjectIds = allProjectIds.slice(startIndex, endIndex);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="w-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {currentProjectIds.map((id) => (
          <ProjectCardWrapper key={id} projectId={id} onInvest={handleInvest} filter={filter} />
        ))}
      </div>

      {allProjectIds.length === 0 && (
        <div className="text-center py-12">
          <p className="text-xl opacity-60">No projects yet. Create the first one!</p>
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center items-center gap-2 mt-8">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Previous
          </button>

          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => handlePageChange(page)}
                className={`inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 h-10 px-4 py-2 ${
                  currentPage === page
                    ? "bg-primary text-primary-foreground hover:bg-primary/90"
                    : "border border-input bg-background hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Next
          </button>
        </div>
      )}

      {/* Page info */}
      {totalPages > 1 && (
        <div className="text-center mt-4 opacity-60 text-sm">
          Showing {startIndex + 1}-{Math.min(endIndex, allProjectIds.length)} of {allProjectIds.length} projects
        </div>
      )}

      {/* Investment Modal */}
      <InvestmentModal
        projectId={selectedProject}
        isOpen={selectedProject !== null}
        onClose={handleCloseModal}
      />
    </div>
  );
};

// Wrapper component to fetch individual project data
const ProjectCardWrapper = ({
  projectId,
  onInvest,
  filter
}: {
  projectId: number;
  onInvest: (id: number) => void;
  filter: string;
}) => {
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

  if (!projectData || !timelineData) {
    return (
      <div className="bg-card rounded-lg p-6 border border-card-border shadow-lg">
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-3/4 mb-4"></div>
          <div className="h-4 bg-muted rounded w-1/2"></div>
        </div>
      </div>
    );
  }

  const [
    name,
    description,
    location,
    projectType,
    targetAmount,
    totalInvested,
    energyProduced,
    _totalEnergyCost,
    projectOwner,
    isActive,
    isCompleted,
    isFailed,
  ] = projectData;

  const projectTypeNames = ["Solar", "Wind", "Hydro", "Thermal", "Geothermal", "Biomass", "Other"];
  const projectTypeName = projectTypeNames[Number(projectType)] || "Unknown";

  // Extract funding deadline from timeline data
  const [_createdAt, fundingDeadline] = timelineData;

  // Apply filter
  if (filter !== "All" && projectTypeName !== filter) {
    return null;
  }

  return (
    <ProjectCard
      projectId={projectId}
      name={name}
      description={description}
      location={location}
      projectType={projectTypeName}
      targetAmount={targetAmount}
      totalInvested={totalInvested}
      energyProduced={energyProduced}
      projectOwner={projectOwner}
      isActive={isActive}
      isCompleted={isCompleted}
      isFailed={isFailed}
      fundingDeadline={fundingDeadline}
      onInvest={onInvest}
    />
  );
};

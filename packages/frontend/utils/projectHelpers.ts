// Project type helper functions

export const PROJECT_TYPES = ["Solar", "Wind", "Hydro", "Thermal", "Geothermal", "Biomass", "Other"];

export const getProjectTypeName = (typeIndex: number): string => {
  return PROJECT_TYPES[typeIndex] || "Unknown";
};

export const getProjectTypeEmoji = (typeIndex: number): string => {
  const emojis = ["☀️", "💨", "💧", "🔥", "🌋", "🌿", "⚡"];
  return emojis[typeIndex] || "⚡";
};

export const getProjectTypeColor = (typeIndex: number): string => {
  const colors = [
    "badge-warning",   // Solar - yellow
    "badge-info",      // Wind - blue
    "badge-primary",   // Hydro - blue
    "badge-error",     // Thermal - red
    "badge-accent",    // Geothermal - purple
    "badge-success",   // Biomass - green
    "badge-neutral",   // Other - gray
  ];
  return colors[typeIndex] || "badge-neutral";
};

export const formatTimeRemaining = (deadline: bigint): string => {
  const now = Math.floor(Date.now() / 1000);
  const deadlineSeconds = Number(deadline);
  const remaining = deadlineSeconds - now;

  if (remaining <= 0) {
    return "Deadline passed";
  }

  const days = Math.floor(remaining / 86400);
  const hours = Math.floor((remaining % 86400) / 3600);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''} ${hours}h remaining`;
  } else if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''} remaining`;
  } else {
    const minutes = Math.floor(remaining / 60);
    return `${minutes} minute${minutes > 1 ? 's' : ''} remaining`;
  }
};

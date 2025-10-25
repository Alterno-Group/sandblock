"use client";

import type { NextPage } from "next";
import { OwnerDashboard } from "~~/components/energy/OwnerDashboard";

const OwnerPage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <OwnerDashboard />
    </div>
  );
};

export default OwnerPage;

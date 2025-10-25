"use client";

import type { NextPage } from "next";
import { InvestorDashboard } from "~~/components/energy/InvestorDashboard";

const InvestorPage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8">
      <InvestorDashboard />
    </div>
  );
};

export default InvestorPage;

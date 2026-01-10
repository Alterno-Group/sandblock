"use client";

import type { NextPage } from "next";

const AboutUsPage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
      <div className="space-y-12">
        {/* Header Section */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground">About SANDBLŌCK</h1>
          <p className="text-lg text-muted-foreground">
            Democratizing access to renewable energy investments through blockchain technology
          </p>
        </div>

        {/* Mission Section */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Our Mission</h2>
          <p className="text-base md:text-lg leading-relaxed text-foreground">
            SANDBLŌCK is a decentralized application (dApp) designed to revolutionize renewable energy financing. We
            enable individuals and institutions to invest directly in tokenized renewable energy projects using
            cryptocurrency, creating a transparent, efficient, and accessible path to sustainable energy investment.
          </p>
          <p className="text-base md:text-lg leading-relaxed text-foreground">
            By leveraging blockchain technology and smart contracts, we remove intermediaries, reduce costs, and provide
            investors with clear, real-time visibility into their energy project investments and returns.
          </p>
        </div>

        {/* What We Do Section */}
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">What We Do</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card 1: For Investors */}
            <div className="bg-card rounded-lg p-6 border border-card-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">For Investors</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Browse and invest in diverse renewable energy projects</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Earn tiered interest rates from 5% to 9% APY</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Receive weekly interest payments automatically</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Claim annual principal payback over 5 years</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Get automatic refunds if project funding fails</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Track portfolio and returns in real-time</span>
                </li>
              </ul>
            </div>

            {/* Card 2: For Project Owners */}
            <div className="bg-card rounded-lg p-6 border border-card-border">
              <h3 className="text-xl font-semibold text-foreground mb-4">For Project Owners</h3>
              <ul className="space-y-3 text-muted-foreground">
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Create and launch new renewable energy projects</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Classify projects by type (Solar, Wind, Hydro, etc.)</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Set custom funding deadlines up to 1 year</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Monitor real-time funding progress with countdown</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Record energy production with transparent cost tracking</span>
                </li>
                <li className="flex gap-3">
                  <span className="text-primary">✓</span>
                  <span>Manage project milestones and collaborate with admins</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Key Features Section */}
        <div className="space-y-6">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Key Features</h2>

          {/* Interest Rates */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Tiered Interest Rates</h3>
            <p className="text-muted-foreground mb-4">
              We reward commitment with increasing returns based on investment size:
            </p>
            <div className="bg-card rounded-lg border border-card-border overflow-hidden">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-px bg-card-border">
                <div className="bg-card p-4">
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Investment Amount</p>
                  <p className="text-lg font-semibold text-foreground">&lt; $2,000</p>
                </div>
                <div className="bg-card p-4">
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Annual Rate</p>
                  <p className="text-lg font-semibold text-primary">5% APY</p>
                </div>
                <div className="bg-card p-4 hidden md:block">
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Example</p>
                  <p className="text-sm font-semibold text-foreground">$100/year on $2,000</p>
                </div>

                <div className="bg-card p-4">
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Investment Amount</p>
                  <p className="text-lg font-semibold text-foreground">$2K - $20K</p>
                </div>
                <div className="bg-card p-4">
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Annual Rate</p>
                  <p className="text-lg font-semibold text-primary">7% APY</p>
                </div>
                <div className="bg-card p-4 hidden md:block">
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Example</p>
                  <p className="text-sm font-semibold text-foreground">$1,400/year on $20,000</p>
                </div>

                <div className="bg-card p-4">
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Investment Amount</p>
                  <p className="text-lg font-semibold text-foreground">&gt; $20,000</p>
                </div>
                <div className="bg-card p-4">
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Annual Rate</p>
                  <p className="text-lg font-semibold text-primary">9% APY</p>
                </div>
                <div className="bg-card p-4 hidden md:block">
                  <p className="text-sm text-muted-foreground font-semibold mb-2">Example</p>
                  <p className="text-sm font-semibold text-foreground">$1,800/year on $20,000</p>
                </div>
              </div>
            </div>
          </div>

          {/* Payment Schedule */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Payment Schedule</h3>
            <p className="text-muted-foreground mb-4">Investors enjoy consistent, predictable returns:</p>
            <div className="space-y-3">
              <div className="bg-card rounded-lg p-4 border border-card-border">
                <p className="font-semibold text-foreground mb-2">Weekly Interest Payments</p>
                <p className="text-sm text-muted-foreground">
                  Earn interest every 7 days after project construction completion. Interest is calculated based on your
                  investment tier and can be claimed at any time.
                </p>
              </div>
              <div className="bg-card rounded-lg p-4 border border-card-border">
                <p className="font-semibold text-foreground mb-2">Annual Principal Payback</p>
                <p className="text-sm text-muted-foreground">
                  Starting 2 years after funding completion, receive 20% of your original investment annually until
                  fully repaid over 5 years.
                </p>
              </div>
            </div>
          </div>

          {/* Technology */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-foreground">Technology Stack</h3>
            <p className="text-muted-foreground mb-4">Built with cutting-edge web3 and blockchain technologies:</p>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              <div className="bg-card rounded-lg p-3 border border-card-border text-center">
                <p className="text-sm font-semibold text-foreground">Scaffold-ETH 2</p>
                <p className="text-xs text-muted-foreground">Web3 Framework</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-card-border text-center">
                <p className="text-sm font-semibold text-foreground">Next.js</p>
                <p className="text-xs text-muted-foreground">Frontend</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-card-border text-center">
                <p className="text-sm font-semibold text-foreground">Hardhat</p>
                <p className="text-xs text-muted-foreground">Smart Contracts</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-card-border text-center">
                <p className="text-sm font-semibold text-foreground">RainbowKit</p>
                <p className="text-xs text-muted-foreground">Wallet Connection</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-card-border text-center">
                <p className="text-sm font-semibold text-foreground">Wagmi + Viem</p>
                <p className="text-xs text-muted-foreground">Web3 Interaction</p>
              </div>
              <div className="bg-card rounded-lg p-3 border border-card-border text-center">
                <p className="text-sm font-semibold text-foreground">TypeScript</p>
                <p className="text-xs text-muted-foreground">Type Safety</p>
              </div>
            </div>
          </div>
        </div>

        {/* Why Choose Us Section */}
        <div className="space-y-4">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">Why Choose SANDBLŌCK?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12l2 2 4-4m7 0a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Transparent & Decentralized</p>
                <p className="text-sm text-muted-foreground">
                  All transactions and investments are recorded on the blockchain for complete transparency
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Low Costs</p>
                <p className="text-sm text-muted-foreground">
                  Eliminate middlemen and reduce fees through direct peer-to-peer energy project financing
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Attractive Returns</p>
                <p className="text-sm text-muted-foreground">
                  Earn competitive interest rates (5-9% APY) on renewable energy investments
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h.5A2.5 2.5 0 0016 5.5V3.935m0 2a1.964 1.964 0 00-3.5-1.007M16.5 21H4.5A2.5 2.5 0 012 18.5v-13A2.5 2.5 0 014.5 3h15A2.5 2.5 0 0122 5.5v13a2.5 2.5 0 01-2.5 2.5z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Impact Investment</p>
                <p className="text-sm text-muted-foreground">
                  Support renewable energy projects and contribute to a sustainable future
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                    />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Secure & Safe</p>
                <p className="text-sm text-muted-foreground">
                  Smart contract audited and built with security best practices
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0">
                <div className="flex items-center justify-center h-10 w-10 rounded-lg bg-primary/10">
                  <svg className="h-6 w-6 text-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
              </div>
              <div>
                <p className="font-semibold text-foreground mb-1">Real-Time Tracking</p>
                <p className="text-sm text-muted-foreground">
                  Monitor your investments and energy production in real-time on the blockchain
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Vision Section */}
        <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent border border-primary/20 rounded-lg p-6 md:p-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground mb-4">Our Vision</h2>
          <p className="text-base md:text-lg leading-relaxed text-foreground">
            We envision a world where renewable energy projects are funded by a global community of impact investors.
            Through blockchain technology and smart contracts, we're building the infrastructure for a more transparent,
            efficient, and inclusive energy financing ecosystem. SANDBLŌCK is committed to democratizing access to
            sustainable energy investments and accelerating the transition to a clean energy future.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AboutUsPage;

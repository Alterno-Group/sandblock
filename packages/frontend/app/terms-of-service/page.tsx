"use client";

import type { NextPage } from "next";

const TermsOfServicePage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
      <div className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-2">Terms of Service — SANDBLŌCK</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: 26/12/2025</p>

        <p className="text-foreground leading-relaxed mb-6">
          These Terms of Service ("Terms") govern your access to and use of the SANDBLŌCK website and services (the
          "Service"). By accessing or using the Service, you agree to these Terms. If you do not agree, do not use the
          Service.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Service Overview</h2>

        <p className="text-foreground leading-relaxed mb-6">
          SANDBLŌCK provides a software interface that allows users to view project-related information and interact with
          blockchain smart contracts. The Service may include beta or experimental features and may change without notice.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. No Advice; No Guarantees</h2>

        <p className="text-foreground leading-relaxed mb-4">
          SANDBLŌCK does not provide investment, legal, tax, or financial advice.
        </p>

        <p className="text-foreground leading-relaxed mb-4">
          Any information displayed is for general informational purposes only. You are solely responsible for your
          decisions and actions.
        </p>

        <p className="text-foreground leading-relaxed mb-6">
          Nothing in the Service constitutes an offer, solicitation, or recommendation to buy or sell any asset, product,
          or security.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. Eligibility and Compliance</h2>

        <p className="text-foreground leading-relaxed mb-6">
          You represent that you are legally permitted to use the Service in your jurisdiction and will comply with all
          applicable laws and regulations.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Wallets and User Security</h2>

        <p className="text-foreground leading-relaxed mb-4">You are responsible for:</p>

        <ul className="list-disc list-inside mb-6 space-y-2 text-foreground">
          <li>Maintaining the security of your wallet(s), private keys, seed phrases, and devices</li>
          <li>Ensuring transaction details are correct before submitting any on-chain transaction</li>
        </ul>

        <p className="text-foreground leading-relaxed mb-6">
          SANDBLŌCK cannot recover private keys, reverse transactions, or restore lost funds.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Smart Contracts and Blockchain Risks</h2>

        <p className="text-foreground leading-relaxed mb-4">
          Smart contracts may execute automatically. Blockchain transactions are typically irreversible. You acknowledge
          and accept risks including, but not limited to:
        </p>

        <ul className="list-disc list-inside mb-6 space-y-2 text-foreground">
          <li>Network congestion, delays, or failures</li>
          <li>Smart contract vulnerabilities or exploits</li>
          <li>Price volatility, slippage, or market disruption</li>
          <li>Third-party service outages (including on-ramp providers)</li>
          <li>Losses due to user error</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Third-Party Services (On-Ramp / Payment Providers)</h2>

        <p className="text-foreground leading-relaxed mb-6">
          If you use third-party services (including on-ramp providers), those services are provided by independent parties
          under their own terms and policies. SANDBLŌCK is not responsible for third-party services, including their
          availability, pricing, fees, or performance.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Prohibited Use</h2>

        <p className="text-foreground leading-relaxed mb-4">You may not:</p>

        <ul className="list-disc list-inside mb-6 space-y-2 text-foreground">
          <li>Use the Service for illegal, harmful, or abusive activities</li>
          <li>Attempt to interfere with or compromise the Service or its security</li>
          <li>Misrepresent your identity or the purpose of transactions</li>
          <li>Circumvent technical controls or restrictions</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">8. Intellectual Property</h2>

        <p className="text-foreground leading-relaxed mb-6">
          We and our licensors retain all rights to the Service, including software, design, and content, except for
          third-party components and open-source software which remain under their respective licenses.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">9. Disclaimers</h2>

        <p className="text-foreground leading-relaxed mb-6">
          THE SERVICE IS PROVIDED "AS IS" AND "AS AVAILABLE." WE DISCLAIM ALL WARRANTIES TO THE MAXIMUM EXTENT PERMITTED BY
          LAW, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NON-INFRINGEMENT.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">10. Limitation of Liability</h2>

        <p className="text-foreground leading-relaxed mb-6">
          TO THE MAXIMUM EXTENT PERMITTED BY LAW, SANDBLŌCK SHALL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL,
          CONSEQUENTIAL, OR PUNITIVE DAMAGES, OR ANY LOSS OF FUNDS, DATA, PROFITS, OR REVENUE, ARISING OUT OF OR RELATED TO
          YOUR USE OF THE SERVICE.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">11. Changes to the Service and Terms</h2>

        <p className="text-foreground leading-relaxed mb-6">
          We may update the Service or these Terms at any time. Continued use of the Service after updates means you accept
          the revised Terms.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">12. Governing Law</h2>

        <p className="text-foreground leading-relaxed mb-6">
          These Terms are governed by the laws of the applicable jurisdiction without regard to conflict-of-law rules.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">13. Contact</h2>

        <p className="text-foreground leading-relaxed mb-6">Support or legal notices: [Contact information to be added]</p>
      </div>
    </div>
  );
};

export default TermsOfServicePage;

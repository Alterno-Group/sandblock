"use client";

import type { NextPage } from "next";

const PrivacyPolicyPage: NextPage = () => {
  return (
    <div className="container mx-auto px-4 md:px-6 py-8 md:py-12 max-w-4xl">
      <div className="prose prose-invert max-w-none">
        <h1 className="text-4xl font-bold mb-2">Privacy Policy — SANDBLŌCK</h1>
        <p className="text-muted-foreground text-sm mb-8">Last updated: 26/12/2025</p>

        <p className="text-foreground leading-relaxed mb-6">
          SANDBLŌCK ("SANDBLŌCK", "we", "us") provides a web application that allows users to view project information
          and interact with blockchain-based smart contracts. This Privacy Policy explains how we collect, use, and share
          information when you use our website and services (the "Service").
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">1. Information We Collect</h2>

        <p className="text-foreground leading-relaxed mb-4">
          We collect only the information reasonably necessary to operate and improve the Service:
        </p>

        <h3 className="text-xl font-semibold mt-6 mb-3">A) Information you provide</h3>
        <ul className="list-disc list-inside mb-6 space-y-2 text-foreground">
          <li>Contact details you submit (e.g., email) when you request support or updates.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">B) Blockchain information</h3>
        <ul className="list-disc list-inside mb-6 space-y-2 text-foreground">
          <li>Public blockchain addresses and transaction data you submit or generate when interacting with smart contracts.</li>
          <li className="text-muted-foreground italic">Note: Blockchain data is public and may be accessible to anyone.</li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">C) Technical and usage information</h3>
        <ul className="list-disc list-inside mb-6 space-y-2 text-foreground">
          <li>
            Device and browser information, IP address, approximate location (city/country level), log data, and usage
            analytics (e.g., pages visited, actions taken).
          </li>
        </ul>

        <h3 className="text-xl font-semibold mt-6 mb-3">D) Cookies and similar technologies</h3>
        <ul className="list-disc list-inside mb-6 space-y-2 text-foreground">
          <li>We may use cookies or similar tools for basic functionality, security, and analytics.</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">2. How We Use Information</h2>

        <p className="text-foreground leading-relaxed mb-4">We use information to:</p>

        <ul className="list-disc list-inside mb-6 space-y-2 text-foreground">
          <li>Provide, maintain, and secure the Service</li>
          <li>Enable smart contract interactions and display relevant on-chain information</li>
          <li>Monitor performance, troubleshoot, and improve user experience</li>
          <li>Communicate with you regarding support requests or important service updates</li>
          <li>Prevent fraud, abuse, and security incidents</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">3. How We Share Information</h2>

        <p className="text-foreground leading-relaxed mb-4">We do not sell your personal information.</p>

        <p className="text-foreground leading-relaxed mb-4">We may share information with:</p>

        <ul className="list-disc list-inside mb-6 space-y-2 text-foreground">
          <li>
            <strong>Service providers</strong> (e.g., hosting, analytics) strictly for operating the Service
          </li>
          <li>
            <strong>Payment/on-ramp providers</strong> you choose to use, to facilitate transactions (subject to their own
            policies)
          </li>
          <li>
            <strong>Legal and safety:</strong> if required by law, regulation, or valid legal process, or to protect rights,
            safety, and security
          </li>
        </ul>

        <h2 className="text-2xl font-bold mt-8 mb-4">4. Data Retention</h2>

        <p className="text-foreground leading-relaxed mb-6">
          We retain information only for as long as necessary for the purposes described above, unless a longer retention
          period is required by law or needed for legitimate business purposes (e.g., security, dispute resolution).
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">5. Security</h2>

        <p className="text-foreground leading-relaxed mb-6">
          We use reasonable administrative, technical, and organizational safeguards. However, no online service is
          completely secure, and you use the Service at your own risk.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">6. Your Choices</h2>

        <p className="text-foreground leading-relaxed mb-6">
          Depending on your jurisdiction, you may have rights to access, correct, or delete certain information. Note that
          we cannot delete or modify data recorded on a public blockchain.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">7. Third-Party Services</h2>

        <p className="text-foreground leading-relaxed mb-6">
          The Service may link to third-party websites or services (including on-ramp providers). Their privacy practices
          are governed by their own policies, not ours.
        </p>

        <h2 className="text-2xl font-bold mt-8 mb-4">8. International Users</h2>

        <p className="text-foreground leading-relaxed mb-6">
          Your information may be processed in countries where we or our service providers operate. We take steps to protect
          data consistent with this Policy.
        </p>
      </div>
    </div>
  );
};

export default PrivacyPolicyPage;

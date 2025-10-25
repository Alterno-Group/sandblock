"use client";

import { useState } from "react";
import { useNetwork } from "wagmi";
import { hardhat } from "viem/chains";
import { useScaffoldContractWrite } from "~~/hooks/scaffold-eth";

/**
 * USDTFaucetButton button which lets you grab mock USDT tokens (10,000 USDT per call).
 */
export const USDTFaucetButton = () => {
  const { chain: ConnectedChain } = useNetwork();
  const [loading, setLoading] = useState(false);

  const { writeAsync: callFaucet } = useScaffoldContractWrite({
    contractName: "MockUSDT",
    functionName: "faucet",
  });

  const getUSDT = async () => {
    try {
      setLoading(true);
      await callFaucet();
      setLoading(false);
    } catch (error) {
      console.error("⚡️ ~ file: USDTFaucetButton.tsx:getUSDT ~ error", error);
      setLoading(false);
    }
  };

  // Render only on local chain
  if (ConnectedChain?.id !== hardhat.id) {
    return null;
  }

  return (
    <button
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 bg-secondary text-secondary-foreground hover:bg-secondary/80 h-10 px-4 py-2 gap-2"
      onClick={getUSDT}
      disabled={loading}
      title="Get 10,000 mock USDT tokens"
    >
      {!loading ? (
        <>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-4 w-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>USDT Faucet</span>
        </>
      ) : (
        <>
          <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
          <span>Minting...</span>
        </>
      )}
    </button>
  );
};

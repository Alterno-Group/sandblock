"use client";

import { useState } from "react";
import { useAccount } from "wagmi";

interface MoonPayWidgetProps {
  amount?: number; // Amount in USD
  onSuccess?: () => void;
  onClose?: () => void;
}

/**
 * MoonPay On-Ramp Widget
 * Allows users to buy USDT with fiat currency
 *
 * Setup:
 * 1. Sign up at https://www.moonpay.com/
 * 2. Get your API key
 * 3. Add MOONPAY_API_KEY to .env.local
 */
export const MoonPayWidget = ({ amount }: MoonPayWidgetProps) => {
  const { address } = useAccount();
  const [isOpen, setIsOpen] = useState(false);

  // Replace with your actual MoonPay publishable API key
  const MOONPAY_API_KEY = process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "pk_test_YOUR_KEY_HERE";

  const openMoonPay = () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    // MoonPay URL parameters
    const params = new URLSearchParams({
      apiKey: MOONPAY_API_KEY,
      currencyCode: "USDT", // Buy USDT
      walletAddress: address, // User's wallet address
      baseCurrencyCode: "usd", // Pay with USD
      colorCode: "#3b82f6", // Your brand color
      ...(amount && { baseCurrencyAmount: amount.toString() }), // Pre-fill amount
    });

    // Open MoonPay widget
    const moonPayUrl = `https://buy.moonpay.com?${params.toString()}`;
    window.open(moonPayUrl, "MoonPay", "width=500,height=700");

    setIsOpen(true);
  };

  return (
    <div>
      <button
        onClick={openMoonPay}
        className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
      >
        💳 Buy USDT with Card
      </button>

      {isOpen && (
        <div className="mt-4 p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            MoonPay window opened. Complete the purchase to receive USDT in your wallet.
          </p>
        </div>
      )}
    </div>
  );
};

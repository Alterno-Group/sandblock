"use client";

import { useAccount } from "wagmi";

interface OnRampWidgetProps {
  amount?: number; // Amount in fiat currency
  onClose?: () => void;
  onSuccess?: (data: any) => void;
  fiatType?: "1" | "2" | "3" | "4" | "5" | "6"; // 1=INR, 2=TRY, 3=AED, 4=MXN, 5=VND, 6=NGN
  paymentMethod?: "1" | "2"; // 1 = instant, 2 = bank transfer
  phoneNumber?: string;
  redirectUrl?: string;
  language?: "en" | "vi" | "es" | "tr" | "pt" | "fil" | "th" | "sw" | "id";
  coinCode?: string; // usdt, usdc, busd, eth, bnb, matic, sol
  network?: string; // bep20, matic20, erc20, trc20
}

/**
 * OnRamp Widget - Native on-ramp provider
 * Provides direct integration with onramp.money for cryptocurrency purchases
 *
 * Setup:
 * 1. Sign up at https://onramp.money/
 * 2. Get your appId
 * 3. Add NEXT_PUBLIC_ONRAMP_APP_ID to .env.local
 */
export const OnRampWidget = ({
  amount,
  onClose,
  onSuccess,
  fiatType = "1", // Default to INR
  paymentMethod,
  phoneNumber,
  redirectUrl,
  language = "en",
  coinCode = "usdt",
  network = "erc20",
}: OnRampWidgetProps) => {
  const { address } = useAccount();

  // Get appId from environment variables
  const ONRAMP_APP_ID = process.env.NEXT_PUBLIC_ONRAMP_APP_ID || "";
  const ONRAMP_URL = process.env.NEXT_PUBLIC_ONRAMP_URL || "https://onramp.money/main/buy";

  const openOnRamp = () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    if (!ONRAMP_APP_ID) {
      alert("OnRamp not configured. Please add NEXT_PUBLIC_ONRAMP_APP_ID to environment variables.");
      return;
    }

    const params = new URLSearchParams({
      appId: ONRAMP_APP_ID,
      walletAddress: address,
      coinCode: coinCode,
      network: network,
      fiatType: fiatType,
      lang: language,
      ...(amount && { fiatAmount: amount.toString() }),
      ...(paymentMethod && { paymentMethod }),
      ...(phoneNumber && { phoneNumber: encodeURIComponent(phoneNumber) }),
      ...(redirectUrl && { redirectUrl }),
    });

    // Open OnRamp in a popup window
    window.open(`${ONRAMP_URL}/?${params.toString()}`, "OnRamp", "width=500,height=700");
  };

  return (
    <button
      onClick={openOnRamp}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
    >
      💵 Buy USDT (OnRamp)
    </button>
  );
};

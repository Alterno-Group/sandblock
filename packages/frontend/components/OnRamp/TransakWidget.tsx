"use client";

import { useAccount } from "wagmi";

interface TransakWidgetProps {
  amount?: number;
  onClose?: () => void;
  onSuccess?: (data: any) => void;
}

/**
 * Transak On-Ramp Widget
 * Alternative to MoonPay with good global coverage
 *
 * Setup:
 * 1. Sign up at https://transak.com/
 * 2. Get your API key
 * 3. Add TRANSAK_API_KEY to .env.local
 * 4. Install: npm install @transak/transak-sdk
 */
export const TransakWidget = ({ amount, onClose, onSuccess }: TransakWidgetProps) => {
  const { address } = useAccount();

  // Replace with your Transak API key
  const TRANSAK_API_KEY = process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "YOUR_API_KEY_HERE";

  const openTransak = () => {
    if (!address) {
      alert("Please connect your wallet first");
      return;
    }

    // Load Transak SDK dynamically
    const script = document.createElement("script");
    script.src = "https://global.transak.com/sdk/v1.0.0/transak-sdk.js";
    script.async = true;
    script.onload = () => {
      // @ts-ignore
      const transak = new window.Transak({
        apiKey: TRANSAK_API_KEY,
        environment: "STAGING", // Change to 'PRODUCTION' for mainnet
        defaultCryptoCurrency: "USDT",
        walletAddress: address,
        fiatCurrency: "USD",
        fiatAmount: amount || 100,
        network: "ethereum", // or your network
        cryptoCurrencyList: "USDT",
        disableWalletAddressForm: true,
        themeColor: "3b82f6",
      });

      transak.init();

      // Listen for events
      // @ts-ignore
      transak.on(transak.EVENTS.TRANSAK_ORDER_SUCCESSFUL, orderData => {
        console.log("Order successful:", orderData);
        onSuccess?.(orderData);
        transak.close();
      });

      // @ts-ignore
      transak.on(transak.EVENTS.TRANSAK_WIDGET_CLOSE, () => {
        console.log("Widget closed");
        onClose?.();
      });
    };

    document.body.appendChild(script);
  };

  return (
    <button
      onClick={openTransak}
      className="inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2"
    >
      💳 Buy USDT (Transak)
    </button>
  );
};

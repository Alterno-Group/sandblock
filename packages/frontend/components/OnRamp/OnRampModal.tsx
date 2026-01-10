"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAccount } from "wagmi";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface OnRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAmount?: bigint; // Amount needed in USDT (6 decimals)
  // Additional OnRamp options from documentation
  redirectUrl?: string; // URL for post-transaction redirection
  phoneNumber?: string; // User's phone number
  paymentMethod?: "1" | "2"; // 1 = instant (UPI), 2 = bank transfer
  fiatType?: "1" | "2" | "3" | "4" | "5" | "6"; // 1=INR, 2=TRY, 3=AED, 4=MXN, 5=VND, 6=NGN
  fiatAmount?: number; // Amount in fiat currency
  merchantRecognitionId?: string; // Custom identifier for tracking
  language?: "en" | "vi" | "es" | "tr" | "pt" | "fil" | "th" | "sw" | "id"; // Language preference
  coinAmount?: number; // Amount in native cryptocurrency
  coinCode?: string; // Cryptocurrency code for OnRamp (usdt, usdc, eth, etc.)
  network?: string; // Blockchain network for OnRamp (erc20, matic20, etc.)
}

/**
 * On-Ramp Modal Component
 * Provides multiple options for users to buy USDT
 */
export const OnRampModal = ({
  isOpen,
  onClose,
  targetAmount,
  redirectUrl,
  phoneNumber,
  paymentMethod,
  fiatType,
  fiatAmount,
  merchantRecognitionId,
  language = "en",
  coinAmount,
  coinCode = "usdt",
  network = "erc20",
}: OnRampModalProps) => {
  const { address } = useAccount();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    if (isOpen) {
      document.body.style.overflow = "hidden";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen]);

  const formatUSDT = (amount: bigint) => {
    return (Number(amount) / 1e6).toFixed(2);
  };

  // Environment variables for API keys
  const MOONPAY_KEY = process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "";
  const MOONPAY_URL = process.env.NEXT_PUBLIC_MOONPAY_API_URL || "https://buy.moonpay.com";
  const TRANSAK_KEY = process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "";
  const TRANSAK_URL = process.env.NEXT_PUBLIC_TRANSAK_API_URL || "https://global.transak.com";
  const ONRAMP_APP_ID = process.env.NEXT_PUBLIC_ONRAMP_APP_ID || "1";
  const ONRAMP_URL = process.env.NEXT_PUBLIC_ONRAMP_URL || "https://onramp.money/main/buy";
  const isTestMode = process.env.NEXT_PUBLIC_TEST_MODE || false;

  const openMoonPay = () => {
    if (!address) return;

    const params = new URLSearchParams({
      apiKey: MOONPAY_KEY,
      currencyCode: "usdt",
      walletAddress: address,
      baseCurrencyCode: "usd",
      colorCode: "3b82f6",
      ...(targetAmount && { baseCurrencyAmount: (Number(targetAmount) / 1e6).toString() }),
      ...(fiatAmount && { baseCurrencyAmount: fiatAmount.toString() }),
      ...(coinAmount && { cryptoAmount: coinAmount.toString() }),
      ...(redirectUrl && { redirectUrl }),
      ...(phoneNumber && { phoneNumber: encodeURIComponent(phoneNumber) }),
      ...(merchantRecognitionId && { merchantRecognitionId }),
      ...(language && language !== "en" && { lang: language }),
    });

    window.open(`${MOONPAY_URL}?${params.toString()}`, "MoonPay", "width=500,height=700");
  };

  const openTransak = () => {
    if (!address) return;

    // Map fiat type codes to currency codes for Transak
    const fiatTypeMap: Record<string, string> = {
      "1": "INR",
      "2": "TRY",
      "3": "AED",
      "4": "MXN",
      "5": "VND",
      "6": "NGN",
    };

    const params = new URLSearchParams({
      apiKey: TRANSAK_KEY,
      environment: isTestMode ? "staging" : "production",
      defaultCryptoCurrency: "USDT",
      walletAddress: address,
      fiatCurrency: fiatType ? fiatTypeMap[fiatType] || "USD" : "USD",
      network: "ethereum",
      disableWalletAddressForm: "true",
      countryCode: "VN",
      ...(targetAmount && { fiatAmount: (Number(targetAmount) / 1e6).toString() }),
      ...(fiatAmount && { fiatAmount: fiatAmount.toString() }),
      ...(coinAmount && { cryptoAmount: coinAmount.toString() }),
      ...(redirectUrl && { redirectUrl }),
      ...(phoneNumber && { phoneNumber: encodeURIComponent(phoneNumber) }),
      ...(merchantRecognitionId && { merchantRecognitionId }),
      ...(language && language !== "en" && { lang: language }),
      ...(paymentMethod && { paymentMethod }),
    });

    window.open(`${TRANSAK_URL}?${params.toString()}`, "Transak", "width=500,height=700");
  };

  const openOnRamp = () => {
    if (!address) return;

    const params = new URLSearchParams({
      appId: ONRAMP_APP_ID,
      walletAddress: address,
      coinCode: coinCode,
      network: network,
      ...(targetAmount && { fiatAmount: (Number(targetAmount) / 1e6).toString() }),
      ...(fiatAmount && { fiatAmount: fiatAmount.toString() }),
      ...(fiatType && { fiatType }),
      ...(phoneNumber && { phoneNumber: encodeURIComponent(phoneNumber) }),
      ...(redirectUrl && { redirectUrl }),
      ...(language && language !== "en" && { lang: language }),
      ...(paymentMethod && { paymentMethod }),
    });

    window.open(`${ONRAMP_URL}/?${params.toString()}`, "OnRamp", "width=500,height=700");
  };

  if (!isOpen || !mounted) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[100000] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-md bg-card rounded-lg shadow-lg border border-card-border max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="text-2xl font-bold text-foreground">Buy USDT</h2>
          <button onClick={onClose} className="rounded-md p-1 hover:bg-accent transition-colors" aria-label="Close">
            <XMarkIcon className="h-6 w-6" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-4">
          {!address && (
            <div className="bg-yellow-500/10 border border-yellow-500/20 rounded-lg p-4">
              <p className="text-sm text-yellow-600 dark:text-yellow-400">
                ⚠️ Please connect your wallet first to buy USDT
              </p>
            </div>
          )}

          {targetAmount && targetAmount > 0n ? (
            <div className="bg-muted rounded-lg p-4">
              <div className="text-sm text-muted-foreground mb-1">Amount Needed</div>
              <div className="text-2xl font-bold text-foreground">${formatUSDT(targetAmount)} USDT</div>
            </div>
          ) : null}

          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Choose a payment provider to buy USDT with your credit card or bank account:
            </p>

            {/* OnRamp Option */}
            <button
              onClick={openOnRamp}
              disabled={!address || !ONRAMP_APP_ID}
              className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <Image
                  src="https://play-lh.googleusercontent.com/uJBE811pIPaLL__Ej2h8_B0M1ytmCjY2CSiIVruVvbxBcm7Yb_TRMUPZGGHl8M0fE1a6"
                  alt="OnRamp"
                  width={48}
                  height={48}
                  className="rounded-full object-cover"
                />
                <div className="text-left">
                  <div className="font-semibold">OnRamp</div>
                  <div className="text-xs text-muted-foreground">Simple & Direct • 100+ countries</div>
                </div>
              </div>
              <div className="text-primary">→</div>
            </button>

            {/* MoonPay Option */}
            <button
              onClick={openMoonPay}
              disabled={!address || !MOONPAY_KEY}
              className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">🌙</div>
                <div className="text-left">
                  <div className="font-semibold">MoonPay</div>
                  <div className="text-xs text-muted-foreground">Fast & Easy • 160+ countries</div>
                </div>
              </div>
              <div className="text-primary">→</div>
            </button>

            {/* Transak Option */}
            <button
              onClick={openTransak}
              disabled={!address || !TRANSAK_KEY}
              className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">💳</div>
                <div className="text-left">
                  <div className="font-semibold">Transak</div>
                  <div className="text-xs text-muted-foreground">Low fees • Global coverage</div>
                </div>
              </div>
              <div className="text-primary">→</div>
            </button>

          </div>

          {/* Info */}
          <div className="bg-muted rounded-lg p-4 text-sm text-muted-foreground">
            <p className="font-semibold mb-2">How it works:</p>
            <ol className="list-decimal list-inside space-y-1">
              <li>Choose a payment provider</li>
              <li>Complete identity verification (KYC)</li>
              <li>Pay with credit card or bank transfer</li>
              <li>USDT will be sent directly to your wallet</li>
            </ol>
          </div>

          {/* No API Keys Warning */}
          {!MOONPAY_KEY && !TRANSAK_KEY && !ONRAMP_APP_ID && (
            <div className="bg-red-500/10 border border-red-500/20 rounded-lg p-4">
              <p className="text-sm text-red-600 dark:text-red-400">
                ⚠️ On-ramp providers not configured. Please add API keys to environment variables.
              </p>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-border">
          <button
            onClick={onClose}
            className="w-full inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring border border-input bg-background hover:bg-accent hover:text-accent-foreground h-10 px-4 py-2"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>,
    document.body,
  );
};

"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useAccount } from "wagmi";
import { XMarkIcon } from "@heroicons/react/24/outline";

interface OnRampModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetAmount?: bigint; // Amount needed in USDT (6 decimals)
}

/**
 * On-Ramp Modal Component
 * Provides multiple options for users to buy USDT
 */
export const OnRampModal = ({ isOpen, onClose, targetAmount }: OnRampModalProps) => {
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

  const amountUSD = targetAmount ? parseFloat(formatUSDT(targetAmount)) : 100;

  // Environment variables for API keys
  const MOONPAY_KEY = process.env.NEXT_PUBLIC_MOONPAY_API_KEY || "";
  const TRANSAK_KEY = process.env.NEXT_PUBLIC_TRANSAK_API_KEY || "";

  const openMoonPay = () => {
    if (!address) return;

    const params = new URLSearchParams({
      apiKey: MOONPAY_KEY,
      currencyCode: "USDT",
      walletAddress: address,
      baseCurrencyCode: "usd",
      baseCurrencyAmount: amountUSD.toString(),
      colorCode: "3b82f6",
    });

    window.open(`https://buy.moonpay.com?${params.toString()}`, "MoonPay", "width=500,height=700");
  };

  const openTransak = () => {
    if (!address) return;

    const params = new URLSearchParams({
      apiKey: TRANSAK_KEY,
      defaultCryptoCurrency: "USDT",
      walletAddress: address,
      fiatCurrency: "USD",
      fiatAmount: amountUSD.toString(),
      network: "ethereum",
      disableWalletAddressForm: "true",
    });

    window.open(`https://global.transak.com/?${params.toString()}`, "Transak", "width=500,height=700");
  };

  const openRamp = () => {
    if (!address) return;

    window.open(
      `https://buy.ramp.network/?hostApiKey=${
        process.env.NEXT_PUBLIC_RAMP_API_KEY || ""
      }&userAddress=${address}&swapAsset=USDT&fiatValue=${amountUSD}&fiatCurrency=USD`,
      "Ramp",
      "width=500,height=700",
    );
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

            {/* Ramp Option */}
            <button
              onClick={openRamp}
              disabled={!address}
              className="w-full flex items-center justify-between p-4 border border-border rounded-lg hover:bg-accent transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">🚀</div>
                <div className="text-left">
                  <div className="font-semibold">Ramp Network</div>
                  <div className="text-xs text-muted-foreground">Fast KYC • Europe-friendly</div>
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
          {!MOONPAY_KEY && !TRANSAK_KEY && (
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

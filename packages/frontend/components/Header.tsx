"use client";

import React from "react";
import Link from "next/link";
import { RainbowKitCustomConnectButton } from "~~/components/scaffold-eth";
import { SwitchTheme } from "~~/components/SwitchTheme";

export const Header = () => {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/80">
      <div className="container mx-auto px-3 sm:px-4 md:px-6">
        <div className="flex h-14 sm:h-16 items-center justify-between gap-2">
          <Link href="/" className="flex items-center gap-2 sm:gap-2.5 hover:opacity-80 transition-opacity min-w-0">
            <div className="flex items-center justify-center h-9 w-9 sm:h-10 sm:w-10 rounded-lg bg-primary text-primary-foreground flex-shrink-0">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5 sm:h-6 sm:w-6"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2.5}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 10V3L4 14h7v7l9-11h-7z"
                />
              </svg>
            </div>
            <div className="min-w-0 flex-col justify-center hidden md:flex">
              <h1 className="font-bold text-base lg:text-lg text-foreground leading-none mb-0.5">SandBlock</h1>
              <p className="text-xs text-muted-foreground leading-none">Tokenized Energy Projects</p>
            </div>
          </Link>

          <div className="flex items-center gap-1 sm:gap-2">
            <SwitchTheme />
            <RainbowKitCustomConnectButton />
          </div>
        </div>
      </div>
    </header>
  );
};

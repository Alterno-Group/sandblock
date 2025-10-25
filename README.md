# SandBlock - Tokenized Energy Investment Platform

A decentralized application (dApp) for investing in renewable energy projects using cryptocurrency (USDT), with tiered interest rates and scheduled principal payback.

Built with Scaffold-ETH 2 using NextJS, RainbowKit, Hardhat, Wagmi, Viem, and TypeScript.

## Overview

SandBlock enables users to invest in tokenized renewable energy projects and earn returns. The platform features:

- **Tiered Interest Rates**: 5-9% APY based on investment amount
- **Weekly Interest Payments**: Paid every 7 days after project completion
- **Principal Payback**: 20% annually, starting 2 years after funding completion
- **Transparent Energy Tracking**: On-chain energy production records

## Interest Rate Tiers

| Investment Amount | Annual Interest Rate |
|-------------------|---------------------|
| < $2,000 USDT     | 5% APY             |
| $2,000 - $20,000  | 7% APY             |
| > $20,000         | 9% APY             |

## Payment Schedule

### Interest Payments
- **Frequency**: Weekly (every 7 days)
- **Start**: After project construction completion
- **Calculation**: Remaining principal × interest rate / 52

### Principal Payback
- **Frequency**: Annually
- **Start**: 2 years after target funding reached
- **Amount**: 20% of original investment per year
- **Duration**: 5 years to return 100% of principal

## Features

### For Investors
- Browse and invest in energy projects by type (Solar, Wind, Hydro, etc.)
- View funding deadlines and time remaining
- Claim weekly interest payments
- Claim annual principal payback
- **Get automatic refunds** if project funding fails
- Track portfolio and returns

### For Project Owners
- Create new energy projects with type classification
- Set funding deadline (up to 1 year)
- Monitor funding progress with countdown
- Record energy production with costs
- Manage project milestones

## Smart Contracts

### SandBlock
Main contract managing projects and investments.

**Key Functions:**
- `createProject()` - Create new energy project with type and deadline
- `investInProject()` - Invest USDT in a project (checks deadline)
- `markFundingFailed()` - Mark project as failed after deadline
- `claimRefund()` - Get refund for failed project funding
- `completeConstruction()` - Mark construction complete
- `recordEnergyProduction()` - Log energy with costs
- `claimInterest()` - Claim weekly interest
- `claimPrincipal()` - Claim annual principal
- `addAdmin()` / `removeAdmin()` - Manage project administrators

**Project Types:**
- Solar ☀️, Wind 💨, Hydro 💧, Thermal 🔥, Geothermal 🌋, Biomass 🌿, Other ⚡

**Features:**
- Admin management system for multiple project managers
- Project filtering by type and status
- Automatic funding deadline tracking
- Wallet connection protection for investor/owner pages

### MockUSDT
ERC-20 token simulating USDT (6 decimals) for testing.

## Requirements

- [Node (>= v18.17)](https://nodejs.org/en/download/)
- [Yarn](https://yarnpkg.com/) v1 or v2+
- [Git](https://git-scm.com/)

## Getting Started

1. Install dependencies:
```bash
yarn install
```

2. Set up environment:
```bash
cd packages/hardhat
cp .env.example .env
# Add DEPLOYER_PRIVATE_KEY to .env
```

3. Start local blockchain:
```bash
yarn chain
```

4. Deploy contracts (new terminal):
```bash
yarn deploy
```

5. Start frontend (new terminal):
```bash
yarn start
```

6. Open http://localhost:3000

## Project Structure

```
SandBlock/
├── packages/
│   ├── hardhat/                    # Smart contracts
│   │   ├── contracts/
│   │   │   ├── SandBlock.sol      # Main platform contract
│   │   │   └── MockUSDT.sol       # Test USDT token
│   │   ├── deploy/
│   │   └── test/
│   └── frontend/                   # Next.js app
│       ├── app/
│       │   ├── page.tsx           # Project list
│       │   ├── investor/          # Investor dashboard
│       │   └── owner/             # Owner dashboard
│       └── components/energy/
```

## Usage Guide

### Create a Project
1. Go to "My Projects" (/owner)
2. Click "Create New Project"
3. Fill in details and target amount
4. Submit transaction

### Invest in a Project
1. Browse projects on home page
2. Click "Invest in Project"
3. Get test USDT from faucet
4. Enter amount and invest

### Manage Project (Owner)
1. Mark construction complete when ready
2. Record energy production regularly
3. Investors can claim returns

### Claim Returns (Investor)
1. Go to "My Investments" (/investor)
2. View available returns
3. Claim interest (weekly)
4. Claim principal (after 2 years)

## Deployment

Deploy to testnet:
```bash
yarn deploy --network liskSepolia
```

Verify contracts:
```bash
yarn hardhat-verify --network liskSepolia
```

## Tech Stack

- Solidity ^0.8.0
- Next.js 14, React, TypeScript
- Wagmi, Viem, RainbowKit
- Tailwind CSS, DaisyUI
- Hardhat, Scaffold-ETH 2

## License

MIT
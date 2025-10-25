# SandBlock - Change Log

## What's New

This is a complete rebuild of the SandBlock platform, transforming it from a basic token/NFT practice project into a comprehensive **Tokenized Energy Investment Platform**.

## Major Changes

### Smart Contracts

#### New Contracts
- **EnergyProjectHub.sol** - Main platform contract with:
  - Project creation and management
  - Tiered interest rates (5%, 7%, 9% APY)
  - Weekly interest payments
  - Annual principal payback (20%/year starting 2 years after funding)
  - Energy production tracking with costs
  - ReentrancyGuard security

- **MockUSDT.sol** - Testing USDT token with:
  - 6 decimals (matching real USDT)
  - Faucet function for easy testing
  - Mint function for flexibility

#### Removed Contracts
- ❌ SandBlockToken.sol (basic ERC-20)
- ❌ SandBlockNFT.sol (basic ERC-721)

### Frontend

#### New Pages
- ✅ **Home** (`/`) - Browse all energy projects
- ✅ **My Investments** (`/investor`) - Investment dashboard with claims
- ✅ **My Projects** (`/owner`) - Project owner dashboard

#### New Components
- `ProjectList` - Display all energy projects
- `ProjectCard` - Individual project card with stats
- `InvestmentModal` - Investment interface with tier calculator
- `InvestorDashboard` - View investments and claim returns
- `OwnerDashboard` - Create projects and record energy

#### Removed Pages
- ❌ Events page
- ❌ Debug Contracts page
- ❌ Block Explorer page

#### Removed Components
- ❌ TokenBalance
- ❌ TokenTransfer
- ❌ NFTCollection

### Navigation

Updated header menu:
- Home
- My Investments
- My Projects

### Package Structure

- Renamed `packages/nextjs` → `packages/frontend`
- Updated all workspace references in package.json files

## Technical Improvements

### Compilation
- Added `viaIR: true` to Hardhat config to handle complex contracts
- Fixed "Stack too deep" errors by optimizing function returns
- Split large getter functions for better gas efficiency

### Deployment
- Updated deployment scripts for new contracts
- Fixed TypeScript ABI generation path
- Automatic contract address injection to frontend

## Features

### Investment System

**Tiered Interest Rates:**
| Amount | Rate |
|--------|------|
| < $2,000 | 5% APY |
| $2,000 - $20,000 | 7% APY |
| > $20,000 | 9% APY |

**Payment Schedule:**
- Weekly interest payments (every 7 days)
- Annual principal payback (20% per year)
- Principal payback starts 2 years after funding completion

### Project Lifecycle

1. **Creation** - Owner creates project with target amount
2. **Funding** - Investors contribute USDT
3. **Construction** - Owner marks as complete when ready
4. **Production** - Energy production tracked on-chain
5. **Returns** - Investors claim interest and principal

## Breaking Changes

⚠️ **This is a complete rewrite. Previous contracts are not compatible.**

If migrating from the old version:
1. Deploy new contracts
2. Update frontend dependencies
3. Clear browser cache and reconnect wallet

## Migration Guide

### For Developers

```bash
# 1. Pull latest code
git pull

# 2. Install dependencies
yarn install

# 3. Compile new contracts
yarn compile

# 4. Deploy
yarn deploy

# 5. Start frontend
yarn start
```

### For Users

1. Switch to the correct network
2. Reconnect your wallet
3. Use the USDT faucet to get test tokens
4. Start creating projects or investing!

## Documentation

- [README.md](README.md) - Full documentation
- [QUICKSTART.md](QUICKSTART.md) - Quick start guide
- Smart contract comments inline

## Future Enhancements

Planned features:
- Energy production verification via oracles
- NFT certificates for investments
- Secondary market for investment positions
- Governance token
- Multi-currency support
- Project milestones with escrow
- Carbon credit tokenization

## Contributors

Built with Scaffold-ETH 2 framework and powered by renewable energy! 🌞⚡

---

**Version:** 2.0.0
**Date:** October 2024
**License:** MIT

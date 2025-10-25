# SandBlock Quick Start Guide

## Prerequisites

- Node.js >= v18.17
- Yarn package manager
- Git

## Installation & Setup

### 1. Install Dependencies

```bash
yarn install
```

This will install all dependencies for both the hardhat and frontend packages.

### 2. Start Local Blockchain

Open a terminal and run:

```bash
yarn chain
```

Keep this terminal running. This starts a local Hardhat network on `http://localhost:8545`.

### 3. Deploy Smart Contracts

Open a **new terminal** and run:

```bash
yarn deploy
```

You should see output like:
```
deploying "MockUSDT"...: deployed at 0x5FbDB2315678afecb367f032d93F642f64180aa3
deploying "EnergyProjectHub"...: deployed at 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

### 4. Start Frontend

In the same terminal (or a **new terminal**), run:

```bash
yarn start
```

The frontend will be available at: **http://localhost:3000**

## Using the Application

### Getting Test USDT

1. Connect your wallet (MetaMask recommended)
2. Switch to the local network (Hardhat, usually auto-detected)
3. When investing, click "Get 10,000 USDT from Faucet" to receive test tokens

### As a Project Owner

1. Navigate to **"My Projects"** page (`/owner`)
2. Click **"Create New Project"**
3. Fill in:
   - Project name
   - Description
   - Location
   - Target funding amount (in USDT)
4. Submit the transaction
5. Once funding is complete, mark **"Complete Construction"**
6. Record energy production regularly

### As an Investor

1. Browse projects on the **Home page**
2. Click **"Invest in Project"** on any active project
3. Get test USDT from faucet
4. Enter investment amount
5. Check your interest rate tier:
   - < $2,000: 5% APY
   - $2,000 - $20,000: 7% APY
   - > $20,000: 9% APY
6. Approve USDT spending
7. Complete investment

### Claiming Returns

1. Navigate to **"My Investments"** page (`/investor`)
2. View your investments and available returns
3. **Claim Interest**: Available weekly after project completion
4. **Claim Principal**: 20% per year, starts 2 years after funding completion

## Important Notes

### Interest Rate Tiers

Your interest rate is determined by your **individual investment amount**:

- **Tier 1** (< $2,000): 5% Annual Interest
- **Tier 2** ($2,000 - $20,000): 7% Annual Interest
- **Tier 3** (> $20,000): 9% Annual Interest

### Payment Schedule

**Weekly Interest:**
- Paid every 7 days (1 week)
- Starts after project construction completion
- Calculated as: `(Principal × Rate) / (10000 × 52)`

**Principal Payback:**
- Starts 2 years after funding target reached
- 20% of original investment per year
- Paid annually
- Takes 5 years to return 100%

### Testing Time-based Functions

Since the contracts use time-based logic (weeks, years), you have a few options for testing:

1. **Use Hardhat Time Helpers** (for developers):
   ```javascript
   // In Hardhat console
   await time.increase(7 * 24 * 60 * 60); // Fast forward 1 week
   ```

2. **Wait for Real Time** (not practical for testing)

3. **Modify Contract for Testing** (reduce time constants)

## Troubleshooting

### "User rejected the request"
- Make sure you're approving the transaction in your wallet

### "Insufficient funds"
- Use the USDT faucet to get test tokens
- Make sure you're on the local Hardhat network

### "No returns available to claim"
- Interest requires project to be completed
- Interest is paid weekly (need to wait 1 week)
- Principal payback starts 2 years after funding

### Contracts not showing
- Make sure `yarn chain` is running
- Redeploy contracts with `yarn deploy`
- Hard refresh the browser (Ctrl+Shift+R or Cmd+Shift+R)

## Development Commands

### Compile Contracts
```bash
yarn compile
```

### Run Tests
```bash
yarn hardhat:test
```

### Check Contract Size
```bash
yarn hardhat size-contracts
```

### Deploy to Testnet
```bash
yarn deploy --network liskSepolia
```

### Verify Contracts
```bash
yarn hardhat-verify --network liskSepolia
```

## Project Structure

```
SandBlock/
├── packages/
│   ├── hardhat/              # Smart contracts & deployment
│   │   ├── contracts/
│   │   │   ├── EnergyProjectHub.sol
│   │   │   └── MockUSDT.sol
│   │   ├── deploy/
│   │   └── test/
│   └── frontend/             # Next.js application
│       ├── app/
│       │   ├── page.tsx      # Home - Browse projects
│       │   ├── investor/     # My investments dashboard
│       │   └── owner/        # My projects dashboard
│       └── components/energy/
```

## Smart Contract Addresses (Local)

After deployment, your contracts will be at:
- **MockUSDT**: Check terminal output
- **EnergyProjectHub**: Check terminal output

These addresses are automatically updated in `packages/frontend/contracts/deployedContracts.ts`

## Need Help?

- Check the main [README.md](README.md) for detailed documentation
- Review smart contract code in `packages/hardhat/contracts/`
- Open an issue on GitHub

---

**Ready to build sustainable energy projects!** 🌞⚡

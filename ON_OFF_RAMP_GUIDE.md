# SandBlock On-Ramp & Off-Ramp Integration Guide

## Business Model Overview

SandBlock uses a **bidirectional** payment flow to connect traditional finance with blockchain:

```
Investors (USDT) → Project → Real World (Fiat) → Energy Production → Revenue (Fiat) → Project (USDT) → Investors
```

## The Complete Cycle

### Phase 1: Fundraising (Blockchain)
- ✅ Investors contribute USDT to projects
- ✅ Funds stored on-chain in smart contract
- ✅ Transparent, auditable, immutable

### Phase 2: Construction (Off-Ramp) 💸
- 🏗️ Project owner needs to pay contractors in **fiat money** (USD)
- 💸 **OFF-RAMP**: Convert USDT → USD
- 💵 Withdraw USD to business bank account
- 🔨 Pay for real-world construction costs

### Phase 3: Energy Production (Real World)
- ⚡ Solar/wind farm produces energy
- 💰 Energy sold to grid/customers for **fiat money**
- 📊 Revenue tracked and recorded

### Phase 4: Revenue Distribution (On-Ramp) 💰
- 💵 Project owner has USD from energy sales
- 💰 **ON-RAMP**: Convert USD → USDT
- 📤 Deposit USDT back to smart contract
- 💸 Investors claim their returns

---

## Off-Ramp Services (Crypto → Fiat)

### When to Use Off-Ramp:
- ✅ Project funded and ready to start construction
- ✅ Need to pay contractors, suppliers, equipment vendors
- ✅ All payments in traditional fiat currency

### Best Providers for Business Off-Ramp:

#### 1. **Circle** (Recommended for US)
**Best for:** Large projects, US-based businesses

**Features:**
- Direct bank deposits
- Support for businesses
- Compliance-ready (KYC/AML)
- Low fees (~0.5%)
- Fast settlement (1-3 days)

**Setup:**
1. Sign up at https://www.circle.com/
2. Complete business verification
3. Link business bank account
4. Convert USDT → USD
5. Withdraw to bank

**API Integration:**
```javascript
// Example: Circle API for off-ramp
const offRampPayment = {
  source: {
    type: 'blockchain',
    chain: 'ETH',
    address: projectWalletAddress,
  },
  destination: {
    type: 'wire',
    accountNumber: businessBankAccount,
  },
  amount: {
    amount: '50000.00',
    currency: 'USD'
  }
};
```

#### 2. **Coinbase Commerce**
**Best for:** Established businesses, global reach

**Features:**
- Business payment processing
- Multi-currency support
- Good reputation
- Integration with Coinbase accounts

**Setup:**
1. Sign up at https://commerce.coinbase.com/
2. Verify business
3. Create withdrawal
4. Funds to business bank

#### 3. **Binance P2P / OTC**
**Best for:** Large amounts, international projects

**Features:**
- Over-the-counter (OTC) desk
- Large transactions ($100k+)
- Competitive rates
- Global coverage

**Setup:**
1. Binance business account
2. Contact OTC desk
3. Negotiate rates
4. Bank transfer

#### 4. **Kraken**
**Best for:** Europe-based projects

**Features:**
- SEPA transfers
- Business accounts
- Good liquidity
- Established reputation

---

## On-Ramp Services (Fiat → Crypto)

### When to Use On-Ramp:
- ✅ Energy production generating revenue
- ✅ Need to pay investor returns
- ✅ Converting energy sales (fiat) back to USDT

### Best Providers for Business On-Ramp:

#### 1. **Circle** (Recommended)
**Features:**
- Bank → USDT direct
- ACH/Wire transfers accepted
- Business-friendly
- Same-day processing possible

**Process:**
1. Wire USD from business account
2. Circle converts to USDT
3. USDT sent to project contract address
4. Investors can claim returns

#### 2. **Coinbase Prime**
**Best for:** Institutional/large projects

**Features:**
- Institutional-grade
- Large volume handling
- Custody services
- Compliance tools

#### 3. **Binance Merchant**
**Best for:** Recurring revenue deposits

**Features:**
- Accept fiat payments
- Auto-convert to crypto
- Payment gateway
- API integration

---

## Integration into SandBlock

### Smart Contract Side

Add functions to track fiat conversions:

```solidity
contract SandBlock {
    // Track off-ramp transactions (USDT → Fiat for construction)
    struct OffRampRecord {
        uint256 usdtAmount;
        uint256 fiatAmount;
        uint256 timestamp;
        string purpose; // "construction_costs"
        string provider; // "Circle", "Coinbase", etc
    }

    mapping(uint256 => OffRampRecord[]) public projectOffRamps;

    // Track on-ramp transactions (Fiat → USDT from energy revenue)
    struct OnRampRecord {
        uint256 fiatAmount;
        uint256 usdtAmount;
        uint256 timestamp;
        string source; // "energy_sales"
        string provider;
    }

    mapping(uint256 => OnRampRecord[]) public projectOnRamps;

    // Record off-ramp (owner withdraws USDT for construction)
    function recordOffRamp(
        uint256 projectId,
        uint256 usdtAmount,
        uint256 fiatAmount,
        string memory purpose,
        string memory provider
    ) external onlyOwner {
        require(projects[projectId].isActive, "Project not active");

        projectOffRamps[projectId].push(OffRampRecord({
            usdtAmount: usdtAmount,
            fiatAmount: fiatAmount,
            timestamp: block.timestamp,
            purpose: purpose,
            provider: provider
        }));

        emit OffRampRecorded(projectId, usdtAmount, fiatAmount);
    }

    // Record on-ramp (owner deposits USDT from energy revenue)
    function recordOnRamp(
        uint256 projectId,
        uint256 fiatAmount,
        uint256 usdtAmount,
        string memory source,
        string memory provider
    ) external onlyOwner {
        require(projects[projectId].isCompleted, "Project not completed");

        projectOnRamps[projectId].push(OnRampRecord({
            fiatAmount: fiatAmount,
            usdtAmount: usdtAmount,
            timestamp: block.timestamp,
            source: source,
            provider: provider
        }));

        emit OnRampRecorded(projectId, fiatAmount, usdtAmount);
    }
}
```

### Frontend Integration

The `ProjectFinanceModal` component provides the UI for:

1. **Off-Ramp Mode (Construction)**:
   - Shows available USDT in contract
   - Allows owner to select amount to withdraw
   - Opens payment provider interface
   - Records transaction on-chain

2. **On-Ramp Mode (Revenue)**:
   - Shows expected revenue amount
   - Allows owner to convert fiat → USDT
   - Deposits to contract
   - Makes funds available for investor claims

### Usage in OwnerDashboard:

```typescript
import { ProjectFinanceModal } from "~~/components/energy/ProjectFinanceModal";

// In owner dashboard
<button onClick={() => setShowOffRamp(true)}>
  💸 Withdraw for Construction
</button>

<button onClick={() => setShowOnRamp(true)}>
  💰 Deposit Energy Revenue
</button>

<ProjectFinanceModal
  isOpen={showOffRamp}
  onClose={() => setShowOffRamp(false)}
  projectId={selectedProject}
  projectName={projectData.name}
  totalFunding={projectData.totalInvested}
  mode="off-ramp"
/>

<ProjectFinanceModal
  isOpen={showOnRamp}
  onClose={() => setShowOnRamp(false)}
  projectId={selectedProject}
  projectName={projectData.name}
  totalFunding={monthlyRevenue}
  mode="on-ramp"
/>
```

---

## Compliance & Legal

### KYC/AML Requirements:
- ✅ Business verification required
- ✅ Proof of energy project
- ✅ Construction contracts
- ✅ Energy sales agreements
- ✅ Tax documentation

### Best Practices:
1. **Transparency**: Record all conversions on-chain
2. **Auditing**: Keep receipts for all fiat transactions
3. **Matching**: Track USDT amount vs fiat amount
4. **Timing**: Record timestamp of all conversions
5. **Purpose**: Document what funds are used for

### Tax Considerations:
- Construction expenses: Business deductions
- Energy revenue: Business income
- Currency conversion: May have tax implications
- Investor returns: May trigger reporting requirements

---

## Cost Comparison

### Off-Ramp Fees (Crypto → Fiat):
| Provider | Fee | Speed | Limit |
|----------|-----|-------|-------|
| Circle | 0.5% | 1-3 days | $10M+ |
| Coinbase Commerce | 1% | 1-2 days | $1M+ |
| Binance OTC | 0.1-0.5% | Same day | $100k+ |
| Kraken | 0.9% | 1-4 days | Unlimited |

### On-Ramp Fees (Fiat → Crypto):
| Provider | Fee | Speed | Limit |
|----------|-----|-------|-------|
| Circle | 0.5% | Same day | $10M+ |
| Coinbase Prime | 0.5-1% | Same day | $1M+ |
| Binance | 0.1-0.5% | 1 day | $100k+ |

---

## Example Flow

### Project: $1M Solar Farm

**Phase 1: Fundraising**
- 100 investors contribute USDT
- Total raised: $1,000,000 USDT
- Stored in smart contract

**Phase 2: Construction (Off-Ramp)**
- Owner needs to pay contractor: $800,000 USD
- Uses Circle off-ramp
- $800,000 USDT → $796,000 USD (0.5% fee)
- Funds arrive in 2 days
- Pays contractor via bank transfer
- Records transaction on-chain

**Phase 3: Energy Production**
- Solar farm operational
- Produces energy worth $50,000/month
- Revenue collected in business bank account

**Phase 4: Investor Returns (On-Ramp)**
- Monthly: Convert $50,000 USD → 49,750 USDT
- Uses Circle on-ramp
- Deposits to project contract
- Investors claim weekly interest
- After 2 years: Principal payback begins

---

## Security Considerations

### Multi-Signature Wallet:
- Require multiple approvals for off-ramps
- Protect against unauthorized withdrawals

### Maximum Limits:
- Set max withdrawal per transaction
- Prevent large unauthorized movements

### Audit Trail:
- Log all conversions on-chain
- Immutable record of fund movements

### Insurance:
- Consider crypto custody insurance
- Protect against hacks/loss

---

## Getting Started

### 1. Choose Primary Provider
**Recommendation**: Start with Circle for both directions
- Easy setup
- Good for US projects
- Reliable
- Good API

### 2. Complete Verification
- Business documents
- Energy project details
- Bank account verification

### 3. Test Small Amount
- Try $1,000 off-ramp first
- Verify bank receipt
- Test on-ramp deposit
- Confirm contract credit

### 4. Integrate with Contract
- Add tracking functions
- Record all transactions
- Display in UI

### 5. Train Team
- Document procedures
- Create checklist
- Regular audits

---

## Support

For integration help:
- Circle: https://www.circle.com/en/contact
- Coinbase Commerce: https://commerce.coinbase.com/docs/
- Binance: business@binance.com

---

Built with SandBlock 🌞⚡

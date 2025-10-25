# SandBlock Updates - Project Types & Funding Deadlines

## New Features Added

### 1. Project Types

Projects now have a type classification to categorize different energy sources:

**Available Types:**
- ☀️ Solar
- 💨 Wind
- 💧 Hydro
- 🔥 Thermal
- 🌋 Geothermal
- 🌿 Biomass
- ⚡ Other

**Implementation:**
- Added `ProjectType` enum to smart contract
- Project creators must select a type when creating a project
- Project cards display type with emoji and colored badge
- Helps investors filter and identify project types at a glance

### 2. Funding Deadlines & Automatic Refunds

Projects now have a funding deadline with automatic refund mechanism:

**How It Works:**
1. **Set Deadline**: When creating a project, owner sets funding duration (1-365 days)
2. **Countdown**: Investors see time remaining to reach funding target
3. **Success**: If target reached before deadline → project proceeds normally
4. **Failure**: If deadline passes without reaching target → automatic refunds available

**Smart Contract Changes:**
- `fundingDeadline` field tracks the deadline timestamp
- `isFailed` boolean marks failed funding attempts
- `markFundingFailed()` - Anyone can call after deadline to mark project as failed
- `claimRefund()` - Investors get their USDT back if funding fails
- `isProjectFundingFailed()` - Check if project has failed

**Benefits:**
- **Investor Protection**: Money returned if project doesn't get funded
- **Clear Timeline**: Know exactly when funding period ends
- **Automatic**: No manual intervention needed for refunds
- **Transparent**: All funding status visible on-chain

## Smart Contract Updates

### New Fields in Project Struct

```solidity
struct Project {
    // ... existing fields
    ProjectType projectType;    // NEW: Type of energy project
    bool isFailed;              // NEW: Whether funding failed
    uint256 fundingDeadline;    // NEW: Deadline to reach funding
}
```

### New Functions

```solidity
// Mark project as failed after deadline
function markFundingFailed(uint256 _projectId) external

// Claim refund for failed project
function claimRefund(uint256 _projectId) external

// Check if project funding has failed
function isProjectFundingFailed(uint256 _projectId) public view returns (bool)
```

### Updated Functions

```solidity
// Now includes project type and funding duration
function createProject(
    string memory _name,
    string memory _description,
    string memory _location,
    ProjectType _projectType,      // NEW
    uint256 _targetAmount,
    uint256 _fundingDurationDays   // NEW
) external returns (uint256)

// Now checks deadline before allowing investment
function investInProject(uint256 _projectId, uint256 _amount)
```

### New Events

```solidity
event FundingFailed(
    uint256 indexed projectId,
    uint256 timestamp,
    uint256 totalInvested,
    uint256 targetAmount
);

event RefundClaimed(
    uint256 indexed projectId,
    address indexed investor,
    uint256 amount
);
```

## Frontend Updates

### Owner Dashboard

**Create Project Form:**
- Added project type dropdown (7 types)
- Added funding duration input (1-365 days)
- Shows warning about automatic refunds if funding fails
- Validation for all new fields

### Project Card Components

**Display:**
- Project type badge with emoji
- Funding deadline countdown
- Failed status indicator
- Time remaining until deadline

### Investor Dashboard

**New Features:**
- Refund button for failed projects
- Clear indication of project status
- Countdown timer for active funding

### Utility Functions

New helper file: `utils/projectHelpers.ts`
- `getProjectTypeName()` - Get readable name
- `getProjectTypeEmoji()` - Get emoji for type
- `getProjectTypeColor()` - Get badge color class
- `formatTimeRemaining()` - Format deadline countdown

## Usage Examples

### Creating a Project

```typescript
await createProject({
  args: [
    "Solar Farm California",        // name
    "100MW solar installation",     // description
    "California, USA",              // location
    0,                              // projectType (0 = Solar)
    parseUnits("500000", 6),        // targetAmount (500k USDT)
    90n                             // fundingDurationDays (90 days)
  ]
});
```

### Checking Funding Status

```typescript
const isFailed = await isProjectFundingFailed(projectId);

if (isFailed) {
  // Show refund button to investors
  await claimRefund(projectId);
}
```

### Marking Failed Funding

Anyone can call this after deadline passes:

```typescript
// After funding deadline has passed and target not reached
await markFundingFailed(projectId);
```

## Migration Guide

### For Existing Deployments

⚠️ **Breaking Change**: The `createProject` function signature has changed.

**Old:**
```solidity
createProject(name, description, location, targetAmount)
```

**New:**
```solidity
createProject(name, description, location, projectType, targetAmount, fundingDurationDays)
```

### Steps to Migrate

1. **Compile** new contracts:
   ```bash
   yarn compile
   ```

2. **Deploy** to your network:
   ```bash
   yarn chain  # Terminal 1
   yarn deploy # Terminal 2
   ```

3. **Update** frontend dependencies (automatic via ABIs)

4. **Test** the new features

## Security Considerations

### Refund Mechanism

- Uses `ReentrancyGuard` to prevent reentrancy attacks
- Investors can only claim their own refunds
- Refund amount tracked per investor
- Can only refund once per investor
- Project must be marked as failed first

### Deadline Validation

- Maximum 365 days (1 year) for funding duration
- Deadline checked on every investment
- Anyone can mark failed funding (permissionless but safe)
- Cannot invest after deadline

## Testing

To test the new features locally:

```bash
# Start local blockchain
yarn chain

# Deploy contracts
yarn deploy

# Create a project with short deadline (e.g., 1 day)
# Wait for deadline to pass (or fast-forward time in Hardhat)
# Mark funding as failed
# Claim refunds
```

## Future Enhancements

Potential improvements:
- Automatic deadline extension if close to target
- Partial refunds for partially funded projects
- Email notifications for deadline approaching
- Dashboard showing all failed projects
- Statistics on success rate by project type

---

**Version**: 2.1.0
**Date**: October 2024
**Breaking Changes**: Yes - createProject function signature changed

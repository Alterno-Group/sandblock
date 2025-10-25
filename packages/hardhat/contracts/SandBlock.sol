// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

/**
 * @title SandBlock
 * @dev Manages tokenized energy projects with tiered interest rates and scheduled paybacks
 *
 * Interest Rates (APY):
 * - < 2000 USDT: 5% per year
 * - 2000 - 20000 USDT: 7% per year
 * - > 20000 USDT: 9% per year
 *
 * Payback Schedule:
 * - Weekly interest payments after project completion
 * - Principal payback: 20% per year starting 2 years after target reached
 */
contract SandBlock is Ownable, ReentrancyGuard {
    IERC20 public usdtToken;

    // Admin management
    mapping(address => bool) public admins;

    uint256 public constant WEEK_IN_SECONDS = 7 days;
    uint256 public constant YEAR_IN_SECONDS = 365 days;
    uint256 public constant PRINCIPAL_PAYBACK_DELAY = 2 * YEAR_IN_SECONDS;
    uint256 public constant PRINCIPAL_PAYBACK_RATE = 20; // 20% per year

    // Interest rate tiers (in basis points: 500 = 5%)
    uint256 public constant TIER1_RATE = 500;   // 5% APY
    uint256 public constant TIER2_RATE = 700;   // 7% APY
    uint256 public constant TIER3_RATE = 900;   // 9% APY

    uint256 public constant TIER1_MAX = 2000 * 10**6;    // 2000 USDT (assuming 6 decimals)
    uint256 public constant TIER2_MAX = 20000 * 10**6;   // 20000 USDT

    // Project types
    enum ProjectType {
        Solar,
        Wind,
        Hydro,
        Thermal,
        Geothermal,
        Biomass,
        Other
    }

    struct EnergyRecord {
        uint256 energyKWh;
        uint256 cost;
        uint256 timestamp;
        string notes;
    }

    struct Project {
        uint256 id;
        string name;
        string description;
        string location;
        ProjectType projectType;        // Type of energy project
        uint256 targetAmount;           // Target funding in USDT
        uint256 totalInvested;          // Total USDT invested
        uint256 energyProduced;         // Total energy produced in kWh
        uint256 totalEnergyCost;        // Total cost of energy production
        address projectOwner;           // Project creator/owner
        bool isActive;                  // Whether project accepts investments
        bool isCompleted;               // Whether construction is completed
        bool isFailed;                  // Whether funding failed (deadline passed)
        uint256 createdAt;              // Project creation timestamp
        uint256 fundingDeadline;        // Deadline to reach funding target
        uint256 fundingCompletedAt;     // When target amount was reached
        uint256 constructionCompletedAt;// When construction was completed
    }

    struct Investment {
        uint256 principalAmount;        // Original investment amount
        uint256 principalRemaining;     // Remaining principal to be paid back
        uint256 lastInterestClaim;      // Last time interest was claimed
        uint256 lastPrincipalClaim;     // Last time principal was claimed
        uint256 totalInterestClaimed;   // Total interest claimed
        uint256 totalPrincipalClaimed;  // Total principal returned
    }

    // Project ID => Project details
    mapping(uint256 => Project) public projects;

    // Project ID => Investor address => Investment details
    mapping(uint256 => mapping(address => Investment)) public investments;

    // Project ID => List of investors
    mapping(uint256 => address[]) public projectInvestors;

    // Project ID => Energy production records
    mapping(uint256 => EnergyRecord[]) public energyRecords;

    // ============ OFF-RAMP / ON-RAMP TRANSPARENCY ============

    // Off-Ramp: Convert USDT → Fiat for construction expenses
    struct OffRampTransaction {
        uint256 usdtAmount;         // USDT withdrawn from contract
        uint256 fiatAmount;         // Fiat received (in USD cents)
        uint256 exchangeRate;       // Exchange rate (100 = 1.00)
        uint256 timestamp;          // When transaction occurred
        string provider;            // e.g., "Circle", "Coinbase"
        string purpose;             // e.g., "Solar panels purchase"
        string txHash;              // Off-chain transaction reference
        string bankAccount;         // Last 4 digits of destination account
        bool isCompleted;           // Transaction confirmed
    }

    // On-Ramp: Convert Fiat → USDT from energy revenue
    struct OnRampTransaction {
        uint256 fiatAmount;         // Fiat converted (in USD cents)
        uint256 usdtAmount;         // USDT deposited to contract
        uint256 exchangeRate;       // Exchange rate (100 = 1.00)
        uint256 timestamp;          // When transaction occurred
        string provider;            // e.g., "Circle", "Coinbase"
        string source;              // e.g., "Energy sales - Jan 2024"
        string txHash;              // Off-chain transaction reference
        string invoiceNumber;       // Energy invoice reference
        bool isCompleted;           // Transaction confirmed
    }

    // Project ID => Array of off-ramp transactions
    mapping(uint256 => OffRampTransaction[]) public offRampTransactions;

    // Project ID => Array of on-ramp transactions
    mapping(uint256 => OnRampTransaction[]) public onRampTransactions;

    // Track total amounts for transparency
    mapping(uint256 => uint256) public totalOffRamped;  // Total USDT withdrawn
    mapping(uint256 => uint256) public totalOnRamped;   // Total USDT deposited back

    uint256 public projectCount;

    // Events
    event ProjectCreated(
        uint256 indexed projectId,
        string name,
        address indexed owner,
        uint256 targetAmount
    );

    event InvestmentMade(
        uint256 indexed projectId,
        address indexed investor,
        uint256 amount
    );

    event FundingCompleted(
        uint256 indexed projectId,
        uint256 timestamp
    );

    event ConstructionCompleted(
        uint256 indexed projectId,
        uint256 timestamp
    );

    event EnergyRecorded(
        uint256 indexed projectId,
        uint256 energyAmount,
        uint256 cost,
        uint256 timestamp,
        string notes
    );

    event InterestClaimed(
        uint256 indexed projectId,
        address indexed investor,
        uint256 amount
    );

    event PrincipalClaimed(
        uint256 indexed projectId,
        address indexed investor,
        uint256 amount
    );

    // Off-Ramp / On-Ramp Events
    event OffRampInitiated(
        uint256 indexed projectId,
        uint256 usdtAmount,
        uint256 fiatAmount,
        string provider,
        string purpose
    );

    event OffRampCompleted(
        uint256 indexed projectId,
        uint256 transactionIndex,
        string txHash
    );

    event OnRampInitiated(
        uint256 indexed projectId,
        uint256 fiatAmount,
        uint256 usdtAmount,
        string provider,
        string source
    );

    event OnRampCompleted(
        uint256 indexed projectId,
        uint256 transactionIndex,
        string txHash
    );

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

    event AdminAdded(address indexed admin);
    event AdminRemoved(address indexed admin);

    modifier onlyOwnerOrAdmin() {
        require(msg.sender == owner() || admins[msg.sender], "Not authorized: must be owner or admin");
        _;
    }

    constructor(address _usdtToken) {
        usdtToken = IERC20(_usdtToken);
    }

    /**
     * @dev Add an admin who can create and edit projects
     * @param _admin Address to add as admin
     */
    function addAdmin(address _admin) external onlyOwner {
        require(_admin != address(0), "Invalid admin address");
        require(!admins[_admin], "Already an admin");
        admins[_admin] = true;
        emit AdminAdded(_admin);
    }

    /**
     * @dev Remove an admin
     * @param _admin Address to remove from admins
     */
    function removeAdmin(address _admin) external onlyOwner {
        require(admins[_admin], "Not an admin");
        admins[_admin] = false;
        emit AdminRemoved(_admin);
    }

    /**
     * @dev Check if an address is an admin
     * @param _address Address to check
     */
    function isAdmin(address _address) external view returns (bool) {
        return admins[_address];
    }

    /**
     * @dev Calculate interest rate based on investment amount (in basis points)
     */
    function getInterestRate(uint256 _amount) public pure returns (uint256) {
        if (_amount < TIER1_MAX) {
            return TIER1_RATE;
        } else if (_amount < TIER2_MAX) {
            return TIER2_RATE;
        } else {
            return TIER3_RATE;
        }
    }

    /**
     * @dev Create a new energy project
     */
    function createProject(
        string memory _name,
        string memory _description,
        string memory _location,
        ProjectType _projectType,
        uint256 _targetAmount,
        uint256 _fundingDurationDays
    ) external onlyOwnerOrAdmin returns (uint256) {
        require(_targetAmount > 0, "Target amount must be greater than 0");
        require(_fundingDurationDays > 0, "Funding duration must be greater than 0");
        require(_fundingDurationDays <= 365, "Funding duration cannot exceed 1 year");

        uint256 projectId = projectCount++;
        uint256 fundingDeadline = block.timestamp + (_fundingDurationDays * 1 days);

        projects[projectId] = Project({
            id: projectId,
            name: _name,
            description: _description,
            location: _location,
            projectType: _projectType,
            targetAmount: _targetAmount,
            totalInvested: 0,
            energyProduced: 0,
            totalEnergyCost: 0,
            projectOwner: msg.sender,
            isActive: true,
            isCompleted: false,
            isFailed: false,
            createdAt: block.timestamp,
            fundingDeadline: fundingDeadline,
            fundingCompletedAt: 0,
            constructionCompletedAt: 0
        });

        emit ProjectCreated(projectId, _name, msg.sender, _targetAmount);

        return projectId;
    }

    /**
     * @dev Invest in a project with USDT
     */
    function investInProject(uint256 _projectId, uint256 _amount) external nonReentrant {
        Project storage project = projects[_projectId];

        require(project.isActive, "Project is not active");
        require(!project.isCompleted, "Project construction is completed");
        require(!project.isFailed, "Project funding has failed");
        require(block.timestamp <= project.fundingDeadline, "Funding deadline has passed");
        require(_amount > 0, "Investment amount must be greater than 0");
        require(
            project.totalInvested + _amount <= project.targetAmount,
            "Investment exceeds target amount"
        );

        // Transfer USDT from investor to contract
        require(
            usdtToken.transferFrom(msg.sender, address(this), _amount),
            "USDT transfer failed"
        );

        // Update or create investment record
        Investment storage investment = investments[_projectId][msg.sender];

        if (investment.principalAmount == 0) {
            // New investor
            projectInvestors[_projectId].push(msg.sender);
            investment.lastInterestClaim = block.timestamp;
            investment.lastPrincipalClaim = block.timestamp;
        }

        investment.principalAmount += _amount;
        investment.principalRemaining += _amount;
        project.totalInvested += _amount;

        // Check if funding is complete
        if (project.totalInvested >= project.targetAmount && project.fundingCompletedAt == 0) {
            project.fundingCompletedAt = block.timestamp;
            emit FundingCompleted(_projectId, block.timestamp);
        }

        emit InvestmentMade(_projectId, msg.sender, _amount);
    }

    /**
     * @dev Mark project funding as failed if deadline passed without reaching target
     * Can be called by anyone after deadline
     */
    function markFundingFailed(uint256 _projectId) external {
        Project storage project = projects[_projectId];

        require(!project.isFailed, "Project already marked as failed");
        require(!project.isCompleted, "Project is already completed");
        require(project.fundingCompletedAt == 0, "Project funding was successful");
        require(block.timestamp > project.fundingDeadline, "Funding deadline not reached yet");
        require(project.totalInvested < project.targetAmount, "Target amount was reached");

        project.isFailed = true;
        project.isActive = false;

        emit FundingFailed(_projectId, block.timestamp, project.totalInvested, project.targetAmount);
    }

    /**
     * @dev Claim refund for failed project
     */
    function claimRefund(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        Investment storage investment = investments[_projectId][msg.sender];

        require(project.isFailed, "Project has not failed");
        require(investment.principalAmount > 0, "No investment to refund");
        require(investment.principalRemaining > 0, "Refund already claimed");

        uint256 refundAmount = investment.principalRemaining;
        investment.principalRemaining = 0;

        // Transfer refund to investor
        require(
            usdtToken.transfer(msg.sender, refundAmount),
            "USDT transfer failed"
        );

        emit RefundClaimed(_projectId, msg.sender, refundAmount);
    }

    /**
     * @dev Check if project funding has failed (deadline passed without reaching target)
     */
    function isProjectFundingFailed(uint256 _projectId) public view returns (bool) {
        Project storage project = projects[_projectId];

        if (project.isFailed) {
            return true;
        }

        return (
            block.timestamp > project.fundingDeadline &&
            project.fundingCompletedAt == 0 &&
            project.totalInvested < project.targetAmount &&
            !project.isCompleted
        );
    }

    /**
     * @dev Calculate available weekly interest for an investor
     */
    function calculateAvailableInterest(uint256 _projectId, address _investor)
        public
        view
        returns (uint256)
    {
        Project storage project = projects[_projectId];
        Investment storage investment = investments[_projectId][_investor];

        // Interest can only be claimed after construction is completed
        if (!project.isCompleted || investment.principalAmount == 0) {
            return 0;
        }

        uint256 timeSinceLastClaim = block.timestamp - investment.lastInterestClaim;
        uint256 weeksElapsed = timeSinceLastClaim / WEEK_IN_SECONDS;

        if (weeksElapsed == 0) {
            return 0;
        }

        // Calculate interest based on tiered rates
        uint256 interestRate = getInterestRate(investment.principalAmount);

        // Annual interest = principal * rate / 10000
        // Weekly interest = annual interest / 52
        uint256 weeklyInterest = (investment.principalRemaining * interestRate) / (10000 * 52);
        uint256 totalInterest = weeklyInterest * weeksElapsed;

        return totalInterest;
    }

    /**
     * @dev Calculate available principal payback for an investor
     */
    function calculateAvailablePrincipal(uint256 _projectId, address _investor)
        public
        view
        returns (uint256)
    {
        Project storage project = projects[_projectId];
        Investment storage investment = investments[_projectId][_investor];

        // Principal can only be claimed 2 years after funding completed
        if (project.fundingCompletedAt == 0 || investment.principalAmount == 0) {
            return 0;
        }

        uint256 timeSinceFundingCompleted = block.timestamp - project.fundingCompletedAt;

        if (timeSinceFundingCompleted < PRINCIPAL_PAYBACK_DELAY) {
            return 0;
        }

        // Calculate the effective start time for principal payback (2 years after funding)
        uint256 principalPaybackStartTime = project.fundingCompletedAt + PRINCIPAL_PAYBACK_DELAY;

        // Use the later of: principal payback start time OR last claim time
        uint256 effectiveLastClaim = investment.lastPrincipalClaim > principalPaybackStartTime
            ? investment.lastPrincipalClaim
            : principalPaybackStartTime;

        uint256 timeSinceLastClaim = block.timestamp - effectiveLastClaim;
        uint256 yearsElapsed = timeSinceLastClaim / YEAR_IN_SECONDS;

        if (yearsElapsed == 0) {
            return 0;
        }

        // 20% of original principal per year
        uint256 yearlyPayback = (investment.principalAmount * PRINCIPAL_PAYBACK_RATE) / 100;
        uint256 totalPayback = yearlyPayback * yearsElapsed;

        // Don't exceed remaining principal
        if (totalPayback > investment.principalRemaining) {
            return investment.principalRemaining;
        }

        return totalPayback;
    }

    /**
     * @dev Claim weekly interest payments
     */
    function claimInterest(uint256 _projectId) external nonReentrant {
        uint256 availableInterest = calculateAvailableInterest(_projectId, msg.sender);
        require(availableInterest > 0, "No interest available to claim");

        Investment storage investment = investments[_projectId][msg.sender];

        // Update claim time to the last complete week
        uint256 timeSinceLastClaim = block.timestamp - investment.lastInterestClaim;
        uint256 weeksElapsed = timeSinceLastClaim / WEEK_IN_SECONDS;
        investment.lastInterestClaim += (weeksElapsed * WEEK_IN_SECONDS);
        investment.totalInterestClaimed += availableInterest;

        // Transfer interest to investor
        require(
            usdtToken.transfer(msg.sender, availableInterest),
            "USDT transfer failed"
        );

        emit InterestClaimed(_projectId, msg.sender, availableInterest);
    }

    /**
     * @dev Claim principal payback (20% per year starting 2 years after funding)
     */
    function claimPrincipal(uint256 _projectId) external nonReentrant {
        Project storage project = projects[_projectId];
        uint256 availablePrincipal = calculateAvailablePrincipal(_projectId, msg.sender);
        require(availablePrincipal > 0, "No principal available to claim");

        Investment storage investment = investments[_projectId][msg.sender];

        // Calculate the effective start time for principal payback
        uint256 principalPaybackStartTime = project.fundingCompletedAt + PRINCIPAL_PAYBACK_DELAY;

        // Use the later of: principal payback start time OR last claim time
        uint256 effectiveLastClaim = investment.lastPrincipalClaim > principalPaybackStartTime
            ? investment.lastPrincipalClaim
            : principalPaybackStartTime;

        // Update claim time based on complete years elapsed
        uint256 timeSinceLastClaim = block.timestamp - effectiveLastClaim;
        uint256 yearsElapsed = timeSinceLastClaim / YEAR_IN_SECONDS;
        investment.lastPrincipalClaim = effectiveLastClaim + (yearsElapsed * YEAR_IN_SECONDS);

        investment.principalRemaining -= availablePrincipal;
        investment.totalPrincipalClaimed += availablePrincipal;

        // Transfer principal to investor
        require(
            usdtToken.transfer(msg.sender, availablePrincipal),
            "USDT transfer failed"
        );

        emit PrincipalClaimed(_projectId, msg.sender, availablePrincipal);
    }

    /**
     * @dev Record energy produced with cost (only project owner can call)
     */
    function recordEnergyProduction(
        uint256 _projectId,
        uint256 _energyKWh,
        uint256 _cost,
        string memory _notes
    ) external onlyOwnerOrAdmin {
        Project storage project = projects[_projectId];
        require(project.isCompleted, "Project must be completed first");
        require(_energyKWh > 0, "Energy amount must be greater than 0");

        project.energyProduced += _energyKWh;
        project.totalEnergyCost += _cost;

        // Store energy record
        energyRecords[_projectId].push(EnergyRecord({
            energyKWh: _energyKWh,
            cost: _cost,
            timestamp: block.timestamp,
            notes: _notes
        }));

        emit EnergyRecorded(_projectId, _energyKWh, _cost, block.timestamp, _notes);
    }

    /**
     * @dev Mark project construction as completed (only project owner)
     */
    function completeConstruction(uint256 _projectId) external onlyOwnerOrAdmin {
        Project storage project = projects[_projectId];
        require(!project.isCompleted, "Project already completed");
        require(project.fundingCompletedAt > 0, "Funding not completed yet");

        project.isCompleted = true;
        project.isActive = false;
        project.constructionCompletedAt = block.timestamp;

        // Initialize interest claim time for all investors
        address[] storage investors = projectInvestors[_projectId];
        for (uint256 i = 0; i < investors.length; i++) {
            investments[_projectId][investors[i]].lastInterestClaim = block.timestamp;
        }

        emit ConstructionCompleted(_projectId, block.timestamp);
    }

    /**
     * @dev Deposit funds to contract for payouts (project owner)
     */
    function depositPayoutFunds(uint256 _amount) external nonReentrant {
        require(_amount > 0, "Amount must be greater than 0");

        require(
            usdtToken.transferFrom(msg.sender, address(this), _amount),
            "USDT transfer failed"
        );
    }

    /**
     * @dev Get project basic info
     */
    function getProject(uint256 _projectId)
        external
        view
        returns (
            string memory name,
            string memory description,
            string memory location,
            ProjectType projectType,
            uint256 targetAmount,
            uint256 totalInvested,
            uint256 energyProduced,
            uint256 totalEnergyCost,
            address projectOwner,
            bool isActive,
            bool isCompleted,
            bool isFailed
        )
    {
        Project storage project = projects[_projectId];
        return (
            project.name,
            project.description,
            project.location,
            project.projectType,
            project.targetAmount,
            project.totalInvested,
            project.energyProduced,
            project.totalEnergyCost,
            project.projectOwner,
            project.isActive,
            project.isCompleted,
            project.isFailed
        );
    }

    /**
     * @dev Get project timeline info
     */
    function getProjectTimeline(uint256 _projectId)
        external
        view
        returns (
            uint256 createdAt,
            uint256 fundingDeadline,
            uint256 fundingCompletedAt,
            uint256 constructionCompletedAt
        )
    {
        Project storage project = projects[_projectId];
        return (
            project.createdAt,
            project.fundingDeadline,
            project.fundingCompletedAt,
            project.constructionCompletedAt
        );
    }

    /**
     * @dev Get energy records for a project
     */
    function getEnergyRecords(uint256 _projectId)
        external
        view
        returns (EnergyRecord[] memory)
    {
        return energyRecords[_projectId];
    }

    /**
     * @dev Get investment details for an investor
     */
    function getInvestment(uint256 _projectId, address _investor)
        external
        view
        returns (
            uint256 principalAmount,
            uint256 principalRemaining,
            uint256 interestRate,
            uint256 availableInterest,
            uint256 availablePrincipal,
            uint256 totalInterestClaimed,
            uint256 totalPrincipalClaimed
        )
    {
        Investment storage investment = investments[_projectId][_investor];
        return (
            investment.principalAmount,
            investment.principalRemaining,
            getInterestRate(investment.principalAmount),
            calculateAvailableInterest(_projectId, _investor),
            calculateAvailablePrincipal(_projectId, _investor),
            investment.totalInterestClaimed,
            investment.totalPrincipalClaimed
        );
    }

    /**
     * @dev Get all investors for a project
     */
    function getProjectInvestors(uint256 _projectId)
        external
        view
        returns (address[] memory)
    {
        return projectInvestors[_projectId];
    }

    /**
     * @dev Get contract USDT balance
     */
    function getContractBalance() external view returns (uint256) {
        return usdtToken.balanceOf(address(this));
    }

    /**
     * @dev Toggle project active status (only project owner)
     */
    function toggleProjectStatus(uint256 _projectId) external {
        Project storage project = projects[_projectId];

        require(msg.sender == project.projectOwner, "Only project owner");
        require(!project.isCompleted, "Cannot toggle completed project");

        project.isActive = !project.isActive;
    }

    // ============ OFF-RAMP / ON-RAMP FUNCTIONS ============

    /**
     * @dev Initiate off-ramp transaction (USDT → Fiat for construction)
     * @param _projectId Project ID
     * @param _usdtAmount Amount of USDT to withdraw (6 decimals)
     * @param _fiatAmount Expected fiat amount in USD cents (e.g., 100000 = $1,000.00)
     * @param _provider Payment provider name (e.g., "Circle")
     * @param _purpose Description of what funds will be used for
     * @param _bankAccount Last 4 digits of destination bank account
     */
    function initiateOffRamp(
        uint256 _projectId,
        uint256 _usdtAmount,
        uint256 _fiatAmount,
        string memory _provider,
        string memory _purpose,
        string memory _bankAccount
    ) external nonReentrant {
        Project storage project = projects[_projectId];

        require(
            msg.sender == project.projectOwner || msg.sender == owner() || admins[msg.sender],
            "Not authorized"
        );
        require(project.totalInvested >= project.targetAmount, "Funding not complete");
        require(_usdtAmount > 0, "Amount must be greater than 0");
        require(_usdtAmount <= usdtToken.balanceOf(address(this)), "Insufficient contract balance");

        // Calculate exchange rate (100 = 1.00, in basis points)
        uint256 exchangeRate = (_fiatAmount * 10000) / _usdtAmount;

        // Create off-ramp record
        offRampTransactions[_projectId].push(OffRampTransaction({
            usdtAmount: _usdtAmount,
            fiatAmount: _fiatAmount,
            exchangeRate: exchangeRate,
            timestamp: block.timestamp,
            provider: _provider,
            purpose: _purpose,
            txHash: "", // Will be filled when completed
            bankAccount: _bankAccount,
            isCompleted: false
        }));

        // Transfer USDT to project owner (they will convert to fiat off-chain)
        require(
            usdtToken.transfer(project.projectOwner, _usdtAmount),
            "USDT transfer failed"
        );

        // Update total off-ramped
        totalOffRamped[_projectId] += _usdtAmount;

        emit OffRampInitiated(_projectId, _usdtAmount, _fiatAmount, _provider, _purpose);
    }

    /**
     * @dev Complete off-ramp transaction (confirm fiat received)
     * @param _projectId Project ID
     * @param _transactionIndex Index in offRampTransactions array
     * @param _txHash Off-chain transaction hash/reference
     */
    function completeOffRamp(
        uint256 _projectId,
        uint256 _transactionIndex,
        string memory _txHash
    ) external {
        Project storage project = projects[_projectId];

        require(
            msg.sender == project.projectOwner || msg.sender == owner() || admins[msg.sender],
            "Not authorized"
        );
        require(_transactionIndex < offRampTransactions[_projectId].length, "Invalid index");

        OffRampTransaction storage txn = offRampTransactions[_projectId][_transactionIndex];
        require(!txn.isCompleted, "Already completed");

        txn.isCompleted = true;
        txn.txHash = _txHash;

        emit OffRampCompleted(_projectId, _transactionIndex, _txHash);
    }

    /**
     * @dev Initiate on-ramp transaction (Fiat → USDT from energy revenue)
     * @param _projectId Project ID
     * @param _fiatAmount Amount of fiat being converted (in USD cents)
     * @param _usdtAmount Amount of USDT deposited (6 decimals)
     * @param _provider Payment provider name
     * @param _source Description of revenue source
     * @param _invoiceNumber Energy invoice reference
     */
    function initiateOnRamp(
        uint256 _projectId,
        uint256 _fiatAmount,
        uint256 _usdtAmount,
        string memory _provider,
        string memory _source,
        string memory _invoiceNumber
    ) external nonReentrant {
        Project storage project = projects[_projectId];

        require(
            msg.sender == project.projectOwner || msg.sender == owner() || admins[msg.sender],
            "Not authorized"
        );
        require(project.isCompleted, "Project must be completed");
        require(_usdtAmount > 0, "Amount must be greater than 0");

        // Calculate exchange rate
        uint256 exchangeRate = (_fiatAmount * 10000) / _usdtAmount;

        // Create on-ramp record
        onRampTransactions[_projectId].push(OnRampTransaction({
            fiatAmount: _fiatAmount,
            usdtAmount: _usdtAmount,
            exchangeRate: exchangeRate,
            timestamp: block.timestamp,
            provider: _provider,
            source: _source,
            txHash: "", // Will be filled when completed
            invoiceNumber: _invoiceNumber,
            isCompleted: false
        }));

        // Project owner deposits USDT back to contract (converted from fiat off-chain)
        require(
            usdtToken.transferFrom(msg.sender, address(this), _usdtAmount),
            "USDT transfer failed"
        );

        // Update total on-ramped
        totalOnRamped[_projectId] += _usdtAmount;

        emit OnRampInitiated(_projectId, _fiatAmount, _usdtAmount, _provider, _source);
    }

    /**
     * @dev Complete on-ramp transaction (confirm USDT deposited)
     * @param _projectId Project ID
     * @param _transactionIndex Index in onRampTransactions array
     * @param _txHash Off-chain transaction hash/reference
     */
    function completeOnRamp(
        uint256 _projectId,
        uint256 _transactionIndex,
        string memory _txHash
    ) external {
        Project storage project = projects[_projectId];

        require(
            msg.sender == project.projectOwner || msg.sender == owner() || admins[msg.sender],
            "Not authorized"
        );
        require(_transactionIndex < onRampTransactions[_projectId].length, "Invalid index");

        OnRampTransaction storage txn = onRampTransactions[_projectId][_transactionIndex];
        require(!txn.isCompleted, "Already completed");

        txn.isCompleted = true;
        txn.txHash = _txHash;

        emit OnRampCompleted(_projectId, _transactionIndex, _txHash);
    }

    /**
     * @dev Get all off-ramp transactions for a project
     */
    function getOffRampTransactions(uint256 _projectId)
        external
        view
        returns (OffRampTransaction[] memory)
    {
        return offRampTransactions[_projectId];
    }

    /**
     * @dev Get all on-ramp transactions for a project
     */
    function getOnRampTransactions(uint256 _projectId)
        external
        view
        returns (OnRampTransaction[] memory)
    {
        return onRampTransactions[_projectId];
    }

    /**
     * @dev Get off-ramp/on-ramp summary for a project
     */
    function getFinancialSummary(uint256 _projectId)
        external
        view
        returns (
            uint256 totalInvested,
            uint256 totalOffRampedAmount,
            uint256 totalOnRampedAmount,
            uint256 offRampCount,
            uint256 onRampCount,
            int256 netBalance
        )
    {
        Project storage project = projects[_projectId];

        uint256 offRamps = offRampTransactions[_projectId].length;
        uint256 onRamps = onRampTransactions[_projectId].length;

        // Net balance = Total invested - Off-ramped + On-ramped
        int256 balance = int256(project.totalInvested) - int256(totalOffRamped[_projectId]) + int256(totalOnRamped[_projectId]);

        return (
            project.totalInvested,
            totalOffRamped[_projectId],
            totalOnRamped[_projectId],
            offRamps,
            onRamps,
            balance
        );
    }
}

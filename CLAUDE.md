# PolkaLend -- Decentralized Micro-Lending Protocol

DeFi micro-lending protocol on Polkadot's Moonbeam (EVM-compatible). Features flash loans, collateralized lending, liquidations, and a kinked interest rate model. Built for the Polkadot Solidity Hackathon 2026.

## Quick Start

```bash
npm install && npx hardhat compile && npx hardhat test
```

## Key Contracts

- **LendingPool.sol** -- Core lending logic: deposit, withdraw, borrow, repay, liquidate, flash loans. Inherits FlashLoan. Uses ReentrancyGuard and SafeERC20.
- **FlashLoan.sol** -- Uncollateralized single-tx loans with 0.09% fee. Calls IFlashLoanReceiver callback.
- **InterestRateModel.sol** -- Kinked rate model (Compound-style): gentle slope below 80% utilization, steep slope above.
- **PriceOracle.sol** -- Owner-managed price feeds. Replace with Chainlink/DIA in production.
- **PolkaToken.sol** -- PLEND ERC-20 governance token with 100M max supply, owner-only minting.

## Frontend (5 Pages)

The frontend is a zero-dependency static SPA (`frontend/index.html`, `styles.css`, `app.js`) with hash-based routing:

1. **Dashboard** (`#dashboard`) -- Stats cards, markets table, interest rate chart, activity feed
2. **Lending** (`#lending`) -- Deposit/withdraw forms, health factor gauge (conic-gradient CSS), position summary
3. **Borrowing** (`#borrowing`) -- Borrow/repay forms, active borrows table, collateral overview, liquidation simulator with range slider
4. **Flash Loans** (`#flash-loans`) -- Flash loan form with fee calculator, animated lifecycle flow visualization (4 nodes, sequential glow), loan history
5. **Analytics** (`#analytics`) -- TVL over time chart, utilization bar chart, interactive interest rate curves with 4 parameter sliders, leaderboards

Design: dark theme (`#0d1117`), Polkadot pink (`#e6007a`) accents, responsive (mobile/tablet/desktop breakpoints), toast notifications, count-up animations.

## Deployment

```bash
# Local
npx hardhat node &
npx hardhat run scripts/deploy.js --network localhost

# Moonbase Alpha testnet
export PRIVATE_KEY=0xYourPrivateKey
npx hardhat run scripts/deploy.js --network moonbase

# Moonbeam mainnet
export PRIVATE_KEY=0xYourPrivateKey
npx hardhat run scripts/deploy.js --network moonbeam
```

Deploy script deploys: PolkaToken -> InterestRateModel -> PriceOracle -> LendingPool, then lists PLEND token as a market.

## Testing

```bash
npx hardhat test
```

12 tests covering: deposits, withdrawals, borrowing, over-leverage rejection, repayment, collateral calculations, undercollateralized withdrawal prevention, flash loans, interest rate model, liquidation, unlisted token rejection, event emission.

## Stack

- Solidity 0.8.20 with optimizer (200 runs)
- Hardhat + ethers.js + Chai
- OpenZeppelin (ERC20, SafeERC20, Ownable, ReentrancyGuard)
- Networks: Moonbeam (1284), Moonbase Alpha (1287)
- Frontend: Vanilla HTML/CSS/JS, Canvas API for charts, no build tools

## Project Structure

```
contracts/           -- Solidity source
  interfaces/        -- ILendingPool, IFlashLoanReceiver
  mocks/             -- MockFlashLoanReceiver for testing
scripts/deploy.js    -- Deployment script
test/                -- Hardhat test suite
frontend/            -- 5-page static SPA (index.html, styles.css, app.js)
screenshots/         -- Dashboard screenshots for README
Dockerfile           -- Multi-stage Alpine build (builder + runtime)
docker-compose.yml   -- Single service: app on :8545 + :3000
Makefile             -- Targets: install, compile, test, deploy-*, docker-*, dev
```

## Docker

```bash
docker compose build && docker compose up -d
```

Exposes Hardhat node on :8545, frontend on :3000. Runs as non-root `polkalend` user.

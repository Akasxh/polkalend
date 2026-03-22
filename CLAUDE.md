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

## Project Structure

```
contracts/           -- Solidity source
  interfaces/        -- ILendingPool, IFlashLoanReceiver
  mocks/             -- MockFlashLoanReceiver for testing
scripts/deploy.js    -- Deployment script
test/                -- Hardhat test suite
frontend/            -- Static HTML dashboard
```

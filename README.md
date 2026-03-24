<div align="center">

# PolkaLend

**Flash loans + liquidation-proof micro-lending on Polkadot's Moonbeam**

<img src="./screenshots/hero.png" width="800" alt="PolkaLend Dashboard"/>

<br/>

![Solidity](https://img.shields.io/badge/Solidity-0.8.20-363636?logo=solidity)
![Hardhat](https://img.shields.io/badge/Hardhat-2.22-yellow?logo=hardhat)
![OpenZeppelin](https://img.shields.io/badge/OpenZeppelin-5.x-4E5EE4?logo=openzeppelin)
![Moonbeam](https://img.shields.io/badge/Network-Moonbeam-e6007a)
![Tests](https://img.shields.io/badge/Tests-12%20passing-brightgreen)
![License](https://img.shields.io/badge/License-MIT-green)

*Built for the [Polkadot Solidity Hackathon 2026](https://polkadothackathon.com/)*

</div>

---

## Architecture

```mermaid
graph TD
    subgraph Frontend["Frontend (Static HTML/CSS/JS)"]
        UI[5-Page Dashboard]
        UI --> |ethers.js| POOL
    end

    subgraph Core["Core Protocol"]
        POOL[LendingPool.sol]
        FLASH[FlashLoan.sol]
        POOL -->|inherits| FLASH
    end

    subgraph Models["Pricing & Rates"]
        ORACLE[PriceOracle.sol]
        IRM[InterestRateModel.sol]
    end

    subgraph Token["Governance"]
        PLEND[PolkaToken.sol — PLEND ERC-20]
    end

    POOL -->|reads prices| ORACLE
    POOL -->|reads rates| IRM
    FLASH -->|callback| IFLR[IFlashLoanReceiver]
    POOL -->|lists as market| PLEND

    subgraph Network["Polkadot / Moonbeam"]
        EVM[EVM Runtime]
        XCM[XCM Bridge]
    end

    POOL -->|deployed on| EVM
    EVM -->|cross-chain| XCM

    style Frontend fill:#1a1a2e,stroke:#e6007a,color:#fff
    style Core fill:#16213e,stroke:#e6007a,color:#fff
    style Models fill:#0f3460,stroke:#e6007a,color:#fff
    style Token fill:#1a1a2e,stroke:#552bbf,color:#fff
    style Network fill:#0d1117,stroke:#e6007a,color:#fff
```

### User Flows

```mermaid
sequenceDiagram
    participant User
    participant LendingPool
    participant PriceOracle
    participant ERC20 Token
    participant InterestRateModel

    Note over User,InterestRateModel: Deposit Flow
    User->>ERC20 Token: approve(pool, amount)
    User->>LendingPool: deposit(token, amount)
    LendingPool->>ERC20 Token: safeTransferFrom(user, pool, amount)
    LendingPool-->>User: emit Deposit event

    Note over User,InterestRateModel: Borrow Flow
    User->>LendingPool: borrow(token, amount)
    LendingPool->>PriceOracle: getPrice(collateral + borrow tokens)
    LendingPool-->>LendingPool: healthCheck: collateral * CF >= debt
    LendingPool->>ERC20 Token: safeTransfer(user, amount)

    Note over User,InterestRateModel: Liquidation Flow
    User->>LendingPool: liquidate(borrower, debtToken, collateralToken, amount)
    LendingPool-->>LendingPool: verify health factor < 1.0
    LendingPool->>ERC20 Token: seize collateral + 5% bonus
```

---

## Features

- **Flash Loans** — Uncollateralized single-transaction loans with 0.09% fee. Borrow any amount, use for arbitrage or liquidations, repay atomically.
- **Over-Collateralized Lending** — Deposit ERC-20 tokens as collateral and borrow against them (up to 75% CF). Health factor checks on every operation.
- **Liquidation Engine** — When health factor drops below 1.0, liquidators can seize up to 50% of debt with a 5% collateral bonus.
- **Kinked Interest Rate Model** — Compound-style dynamic rates. Gentle slope below 80% utilization, steep slope above.
- **5-Page Interactive Dashboard** — Dashboard, Lending, Borrowing, Flash Loans, and Analytics with interactive rate curve sliders.
- **PLEND Governance Token** — ERC-20 with 100M hard cap. Designed for fee discounts, governance, and liquidity mining.
- **Moonbeam Native** — Full EVM compatibility on Polkadot with shared security and cross-chain interoperability via XCM.

---

## Screenshots

| Lending | Flash Loans | Analytics |
|:-------:|:-----------:|:---------:|
| ![Lending](./screenshots/lending.png) | ![Flash Loans](./screenshots/flash-loans.png) | ![Analytics](./screenshots/analytics.png) |

---

## Interest Rate Model

```
Below kink (U <= 80%):  borrowRate = baseRate + U * slope1
Above kink (U > 80%):   borrowRate = baseRate + kink * slope1 + (U - kink) * slope2
Supply rate:             supplyRate = borrowRate * U * (1 - reserveFactor)
```

| Parameter | Value |
|-----------|-------|
| Base Rate | ~2% APR |
| Slope 1 | ~10% APR |
| Slope 2 | ~100% APR |
| Kink (Optimal Utilization) | 80% |
| Reserve Factor | 10% |
| Collateral Factor | 75% |
| Liquidation Bonus | 5% |
| Flash Loan Fee | 0.09% |

---

## Quick Start

```bash
git clone https://github.com/Akasxh/polkalend.git
cd polkalend

npm install
npx hardhat compile
npx hardhat test            # 12 tests covering all protocol operations

# Open the frontend
open frontend/index.html
```

### Using Make

```bash
make install       # npm install
make compile       # npx hardhat compile
make test          # npx hardhat test
make dev           # Start Hardhat node + serve frontend on :3000
make clean         # Remove artifacts and cache
```

### Deployment

```bash
# Local
npx hardhat node &
npx hardhat run scripts/deploy.js --network localhost

# Moonbase Alpha (testnet)
export PRIVATE_KEY=0xYourPrivateKeyHere
npx hardhat run scripts/deploy.js --network moonbase

# Moonbeam (mainnet)
npx hardhat run scripts/deploy.js --network moonbeam
```

### Docker

```bash
docker compose build
docker compose up -d        # Hardhat node on :8545, frontend on :3000
```

---

## Project Structure

```
polkalend/
├── contracts/
│   ├── LendingPool.sol              # Core: deposit, withdraw, borrow, repay, liquidate, flash loans
│   ├── FlashLoan.sol                # Abstract mixin: flash loan execution with 0.09% fee
│   ├── InterestRateModel.sol        # Kinked rate model: base + slope1/slope2 around 80% kink
│   ├── PriceOracle.sol              # Owner-managed USD price feeds
│   ├── PolkaToken.sol               # PLEND ERC-20 governance token, 100M max supply
│   ├── interfaces/
│   │   ├── ILendingPool.sol
│   │   └── IFlashLoanReceiver.sol
│   └── mocks/
│       └── MockFlashLoanReceiver.sol
├── scripts/
│   └── deploy.js                    # Token -> IRM -> Oracle -> Pool -> list market
├── test/
│   ├── LendingPool.test.js          # 12 tests
│   └── EdgeCases.test.js
├── frontend/
│   ├── index.html                   # 5-page SPA with hash-based routing
│   ├── styles.css                   # Dark theme, Polkadot pink accents
│   └── app.js                       # Router, charts, forms, demo data
├── hardhat.config.js
├── Dockerfile                       # Multi-stage Alpine build
├── docker-compose.yml
├── Makefile
├── .env.example
└── package.json
```

---

## Tech Stack

| Technology | Purpose |
|------------|---------|
| Solidity 0.8.20 | Smart contracts with built-in overflow protection |
| Hardhat 2.22+ | Compilation, testing, deployment, local blockchain |
| OpenZeppelin 5.x | ERC20, SafeERC20, Ownable, ReentrancyGuard |
| ethers.js 6.x | Contract interaction |
| Vanilla HTML/CSS/JS | Zero-dependency 5-page frontend with Canvas API charts |
| Docker | Multi-stage Alpine containerization |
| Moonbeam (Chain 1284) | Polkadot EVM-compatible parachain |

---

## Testing

```bash
npx hardhat test
```

12 tests covering: deposits, withdrawals, borrowing, over-leverage rejection, repayment, collateral calculations, undercollateralized withdrawal prevention, flash loan execution, interest rate model, liquidation, unlisted token rejection, and event emission.

---

## Security

| Protection | Implementation |
|------------|---------------|
| Reentrancy Guard | `nonReentrant` on all 6 public LendingPool functions |
| Safe Transfers | `SafeERC20` wrapping all token operations |
| Health Factor Checks | Validated after every `borrow()` and `withdraw()` |
| Liquidation Caps | Max 50% of outstanding debt per call |
| Flash Loan Invariant | `balanceAfter >= balanceBefore + fee` enforced atomically |
| Overflow Protection | Solidity 0.8.20 built-in checks, no `unchecked` blocks |
| Supply Cap | `MAX_SUPPLY = 100M` on every `mint()` |

---

## Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/my-feature`
3. Write tests for new functionality
4. Ensure all tests pass: `npx hardhat test`
5. Commit with conventional commits: `feat(pool): add market removal`
6. Open a pull request against `main`

---

## License

[MIT](./LICENSE)

---

<div align="center">
  <strong>PolkaLend</strong> — Decentralized Micro-Lending on Polkadot
  <br/>
  <a href="https://moonbeam.network/">Moonbeam</a> · <a href="https://polkadot.network/">Polkadot</a> · <a href="https://openzeppelin.com/contracts/">OpenZeppelin</a>
</div>

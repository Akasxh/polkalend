.PHONY: install compile test deploy-local deploy-testnet deploy-mainnet \
       lint clean docker-build docker-run docker-stop dev help

# ──────────────────────────────────────────────
# Setup
# ──────────────────────────────────────────────

install: ## Install all dependencies
	npm install

compile: ## Compile Solidity contracts
	npx hardhat compile

clean: ## Remove build artifacts and cache
	npx hardhat clean
	rm -rf coverage coverage.json gas-report.txt

# ──────────────────────────────────────────────
# Test & Lint
# ──────────────────────────────────────────────

test: ## Run test suite
	npx hardhat test

lint: ## Check Solidity files with solhint (install if missing)
	@npx solhint 'contracts/**/*.sol' 2>/dev/null || echo "solhint not installed — run: npm i -D solhint"

# ──────────────────────────────────────────────
# Deploy
# ──────────────────────────────────────────────

deploy-local: ## Deploy contracts to local Hardhat node
	npx hardhat run scripts/deploy.js --network localhost

deploy-testnet: ## Deploy contracts to Moonbase Alpha testnet
	npx hardhat run scripts/deploy.js --network moonbase

deploy-mainnet: ## Deploy contracts to Moonbeam mainnet
	npx hardhat run scripts/deploy.js --network moonbeam

# ──────────────────────────────────────────────
# Docker
# ──────────────────────────────────────────────

docker-build: ## Build Docker image
	docker compose build

docker-run: ## Start containers in background
	docker compose up -d

docker-stop: ## Stop and remove containers
	docker compose down

# ──────────────────────────────────────────────
# Dev
# ──────────────────────────────────────────────

dev: ## Start Hardhat node and serve frontend on :3000
	@echo "Starting Hardhat node on :8545 and frontend on :3000..."
	@npx hardhat node &
	@cd frontend && python3 -m http.server 3000 2>/dev/null || npx serve -l 3000 .

# ──────────────────────────────────────────────
# Help
# ──────────────────────────────────────────────

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*##' $(MAKEFILE_LIST) | \
		awk 'BEGIN {FS = ":.*## "}; {printf "  \033[36m%-18s\033[0m %s\n", $$1, $$2}'

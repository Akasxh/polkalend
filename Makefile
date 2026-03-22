.PHONY: install compile test deploy-testnet clean

install:
	npm install

compile:
	npx hardhat compile

test:
	npx hardhat test

deploy-testnet:
	npx hardhat run scripts/deploy.js --network moonbase

clean:
	npx hardhat clean

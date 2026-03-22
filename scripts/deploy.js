const hre = require("hardhat");

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  console.log("Deploying with:", deployer.address);

  const PolkaToken = await hre.ethers.getContractFactory("PolkaToken");
  const token = await PolkaToken.deploy();
  await token.waitForDeployment();
  console.log("PolkaToken:", await token.getAddress());

  const SECONDS_PER_YEAR = 365n * 24n * 60n * 60n;
  const toPerSecond = (aprBps) =>
    (BigInt(aprBps) * 10n ** 18n) / (10000n * SECONDS_PER_YEAR);

  const InterestRateModel = await hre.ethers.getContractFactory("InterestRateModel");
  const irm = await InterestRateModel.deploy(
    toPerSecond(200n),
    toPerSecond(1000n),
    toPerSecond(10000n),
    hre.ethers.parseEther("0.8")
  );
  await irm.waitForDeployment();
  console.log("InterestRateModel:", await irm.getAddress());

  const PriceOracle = await hre.ethers.getContractFactory("PriceOracle");
  const oracle = await PriceOracle.deploy();
  await oracle.waitForDeployment();
  console.log("PriceOracle:", await oracle.getAddress());

  const LendingPool = await hre.ethers.getContractFactory("LendingPool");
  const pool = await LendingPool.deploy(
    await irm.getAddress(),
    await oracle.getAddress()
  );
  await pool.waitForDeployment();
  console.log("LendingPool:", await pool.getAddress());

  await oracle.setPrice(await token.getAddress(), hre.ethers.parseEther("1"));
  await pool.addMarket(
    await token.getAddress(),
    hre.ethers.parseEther("0.75"),
    hre.ethers.parseEther("0.1")
  );
  console.log("Market listed for PLEND token");
  console.log("\n--- Deployment complete ---");
}

main().catch((err) => {
  console.error(err);
  process.exitCode = 1;
});

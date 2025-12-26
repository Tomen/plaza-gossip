import hre from "hardhat";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Existing UserRegistry address - do not redeploy
const USER_REGISTRY = "0x9554c7436DF9fb06852F398761E2d7152f75bc74";

async function main() {
  const [deployer] = await hre.ethers.getSigners();
  const balance = await hre.ethers.provider.getBalance(deployer.address);

  console.log("Deploying ChannelRegistry only");
  console.log("Account:", deployer.address);
  console.log("Balance:", hre.ethers.formatEther(balance), "PAS");
  console.log("Using UserRegistry:", USER_REGISTRY);

  if (balance === 0n) {
    console.error("\n❌ ERROR: Your wallet has no funds!");
    process.exit(1);
  }

  // Deploy ChannelRegistry
  console.log("\nDeploying ChannelRegistry...");
  const ChannelRegistry = await hre.ethers.getContractFactory("ChannelRegistry");
  const channelRegistry = await ChannelRegistry.deploy(USER_REGISTRY);
  await channelRegistry.waitForDeployment();
  const channelRegistryAddress = await channelRegistry.getAddress();
  console.log(`✅ ChannelRegistry deployed to: ${channelRegistryAddress}`);

  // Update deployments.json
  console.log("\n" + "=".repeat(60));
  console.log("UPDATING DEPLOYMENTS");
  console.log("=".repeat(60));

  const deploymentsPath = path.join(__dirname, "../../deployments.json");
  let deployments = {};

  if (fs.existsSync(deploymentsPath)) {
    const content = fs.readFileSync(deploymentsPath, "utf8");
    deployments = JSON.parse(content);
  }

  // Determine network name
  const network = hre.network;
  const networkName =
    network.name === "polkadotAssetHub"
      ? "polkadot-asset-hub-testnet"
      : network.name;

  // Update only the channelRegistry address
  if (deployments[networkName]) {
    const oldAddress = deployments[networkName].channelRegistry;
    deployments[networkName].channelRegistry = channelRegistryAddress;
    // Remove channels since we're not auto-creating any
    delete deployments[networkName].channels;
    deployments[networkName].deployedAt = new Date().toISOString();
    console.log(`\nUpdated ${networkName}:`);
    console.log(`  Old ChannelRegistry: ${oldAddress}`);
    console.log(`  New ChannelRegistry: ${channelRegistryAddress}`);
  } else {
    console.error(`\n❌ Network ${networkName} not found in deployments.json`);
    process.exit(1);
  }

  fs.writeFileSync(deploymentsPath, JSON.stringify(deployments, null, 2));
  console.log(`\n✅ Deployment info saved to: deployments.json`);

  console.log("\n" + "=".repeat(60));
  console.log("NEXT STEPS");
  console.log("=".repeat(60));
  console.log("\n1. Update migrate-channels.js with:");
  console.log(`   OLD_REGISTRY = "0x8975edD114210449a69A102994F890BA2B28031A"`);
  console.log(`   NEW_REGISTRY = "${channelRegistryAddress}"`);
  console.log("\n2. Run migration:");
  console.log("   npx hardhat run scripts/migrate-channels.js --network polkadotAssetHub");
  console.log("\n3. Copy deployments.json to frontend/public/");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });

import hre from "hardhat";

async function main() {
  // Use the runtime environment (hre). The hardhat-ethers plugin registers hre.ethers.
  const Factory = await hre.ethers.getContractFactory("CertificateVerifier");

  const contract = await Factory.deploy();

  await contract.waitForDeployment();

  console.log("Deployed to:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

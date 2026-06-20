import { ethers } from "hardhat";

async function main() {
  // Use the named `ethers` export which is registered by hardhat-ethers
  const Factory = await ethers.getContractFactory("CertificateVerifier");

  const contract = await Factory.deploy();

  await contract.waitForDeployment();

  console.log("Deployed to:", await contract.getAddress());
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

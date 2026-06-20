import "@nomicfoundation/hardhat-ethers";
import hre from "hardhat";
import { writeFileSync } from "fs";

async function main() {
  const connection = await hre.network.connect();
  const Factory = await connection.ethers.getContractFactory("CertificateVerifier");

  const contract = await Factory.deploy();
  await contract.waitForDeployment();

  const address = await contract.getAddress();
  console.log("Deployed to:", address);

  writeFileSync(
    "deployed.json",
    JSON.stringify({ address }, null, 2)
  );
  console.log("Address saved to deployed.json");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

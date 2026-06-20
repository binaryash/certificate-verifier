import { ethers } from "ethers";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

const ABI = [
  "function registerCertificate(bytes32 hash) public",
  "function revokeCertificate(bytes32 hash) public",
  "function getCertificate(bytes32 hash) public view returns (bool exists, address issuer, uint256 issuedAt, bool revoked)",
  "function verifyCertificate(bytes32 hash) public view returns (bool)",
];

function loadDeployed() {
  try {
    const data = readFileSync(join(__dirname, "../deployed.json"), "utf8");
    return JSON.parse(data);
  } catch {
    return null;
  }
}

export function getContract(signerOrProvider) {
  const deployed = loadDeployed();
  if (!deployed) throw new Error("deployed.json not found — run deploy script first");
  return new ethers.Contract(deployed.address, ABI, signerOrProvider);
}

export function getProvider() {
  return new ethers.JsonRpcProvider("http://127.0.0.1:8545");
}

export function getSigner() {
  const provider = getProvider();
  // Default Hardhat account #0
  return new ethers.Wallet(
    "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80",
    provider
  );
}

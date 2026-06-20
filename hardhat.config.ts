import { defineConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-ethers";

export default defineConfig({
  // Register plugins explicitly for Hardhat v3 compatibility
  plugins: ["@nomicfoundation/hardhat-ethers"],

  solidity: {
    version: "0.8.28",
  },
});

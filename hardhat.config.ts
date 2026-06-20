import { defineConfig } from "hardhat/config";
// Import the plugin module and register the module object in the plugins array
import * as hardhatEthers from "@nomicfoundation/hardhat-ethers";

export default defineConfig({
  // Register plugins explicitly for Hardhat v3 compatibility
  plugins: [hardhatEthers],

  solidity: {
    version: "0.8.28",
  },
});

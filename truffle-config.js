const path = require('path');
const HDWalletProvider = require('truffle-hdwallet-provider');
require('dotenv').config();

module.exports = {
  networks: {
    development: {
      host: '127.0.0.1', // Localhost (default: none)
      port: 8545, // Standard Ethereum port (default: none)
      network_id: '*' // Any network (default: none)
    },
    ropsten: {
      provider: function() {
        return new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          `https://ropsten.infura.io/v3/${process.env.INFURA_ENDPOINT_KEY}`
        );
      },
      network_id: 3,
      gas: 4000000 //make sure this gas allocation isn't over 4M, which is the max
    },
    kovan: {
      provider: () =>
        new HDWalletProvider(
          process.env.TESTNET_MNEMONIC,
          `https://kovan.infura.io/v3/${process.env.INFURA_ENDPOINT_KEY}`,
          // `https://kovan.io/v3/${process.env.INFURA_ENDPOINT_KEY}`,
          0, //address_index
          10, // num_addresses
          true // shareNonce
        ),
      network_id: 42, // Kovan's id
      timeoutBlocks: 50, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: false // Skip dry run before migrations? (default: false for public nets )
    },
    mainnet: {
      provider: () =>
        new HDWalletProvider(
          process.env.MAINNET_MNEMONIC,
          `https://infura.io/v3/${process.env.INFURA_ENDPOINT_KEY}`,
          0, //address_index
          10, // num_addresses
          true // shareNonce
        ),
      network_id: 1, // mainnet's id
      // gasPrice: +process.env.MAINNET_GAS_PRICE || 1000 * 1000 * 1000, // default 1 gwei
      timeoutBlocks: 50, // # of blocks before a deployment times out  (minimum/default: 50)
      skipDryRun: false // Skip dry run before migrations? (default: false for public nets )
    }
  },
  compilers: {
    solc: {
      // version: "0.5.1",    // Fetch exact version from solc-bin (default: truffle's version)
    }
  }
};

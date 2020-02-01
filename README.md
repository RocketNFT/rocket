# Rocket-NFT

An experiment in NFT's and Ethereum :rocket:

---

# Usage

## Frontend App

### Run

Start Ganache-cli and deploy the contracts.

```bash
npm install
npm run network
# in new terminal
npm run migrate
```

Next open a new terminal in `/client`. Be sure to update the correct contract address in the client app.

```bash
# in /client
npm install
npm start
```

## Smart Contract

These utilities rely on the `truffle exec` command. You first need to add your wallet's menmonic and your Infura API key to a new `.env` file.

```js
MAINNET_MNEMONIC = '...';
TESTNET_MNEMONIC = '...';
INFURA_ENDPOINT_KEY = 'ebe4..';
```

### Deployment

Deploy to the desired network (defaults to development/ganache).

```bash
truffle exec scripts/deploy-rocket.js --network mainnet
```

### Inspection

Inspect a Rocket contract and get it's logic contract address.

```bash
 truffle exec scripts/get-logic-address.js --network kovan 0xC6EbF21FA70642235a22F3b627119A168884fACC
 # > PROXIABLE contract 0xC6EbF21FA70642235a22F3b627119A168884fACC has its logic address at 0x14c67b4596ca97f735ff2010b45e58ff5486f3a5
```

### Upgrade

This contract uses a **delegate-call proxy** to allow updating the code. Specifically, the method used is **EIP 1822** Universal Upgradeable Proxy Standard (UUPS). This standard is similar to Open Zeppelin EIP 1967, however it is thinner and more flexible. Read more [here](https://github.com/ethereum/EIPs/blob/master/EIPS/eip-1822.md) if you're curious.

> :dragon: Upgrading can have dangerous consequences, so ask an experienced friend for help.

First deploy a new logic contract.

```bash
truffle exec scripts/deploy-rocket-logic.js --network mainnet
# > ...
# > Rocket logic deployed at:  0xEd6A651058FEEDF569d19611fd3B6504F411AA81

```

Next, call `updateCode()` on the proxy contract and pass the new logic contract address you received from the previous step.

It is recommended you use [OneClickDapp](https://oneclickdapp.com) or [Remix](https://Remix.ethereum.org) to perform this action, as you can use your hardware wallet (which is the admin account) via MetaMask.

# Contributing

## Guidelines

1. One approval is required before merging.
2. Devs must merge their own PRs.

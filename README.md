# ERC721-Bank

# truffle

## install

terminal 1

- `npm install`
- `npm run network` or use Ganache GUI

terminal 2

- `npm run migrate`

# Web client

## install

- `cd client && npm install`

## start

terminal 3

- `npm start`

# Deployment

To deploy the proxy, simply start Ganache and run the script.

1. Add your wallet's menmonic to `.env`. If you are deploying to mainnet, then also add your Infura API key.

```js
MAINNET_MNEMONIC = 'convince...';
INFURA_ENDPOINT_KEY = 'ebe...';
```

2. Run the deployment script with the desired network (defaults to development)

```bash
truffle exec scripts/deploy-rocket.js --network mainnet
```

To inspect a Rocket contract and get it's logic contract address, run the script:

```bash
 truffle exec scripts/get-logic-address.js --network kovan 0xC6EbF21FA70642235a22F3b627119A168884fACC
 # > PROXIABLE contract 0xC6EbF21FA70642235a22F3b627119A168884fACC has its logic address at 0x14c67b4596ca97f735ff2010b45e58ff5486f3a5
```

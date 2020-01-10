import React, { Component } from "react";
import BankContract from "./contracts/bank.json";
import NFTContract from "./contracts/NFToken.json";
import getWeb3 from "./getWeb3";

import "./App.css";

class App extends Component {
  state = { tokenId: 0, web3: null, accounts: null, contract: null };

  componentDidMount = async () => {
    try {
      // Get network provider and web3 instance.
      const web3 = await getWeb3();

      // Use web3 to get the user's accounts.
      const accounts = await web3.eth.getAccounts();

      // Get the contract instance.
      const networkId = await web3.eth.net.getId();
      const deployedNetwork = BankContract.networks[networkId];
      const NFTdeployedNetwork = NFTContract.networks[networkId];
    
      const BankInstance = new web3.eth.Contract(
        BankContract.abi,
        deployedNetwork && deployedNetwork.address,
      );
      const NFTInstance = new web3.eth.Contract(
        NFTContract.abi,
        NFTdeployedNetwork && NFTdeployedNetwork.address,
      );

      // Set web3, accounts, and contract to the state, and then proceed with an
      // example of interacting with the contract's methods.
      const newState = { web3, accounts, BankInstance, NFTInstance }
      console.log(newState)
      this.setState(newState, this.runExample);
    } catch (error) {
      // Catch any errors for any of the above operations.
      alert(
        `Failed to load web3, accounts, or contract. Check console for details.`,
      );
      console.error(error);
    }
  };

  runExample = async () => {
    const { accounts, BankInstance, NFTInstance } = this.state;
    const owner = accounts[0]
    
    // const mintResponse = await NFTInstance.methods.mintToken(owner, 0).send({ from: owner})
    // debugger
    
    // const safeTransferTokenResponse = await NFTInstance.methods.safeTransferFrom(owner, BankInstance._address, 0).send({ from: owner})

    // const checkNewOwnerResponse = await NFTInstance.methods.ownerOf(0).send({ from: owner})

    // this.setState({ : checkOwnerResponse });
  };
  
  handleTokenIdInput = (event) => {
    this.setState({ tokenId: Number(event.target.value)})
  }

  mintTokenTransfer = async () => {
    const { NFTInstance, BankInstance, accounts, tokenId } = this.state
    const owner = accounts[0]
    try {
      const mintResponse = await NFTInstance.methods.mintToken(owner, tokenId).send({ from: owner, gas: 5000000 })
      console.log({mintResponse})
      const safeTransferResponse = await NFTInstance.methods.safeTransferFrom(owner, BankInstance._address, tokenId).send({ from: owner, gas: 5000000 })
      console.log({safeTransferResponse})
    } catch (error) {
      console.log(error)
    }
  }

  checkBank = async () => {
    const { NFTInstance, BankInstance, accounts, tokenId } = this.state
    const owner = accounts[0]
    try {
      const beforeSafeTransfer = await BankInstance.methods._tokenOwner(NFTInstance._address, tokenId).call({ from: owner, gas: 5000000 })
      console.log({beforeSafeTransfer})
      const bankResponse = await BankInstance.methods.safeTransferFrom(NFTInstance._address, owner, owner, tokenId, '0x0a').send({ from: owner, gas: 5000000 })
      console.log({bankResponse})
      const afterSafeTransfer = await BankInstance.methods._tokenOwner(NFTInstance._address, tokenId).call({ from: owner, gas: 5000000 })
      console.log({afterSafeTransfer})
      // const response = await BankInstance.methods._tokenOwner(NFTInstance._address, Number(tokenId)).call({ from: owner, gas: 5000000 })
      // console.log(response)
    } catch (error) {
      console.log(error)
    }
  }

  render() {
    if (!this.state.web3) {
      return <div>Loading Web3, accounts, and contract...</div>;
    }
    return (
      <div className="App">
        <h1>Good to Go!</h1>
        <p>Your Truffle Box is installed and ready.</p>
        <h2>Smart Contract Example</h2>
        <p>
          If your contracts compiled and migrated successfully, below will show.
        </p>
        <p>
          Try changing the value and click mint. (for now check console log on DevTools)
        </p>
        <label>Token id</label>
        <input onChange={this.handleTokenIdInput} value={this.state.tokenId}/>
        <button onClick={this.mintTokenTransfer}>Mint Token</button>
        <button onClick={this.checkBank}>checkBank</button>
      </div>
    );
  }
}

export default App;
